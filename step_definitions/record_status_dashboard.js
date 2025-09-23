const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module RecordStatusDashboard
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} text - the text value of data collection instrument you want to target
 * @param {string} recordIDEvent - available options: 'record ID', 'event'
 * @description Clicks on a bubble within the Record Status Dashboard based upon record ID and the data instrument specified.
 */
Given("I click on the bubble for the {string} data collection instrument for {recordIDEvent} {string}", (text, event_type, record_id) => {
    cy.table_cell_by_column_and_row_label(text, record_id).then(($td) => {
        cy.wrap($td).find('a:visible:first').click()
    })
})

/**
 * @module RecordStatusDashboard
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrument - the data collection instrument you want to target
 * @param {string} event - the event name you want to target
 * @param {string} record_id - the value of the record_id you want to target
 * @param {string} cellAction - available options: ' and click the new instance link', ' and click on the bubble', ' and click the repeating instrument bubble for the first instance', ' and click the repeating instrument bubble for the second instance', ' and click the repeating instrument bubble for the third instance'
 * @description Clicks on a bubble within the Record Status Dashboard based upon record ID and the longitudinal data instrument specified within an event.
 */
Given("I locate the bubble for the {string} instrument on event {string} for record ID {string}{cellAction}", (instrument, event, record_id, cell_action) => {
    cy.get_record_status_dashboard(event, instrument, record_id, cell_action)
})

/**
 * @module RecordStatusDashboard
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I select record ID {string} from arm name {string} on the (Add|View) / Edit record page
 * @param {string} record_id - the name of the record ID
 * @param {string} arm_name - name of the arm as displayed in the dropdown menu (e.g. Arm 1: Arm 1)
 * @description Selects a specific record from the Add / Edit record page
 */
Given(/I select record ID "(.*)" from arm name "(.*)" on the (Add|View) \/ Edit record page$/, (record_id, arm_name) => {
    cy.get('select#arm_name').select(arm_name)
    cy.get('select#record').select(record_id)
})


/**
 * @module RecordStatusDashboard
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} event - name of the event displayed on the Record Home Page
 * @description Activates a pop-up confirming that user wants to delete all data on a specific even within a record
 */
Given("I click the X to delete all data related to the event named {string}", (event) => {
    cy.table_cell_by_column_and_row_label(event, "Delete all data on event").then(($td) => {
        cy.wrap($td).find('a:visible:first').click()
        cy.get('.ui-dialog').should('contain.text', 'DELETE ALL DATA ON THIS EVENT INSTANCE')
    })
})