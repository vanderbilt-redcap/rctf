/**
 * @module VisitPage
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Instructs Cypress to the REDCap login page
 */
Given("I visit the REDCap login page", () => {
    cy.logout()
    cy.visit_version({page: '/'})
})

/**
 * @module VisitPage
 * @author Mark McEver <mark.mcever@vumc.org>
 * @description Executes REDCap's crons and returns to the previous page
 */
Given("I wait for background processes to finish", () => {
    cy
        .visit('/cron.php')
        .get('body')
        .contains('Cron Run Report')
        .document().then(oldDoc => {
            cy.go('back')

            cy.document().should(newDoc => {
                /**
                 * If we're calling this step multiple times in a row (e.g. B.3.16.1400.),
                 * we must make sure we return to the old page before the next call starts.
                 */
                expect(newDoc).not.to.eq(oldDoc)
            })
        })
})