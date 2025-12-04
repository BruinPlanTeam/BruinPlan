Feature: User authentication endpoints
    Authenticated users can update their account information.

    @scenario15
    Scenario: User can update their username
        Given I am authenticated as a user
        When I update my username to "newusername"
        Then my username should be updated successfully
        And the response should contain the updated user data

    @scenario16
    Scenario: User cannot update username without authentication
        When I try to update my username without authentication
        Then I should receive a 401 unauthorized error

