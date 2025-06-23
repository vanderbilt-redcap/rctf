const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module UserRights
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I assign an expiration date to user {string} with username of {string}
 * @param {string} name - the proper name of the user (e.g. Jane Doe)
 * @param {string} username - the username assigned to the user (e.g. jdoe)
 * @description Assigns 'Expiration Date' user right to a given user
 *
 */
Given("I assign an expired expiration date to user {string} with username of {string}", (proper_name, username) => {
    cy.assign_expiration_date_to_user(username, proper_name)
})

/**
 * @module UserRights
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I remove the expired expiration date to user {string} with username of {string}
 * @param {string} name - the proper name of the user (e.g. Jane Doe)
 * @param {string} username - the username assigned to the user (e.g. jdoe)
 * @description Removes 'Expiration Date' user right to a given user when provided a valid Project ID.
 *
 */
Given("I remove the expiration date to user {string} with username of {string}", (proper_name, username) => {
    cy.remove_expiration_date_from_user(username, proper_name)
})

/**
 * @module UserRights
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @example I {clickType} the User Right named "{userRightsChecks}"
 * @param {string} text - name of User Right
 * @description Assign the user right
 *
 */
Given('I {clickType} the User Right named "{userRightsChecks}"', (click_type, text) => {
    cy.get('div[role=dialog]').should('be.visible')

    const elm = cy.get('input[name="' + window.userRightChecks[text] + '"]')

    if(click_type === "uncheck"){
        elm.scrollIntoView().should('be.visible').uncheck()
    } else {
        elm.scrollIntoView().should('be.visible').check()
    }
})

/**
 * @module UserRights
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @example I select the User Right named {string} and choose {string}
 * @param {string} user_right - name of user right
 * @param {string} option - name of the option to select
 * @description Assign user right to role/user
 *
 */
Given("I select the User Right named {string} and choose {string}", (text, option) => {
    cy.get('div[role=dialog]').should('be.visible')

    //For REDCap v12 + we have per instrument data exports, so let's handle that case here
    if(text === "Data Exports" && window.compareVersions.compare(Cypress.env('redcap_version'), '12.0.0', '>=')){

        //TODO: Possibly generate a Step Definition that allows us to configure this on a per instrument basis
        //For now, we are going to select every form to have the same option
        cy.get(`input[type=radio][name*="export-form-"]`).then(($e) => {
            $e.each((i) => {
                if($e[i].value === window.dataExportMappings[option]) {
                    cy.wrap($e[i]).click()
                }
            })
        })

    } else {

        cy.get('input[name="' + window.singleChoiceMappings[text] + '"]').
            parent().
            parent().
            within(() => {
                cy.get('div').
                contains(new RegExp(window.escapeStringRegexp(option))).
                find('input').
                scrollIntoView().
                should('be.visible').
                click()
            })

    }

})

/**
 * @module UserRights
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @example I save changes within the context of User Rights
 * @description Click on the create add user button or save changes
 *
 */
Given("I save changes within the context of User Rights", () => {
    cy.intercept({  method: 'POST',
        url: '/redcap_v' + Cypress.env('redcap_version') + '/UserRights/edit_user.php?*'
    }).as('saved_user')

    cy.get('button').contains(/add user|save changes/i).click()

    cy.wait('@saved_user')

    if(Cypress.$('div#working').length) cy.get('div#working').should('not.be.visible')
})

/**
 * @module UserRights
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I {userRightAction} all Basic Rights within the open User Rights dialog box
 * @param {string} userRightAction - available options: 'add', 'remove'
 * @description Checks or Unchecks all Basic Rights within the User Rights dialog box.
 */
Given('I {userRightAction} all Basic Rights within the open User Rights dialog box', (action) => {
    cy.get('div[role=dialog]').should('be.visible').then(() => {

        //"Full Access" to Data Export Tool - does NOT apply to v12+
        if(action === "add" && Cypress.$('input[name=data_export_tool]').length !== 0){
            cy.get('input[name=data_export_tool]').should('be.visible').check('1')

            //"No Access" to Data Export Tool - does NOT apply to v12+
        } else if (action === "remove" && Cypress.$('input[name=data_export_tool]').length !== 0){
            cy.get('input[name=data_export_tool]').should('be.visible').check('0')
        }

        for(var key in window.userRightChecks) {
            const input = cy.get('input[name="' + window.userRightChecks[key] + '"]').scrollIntoView().should('be.visible')

            if(action === "add"){
                input.check()
            } else if (action === "remove"){
                input.uncheck()
            }
        }

        cy.get('div[role=dialog]').should('be.visible')
    })

})

/**
 * @module UserRights
 * @author Corey DeBacker <debacker@wisc.edu>
 * @example I set Data Viewing Rights to {dataViewingRights} {editSurveyRights} for the instrument {string}
 * @param {string} dataViewingRights - available options: 'No Access', 'Read Only', 'View & Edit', 'Edit survey responses'
 * @param {string} editSurveyRights - available options: ' with Edit survey responses checked', ' with Edit survey responses unchecked'
 * @param {string} instrument - the label of the instrument for which to configure data entry rights
 * @description Selects a radio option for Data Entry Rights for the specified instrument within the user rights configuration dialog.
 */
Given('I set Data Viewing Rights to {dataViewingRights}{editSurveyRights} for the instrument {string}', (level, survey, instrument) => {
    cy.get('div[role=dialog]').should('be.visible')
    let input_values = {'No Access': 0, 'Read Only': 2, 'View & Edit': 1}
    if(survey === " with Edit survey responses checked") {
        cy.get(`table#form_rights tr:has(td:contains(${instrument})) input[type=checkbox]:visible`).check()
    } else if (survey === " with Edit survey responses unchecked"){
        cy.get(`table#form_rights tr:has(td:contains(${instrument})) input[type=checkbox]:visible`).uncheck()
    }
    cy.get(`table#form_rights tr:has(td:contains(${instrument})) input[value=${input_values[level]}]:visible`).check()
})