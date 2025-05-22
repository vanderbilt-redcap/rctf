const { Given } = require('@badeball/cypress-cucumber-preprocessor')

function downloadFile(text){

    // We do not actually click on the link because new windows and Cypress do not work.
    // Instead, we sideload a request and save it where it would go
    cy.get(`a:contains(${JSON.stringify(text)}):visible`).then((f) => {

        if(f.attr('onclick').includes("fileRepoDownload")){

            cy.intercept({
                method: 'GET',
                url: '/redcap_v' + Cypress.env('redcap_version') + "/*FileRepositoryController:download*"
            }, (req) => {

                // Need to exclude requests not made by the application, such as background browser requests.
                req.on("before:response", res => {
                    const isDownload = res.headers["content-disposition"]?.startsWith("attachment");
                    const origin = cy.getRemoteLocation("origin");
                    const isFromAUT = req.headers["referer"]?.startsWith(origin);
                    if (isDownload && isFromAUT) {
                        Cypress.log({
                            name: "suppressWaitForPageLoad",
                            message: "Bypassing wait for page load event - response has Content-Disposition: attachment"
                        });
                        cy.isStable(true, "load");
                    }
                })

                req.reply((res) => {
                    expect(res.statusCode).to.equal(200)
                })

            }).as('file_repo_download')
            cy.wrap(f).click()
            cy.wait('@file_repo_download')

        } else {
            cy.request({
                url: f[0]['href'],
                encoding: 'binary'
            }).then((response) => {
                expect(response.status).to.equal(200);
                cy.writeFile('cypress/downloads/' + f[0]['innerText'], response.body, 'binary')
            })
        }
    })
}

function shouldOrShouldNotToBoolean(shouldOrShouldNot){
    if(shouldOrShouldNot === 'should'){
        return true
    }
    else if(shouldOrShouldNot === 'should NOT'){
        return false
    }
    else{
        throw 'Unexpected value for shouldOrShouldNotToBoolean()'
    }
}

/**
 * @module Download
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I download a file by clicking on the link labeled {string}
 * @param {string} text - the text on the anchor element you want to click
 * @description Downloads a file from an anchor element with a specific text label.
 */
Given("I download a file by clicking on the link labeled {string}", (text) => {
    downloadFile(text)
})


/**
 * @module Download
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I download the PDF by clicking on the link for Record {string} and Survey {string} in the File Repository table
 * @param {string} record - the ID of the record the PDF is associated with
 * @param {string} survey - the Survey / Event of the record the PDF is associated with
 * @description Downloads a PDF file from the PDF Archive for a particular record ID and survey
 */
Given("I download the PDF by clicking on the link for Record {string} and Survey {string} in the File Repository table", (record, survey) => {
    //Make sure DataTables has loaded before we do anything here
    cy.wait_for_datatables().assertWindowProperties()

    //Make sure the page is not loading
    if(Cypress.$('#file-repository-table_processing:visible').length){
        cy.get('#file-repository-table_processing').should('have.css', 'display', 'none')
    }

    //This initial query gets the column number of the <th> containing "Record" so that we can use that to find the correct base_element to select
     cy.get(`${window.tableMappings['file repository']}:visible tr th`).
        contains('Record').
        invoke('index').then(($col_index) =>{
         const col_num = $col_index + 1

         const base_element = `${window.tableMappings['file repository']}:visible tr:has(td:nth-child(${col_num}):has(a:contains(${JSON.stringify(record)}))):has(:contains(${JSON.stringify(survey)}))`
         const element_selector = `td i.fa-file-pdf`

         cy.top_layer(element_selector, base_element).within(() => {
             cy.get('td:has(i.fa-file-pdf) a').then(($a) => {
                 cy.wrap($a).click()
             })
         })
    })
})

Given("I {shouldOrShouldNot} see a signature for the {string} field in the downloaded PDF for record {string} and survey {string}", (shouldOrShouldNot, signatureField, record, survey) => {
    loadPDF(record, survey, (pdf) => {
        signatureField += '\n \n'
        const fieldIndex = pdf.text.indexOf(signatureField)
        const nextChar = pdf.text[fieldIndex+signatureField.length+1]
        const signaturePresent = nextChar !== '_'
        const signatureExpected = shouldOrShouldNotToBoolean(shouldOrShouldNot)

        if(signaturePresent !== signatureExpected){
            if(signatureExpected){
                throw 'Expected a signature but did not find one'
            }
            else{
                throw 'Found an unexpected signature'
            }
        }
    })
})


/**
 * @module Download
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @example I (should) see the following values in the downloaded PDF for Record {string} and Survey {string}
 * @param {string} record - the ID of the record the PDF is associated with
 * @param {string} survey - the Survey / Event of the record the PDF is associated with
 * @description Verifies the values within a PDF in the PDF Archive
 */
Given("I should see the following values in the downloaded PDF for record {string} and survey {string}", (record, survey, dataTable) => {
    function findDateFormat(str) {
        for (const format in window.dateFormats) {
            const regex = window.dateFormats[format]
            const match = str.includes(format)
            if (match) {
                expect(window.dateFormats).to.haveOwnProperty(format)
                return str.replace(format, '')
            }
        }
        return null
    }

    loadPDF(record, survey, (pdf) => {
        dataTable['rawTable'].forEach((row, row_index) => {
            row.forEach((dataTableCell) => {
                const result = findDateFormat(dataTableCell)
                if (result === null) {
                    expect(pdf.text).to.include(dataTableCell)
                } else {
                    result.split(' ').forEach((item) => {
                        expect(pdf.text).to.include(item)
                    })
                }
            })
        })
    })
})

function loadPDF(record, survey, next){
    //Make sure DataTables has loaded before we do anything here
    cy.wait_for_datatables().assertWindowProperties()

    //Make sure the page is not loading
    if(Cypress.$('#file-repository-table_processing:visible').length){
        cy.get('#file-repository-table_processing').should('have.css', 'display', 'none')
    }

    function waitForFile(pdf_file, timeout = 30000) {
        const startTime = Date.now()

        const checkFile = (resolve, reject) => {
            cy.fileExists(pdf_file).then((file) => {
                if (file === undefined) {
                    cy.wait(500).then(() => checkFile(resolve, reject))
                } else if(file){
                    resolve(file)
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('File not found within timeout period'))
                } else {
                    cy.wait(500).then(() => checkFile(resolve, reject))
                }
            })
        }

        return new Cypress.Promise((resolve, reject) => {
            checkFile(resolve, reject)
        })
    }

    //This initial query gets the column number of the <th> containing "Record" so that we can use that to find the correct base_element to select
    cy.get(`${window.tableMappings['file repository']}:visible tr th`).
    contains('Record').
    invoke('index').then(($col_index) => {
        const col_num = $col_index + 1

        const base_element = `${window.tableMappings['file repository']}:visible tr:has(td:nth-child(${col_num}):has(a:contains(${JSON.stringify(record)}))):has(:contains(${JSON.stringify(survey)}))`
        const element_selector = `td i.fa-file-pdf`
        let pdf_file = null

        cy.top_layer(element_selector, base_element).within(() => {
            cy.get('td:has(i.fa-file-pdf) a').then(($a) => {

                pdf_file = `cypress/downloads/${$a.text()}`

                waitForFile(pdf_file).then((fileExists) => {
                    cy.task('readPdf', { pdf_file: pdf_file }).then(next)
                })
            })
        })

    })
}