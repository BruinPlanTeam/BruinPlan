//use the test database instead
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});
//log which db you're connecting to
console.log('NODE_ENV=', process.env.NODE_ENV, 'DB_URL=', process.env.DB_URL);


const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const app = require('../../src/app');
const request = require('supertest')
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function teardown(){
    try{
    await prisma.user.deleteMany({
    where: { username: 'alice' },
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
        username: 'alice',
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
    assert.strictEqual(res.body.username, 'alice');
    });
Then('I should be on the homepage with the new account signed in', function () {
    const res = this.response;
    // This step is used both after signup (201) and after login (200)
    // For signup: verify user was created
    // For login: verify login was successful with token
    if (res.status === 201) {
        // After signup - user was created
        assert.ok(res.body.id, 'response should have a user id');
        assert.strictEqual(res.body.username, 'alice', 'username should match');
        // Note: The API currently returns the password (hashed), but we verify the user was created
    } else if (res.status === 200) {
        // After login - should have token
        assert.ok(res.body.token, 'response should contain a JWT token');
        assert.ok(res.body.user, 'response should contain user object');
        assert.strictEqual(res.body.user.username, 'alice', 'user username should match');
        assert.ok(!res.body.user.password, 'password should not be in user object');
    } else {
        assert.fail(`Unexpected status code: ${res.status}. Expected 201 (signup) or 200 (login)`);
    }
});

//Scenario 2: You can't create a user that already exists
Given('a user already exists with an email alice@example.com', async function () {
    const newUser = {
        username: 'alice',
        password: 'password123',
    };

    this.response = await request(app)
        .post('/users')
        .send(newUser);
    });
When('I try to create a new user that has the same email alice@example.com', async function () { 
    const newUser = {
        username: 'alice',
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
Then('I should see an error message showing that the email is already in use', function () {
    const res = this.response;
    // Verify that the response contains an error message about unique constraint
    assert.strictEqual(res.status, 409, 'should return 409 for duplicate user');
    assert.ok(res.body.error, 'response should contain an error message');
    assert.ok(
        res.body.error.includes('Unique constraint') || res.body.error.includes('already'),
        'error message should indicate email/username is already in use'
    );
});
Then('I should remain on the sign-up page', function () {
    const res = this.response;
    // For backend tests, remaining on sign-up page means the request failed
    // The 409 status already indicates the account was not created
    assert.strictEqual(res.status, 409, 'should return 409, indicating signup failed');
    assert.ok(!res.body.id, 'response should not contain a user id');
});

//Scenario 3: You should be able to log in to an existing user account

Given('there is a user with an email alice@example.com', async function () {
    const newUser = {
username: 'alice',
password: 'password123',
};

await request(app)
.post('/users')
.send(newUser);
});
When('I try to log in with the email alice@example.com', async function () {
const loginAttempt = {
"username": "alice",
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