const { Given } = require('@badeball/cypress-cucumber-preprocessor')
globalThis.Given = Given

window.compareVersions = require('compare-versions')

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

function check_feature_filename_format(){
    /**
     * We check filenames here to ensure any inconsistencies are caught
     * before analysts' initial commit for each feature file,
     * since they often at least attempt to run them in Cypress.
     */

    // Only check redcap_rsvc files, as other institutions might use other formats
    if(!Cypress.spec.relative.startsWith('redcap_rsvc')){
        return
    }

    const parts = Cypress.spec.name.split('.')
    if(!['A', 'B', 'C'].includes(parts[0])){
        // We currently only check filesnames for features we run on automation.
        return
    }

    if(!(
        parts[0].length === 1 &&
        parseInt(parts[1]) == parts[1] &&
        parseInt(parts[2]) == parts[2] &&
        parseInt(parts[3]) == parts[3] &&
        parts[3].length === 4 &&
        parts[4].startsWith(' - ')
    )){
        throw 'Feature filenames must match the following general format: A.#.#.####. - Short description.feature'
    }
    
    if(parts[4].includes('(')){
        throw 'Feature filenames must not contain parenthesis since cloud.cypress.io does not support them'
    }
}

function set_user_info(){
    cy.set_user_info(Cypress.env('users'))
}

function reset_database(){
    cy.base_db_seed()
}

function load_core_step_definitions (){
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

    const { BeforeStep } = preprocessor

    let lastFailingFeature

    load_support_files()
    load_core_commands()
    load_core_step_definitions()

    //This is where we initialize the stuff we need in a basic install
    before(() => {
        check_feature_filename_format()
        load_support_files()
        set_user_info()
        intercept_vanderbilt_requests()
        set_timezone()
        reset_database()
        
        /**
         * We must store multiple alerts for cases where multiple appear at once like B.4.9.0100.
         * We use an object rather than an array so that we can use keys to avoid duplicates without
         * the need for something like 'lastAlert.includes(str)' for arrays, which can be expensive
         * since a dozen or so duplicate listeners are registered in some cases due to a quirk of Cypress.
         * The "duplicate listeners" comment above is outdated, but we'll leave it for now in case we
         * switch back to that implementation.
         */
        window.lastAlert = {}
    })

    const shouldShowAlerts = () => {
        /**
         * Cypress normally detects & suppress alerts during automated testing,
         * but developers sometimes want to interact with the page normally
         * if a test is paused or finished.  This functionality allows alerts in those cases.
         */
        return window.shouldShowAlerts
    }

    const rctfAlert = (str) => {
       console.log('detected alert', str)

        if(shouldShowAlerts()){
            alert(str)
        }
        else{
            window.lastAlert[str] = Date.now()
        }
    }

    const rctfConfirm = (str) => {
        console.log('detected confirm', str)

        if(shouldShowAlerts()){
            return confirm(str)
        }
        else{
            window.lastAlert[str] = Date.now()
        }

        if(window.rctfCancelNextConfirm){
            window.rctfCancelNextConfirm = false
            return false
        }

        return true
    }

    const registerEventListeners = () => {
        /**
         * There's a bug in cypress that prevents cy.on('window:alert') or Cypress.on('window:alert')
         * from working consisently in all cases (e.g. C.3.30.0800.,  C.3.24.0305).
         * To ensure all alert & confirm calls are caught, we also manually override those functions on the window.
         * 
         * The following steps are helpful when troubleshooting alerts:
            Given I login to REDCap with the user "Test_Admin"
            And I click on the link labeled "Control Center"
            And I click on the link labeled "Database Query Tool"
            And I click on the button labeled "Custom query options"
            And I click on the link labeled "Import custom queries"
            And I click on the button labeled "Upload"
            And I should see an alert box with the following text: "Please select a file first"
         */
        cy.on('window:alert', rctfAlert)
        cy.on('window:confirm', rctfConfirm)
        cy.window().then(win => {
            // Actions performed within the function must be very efficient, as they are called on every step.
            win.alert = rctfAlert
            win.confirm = rctfConfirm
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
        window.shouldShowAlerts = true
        registerEventListeners()

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

        
        if (Cypress.config('isInteractive')) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    const getStatus = () => {
                        if(lastFailingFeature){
                            return 'failed'
                        }
                        else{
                            return 'succeeded'
                        }
                    }

                    new Notification("Cypress test run " + getStatus())
                }
            })
        }
    })
}

// // This is what makes these functions available to outside scripts
module.exports = {
    rctf_initialize: rctf_initialize
}