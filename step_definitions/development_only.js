/**
 * @module DevelopmentOnly
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Pauses the Cypress session.
 */
Given("I want to pause", () => {
    cy.pause()
})

/**
 * @module DevelopmentOnly
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Exports a snapshot of the current database structure at that point in the test and pauses. On subsequent runs, feature will attempt to login with the same user on the same page.
 */
Given("I want to export a snapshot of this feature here", (selector, label, options) => {
    //Snapshot of the DB
    cy.mysql_snapshot_export()

    //Snapshot of the URL and session
    cy.url().then((url) => {
        cy.task('currentSnapshotInfo', ({ url: url, user: window.user_info.get_current_user(), pass: window.user_info.get_current_pass()  })).then(
            (file_created) => {
            if(file_created){
                console.log('Info file created.')
            } else {
                console.log('ERROR: Info file NOT created.')
            }
        })
    })

    cy.pause()

})


