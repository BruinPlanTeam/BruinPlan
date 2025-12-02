const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const app = require('../../src/app');
const request = require('supertest')
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function teardown(){
    try{
    await prisma.user.deleteMany({
    where: { email: 'alice@example.com' },
        });
    }
    finally {
        await prisma.$disconnect();
    }
}

//Scenario 1: you should be able to create a new user

Given('there is no user yet with an email alice@example.com', async function () {
    await teardown();
    });
When('I try to create a new user that has the email alice@example.com', async function () {      
    const newUser = {
        email: 'alice@example.com',
        username: 'testuser',
        password: 'password123',
    };

    this.response = await request(app)
        .post('/users')
        .send(newUser);
    });
Then('the account should be created', function () {
    const res = this.response;

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id, 'response should have an id');
    assert.strictEqual(res.body.email, 'alice@example.com');
    assert.strictEqual(res.body.username, 'testuser');
    });
// Then('I should be on the homepage with the new account signed in', function () {
//            // Write code here that turns the phrase above into concrete actions
//            return 'pending';
//          });

//Scenario 2: You can't create a user that already exists
Given('a user already exists with an email alice@example.com', async function () {
    const newUser = {
        email: 'alice@example.com',
        username: 'testuser',
        password: 'password123',
    };

    this.response = await request(app)
        .post('/users')
        .send(newUser);
    });
When('I try to create a new user that has the same email alice@example.com', async function () { 
    const newUser = {
        email: 'alice@example.com',
        username: 'testuser',
        password: 'password123',
    };

    this.response = await request(app)
        .post('/users')
        .send(newUser);
    });
Then('the account should not be created', function () {
  const res = this.response;

  assert.strictEqual(res.status, 409, 'duplicate user should not be created');

  //There should be no new user id in the response body
  assert.ok(!res.body.id, 'response should not contain an id for a newly created user');
    });
// Then('I should see an error message showing that the email is already in use', function () {
//         //This is something you want to test by simulating the browser, so don't assert an HTTPS error message (that's done above)
//         return 'pending';
//     });
// Then('I should remain on the sign-up page', function () {
//            return 'pending';
//          });

//Scenario 3: You should be able to log in to an existing user account

Given('there is a user with an email alice@example.com', async function () {
               const newUser = {
        email: 'alice@example.com',
        username: 'testuser',
        password: 'password123',
    };

    await request(app)
        .post('/users')
        .send(newUser);
    });
When('I try to log in with the email alice@example.com', async function () {
    const loginAttempt = {
        "email": "alice@example.com",
        "password": "password123"
    };

        this.response = await request(app)
        .post('/users/login')
        .send(loginAttempt)
    });
Then('I should be logged in', function () {
        const res = this.response;
        assert.strictEqual(res.status, 200, 'should successfully log in')
         });
// Then('I should be on the homepage with the new account signed in', function () {
//            //Figure out how to test browser
//          });


//Scenario 4: You should be not able to log in to a nonexistent user account

Given('there is no user with an email alice@example.com', async function () {
        await teardown()
         });
// When('I try to log in with the email alice@example.com');
Then('I should not be logged in', function () {
           const res = this.response 
           //return 404 not found, rather than  
           assert.strictEqual(res.status, 401, 'should return 401 for trying to operate without credentials.')
         });
// Then('I should stay on the login page', function () {
//            // Write code here that turns the phrase above into concrete actions
//            return 'pending';
//          });