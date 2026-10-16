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
    // The prior step ("I click on the button labeled \"Survey options\"") already opens the
    // SurveyActionDropDown; cy.get() below retries for the full command timeout, so a slow
    // open is tolerated. Do NOT re-click "Survey options" here — it is a toggle, so a second
    // click closes the just-opened menu and the option <li> disappears.
    cy.get(`ul:visible li:visible`).contains(survey_option_label).then(($li) => {
        const logout = (survey_option_label === 'Log out+ Open survey')
        const sameTab = (optionalStr !== " and will leave the tab open when I return to the REDCap project")
        cy.open_survey_in_same_tab($li, sameTab, logout)
        if(!logout){
            // The survey-options menu item can sit outside the viewport when a tall
            // PDF.js consent preview is on the page, so scroll it in before clicking.
            // The click then runs Cypress's normal actionability checks: the item must
            // be visible and its center must be the hit-test target. Keeping those
            // checks is the point — open_survey_in_same_tab has already stubbed the
            // onclick, so a forced click would fire the handler even when something is
            // genuinely covering the item, turning a layout regression into a silent pass.
            cy.wrap($li).scrollIntoView().click()
            if(sameTab){
                cy.visit_survey_opened_in_same_tab()
            }
        }
    })
})

/**
 * @module Survey
 * @author Mintoo Xavier <min2xavier@gmail.com>
 * @description Dismisses the e-Consent "Okay" confirmation dialog only if it is present.
 *   After "Save & Stay" on an e-Consent instrument, REDCap shows an "Okay" confirmation
 *   dialog for some saves (e.g. the first consent on a record) but goes straight to the
 *   inline consent PDF for others (e.g. a repeated/again consent). A plain
 *   `click on the button labeled "Okay"` therefore fails wherever the dialog is absent.
 *   This step clicks "Okay" when the dialog is showing and is a no-op otherwise, so the
 *   same line works in both cases.
 */
Given("I dismiss the {string} confirmation dialog if it appears", (label) => {
    // After "Save & Stay" on an e-Consent instrument the confirmation dialog usually
    // appears, but only once REDCap finishes regenerating the consent PDF — sometimes
    // several seconds later under headless/CI load. We must click it (it blocks the next
    // "Survey options" click), yet some saves don't produce it at all, so the step is
    // best-effort: poll for the labeled control, click it as soon as it shows, and move on
    // if it never does. Detection uses jQuery (Cypress.$) rather than cy.get(...).filter(),
    // because chaining a cy command across a mid-transition DOM races detachment and throws
    // "cy.filter() failed because it requires a DOM element".
    const findControl = () =>
        Cypress.$('button:visible, a:visible, input[type="button"]:visible').filter((i, el) =>
            (Cypress.$(el).text() || el.value || '').trim() === label)

    const pollForDialog = (msLeft) => {
        if(findControl().length > 0 || msLeft <= 0) return
        cy.wait(500, { log: false })
        cy.then(() => pollForDialog(msLeft - 500))
    }

    cy.then(() => pollForDialog(20000))
    cy.then(() => {
        const $control = findControl()
        if($control.length > 0){
            cy.wrap($control.first()).click()
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