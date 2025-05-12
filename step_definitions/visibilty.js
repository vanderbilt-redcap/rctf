const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should NOT see {string} {baseElement}
 * @param {string} text the text visually seen on screen
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' on the Add/Edit Branching Logic dialog box', ' in the Add/Edit Branching Logic dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the Edit survey responses column', ' in the open date picker widget', ' in the File Repository breadcrumb', ' in the File Repository table', ' in the View Access section of User Access', ' in the Edit Access section of User Access', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @description Visually verifies that text does NOT exist within the HTML object.
 */
Given("I {notSee} see {string}{baseElement}", (not_see, text, base_element = '') => {
    cy.not_loading()

    cy.get(window.elementChoices[base_element]).then($elm => {
        /**
         * We use innerText.indexOf() rather than the ':contains()' selector
         * to avoid matching text within hidden tags and <script> tags
         * that is not actually displayed.
         */
        const index = $elm.get(0).innerText.indexOf(text)
        //If we don't detect it anywhere
        if(index === -1){
            expect('html').to.not.contain(text)
        //If we do detect the text, let us make sure it is not visible on-screen
        } else {
            cy.contains(text).then(($elm) => {
                cy.wait_to_hide_or_detach($elm).then(() => {
                    expect('html').to.not.contain(text)
                })
            })
        }
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should see {string} in the title
 * @param {string} title the HTML page title
 * @description Visually verifies that text does exist in the HTML page title.
 */
Given("I should see {string} in the title", (title) => {
    cy.title().should('include', title)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should see the {dropdownType} field labeled {string} with the option {string} selected {baseElement}
 * @param {string} dropdownType - available options: 'dropdown', 'multiselect', 'checkboxes', 'radio'
 * @param {string} label - the label of the field
 * @param {string} option - the option selected
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the Edit survey responses column', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @description Selects a specific item from a dropdown
 */
Given('I (should )see the {dropdownType} field labeled {string} with the option {string} selected{baseElement}', (type, label, option, base_element) => {
    let label_selector = `:contains(${JSON.stringify(label)}):visible`
    let element_selector = `select:has(option:contains(${JSON.stringify(option)})):visible`

    //Either the base element as specified or the default
    let outer_element = base_element.length > 0 ?
        cy.top_layer(label_selector, window.elementChoices[base_element]) :
        cy.top_layer(label_selector)

    outer_element.within(() => {
        cy.get_labeled_element(element_selector, label).find(':selected').should('have.text', option)
    })
})

/**
 * @module Visibility
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @example I should see the {dropdownType} field labeled {string} with the options below
 * @param {string} dropdownType - available options: 'dropdown', 'multiselect'
 * @param {string} label the label of the row the selector belongs to
 * @param {dataTable} options the Data Table of selectable options
 * @description Visibility - Visually verifies that the element selector has the options listed
 */
Given("I should see the {dropdownType} field labeled {string} with the options below", (type, label, options) => {
    let label_selector = `:contains("${label}"):visible`

    cy.top_layer(label_selector).within(() => {
        for(let i = 0; i < options.rawTable.length; i++){
            let element_selector = `select:has(option:contains(${JSON.stringify(options.rawTable[i][0])})):visible`
            if (type === "multiselect" || type === "radio") {
                element_selector = `div:has(label:contains(${JSON.stringify(options.rawTable[i][0])})):visible`
            }
            let element = cy.get_labeled_element(element_selector, label)
            element.should('contain', options.rawTable[i][0])
        }
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should see a checkbox labeled {string} that is {check}
 * @param {string} label - the label associated with the checkbox field
 * @param {string} check - available options: 'checked', 'unchecked', 'in the enabled state', 'in the disabled state'
 * @description Selects a checkbox field by its label
 */
Given("I (should see)(see) a {checkBoxRadio} {labeledExactly} {string} that is {check}", (type, labeled_exactly, label, check) => {
    let label_selector = `:has(:contains(${JSON.stringify(label)}):visible):has(input[type=checkbox]:visible)`
    let element_selector = `input[type=checkbox]:visible`

    //This is to accommodate for aliases such as "toggle button" which is actually a checkbox behind the scenes
    check = window.checkBoxAliases.hasOwnProperty(check) ? window.checkBoxAliases[check] : check

    cy.top_layer(label_selector).within(() => {
        let selector = cy.get_labeled_element(element_selector, label, null, labeled_exactly === "labeled exactly")
        selector.scrollIntoView().should(check === "checked" ? "be.checked" : "not.be.checked")
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should see the radio labeled {string} with option {string} {select}
 * @param {string} label - the text that should be displayed in an alert box
 * @param {string} select - available options: 'selected', 'unselected'
 * @description Visually verifies that the alert box contains text
 */
Given("I should see the radio labeled {string} with option {string} {select}", (label, option, selected) => {
    cy.select_radio_by_label(label, option, false, selected === 'selected')
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should )see a dialog containing the following text: {string}
 * @param {string} text - the text that should be displayed in a dialog box
 * @description Visually verifies that the dialog box contains text
 */
Given("I (should )see a dialog containing the following text: {string}", (text) => {
    cy.verify_text_on_dialog(text)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I should see {string} in the data entry form field {string}
 * @param {string} field_value - the text that should be displayed in the field
 * @param {string} field_name - the text that identifies the field in the form
 * @description Visually verifies the text within a data entry form field
 */
Given("I should see {string} in the data entry form field {string}", function (field_value, field_name) {
    let contains = ''
    let last_label = field_name
    field_name.split(' ').forEach((val) => {
        contains += `:has(:contains(${JSON.stringify(val)}))`
        last_label = val
    })
    let outer_element = `tr${contains}:has(input[type=text]):visible:first`

    cy.get(outer_element).within(() => {
        cy.get(`label:contains(${JSON.stringify(last_label)})`)
            .invoke('attr', 'id')
            .then(($id) => {
                let elm = cy.get('[name="' + $id.split('label-')[1] + '"]')
                if (window.dateFormats.hasOwnProperty(field_value)){
                    elm.invoke('val').should('match', window.dateFormats[field_value])
                } else {
                    elm.should('contain.value', field_value)
                }
            })
    })
})

/**
 * @module Visibility
 * @author Corey DeBacker <debacker@wisc.edu>
 * @example I (should) see {articleType} {optionalString} {onlineDesignerButtons} {labeledElement} {labeledExactly} {string}{baseElement} {disabled}
 * @param {string} labeledElement - available options: 'button', 'link', 'field', 'section break', 'checkbox', 'toggle button'
 * @param {string} label - the label of the link that should be seen on screen (matches partially)
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the Edit survey responses column', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @description Verifies that a visible element of the specified type containing `text` exists
 */
Given("I (should )see( ){articleType}( ){visibilityPrefix}( ){onlineDesignerButtons}( ){labeledElement}( ){labeledExactly}( ){string}{baseElement}{iframeVisibility}( )( that){disabled}", (article_type, prefix, online_buttons, el, labeled_exactly, text, base_element, iframe, disabled_text) => {
    cy.not_loading()

    let opt_str = prefix
    let base
    let subsel = ''

    if(el !== ''){ subsel = {'link': 'a', 'button': 'button', 'field': 'tr', 'section break': 'td.header', 'checkbox': 'input[type=checkbox]'}[el] }

    //It's possible for the survey icon to appear even if the instrument itself is not a link
    if(el === 'link' && online_buttons !== undefined && online_buttons.includes('survey icon')){
        subsel = ''
    }

    let disabled_status = disabled_text !== undefined && disabled_text === "is disabled" ? ':disabled': ':not([disabled])'

    // double quotes need to be re-escaped before inserting into :contains() selector
    let sel = `${subsel}:contains(${JSON.stringify(text)}):visible` + (el === 'button' ? `,input[value=${JSON.stringify(text)}]:visible${disabled_status}` : '')

    if (window.icons.hasOwnProperty(text)) {
        cy.get(`${window.elementChoices[base_element]}:has(${window.icons[text]}):visible`).
        should('be.visible').
        should('have.descendants', window.icons[text])
    } else if(window.parameterTypes['visibilityPrefix'].includes(prefix)){

        if (prefix === "Project status:" && window.parameterTypes['projectStatus'].includes(text)) {
            cy.get('div.menubox:contains("Project status:")').should('contain', text)
        } else if (prefix === 'Data Collection Instrument named'){
            cy.instrument_visibility('', labeled_exactly, text)
        } else if (prefix === 'an alert box with the following text:'){
            return new Cypress.Promise((resolve) => {
                (function waitForAlert(i = 0) {
                    if ((window.lastAlert !== undefined && window.lastAlert.length !== 0) || i > 10) {
                        window.lastAlert.forEach((alert) => {
                            if(alert.includes(text)){
                                expect(alert).to.contain(text)
                                resolve('done')
                            }
                        })
                    } else {
                        setTimeout(waitForAlert, 500, (i + 1))
                    }
                })()
            })
        } else if (prefix === 'a field named'){
            cy.get(`table[role=presentation]:visible tr:visible td:visible:contains(${text})`).contains(text)
        } else if(prefix === "a downloaded file named") {
            cy.fetch_timestamped_file(text).then((filename) => {
                expect(filename).to.exist
            })
        } else if(prefix === "the exact time in the" || prefix === "today's date in the"){
            const today = new Date();
            const year = today.getFullYear()
            const month = String(today.getMonth() + 1).padStart(2, '0') // Months are zero-based
            const day = String(today.getDate()).padStart(2, '0')
            const hours = String(today.getHours()).padStart(2, '0')
            const minutes = String(today.getMinutes()).padStart(2, '0')
            const seconds = String(today.getSeconds()).padStart(2, '0')

            const expectedValue = (prefix === "the exact time in the") ?
                `${hours}:${minutes}:${seconds}` :
                `${year}-${month}-${day}`

            cy.get(sel).find('input').invoke('val')
                .then((actualValue) => {
                    if (prefix === "the exact time in the") {
                        let [h, m, s] = actualValue.split(':').map(Number)
                        const actualTimeInSeconds = (h * 3600) + (m * 60) + s

                        let [h_e, m_e, s_e] = expectedValue.split(':').map(Number)
                        const expectedTimeInTimeInSeconds = (h_e * 3600) + (m_e * 60) + s_e

                        //5 seconds tolerance
                        expect(actualTimeInSeconds).to.be.closeTo(expectedTimeInTimeInSeconds, 5)
                    } else {
                        expect(actualValue).to.eq(expectedValue)
                    }
                })
        }

    } else {

        if (window.parameterTypes['onlineDesignerButtons'].includes(online_buttons)) {
            if (!window.icons.hasOwnProperty(online_buttons)) {
                online_buttons = online_buttons.replaceAll('"', '')
                sel = `${subsel}:contains("${online_buttons}"):visible` + (el === 'button' ? `,input[value="${online_buttons}"]:visible${disabled_status}` : '')
            }
        }

        let element_selector = window.elementChoices[base_element]

        base = (iframe === " in the iframe" || window.elementChoices[base_element] === 'iframe') ?
            cy.frameLoaded().then(() => { cy.iframe() }) :
            cy.get(`${window.elementChoices[base_element]}:has(${sel})`)

        base.first().within(($elm) => {
            return expect($elm).length.to.be.greaterThan(0)
        }).then((next_section) => {

            if (iframe === " in the iframe" || window.elementChoices[base_element] === 'iframe' || base_element === ' in the dialog box') {
                base.within(($elm) => {
                    cy.wrap($elm).find(sel).should('contain', text)

                    if (disabled_text === "is disabled") {
                        cy.wrap($elm).find(sel).should('be.disabled')
                    }
                })
            } else {

                if (labeled_exactly === "for the variable") {
                    if (!window.parameterTypes['onlineDesignerButtons'].includes(online_buttons)) {
                        //Trim off the quotes
                        opt_str = opt_str.slice(1, -1)

                        sel = `:contains("${opt_str}")`

                        //We are converting to lower case because this will generally match on the instrument name (and prevent duplicate matches)
                        let selector = `tr:contains(${JSON.stringify(`Variable: ${text}`)}):visible`
                        element_selector = `${element_selector}:visible table:visible ${selector}`
                    }

                } else if (labeled_exactly === "in the row labeled") {
                    sel = `td:visible ${sel}`
                    element_selector = `${element_selector}:visible table:visible tr:contains(${JSON.stringify(text)}):visible`
                } else if (labeled_exactly === "for the instrument row labeled") {
                    if (window.icons.hasOwnProperty(online_buttons)) {
                        sel = `td:visible :has(${window.icons[online_buttons]})`
                    } else {
                        sel = `td:visible ${sel}`
                    }

                    //We are converting to lower case because this will generally match on the instrument name (and prevent duplicate matches)
                    let selector = `tr:has(td:contains(${JSON.stringify(text)}):first:visible)`
                    element_selector = `${element_selector}:visible ${window.tableMappings['data collection instruments']}:visible ${selector}`

                    //We do this here because the value we're looking for in the assertion is the button label NOT the row label
                    text = online_buttons
                }

                cy.top_layer(sel, element_selector).then(($elm) => {
                    cy.wrap($elm).find(sel).then(($element) => {
                        if(el === 'button' && !$element.is('button')) {
                            cy.wrap($element).invoke('attr', 'value').should('include', text)
                        } else if (window.icons.hasOwnProperty(online_buttons)) {
                            cy.wrap($element).should('have.descendants', window.icons[online_buttons])
                        } else {
                            cy.wrap($element).should('contain', text)
                        }
                    })

                    if (disabled_text === "is disabled") {
                        cy.wrap($elm).find(sel).should('be.disabled')
                    }
                })
            }
        })
    }
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should )see the date( and time) {string} in the field labeled {string}
 * @param {string} date_time - the date or datetime value for the field
 * @param {string} field_label - the label of the date or datetime field
 * @description Verifies the value of the date or datetime field
 */
Given("I (should )see the date( and time) {string} in the field labeled {string}", (field_datetime, field_label) => {
    cy.get(`label:contains(${JSON.stringify(field_label)})`)
        .invoke('attr', 'id')
        .then(($id) => {
            cy.get('[name="' + $id.split('label-')[1] + '"]')
        }).invoke('val')
        .then((actualValue) => {
            expect(actualValue).to.eq(field_datetime)
        })
})

/**
 * @module Visibility
 * @author Corey DeBacker <debacker@wisc.edu>
 * @example I should NOT see a {labeledElement} labeled {string} {baseElement}
 * @param {string} labeledElement - available options: 'button', 'link'
 * @param {string} text - the label of the link that should not be seen on screen (matches partially)
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the Edit survey responses column', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @description Verifies that there are no visible elements of the specified type with the label `text`
 */
Given("I should NOT see( ){articleType}( ){labeledElement} {labeledExactly} {string}{baseElement}", (article_type, el, labeled_exactly, text, base_element) => {
    //This is to accommodate for aliases such as "toggle button" which is actually a checkbox behind the scenes
    el = window.checkBoxAliases.hasOwnProperty(el) ? window.checkBoxAliases[el] : el

    // double quotes need to be re-escaped before inserting into :contains() selector
    text = text.replaceAll('\"', '\\\"')
    let subsel = {'link':'a', 'button':'button', 'field': 'tr','checkbox':'input'}[el]
    let sel = `${subsel}:contains("${text}"):visible` + (el === 'button' ? `,input[value="${text}"]:visible` : '')
    cy.wait(2000)
    cy.get_top_layer(window.elementChoices[base_element], ($e) => {
        if(labeled_exactly === "labeled exactly" && $e.find(sel).length){

            $e.find(sel).each((index, $sel) => {
                if ($sel.tagName.toLowerCase() === 'input') {
                    expect($sel.value).not.to.equal(text);
                } else {
                    expect($sel.textContent).not.to.equal(text)
                }
            })

        } else {
            expect($e.find(sel)).to.have.lengthOf(0)
        }
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see a(n) {string} within the {string} row of the column labeled {string} {tableName}
 * @param {string} table_item - the item that you are searching for - includes "checkmark", "x", or any {string}
 * @param {string} row_label - the label of the table row
 * @param {string} column_label - the label of the table column
 * @param {string} tableName - available options: '', ' of the User Rights table', ' of the Reports table', ' of the Participant List table'
 * @description Identifies specific text or special item within a cell on a table based upon row and column labels
 */
Given("I (should )see (a )(an ){string} within the {string} row of the column labeled {string}{tableName}", (item, row_label, column_label, table) => {
    if(Cypress.$('div#working').length) cy.get('div#working').should('not.be.visible')
    if(Cypress.$('div#report_load_progress').length) cy.get('div#report_load_progress').should('not.be.visible')

    const user_rights = { "checkmark" : `img[src*="tick"]`, "x" : `img[src*="cross"]` }

    let table_selector = 'table:visible'
    let table_body = 'table:visible'
    let no_col_match = false

    if(table === ' of the Participant List table'){
        table_selector = window.tableMappings['participant list'][0]
        table_body = window.tableMappings['participant list'][1]
        no_col_match = true
    } else if (table === ' of the User Rights table'){
        table_selector = 'table:visible'
        table_body = 'table#table-user_rights_roles_table:visible'
        no_col_match = true
    } else if (table === ' of the Reports table'){
        table_selector = window.tableMappings['report data'][0]
        table_body = window.tableMappings['report data'][1]
        no_col_match = true
    }

    cy.table_cell_by_column_and_row_label(column_label, row_label, table_selector, 'th', 'td', 0, table_body, no_col_match).then(($td) => {
        if(table === " of the User Rights table" && item.toLowerCase() in user_rights) {
            cy.wrap($td.find(user_rights[item.toLowerCase()]).length).should('have.length', 1)
        } else if(table === " of the Participant List table" && item.toLowerCase() in window.participantListIcons){
            cy.wrap($td.find(window.participantListIcons[item.toLowerCase()])).should('have.length', '1')
        } else {
            expect($td).to.contain(item)
        }
    })
})

/**
 * @module Visibility
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @example I should see {string} in (the) {tableTypes} table
 * @param {string} text - text to look for
 * @param {string} tableTypes - available options: 'a', 'logging', 'browse users', 'file repository', 'administrators', 'reports', 'report data', 'define events', 'data access groups', 'DAGs Switcher', 'record status dashboard', 'data collection instruments', 'codebook', 'import data display', 'participant list', 'user rights', 'record locking', 'e-signature and locking management', 'record home page'
 * @description Identify specific text within a table
 */
Given('I should see {string} in (the ){tableTypes} table', (text, table_type = 'a') => {
    cy.not_loading()
    let selector = window.tableMappings[table_type]
    cy.get(`${selector}:visible`).contains('td', text, { matchCase: false })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see Project status: "{projectStatus}"
 * @param {string} projectStatus - available options: 'Production', 'Development', 'Analysis/Cleanup'
 * @description Identify project status
 */
/* This method is defined inside "I should see (a)(the) {labeledElement} labeled {string} {baseElement}" */

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see (a) table {headerOrNot} row(s) containing the following values in (the) {tableTypes} table {baseElement}:
 * @param {string} headerOrNot - available options: 'header and', 'header'
 * @param {string} tableTypes - available options: 'a', 'logging', 'browse users', 'file repository', 'administrators', 'reports', 'report data', 'define events', 'data access groups', 'DAGs Switcher', 'record status dashboard', 'data collection instruments', 'codebook'
 * @param {string} baseElement - available options: ' on the tooltip', ' in the tooltip', ' on the role selector dropdown', ' in the role selector dropdown', ' on the dialog box', ' in the dialog box', ' within the data collection instrument list', ' on the action popup', ' in the action popup', ' in the Edit survey responses column', ' in the "Main project settings" section', ' in the "Use surveys in this project?" row in the "Main project settings" section', ' in the "Use longitudinal data collection with defined events?" row in the "Main project settings" section', ' in the "Use the MyCap participant-facing mobile app?" row in the "Main project settings" section', ' in the "Enable optional modules and customizations" section', ' in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section', ' in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section', ' in the "Scheduling module (longitudinal only)" row in the "Enable optional modules and customizations" section', ' in the "Randomization module" row in the "Enable optional modules and customizations" section', ' in the "Designate an email field for communications (including survey invitations and alerts)" row in the "Enable optional modules and customizations" section', ' in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section', ' in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section', ' in the validation row labeled "Code Postal 5 caracteres (France)"', ' in the validation row labeled "Date (D-M-Y)"', ' in the validation row labeled "Date (M-D-Y)"', ' in the validation row labeled "Date (Y-M-D)"', ' in the validation row labeled "Datetime (D-M-Y H:M)"', ' in the validation row labeled "Datetime (M-D-Y H:M)"', ' in the validation row labeled "Datetime (Y-M-D H:M)"', ' in the validation row labeled "Datetime w/ seconds (D-M-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (M-D-Y H:M:S)"', ' in the validation row labeled "Datetime w/ seconds (Y-M-D H:M:S)"', ' in the validation row labeled "Email"', ' in the validation row labeled "Integer"', ' in the validation row labeled "Letters only"', ' in the validation row labeled "MRN (10 digits)"', ' in the validation row labeled "MRN (generic)"', ' in the validation row labeled "Number"', ' in the validation row labeled "Number (1 decimal place - comma as decimal)"', ' in the validation row labeled "Number (1 decimal place)"', ' in the validation row labeled "Number (2 decimal places - comma as decimal)"', ' in the validation row labeled "Number (2 decimal places)"', ' in the validation row labeled "Number (3 decimal places - comma as decimal)"', ' in the validation row labeled "Number (3 decimal places)"', ' in the validation row labeled "Number (4 decimal places - comma as decimal)"', ' in the validation row labeled "Number (4 decimal places)"', ' in the validation row labeled "Number (comma as decimal)"', ' in the validation row labeled "Phone (Australia)"', ' in the validation row labeled "Phone (North America)"', ' in the validation row labeled "Phone (UK)"', ' in the validation row labeled "Postal Code (Australia)"', ' in the validation row labeled "Postal Code (Canada)"', ' in the validation row labeled "Postal Code (Germany)"', ' in the validation row labeled "Social Security Number (U.S.)"', ' in the validation row labeled "Time (HH:MM:SS)"', ' in the validation row labeled "Time (HH:MM)"', ' in the validation row labeled "Time (MM:SS)"', ' in the validation row labeled "Vanderbilt MRN"', ' in the validation row labeled "Zipcode (U.S.)"'
 * @param {dataTable} options the Data Table of values specified
 * @description Allows us to check tabular data rows within REDCap
 */
Given('I (should )see (a )table( ){headerOrNot}( row)(s) containing the following values in (the ){tableTypes} table{baseElement}:', (header, table_type = 'a', base_element, dataTable) => {
    cy.not_loading()

    cy.url().then((currentUrl) => {
        cy.get('body').then(($body) => {
            if ($body.find('.dataTables_processing').length > 0) {
                cy.url().should('eq', currentUrl).then(() => {
                    cy.get('.dataTables_processing').should('have.css', 'display', 'none');
                })
            }
        })
    })

    //Determine if records exist
    const records = Cypress.$('td.data:has(:contains("No records exist"))')

    //If records do NOT exist, do not bother looking for data tables to load!
    if(records.length === 0){
        cy.wait_for_datatables().assertWindowProperties()
    }

    let selector = window.tableMappings[table_type]
    let tabular_data = dataTable['rawTable']
    let html_elements = window.tableHtmlElements

    let header_table = selector
    let main_table = selector

    //This is to account for weird cases where DataTables are present (in REDCap)
    if(Array.isArray(selector)){
        header_table = selector[0]
        main_table = selector[1]
    }
    //We will first try to match on exact match, then substring if no match
    function exactMatch(label, header, columns, colSpan, rowSpan, count){
        header.forEach((heading) => {
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
            const exactPattern = new RegExp(`^${escapedLabel}$`)
            if(exactPattern.test(heading) && columns[heading].match_type === 'none' && label !== ""){
                columns[heading] = { col: count, match_type: 'exact', colSpan: colSpan, rowSpan: rowSpan }
            }
        })
    }

    function subMatch(label, header, columns, colSpan, rowSpan, count){
        header.forEach((heading) => {
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const substringPattern = new RegExp(escapedLabel);
            const substringNoCase = new RegExp(escapedLabel, 'i');
            const reverseMatch = new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            if(columns[heading].match_type === 'none' && label !== ""){
                if (substringPattern.test(heading)){
                    columns[heading] = { col: count, match_type: 'sub', colSpan: colSpan, rowSpan: rowSpan }
                } else if (substringNoCase.test(heading)){
                    columns[heading] = { col: count, match_type: 'sub_no_case', colSpan: colSpan, rowSpan: rowSpan }
                } else if (reverseMatch.test(label)){
                    columns[heading] ={ col: count, match_type: 'reverse', colSpan: colSpan, rowSpan: rowSpan }
                }
            }
        })
    }

    function findColumnHeaders(header_selector, $cells, header, columns) {
        let count = 0
        let prevColSpan = 1
        cy.wrap($cells).find(`td,th`).each(($cell, i, cells) => {
            let colSpan = parseInt($cell.attr('colspan'))
            let rowSpan = parseInt($cell.attr('rowspan'))

            count += prevColSpan //We need to find the number of cells to span across

            //Handle weird nested columns
            if (colSpan > 1 && rowSpan === 1) {
                let freeze_count = count

                if(table_type !== "report data") header_selector = header_selector.replace('tr', '')

                //Notice how we don't want to use TR here
                cy.get(`${header_selector} tr:nth-child(2) th[rowspan=1]`).each((c) => {
                    cy.wrap(c).then(($t) => {
                        let ls = $t[0].innerText.split("\n")
                        ls.forEach((label, index) => {
                            exactMatch(label, header, columns, 1, 1, freeze_count)
                        })
                        freeze_count += 1
                    })
                })
            }
            prevColSpan = colSpan

        }).then(() => {
            count = 0
            prevColSpan = 1
            let prevRowSpan = 1

            cy.wrap($cells).find(`td,th`).each(($cell, i, cells) => {
                let labels = $cell[0].innerText.split("\n")
                let colSpan = parseInt($cell.attr('colspan')) || 1
                let rowSpan = parseInt($cell.attr('rowspan')) || 1
                if(records.length && prevRowSpan === 1 || records.length === 0){
                    count += prevColSpan //We need to find the number of cells to span across
                }
                labels.forEach((label) => {
                    exactMatch(label, header, columns, colSpan, rowSpan, count)
                })
                prevColSpan = colSpan
                prevRowSpan = rowSpan
            })
        }).then(() => {
            count = 0
            prevColSpan = 1

            cy.wrap($cells).find(`td,th`).each(($cell, i, cells) => {
                let labels = $cell[0].innerText.split("\n")
                let colSpan = parseInt($cell.attr('colspan')) || 1
                let rowSpan = parseInt($cell.attr('rowspan')) || 1
                count += prevColSpan //We need to find the number of cells to span across
                labels.forEach((label) => {
                    subMatch(label, header, columns, colSpan, rowSpan, count)
                })
                prevColSpan = colSpan
            })

        }).then(() => {
            //console.log(columns)
        })
    }

    //If we are including the table header, we are also going to match specific columns
    if(header === "header and") {
        let columns = {}
        let header = tabular_data[0]

        let selector = `${header_table}:visible`
        let outer_element = cy.top_layer(selector, window.elementChoices[base_element])

        let header_selector = `${selector} tr`
        if(table_type === "report data") header_selector = `${selector} `

        header.forEach((heading, index) => {
            header_selector += ':has('
            heading.split(' ').forEach((head) => {
                header_selector += `:contains(${JSON.stringify(head)})`
            })
            header_selector += ')'
        })

        header.forEach((heading, index) => {
            columns[heading] = {match_type: 'none'}
        })

        outer_element.within(() => {
            cy.get(header_selector, {timeout: 20000}).then(($cells) => {
                findColumnHeaders(header_selector, $cells, header, columns)
            }).then(() => {
                //console.log(columns)
                let filter_selector = []
                dataTable.hashes().forEach((row, row_index) => {
                    for (const [index, key] of Object.keys(row).entries()) {
                        let value = row[key]
                        let column = columns[key].col
                        if (!isNaN(column)) {

                            let contains = ''

                            if(Object.keys(html_elements).includes(value)) {
                                contains += `td:has(${html_elements[value].selector}),th:has(${html_elements[value].selector})`
                            } else if (window.dateFormats.hasOwnProperty(value)) {
                                contains += `td,th`
                            } else {
                                value.split(' ').forEach((val) => {
                                    if(Object.keys(html_elements).includes(val)) {
                                        contains += `td:has(${html_elements[val].selector}),th:has(${html_elements[val].selector})`
                                    } else if (window.dateFormats.hasOwnProperty(val)){
                                        contains += `td,th`
                                    } else{
                                        contains += `:contains(${JSON.stringify(val)})`
                                    }
                                })
                            }

                            filter_selector.push({
                                'column': column,
                                'row': row_index,
                                'value': value,
                                'html_elm': Object.keys(html_elements).includes(value),
                                'regex': window.dateFormats.hasOwnProperty(value),
                                'selector': `:has(${contains})`
                            })

                            // let contains = ''
                            // value.split(' ').forEach((val) => {
                            //     contains += `:contains(${JSON.stringify(val)})`
                            // })
                            //
                            // filter_selector.push({
                            //     'column': column,
                            //     'row': row_index,
                            //     'value': value,
                            //     'html_elm': Object.keys(html_elements).includes(value),
                            //     'regex': window.dateFormats.hasOwnProperty(value),
                            //     'selector': Object.keys(html_elements).includes(value) ?
                            //         `:has(td:has(${html_elements[value].selector}),th:has(${html_elements[value].selector}))` :
                            //         `:has(${window.dateFormats.hasOwnProperty(value) ? 'td,th' : contains})`
                            // })
                        }
                    }
                })

                //See if at least one row matches the criteria we are suggesting
                //console.log(filter_selector)
                let row_selector = []
                filter_selector.forEach((item) => {
                    row_selector[item.row] = (row_selector.hasOwnProperty(item.row)) ?
                        `${row_selector[item.row]}${item.selector}` :
                        `${main_table}:visible tr${item.selector}`
                })

                row_selector.forEach((row, row_number) => {
                    cy.get(row).should('have.length.greaterThan', 0).then(($row) => {
                     filter_selector.forEach((item) => {
                            if(item.row === row_number){
                                //Big sad .. cannot combine nth-child and contains in a pseudo-selector :(
                                //We can get around this by finding column index and looking for specific column value within a row
                                cy.wrap($row).find(`td:nth-child(${item.column}),th:nth-child(${item.column})`).each(($cell) => {
                                    //console.log(item)
                                    if (item.html_elm) {
                                        cy.wrap($cell).find(html_elements[item.value].selector).should(html_elements[item.value].condition)
                                    } else if (item.regex) {
                                        expect($cell[0].innerText.trim()).to.match(window.dateFormats[item.value])
                                    } else if ($cell[0].innerText.includes(item.value)) {
                                        expect($cell[0].innerText.trim()).to.contain(item.value)
                                    }
                                })
                            }
                        })
                    })
                })
            })
        })

    //Only matching on whether this row exists in the table.  Cells are in no particular order because we have no header to match on.
    } else if (header === "header") {

        let selector = `${header_table}:visible`

        let outer_element = base_element.length > 0 ?
            cy.top_layer(selector, window.elementChoices[base_element]) :
            cy.top_layer(selector)

        outer_element.within(() => {
            tabular_data.forEach((row) => {
                let row_selector = 'tr'
                row.forEach((element) => {
                    const containsStatements = element.split(/\n/) //This handles splitting values for us
                    containsStatements.forEach((statement) => {
                        if (statement.trim() !== "") {
                            row_selector += `:has(th:contains(${JSON.stringify(statement)}))`;
                        }
                    })
                })
                cy.get(row_selector).should('have.length.greaterThan', 0)
            })
        })

    } else {

        let selector = `${header_table}:visible`

        let outer_element = base_element.length > 0 ?
            cy.top_layer(selector, window.elementChoices[base_element]) :
            cy.top_layer(selector)

        outer_element.within(() => {
            tabular_data.forEach((row) => {
                let row_selector = 'tr'
                row.forEach((element) => {
                    if(!window.dateFormats.hasOwnProperty(element)) {
                        row_selector += `:has(td:contains(${JSON.stringify(element)}))`
                    }
                })
                cy.get(row_selector).should('have.length.greaterThan', 0)
            })
        })
    }
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see the pdf has loaded in the iframe
 * @description Allows us to check whether PDF has loaded in iframe
 */
Given("I (should )see the pdf has loaded in the iframe", () => {
    cy.frameLoaded()
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should )(NOT) see the lock image for Record ID {string}
 * @param {string} notSee - available options: '', 'should NOT', 'should no longer', 'no longer'
 *
 * @description Determine whether the lock image is visible or not for a given record
 */
Given("I (should ){notSee}( )see the lock image for Record ID {string}", (not, record_id) => {
    cy.not_loading()

    cy.get('div#record_display_name').then((record_id) =>{
        if(not === "should NOT" || not === "should no longer" || not === "no longer"){
            expect(record_id).to.not.have.descendants('img[src*=lock]')
        } else {
            expect(record_id).to.have.descendants('img[src*=lock]')
        }
    })
})


/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should )(NOT) see the lock image for the Data Collection Instrument labeled {string} for event {string} on the Record Home Page
 * @param {string} notSee -
 * @param {string} recordId - ID of the record we are focused on
 * @param {string} instrument - instrument we are focused on
 * @param {string} event - event we are focused on
 * @description Determine whether the lock image is visible or not for a given record
 */
Given("I (should ){notSee} see the lock image on the Record Home Page for the Data Collection Instrument labeled {string} for event {string}", (not, instrument, event) => {
    cy.not_loading()

    cy.table_cell_by_column_and_row_label(event, instrument, '#event_grid_table').then((record_id) => {
        if(not === "should NOT" || not === "should no longer" || not === "no longer"){
            expect(record_id).to.not.have.descendants('img[src*=lock]')
        } else {
            expect(record_id).to.have.descendants('img[src*=lock]')
        }
    })
})
