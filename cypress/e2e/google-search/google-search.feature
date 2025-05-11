Feature: Google Search

  Scenario: Search for a term
    Given I open Google
    When I search for the term
    Then I should see results related to the term
