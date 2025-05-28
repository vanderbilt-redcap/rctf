const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module VisitPage
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I visit the REDCap login page
 * @description Instructs Cypress to the REDCap login page
 */
Given("I visit the REDCap login page", () => {
    cy.logout()
    cy.visit_version({page: '/'})
})

/**
 * @module VisitPage
 * @author Mark McEver <mark.mcever@vumc.org>
 * @example I wait for background processes to finish
 * @description Executes REDCap's crons and returns to the previous page
 */
Given("I wait for background processes to finish", () => {
    cy
        .visit('/cron.php')
        .get('body')
        .contains('Completed all jobs!')
        .go('back')
})