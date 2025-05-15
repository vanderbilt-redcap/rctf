cy.on('window:before:unload', () => {
    window.aboutToUnload = true
})

cy.on('window:load', () => {
    window.aboutToUnload = false
})

Cypress.Commands.add('wait_to_hide_or_detach', (selector, options = {}) => {
    const { timeout = Cypress.config('defaultCommandTimeout'), interval = 100 } = options
    const startTime = Date.now()

    new Promise((resolve, reject) => {
        const checkDetachment = () => {
            const now = Date.now()
            const elapsedTime = now - startTime

            if (elapsedTime >= timeout) {
                reject(new Error(`Element ${selector} did not become detached within ${timeout}ms`))
                return
            }

            cy.get(selector, { timeout: 0 }).then(($element) => {
                if (!$element.is(':visible') || Cypress.dom.isDetached($element)) {
                    resolve(true)
                } else {
                    // Element is still attached, retry after interval
                    cy.wait(interval).then(checkDetachment)
                }
            })
        }

        checkDetachment()
    })
})

Cypress.Commands.add('wait_for_datatables', () => {
    cy.window().should((win) => {
        expect(win.$).to.be.a('function')
    })

    return cy.window().then((win) => {
        return win.$('.dataTable:first:visible').dataTable()
    })
})

Cypress.Commands.add('waitForInitDtEvent', () => {
    // Wrap the loop logic in cy.wrap() to ensure Cypress retries it
    // Loop until DT_LOADED becomes true or until timeout
    cy.wrap(null, { timeout: 30000 }).should(() => {
        let DT_LOADED = cy.state('window').DT_LOADED

        // Check if DT_LOADED is true, if not, retry
        if (!DT_LOADED) { throw new Error('DT_LOADED is still false') }

        // Return DT_LOADED to exit the loop
        return DT_LOADED
    })

    // cy.get('@breadcrumbs')
    // cy.get('@file_rename')
    // cy.get('@all_checkboxes')
    // cy.get('@load_datatable')
})

Cypress.Commands.add('assertWindowProperties', () => {
    cy.window().then((win) => {
        win.DT_LOADED = true

        const dt = win.$('.dataTable:first:visible').dataTable()

        dt.on('init.dt', function(e, settings) {
            win.DT_LOADED = false
        })
    })

    cy.waitForInitDtEvent()
})

Cypress.Commands.add('not_loading', () => {
    // For a 302 redirect, wait for performance.navigation.type to be 1 - (TYPE_RELOAD)
    // This prevents us from looking at stuff before a reload is done (hopefully!)
    if (window.aboutToUnload && window.registeredAlias){
        cy.window().its('performance.navigation.type').then((type) => {
            if (type === 0) {
                cy.wait('@interceptedRequest', {timeout: 1000}).then((interception) => {
                    if (interception && interception.response.statusCode === 302) {
                        cy.window().its('performance.navigation.type').should('eq', 1)
                    }
                })
            }
        })
    }

    if(Cypress.$('span#progress_save').length) cy.get('span#progress_save').should('not.be.visible')
    if(Cypress.$('div#progress').length) cy.get('div#progress').should('not.be.visible')
    if(Cypress.$('div#working').length) cy.get('div#working', { timeout: 30000 }).should('not.be.visible')
})

Cypress.Commands.add("top_layer", (label_selector, base_element = 'div[role=dialog]:visible,html') => {
    cy.get_top_layer(base_element, ($el) => {
        expect($el.find(label_selector)).length.to.be.above(0)}
    ).then((el) => { return el })
})

Cypress.Commands.add("get_labeled_element", (element_selector, label, value = null, labeled_exactly = false) => {
    if(labeled_exactly){
        cy.contains(new RegExp("^" + label + "$", "g")).then(($label) => {
            cy.get_element_by_label($label, element_selector, value)
        })
    } else {
        cy.contains(label).then(($label) => {
            cy.get_element_by_label($label, element_selector, value)
        })
    }

})

Cypress.Commands.add('filter_elements', (elements, selector, value) => {
    if(elements.find(`${selector}`).length > 1){

        let elms = elements.find(`${selector}`).filter(function() {
            if (value !== null && Cypress.$(this).children('option').length > 0){
                let ret_value = false

                if(Cypress.$(this).children('option').length > 1){
                    Cypress.$(this).children('option').each((num, elem) => {
                        console.log(elem)
                        console.log(elem.innerText === value)
                        if(elem.innerText === value) ret_value = true
                    })
                } else {
                    ret_value = true
                }

                return ret_value
            } else {
                return true
            }
        })

        if (elms.length >= 1){
            return elms.first()
        } else {
            return elements.find(`${selector}`).first()
        }

    } else {
        return elements.find(`${selector}`).first()
    }
})


Cypress.Commands.add('get_element_by_label', (label, selector = null, value = null, original_selector = null, i = 0) => {
    if (original_selector === null) { original_selector = selector }

    cy.wrap(label).then(($self) => {
        if(i === 0 && $self.find(selector).length){
            return cy.filter_elements($self, selector, value)
        } else if (i === 0 && $self.parent().find(selector).length){
            return cy.filter_elements($self.parent(), selector, value)
        } else {
            cy.wrap(label).parentsUntil(`:has(${selector})`).then(($elms) => {

                //This accounts for if there are multiple matches
                for(i = 0; i < $elms.length; i++){
                    if( $elms.eq(i).find(selector).length) {
                        return cy.filter_elements($elms.eq(i), selector, value)
                    }
                }

                //If we don't have any matches within that element, look to the parent ...
                if ($elms.last().parent().find(selector).length){
                     return cy.filter_elements($elms.last().parent(), selector, value)

                //Otherwise, the parent of the parent ..
                } else if (i <= 5) {
                    cy.get_element_by_label(label, `:has(${selector})`, value, original_selector, i + 1)
                }
            })
        }
    })
})

//Provide a robust way for this to find either a button or input button that contains this text
Cypress.Commands.add('button_or_input', (text_label) => {
    cy.get(':button').then(($button) => {
        $button.each(($i) => {
            if($button[$i].value === text_label){
                return cy.wrap($button[$i])
            } else if ($button[$i].innerText === text_label){
                return cy.wrap($button[$i])
            }
        })
    })
})

//yields the visible div with the highest z-index, or the <html> if none are found
Cypress.Commands.add('get_top_layer', (element = 'div[role=dialog]:visible,html', retryUntil) => {
    let top_layer
    cy.get(element).should($els => {
        //if more than body found, find element with highest z-index
        if ($els.length > 1) {
            //remove html from $els so only elements with z-index remain
            $els = $els.filter(':not(html)')
            //sort by z-index (ascending)
            $els.sort((cur, prev) => {
                let zp = Cypress.dom.wrap(prev).css('z-index')
                let zc = Cypress.dom.wrap(cur).css('z-index')
                return zc - zp
                //return zp - zc
            })
        }
        top_layer = $els.last()
        retryUntil(top_layer) //run assertions, so get can retry on failure
    }).then(() => cy.wrap(top_layer)) //yield top_layer to any further chained commands
})

Cypress.Commands.add('ensure_csrf_token', () => {
    cy.url().then(($url) => {
        if($url !== undefined && $url !== 'about:blank'){

            //If this is a form but NOT the LOGIN form
            if(Cypress.$('form').length > 0 && Cypress.$('#redcap_login_a38us_09i85').length === 0){
                cy.getCookies()
                    .should('have.length.greaterThan', 0)
                    .then(($cookies) => {

                        $cookies.forEach(($cookie) => {
                            //If our cookies include PHPSESSID, we can assume we're logged into REDCap
                            //If they do NOT include PHPSESSID, we shouldn't have to worry about this token
                            //It also appears that the Report Forms DO not need a CSRF token, which is interesting ...
                            if($cookie['name'] === 'PHPSESSID' &&
                                Cypress.$('form#create_report_form').length === 0 &&
                                Cypress.$('form input[name=redcap_csrf_token]').length === 1){
                                // cy.get('form input[name=redcap_csrf_token]').each(($form_token) => {
                                //     cy.window().then((win) => {
                                //         expect($form_token[0].value).to.not.be.null
                                //     })
                                // })

                                // === DETACHMENT PREVENTION === //
                                //Some common elements to tell us things are still loading!
                                if(Cypress.$('span#progress_save').length) cy.get('span#progress_save').should('not.be.visible')
                                if(Cypress.$('div#progress').length) cy.get('div#progress').should('not.be.visible')
                                //if(Cypress.$('div#working').length) cy.get('div#working').should('not.be.visible')
                            }
                        })
                    })

            }
        }
    })
})

Cypress.Commands.overwrite(
    'click',
    (originalFn, subject, options) => {

        window.aboutToUnload = true

        //If we say no CSRF check, then skip it ...
        if(options !== undefined && options['no_csrf_check']){
            delete(options['no_csrf_check'])
            return originalFn(subject, options)

            //For all other cases, check for CSRF token
        } else {
            if(options === undefined) options = {} //If no options object exists, create it
            options['no_csrf_check'] = true //Add the "no_csrf_check" to get back to the original click method!

            //console.log(subject)

            if(subject[0].nodeName === "A" ||
                subject[0].nodeName === "BUTTON" ||
                subject[0].nodeName === "INPUT" && subject[0].type === "button" && subject[0].onclick === ""
            ){

                //Is the element part of a form?
                if(subject[0].form){
                    cy.ensure_csrf_token() //Check for the CSRF token to be set in the form
                }

                //If our other detachment prevention measures failed, let's check to see if it detached and deal with it
                cy.wrap(subject).then($el => {
                    return Cypress.dom.isDetached($el) ? Cypress.$($el): $el
                }).click(options)

            } else {
                return originalFn(subject, options)
            }
        }
    }
)

Cypress.Commands.add('php_time_zone', () => {
    // Check if php path is set in Cypress.env.json
    if (Cypress.env('php') && Cypress.env('php')['path']) {
        cy.task("phpTimeZone", Cypress.env('php')['path']).then((timeZone) => {
            cy.exec(timeZone, { timeout: 100000}).then((time) => {
                window.php_time_zone = time['stdout']
            })
        })
    //If we have no PHP path set, we'll look for timezone override
    } else if (Cypress.env('timezone_override')) {
        window.php_time_zone = Cypress.env('timezone_override')
    //If we have no PHP path set and no timezone override, we'll default to JavaScript timezone
    } else {
        window.php_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    cy.wrap(`Configured Timezone: ${window.php_time_zone}`)
})

Cypress.Commands.add("suppressWaitForPageLoad", function () {
    cy.intercept("*", req => {
        req.on("before:response", res => {
            const isDownload = res.headers["content-disposition"]?.startsWith("attachment");
            // Need to exclude requests not made by the application, such as
            // background browser requests.
            const origin = cy.getRemoteLocation("origin");
            const isFromAUT = req.headers["referer"]?.startsWith(origin);
            if (isDownload && isFromAUT) {
                Cypress.log({
                    name: "suppressWaitForPageLoad",
                    message: "Bypassing wait for page load event because response has Content-Disposition: attachment"
                });
                cy.isStable(true, "load");
            }
        });
    });
})

Cypress.Commands.add("closestIncludingChildren", {prevSubject: true}, function (subject, selector) {
    subject = subject[0]
    
    do {
        const children = Cypress.$(subject).find(selector)
        if(children.length === 1){
            return children[0]
        }
    } while (subject = subject.parentElement)
    
    return null
})

function retryUntilTimeout(action, start, lastRun) {
    if (start === undefined) {
        start = Date.now()
    }

    if(lastRun === undefined){
        lastRun = false
    }

    const isAfterTimeout = () => {
        const elapsed = Date.now() - start
        return elapsed > 3000
    }

    return action(lastRun).then((result) => {
        if (result || (isAfterTimeout() && lastRun)) {
            return result
        }
        else {
            cy.wait(250).then(() => {
                retryUntilTimeout(action, start, isAfterTimeout())
            })
        }
    })
}

function getShortestMatchingNodeLength(textToFind, element) {
    let text = null
    if (element.tagName === 'INPUT') {
        text = element.placeholder
    }
    else if(element.childNodes.length > 0) {
        // This is required for 'on the dropdown field labeled "to"' syntax
        element.childNodes.forEach(child => {
            if(child.constructor.name === 'Text' && child.textContent.includes(textToFind)){
                text = child.textContent
            }
        })
    }

    if(text === null){
        text = element.textContent
    }

    return text.trim().length
}

function filterMatches(text, matches) {
    matches = matches.toArray()

    let topElement = null
    let matchesWithoutParents = [...matches]
    matches.forEach(current => {
        if (
            topElement === null // This will default to "body" by default, which is fine
            ||
            topElement.style.zIndex < current.style.zIndex
        ) {
            topElement = current
        }
        
        if(current.tagName === 'SELECT'){
            const option = Cypress.$(current).find(`:contains(${JSON.stringify(text)})`)[0]
            if(!option.selected){
                // Exclude matches for options that are not currently selected, as they are not visible and should not be considered labels
                matchesWithoutParents = matchesWithoutParents.filter(match => match !== current)
            }
        }
        
        while (current = current.parentElement) {
            // Remove parents so only leaf node matches are included
            matchesWithoutParents = matchesWithoutParents.filter(match => match !== current)
        }
    })

    let minChars = null
    matchesWithoutParents.forEach(element => {
        const chars = getShortestMatchingNodeLength(text, element)
        if (
            minChars === null
            ||
            chars < minChars
        ) {
            minChars = chars
        }
    })

    return matchesWithoutParents.filter(element =>
        // Only include elements withint the top most element (likely a dialog)
        topElement.contains(element)
        &&
        /**
         * Only include the closest matches as determined by minChars.
         * If we intend to be match longer strings, we should specify them explicitly.
         */
        getShortestMatchingNodeLength(text, element) === minChars
    )
}

/**
 * This is required to support steps containing the following:
 *      the dropdown field labeled "Assign user"
 *      the radio labeled "Use Data Access Groups"
 */
function getPreferredSibling(text, originalMatch, one, two){
    if(originalMatch === one.parentElement){
        const nodeMatches = Array.from(originalMatch.childNodes).filter(child => {
            return child.textContent.includes(text)
        })

        if(nodeMatches.length !== 1){
            throw 'Found an unexpexcted number of node matches'
        }

        originalMatch = nodeMatches[0]
    }

    if(
        originalMatch.parentElement === one.parentElement
        &&
        originalMatch.parentElement === two.parentElement
    ){
        // All three have the same parent, so the logic in this method is useful
    }
    else{
        // This method is not useful in its current form since the three are not siblings
        return undefined
    }

    const siblings = Array.from(originalMatch.parentElement.childNodes)
    const matchIndex = siblings.indexOf(originalMatch)
    if(matchIndex === -1){
        throw 'Could not determine match index'
    }

    const indexOne = siblings.indexOf(one)
    const indexTwo = siblings.indexOf(two)
    const distanceOne = Math.abs(matchIndex - indexOne)
    const distanceTwo = Math.abs(matchIndex - indexTwo)
    if(distanceOne === distanceTwo){
        if(text === 'to'){
            // Support the special case for 'dropdown field labeled "to"' language
            // Alternatively, we could replaces such steps with 'dropdown field labeled "[No Assignment]"' to resolve this.
            return two
        }

        throw 'Two sibling matches were found the same distance away.  We should consider implementing a way to definitively determine which to match.'
    }
    else if(distanceOne < distanceTwo){
        return one
    }
    else{
        return two
    }
}

function removeUnpreferredSiblings(text, originalMatch, children){
    for(let i=0; i<children.length-1; i++){
        const current = children[i]
        const next = children[i+1]

        const preferredSibling = getPreferredSibling(text, originalMatch, current, next)
        let indexToRemove
        if(preferredSibling === current){
            indexToRemove = i+1
        }
        else if(preferredSibling === next){
            indexToRemove = i
        }
        else{
            // Neither was preferred
            indexToRemove = null
        }

        if(indexToRemove !== null){
            children.splice(indexToRemove, 1)
            i--
        }
    }
}

function findMatchingChildren(text, selectOption, originalMatch, searchParent, childSelector, childrenToIgnore) {
    selectOption = Cypress.custom.normalizeString(selectOption)

    let children = Array.from(Cypress.$(searchParent).find(childSelector)).filter(child => {
        if(
            childSelector.replace(':visible', '') === 'input'
            &&
            // Remember, child.type will be 'text' even when type is not set in the DOM.
            !['text', 'password'].includes(child.type) 
        ){
            /**
             * We're looking for a text type (like checkbox), but found a non-text type.  Ignore this element.
             */
            return false
        }

        return !childrenToIgnore.includes(child)
            // B.3.14.0900.
            && child.closest('.ui-helper-hidden-accessible') === null
    })

    removeUnpreferredSiblings(text, originalMatch, children)

    const exactMatches = children.filter(child =>{
        return Cypress.custom.normalizeString(child.textContent) === selectOption // B.6.7.1900.
    })

    if(exactMatches.length > 0){
        children = exactMatches
    }

    return children
}

/**
 * This logic is meant to eventually replace get_labeled_element() and other label matching logic duplicated in multiple places.
 * Is it specifically designed to help us evolve toward normalizing & simplify association of labels with their clickable elements.
 * The main differences is that it does not require the tagName to be determined up front,
 * allowing for significant logic simplification (incrementally over time).
 * We may want to introduce bahmutov/cypress-if at some point as well,
 * as the root of some of our existing duplicate logic is the lack of built-in "if" support.
 */
Cypress.Commands.add("getLabeledElement", function (type, text, ordinal, selectOption) {
    cy.not_loading()

    return retryUntilTimeout((lastRun) => {
        /**
         * We tried using "window().then(win => win.$(`:contains..." to combine the following two cases,
         * but it could not find iframe content like cy.get() can.
         * We also tried Cypress.$, but it seems to return similar results to cy.get().
         * Example from A.6.4.0200.: I click on the radio labeled "Keep ALL data saved so far." in the dialog box in the iframe
        */
        let selector = `input[placeholder=${JSON.stringify(text)}],:contains(${JSON.stringify(text)})`
        if(!lastRun){
            // Favor visible items until the lastRun.  Keep in mind items that must be scrolled into view aren't considered visible.
            selector += ':visible'
        }

        return cy.get(selector).then(matches => {
            console.log('getLabeledElement() unfiltered matches', matches)
            matches = filterMatches(text, matches)
            console.log('getLabeledElement() filtered matches', matches)

            if (ordinal !== undefined) {
                matches = [matches[window.ordinalChoices[ordinal]]]
            }

            for (let i = 0; i < matches.length; i++){
                const match = matches[i]
                match.scrollIntoView() // Matches must be in view for the ':visible' selector to work
                
                let current = match
                const childrenToIgnore = []
                do {
                    console.log('getLabeledElement() current', current)

                    if(current.clientHeight > 500){
                        /**
                         * We've reached a parent that is large enough that our scope is now too large for a valid match
                         */
                        break
                    }

                    let childSelector = null
                    if (type === 'icon') {
                        childSelector = 'img'
                    }
                    else if (['checkbox', 'radio'].includes(type)) {
                        childSelector = 'input[type=' + type + ']'
                    }
                    else if (type === 'dropdown') {
                        if(selectOption !== undefined){
                            childSelector = `option:containsCustom(${JSON.stringify(selectOption)})`
                        }
                        else{
                            childSelector = 'select'
                        }
                    }
                    else if (['input', 'textbox', 'button'].includes(type)){
                        childSelector = type // Covers input, textbox, button, etc.
                    }
                    else {
                        // Leave childSelector blank.  Catch all for 'link', 'tab', 'instrument', etc.
                    }

                    if(childSelector !== null && type !== 'dropdown'){
                        // Required for the 'input field labeled "Search"' step in C.3.24.2100
                        childSelector += ':visible'
                    }

                    if (childSelector) {
                        const children = findMatchingChildren(text, selectOption, match, current, childSelector, childrenToIgnore)
                        console.log('getLabeledElement() children', children)
                        if (children.length === 1) {
                            /**
                             * Example Steps:
                             *  I uncheck the first checkbox labeled "Participant Consent"
                             *  I click on the icon labeled "[All instruments]"
                             */
                            return children[0]
                        }
                        else if (
                            /**
                             * We're likely matching an unrelated group of elements.
                             * They could be children or distant siblings of the desired match
                             * Regardles, ignore this grouping and start the search again from the next parent.
                             */
                            children.length > 1
                        ) {
                            childrenToIgnore.push(...children)
                        }
                    } else if (
                        // Default to the first matching "a" tag, if no other cases apply.
                        current.tagName === 'A'
                     ){
                        return current
                    }

                    /**
                     * Some label elements in REDCap contain mulitple fields.
                     * Only use 'for' for matching as a last resort if none of the logic above matched the field.
                     */
                    if (current.tagName === 'LABEL' && current.htmlFor !== '') {
                        // This label has the 'for' attribute set.  Use it.
                        return cy.get('#' + current.htmlFor)
                    }
                } while (current = current.parentElement)
            }

            return null
        })
    }).then((match) => {
        if (!match) {
            throw 'The specified element could not be found'
        }

        return match
    })
})

Cypress.custom = {
    normalizeString: function(s){
        if(s === undefined){
            return undefined
        }

        // Replace '&nbsp;' so that normal spaces in steps will match that character
        return s.trim().replaceAll('\u00a0', ' ')
    }
}