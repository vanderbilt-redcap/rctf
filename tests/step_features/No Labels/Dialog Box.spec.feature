Feature: No Label Dialog selection

  As a REDCap tester
  I want to see that I can interact with legacy HTML properly

  Scenario: Go to Well Formed HTML page
    Given I click on the link labeled "No Label Dialog"
    Then I should see "No Label Dialog"

  Scenario: Click on a button
    And I see a button labeled "Click Me" in the dialog box
    Then I click on the button labeled "Click Me" in the dialog box

  Scenario: Click on a link
    Given I see a link labeled "Go to example" in the dialog box
    Then I click on the link labeled "Go to example" in the dialog box

  Scenario: Click on a tab
    #Implementation missing: Given I see a tab labeled "Go to example"
    Then I click on the tab labeled "Tab 2" in the dialog box

  Scenario: Type text in an input box
    #Implementation missing: Given I should see the input field labeled "Instrument:"
    Then I enter "New text" into the input field labeled "Instrument:" in the dialog box

  Scenario: Select a checkbox from single checkbox
    #Bad implementation: Given I should see a checkbox labeled "I agree to the terms"
    Then I click on the checkbox labeled "I agree to the terms" in the dialog box

  Scenario: Select a radio option from several radio options
    #Bad implementation: Given I should see a checkbox labeled "I agree to the terms"
    Then I select the radio option "Option 2" for the field labeled "Radio Buttons:" in the dialog box

  Scenario: Select an option from the dropdown
    Given I select "Option 2" in the dropdown field labeled "Dropdown:" in the dialog box
    Then I should see the dropdown field labeled "Dropdown:" with the option "Option 2" selected in the dialog box

  Scenario: Select options from the multiselect
    Given I select "Option 1" in the multiselect field labeled "Multiselect:" in the dialog box
    And I select "Option 2" in the multiselect field labeled "Multiselect:" in the dialog box
    Then I should see the multiselect field labeled "Multiselect:" with the option "Option 1" selected in the dialog box
    And I should see the multiselect field labeled "Multiselect:" with the option "Option 2" selected in the dialog box

  Scenario: Select a checkbox without field context
    # Does not error but it does not check the correct stuff either ... needs similar strategy to radio options in https://github.com/aldefouw/rctf/commit/9858530
    Given I check the checkbox labeled "Checkbox 2" in the dialog box
    And I check the checkbox labeled "Checkbox 1" in the dialog box
    #Then I should see a checkbox labeled "Checkbox 2" that is checked in the dialog box
    #And I should see a checkbox labeled "Checkbox 1" that is checked in the dialog box

  Scenario: Adjust a slider
    #Given I move the slider field labeled "Slider:" to the position of 3
    #I select the checkbox option "Checkbox 1" for the field labeled "Checkboxes:"

  Scenario: Type in a textarea
    Given I enter "Some Text" into the textarea field labeled "Textarea:" in the dialog box

  Scenario: Type in an input field
    Given I enter "Some Input Text" into the input field labeled "Input Field:" in the dialog box
