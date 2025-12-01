/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} text the text visually seen on screen
 * @param {string} baseElement
 * @description Visually verifies that text does NOT exist within the HTML object.
 */
Given("I should NOT see {string} on the( ){ordinal} dropdown field labeled {string}", (option, ordinal, label) => {
    cy.getLabeledElement('dropdown', label, ordinal).should('not.contain', option)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} title the HTML page title
 * @description Visually verifies that text does exist in the HTML page title.
 */
Given("I should see {string} in the title", (title) => {
    cy.title().should('include', title)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} dropdownType
 * @param {string} label - the label of the field
 * @param {string} option - the option selected
 * @param {string} baseElement
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
 * @param {string} dropdownType
 * @param {string} label the label of the row the selector belongs to
 * @param {dataTable} options the Data Table of selectable options
 * @description Visibility - Visually verifies that the element selector has the options listed
 */
Given("I should see the {dropdownType} field labeled {string} with the options below", (type, label, dataTable) => {
    let label_selector = `:contains("${label}"):visible`

    cy.top_layer(label_selector).within(() => {
        for(let i = 0; i < dataTable.rawTable.length; i++){
            let element_selector = `select:has(option:contains(${JSON.stringify(dataTable.rawTable[i][0])})):visible`
            if (type === "multiselect" || type === "radio") {
                element_selector = `div:has(label:contains(${JSON.stringify(dataTable.rawTable[i][0])})):visible`
            }
            let element = cy.get_labeled_element(element_selector, label)
            element.should('contain', dataTable.rawTable[i][0])
        }
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the text that should be displayed in an alert box
 * @param {string} select
 * @description Visually verifies that the alert box contains text
 */
Given("I should see the radio labeled {string} with option {string} {select}", (label, option, selected) => {
    cy.select_radio_by_label(label, option, false, selected === 'selected')
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} text - the text that should be displayed in a dialog box
 * @description Visually verifies that the dialog box contains text
 */
Given("I (should )see a dialog containing the following text: {string}", (text) => {
    cy.verify_text_on_dialog(text)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
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
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} text
 * @description Verifies that today's date is contained in the specified field
 */
Given("I should see today's date in the field labeled {string}", (text) => {
    const expectedDate = (new Date).toISOString().split('T')[0]
    cy.getLabeledElement('input', text).should('have.value', expectedDate);
})

/**
 * @module Visibility
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} text
 * @description Verifies that exact time is contained in the specified field
 */
Given("I should see the exact time in the field labeled {string}", (text) => {
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, '0')
    const minutes = String(today.getMinutes()).padStart(2, '0')
    const seconds = String(today.getSeconds()).padStart(2, '0')

    const expectedValue = `${hours}:${minutes}:${seconds}`

    cy.getLabeledElement('input', text).invoke('val').then((actualValue) => {
        let [h, m, s] = actualValue.split(':').map(Number)
        const actualTimeInSeconds = (h * 3600) + (m * 60) + s

        let [h_e, m_e, s_e] = expectedValue.split(':').map(Number)
        const expectedTimeInTimeInSeconds = (h_e * 3600) + (m_e * 60) + s_e

        //5 seconds tolerance
        expect(actualTimeInSeconds).to.be.closeTo(expectedTimeInTimeInSeconds, 5)
    })
})

/**
 * @module Visibility
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} filenamePlaceholder
 * @description Verifies that a file with the specified filename pattern was recently downloaded.  Date format strings in the filename pattern will match any date/time.
 */
Given("I should see a downloaded file named {string}", (filenamePattern) => {
    cy.fetch_timestamped_file(filenamePattern).then((filename) => {
        if(filename === ''){
            throw 'A file matching the specified filename pattern could not be found'
        }
    })
})

/**
 * @module Visibility
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} text
 * @description Verifies that the specified fields exists in the Online Designer
 */
Given("I should see a field named {string}", (text) => {
    cy.get(`table[role=presentation]:visible tr:visible td:visible:contains(${text})`).contains(text)
})

/**
 * @module Visibility
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} text
 * @description Verifies that an alert box was displayed with the specified text
 */
Given("I should see an alert box with the following text: {string}", (text) => {
    return new Cypress.Promise((resolve) => {
        (function waitForAlert(i = 0) {
            const hasAlertBeenDisplayed = (text) => {
                let found = false
                if (window.lastAlert !== undefined){
                    Object.keys(window.lastAlert).forEach((alert) => {
                        const age = Date.now() - window.lastAlert[alert]
                        if(age > 10000){
                            // This alert is likely from several steps ago and should not be matched
                            delete window.lastAlert[alert]
                        }

                        if(alert.includes(text)){
                            found = true
                        }
                    })
                }

                return found
            }

            if(hasAlertBeenDisplayed(text)){
                resolve('done')
            }
            else if (i < 10){
                setTimeout(waitForAlert, 500, (i + 1))
            }
        })()
    })
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
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
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} table_item - the item that you are searching for - includes "checkmark", "x", or any {string}
 * @param {string} row_label - the label of the table row
 * @param {string} column_label - the label of the table column
 * @param {string} tableName
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
 * @param {string} text - text to look for
 * @param {string} tableTypes
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
 * @param {string} headerOrNot
 * @param {string} tableTypes
 * @param {string} baseElement
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
    let html_elements = structuredClone(window.tableHtmlElements) // Clone it since we modify it in some cases

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
            const escapedLabel = label
                .replaceAll(' ', ' ') // Replace no-break space chars
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
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

                header_selector = header_selector.replace('tr:', ':')

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
                        if (isNaN(column)) {
                            console.log('columns', columns)
                            throw 'Error detecting index for column: ' + key
                        }

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
 * @description Allows us to check whether PDF has loaded in iframe
 */
Given("I should see the consent pdf has loaded in the iframe", () => {
    let selector = '.pdfobject'
    if(Cypress.$('#econsent_confirm_checkbox_div').length === 1){
        // We're on the survey consent page, and only one pdf can be shown here, so the basic selector is all we need.
    }
    else {
        // We're on the form (survey or data entry). Make sure we find a pdf within the expected parent element.
        selector = '.consent-form-pdf ' + selector
    }

    cy.frameLoaded(selector)
})

/**
 * @module Visibility
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} recordId - ID of the record we are focused on
 * @param {string} instrument - instrument we are focused on
 * @param {string} event - event we are focused on
 * @description Determine whether the lock image is visible or not for a given record
 */
Given("I should NOT see the lock image on the Record Home Page for the Data Collection Instrument labeled {string} for event {string}", (instrument, event) => {
    cy.not_loading()

    cy.table_cell_by_column_and_row_label(event, instrument, '#event_grid_table').then((record_id) => {
        expect(record_id).to.not.have.descendants('img[src*=lock]')
    })
})

/**
 * @module Visibility
 * @author Mintoo Xavier <min2xavier@gmail.com>
 * @example I should see {int} row(s) in a table
 * @param {int} num - number of row(s)
 * @description verifies a table contains the specified number of row(s)
 */
Given('I should see {int} row(s) in a table', (num) => {
 cy.get('table[id*="-table"]').find('tbody tr:visible').should('have.length', num)
})