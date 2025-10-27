/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} currentName - the name of the event when this step is reached
 * @param {string} proposedName - the name of the event to change the current event name to
 * @description Changes the name of an event on the "Define My Events" page for a Longitudinal Project
 */
Given("I change the current Event Name from {string} to {string}", (current_name, proposed_name) => {
   cy.change_event_name(current_name, proposed_name, false, false)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} currentName - the name of the event when this step is reached
 * @description Verifies the event name cannot be changed in production mode
 */
Given("I verify I cannot change the Event Name of {string} while in production", (current_name) => {
   cy.change_event_name(current_name, current_name, true)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} eventName - the name of the event
 * @param {int} days - number of days offset
 * @description Adds an event via the "Define My Events" page for a Longitudinal Project
 */
Given("I add an event named {string} with offset of {int} day(s) into the currently selected arm", (event_name, days) => {
   cy.intercept({
      method: 'GET',
      url: '/redcap_v' + Cypress.env('redcap_version') + "/Design/define_events_ajax.php?*"
   }).as("add_event")

   // IMPORTANT NOTE: We are intentionally selecting one column to the left of what we want
   // The "Add new event" button spans across two cells!
   //Setting the Event name
   cy.table_cell_by_column_and_row_label("Offset Range", "Descriptive name for this event", 'table#event_table', 'td').then(($td) => {
      cy.wrap($td).find('input').type(event_name)
   })

   // Setting the number of days.  Same column offset as noted above applies!
   cy.table_cell_by_column_and_row_label("Event #", "Descriptive name for this event", 'table#event_table', 'td').then(($td) => {
      cy.wrap($td).find('input').type(days)
   })

   //Tried doing this with the Cypress recommended way but it failed because behvaior is inconsistent!
   //See example: https://glebbahmutov.com/blog/detect-page-reload/
   //cy.window().then(w => w.beforeReload = true)
   //cy.window().should('have.prop', 'beforeReload', true)

   cy.get("#addbutton").click()

   cy.wait("@add_event")
   cy.get('#progress').should('not.be', 'visible')
   cy.get('div#working').should('not.be', 'visible')

   // The behavior is not consistent from one load to the next ...
   // So we get stuck with fixed wait rather than doing something in Cypress recommended fashion.
   // The code with cy.window() worked intermittently, so I guess we are better off waiting
   cy.wait(3000)

   //Make sure that we've reloaded (we will know if the variable is no longer there!)
   //cy.window().should('not.have.prop', 'beforeReload')
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} editEvent
 * @param {string} eventName - name of the Event targeted
 * @description Clicks on the image link of the action you want to perform on a event
 */
Given("I click on the {editEvent} image for the event named {string}", (type, event_name) => {
   if(type === "Edit"){
      cy.change_event_name(event_name, event_name, false, false)
   } else if (type === "Delete"){
      cy.delete_event_name(event_name)
   }
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the instrument
 * @param {string} eventName - the name of the event
 * @description Verifies an instrument exists within an event on a longitudinal project
 */
Given("I {notSeeDC} {string} for the Event named {string}", (not_see, instrument, event) => {

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
      (not_see === 'should NOT see a Data Collection Instrument named' || not_see === 'should no longer see a Data Collection Instrument named') ?
          expect(instruments).not.to.include(instrument) :
          expect(instruments).to.include(instrument)
   })
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} icon - the name of the icon expected
 * @param {string} instrumentName - the name of the Data Collection Instrument targeted
 * @param {string} instance - (optional) the name of the instance, if using repeating instruments
 * @param {string} eventName - the name of the specific event targeted
 * @description Verifies the icon given a specific longitudinal instrument and event (optional instance for repeating instruments)
 */
Given('I (should )see the {string} icon for the {string} longitudinal instrument( for instance ){optionalString} on event {string}', (icon, instrument, instance = '', event ) => {
   if(instance === ''){
      cy.table_cell_by_column_and_row_label(event, instrument, 'table#event_grid_table').then(($td) => {
         cy.wrap($td).find('a:visible:first').then((link_location) => {
            expect(link_location).to.have.descendants(window.recordStatusIcons[icon])
         })
      })
   } else {
      cy.table_cell_by_column_and_row_label(instrument, instance, `div#repeating_forms_table_parent table:contains(${JSON.stringify(event)})`).then(($td) => {
         cy.wrap($td).parent('tr:first').find('a:visible:first').then((link_location) => {
            expect(link_location).to.have.descendants(window.recordStatusIcons[icon])
         })
      })
   }
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see the {string} icon for the {string} longitudinal instrument on event {string} for record {string}
 * @param {string} icon - the name of the icon expected
 * @param {string} instrumentName - the name of the Data Collection Instrument targeted
 * @param {string} eventName - the name of the specific event targeted
 * @param {string} record - the name of the specific event targeted
 * @description Verifies the icon given a specific longitudinal instrument and event for a given record
 */
Given( /I (?:should )?see the "(.*)" icon for the "(.*)" (?:longitudinal )?instrument(?: on event "(.*)")? for record "(.*)"$/, (icon, instrument, event, record) => {
   if(event === undefined){ event = null }
   cy.get_record_status_dashboard(event, instrument, record, '', false, icon)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the Data Collection Instrument we are enabling for a specific event
 * @param {string} eventName - the name of the event to enable the Data Collection Instrument for
 * @description Enables a Data Collection Instrument for a specific Event within a Longitudinal Project.  (Assumption: User is on "Designate Instruments for My Events" page.)
 */
Given("I enable the Data Collection Instrument named {string} for the Event named {string}", (instrument_name, event_name) => {
   cy.adjust_or_verify_instrument_event(instrument_name, event_name)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the Data Collection Instrument we are disabling for a specific event
 * @param {string} eventName - the name of the event to disable the Data Collection Instrument for
 * @description Disables a Data Collection Instrument for a specific Event within a Longitudinal Project. (Assumption: User is on "Designate Instruments for My Events" page.)
 */
Given("I disable the Data Collection Instrument named {string} for the Event named {string}", (instrument_name, event_name) => {
   cy.adjust_or_verify_instrument_event(instrument_name, event_name, true)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the Data Collection Instrument we are disabling for a specific event
 * @param {string} eventName - the name of the event to disable the Data Collection Instrument for
 * @description Verifies a Data Collection Instrument is enabled for a specific Event within a Longitudinal Project. (Assumption: User is on "Designate Instruments for My Events" page.)
 */
Given("I verify the Data Collection Instrument named {string} is enabled for the Event named {string}", (instrument_name, event_name) => {
   cy.adjust_or_verify_instrument_event(instrument_name, event_name, true, false)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the Data Collection Instrument we are disabling for a specific event
 * @param {string} eventName - the name of the event to disable the Data Collection Instrument for
 * @description Verifies a Data Collection Instrument is disabled for a specific Event within a Longitudinal Project. (Assumption: User is on "Designate Instruments for My Events" page.)
 */
Given("I verify the Data Collection Instrument named {string} is disabled for the Event named {string}", (instrument_name, event_name) => {
   cy.adjust_or_verify_instrument_event(instrument_name, event_name, false, false)
})

/**
 * @module LongitudinalEvents
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} instrumentName - the name of the Data Collection Instrument we are disabling for a specific event
 * @param {string} eventName - the name of the event to disable the Data Collection Instrument for
 * @description Verifies a Data Collection Instrument is unmodifiable for a specific Event within a Longitudinal Project. (Assumption: User is on "Designate Instruments for My Events" page.)
 */
Given("I verify the Data Collection Instrument named {string} is unmodifiable for the Event named {string}", (instrument_name, event_name) => {
   cy.adjust_or_verify_instrument_event(instrument_name, event_name, false, true, true)
})

/**
 * @module LongitudinalProjectSetup
 * @author Mintoo Xavier <min2xavier@gmail.com>
 * @param {string} eventName - name of event in row where X would be
 * @description Verifies the Delete image for the event is not present
 */
Given("I should NOT see the Delete image for the Event named {string}", (event_name) => {
   cy.get(window.tableMappings['define events']).find('td').contains(event_name).parents('tr').within((tr) => {
      expect(tr).to.not.have.descendants(window.onlineDesignerFieldIcons['Delete'])
   })
})