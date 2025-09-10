const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module CSV
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} filename - the filename the downloaded CSV
 * @param {int} num_rows - the number of row sthe CSV file should have
 * @description Verifies number of rows the CSV file should have.
 */
 Given("the downloaded CSV with filename {string}( should have)( has) {int} row(s)", (filename, num_rows) => {
     cy.download_file(filename).then( ($text) => {
         cy.task('parseCsv', {csv_string: $text}).then((csv_rows) => {
             expect(csv_rows.length).to.equal(num_rows)
         })
    })
})

/**
 * @module CSV
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} filename - the filename the downloaded CSV
 * @param {string} headerOrNot - available options: 'header and', 'header'
 * @param {DataTable} headings the DataTable of headings this file should have
 * @description Verifies headers and rows of the CSV file.
 */
Given("the downloaded CSV with filename {string}( should have)( has) the( ){headerOrNot}( row)(s) below", (filename, header, table) => {
    cy.download_file(filename).then( ($text) => {
        cy.task('parseCsv', {csv_string: $text}).then((csv_rows) => {
            const headings = csv_rows[0]
            const table_rows = table.hashes()
            let col_tables = {}

            if(header === "header and" || header === "header" ) {
                for (let $i = 0; $i <= headings.length; $i++) {
                    for (let i = 0; i < table.rawTable[0].length; i++) {
                        if (table.rawTable[0][i] !== undefined &&
                            col_tables[table.rawTable[0][i]] === undefined &&
                            table.rawTable[0][i] === headings[$i]) {
                            expect(headings[$i]).to.equal(table.rawTable[0][i])
                            col_tables[table.rawTable[0][i]] = {index: $i}
                        }
                    }
                }
            }

            if(header === "header and") {
                for (let row = 0; row < table_rows.length; row++) {
                    let csv_line = csv_rows[row + 1]
                    let current_row = table_rows[row]

                    for (let key = 0; key < table.rawTable[0].length && key < csv_line.length; key++) {
                        let col_key = table.rawTable[0][key]
                        let col_index = col_tables[col_key]['index']
                        expect(csv_line[col_index]).to.include(current_row[col_key])
                    }
                }
            }
        })
    })
})
/**
 * @module CSV
 * @author Tintin Nguyen <tin-tin.nguyen@nih.gov>
 * @param {string} filename - the filename the downloaded CSV
 * @param {string} value - the value of the column data we are verifying
 * @param {string} column - the text name of the column data we are verifying
 * @description Verifies a row value exists for a given column within a CSV file.
 */
 Given("the downloaded CSV with filename {string}( should have)( has) a value {string} for column {string}", (filename, value, column) => {
     cy.download_file(filename).then(($text) => {
         cy.task('parseCsv', {csv_string: $text}).then((csv_rows) => {
             let lines = csv_rows
             let columns = lines[0]
             let index = columns.indexOf(column)

             expect(index).to.be.greaterThan(-1)

             let found_value = { match: false, type: null, value: null }
             let promise = Promise.resolve()

             promise = promise.then(() => {
                 for (let i = 1; i < lines.length; i++) {
                     let columns = lines[i]
                     let columnValue = columns[index]
                     if (columnValue.includes(value)) {
                         found_value['match'] = true
                         found_value['type'] = 'string'
                         found_value['value'] = columnValue
                         return Promise.resolve()
                     } else if (window.dateFormats.hasOwnProperty(value)){
                         const substring = columnValue.match(window.dateFormats[value])
                         const isMatch = substring !== null
                         if(isMatch){
                             found_value['match'] = true
                             found_value['type'] = 'datetime'
                             found_value['value'] = columnValue
                             return Promise.resolve()
                         }
                     }
                 }
             })

             promise.then(() => {
                 if (found_value['match'] && found_value['type'] === 'datetime') {
                     expect(found_value['value']).to.match(window.dateFormats[value])
                 } else if (found_value['match']) {
                     expect(found_value['value']).to.contain(value)
                 }

             }).catch((error) => {
                 console.error("An error occurred:", error)
             })
         })
     })
})

/**
 * @module CSV
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} column_label - column in the CSV file
 * @param {string} record_name - name of the record in the CSV file
 * @description Verifies that a date has shifted from today's date
 */
Given("I verify the {dateTimeType} in column labeled {string} for record {string} has shifted today's date in the latest downloaded {string}", (date_time_type, column, record_name, format) => {
    const today = new Date()
    const formattedToday = today.toISOString().split('T')[0]

    cy.task('fetchLatestDownload', { fileExtension: format }).then((latest_file) => {
        cy.readFile(latest_file).then((fileContent) => {
            const lines = fileContent.trim().split('\n')
            const header = lines[0].trim().split(',')

            const column_num = header.indexOf(column)
            expect(column_num).to.be.greaterThan(-1, `Column '${column}' not found`)

            const recordLine = lines.find(line => line.startsWith(record_name))
            expect(recordLine, `Record '${record_name}' not found`).to.not.be.undefined

            const row = recordLine.split(',')
            const csv_value = row[column_num]

            expect(csv_value).not.to.contain(formattedToday)
        })
    })
})
