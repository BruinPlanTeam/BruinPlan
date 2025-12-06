Feature: Plan Management E2E
    As an authenticated user
    I want to load, modify, and update my saved plans
    So that I can manage my degree plans effectively

    @scenario21 @e2e
    Scenario: User can load a saved plan, modify it, and update it
        Given I am logged in as user "e2e_plan_user_456" with password "password123"
        And I have a saved plan named "Existing Test Plan" for major "Computer Science"
        When I navigate to the degree plan page
        And I click "Load Saved Plan" in the setup modal
        And I select the plan "Existing Test Plan"
        Then I should see the loaded plan with existing courses
        When I drag a new course from the sidebar to the second quarter
        Then the course should appear in the second quarter
        When I click the save plan button
        And I confirm saving the plan
        Then the plan should be updated successfully in the UI
        When I click the "Saved Plans" button
        Then I should see "Existing Test Plan" in my saved plans list
        And the plan should show the updated course count

