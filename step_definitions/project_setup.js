/**
 * @module ProjectSetup
 * @author Corey Debacker <debacker@wisc.edu>
 * @param {string} repeatability
 * @description Visually verifies Repeatable Instrument functionality is enabled or disabled in the project.
 */
Given("I (should )see that repeatable instruments are {repeatability}", (state) => {
    let expected_text = ''
    switch (state.toLowerCase()) {
        case 'enabled':
            expected_text = "Disable"
            break;
        case 'disabled':
            expected_text = "Enable"
            break;
        case 'modifiable':
            expected_text = "Modify"
            break;
    }

    if(state === 'unchangeable'){
        cy.get('#enableRepeatingFormsEventsBtn').should('be.disabled');
    } else {
        cy.get('#enableRepeatingFormsEventsBtn').should('contain.text', expected_text);
    }
})

/**
 * @module ProjectSetup
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Opens the dialog box for the Repeatable Instruments and Events module on the Project Setup page.
 */
Given("I open the dialog box for the Repeatable Instruments and Events module", () => {
    cy.get('#enableRepeatingFormsEventsBtn').click();
    cy.get('div.ui-dialog').should(($div) => {
        expect($div).to.contain('Repeat')
        expect($div).to.contain('Instrument')
    })
})