const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module RecordHomePage
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} addOrSelect - available options: 'add', 'select'
 * @param {string} instrument - the name of the instrument you want to add a record to
 * @param {string} event - the name of the event you want to add a record to
 * @param {string} cellAction - available options: ' and click the new instance link', ' and click on the bubble', ' and click the repeating instrument bubble for the first instance', ' and click the repeating instrument bubble for the second instance', ' and click the repeating instrument bubble for the third instance'
 * @description Clicks on an instrument / event pairing to add a record on the Record Home Page
 */
Given('I click the (bubble)("X" icon)( to ){addOrSelect}( )(a record for the)(for the row labeled)( ){string}( longitudinal)( instrument) on (the)( )(event)( column labeled)( ){string}{cellAction}', (verb, instrument, event, cell_action = '') => {
    let repeating = false

    if(cell_action === " and click the repeating instrument bubble for the first instance" ||
        cell_action === " and click the repeating instrument bubble for the second instance" ||
        cell_action === " and click the repeating instrument bubble for the third instance"){
        repeating = true
    }

    cy.table_cell_by_column_and_row_label(event, instrument, 'table#event_grid_table').then(($td) => {
        cy.wrap($td).find('a:visible:first').click()
    }).then(() => {
        cy.intercept({
            method: 'POST',
            url: '/redcap_v' + Cypress.env('redcap_version') + '/index.php?*'
        }).as('instance_table')

        if(repeating){
            cy.wait('@instance_table')

            cy.get('#instancesTablePopup').within(() => {
                let instance = null

                if(cell_action === " and click the repeating instrument bubble for the first instance"){
                    instance = 1
                } else if (cell_action === " and click the repeating instrument bubble for the second instance"){
                    instance = 2
                } else if (cell_action === " and click the repeating instrument bubble for the third instance"){
                    instance = 3
                }

                cy.get('td').contains(instance).parent('tr').within(() => {
                    cy.get('a').click()
                })
            })
        }
    })
})