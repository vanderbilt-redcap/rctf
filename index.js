window.compareVersions = require('compare-versions')
window.escapeStringRegexp = require('escape-string-regexp')

require('@4tw/cypress-drag-drop')
require('@foreachbe/cypress-tinymce')

function intercept_vanderbilt_requests(){
    //The following prevents constant requests to Vanderbilt since we're just testing
    cy.intercept({ method: 'GET', url: 'https://redcap.vanderbilt.edu/consortium/collect_stats.php?*'}, []).as('Collect Stats')
    cy.intercept({ method: 'GET', url: '*/consortium/collect_stats.php?*'}, []).as('Stats')
    cy.intercept({ method: 'GET', url: '*/ControlCenter/check_server_ping.php'}, []).as('Ping')
    cy.intercept({ method: 'GET', url: '*/ControlCenter/report_site_stats.php'}, []).as('Control Center Stats')
    cy.intercept({ method: 'GET', url: '*/redcap_v' + Cypress.env('redcap_version') + '/**'}).as('interceptedRequest').then(() => {
        window.registeredAlias = true // this is useful to know whether we can actually call a cy.wait
    })
}

function set_user_info(){
    cy.set_user_info(Cypress.env('users'))
}

function reset_database(){
    cy.base_db_seed()
}

function load_core_step_definitions (Given, When, Then, defineParameterType){
    require('./step_definitions/index')
}

function load_core_commands(){
    require('./commands/index')
}

function set_timezone(){
    cy.php_time_zone()
}

function load_support_files(){
    require('./support/index')
}


function rctf_initialize() {
    preprocessor = require('@badeball/cypress-cucumber-preprocessor')

    const { Given, BeforeStep, defineParameterType } = preprocessor

    let lastFailingFeature

    load_support_files()
    load_core_commands()
    load_core_step_definitions(Given, defineParameterType)

    //This is where we initialize the stuff we need in a basic install
    before(() => {
        load_support_files()
        set_user_info()
        intercept_vanderbilt_requests()
        set_timezone()
        reset_database()
        window.lastAlert = []
    })

    const registerEventListeners = () => {
        if(window.cypressEventListenersRegistered){
            // Make sure we only register events once per page load.
            return
        }
        
        window.cypressEventListenersRegistered = true

        const shouldShowAlerts = () => {
            /**
             * Cypress normally detects & suppress alerts during automated testing,
             * but developers sometimes want to interact with the page normally
             * if a test is paused or finished.  This functionality allows alerts in those cases.
             */
            return window.shouldShowAlerts
        }

        //Get last alert
        cy.on('window:alert', (str) => {
            if(shouldShowAlerts()){
                alert(str)
            }
            else if(!window.lastAlert.includes(str)){
                window.lastAlert.push(str)
            }
        })

        //Get last confirmation
        cy.on('window:confirm', (str) => {
            if(shouldShowAlerts()){
                confirm(str)
            }
            else if(!window.lastAlert.includes(str)){
                window.lastAlert.push(str)
            }
        })
    }

    BeforeStep((options) => {
        registerEventListeners()    
    })

    beforeEach(() => {
        window.registeredAlias = false

        // cy.window().then((win) => {
        //     cy.spy(win, 'initFileSelectAllCheckbox').as('breadcrumbs')
        // })
    })

    function abortEarly() {
        const currentFeature = this.currentTest.invocationDetails.originalFile
        if (currentFeature === lastFailingFeature) {
            /**
             * One of the scenarios on this feature has already failed.  Skip the rest
             * 
             * This is important because our current workflow allows features to be added to redcap_rsvc
             * that have passed manual testing, but are not intended for automated testing yet.
             * We want those to fail fast so that cloud build times are not unnecessarily inflated
             * (by as much as one timeout window for each failing scenario).
             * 
             * This solution was adapted from https://stackoverflow.com/questions/58657895/is-there-a-reliable-way-to-have-cypress-exit-as-soon-as-a-test-fails
             * Mark tried cypress-fail-fast first, but was unable to get it working for unknown reasons.
             */
            this.skip()
        }

        if (this.currentTest.state === 'failed') {
            lastFailingFeature = currentFeature
        }
    }

    beforeEach(abortEarly);
    afterEach(abortEarly);

    after(() => {
        /**
         * Cypress must unregister events once test complete.
         * Set cypressEventListenersRegistered to false so that they get re-registered.
         * This allows users to trigger alert() & confirm() calls after tests finish.
         */
        window.cypressEventListenersRegistered = false
        window.shouldShowAlerts = true
        registerEventListeners()
        
        if (Cypress.config('isInteractive')) {
            /**
             * We are a developer likely running a single feature at a time via the Cypress UI.
             * Automatically save the user & page in case the developer wants to load "Continue Last Run.feature"
             * and pick up where they left off.
             */
            cy.url().then((url) => {
                if(url === 'about:blank'){
                    /**
                     * There was likely some error restoring the previosly saved url.
                     * Leave the previously saved url in places for troubleshooting.
                     */
                    return
                }

                cy.task('saveCurrentURL', ({
                    url: url,
                    redcap_url_pre_survey: window.redcap_url_pre_survey
                }))
            })
        }
    })
}

// // This is what makes these functions available to outside scripts
module.exports = {
    rctf_initialize: rctf_initialize
}