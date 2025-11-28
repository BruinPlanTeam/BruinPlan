const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const app = require('../../app');
const request = require('supertest')
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

//Scenario: you should be able to create a new user

Given('there is no user yet with an email alice@example.com', async function () {
     await prisma.user.deleteMany({
    where: { email: 'alice@example.com' },
        });
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
Then('I should be on the homepage with the new account signed in', function () {
           // Write code here that turns the phrase above into concrete actions
           return 'pending';
         });

//Scenario - You can't create a user that already exists
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

  assert.notStrictEqual(res.status, 201, 'duplicate user should not be created');

  //There should be no new user id in the response body
  assert.ok(!res.body.id, 'response should not contain an id for a newly created user');
    });
Then('I should see an error message showing that the email is already in use', function () {
    assert.strictEqual(res.status, 409);
    });
Then('I should remain on the sign-up page', function () {
           return 'pending';
         });


//Scenario: You should be able to log in to an existing user account
Given('there is a user with an email alice@example.com', async function () {
               const newUser = {
        email: 'alice@example.com',
        username: 'testuser',
        password: 'password123',
    };

    this.response = await request(app)
        .post('/users')
        .send(newUser);
    });
When('I try to log in with the email alice@example.com', async function () {
            this.response = await request(app)
            .get('/users')
         });
Then('I should be logged in', function () {
           assert.strictEqual()
         });
Then('I should be on the homepage with the new account signed in', function () {
           //Figure out how to test browser
         });

//Scenario: You should be not able to log in to a nonexistent user account
Given('there is no user with an email alice@example.com', function () {
           //Do nothing here, leave it empty
         });
When('I try to log in with the email alice@example.com', async function () {
        this.response = await request(app)
            .get('/users')
         });
Then('I should not be logged in', function () {
           const res = this.response 
           //return 404 not found, rather than  
           assert.strictEqual(res.status, 401, 'should return 401 for trying to operate without credentials.')
         });
Then('I should stay on the login page', function () {
           // Write code here that turns the phrase above into concrete actions
           return 'pending';
         });