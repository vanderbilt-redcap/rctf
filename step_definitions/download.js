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
 * @param {string} text - the text on the anchor element you want to click
 * @description Downloads a file from an anchor element with a specific text label.
 */
Given("I download a file by clicking on the link labeled {string}", (text) => {
    downloadFile(text)
})


/**
 * @module Download
 * @author Adam De Fouw <aldefouw@medicine.wisc.edu>
 * @param {string} record - the ID of the record the PDF is associated with
 * @param {string} survey - the Survey / Event of the record the PDF is associated with
 * @description Downloads a PDF file from the PDF Archive for a particular record ID and survey
 * @deprecated
 */
Given("I download the PDF by clicking on the link for Record {string} and Survey {string} in the File Repository table", (record, survey) => {
    throw `This step has been deprecated in favor of steps like the following: And I click on the link labeled "_formParticipantConsent_id1_"`
})

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} shouldOrShouldNot
 * @param {string} signatureField - the field under which the signature would be stored
 * @param {string} record - the Survey / Event of the record the PDF is associated with
 * @param {string} survey - the Survey / Event of the record the PDF is associated with
 * @description Detects whether or not a signature exists in the specified PDF
 */
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

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} record - the ID of the record the PDF is associated with
 * @param {string} survey - the Survey / Event of the record the PDF is associated with
 * @description Verifies the values within a PDF in the PDF Archive
 */
Given("I should see the following values in the last file downloaded", (dataTable) => {
    cy.task('fetchLatestDownload', { fileExtension: false }).assertContains(dataTable)
})

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @description Verifies whether a file exists in the specified storage location
 */
Given("I should see the following values in the most recent file in the {storageDirectoryLocations}", (location, dataTable) => {
    cy.task('getStorageDirectoryLocations').then(locations => {
        const dirPath = locations[location]

        let next
        let deleteTempFile = false
        if(location === 'Azure Blob Storage container'){
            deleteTempFile = true
            next = cy.findMostRecentAzureFile()
        }
        else if(location === 'Amazon S3 bucket'){
            deleteTempFile = true
            next = cy.findMostRecentS3File()
        }
        else{
            if(location === 'Google Cloud Storage bucket'){
                cy.exec('echo $USER').then(result =>{
                    if(result.stdout === 'circleci'){
                        /**
                         * On circleci fake-gcs-server is run as root,
                         * making any files it creates inaccessible to
                         * the cypress process run by the "circleci" user by default.
                         * The following allows access.
                         */
                        cy.exec('sudo chmod -R 777 ' + dirPath).then(result => {
                            cy.log('chmod result', JSON.stringify(result, null, 2))
                        })
                    }
                })
            }

            next = cy.task('findMostRecentFile', {dirPath})
        }
        
        next.then(path => {
            cy.wrap(path).assertContains(dataTable).then(() => {
                if(deleteTempFile){
                    cy.task('deleteFile', {path})
                }
            })
        })
    })
})

const DOCKER_COMMAND_PREFIX = 'docker compose --project-directory ../redcap_docker/ '

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @example Then if running via automation, start external storage services
 * @description Starts or stops services required to test external storage 
*/
Given(/^if running via automation, (start|stop) external storage services/, (action) => {
    // Hack the REDCap source to point to redcap_docker-fake-gcs-server-1 instead of storage.googleapis.com
    const remoteScriptPath = '/tmp/override-google-cloud-endpoint.sh'
    const localScriptPath = '..' + remoteScriptPath
    cy
        .writeFile(localScriptPath, `
            cd /var/www/html/redcap_v${Cypress.env('redcap_version')}
            sed -i "s/googleClient = new StorageClient(\\['keyFile'/googleClient = new StorageClient(\\['apiEndpoint' => 'http:\\/\\/redcap_docker-fake-gcs-server-1', 'keyFile'/g" Classes/Files.php
        `)
        .exec(`docker cp ${localScriptPath} redcap_docker-app-1:${remoteScriptPath}`)
        .exec(`docker exec redcap_docker-app-1 sh -c "sh ${remoteScriptPath}"`)

    // Even when starting services we stop them first to clear any old files from previous runs
    cy.exec(DOCKER_COMMAND_PREFIX + 'stop azurite minio fake-gcs-server webdav')
    
    if(action === 'start'){
        cy.exec(DOCKER_COMMAND_PREFIX + '--profile external-storage up -d')
    }
})

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @example Then if running via automation, start sftp server
 * @description Starts or stops the sftp server 
*/
Given(/^if running via automation, (start|stop) sftp server/, (action) => {
    if(action === 'start'){
        cy.exec(DOCKER_COMMAND_PREFIX + '--profile sftp up -d')
    }
    else{
        cy.exec(DOCKER_COMMAND_PREFIX + 'stop sftp')
    }
})

/**
 * @module Download
 * @author Mark McEver <mark.mcever@vumc.org>
 * @description Populates the <redcap-root>/webtools2/webdav/webdav_connection.php file with test credentials
*/
Given("I populate \"webdav_connection.php\" with the appropriate WebDAV credentials", () => {
    const tmpPath = '../tmp/webdav_connection.php'
    cy.writeFile(tmpPath, `<?php
        /**********************************************************
         Replace the values inside the single quotes below with 
        the values for your WebDAV configuration. Do not change
        anything else in this file.
        **********************************************************/

        $webdav_hostname = 'redcap_docker-webdav-1'; // e.g., ebldav.mc.vanderbilt.edu
        $webdav_username = 'webdav-user';
        $webdav_password = 'webdav-pass';
        $webdav_port 	 = '80'; // '80' is default. If REDCap web server is exposed to the web, you MUST use SSL (default port '443').
        $webdav_path	 = '/'; // Set path where REDCap files will be stored. Must end with a slash or back slash, depending on your OS.
        $webdav_ssl		 = '0'; // '0' is default. If REDCap web server is exposed to the web, you MUST use SSL (set to '1').
    `).exec('docker cp ' + tmpPath + ' redcap_docker-app-1:/var/www/html/webtools2/webdav/webdav_connection.php')
})
