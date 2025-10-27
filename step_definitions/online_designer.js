/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enterType
 * @param {string} choices - the choices in string format
 * @param {string} addEditField
 */
Given('I {enterType} Choice(s) of {string} in(to) the open "{addEditField}" dialog box', (enter_type, choices) => {
    let field_choices = cy.select_field_choices()
    if(enter_type === "clear field and enter") {
        field_choices.clear()
        field_choices.type(`{enter}${choices}`)
    } else if (enter_type === "verify") {
        console.log(field_choices.value)
        console.log(field_choices)
        field_choices.should('contain.value', choices)
    } else {
        field_choices.type(`{enter}${choices}`)
    }
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field to edit
 * @param {string} addEditField
 * @description Edits the field label of the open dialog box
 */
Given('I enter {string} into the Field Label of the open "{addEditField}" dialog box', (field_label) => {
    cy.get('textarea#field_label').clear().type(field_label)
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} variable_name - the variable_name of the field to edit
 * @param {string} addEditField
 * @description Edits the variable name of the open dialog box
 */
Given('I enter {string} into the Variable Name of the open "{addEditField}" dialog box', (field_label) => {
    cy.get('input#field_name').clear().type(field_label)
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} equation - the equation to enter
 * @param {string} addEditField
 * @description Enters specified equation into a Calculated Field within an open "Edit Field" dialog box
 */
Given('I enter the equation {string} into Calculation Equation of the open "{addEditField}" dialog box', (equation) => {
    cy.get('textarea#element_enum').click()
    cy.get('div.ace_content').type("{shift}{home}{del}" + equation)
    cy.get('button').contains('Update & Close Editor').click()
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field to edit
 * @param {string} addEditField
 * @description Selects option from the Field Type dropdown in open "Edit Field" dialog box
 */
Given('I select {string} from the Field Type dropdown of the open "{addEditField}" dialog box', (dropdown_option) => {
    cy.get('select#field_type').select(dropdown_option)
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} label - the label of the field to edit
 * @param {string} addEditField
 * @description Selects option from the Validation dropdown in open "Edit Field" dialog box
 */
Given('I select {string} from the Validation dropdown of the open "{addEditField}" dialog box', (dropdown_option) => {
    cy.get('select#val_type').select(dropdown_option)
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Marks a field as required within the Online Designer.
 */
Given("I mark the field required", () => {
    cy.get('input#field_req1').click()
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Marks a field as NOT required within the Online Designer.
 */
Given("I mark the field as NOT required", () => {
    cy.get('input#field_req0').click()
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Marks a field as required within the Online Designer.
 */
Given("I mark the field as an identifier", () => {
    cy.get('input#field_phi1').click()
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Marks a field as NOT an identifier within the Online Designer.
 */
Given("I mark the field as NOT an identifier", () => {
    cy.get('input#field_phi0').click()
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} instrument - the name of the instrument you are adding an instrument below
 * @description Interactions - Clicks the Add Instrument Here button below a specific Instrument name
 */
Given("I add an instrument below the instrument named {string}", (instrument) => {
    cy.get('table[id=table-forms_surveys]')
        .find('tr').contains(instrument)
        .parents('tr')
        .next().find('button').contains("Add instrument here").click()
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} action
 * @param {string} instrument - the name of the instrument that a form should be added below
 * @description Interactions - Clicks the "choose action" button and clicks an anchor link
 */
Given("I click on the Instrument Action {string} for the instrument named {string}", (action, instrument) => {
    cy.get('table[id=table-forms_surveys]')
        .find('tr').contains(instrument)
        .parents('tr').find('button').contains('Choose action').click()
    cy.get('ul[id=formActionDropdown]').find('a').contains(action).click({force: true})
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} instrument - the naame of the instrument being drag-n-dropped
 * @param {int} position - the position (index starting from 0) where the instrument should be placed
 * @description Interactions - Drag and drop the instrument to the int position
 */
Given("I drag on the instrument named {string} to position {int}", (instrument, position) => {
    cy.get('table[id=table-forms_surveys]').find('tr').contains(instrument).parents('tr').then((row) => {
        cy.get('table[id=table-forms_surveys]').find('tr').eq(position).find('td[class=dragHandle]').as('target')
        cy.wrap(row).find('td[class=dragHandle]').dragTo('@target')
    })
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} addField
 * @param {string} target - the name of the field you want to add a field below
 * @description Clicks on one of the add field options below a specified field name
 */
Given("I click on the {addField} input button below the field named {string}", (type, target) => {
    cy.get('tbody[class=formtbody]').children('tr:contains(' + target +')').contains(target)
        .parents('tr').next('tr:has(input[value="' + type + '"])').first().within(() => {
        cy.get('input[value="' + type + '"]').click()
    })
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} editField
 * @param {string} field - the name of the field you want to edit
 * @description Clicks on the image link of the action you want to perform on a field
 */

Given("I click on the {editField} image for the field named {string}", (type, field_name) => {
    cy.click_on_design_field_function(type, field_name)
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} type - the type of edit action you want to perform on a field
 * @description Interactions - Clicks on the image link of the action you want to perform on a field
 */
Given("I delete the field named {string}", (field_name) => {
    cy.click_on_design_field_function("Delete Field", field_name)

    cy.intercept({
        method: 'GET',
        url: '/redcap_v' + Cypress.env('redcap_version') + "/Design/delete_field.php?*"
    }).as('delete_field')

    cy.intercept({
        method: 'GET',
        url: '/redcap_v' + Cypress.env('redcap_version') + "/Design/online_designer_render_fields.php?*"
    }).as('render_fields')

    cy.get('button').contains('Delete').click()

    cy.wait('@delete_field')
    cy.wait('@render_fields')
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} field_name - name of field you want to move
 * @param {string} after_field - name of field you want to move AFTER
 * @description Moves a field AFTER the field specified
 */
Given("I move the field named {string} after the field named {string}", (field_name, after_field) => {
    cy.click_on_design_field_function("Move", field_name)

    //Get the variable name of the field to move "after"
    cy.get('label:contains(' + after_field + '):visible').then(($label) => {
        const after_field_var_name = $label[0]['id'].split('label-')[1]
        cy.get('#move_after_field').select(after_field_var_name).should('have.value', after_field_var_name)
    })

    cy.intercept({
        method: 'POST',
        url: '/redcap_v' + Cypress.env('redcap_version') + "/Design/move_field.php?*"
    }).as('move_field')

    cy.get('button').contains('Move field').click()

    cy.wait('@move_field')

    cy.click_on_dialog_button("Close")
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} field - the name of the field being drag-n-dropped
 * @param {int} position - the position (index starting from 0) where the instrument should be placed
 * @description Interactions - Drag and drop the field to the int position
 */
Given("I drag (on )the field variable named {string} {aboveBelow} the field variable named {string}", (fieldToMove, aboveBelow, fieldAfter) => {
    let field_index

    cy.get('table[id*=design-]').then((rows) => {
        for(let i = 0; i < rows.length; i++){
            cy.wrap(rows.eq(i)).then((row) =>{
                if(row.text().includes(`Field Name: ${fieldAfter}\n`) || row.text().includes(`Variable: ${fieldAfter}\n`)){
                    field_index = aboveBelow === "above" ? i : i + 1
                }
            })
        }
    }).then(() => {
        cy.get(`table[id*=design-]:contains(${JSON.stringify(`Field Name: ${fieldToMove}`)}), table[id*=design-]:contains(${JSON.stringify(`Variable: ${fieldToMove}`)})`).then((row) => {
            cy.get('table[id*=design-]').eq(field_index).as('target')
            cy.wrap(row).dragTo('@target')
        })
    })
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} fieldBefore - the field name that comes before
 * @param {string} beforeAfter
 * @description Visually verifies that the fieldBefore is before fieldAfter
 */
Given("I should see (a )(the )field named {string} {beforeAfter} field named {string}", (fieldBefore, before_after, fieldAfter) => {
    if(before_after === "before") {
        cy.get('tr[id*=-tr]').contains(fieldBefore).parents('tr[id*=-tr]').nextAll().contains(fieldAfter)
    } else if (before_after === "after"){
        cy.get('tr[id*=-tr]').contains(fieldBefore).parents('tr[id*=-tr]').nextAll().contains(fieldAfter)
    }
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @author Madilynn Peterson <mmpeterson24@wisc.edu>
 * @param {string} fieldType
 * @param {string} variable_name - variable name
 * @description Creates a new field in the Online Designer
 */
Given("I add a new {fieldType} field labeled {string} with variable name {string} and click on the {string} button", (field_type, field_text, variable_name, save_button_text) => {
    const legacy_selector = `table[id*=design-]:contains(${JSON.stringify(`Variable: ${variable_name}`)})`
    const current_selector = `table[id*=design-]:contains(${JSON.stringify(`Field Name: ${variable_name}`)})`
    
    cy.get('input#btn-last').click().then(() => {
        cy.get('select#field_type')
            .find('option')
            .contains(field_type)
            .then( ($option) => {
                cy.get('select#field_type').select($option[0].innerText)
            })

        cy.get('input#field_name').type(variable_name)
        cy.get('input#field_label_rich_text_checkbox').uncheck()
        cy.get('textarea#field_label').type(field_text)
        cy.get('button').contains(save_button_text).click().then(() => {
            cy.get('table#draggable:visible').should(($parent) => {
                const child = $parent.find(`${legacy_selector},${current_selector}`)
                expect(child).to.have.length.greaterThan(0)
            })
        })
    })
})


/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} instrument - the naame of the instrument being drag-n-dropped
 * @param {string} ordinal
 * @description Interactions - Drag and drop the instrument to the int position
 */
Given("I drag the instrument named {string} to the{ordinal} row", (instrument, position) => {
    cy.get('table[id=table-forms_surveys]').find('tr').contains(instrument).parents('tr').then((row) => {
        cy.get('table[id=table-forms_surveys]').find('tr').eq(window.ordinalChoices[position]).find('td[class=dragHandle]').as('target')
        cy.wrap(row).find('td[class=dragHandle]').dragTo('@target')
    })
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} instrument - the naame of the instrument being drag-n-dropped
 * @param {string} ordinal
 * @description Interactions - Drag and drop the instrument to the int position
 */
Given("I (should) see the instrument named {string} in the{ordinal} row", (instrument, position) => {
    cy.get('table[id=table-forms_surveys]').find('tr').each((row, index) => {
        if(index === window.ordinalChoices[position]){
            cy.wrap(row).find('td').then(($td) => {
                expect($td).to.contain(instrument)
            })
        }
    })
})

/**
 * @module OnlineDesigner
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} field - the name of the field being drag-n-dropped
 * @param {string} ordinal
 * @description Interactions - Drag and drop the field to the int position
 */
Given("I drag the field named {string} to the{ordinal} row", (field, position) => {
    cy.get('table[id*=design-]').contains(field).parents('table[id*=design-]').then((row) => {
        cy.get('table[id*=design-]').eq(window.ordinalChoices[position]).as('target')
        cy.wrap(row).dragTo('@target')
    })
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} field_label - the label of the field
 * @description Interactions - Clicks the reset link for a specific field label
 */
Given('I click the "reset" link for the field labeled {string}', (label) => {
    cy.get(`tr:has(label:contains(${JSON.stringify(label)}))`).
        find('a:contains("reset"):visible').
        eq(0).click()
})

/**
 * @module OnlineDesigner
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} text - the text we're looking for
 * @param {string} variable_name - the REDCap field within with to look
 * @description Looks for the specified text within the specified REDCap field
 */
Given("I (should )see {string} within the field with variable name {string}", (text, variable_name) => {
    cy.not_loading()
    
    const legacy_selector = `table[id*=design-]:contains(${JSON.stringify(`Variable: ${variable_name}`)})`
    const current_selector = `table[id*=design-]:contains(${JSON.stringify(`Field Name: ${variable_name}`)})`

    cy.get(`${current_selector},${legacy_selector}`).then((row) => {
        cy.wrap(row).should('contain.text', text)
    })
})