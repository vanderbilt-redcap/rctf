//#############################################################################
//# Commands       A B C D E F G H I J K L M N O P Q R S T U V W X Y Z        #
//#############################################################################

Cypress.Commands.add('get_record_status_dashboard', (event, instrument, record_id, cell_action, click = true, icon) => {

    // TODO: This is badly in need a refactor using pseudo-selectors but haven't had time yet

    let link_location = null
    let instrument_location = null
    let event_sections = {}
    let event_counter = 0
    let repeating = false

    if(cell_action === " and click the repeating instrument bubble for the first instance" ||
        cell_action === " and click the repeating instrument bubble for the second instance" ||
        cell_action === " and click the repeating instrument bubble for the third instance"){
        repeating = true
    }

    cy.get('table#record_status_table').within(() => {

        cy.get('thead').within(() => {
            cy.get('tr').then(($first_tr) => {
                Cypress.$.each($first_tr, (tri_row, tri_html) => {
                    if(tri_row === 0){
                        Cypress.$(tri_html).children().each(($thi, $th) => {
                            if($thi > 0) { //exclude Record ID
                                event_sections[$th.innerText] = { colspan: $th.colSpan, start: event_counter, end: event_counter + $th.colSpan - 1 }
                                event_counter += $th.colSpan
                            }
                        })
                    }
                })
            })
        })

        //console.log(event_sections)
        //console.log(event_counter)

        let current_event

        cy.get('th').then(($th) => {
            Cypress.$.each($th, (index, th) => {
                cy.get('tr').then(($tr) => {
                    Cypress.$.each($tr, (tri, tr) => {

                        //console.log(tri)

                        if(tri === 0 && event === null) {

                            cy.wrap(tr).within(() => {
                                cy.get('th').then((th) => {
                                    Cypress.$.each(th, (thi, $thi) => {

                                        current_event = event_sections[instrument]

                                        if($thi.innerText === instrument){
                                            instrument_location = thi
                                        }
                                    })

                                })
                            })

                        } else if (tri === 1 && event !== null){
                            cy.wrap(tr).within(() => {
                                cy.get('th').then((th) => {
                                    Cypress.$.each(th, (thi, $thi) => {

                                        current_event = event_sections[event]

                                        // console.log(thi)
                                        // console.log(current_event['start'])
                                        // console.log(current_event['end'])

                                        if($thi.innerText === instrument && thi >= current_event['start'] && thi <= current_event['end']){
                                            instrument_location = thi
                                        }
                                    })

                                })
                            })

                            //console.log(instrument_location)

                        } else if (tri >= 1) {

                            //console.log('in here')

                            cy.wrap(tr).within(() => {
                                cy.get('td').then((td) => {

                                    //console.log(td[0].innerText.length)
                                    //console.log(td[0].innerText.trim().length)

                                    //Here is where we locate the record we're interested in
                                    if (td[0].innerText.trim() === record_id) {
                                        Cypress.$.each(td, (tdi, $td) => {

                                            //console.log(tdi)

                                            if (tdi === instrument_location + 1 || (event === null && tdi === instrument_location) ) {

                                                //console.log('instrument location reached')
                                                //console.log($td)

                                                cy.wrap($td).within(() => {

                                                    if(cell_action === " and click on the bubble" || repeating || !click){
                                                        cy.get('a').then(($a) => {
                                                            link_location = $a
                                                        })
                                                    } else if (cell_action === " and click the new instance link") {
                                                        cy.get('button').then(($button) => {
                                                            link_location = $button
                                                        })
                                                    }

                                                })
                                            }
                                        })
                                    }
                                })
                            })

                        }
                    })
                })
            })
        })
    }).then(() => {
        cy.intercept({
            method: 'POST',
            url: '/redcap_v' + Cypress.env('redcap_version') + '/index.php?*'
        }).as('instance_table')

        if(click){
            cy.wrap(link_location).click()
        } else {
            expect(link_location).to.have.descendants(window.recordStatusIcons[icon])
        }

        if(repeating){
            cy.wait('@instance_table')

            cy.get('#instancesTablePopup').within(() => {
                let instance = null

                if(cell_action === " and click the repeating instrument bubble for the first instance"){
                    instance = 1
                } else if (cell_action === " and click the repeating instrument bubble for the second instance"){
                    instance = 2
                } else if (cell_action === " and click the repeating instrument bubble for the third instance"){
                    instance = 3
                }

                cy.get('td').contains(instance).parent('tr').within(() => {
                    cy.get('a').click()
                })
            })
        }
    })

})

Cypress.Commands.add('instrument_visibility', (not_see, instrument, event) => {

    let event_sections = {}
    let event_counter = 0
    let instruments = []

    cy.get('table#record_status_table').within(() => {
        cy.get('thead').within(() => {
            cy.get('tr').then(($first_tr) => {
                Cypress.$.each($first_tr, (tri_row, tri_html) => {
                    Cypress.$(tri_html).children().each(($thi, $th) => {
                        if (tri_row === 0) {
                            event_sections[$th.innerText] = {
                                start: event_counter,
                                end: (event_counter + $th.colSpan) - 1
                            }
                            event_counter += $th.colSpan
                        } else if (tri_row > 0) {
                            const current_event = event_sections[event]
                            if ($thi >= (current_event['start'] - 1) && ($thi <= current_event['end'] - 1) ) {
                                instruments.push($th.innerText)
                            }
                        }
                    })
                })
            })
        })
    }).then(() => {
        (not_see === 'not ') ?
            expect(instruments).not.to.include(instrument) :
            expect(instruments).to.include(instrument)
    })

})