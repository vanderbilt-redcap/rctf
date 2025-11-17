cy.on('window:before:unload', () => {
    window.aboutToUnload = true
})

cy.on('window:load', () => {
    window.aboutToUnload = false
})

Cypress.Commands.add('wait_to_hide_or_detach', (selector, options = {}) => {
    const { timeout = Cypress.config('defaultCommandTimeout'), interval = 500 } = options
    const startTime = Date.now()

    new Promise((resolve, reject) => {
        const checkDetachment = () => {
            const now = Date.now()
            const elapsedTime = now - startTime

            if (elapsedTime >= timeout) {
                throw new Error(`Element ${selector} did not become detached within ${timeout}ms`)
            }

            cy.get(selector, { timeout: 0 }).then(($element) => {
                if (!$element.is(':visible') || Cypress.dom.isDetached($element)) {
                    resolve(true)
                } else {
                    // Element is still attached, retry after interval
                    cy.wait(interval, {log: false}).then(checkDetachment)
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

    /**
     * The 'if' checks below don't work properly 100% of the time because there is a race condition
     * if the page happens to reload between the 'Cypress.$' and the 'cy.get()' calls,
     * and the latter page no longer contains the specified div.
     * I think we may want to deprecate the not_loading() command in favor of steps that
     * look for something guaranteed to exist on the next page.
     * That could be as simple as an "I should see" step specifying some text.
     */
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
Cypress.Commands.add('get_top_layer', (element = null, retryUntil) => {
    if(element === null){
        /**
         * We used to also check for dialogs & popups here, but that was too brittle
         * as top layer changed during page loads and dialog shows/hides.
         * Instead, we should build top layer checking with retry logic into
         * other generalized matching methods.  See getLabeledElement() for a good pattern.
         */
        element = 'html'
        element += ',iframe.todo-iframe' // A.6.4.0200, B.6.4.1200
        element += ',iframe#SURVEY_SIMULATED_NEW_TAB' // C.3.24.0105, C.3.24.1500, C.3.24.1700
    }

    let top_layer
    cy.get(element).should($els => {
        $els = $els.filter(':visible')

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
        top_layer = $els.last() // Get the last since they are sorted in order of appearance in the DOM
        expect(Cypress.dom.isDetached(top_layer)).to.be.false
        if(retryUntil){
            retryUntil(top_layer) //run assertions, so get can retry on failure
        }
    }).then(() => {
        let next = cy.wrap(top_layer) //yield top_layer to any further chained commands

        if(top_layer[0].tagName === 'IFRAME'){
            next = next.iframe().then(iframeBody => {
                // Without this wait Mark saw inexplicable intermittent failures on his local even after waiting for ".iframe-overlay" to exist on the following step: I should see "Permanently delete this project?"
                cy.wait(100)

                return cy.wrap(iframeBody)
            })
        }

        return next.then(result => {
            console.log('get_top_layer() returning', result)
            cy.wrap(result)
        })
    }) 
})

const getElementThatShouldDisappearAfterClick = ($el) => {
    if(
        $el.id === 'assignDagRoleBtn' // C.3.30.1800
        || $el.innerText === 'Save signature' // A.3.28.0600
    ){
        return $el
    }

    // Use $el.href here since it will return absolute urls even when relative urls are specified
    const href = $el.href ?? ''

    if(
        (
            href.startsWith('http')
            &&
            // Use $el.getAttribute('href') here to test the relative url
            !$el.getAttribute('href')?.startsWith('#')
        )
        ||
        $el.innerText.includes('Save & Exit Form')
        ||
        $el.innerText.includes('Create Project')
        ||
        (
            // A.3.28.0600
            $el.value === 'Save Changes'
            &&
            $el.closest('form')
        )
        ||
        (
            // B.6.4.1400 and others
            $el.innerText === 'Close'
            &&
            $el.closest('.ui-dialog')?.innerText?.includes('page will now reload')
        )
    ){
        // The whole page should be reloaded after any of these actions
        return Cypress.$('body')[0]
    }

    return null
}

Cypress.Commands.overwrite(
    'click',
    (originalFn, subject, options) => {
        const openInSameTab = window.openNextClickInNewTab !== true
        delete window.openNextClickInNewTab

        window.aboutToUnload = true
        if(options === undefined) options = {} //If no options object exists, create it
        //console.log(subject)

        const innerText = subject[0].innerText

        if(subject[0].nodeName === "A" ||
            subject[0].nodeName === "BUTTON" ||
            (subject[0].nodeName === "INPUT" && ["button", "submit"].includes(subject[0].type) && ["", null].includes(subject[0].onclick))
        ){
            /**
             * Cypress sometimes click buttons too quickly before REDCap's javascript is finished initializing their actions.
             * Wait just a little bit before clicking to more closely simulate actual user behavior.
             * This fixes an issue on B.2.6.0200.
             */
            let preClickWait = 100

            if(
                // Avoid a bug in REDCap where "Multiple tabs/windows open!" displays if requests are made too quickly
                ['Import Data', 'Commit Changes'].includes(innerText)
                ||
                // Wait for the javascript action to be attached to this link
                innerText.includes('FHIR Systems')
            ){
                preClickWait = 1000
            }
           
            cy.wait(preClickWait)

            const disappearingElement = getElementThatShouldDisappearAfterClick(subject[0])
            const timeBeforeClick = Date.now()

            //If our other detachment prevention measures failed, let's check to see if it detached and deal with it
            cy.wrap(subject).then($el => {
                $el = Cypress.dom.isDetached($el) ? Cypress.$($el): $el

                if(innerText.includes("Open public survey")){
                    cy.open_survey_in_same_tab(subject, openInSameTab, false)
                }

                cy.wrap($el).then(() => {
                    return originalFn($el, options)
                })
            })
            .then($el => {
                $el = $el[0]
                if(disappearingElement){
                    cy.log("Waiting for this element to disappear if it hasn't already", disappearingElement)

                    /**
                     * The page should reload now.  We make sure the link element stops existing
                     * as a way of waiting until the DOM is reloaded before continueing.
                     * This prevents next steps from unexpectedly matching elements on the previous page.
                     */
                    return cy.retryUntilTimeout(() => {
                        let downloadDetected = false
                        return cy.task('fetchLatestDownload', {fileExtension: null, retry: false}).then(filePath => {
                            if(filePath){
                                cy.getFileMTime(filePath).then(mtime => {
                                    if(mtime > timeBeforeClick){
                                        // The click triggered a download.  Stop waiting for a page reload that will never happen. 
                                        downloadDetected = true
                                    }
                                })
                            }
                        }).then(() => {
                            if(!disappearingElement.checkVisibility()){
                                let getBodyAction
                                if(window.withinTarget){
                                    getBodyAction = cy.wrap(null)
                                }
                                else{
                                     /**
                                      * Calling checkVisibility() is apparently not good enough since there seems to be
                                      * a bug in Cypress where calls like cy.get() still return elements that are no longer
                                      * actually present in the dom.  It's like the reference to the body is stale internally
                                      * in Cypress somehere.  In any case, this works around this issue on B.6.4.1400.
                                      */
                                    getBodyAction = cy.get('body')
                                }

                                getBodyAction.then(body => {
                                    if(
                                        // Was window.withinTarget was set above?
                                        body === null 
                                        ||
                                        /**
                                         * Is the disappearingElement is not the body,
                                         * then we're not looking for a page reload,
                                         * and checkVisibility() is all we care about. 
                                         */
                                        disappearingElement.tagName !== 'body'
                                        ||
                                        /**
                                         * If the disappearingElement is the previous body.
                                         * Make sure it's not the same as the current body
                                         * to verify that the page had reloaded
                                         * and that cy.get('body') is returning the new body.
                                         */
                                        body !== disappearingElement
                                    ){
                                        cy.log('Disappearing element as disappeared')
                                        cy.wrap(true)
                                    }
                                    else{
                                        cy.wrap(false)
                                    }
                                })
                            }
                            else{
                                let skipReason
                                if(downloadDetected){
                                    skipReason = 'a download was detected'
                                }
                                else if(Cypress.$('#stayOnPageReminderDialog:visible').length > 0){
                                    skipReason = 'the #stayOnPageReminderDialog is visible'
                                }
                                else if(Cypress.$('[aria-describedby="esign_popup"]').length > 0){
                                    // C.2.19.0500
                                    skipReason = 'the esign_popup is visible'
                                }
                                else if(Cypress.$('[aria-describedby="certify_create"]').length > 0){
                                    // A.6.4.0100
                                    skipReason = 'the certify_create dialog is visible'
                                }

                                if(skipReason){
                                    cy.log('Skipping dissappearing element detection because ' + skipReason)
                                    cy.wrap(true)
                                }
                                else{
                                    cy.wrap(false)
                                }
                            }
                        })
                        /**
                         * Arbitrary wait after page load to hopefully avoid flaky tests
                         * caused by various javascript page initilization tasks.
                         */
                        .wait(100)
                    }, 'Failed to detect page load after link click')
                }
            })
            .window().then((win) => {
                let waitAfterAjax = 0
                cy.retryUntilTimeout(() => {
                    /**
                     * Wait until any pending jQuery requests complete before continuing.
                     * This serves a similar purpose to cy.intercept(), but in a simpler & more generic way,
                     * since cy.intercept() is asyncronous and can't cause cypress to wait to execute the next step
                     * without an explicit cy.wait(@someAlias) call.  Using jQuery's request count is much simpler
                     * than explicitly supportly every page load & ajax request in REDCap.
                    */
                    const returnValue = 
                        win.jQuery === undefined
                        ||
                        win.jQuery.active === 0
                        ||
                        innerText.includes('Request delete project') // Work around exception in REDCap
                    
                    if(!returnValue){
                        /**
                         * Add a slight delay to give any actions resulting from the ajax call time to take action (like re-render parts of the page).
                         */
                        waitAfterAjax = 250
                    }

                    return cy.wrap(returnValue)
                }, 'The jQuery request count never fell to zero!')
                .then(() => {
                    cy.wait(waitAfterAjax)
                })

                if(
                    win.location.href.includes('ProjectSetup/index')
                    &&
                    (
                        innerText.includes('Enable')
                        ||
                        innerText.includes('Disable')
                    )
                ){
                    /**
                     * This accounts for a 200ms setTimeout() in saveProjectSetting() that delays the page load,
                     * and apparently takes longer than 500ms to fire a percentage of the time.
                     * If we don't wait, within() calls on the next step will match elements on the soon to be unloaded page.
                     */
                    cy.log('Waiting for potential page load after project setting changes')
                    cy.wait(1000)
                }

                /**
                 * Used to check for jQuery.active === 0 here.  It mostly worked, but there were exceptions.  The value is stuck on 1 in B.6.4.1200.
                 */
            })
            .then(() => {
                return subject
            })
        } else {
            return originalFn(subject, options)
        }
    }
)

Cypress.Commands.overwrite('within', (...args) => {
    const originalWithin = args.shift()
    const subject = args[0]
    const callbackFn = args.pop()

    if(subject[0].tagName === 'HTML'){
        /**
         * Effectively ignore the cy.within() call on the HTML element because it has no desired effect
         * and actually prevents elements from being found in the case where the HTML element
         * happens to be matched during a within() call immediately prior to a page reload.
         * In this case we will never find our desired element because we are searching
         * within the previous page's HTML that is not desired and no longer displayed.
         */
        callbackFn(subject)
        return subject
    }
    else{
        console.log('cy.within() called with subject: ', subject[0])
        window.withinTarget = subject[0]

        args.push((...callbackArgs) => {
            callbackFn(...callbackArgs)
            cy.then(() => {
                delete window.withinTarget
            })
        })

        return originalWithin(...args)
    }
})

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

Cypress.Commands.add("assertTextVisibility", {prevSubject: true}, function (subject, text, shouldBeVisible) {
    cy.log('assertTextVisibility', subject, text, shouldBeVisible)

    text = text
        .replace(/ +/g, ' ') // Collapse adjacent spaces to match innerText()'s behavior.
        .replace(/\\n/g, '\n') // Remove autoescaped new lines so that they will match properly

    if(text.length === 0){
        throw "The text specified must not be empty!"
    }

    cy.retryUntilTimeout((lastRun) => {
        const action = (subject) => {
            let found = false
            subject.each((index, item) => {
                if (!item.checkVisibility()) {
                    cy.log('assertTextVisibility() - Stale subject(s) detected.  The page must have partially or fully reloaded.  Attempting to get new reference(s) to the same subject(s)...')
                    let selector = subject.selector
                    if(!selector){
                        selector = 'body'
                    }
                    
                    subject = Cypress.$(selector)
                    subject.selector = selector
                    item = subject[index]

                    if(item === undefined){
                        // The number of items matched must be smaller after the page load.  Return and check the new list on the next retry.
                        return
                    }
                }

                /**
                 * We use innerText rather than the ':contains()' selector
                 * to avoid matching text within hidden tags and <script> tags,
                 * since they are not actually visible.
                 * 
                 * This previously caused steps looking for text like "SUCCEED"
                 * to always work even when they should fail because that string
                 * exists inside a <script> tag on most pages. 
                 */
                if(item.innerText.includes(text)){
                    found = true
                }
            })
            
            let error
            if(found && !shouldBeVisible){
                error = 'Unexpected text was found: ' + text
            }
            else if(!found && shouldBeVisible){
                error = 'Expected text was not found: ' + text
            }

            if(error){
                if(lastRun){
                    throw error
                }
                else{
                    return cy.wrap(false) // false will trigger a retry
                }
            }
            else{
                return cy.wrap(true)
            }
        }

        if(subject && !subject.is('html')){
            return action(subject)
        }
        else{
            return cy.get_top_layer().then(topLayer => {
                return action(topLayer)
            })
        }
    })
})

Cypress.Commands.add("assertPDFContainsDataTable", {prevSubject: true}, function (pdf, dataTable) {
    function findDateFormat(str) {
        for (const format in window.dateFormats) {
            const regex = window.dateFormats[format]
            const match = str.includes(format)
            if (match) {
                expect(window.dateFormats).to.haveOwnProperty(format)
                return str.replace(format, '')
            }
        }
        return null
    }
    
    dataTable['rawTable'].forEach((row, row_index) => {
        row.forEach((dataTableCell) => {
            const result = findDateFormat(dataTableCell)
            if (result === null) {
                expect(pdf.text).to.include(dataTableCell)
            } else {
                result.split(' ').forEach((item) => {
                    expect(pdf.text).to.include(item)
                })
            }
        })
    })
})

Cypress.Commands.add('assertContains', {prevSubject: true}, (path, dataTable) => {
    if(!path){
        throw 'A recent file could not be found!'
    }
    
    const extension = path.split('.').pop()
    if(extension === 'pdf'){
        cy.task('readPdf', { pdf_file: path }).assertPDFContainsDataTable(dataTable)
    }
    else{
        throw 'This step needs to be expanded to support this file type: ' + path
    }
})

Cypress.Commands.add('findMostRecentAzureFile', () => {
    /**
     * Azurite does not simply store files in a directory that we can directly access.
     * We created this method to access them.
     */
    return cy.request({
        url: '/azure/get-most-recent-file.php',
        encoding: 'binary',
    }).then((response) => {
        expect(response.status).to.eq(200);

        const filename = response.headers['content-disposition']
            .split('filename=')[1]
            .split('"')[1]                    

        cy.task('createTempFile', {filename, content: response.body})
    })
})

Cypress.Commands.add('findMostRecentS3File', () => {
    cy.exec('docker exec mybucket.minio.local mc ls --json /data/mybucket/').then(result => {
        const lines = result.stdout.split('\n')
        let mostRecent = null
        lines.forEach(line => {
            const fileInfo = JSON.parse(line)
            fileInfo.lastModified = new Date(fileInfo.lastModified)
            if(mostRecent === null || fileInfo.lastModified > mostRecent.lastModified){
                mostRecent = fileInfo
            }
        })

        const filename = mostRecent.key.split('/')[0]
        cy.exec('docker exec mybucket.minio.local mc cp local/mybucket/' + filename + ' /tmp').then(() => {
            const path = '../tmp/' + filename
            cy.exec('docker cp mybucket.minio.local:/tmp/' + filename + ' ' + path).then(() => {
                return path
            })
        })
    })
})

Cypress.Commands.add("retryUntilTimeout", function (action, messageOnError, start, lastRun) {
    if(messageOnError === undefined){
        messageOnError = "Timeout reached via retryUntilTimeout().  Pass an error message to this function in order to get a more specific error in this case."
    }

    if (start === undefined) {
        start = Date.now()
    }

    if(lastRun === undefined){
        lastRun = false
    }

    return action(lastRun).then((result) => {
        if (result) {
            return result
        }
        else if (lastRun){
            throw messageOnError
        }
        else {
            const elapsed = Date.now() - start
            const waitTime = elapsed < 1000 ? 250 : 1000
            cy.wait(waitTime).then(() => {
                const lastRun = elapsed > Cypress.config('defaultCommandTimeout')
                cy.retryUntilTimeout(action, messageOnError, start, lastRun)
            })
        }
    })
})

function getShortestMatchingNodeLength(textToFind, element) {
    let text = null
    if (element.tagName === 'INPUT') {
        if(['button', 'submit'].includes(element.type)){
            text = element.value
        }
        else{
            text = element.placeholder
        }
    }
    else if(element.childNodes.length > 0) {
        // This is required for 'on the dropdown field labeled "to"' syntax
        element.childNodes.forEach(child => {
            if(child.constructor.name === 'Text'){
                let content = child.textContent
                content = content.replaceAll(' ', ' ') // Replace no-break space chars to make matching work in more cases
                if(content.includes(textToFind)){
                    text = content
                }
            }
        })
    }

    if(!text){
        const textToFindEscaped = textToFind.replaceAll('"', '\\"')
        ;['title', 'data-bs-original-title'].forEach(attribute => {
            // Required for A.3.28.0500, C.3.30.1800, and others
            element.querySelectorAll(`[${attribute}*="${textToFindEscaped}"]`).forEach(child => {
                const titleText = child.getAttribute(attribute)
                if(!text || titleText.length < text.length){
                    text = titleText
                }
            })
        })
    }

    if(!text){
        text = element.textContent
    }

    if(!text){
        text = element.title
    }

    if(!text){
        text = element.getAttribute('data-bs-original-title') // Required for C.3.24.2200.
    }

    if(!text.includes(textToFind)){
        // This is not a match.  Return a large int to make sure it is excluded.
        return Number.MAX_SAFE_INTEGER
    }

    return text.trim().length
}

function filterNonExactMatches(matches, text) {
    if(!text){
        return matches
    }

    let minChars = null
    matches.forEach(element => {
        const chars = getShortestMatchingNodeLength(text, element)
        if (
            minChars === null
            ||
            chars < minChars
        ) {
            minChars = chars
        }
    })

    return matches.filter(element =>
        /**
         * Only include the closest matches as determined by minChars.
         * If we intend to be match longer strings, we should specify them explicitly.
         */
        getShortestMatchingNodeLength(text, element) === minChars
    )  
}

function filterCoveredElements(matches) {
    const getZIndex = (element) => {
        const zIndex = getComputedStyle(element).zIndex
        if(isNaN(zIndex)){
            return 0
        }
        else{
            return zIndex
        }
    }

    /**
     * We determine the html tag using the closest() method to ensure
     * the correct html tag is selected if we're in an iframe.
     */
    let topElement = matches[0]?.closest('html')
    matches.forEach(element => {
        let current = element
        while(current = current.parentElement){
            if (
                getZIndex(topElement) < getZIndex(current)
                &&
                /**
                 * Don't match bootstrap ".dropdown-menu" elements that aren't actually visible,
                 * but have a z-index set .
                 */
                Cypress.$(current).is(':visible') 
                &&
                // Never consider the footer to be a topElement
                current.id !== 'south'
                &&
                // Do not consider tooltips to be top elements, since their zIndex is greater than dialogs (e.g. C.3.24.2200)
                !current.classList.contains('tooltip') // Required for C.3.24.2200.
            ) {
                topElement = current
            }
        }
    })

    return matches.filter(element =>
        // Only include elements within the top most element (likely a dialog)
        topElement.contains(element)
    )
}

Cypress.Commands.add("filterMatches", {prevSubject: true}, function (matches, text) {
    matches = matches.toArray()
    console.log('filterMatches before', matches)

    const matchesCopy = [...matches]
    matchesCopy.forEach(current => {
        if(current.tagName === 'SELECT' && text){
            const option = Cypress.$(current).find(`:contains(${JSON.stringify(text)})`)[0]
            if(!option.selected){
                // Exclude matches for options that are not currently selected, as they are not visible and should not be considered labels
                matches = matches.filter(match => match !== current)
            }
        }
        else if(current.tagName === 'SCRIPT'){
            // Exclude script tag matches, since they were likely language strings that are not actually displayed
            matches = matches.filter(match => match !== current)
        }
        
        while (current = current.parentElement) {
            // Remove parents so only leaf node matches are included
            matches = matches.filter(match => match !== current)
        }
    })

    /**
     * We filter out covered elements after removing parents but before deoing 
     * aything else. We definitely want this to happen before searching for visible elements
     * to support the case where there are multiple matches and we want to
     * exclude matches outside the current dialog that are visible, while 
     * keeping matches within the dialog that require scrolling to become visible.
     * Some examples include B.4.9.0100 and B.6.7.1600.
     */
    matches = filterCoveredElements(matches)
    
    matches = filterNonExactMatches(matches, text)

    const visibleMatches = matches.filter(element => Cypress.$(element).is(':visible'))
    if(visibleMatches.length > 0){
        // Favor visible matches
        matches = visibleMatches
    }

    console.log('filterMatches after', matches)
    return matches
})

function normalizeString(s){
    if(s === undefined){
        return undefined
    }

    // Replace '&nbsp;' so that normal spaces in steps will match that character
    return s.trim().replaceAll('\u00a0', ' ')
}

/**
 * We tried implementing this as an exact match at first, but that made some steps unweildly.
 * For example:
 *      I select "gender"...
 * Changed to:
 *      I select "gender (Do you describe yourself as a man, a woman, or in some other way?)..."...
 */
Cypress.$.expr[':'].containsCustom = Cypress.$.expr.createPseudo(function(arg) {
    arg = normalizeString(arg)

    // Remove any double quote escaping added by JSON.stringify()
    arg = JSON.parse('"' + arg + '"')

    return function( elem ) {
        return normalizeString(Cypress.$(elem).text()).includes(arg)
    };
});

/**
 * This is required to support steps containing the following:
 *      the dropdown field labeled "Assign user"
 *      the radio labeled "Use Data Access Groups"
 */
function getPreferredSibling(text, originalMatch, one, two){
    if(originalMatch === one.parentElement){
        /**
         * The originalMatch was matched because it contains a text node
         * that is a direct sibling of the options to consider.
         * Replace originalMatch with the actual text node for the following logic to work properly. 
         */

        const nodeMatches = Array.from(originalMatch.childNodes).filter(child => {
            return child.textContent.includes(text)
        })

        if(nodeMatches.length !== 1){
            throw 'Found an unexpexcted number of node matches'
        }
     
        originalMatch = nodeMatches[0]
    }
    else if(one === originalMatch){
        return one
    }
    else if(two === originalMatch){
        return two
    }

    const elementsToCheck = Cypress.$(originalMatch).parents().toArray()
    elementsToCheck.unshift(originalMatch)
    const sharedParent = elementsToCheck.filter(element => {
        return element.contains(one) && element.contains(two)
    })[0]

    const siblings = Array.from(sharedParent.childNodes)
    
    let matchOrParent, oneOrParent, twoOrParent
    siblings.forEach(child => {
        if(child === originalMatch || child.contains(originalMatch)){
            matchOrParent = child
        }
        else if(child === one || child.contains(one)){
            oneOrParent = child
        }
        else if(child === two || child.contains(two)){
            twoOrParent = child
        }
    })

    if(
        !matchOrParent
        ||
        !oneOrParent
        ||
        !twoOrParent
        ||
        matchOrParent === oneOrParent
        ||
        matchOrParent === twoOrParent
        ||
        oneOrParent === twoOrParent
    ){
        /**
         * Shared parent with distinct children not found.
         * This method is not useful in its current form if the three elements or their parents are not siblings.
         */
        return undefined
    }

    const matchIndex = siblings.indexOf(matchOrParent)
    if(matchIndex === -1){
        throw 'Could not determine match index'
    }

    const indexOne = siblings.indexOf(oneOrParent)
    const indexTwo = siblings.indexOf(twoOrParent)
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
    selectOption = normalizeString(selectOption)

    let children = Array.from(Cypress.$(searchParent).find(childSelector)).filter(child => {
        if(
            childSelector.replace(':visible', '') === 'input'
            &&
            // Remember, child.type will be 'text' even when type is not set in the DOM.
            !['text', 'password', 'email', 'number', 'search', 'tel', 'url'].includes(child.type)
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

    if(selectOption){
        children = filterNonExactMatches(children, selectOption)
    }

    removeUnpreferredSiblings(text, originalMatch, children)

    const exactMatches = children.filter(child =>{
        return normalizeString(child.textContent) === selectOption // B.6.7.1900.
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
Cypress.Commands.add("getLabeledElement", {prevSubject: 'optional'}, function (subject, type, text, ordinal, selectOption, expectFailure) {
    console.log('getLabeledElement()', arguments)

    const errorMessage = `The ${type} labeled "${text}" ` + (expectFailure ? 'was unexepectedly found' : 'could not be found')
    
    return cy.retryUntilTimeout((lastRun) => {
        cy.document().then(document => {
            const attributeName = 'data-bs-original-title'
            document.querySelectorAll(`[${attributeName}*="<"]`).forEach(element => {
                // Remove html tags from bootstrap titles to allow matching things like "<b>Edit</b> Branching Logic"
                const attributeText = element.getAttribute(attributeName)
                element.setAttribute(attributeName, new DOMParser().parseFromString(attributeText, 'text/html').body.textContent)
            })
        })

        let selector = [
            `input[placeholder=${JSON.stringify(text)}]:visible`,
            `:contains(${JSON.stringify(text)}):visible`,
            `[title*=${JSON.stringify(text)}]:visible`,
            `[data-bs-original-title*=${JSON.stringify(text)}]:visible`,
            `input[type=button][value*=${JSON.stringify(text)}]:visible`,
            `input[type=submit][value*=${JSON.stringify(text)}]:visible`,
        ].join(', ')

        let next
        if(window.withinTarget){
            next = cy.get(selector)
        }
        else{
            if(subject === undefined || subject.is('html')){
                next = cy.get_top_layer().then(topLayer => {
                    return topLayer.find(selector)
                })
            }
            else{
                next = cy.wrap(subject.find(selector))
            }
        }

        return next.filterMatches(text).then(matches => {
            if(!Array.isArray(matches)){
                /**
                 * It seems like this line should be run all the time,
                 * but we need the conditional above because a step in C.3.24.0205
                 * seems to automatically convert the return value from a chainer to an array.
                 * Is this a bug in Cypress?!?
                 */
                matches = matches.toArray()
            }

            if (type === 'button'){
                const buttonMatches = matches.filter(element => 
                    ['BUTTON', 'INPUT'].includes(element.tagName)
                    ||
                    element.closest('button') !== null
                )

                if(buttonMatches.length > 0){
                    // Favor matches with labels inside the button, rather than outside.
                    matches = buttonMatches
                }
            }

            if (ordinal !== undefined) {
                let match
                if(ordinal === 'last'){
                    match = matches[matches.length-1]
                }
                else{
                    match = matches[window.ordinalChoices[ordinal]]
                }
                
                if(!match){
                    throw 'Specified ordinal not found'
                }

                matches = [match]
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
                        console.log('getLabeledElement() breaking out of the loop due to clientHeight', current)
                        break
                    }

                    let childSelectors = []
                    if (type === 'icon') {
                        childSelectors = ['i', 'img']
                    }
                    else if (['checkbox', 'radio'].includes(type)) {
                        childSelectors = ['input[type=' + type + ']']
                    }
                    else if (type === 'dropdown') {
                        if(selectOption !== undefined){
                            childSelectors = [`option:containsCustom(${JSON.stringify(selectOption)})`]
                        }
                        else{
                            childSelectors = ['select']
                        }
                    }
                    else if (type === 'button'){
                        if(current.tagName === 'BUTTON'){
                            // We've already found it.  No need to keep searching.
                            return current
                        }

                        childSelectors = ['input[type=button]', 'input[type=submit], button']
                    }
                    else if (type === 'textarea'){
                        //.tox-editor-container is used for TinyMCE in C.3.24.1500
                        childSelectors = ['.tox-editor-container', 'textarea']
                    }
                    else if (['input', 'field'].includes(type)){
                        childSelectors = ['input']
                    }
                    else {
                        /**
                         * Leave childSelector blank.
                         * Used to be a catch all for 'link', 'tab', 'instrument', etc.
                         * This might only be the case for 'link' now.
                         */
                    }

                    if(type !== 'dropdown'){
                        for(i in childSelectors){
                            childSelectors[i] += ':visible'
                        }
                    }

                    if (childSelectors.length > 0) {
                        const children = findMatchingChildren(text, selectOption, match, current, childSelectors.join(','), childrenToIgnore)
                        console.log('getLabeledElement() children', children)

                        if(expectFailure && children.length === 0){
                            const otherChildSelector = 'input, button, textarea, select, i, img'
                            const otherFields = findMatchingChildren(text, selectOption, match, current, otherChildSelector, childrenToIgnore)

                            if(otherFields.length > 0){
                                /**
                                 * The expected field type was not found, but another type was.
                                 * The matched text is likely associated that other field type.
                                 * Consider this a successful failure to match, and do not
                                 * keep searching parent elment, as that will likely cause a false match
                                 * (e.g. C.4.18.0700).
                                 */
                                return null
                            }
                        }

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
                        /**
                         * We use an attribute selector because REDCap has some elements with duplicate IDs,
                         * and we want to consider all of them.  Using cy.get('#some-id') will only find the first one.
                         */
                        return cy.get('[id=' + current.htmlFor + ']').then(results => {
                            results = results.filter((index, element) => {
                                return element.tagName !== 'DIV'
                            })

                            if(results.length > 1){
                                throw "Multiple elements with this ID found: " +current.htmlFor
                            }

                            return results[0]
                        })
                    }
                } while (current = current.parentElement)
            }

            return null
        }).then(result => {
            if(expectFailure){
                // Return true when the expected element is NOT found in order to stop retrying.
                // The calling method should consider true to mean the labeled element was not found.
                return result === null
            }
            else{
                return result
            }
        })
    }, errorMessage)
    .then((match) => {
        console.log('getLabeledElement() return value', match)

        return match
    })
})

window.isExternalModuleFeature = () => {
    return window.original_spec_path.split('/redcap_source/modules/').length > 1
}

window.getFilePathForCurrentFeature = (path) => {
    if(isExternalModuleFeature()){
        // Make the path relative to parent dir of the feature file.
        const parts = window.original_spec_path.split('/')
        parts.pop()
        const absolutePath = parts.join('/') + '/' + path

        const redcapSourceIndex = absolutePath.indexOf('/redcap_source/modules/')

        // Cypress requires paths relative to the redcap_cypress/cypress/fixtures dir.
        path = '../../..' + absolutePath.substring(redcapSourceIndex)
    }

    return path
}