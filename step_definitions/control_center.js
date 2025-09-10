const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module ControlCenter
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} enableDisable - available options: 'enable', 'disable'
 * @param {string} admin_user - the name of the user you are setting the privilege for
 * @description Enables the privilege for the administrator based upon user.
 */
Given('I {enableDisable} the Administrator Privilege {string} for the administrator {string}', (action, privilege, admin_user) => {
    cy.intercept({ method: 'POST', url: '*saveAdminPriv*'}).as('admin_privileges')

    cy.get('table#admin-rights-table').within(($table) => {
        cy.get('th').contains(privilege).then(($th) => {
            $th.parents('tr').children('th').each((thi, th) => {
                if(th.innerText.includes(privilege)){
                    cy.get('td').contains(admin_user).parentsUntil('td').parent().then(($td) => {
                        $td.parent('tr').children('td').each((tdi, td) => {
                            //If we're in the correct row and column
                            if(tdi === thi){
                                const element = Cypress.$(td).find('input')
                                if(element.length){
                                    //Do nothing for cases where we request same thing we already have
                                    if( (element[0].checked && action === 'enable') || (!element[0].checked && action === 'disable') ) {

                                        //check and wait for the XHR request to finish
                                    } else if (!element[0].checked && action === 'enable') {
                                        cy.wrap(element[0]).check()
                                        cy.wait('@admin_privileges')

                                        //uncheck and wait for the XHR request to finish
                                    } else if (element[0].checked && action === 'disable') {
                                        cy.wrap(element[0]).uncheck()
                                        cy.wait('@admin_privileges')
                                    }
                                }
                            }
                        })
                    })
                }
            })
        })
    })

})

/**
 * @module ControlCenter
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} privilege - the label of the privilege you want for the user
 * @description Enables the privilege for the administrator based upon user.
 */
Given('I enable the Administrator Privilege {string} for a new administrator', (privilege) => {
    cy.get('table#admin-rights-table').within(($table) => {
        cy.get('th').contains(privilege).then(($th) => {
            $th.parents('tr').children('th').each((thi, th) => {
                if(th.innerText.includes(privilege)){
                    cy.get('input#user_search').parentsUntil('td').parent().then(($td) => {
                        $td.parent('tr').children('td').each((tdi, td) => {
                            if(tdi === thi){
                                const element = Cypress.$(td).find('input')
                                if(element.length){
                                    cy.wrap(element[0]).check()
                                }
                            }
                        })
                    })
                }
            })
        })
    })
})


/**
 * @module ControlCenter
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} toDoTableIcons - available options: 'process request', 'get more information', 'add or edit a comment', 'Move to low priority section', 'archive request notification'
 * @param {string} toDoRequestTypes - available options: 'Move to prod', 'Approve draft changes', 'Copy project', 'Delete project'
 * @param {string} project_name - the text value of project name you want to target
 * @param {string} toDoTableTypes - available options: 'Pending Requests', 'Low Priority Pending Requests', 'Completed & Archived Requests'
 * @description Clicks on an icon within the To-Do-List page based upon Icon, Request Type, Project Name, and Table Name specified.
 */
Given('I click on the "{toDoTableIcons}" icon for the "{toDoRequestTypes}" request created for the project named {string} within the "{toDoTableTypes}" table', (icon, request_type, project_name, table_name) => {
    cy.get(`.${window.toDoListTables[table_name]}`).within(() => {
        cy.get(`.request-container:contains("${project_name}"):has(.type:contains("${request_type}"))`).within(() => {
            cy.get(`button[data-tooltip="${icon}"]`).click()
        })
    })
})

/**
 * @module ControlCenter
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} toDoRequestTypes - available options: 'Move to prod', 'Approve draft changes', 'Copy project'
 * @param {string} project_name - the text value of project name you want to target
 * @param {string} toDoTableTypes - available options: 'Pending Requests', 'Low Priority Pending Requests', 'Completed & Archived Requests'
 * @description Identifies Request Type within the To-Do-List page based upon Project Name, and Table Name specified.
 */
Given('I (should )see the "{toDoRequestTypes}" request created for the project named {string} within the "{toDoTableTypes}" table', (request_type, project_name, table_name) => {
    cy.get(`.${window.toDoListTables[table_name]}`).within(() => {
        cy.get(`.request-container:contains("${project_name}"):has(.type:contains("${request_type}"))`)
    })
})