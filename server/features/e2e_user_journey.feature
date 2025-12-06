Feature: Complete User Journey
    As a new user
    I want to sign up, create a plan, and save it
    So that I can track my degree progress

    @scenario20 @e2e
    Scenario: User can sign up, search for a major, create a plan with drag and drop, and save it
        Given I am on the homepage
        When I click the login button
        And I switch to signup mode
        And I sign up with username "e2e_user_123" and password "password123"
        Then I should be redirected to the homepage
        When I type "Computer Science" in the search bar
        And I select "Computer Science" from the suggestions
        Then I should see the plan setup modal
        When I click "Create New Plan"
        And I enter plan name "My E2E Test Plan"
        And I click "Start Planning"
        Then I should see the degree plan page with courses in the sidebar
        When I drag a course from the sidebar to the first quarter
        Then the course should appear in the first quarter
        And the progress bar should update
        When I click the save plan button
        And I confirm saving the plan
        Then the plan should be saved successfully
        And I should see a success message

