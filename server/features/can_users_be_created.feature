Feature: Create a new user
    You can create a new user so that you can look at your saved plans and degree.
    
    @scenario1
    Scenario: You should be able to create a new user
        Given there is no user yet with an email alice@example.com
        When I try to create a new user that has the email alice@example.com
        Then the account should be created
        And I should be on the homepage with the new account signed in

    Rule: the email should be unique

    @scenario2
    Scenario: You can't create a user that already exists
        Given a user already exists with an email alice@example.com
        When I try to create a new user that has the same email alice@example.com
        Then the account should not be created
        And I should see an error message showing that the email is already in use
        And I should remain on the sign-up page