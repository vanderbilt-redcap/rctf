//#############################################################################
//# Commands       A B C D E F G H I J K L M N O P Q R S T U V W X Y Z        #
//#############################################################################

Cypress.Commands.add('enable_surveys', (instrument_name) => {
    cy.get('table[id=table-forms_surveys]').within(() => {
        cy.get('tr').contains(instrument_name).parents('tr').find(':button').contains('Enable').click()
    })

    cy.get(`:button:contains("Save Changes"):visible:first`).click()

    cy.get('html').should('contain', 'Your survey settings were successfully saved!')
})

Cypress.Commands.add('open_survey_in_same_tab', (element, same_tab = true, logout = false) => {
    //Set the Pre Survey URL so we can return to the page we were on later
    cy.url().then((existing_url) => {
        window.redcap_url_pre_survey = existing_url
    })

    //Stub the surveyOpen method to prevent from opening new window
    cy.window().then((win) => {

        if(same_tab){
            cy.stub(win, 'surveyOpen').callsFake((url, target) => {
                window.survey_url = url
                return win.open(url, '_self')
            })
        } else {
            //This allows us to simulate behavior of a survey being opened in a new tab
            //We basically only have one use case for this: ensuring the "Leave this page while survey is in session" alert shows up
            cy.stub(win, 'surveyOpen').callsFake((url, target) => {

                //This will allow us to temporarily target the iframe as primary baseElement
                //This is especially important if we want to interact with the survey onscreen!
                window.elementChoices[''] = 'iframe'

                const viewportWidth = win.innerWidth || win.document.documentElement.clientWidth;
                const viewportHeight = win.innerHeight || win.document.documentElement.clientHeight;

                win.document.body.style = "display: block; margin:0; padding: 0;"

                const surveyWindow = win.document.createElement('iframe');
                surveyWindow.id = 'SURVEY_SIMULATED_NEW_TAB';
                surveyWindow.style.width = viewportWidth + 'px';
                surveyWindow.style.height = viewportHeight + 'px';
                surveyWindow.style.zIndex = '100000'
                surveyWindow.style.top = '0'
                surveyWindow.style.left = '0'
                surveyWindow.style.position = 'absolute'
                surveyWindow.src = url;

                win.document.body.appendChild(surveyWindow)
            })
        }
    })

    if(logout){
        //This removes the logout portion of the click event
        cy.wrap(element).invoke('attr', 'onclick')
            .then((onclickValue) => {
                const modifiedOnclick = onclickValue.replace("window.location.href=window.location.href+'&logout=1'", '');
                cy.wrap(element).invoke('attr', 'onclick', modifiedOnclick);
            }).click()

        //This will log us out instead
        cy.clearCookies()

    } else {
        cy.wrap(element).click()
    }

})