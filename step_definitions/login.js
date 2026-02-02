/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} user - the user we are logging in as (e.g. 'Test_User1' or 'Test_Admin' as specified in the cypress.env.json file)
 * @description Logs in to REDCap using a seeded user type.
 */
Given("I {loginTypes} the user {string}", (login_type, user) => {
    let chain;

    if (login_type === "am still logged in to REDCap with'") {
        chain = cy.set_user_type(user).fetch_login(); // assume this returns a chain
    } else if (
        login_type === 'attempt to login to REDCap with' ||
        login_type === 'successfully login to REDCap with'
    ) {
        chain = cy
            .logout()
            .set_user_type(user)
            .fetch_login(false);
    } else if (login_type === 'provide E-Signature credentials for') {
        // Keep everything in the Cypress chain:
        const credentials = window.user_info.get_users()[user];
        chain = cy
            .get('#esign_username').clear().type(user)
            .get('#esign_password').clear().type(credentials.pass, { log: false });
    } else {
        chain = cy.logout().set_user_type(user).fetch_login();
    }

    cy.getCsrfToken().as('csrf').then((csrf) => {
        // Ensure enable_modules runs after the selected branch completes
        return chain.then(() => cy.enable_modules(csrf));
    })
})

/**
 * @module Login
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Logs a given user out of REDCap
 */
Given("I logout", () => {
    cy.logout()
})