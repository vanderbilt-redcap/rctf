/**
 * @module Survey
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @param {string} username - username
 * @param {string} password - password
 * @description Enters credentials when enabling e-signature on survey
 */
 Given("I enter the Username: {string} and password {string} for e-signature", (username, password) => {
    cy.get('input[id="esign_username"]').type(username)
    cy.get('input[id="esign_password"').type(password)
})

/**
 * @module Survey
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} survey_option_label - the label of the survey option specified
 * @param {string} tag - (optional) the value of the tag specified
 * @description Clicks on a survey option label.  Track it via an optional tag.
 */
Given("I click on the survey option label containing {string} label{optionalString}", (survey_option_label, optionalStr) => {
    /**
     * We are seeing intermittent failures on the following call
     * due to the browser sometime choosing to autofocus iframe content on page load
     * which causes this menu to be closed before the option can be clicked.
     * Mark was able to reproduced this locally once, but then it stopped happening inexplicably.
     * Ideally we would find out why the iframe is getting focus and prevent that action somehow.
     */
    cy.getLabeledElement('link', survey_option_label).then(link => {
        const logout = (survey_option_label === 'Log out+ Open survey')
        cy.open_survey_in_same_tab(link, (optionalStr !== " and will leave the tab open when I return to the REDCap project"), logout)
        if(!logout){
            cy.wrap(link).click()
        }
    })
})

/**
 * @module Survey
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Returns user to the REDCap page they were on before they exited to take a survey
 */
Given("I return to the REDCap page I opened the survey from", () => {
    if(window.elementChoices[''] === 'iframe'){
        window.elementChoices[''] = 'html'
        cy.window().then((win) => {
            //Go back to regular baseElement choice
            let survey = win.document.getElementById('SURVEY_SIMULATED_NEW_TAB')
            survey.style.display = 'none'
        })
    } else {
       cy.visit(window.redcap_url_pre_survey)
    }
})