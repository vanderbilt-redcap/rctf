import { mimeWordsDecode } from 'emailjs-mime-codec'

export const rctf = {
    STORAGE_DIRECTORY_LOCATIONS: {
        'local storage path': '../edocs',
        'downloads directory': 'cypress/downloads',
        'sftp server': '../redcap_docker/external_storage/sftp',
        'Azure Blob Storage container': false,
        'Amazon S3 bucket': false,
        'Google Cloud Storage bucket': '../redcap_docker/external_storage/gcs',
        'WebDAV server': '../redcap_docker/external_storage/webdav',
    },
    validateCurrentSpecFilename: () => {
        const path = Cypress.spec.absolute
        if(path.includes('/redcap_rsvc/')){
            const filename = path.split('/').at(-1)
            const error = rctf.getSpecFilenameError(filename)
            if(error){
                throw new Error('Unexpected feature filename format: ' + error)
            }
        }
    },
    getSpecFilenameError: (filename) => {
        const mainParts = filename.split(' - ')
        if(mainParts.length < 2){
            return 'Did not find the expected "FRS ID - DESCRIPTION.feature" format.'
        }

        const frsIdMatch = mainParts[0].match(/^[A-C]\.\d+\.\d+\.(\d+)\./);
        if (!frsIdMatch) {
            console.log(2)
            return 'The FRS ID is not formatted correctly.'
        }

        if(mainParts[1].split('.')[0].length === 0){
            console.log(3)
            return 'The description is missing after " - ".'
        }

        const lastFrsIdPart = frsIdMatch[1]
        const lastFrsIdPartWithExpectedPadding = String(parseInt(lastFrsIdPart)).padStart(4, '0')
        if(lastFrsIdPart !== lastFrsIdPartWithExpectedPadding){
            console.log(4, lastFrsIdPart, lastFrsIdPartWithExpectedPadding)
            return 'The last portion of the FRS ID is not zero padded as expected.'
        }

        return null
    },
    login: (username) => {
        return cy.set_user_type(username).then(() => {
            /**
             * We used to use cy.fetch_login() here, but it started failing on some CDIS tests (e.g. C.3.31.2200)
             * because that command somehow corrupts the session causes it to invalidate when "Standalone Launch" is clicked.
             * The test began working fine after we changed this to simply interact like actual users would.
             */
            cy.getLabeledElement('input', 'Username').type(window.user_info.get_current_user())
            cy.getLabeledElement('input', 'Password').type(window.user_info.get_current_pass())
            cy.getLabeledElement('button', 'Log In').click()
        })
    },
    normalizeString: (s) => {
        if(s === undefined){
            return undefined
        }

        // Replace '&nbsp;' so that normal spaces in steps will match that character
        return s.trim().replaceAll('\u00a0', ' ')
    },
    getNormalizedTextContent: (node) => {
        let text
        if(node.constructor.name === 'Text'){
            // This is a text node, as opposed to an actual HTML element
            text = node.textContent // Ignore this line when verifying textContext usage
        }
        else{
            text = node.innerText
        }

        return rctf.normalizeString(text)
    },
    getLatestEmail: () => {
        return cy.retryUntilTimeout(() => {
            return cy.request('http://localhost:8025/api/v1/messages').then(response => {
                // Make null the default return value & override any previous subject
                cy.wrap(null)

                const messages = response.body 
                if(messages.length === 0){
                    // Maybe it hasn't come through yet.  Return to retry.
                    return
                }
    
                const lastMessage = messages[0].Content
    
                // It seems like mailhog's API would decode the subject for us, but it doesn't.
                lastMessage.Headers.Subject[0] = mimeWordsDecode(lastMessage.Headers.Subject[0])
    
                const timeSinceSent = Date.now() - new Date(lastMessage.Headers.Date)
                if(timeSinceSent > 10000){
                    // Ignore any old emails
                    return
                }
    
                cy.wrap(lastMessage)
            })
        })
    },
}