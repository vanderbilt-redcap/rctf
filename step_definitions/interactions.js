function performAction(action, element, elementStatus){
    element = cy.wrap(element)
    if(action === 'click on'){
        element.then(element => {
            let force = false
            if(element.closest('.rc-instance-selector-status-icon')){
                force = true
            }

            cy.wrap(element).click({force: force})
        })
    }
    else if(action === 'check'){
        element.check()
    }
    else if(action === 'uncheck'){
        element.uncheck()
    }
    else if(action === 'should see'){
        element.should('be.visible')

        if (elementStatus === "that is disabled") {
            element.should('be.disabled')
        }
        else if (elementStatus === "that is checked") {
            element.should("be.checked")
        }
        else if (elementStatus === "that is unchecked") {
            element.should("not.be.checked")
        }
    }
    else{
        throw 'Action not found: ' + action
    }
}

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentSaveOptions
 * @description Clicks a specific submit option to save a record on a Data Collection Instrument
 */
 Given("I select the submit option labeled \"{instrumentSaveOptions}\" on the Data Collection Instrument", (text) => {

     //REDCap does some crazy conditional display of buttons, so we try to handle that as we best can
     cy.get('tr#__SUBMITBUTTONS__-tr').within(() => {
         let btn = Cypress.$("button:contains(" + JSON.stringify(text) + ")");

         //If the button shows up on the main section, we can click it like a typical element
         if(btn.length){

             cy.wrap(btn[0]).click()

         //If the button does NOT show up on main section, let's find it in the dropdown section
         } else {

             cy.get('button#submit-btn-dropdown').
                first().
                click().
                closest('div').
                find('a').
                contains(text).
                should('be.visible').
                click()
         }
     })
 })

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} articleType
 * @param {string} ordinal
 * @description Clicks on a button element with a specific text label.
 */
Given("I click on( ){articleType}( ){ordinal}( )button labeled {string} and will leave the tab open when I return to the REDCap project", (article_type, ordinal, text) => {
    cy.then(() => {
        let ord = 0
        if(ordinal !== undefined) ord = window.ordinalChoices[ordinal]

        cy.getLabeledElement('button', text, ordinal).then($button => {
            if(text.includes("Open public survey")){ //Handle the "Open public survey" and "Open public survey + Logout" cases
                window.openNextClickInNewTab = true
            }

            cy.wrap($button).click()
        })
    })
})

/**
 * @module Interactions
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} text - the text on the button element you want to click
 * @param {string} label - the lable of the row with the button you want to click
 * @description Clicks on a button element with a specific text title inside the table row label
 */
Given("I click on the button labeled {string} for the row labeled {string}", (text, label) => {
    // Find the cell that contains the label and find the parent
    cy.get('td').contains(label).parents('tr').within(() => {
        // Find the button element
        cy.get('button[title="' + text +'"]').click()
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} label - the label of the field
 * @param {string} baseElement
 */
Given('I {enterType} {string} (into)(is within) the( ){ordinal}( ){inputType} field( ){columnLabel}( ){labeledExactly} {string}{baseElement}{iframeVisibility}', enterTextIntoField)

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} label - the label of the field
 * @param {string} baseElement
 */
Given('I enter the code that was emailed to the current user into the( ){ordinal}( ){inputType} field( ){columnLabel}( ){labeledExactly} {string}{baseElement}{iframeVisibility}', (...args) => {
    const getCodeFromEmail = () => {
        return cy.request('http://localhost:8025/api/v1/messages').then(response => {
            // Make null the default return value & override any previous subject
            cy.wrap(null)

            const messages = response.body 
            if(messages.length === 0){
                // Maybe it hasn't come through yet.  Return to retry.
                return
            }

            const lastMessage = messages[0].Content

            const timeSinceSent = Date.now() - new Date(lastMessage.Headers.Date)
            if(timeSinceSent > 10000){
                // Ignore any old emails
                return
            }
            
            let code = null
            lastMessage.Body.split('\r').forEach(line => {
                if(code === null && line.includes('verification code is')){
                    code = line.split(' ').at(-1)
                }
            })

            cy.wrap(code)
        })
    }

    let triesLeft = 10
    const getSentEmails = () => {
        getCodeFromEmail().then(code => {
            if(!code){
                if(triesLeft-- > 0){
                    cy.wait(1000)
                    getSentEmails()
                }
                else{
                    throw 'Could not find a recent message containing an authentication code: ' + lastMessage
                }
            }
            else{
                args.unshift(code)
                args.unshift('enter')
                enterTextIntoField(...args)
            }
        })
    }

    getSentEmails()
})

function enterTextIntoField(enter_type, text, ordinal, input_type, column, labeled_exactly, label, base_element, iframe){
    let select = 'input[type=text]:visible,input[type=password]:visible'

    // Also look for inputs that omit a "type", like "Name of trigger"
    select += ',input:not([type]):visible'

    if(input_type === 'password'){
        select = 'input[type=password]:visible'
    }

    let ord = 0
    if(ordinal !== undefined) ord = window.ordinalChoices[ordinal]

    if(iframe === " in the iframe"){
        const base = cy.frameLoaded().then(() => { cy.iframe() })

        if(input_type === 'password'){
            select = 'input[type=password]:visible'
        } else {
            select = `input[type=text]:visible,input[type=password]:visible`
        }
        base.within(() => {
            let elm = cy.getLabeledElement('input', label)

            if(enter_type === "enter"){
                elm.eq(ord).scrollIntoView().type(text)
            } else if (enter_type === "clear field and enter") {
                elm.eq(ord).scrollIntoView().clear().type(text)
            } else if (enter_type === "verify"){
                elm.eq(ord).scrollIntoView().invoke('val').should('include', text)
            }
        })

    } else if (column === 'in the Matrix column') {

        cy.table_cell_by_column_and_row_label(label, '', 'table', 'td', 'td', ord, 'table.addFieldMatrixRowParent', true).then(($td) => {
            if(enter_type === "enter"){
                cy.wrap($td).find('input:visible').type(text)
            } else if (enter_type === "clear field and enter") {
                cy.wrap($td).find('input:visible').clear().type(text)
            }
        })

    } else {
        const elm = cy.getLabeledElement('input', label, ordinal)

        if (enter_type === "enter" || enter_type === "clear field and enter") {
            // Sometimes cypress will struggle to scroll a field into view and hang on the clear() call if we don't focus it first.
            elm.focus()

            /**
             * Clearing is important to replace what is there, but also to support "text === ''"
             */
            elm.clear()
            if(text !== ''){
                /**
                 * Blur after typing to trigger changes events (e.g. C.3.31.2500)
                 */
                elm.type(text).blur()
            }
        } else if (enter_type === "verify"){
            if(window.dateFormats.hasOwnProperty(text)){
                //elm.invoke('val').should('match', window.dateFormats[text])
            } else {
                elm.invoke('val').should('include', text)
            }
        }
    }
}

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} text - the text to enter into the field
 * @param {string} label - the label of the field
 * @param {string} baseElement
 * @description Enters a specific text string into a field identified by a label.  (NOTE: The field is not automatically cleared.)
 */

Given ('I {enterType} {string} in(to) the( ){ordinal}( )textarea field {labeledExactly} {string}{baseElement}', (enter_type, text, ordinal, labeled_exactly, label, base_element) => {
    let sel = `:contains(${JSON.stringify(label)}):visible`

    let ord = 0
    if(ordinal !== undefined) ord = window.ordinalChoices[ordinal]

    let element = `textarea`

    //Turns out the logic editor uses a DIV with an "Ace Editor" somehow /shrug
    let next
    if(label === "Logic Editor") {
        element = `div#rc-ace-editor div.ace_line`
        enter_type = 'clear field and enter'
        next = cy.get(sel).last()
    }
    else{
        next = cy.getLabeledElement(element, label, ordinal)
    }

    //Either the base element as specified or the default
    let outer_element = base_element.length > 0 ?
        cy.top_layer(sel, window.elementChoices[base_element]) :
        cy.top_layer(sel)

    outer_element.within(() => {
        let elm = null

        next.then((elementReference) => {
            cy.wrap(elementReference).parent().then(($parent) =>{
                if($parent.find(element).eq(ord).length){

                    //If the textarea has a TinyMCE editor applied to it
                    if(elementReference.hasClass('mceEditor') && elementReference[0].style.display === 'none'){
                       cy.customSetTinyMceContent($parent.find(element).eq(ord).attr('id'), text)

                        //All other cases
                    } else {
                        elm = cy.wrap($parent).find(element).eq(ord)

                        if(enter_type === "enter"){
                            elm.type(text)
                        } else if (enter_type === "clear field and enter") {
                            elm.clear().type(text)
                        } else if(enter_type === "click on"){
                            elm.click()
                        }
                    }


                } else if ($parent.parent().find(element).eq(ord).length) {

                    //If the textarea has a TinyMCE editor applied to it
                    if($parent.parent().find(element).eq(ord).hasClass('mceEditor')){
                        cy.customSetTinyMceContent($parent.parent().find(element).eq(ord).attr('id'), text)

                    //All other cases
                    } else {
                        if(enter_type === "enter"){
                            cy.wrap($parent).parent().find(element).eq(ord).type(text)
                        } else if (enter_type === "clear field and enter") {

                            //Logic editor does not use an actual textarea; we need to invoke the text instead!
                            if(label === "Logic Editor"){
                                cy.wrap($parent).parent().find(element).eq(ord).
                                    click({force: true}).
                                    invoke('attr', 'contenteditable', 'true').
                                    type(`{selectall} {backspace} {backspace} ${text}`, {force: true})

                                /**
                                 * This popup might still incorrectly remain displayed depending on timing.
                                 * Manually hide it to ensure consistent behavior.
                                 */
                                Cypress.$('#LSC_id_pdfsnapshotlogic').hide()
                            } else {
                                cy.wrap($parent).parent().find(element).eq(ord).clear().type(text)
                            }

                        } else if(enter_type === "click on"){
                            cy.wrap($parent).parent().find(element).eq(ord).click()
                        }
                    }
                }
            })
        })
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} text - the text to enter into the field
 * @param {string} label - the label of the field
 * @description Enters a specific text string into a field identified by a label.  (NOTE: The field is not automatically cleared.)
 */
Given('I {enterType} {string} (is within)(into) the data entry form field labeled {string}', (enter_type, text, label) => {
    let contains = ''
    label.split(' ').forEach((val) => {
        contains += `:has(:contains(${JSON.stringify(val)}))`
        label = val
    })
    let outer_element = `tr${contains}:has(input[type=text],textarea):visible:first`

    cy.get(outer_element).within(() => {
        //Note that we CLICK on the field (to select it) BEFORE we type in it - otherwise the text ends up somewhere else!
        if(enter_type === "verify") {
            let elm = cy.get(`label:contains(${JSON.stringify(label)})`)
                .invoke('attr', 'id')
                .then(($id) => {
                    cy.get('[name="' + $id.split('label-')[1] + '"]')
                })

            if(window.dateFormats.hasOwnProperty(text)){
                elm.invoke('val').should('match', window.dateFormats[text])
            } else {
                elm.invoke('val').should('include', text)
            }

        } else if(enter_type === "clear field and enter"){

            if(text === ""){
                cy.get(`label:contains(${JSON.stringify(label)})`)
                    .invoke('attr', 'id')
                    .then(($id) => {
                        cy.get('[name="' + $id.split('label-')[1] + '"]')
                    })
                    .click()
                    .clear()
                    .blur() //Remove focus after we are done so alerts pop up
            } else {
                cy.get(`label:contains(${JSON.stringify(label)})`)
                    .invoke('attr', 'id')
                    .then(($id) => {
                        cy.get('[name="' + $id.split('label-')[1] + '"]')
                    })
                    .click()
                    .clear()
                    .type(text)
                    .blur() //Remove focus after we are done so alerts pop up
            }

        } else {
            cy.get(`label:contains(${JSON.stringify(label)})`)
                .invoke('attr', 'id')
                .then(($id) => {
                    cy.get('[name="' + $id.split('label-')[1] + '"]')
                })
                .click()
                .type(text)
                .blur() //Remove focus after we are done so alerts pop up
        }
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field to select
 * @description Clears the text from an input field based upon its label
 */
Given('I clear the field labeled {string}', (label) => {
    cy.getLabeledElement('input', label).then(element =>{
        cy.wrap(element).clear()
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} clickType
 * @param {string} elmType
 * @param {string} label - the label associated with the checkbox field
 * @description Selects a checkbox field by its label
 */
Given("I {clickType} the {elmType} element labeled {string}", (click_type, element_type, label) => {
    cy.contains(label).then(($label) => {
        if(element_type === 'input'){
            cy.wrap($label).parent().find('input').click()
        } else if(element_type === 'checkbox'){
            if(click_type === "click on"){
                cy.wrap($label).parent().find('input[type=checkbox]').click()
            } else if (click_type === "check"){
                cy.wrap($label).parent().find('input[type=checkbox]').check()
            } else if (click_type === "uncheck"){
                cy.wrap($label).parent().find('input[type=checkbox]').uncheck()
            }
        } else if (element_type === "list item"){
            cy.get('li').contains(label).click()
        } else if (element_type === "span"){
            cy.get('span').contains(label).click()
        }
    })
})

/**
 * @module Interactions
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} name - the name attribute of the input file field
 * @param {string} path - the path of the file to upload
 * @param {string} baseElement
 * @description Selects a file path to upload into input named name
 */
Given("I set the input file field named {string} to the file at path {string}{baseElement}", (name, path, base_element) => {
    let sel = 'input[name=' + name + ']'

    //Either the base element as specified or the default
    let outer_element = base_element.length > 0 ?
        cy.top_layer(sel, window.elementChoices[base_element]) :
        cy.top_layer(sel)

    outer_element.within(() => {
        cy.get('input[name=' + name + ']').then(($field) => {
            cy.wrap($field).selectFile(path)
        })
    })
})

/**
 * @module Interactions
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} text - the text to enter into the field
 * @param {string} selector - the selector of the element to enter the text into
 * @param {string} label - the label associated with the field
 * @description Selects an input field by its label and then by selector
 */
Given('I enter {string} into the field identified by {string} labeled {string}', (text, selector, label) => {
    // Method is because the input on Edit Reports doesn't have a label
    // Find the cell that contains the label and find the parent
    cy.get('td').contains(label).parents('tr').within(() => {
        cy.get(selector).type(text)
    })
})

/**
 * @module Interactions
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @param {string} value - type of export
 * @param {int} num - expect this many records
 * @description Exports all data in selected export type
 */
 Given('I export all data in {string} format and expect {int} record(s)', (value, num) => {
    cy.get('tr#reprow_ALL').find('button.data_export_btn').should('be.visible').contains('Export Data').click()
    cy.get('input[value='+value+']').click()
    cy.export_csv_report().should((csv) => {
        expect([...new Set(csv.map((row) => row[0]).slice(1))]).to.have.lengthOf(num)                     // 2 records
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} value - text that is inside the element
 * @description Clicks the element that contains the text specified
 */
Given('I click the element containing the following text: {string}', (value) => {
    cy.get(':contains("' + value + '"):visible:last').click()
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} option - option we want to select from the radio options
 * @param {string} field_label - the label on the field we want to select
 * @description Clicks the radio option on the field specified
 */
Given('I select the radio option {string} for the field labeled {string}{baseElement}', (radio_option, field_label, base_element) => {
    let outer_element = base_element.length > 0 ?  window.elementChoices[base_element]: window.elementChoices['']
    cy.get(outer_element).within(() => {
        cy.select_radio_by_label(field_label, radio_option)
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} dropdown_option - option we want to select from the dropdown
 * @param {string} field_label - the label on the field we want to select
 * @description Clicks the dropdown option on the field specified
 */
Given('I select the dropdown option {string} for the Data Collection Instrument field labeled {string}', (dropdown_option, field_label) => {
    cy.select_field_by_label(field_label).select(dropdown_option)
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} checkbox_option - option we want to select from the dropdown
 * @param {string} field_label - the label on the field we want to select
 * @description Clicks the dropdown option on the field specified
 */
Given('I select the checkbox option {string} for the field labeled {string}', (checkbox_option, field_label) => {
    cy.select_checkbox_by_label(field_label, checkbox_option)
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} text - the text to enter into the field
 * @param {string} ordinal
 * @param {string} dropdownType
 * @param {string} label - the label of the field
 * @param {string} baseElement
 * @description Selects a specific item from a dropdown
 */
Given('I select {string} (in)(on) the{ordinal} {dropdownType} (field labeled)(of the open date picker widget for) {string}{baseElement}', (option, ordinal, type, label, base_element) => {
    cy.not_loading()
    let outer_element = window.elementChoices[base_element]
    let label_selector = `:contains(${JSON.stringify(label)}):visible`
    if(type === "dropdown" || type === "multiselect"){
        const action = ($select) => {
                cy.wrap($select).scrollIntoView().
                should('be.visible').
                should('be.enabled').then(($t) => {

                    if(type === "dropdown") {
                        cy.wait(500)
                        cy.wrap($t).select(option, { force: true }) //force: true needed for Select2 library
                        cy.wait(500)
                    } else if (type === "multiselect"){
                        let all_options = [option]

                        const options = Cypress.$($t).find('option:selected')
                        if(options.length) {
                            options.each((index, element) => {
                                all_options.push(Cypress.$(element).text())
                            })
                        }

                        cy.wrap($t).select(all_options)
                    }
                })
        }

        if(type === "dropdown"){
            if(label.startsWith('datetime')){
                // For "of the open date picker widget for" syntax
                cy.get(`#ui-datepicker-div option:contains(${JSON.stringify(option)})`).closest('select').then(action)
            }
            else{
                cy.getLabeledElement(type, label, ordinal, option).then(optionElement =>{
                    /**
                     * getLabeledElement() returns an <option> element when the 'option' argument is specified
                     * It's text may be slightly different than what is specified in the step.
                     * For example, it may use '&nbsp;' rather than a space like in B.6.7.1900.
                     * The cy.select() method only matches exact text,
                     * so use to value of the <option> element returned instead 
                     * Using '.trim()' is required as cy.select() seems to trim all options when looking for a match.
                     */
                    option = optionElement[0].textContent.trim()
                    action(optionElement.closest('select'))
                })
            }
        }
        else{
            let element_selector = `select:has(option:contains(${JSON.stringify(option)})):visible:enabled`
            cy.top_layer(label_selector, outer_element).within(() => {
                cy.get_labeled_element(element_selector, label, option).then(action)
            })
        }
    } else if(type === "radio" || type === "checkboxes"){
        if(type === "checkboxes"){ type = 'checkbox' }
        let label_selector = `:contains(${JSON.stringify(label)}):visible input[type=${type}]:visible:not([disabled])`
        let selector = cy.get_labeled_element(label_selector, option, null, false)
        cy.top_layer(label_selector, outer_element).within(() => {
            selector.scrollIntoView().check()
        })
    }
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} timeType
 * @description Waits for specified number of second(s)/minute(s) before allowing anything else to happen
 */
Given("I wait for (another ){int} {timeType}", (time, unit) => {
    window.shouldShowAlerts = true
    
    let millis
    if(unit === "second" || unit === "seconds"){
        millis = time * 1000
    } else if (unit === "minute" || unit === "minutes"){
        millis = time * 60000
    }

    cy.wait(millis).then(() => {
        window.shouldShowAlerts = false
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} text - the text to enter into the field
 * @param {string} placeholder - the text that is currently in the field as a placeholder
 * @description Enter text into a specific field
 */
Given("I {enterType} {string} into the field with the placeholder text of {string}", (enter_type, text, placeholder) => {
    const selector = 'input[placeholder="' + placeholder + '"]:visible,input[value="' + placeholder + '"]:visible'

    /**
     * We used to skip the clear() call and append text based on the enterType param,
     * but that caused hard to predict intermittent failures in some case.
     * Always clearing creates more consistent behavior, and is generally what the
     * user interprets the step to do anyway.
     * 
     * Some REDCap pages perform javascript background actions once a field loses focus
     * We explicitly call blur and wait to more closesly match actual user behavior
     * and prevent odd issues in Cypress (e.g. A.2.3.0200)
     */
    cy.get(selector).clear().type(text).blur().wait(100)
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Closes iframe window on the To-Do List page
 */
Given("I close the iframe window", () => {
    cy.frameLoaded()
    cy.get('div.trim-close-btn').click()
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} column - the text to enter into the field
 * @description Clicks on a specific table column
 */
Given('I click on the table heading column labeled {string}', (column) => {
    let selector = `table:has(th:contains("${column}"):visible):visible`

    cy.get(selector).then(($th) => {
        cy.wrap($th).find(`:contains("${column}"):visible:first`).click()
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} column - the text to enter into the field
 * @description Clicks on a specific table column
 */
Given('I drag the field choice labeled {string} to the box labeled "Show the field ONLY if..."', (field_choice) => {
    let field_choice_escaped = field_choice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    let selector = `ul:visible:has(li:contains(${field_choice_escaped}))`
    cy.get(selector).then(($elm) => {
        let elm = cy.wrap($elm).find(`li:contains(${field_choice_escaped})`)
        elm.scrollIntoView().dragToTarget('div#dropZone1:visible')
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} column - the text to enter into the field
 * @description Clicks on a specific table column
 */
Given('I draw a signature in the signature field area', () => {
    cy.get('div#signature-div').click()
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field
 * @param {string} position - the desired position we want to move the slider to
 * @description Moves the slider to a specific position
 */
Given('I move the slider field labeled {string} to the position of {int}', (label, position) => {
    cy.get(`label:contains(${JSON.stringify(label)})`)
        .invoke('attr', 'id')
        .then(($id) => {
            let id = $id.split('label-')[1]
            cy.get(`div[id="${id}-slider"]`).then((subject) => {

                cy.wrap(subject).find('span').trigger('mousedown', {force: true})

                //Get the current position of the slider and then increment up or down respectively
                cy.get(`input[aria-labelledby="${$id}"]`).then(($input) => {

                    cy.move_slider(subject,
                                   $input.val(),
                                   subject.attr('data-max'),
                                   subject.attr('data-min'),
                                   position)
                })
            })
        })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {int} hour - the desired hour position we want
 * @description Moves the slider to a specific position for the Hour slider
 */
Given('I move the Hour slider for the open date picker widget to {int}', (hour) => {
    cy.get('.ui_tpicker_hour').then((subject) => {
        cy.wrap(subject).find('span').trigger('mousedown', {force: true})

        //Get the current position of the slider and then increment up or down respectively
        cy.get('.ui_tpicker_time_input').then(($time) => {
            const time = $time.val().split(':')
            let $hour = time[0]
            cy.move_slider(subject, $hour, 23, 0, hour, "Hour")
        })
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {int} minute - the desired minute position we want
 * @description Moves the slider to a specific position for the Minute slider
 */
Given('I move the Minute slider for the open date picker widget to {int}', (min) => {
    cy.get('.ui_tpicker_minute').then((subject) => {
        cy.wrap(subject).find('span').trigger('mousedown', {force: true})

        //Get the current position of the slider and then increment up or down respectively
        cy.get('.ui_tpicker_time_input').then(($time) => {
            const time = $time.val().split(':')
            let $min = time[1]
            cy.move_slider(subject, $min, 59, 0, min, "Minute")
        })
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field
 * @description Open the date picker widget
 */
Given('I click on the date picker widget on the field labeled {string}', (label) => {
    cy.get(`label:contains(${JSON.stringify(label)})`)
        .invoke('attr', 'id')
        .then(($id) => {
            let id = $id.split('label-')[1]
            cy.get(`input[aria-labelledby="${$id}"]`).parent().find('img.ui-datepicker-trigger').click()
        })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field
 * @description Open the date picker widget
 */
Given('I click on the {string} button for the field labeled {string}', (button_label, label) => {
    cy.get(`label:contains(${JSON.stringify(label)})`).parentsUntil('tr').parent().within(() => {
        cy.get(`button:contains(${JSON.stringify(button_label)}):visible`).click()
    })
})

/**
 * @module Interactions
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - label on the element
 * @param {string} element - link or button
 * @param {string} table - description of the table
 * @param {dataTable} table - row(s) from the table to help us identify the row
 * @description Clicks on an element (link or button) within a specified row of a table
 */
Given("I click on the {string} {labeledElement} within (a)(the) {tableTypes} table in the following row:", (label, element, table = 'a', dataTable) => {
    const rows = dataTable['rawTable']
    const lastRow = rows[rows.length - 1]

    const subsel = {
                   'link': `a:contains(${label}):visible`,
                   'button': `button:contains(${label}):visible,input[value="${JSON.stringify(label)}"]`
                 }[element]

    const selector = window.tableMappings[table]

    const tds = lastRow.map(cell => `:contains(${JSON.stringify(cell)})`).join('')

    cy.get(`${selector}:visible tr${tds}:visible ${subsel}`).then(($elm) => {
        $elm.attr('target', '_self')
    }).click()
})

/**
 * @module Interactions
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {action} action
 * @param {articleType} articleType
 * @param {optionalLabeledElement} type - the type of element we're looking for
 * @param {optionalQuotedString} text - the label for the element
 * @param {optionalQuotedString} columnLabel
 * @param {string} rowLabel - the label of the table row
 * @param {elementStatus} elementStatus
 * @description Performs an action on a labeled element in the specified table row and/or column
 */
Given("I {action} {articleType}( ){ordinal}( ){optionalLabeledElement}( )(labeled ){optionalQuotedString}( )(in the )(column labeled ){optionalQuotedString}( and the )(row labeled ){optionalQuotedString}( ){elementStatus}", (action, articleType, ordinal, labeledElement, text, columnLabel, rowLabel, elementStatus) => {
    const performActionOnTarget = (target) =>{
        console.log('performActionOnTarget target', target)
        
        const shouldNotSee = action === 'should NOT see'

        if(labeledElement){
            let resultFilter = () => { return true }
            if(target.tagName === 'INPUT'){
                const actualTarget = target
                target = target.parentNode
                resultFilter = (index, item) => {
                    return item === actualTarget
                }
            }

            const next = (action, result) =>{
                performAction(action, result, elementStatus)
            }

            target = cy.wrap(target)

            if(text){
                target.getLabeledElement(labeledElement, text, ordinal, undefined, shouldNotSee).then(result =>{
                    if(shouldNotSee){
                        if(result !== true){
                            console.log('Unexpected element found', result)
                            throw 'An element was found that was not expected to exist.  See console for details.'
                        }
                    }
                    else{
                        next(action, result)
                    }
                })
            }
            else{
                let selector
                if(labeledElement === 'icon'){
                    selector = 'i, img'
                }
                else if(labeledElement === 'checkbox'){
                    selector = 'input[type="checkbox"]'
                }
                else if(labeledElement === 'radio'){
                    selector = 'input[type="radio"]'
                }
                else{
                    throw 'Unexpected labeledElement and text combo'
                }

                target.then(target => {
                    results = target.find(selector).filter(resultFilter)

                    if(shouldNotSee){
                        if(results.length !== 0){
                            console.log('performActionOnTarget unexpected results', results)
                            throw 'Found an unexpected element. See console log for details.'
                        }
                    }
                    else{
                        if(results.length != 1){
                            console.log('performActionOnTarget results', results)
                            throw 'Expected to find a single element, but found ' + results.length + ' instead.  See console log for details.'
                        }
                    
                        next(action, results[0])
                    }
                })
            }
        }
        else if(shouldNotSee){
            cy.wrap(target).assertTextVisibility(text, false)
        }
        else if(action === 'should see'){
            cy.wrap(target).assertTextVisibility(text, true)
        }
        else{
            throw 'Action not found: ' + action
        }
    }
    
    if(columnLabel && rowLabel){
        cy.table_cell_by_column_and_row_label(columnLabel, rowLabel).then(($td) => {
            $td = $td[0]
            performActionOnTarget($td)
        })
    }
    else if(columnLabel){
        /**
         * Currently this case cannot be reached because rowLabel is required and always set when columnLabel is set,
         * hitting the above 'if' block instead of this one.
         * Eventually we should make rowLabel optional as well and consolidate this with other generic {action} steps.
         */
        throw 'Support for "in the column labeled" syntax is not yet implemented.  Please ask if you need it!'
    }
    else if(rowLabel){
        const escapedRowLabel = rowLabel.replaceAll('"', '\\"')
        const rowContainsSelector = `tr :contains("${escapedRowLabel}")`
        cy.get(rowContainsSelector).filterMatches(rowLabel).then(results => {
            const rows = []
            let lastRow
            results.each((i, element) => {
                const row = element.closest('tr')

                // If multiple elements on a single row match, make sure we only consider that row once (e.g. C.3.30.1800)
                if(row !== lastRow){
                    rows.push(row)
                }

                lastRow = row
            })

            if(rows.length === 0){
                throw 'Row with given label not found'
            }
            else if(rows.length > 1){
                console.log('elements found matching row label', rows)
                throw 'Multiple rows found for the given label'
            }
            
            let row = rows[0]
            if(row.closest('table').classList.contains('form-label-table')){
                // Use the next parent row rather than the nested table's row
                row = row.parentElement.closest('tr')
            }

            let next
            if(row.closest('table').closest('div').id.startsWith('setupChklist-')){
                /**
                 * We're on the Project Setup page.
                 * What look like table rows here are just divs that require special handling. 
                 */
                next = cy.get(rowContainsSelector.replace('tr', 'div')).filterMatches(rowLabel).closest('div')
            }
            else{
                next = cy.wrap(row);
            }

            next.then(row => {
                performActionOnTarget(row)
            })
        })
    }
    else{
        cy.get_top_layer().then(topLayer => {
            performActionOnTarget(topLayer)
        })
    }
})

/**
 * @module Interactions
 * @author Mark McEver <mark.mcever@vumc.org>
 * @description Cancels the confirmation dialog displayed during the following step 
 */
Given("I remember to click cancel on the confirmation dialog that appears after the following step", () => {
   window.rctfCancelNextConfirm = true
})
