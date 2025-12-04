Feature: AI chat endpoint
    Authenticated users can interact with an AI assistant for degree planning help.

    @scenario17
    Scenario: User can send a message to the AI chat
        Given I am authenticated as a user
        When I send a message to the AI chat
        Then I should receive an AI response
        And the response should be successful

    @scenario18
    Scenario: User cannot use AI chat without authentication
        When I try to send a message to the AI chat without authentication
        Then I should receive a 401 unauthorized error

    @scenario19
    Scenario: User cannot send invalid message format to AI chat
        Given I am authenticated as a user
        When I send an invalid message format to the AI chat
        Then I should receive a 400 bad request error

