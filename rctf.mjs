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
}