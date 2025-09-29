//#############################################################################
//# Commands       A B C D E F G H I J K L M N O P Q R S T U V W X Y Z        #
//#############################################################################

Cypress.Commands.add("dragTo", { prevSubject: 'element'}, (subject, target) => {

    //Latest REDCap behavior - let's see that there is a Move Field with an <i> inside
    if(Cypress.$('a[data-field-action="move-field"] i').length){

        // Uncomment if REDCap changes drag and drop functionality ...
        // It will save you time by seeing what Event handlers are doing
        //
        // cy.window().then((win) => {
        //     const eventsToMonitor = [
        //         'change',
        //         'click',
        //         'keydown',
        //         'mousedown',
        //         'mousemove',
        //         'pointerdown',
        //         'dragstart',
        //         'dragend',
        //         'dragenter',
        //         'dragleave',
        //         'drop',
        //         'dragover',
        //     ];
        //
        //     // Wrap each handler to log the event
        //     eventsToMonitor.forEach((eventType) => {
        //         win.document.addEventListener(eventType, (event) => {
        //             console.log(`Event: ${eventType}`, event);
        //         })
        //     })
        // })

        // We need this included as part of the event trigger object!
        const dataTransfer = new DataTransfer() // See this for specs: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer

        //Cannot figure out why, but the srcElement kept being this <i> instead of <a> even when we selected <a> ...
        //If you look at REDCap source code ... element MUST be an <a> ... okay, brute force remove it for the test!
        cy.wrap(subject).find('a[data-field-action="move-field"] i')
            .invoke('remove')

        //That's better.  Now, start the drag from the <a> that no longer has an <i> to interfere
        cy.wrap(subject).find('a[data-field-action="move-field"]')
            .trigger('dragstart', { dataTransfer: dataTransfer })

        //This is key ... we trigger these events on the target, so we don't have to mess with X / Y coordinates
        cy.get(target)
            .trigger('dragenter', { dataTransfer: dataTransfer })
            .trigger('dragover', { dataTransfer: dataTransfer })
            .trigger('drop', { dataTransfer: dataTransfer })
            .trigger('dragend', { dataTransfer: dataTransfer })

    //This is the legacy behavior
    } else {
        console.log('Legacy Drag-n-Drop Behavior')

        //click on element
        cy.wrap(subject).trigger('mousedown')

        //move mouse to new position
        cy.get(target).trigger('mousemove', 'bottom')
            .trigger('mousemove', 'center')

        // target position changed, mouseup on original element
        cy.wrap(subject).trigger('mouseup')
    }
})

Cypress.Commands.add("dragToTarget", { prevSubject: 'element'}, (subject, target) => {
    cy.wrap(subject).drag(target, {force: true}).then((success) => {
        cy.get(target).click({force: true})
    })
})

Cypress.Commands.add("filterTableMatches", { prevSubject: true}, (results) => {
    // This method is needed for B.2.10.0300.

    const isHeader = (element) => {
        if(element.closest('.flexigrid')){
            return element.closest('.hDiv') !== null
        }
        else if(element.closest('.dataTables_scroll')){
            return element.closest('.dataTables_scrollHead') !== null
        }
        else{
            return element.tagName === 'TH'
        }
    }

    let likelyMatchRowIndex
    let likelyMatch = null
    for(const result of results){
        const row = result.closest('tr')
        const rowIndex = [...row.parentNode.children].indexOf(row)
        if(rowIndex === likelyMatchRowIndex){
            if(isHeader(likelyMatch) && !isHeader(result)){
                // Favor the existing header
            }
            else if(!isHeader(likelyMatch) && isHeader(result)){
                // Favor the new header
                likelyMatch = result
                likelyMatchRowIndex = rowIndex
            }
            else{
                /**
                 * Multiple tables had matching columns at the same row index.
                 * We can't weed anything out.
                 */
                return results
            }
        }
        else if(likelyMatch === null || rowIndex < likelyMatchRowIndex){
            likelyMatch = result
            likelyMatchRowIndex = rowIndex
        }
    }

    return [likelyMatch]
})

Cypress.Commands.add("table_cell_by_column_and_row_label", (column_label, row_label, table_selector= 'table', header_row_type = 'th', row_cell_type = 'td', row_number = 0, body_table = 'table', no_col_match_body = false) => {
    let column_num = 0
    let table_cell = null

    if(column_label === ''){
        no_col_match_body = true
    }

    function escapeCssSelector(str) {
        // Escape special characters in CSS selectors
        return str.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, "\\$1");
    }

    const orig_column_label = column_label

    column_label = escapeCssSelector(column_label)
    row_label = escapeCssSelector(row_label)

    let selector = `th:contains('${column_label}'):visible, td:contains('${column_label}'):visible`
    let td_selector = `tr:has(${row_cell_type}:visible):visible`

    if(row_number === 0) {
        td_selector = `tr:has(${row_cell_type}:contains('${row_label}'):visible):visible`
    }

    let table
    cy.top_layer(selector).find(selector).filterMatches().filterTableMatches().then(results => {
        results = results.toArray()

        if(results.length !== 1){
            console.log('table_cell_by_column_and_row_label results', results)
            throw 'Expected a single result but found ' + results.length + '. See console log for details.'
        }

        table = results[0].closest('table')
        if(table.closest('.dataTables_scrollHead') !== null){
            /**
             * The headers and cells are split into separate tables under the hood.
             * Return the outer container
             */
            table = table.closest('.dataTables_scroll')
        }
        
        return cy.wrap(table)
    }).within(() => {
        if(no_col_match_body === false || body_table !== 'table'){
            cy.get(selector).parent('tr').then(($tr) => {
                cy.wrap($tr).find('th, td').each((thi, th) => {
                    // console.log(Cypress.$(th).text().trim().includes(orig_column_label))
                    // console.log(thi)
                    if (Cypress.$(thi).text().trim().includes(orig_column_label) && column_num === 0) {
                        column_num = th
                        if(thi[0].closest('#dag-switcher-table-container')){
                            // Adjust for indicies being one off due to the rowspan
                            column_num++
                        }
                    }
                    //if (Cypress.$(thi).text().trim().includes(orig_column_label) && column_num === 0) cy.log(`Column Index: ${th}`)
                    //if (Cypress.$(th).text().trim().includes(column_label) && column_num === 0) console.log(thi)
                })
            })
        }
    }).then(() => {
        const flexigrid = table.closest('.flexigrid')
        if(flexigrid && table.querySelector('td') === null){
            // We've matched the header table.  Switch to the content table instead
            table = flexigrid.querySelector('.bDiv table')
        }
        else if(body_table === 'table.addFieldMatrixRowParent'){
            table = Cypress.$(body_table)[0]
        }

        console.log(`table_cell_by_column_and_row_label() - Looking for the \`${td_selector}\` selector in this table: `, table)

        cy.wrap(table).within(() => {
            if(table.id === 'form_rights'){
                /**
                 * This table has items that look like cells but are actually just divs.
                 * They require special handling.
                 */
                let sectionIndex, columnIndex
                cy.get(`:contains('${column_label}')`).filterMatches(column_label).then(column_header => {
                    const div = column_header.closest('div')
                    columnIndex = div.index()
                    sectionIndex = div.closest('td').index()
                })
                
                cy.get(`:contains('${row_label}')`).filterMatches(row_label).then(row_header => {
                   table_cell = row_header.closest('tr').children().eq(sectionIndex).children().eq(columnIndex)
                })

                return
            }

            row = cy.get(td_selector).eq(row_number)

            if(no_col_match_body && body_table === 'table'){
                row.then(result =>{
                    table_cell = result
                })
                
                return
            }

            row.each(($tr, $tri) => {
                console.log(`table_cell_by_column_and_row_label() - Looking for the \`${row_cell_type}\` selector in this row: `, $tr)
                cy.wrap($tr).find(row_cell_type).each((td, tdi) => {
                    // cy.log(`COL: ${column_num}`)
                    // cy.log(`ROW: ${row_number}`)
                    if (tdi === column_num){
                        table_cell = td
                    }
                })
            })

        }).then(() => {
            table_cell.each((index, value) =>{
                console.log('table_cell_by_column_and_row_label() - Returning: ', value)
            })  

            return cy.wrap(table_cell)
        })
    })
})

Cypress.Commands.add("fetch_bubble_record_homepage", (table_selector = '#event_grid_table', event, instrument, instance) => {
    cy.table_cell_by_column_and_row_label(event, instrument, '#event_grid_table')
})

Cypress.Commands.add("move_slider", (subject, cur_pos, max, min, position, label , nudge_factor = 1, move_str = '') => {
    let new_pos = position - cur_pos

    //If Gherkin integer is out of bounds, we'll go the maximum we can in the direction they wanted
    if(position > max || position < min){
        new_pos = (new_pos > 0) ?
            max - cur_pos :
            min - cur_pos
        alert(`Warning! The value requested for slider field labeled "${label}" is outside of bounds!  Max: ${max} Min: ${min}`)
    }

    //Move slider right if new_pos is positive; left if negative
    if(new_pos !== 0) {
        for (let i = 0; i < Math.abs(new_pos) * nudge_factor; i++) {
            move_str += new_pos > 0 ? `{rightArrow}` : `{leftArrow}`
        }
    }

    //Type right or left arrow, respectively ...
    if(move_str.length > 0) {
        cy.get(subject).find('span').type(move_str)
    }

    //Target position changed, mouseup on original element
    cy.wrap(subject).find('span').trigger('mouseup', {force: true})
})

Cypress.Commands.add('customSetTinyMceContent', (fieldId, content) => {
    // Wait for TinyMCE to be available
    cy.window().then(win => {
        return new Cypress.Promise(resolve => {
            // Check if TinyMCE is available
            if (win.tinymce) {
                resolve(win.tinymce)
            } else {
                // Poll every 100 milliseconds until TinyMCE is available
                const interval = setInterval(() => {
                    if (win.tinymce) {
                        clearInterval(interval)
                        resolve(win.tinymce)
                    }
                }, 100)
            }
        })
    }).then(tinymce => {
        // Wait for the editor to be ready
        return new Cypress.Promise(resolve => {
            const interval = setInterval(() => {
                const editor = tinymce.EditorManager.get(fieldId)
                if (editor) {
                    clearInterval(interval)
                    resolve(editor)
                }
            }, 100)
        })
    }).then(editor => {
        // Set the content in the editor
        editor.setContent(content, { format: 'text' })
        editor.save() // Required to fully simulate user behavior, update the associated textarea, fire events, etc.
    })
})