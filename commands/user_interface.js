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

Cypress.Commands.add("table_cell_by_column_and_row_label", (column_label, row_label, table_selector= 'table', header_row_type = 'th', row_cell_type = 'td', row_number = 0, body_table = 'table', no_col_match_body = false) => {
    let column_num = 0
    let table_cell = null

    function escapeCssSelector(str) {
        // Escape special characters in CSS selectors
        return str.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, "\\$1");
    }

    const orig_column_label = column_label

    column_label = escapeCssSelector(column_label)
    row_label = escapeCssSelector(row_label)

    let selector = `${table_selector}:has(${header_row_type}:contains('${column_label}'):visible):visible`
    let td_selector = `tr:has(${row_cell_type}:visible):visible`

    if(row_number === 0) {
        if(table_selector !== body_table){
            selector = `${table_selector}:has(${header_row_type}:contains('${column_label}'):visible):visible`
        } else {
            selector = `${table_selector}:has(${row_cell_type}:contains('${row_label}'):visible,${header_row_type}:contains('${column_label}'):visible):visible`
        }

        td_selector = `tr:has(${row_cell_type}:contains('${row_label}'):visible):visible`
    }

    cy.get(selector).first().within(() => {
        cy.get(`${header_row_type}:contains('${column_label}'):visible`).parent('tr').then(($tr) => {
            cy.wrap($tr).find(header_row_type).each((thi, th) => {
                // console.log(Cypress.$(th).text().trim().includes(orig_column_label))
                // console.log(thi)
                cy.log(Cypress.$(thi).text().trim())
                if (Cypress.$(thi).text().trim().includes(orig_column_label) && column_num === 0) column_num = th
                //if (Cypress.$(thi).text().trim().includes(orig_column_label) && column_num === 0) cy.log(`Column Index: ${th}`)
                //if (Cypress.$(th).text().trim().includes(column_label) && column_num === 0) console.log(thi)
            })
        })
    }).then(() => {

        if(body_table !== 'table'){
            if(no_col_match_body) {
                selector = `${body_table}:visible`
            } else {
                selector = `${body_table}:has(${header_row_type}:contains('${column_label}'):visible):visible`
            }
        }

        let table = Cypress.$("#table-report_list")
        if(table.length === 1){
            table = cy.wrap(table)
        } else { 
            table = cy.get(selector).first()
        }

        table.within(() => {
            cy.get(td_selector).eq(row_number).each(($tr, $tri) => {
                cy.wrap($tr).find(row_cell_type).each((td, tdi) => {
                    // cy.log(`COL: ${column_num}`)
                    // cy.log(`ROW: ${row_number}`)
                    if (tdi === column_num){
                        table_cell = td
                    }
                })
            })

        }).then(() => {
            cy.wrap(table_cell)
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
    })
})