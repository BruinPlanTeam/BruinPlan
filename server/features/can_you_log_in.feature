Feature: Log in to an existing user account
    You should be able to log in to an existing user account to view saved plans.

    Scenario: You should be able to log in to an existing user account
        Given there is a user with an email alice@example.com
        When I try to log in with the email alice@example.com
        Then I should be logged in
        And I should be on the homepage with the new account signed in

    Rule: the account should exist

    Scenario: You should be not able to log in to a nonexistent user account
        Given there is no user with an email alice@example.com
        When I try to log in with the email alice@example.com
        Then I should not be logged in
        And I should stay on the login page
