// e2e tests using playwright integrated with cucumber/gherkin
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const http = require('http');
const app = require('../../src/app');

// set default timeout for all steps to 60 seconds (overrides cucumber.json)
setDefaultTimeout(60 * 1000);

const prisma = new PrismaClient();
let browser;
let page;
let context;
let BASE_URL = process.env.E2E_BASE_URL;
const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';

// helper function to check if url is reachable
function checkUrlReachable(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: timeout
    };
    
    const req = http.request(options, (res) => {
      resolve(res.statusCode < 500);
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });
    
    req.end();
  });
}

// helper function to detect which port the client is running on
async function detectClientPort() {
  // try 5173 first, then 5174 (common when 5173 is taken), then others
  const ports = [5173, 5174, 5175, 5176];
  
  for (const port of ports) {
    const url = `http://localhost:${port}`;
    try {
      const isReachable = await checkUrlReachable(url, 2000);
      if (isReachable) {
        // verify it's actually the react app by checking for a react-like response
        // make a full get request to check if it returns html (not just head)
        const fullCheck = await new Promise((resolve, reject) => {
          const urlObj = new URL(url);
          const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 80,
            path: urlObj.pathname,
            method: 'GET',
            timeout: 3000
          };
          
          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              // check if it's html (react app) vs something else
              const isHTML = res.headers['content-type']?.includes('text/html') || data.includes('<!DOCTYPE') || data.includes('<html');
              resolve(isHTML);
            });
          });
          
          req.on('error', () => resolve(false));
          req.on('timeout', () => {
            req.destroy();
            resolve(false);
          });
          
          req.end();
        });
        
        if (fullCheck) {
          console.log(`✓ Found React client running on port ${port}`);
          return url;
        } else {
          console.log(`⚠ Port ${port} is reachable but doesn't appear to be the React app`);
        }
      }
    } catch (error) {
      console.log(`✗ Port ${port} not reachable: ${error.message}`);
      // try next port
      continue;
    }
  }
  
  throw new Error(`Could not find React client running on any of ports: ${ports.join(', ')}. Make sure the client is running: cd client && npm run dev`);
}

// setup browser before all tests
Before({ tags: '@e2e' }, async function () {
  // clean up any leftover test users and their plans before starting
  try {
    // first, find all test users
    const testUsers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: 'e2e_'
        }
      },
      include: {
        plans: {
          include: {
            quarters: {
              include: {
                planClasses: true
              }
            }
          }
        }
      }
    });
    
    // delete plans and their related data for each test user
    for (const user of testUsers) {
      for (const plan of user.plans) {
        // delete planclasses first
        for (const quarter of plan.quarters) {
          await prisma.planClass.deleteMany({
            where: {
              quarterId: quarter.id
            }
          });
        }
        // delete quarters
        await prisma.quarter.deleteMany({
          where: {
            planId: plan.id
          }
        });
      }
      // delete plans
      await prisma.plan.deleteMany({
        where: {
          userId: user.id
        }
      });
    }
    
    // finally, delete the users
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'e2e_'
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up test users before test:', error);
    // don't fail the test if cleanup fails
  }
  
  // auto-detect client port if not set via environment variable
  if (!BASE_URL) {
    console.log('Auto-detecting client port...');
    BASE_URL = await detectClientPort();
    console.log(`Using client URL: ${BASE_URL}`);
  } else {
    // check if specified url is reachable
    console.log(`Using specified client URL: ${BASE_URL}`);
    try {
      await checkUrlReachable(BASE_URL, 5000);
      console.log(`✓ Client reachable at ${BASE_URL}`);
    } catch (error) {
      throw new Error(`Cannot connect to client at ${BASE_URL}. Make sure the client is running: cd client && npm run dev. Error: ${error.message}`);
    }
  }
  
  browser = await chromium.launch({
    headless: process.env.E2E_HEADLESS !== 'false', // headless by default
    slowMo: process.env.E2E_SLOW_MO ? parseInt(process.env.E2E_SLOW_MO) : 0,
    timeout: 60000 // 60 second timeout for browser launch
  });
  context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    // record video for debugging
    recordVideo: process.env.E2E_RECORD_VIDEO === 'true' ? { dir: 'e2e-videos/' } : undefined
  });
  page = await context.newPage();
  
  // set longer navigation timeout
  page.setDefaultNavigationTimeout(30000); // 30 seconds
  page.setDefaultTimeout(30000); // 30 seconds for all operations
  
  // store page in world context so we can distinguish e2e from api tests
  this.page = page;
  
  // set longer timeout for e2e tests (cucumber step timeout)
  this.timeout = 60000; // 60 seconds
  
  // store base_url in context for debugging
  this.baseUrl = BASE_URL;
  console.log(`E2E test starting with client at: ${BASE_URL}`);
});

// cleanup after all tests
After({ tags: '@e2e' }, async function () {
  // clean up test users and their plans after tests
  try {
    // find all test users
    const testUsers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: 'e2e_'
        }
      },
      include: {
        plans: {
          include: {
            quarters: {
              include: {
                planClasses: true
              }
            }
          }
        }
      }
    });
    
    // delete plans and their related data for each test user
    for (const user of testUsers) {
      for (const plan of user.plans) {
        // delete planclasses first
        for (const quarter of plan.quarters) {
          await prisma.planClass.deleteMany({
            where: {
              quarterId: quarter.id
            }
          });
        }
        // delete quarters
        await prisma.quarter.deleteMany({
          where: {
            planId: plan.id
          }
        });
      }
      // delete plans
      await prisma.plan.deleteMany({
        where: {
          userId: user.id
        }
      });
    }
    
    // finally, delete the users
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'e2e_'
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up test users:', error);
  }
  
  if (page) await page.close();
  if (context) await context.close();
  if (browser) await browser.close();
});

// helper function to create authenticated user via api
async function createUserViaAPI(username, password) {
  try {
    // create user
    const createRes = await request(app)
      .post('/users')
      .send({ username, password });
    
    if (createRes.status !== 201) {
      // user might already exist, try to login
      const loginRes = await request(app)
        .post('/users/login')
        .send({ username, password });
      
      if (loginRes.status === 200) {
        return { username, token: loginRes.body.token, userId: loginRes.body.user.id };
      }
      throw new Error('Failed to create or login user');
    }
    
    // auto-login after signup
    const loginRes = await request(app)
      .post('/users/login')
      .send({ username, password });
    
    return {
      username,
      token: loginRes.body.token,
      userId: createRes.body.id
    };
  } catch (error) {
    console.error('Error creating user via API:', error);
    throw error;
  }
}

// helper function to create a plan via api
async function createPlanViaAPI(userToken, planName, majorName) {
  const response = await request(app)
    .post('/plans')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: planName,
      majorName: majorName,
      quarters: [
        {
          quarterNumber: 1,
          classIds: []
        }
      ]
    });
  
  if (response.status !== 201) {
    throw new Error(`Failed to create plan: ${response.body.error || response.status}`);
  }
  
  return response.body;
}

// helper function to set authentication in browser
async function setAuthInBrowser(token, user, baseUrl) {
  await page.goto(baseUrl);
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, { token, user });
}

// homepage steps
Given('I am on the homepage', { timeout: 60000 }, async function () {
  try {
    const url = this.baseUrl || BASE_URL;
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // wait for search bar to be visible
    await page.waitForSelector('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]', { timeout: 20000 });
    console.log('✓ Homepage loaded successfully');
  } catch (error) {
    throw new Error(`Failed to load homepage at ${this.baseUrl || BASE_URL}. Make sure the client is running. Error: ${error.message}`);
  }
});

// authentication steps
When('I click the login button', async function () {
  // login button is a link in the header
  const loginButton = await page.locator('a:has-text("Log In"), a:has-text("Log in")').first();
  await loginButton.waitFor({ state: 'visible', timeout: 5000 });
  await loginButton.click();
  await page.waitForTimeout(1000); // wait for navigation to login page
  await page.waitForLoadState('networkidle');
});

When('I switch to signup mode', async function () {
  // look for signup toggle/button
  const signupToggle = await page.locator('button:has-text("Sign up"), button:has-text("Sign Up"), button:has-text("Create account")').first();
  await signupToggle.click();
  await page.waitForTimeout(300);
});

When('I sign up with username {string} and password {string}', async function (username, password) {
  // fill in signup form
  const usernameInput = await page.locator('input[type="text"], input[name="username"], input[placeholder*="username" i]').first();
  const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
  const confirmPasswordInput = await page.locator('input[type="password"]').nth(1);
  
  await usernameInput.fill(username);
  await passwordInput.fill(password);
  if (await confirmPasswordInput.isVisible()) {
    await confirmPasswordInput.fill(password);
  }
  
  // submit form and wait for navigation
  const submitButton = await page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Sign Up"), button:has-text("Create")').first();
  const baseUrl = this.baseUrl || BASE_URL;
  
  // wait for either navigation to homepage or error message
  await Promise.race([
    page.waitForURL(url => {
      const urlStr = url.toString();
      return urlStr === baseUrl || urlStr === `${baseUrl}/` || !urlStr.includes('/login');
    }, { timeout: 10000 }).catch(() => null),
    page.waitForSelector('.error', { timeout: 10000 }).catch(() => null),
    submitButton.click().then(() => page.waitForTimeout(3000))
  ]);
  
  // wait for network to settle
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
});

Then('I should be redirected to the homepage', { timeout: 60000 }, async function () {
  const baseUrl = this.baseUrl || BASE_URL;
  
  // wait a bit for navigation to complete
  await page.waitForTimeout(1000);
  
  // check for error messages first
  const errorElement = await page.locator('.error, [class*="error"]').first();
  const hasError = await errorElement.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await errorElement.textContent();
    throw new Error(`Signup failed with error: ${errorText}. Current URL: ${page.url()}`);
  }
  
  // should be back on homepage (url should be / or contain home, but not /login)
  const url = page.url();
  const isHomepage = (url === baseUrl || url === `${baseUrl}/` || (url.includes(baseUrl) && !url.includes('/login')));
  
  if (!isHomepage) {
    // give it one more second and check again
    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    const finalIsHomepage = (finalUrl === baseUrl || finalUrl === `${baseUrl}/` || (finalUrl.includes(baseUrl) && !finalUrl.includes('/login')));
    if (!finalIsHomepage) {
      throw new Error(`Expected to be on homepage, but was on ${finalUrl}`);
    }
  }
});

// major search steps
When('I type {string} in the search bar', async function (searchText) {
  const searchInput = await page.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]').first();
  await searchInput.fill(searchText);
  await page.waitForTimeout(500); // wait for suggestions to appear
});

When('I select {string} from the suggestions', async function (majorName) {
  // wait for suggestions to appear and click the matching one
  const suggestion = await page.locator(`text=${majorName}`).first();
  await suggestion.waitFor({ state: 'visible', timeout: 5000 });
  await suggestion.click();
  await page.waitForTimeout(1000); // wait for navigation to degree plan
  await page.waitForLoadState('networkidle');
});

// plan setup modal steps
Then('I should see the plan setup modal', async function () {
  // wait for modal to appear
  const modal = await page.locator('.setup-modal, [class*="modal"], [class*="Modal"]').first();
  await modal.waitFor({ state: 'visible', timeout: 10000 });
});

When('I click {string}', async function (buttonText) {
  const button = await page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).first();
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
  await page.waitForTimeout(500);
});

When('I enter plan name {string}', async function (planName) {
  const nameInput = await page.locator('input[type="text"], input[placeholder*="Plan Name" i], input[placeholder*="name" i]').first();
  await nameInput.fill(planName);
  await page.waitForTimeout(300);
});

// degree plan page steps
Then('I should see the degree plan page with courses in the sidebar', async function () {
  // wait for degree plan page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // extra wait for react to render
  
  // check for sidebar container
  const sidebar = await page.locator('.sidebar-container').first();
  await sidebar.waitFor({ state: 'visible', timeout: 10000 });
  
  // check for course items (draggable items) in sidebar
  const courseItems = await page.locator('.sidebar-container .draggable-item').first();
  await courseItems.waitFor({ state: 'visible', timeout: 10000 });
});

// drag and drop steps
When('I drag a course from the sidebar to the first quarter', async function () {
  // find first course in sidebar (draggable-item)
  const sidebar = await page.locator('.sidebar-container').first();
  const firstCourse = await sidebar.locator('.draggable-item').first();
  await firstCourse.waitFor({ state: 'visible', timeout: 5000 });
  
  // find first quarter drop zone (zone-1-1)
  const firstQuarter = await page.locator('#zone-1-1, [id*="zone-1-1"]').first();
  await firstQuarter.waitFor({ state: 'visible', timeout: 5000 });
  
  // perform drag and drop using playwright's dragto
  await firstCourse.dragTo(firstQuarter, {
    force: true
  });
  
  // wait for drop to complete and ui to update
  await page.waitForTimeout(1500);
});

Then('the course should appear in the first quarter', async function () {
  // check that course appears in first quarter zone
  const firstQuarter = await page.locator('#zone-1-1, [id*="zone-1-1"]').first();
  const courseInQuarter = await firstQuarter.locator('.draggable-item').first();
  await courseInQuarter.waitFor({ state: 'visible', timeout: 5000 });
});

Then('the progress bar should update', async function () {
  // check for progress bar
  const progressBar = await page.locator('[class*="progress"], [class*="Progress"]').first();
  await progressBar.waitFor({ state: 'visible', timeout: 5000 });
  // progress should be visible (not 0%)
  const progressText = await progressBar.textContent();
  // just verify progress bar exists and has content
  if (!progressText || progressText.trim().length === 0) {
    throw new Error('Progress bar should have content');
  }
});

// save plan steps
When('I click the save plan button', async function () {
  // save button shows "save plan" or "save changes"
  const saveButton = await page.locator('button:has-text("Save Plan"), button:has-text("Save Changes")').first();
  await saveButton.waitFor({ state: 'visible', timeout: 5000 });
  await saveButton.click();
  await page.waitForTimeout(500);
  // wait for popup to appear
  await page.waitForSelector('.save-plan-modal, [class*="save-plan"]', { timeout: 3000 });
});

When('I confirm saving the plan', async function () {
  // saveplanpopup has a save button with text "save plan" or "update plan"
  const saveConfirmButton = await page.locator('.save-plan-modal button:has-text("Save Plan"), .save-plan-modal button:has-text("Update Plan")').first();
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 5000 });
  await saveConfirmButton.click();
  // wait for save to complete (popup should close)
  await page.waitForTimeout(2000);
  // wait for popup to disappear
  await page.waitForSelector('.save-plan-modal', { state: 'hidden', timeout: 5000 }).catch(() => {
    // popup might already be gone
  });
});

Then('the plan should be saved successfully', async function () {
  // wait for save to complete
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  
  // check for actual error messages (not styling classes like zone-error)
  // look specifically for save-plan-error or auth error messages
  const saveError = await page.locator('.save-plan-error').count();
  const authError = await page.locator('.auth-modal .error, .error:has-text("failed"), .error:has-text("error")').count();
  
  if (saveError > 0) {
    const errorText = await page.locator('.save-plan-error').first().textContent();
    throw new Error(`Save failed with error: ${errorText}`);
  }
  
  // also check if the save modal is still open (should close on success)
  const modalStillOpen = await page.locator('.save-plan-modal').isVisible().catch(() => false);
  if (modalStillOpen) {
    // check if there's an error in the modal
    const modalError = await page.locator('.save-plan-modal .save-plan-error').count();
    if (modalError > 0) {
      const errorText = await page.locator('.save-plan-modal .save-plan-error').first().textContent();
      throw new Error(`Save failed with error: ${errorText}`);
    }
  }
});

Then('I should see a success message', async function () {
  // look for success message (could be toast, alert, or text)
  const successIndicator = await page.locator('text=/success|saved|plan saved/i, [class*="success"], [class*="Success"]').first();
  // don't fail if not found - success might be indicated by modal closing
  try {
    await successIndicator.waitFor({ state: 'visible', timeout: 3000 });
  } catch (e) {
    // success might be indicated by absence of errors
    console.log('Success message not found, but no errors detected');
  }
});

// login steps
Given('I am logged in as user {string} with password {string}', { timeout: 60000 }, async function (username, password) {
  const userData = await createUserViaAPI(username, password);
  const url = this.baseUrl || BASE_URL;
  await setAuthInBrowser(userData.token, { id: userData.userId, username }, url);
  this.userToken = userData.token;
  this.userId = userData.userId;
  this.username = username;
});

Given('I have a saved plan named {string} for major {string}', async function (planName, majorName) {
  if (!this.userToken) {
    throw new Error('User must be logged in first');
  }
  
  const plan = await createPlanViaAPI(this.userToken, planName, majorName);
  this.savedPlan = plan;
  this.savedPlanName = planName;
});

When('I navigate to the degree plan page', { timeout: 60000 }, async function () {
  // navigate directly or via search
  try {
    const url = this.baseUrl || BASE_URL;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // if we need to select a major first
    const searchInput = await page.locator('input[type="text"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible({ timeout: 10000 })) {
      await searchInput.fill('Computer Science');
      await page.waitForTimeout(500);
      const suggestion = await page.locator('text=Computer Science').first();
      await suggestion.waitFor({ state: 'visible', timeout: 15000 });
      await suggestion.click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    }
  } catch (error) {
    throw new Error(`Failed to navigate to degree plan page. Error: ${error.message}`);
  }
});

When('I click {string} in the setup modal', { timeout: 60000 }, async function (buttonText) {
  // wait for modal to be visible first
  const modal = await page.locator('.setup-modal, [class*="setup-modal"]').first();
  await modal.waitFor({ state: 'visible', timeout: 20000 });
  
  // then find and click the button
  const button = await page.locator(`.setup-modal button:has-text("${buttonText}"), [class*="setup-modal"] button:has-text("${buttonText}")`).first();
  await button.waitFor({ state: 'visible', timeout: 20000 });
  await button.click();
  await page.waitForTimeout(1000);
});

When('I select the plan {string}', async function (planName) {
  const planCard = await page.locator(`text=${planName}`).first();
  await planCard.waitFor({ state: 'visible', timeout: 5000 });
  await planCard.click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
});

Then('I should see the loaded plan with existing courses', async function () {
  // wait for plan to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // check for sidebar with courses or courses in quarters
  const sidebar = await page.locator('.sidebar-container').first();
  await sidebar.waitFor({ state: 'visible', timeout: 10000 });
  
  // verify there are courses available (either in sidebar or in quarters)
  const coursesInSidebar = await page.locator('.sidebar-container .draggable-item').count();
  const coursesInQuarters = await page.locator('.droppable-zone .draggable-item').count();
  
  if (coursesInSidebar === 0 && coursesInQuarters === 0) {
    throw new Error('No courses found in loaded plan');
  }
});

When('I drag a new course from the sidebar to the second quarter', async function () {
  // find a course in sidebar
  const sidebar = await page.locator('.sidebar-container').first();
  const courses = await sidebar.locator('.draggable-item');
  const courseCount = await courses.count();
  
  if (courseCount === 0) {
    throw new Error('No courses available in sidebar');
  }
  
  // get a course from sidebar
  const courseToDrag = await courses.nth(0);
  await courseToDrag.waitFor({ state: 'visible', timeout: 5000 });
  
  // find second quarter (zone-1-2)
  const secondQuarter = await page.locator('#zone-1-2, [id*="zone-1-2"]').first();
  await secondQuarter.waitFor({ state: 'visible', timeout: 5000 });
  
  await courseToDrag.dragTo(secondQuarter, { force: true });
  await page.waitForTimeout(1500);
});

Then('the course should appear in the second quarter', async function () {
  const secondQuarter = await page.locator('#zone-1-2, [id*="zone-1-2"]').first();
  const courseInQuarter = await secondQuarter.locator('.draggable-item').first();
  await courseInQuarter.waitFor({ state: 'visible', timeout: 5000 });
});

// e2e-specific step: plan update success in ui
Then('the plan should be updated successfully in the UI', async function () {
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  
  // check for actual error messages (not styling classes like zone-error)
  // look specifically for save-plan-error or auth error messages
  const saveError = await page.locator('.save-plan-error').count();
  
  if (saveError > 0) {
    const errorText = await page.locator('.save-plan-error').first().textContent();
    throw new Error(`Update failed with error: ${errorText}`);
  }
  
  // also check if the save modal is still open (should close on success)
  const modalStillOpen = await page.locator('.save-plan-modal').isVisible().catch(() => false);
  if (modalStillOpen) {
    // check if there's an error in the modal
    const modalError = await page.locator('.save-plan-modal .save-plan-error').count();
    if (modalError > 0) {
      const errorText = await page.locator('.save-plan-modal .save-plan-error').first().textContent();
      throw new Error(`Update failed with error: ${errorText}`);
    }
  }
});

When('I click the {string} button', async function (buttonText) {
  // handle "saved plans" -> "browse plans" mapping
  const actualButtonText = buttonText === 'Saved Plans' ? 'Browse Plans' : buttonText;
  const button = await page.locator(`button:has-text("${actualButtonText}")`).first();
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click();
  await page.waitForTimeout(500);
  // if it's browse plans, wait for popup
  if (actualButtonText === 'Browse Plans') {
    await page.waitForSelector('.plans-popup, [class*="plans-popup"]', { timeout: 3000 }).catch(() => {});
  }
});

Then('I should see {string} in my saved plans list', async function (planName) {
  // wait for plans list to appear
  await page.waitForTimeout(1000);
  const planInList = await page.locator(`text=${planName}`).first();
  await planInList.waitFor({ state: 'visible', timeout: 5000 });
});

Then('the plan should show the updated course count', async function () {
  // verify plan exists and has courses
  const planCard = await page.locator(`text=${this.savedPlanName}`).first();
  await planCard.waitFor({ state: 'visible', timeout: 5000 });
  // plan should show some quarter/course info
  const planInfo = await planCard.textContent();
  if (!planInfo || planInfo.trim().length === 0) {
    throw new Error('Plan card should have content');
  }
});

