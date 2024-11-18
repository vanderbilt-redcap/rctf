Feature: Should NOT see

  As a REDCap tester
  I want to ensure that some things are not visible

  Scenario: Go to Visibility page
    Given I click on the link labeled "Text Visibility"
    Then I should see "Text Visibility Page"
    And I should see "Text Visibility" in the title

  Scenario: HTML: Verify text that is visible AND invisible
    Given I see "Text I should see"
    And I see "Dialog Text I should see"
    And I see "Tooltip Text I should see"
    Then I should NOT see "Text I should NOT see"
    And I should NOT see "Dialog Text I should NOT see"
    And I should NOT see "Tooltip Text I should NOT see"

  Scenario: Dialog Box: Verify text that is visible AND invisible
    Given I see "Dialog Text I should see" in the dialog box
    # Next line does the same thing with a different step definition
    And I should see a dialog containing the following text: "Dialog Text I should see"
    Then I should NOT see "Dialog Text I should NOT see" in the dialog box

  Scenario: Tooltip: Verify text that is visible AND invisible
    Given I see "Tooltip Text I should see" in the tooltip
    Then I should NOT see "Tooltip Text I should NOT see" in the tooltip

  Scenario: Table Visibility, Columns, Rows
    Given I see "Table Row Columns"
    Then I should see a "ROW #2 VALUE #2" within the "Row 2" row of the column labeled "Column 2"
    And I should see "ROW #1 VALUE #1" in a table

  Scenario: Data Entry Form Field Visibility
    Given I see "Standard Input Field"
    Then I should see "Test Value" in the data entry form field "Standard Input Field"

  Scenario: Data Entry Form - Date Field Visibility
    Given I see "datetime YMD HMSS"
    Then I should see the date and time "2023-08-01 00:00:00" in the field labeled "datetime YMD HMSS"
