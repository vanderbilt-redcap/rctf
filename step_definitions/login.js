const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (attempt to) (am still) (login) (logged in) to REDCap with the user {string}
 * @param {string} user - the user we are logging in as (e.g. 'Test_User1' or 'Test_Admin' as specified in the cypress.env.json file)
 * @description Logs in to REDCap using a seeded user type.
 */
Given("I {loginTypes} the user {string}", (login_type, user) => {
    if(login_type === 'am still logged in to REDCap with\'') {
        cy.set_user_type(user)
        cy.fetch_login()
    } else if(login_type === 'attempt to login to REDCap with' || login_type === 'successfully login to REDCap with'){
        cy.logout()
        cy.set_user_type(user)
        cy.fetch_login(false)
    } else if(login_type === 'provide E-Signature credentials for'){
        const credentials = window.user_info.get_users()[user]
        cy.get('input[id=esign_username]').invoke('attr', 'value', user)
        cy.get('input[id=esign_password]').invoke('attr', 'value', credentials.pass)
    } else {
        cy.logout()
        cy.set_user_type(user)
        cy.fetch_login()
    }
})

/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I logout
 * @description Logs a given user out of REDCap
 */
Given("I logout", () => {
    cy.logout()
})