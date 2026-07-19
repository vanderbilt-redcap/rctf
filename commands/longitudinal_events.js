//#############################################################################
//# Commands       A B C D E F G H I J K L M N O P Q R S T U V W X Y Z        #
//#############################################################################

Cypress.Commands.add("adjust_or_verify_instrument_event", (instrument_name, event_name, checked= false, click = true, disabled = false) => {
    cy.get('table#event_grid_table').within(($table) => {
        cy.get('th').contains(event_name).then(($th) => {
            $th.parents('tr').children('th').each((thi, th) => {
                if(th.innerText.includes(event_name)){
                    cy.get('td').contains(instrument_name).then(($td) => {
                        $td.parent('tr').children('td').each((tdi, td) => {
                            //If we're in the correct row and column
                            if(tdi === thi){

                                const element = Cypress.$(td).find((click) ? 'input' : 'img')

                                if(element.length){

                                    if(disabled === true){
                                        cy.wrap(element).should('be.disabled')
                                    } else if(click && element[0]['checked'] === checked){
                                        element[0].click()
                                    } else if (checked && !click) {
                                        expect(element.length).to.eq(1)
                                    } else if (!checked && !click) {
                                        expect(element.length).to.eq(0)
                                    }

                                } else {
                                    expect(element.length).to.eq(0)
                                }

                            }
                        })
                    })
                }
            })
        })
    })
})

Cypress.Commands.add('change_event_name', (current_name, proposed_name = '', production = false, save = true) => {
    if(!production && current_name === proposed_name){
        cy.intercept({
            method: 'GET',
            url: '/redcap_v' + Cypress.exposeRCTF('redcap_version') + "/Design/define_events_ajax.php?*"
        }).as('define_ajax_events')
    }

    if(!save && current_name === proposed_name) {
        cy.get('td').contains(current_name).parents('tr').within(() => {
            cy.get('img[title="Edit"]').click()
        })
    }

    cy.get('div.menubox:contains("Project status:")').then(($text) => {

    })

    if(!production) {
        if(current_name === proposed_name) {
            cy.get('div.menubox').contains('Project status:').then(($element) => {
                // Extract the text content of the entire div
                const textContent = $element.text()

                // Use a regular expression to extract the project status value
                const match = textContent.match(/Project status:\s*(\w+)/);
                const projectStatus = match ? match[1] : ''

                // Check if the project status is not 'Production'
                if (projectStatus !== 'Production') {
                    cy.wait('@define_ajax_events')
                }
            })
        }

        if(save) {
            cy.intercept({
                method: 'POST',
                url: '/redcap_v' + Cypress.exposeRCTF('redcap_version') + "/Design/define_events_ajax.php"
            }).as('save_events')
        }

            if(current_name !== proposed_name) {
                cy.get('input[value="' + current_name + '"]').clear().type(proposed_name).parents('tr').within(() => {
                    if (save) {
                        cy.get('input[value=Save]').click()
                    }
                })
            }

        if(save) {
            cy.wait('@save_events')
        }
    }
})

Cypress.Commands.add('delete_event_name', (event_name) => {
    cy.intercept({
        method: 'GET',
        url: '/redcap_v' + Cypress.exposeRCTF('redcap_version') + "/Design/define_events_ajax.php?*"
    }).as('delete_ajax_events')

    cy.get('td').
    contains(event_name).
    parents('tr').within(() => {
        cy.get('img[title="Delete"]').click()
    })
    cy.wait('@delete_ajax_events')
})

