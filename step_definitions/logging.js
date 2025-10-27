/**
 * @module Logging
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @param {string} text - dropdown option
 * @description Select logging option from the Filter by username dropdown field
 */
 Given('I select the {string} option from the Filter by username dropdown field', (text) => {
    cy.get('select[id="usr"]').select(text).should('have.value', text)
})

/**
 * @module Logging
 * @author Rushi Patel <rushi.patel@uhnresearch.ca>
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @description Exports all logging from the Logging page
 */
 Given('I export all logging from the project and verify the result against expected logging results for this version of REDCap', () => {
    var today = new Date();
    var day =("0"+today.getDate()).slice(-2); //Make sure we zero pad
    var month = ("0"+(today.getMonth() + 1)).slice(-2); //Make sure we zero pad
    var year = today.getFullYear();

    let version = Cypress.env('redcap_version').split('.')[0]

     cy.fixture(`logs/v${version}.csv`).then(fixture_data => {
         cy.task('parseCsv', {csv_string: fixture_data}).then((expected_csv) => {
             cy.export_logging_csv_report().should((actual_csv) => {
                 actual_csv.forEach((a, i) => {
                     if(i === 0){
                         expect(actual_csv[i][0]).to.contain(expected_csv[i][0])
                     } else {
                         //Excluding unless we can figure out bulletproof method for DAY
                         //expect(actual_csv[i][0]).to.contain(`${year}-${month}-${day}`)
                     }

                     expect(actual_csv[i][1]).to.contain(expected_csv[i][1])
                     expect(actual_csv[i][2]).to.contain(expected_csv[i][2])
                     expect(actual_csv[i][3]).to.contain(expected_csv[i][3])
                 })
             })
         })
     })
})