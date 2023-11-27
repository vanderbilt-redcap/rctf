/**
 * @module DataAccessGroups
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I click the X to delete the data access group named {string}
 * @param {string} event - name of the event displayed on the Record Home Page
 * @description Activates a pop-up confirming that user wants to delete all data on a specific even within a record
 */

Given("I click the X to delete the data access group named {string}", (dag_name) => {
    cy.table_cell_by_column_and_row_label("Delete", dag_name).then(($td) => {
        cy.wrap($td).find('a:visible:first').click({ waitForAnimations: false })
        cy.get('.ui-dialog').should('contain.text', 'Delete group')
    })
})

/**
 * @module DataAccessGroups
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I click on a table cell containing the text {string} in the data access groups table and clear field and (clear field and) enter {string}
 * @param {string} text - the text to locate the table cell
 * @param {string} table - the name of the table
 * @param {string} new_text - new text to type
 * @description Clicks on a table cell that is identified by a particular text string specified.
 */
Given(/^I click on (?:a|the) table cell containing the text "(.*?)"(?: in)?(?: the)? (.*?) table(?: and (.*?) "(.*?)")?$/, (text, table_type, enter_type = '', new_text = '') => {
    if(table_type === 'data access groups'){
        cy.intercept({
            method: 'GET',
            url: '/redcap_v' + Cypress.env('redcap_version') + '/index.php?route=DataAccessGroupsController:getDagSwitcherTable&tablerowsonly=1&pid=*&rowoption=dags*'
        }).as('dag_data')
    }
    let selector = window.tableMappings[table_type]
    cy.get(selector).within(() => {
        cy.get(`td:contains(${JSON.stringify(text)}):visible`).
        find(`a:contains(${JSON.stringify(text)}):visible:first, span:contains(${JSON.stringify(text)}):visible:first`).
        eq(0).then(($element) => {
            cy.wrap($element).click()

            if(enter_type === "clear field and enter"){
                cy.wrap($element).clear().type(`${new_text}{enter}`)
                if(table_type === 'data access groups') cy.wait('@dag_data')
            } else if (enter_type === "enter"){
                cy.wrap($element).type(`${new_text}{enter}`)
                if(table_type === 'data access groups') cy.wait('@dag_data')
            }
        })
    })
})

/**
 * @module DataAccessGroups
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I {clickType} {string} for user {string} in the DAG Switcher{baseElement}
 * @param {string} clickType - available options: 'click on', 'check', 'uncheck'
 * @param {string} dag - the name of the Data Access Group
 * @param {string} user - the username of user to interact with
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @description Selects a checkbox field by its label
 */
Given("I {clickType} {string} for user {string} in the DAG Switcher{baseElement}", (click_type, dag, user, base_element) => {
    if(Cypress.$('img[src*="progress"]').length) cy.get('img[src*="progress"]').should('not.be.visible')

    cy.table_cell_by_column_and_row_label(user, dag, 'div.dataTables_scrollHead table', 'th', 'td', 0, 'div.dataTables_scrollBody table').then(($td) => {
        if(click_type === "click on"){
            cy.wrap($td).next('td').find('input[type=checkbox]:visible:first').click({ waitForAnimations: false })
        } else if (click_type === "check"){
            cy.wrap($td).next('td').find('input[type=checkbox]:visible:first').check({ waitForAnimations: false })
        } else if (click_type === "uncheck"){
            cy.wrap($td).next('td').find('input[type=checkbox]:visible:first').uncheck({ waitForAnimations: false })
        }
    })
})
