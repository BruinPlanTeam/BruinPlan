Feature: Plan management endpoints
    Authenticated users can create, read, update, and delete their academic plans.

    @scenario8
    Scenario: User can create a new plan
        Given I am authenticated as a user
        And there is a major named "Computer Science"
        When I create a plan with name "My First Plan" for major "Computer Science"
        Then the plan should be created successfully
        And the response should contain the plan data

    @scenario9
    Scenario: User cannot create a plan without authentication
        When I try to create a plan without authentication
        Then I should receive a 401 unauthorized error

    @scenario10
    Scenario: User can get all their plans
        Given I am authenticated as a user
        And I have created a plan named "Plan 1"
        And I have created a plan named "Plan 2"
        When I request all my plans
        Then I should receive a list of my plans
        And the list should contain "Plan 1"
        And the list should contain "Plan 2"

    @scenario11
    Scenario: User can update an existing plan
        Given I am authenticated as a user
        And I have created a plan named "Original Plan"
        When I update the plan with new quarters
        Then the plan should be updated successfully
        And the response should contain the updated plan data

    @scenario12
    Scenario: User can update a plan name
        Given I am authenticated as a user
        And I have created a plan named "Old Name"
        When I update the plan name to "New Name"
        Then the plan name should be updated successfully

    @scenario13
    Scenario: User can delete a plan
        Given I am authenticated as a user
        And I have created a plan named "Plan to Delete"
        When I delete the plan
        Then the plan should be deleted successfully
        And the plan should no longer exist

    @scenario14
    Scenario: User cannot delete another user's plan
        Given I am authenticated as user "alice"
        And user "bob" has created a plan
        When I try to delete user "bob"'s plan
        Then I should receive a 403 forbidden error

