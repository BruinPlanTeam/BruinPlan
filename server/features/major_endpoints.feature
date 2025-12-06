Feature: Major data endpoints
    Users can retrieve major information to build their academic plans.

    @scenario5
    Scenario: User can get all engineering majors
        When I request all majors
        Then I should receive a list of major names
        And the response should be successful

    @scenario6
    Scenario: User can get details for a specific major
        Given there is a major named "Computer Science"
        When I request details for major "Computer Science"
        Then I should receive major details with classes and requirements
        And the response should be successful

    @scenario7
    Scenario: User cannot get details for a nonexistent major
        Given there is no major named "Nonexistent Major"
        When I request details for major "Nonexistent Major"
        Then I should receive a 404 error
        And the error message should indicate the major was not found