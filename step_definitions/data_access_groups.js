const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module DataAccessGroups
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I click on a table cell containing the text {string} in the {tableTypes} table and clear field and {enterType} enter {string}
 * @param {string} text - the text to locate the table cell
 * @param {string} tableTypes
 * @param {string} enterType
 * @param {string} new_text - new text to type
 * @description Clicks on a table cell that is identified by a particular text string specified.
 */
Given(/^I click on (?:a|the) table cell containing the text "(.*?)"(?: in)?(?: the)? (.*?) table(?: and (.*?) "(.*?)")?$/, (text, table_type, enter_type = '', new_text = '') => {
    let selector = window.tableMappings[table_type]

    if(Array.isArray(window.tableMappings[table_type])) {
        selector = window.tableMappings[table_type][0]
    }

    cy.get(selector).within(() => {
        cy.get(`td:contains(${JSON.stringify(text)}):visible`).
        find(`a:contains(${JSON.stringify(text)}):visible:first, span:contains(${JSON.stringify(text)}):visible:first`).
        eq(0).then(($element) => {
            cy.wrap($element).click()

            if(enter_type === "clear field and enter"){
                cy.wrap($element).clear().type(`${new_text}{enter}`)
            } else if (enter_type === "enter"){
                cy.wrap($element).type(`${new_text}{enter}`)
            }
        })
    })
})

/**
 * @module DataAccessGroups
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} clickType
 * @param {string} dag - the name of the Data Access Group
 * @param {string} user - the username of user to interact with
 * @param {string} baseElement
 * @description Selects a checkbox field by its label.
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
