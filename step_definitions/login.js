/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
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
        cy.set_user_type(user).then(() => {
            /**
             * We used to use cy.fetch_login() here, but it started failing on some CDIS tests (e.g. C.3.31.2200)
             * because that command somehow corrupts the session causes it to invalidate when "Standalone Launch" is clicked.
             * The test began working fine after we changed this to simply interact like actual users would.
             */
            cy.getLabeledElement('input', 'Username').focus().type(window.user_info.get_current_user())
            cy.getLabeledElement('input', 'Password').focus().type(window.user_info.get_current_pass())
            cy.getLabeledElement('button', 'Log In').click()
        })
    }
})

/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Logs a given user out of REDCap
 */
Given("I logout", () => {
    cy.logout()
})