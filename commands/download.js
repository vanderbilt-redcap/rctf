require('cypress-wait-until')

function replaceFilename(file, date){
    return file.replace('hhmmss', `${date.substring(12, 14)}${date.substring(15, 17)}${date.substring(18, 20)}`)
               .replace('hhmm', `${date.substring(12, 14)}${date.substring(15, 17)}`)
               .replace('yyyy', date.substring(6, 10))
               .replace('mm', date.substring(0, 2))
               .replace('hh', date.substring(11, 13))
               .replace('dd', date.substring(3, 5))
}

function setLocalTimestamp(date){
    if(window.php_time_zone !== null) {
        // Get the PHP timezone from window.php_time_zone
        const phpTimeZone = window.php_time_zone;

        // Convert the JavaScript Date object to the PHP timezone
        date = new Date(date.toLocaleString('en-US', {
            timeZone: phpTimeZone
        }))
    }

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

Cypress.Commands.add('fetch_timestamped_file', (filename) => {
    let path = ''

    const current_time = new Date()
    const minute_ago = new Date(current_time.getTime())
    minute_ago.setMinutes(current_time.getMinutes() - 1)

    const first_file = `cypress/downloads/${replaceFilename(filename, setLocalTimestamp(current_time))}`
    const second_file = `cypress/downloads/${replaceFilename(filename, setLocalTimestamp(minute_ago))}`

    cy.fileExists(first_file).then((fileExists) => {
        if (fileExists) path = first_file
    }).then(() => {
        if(path === '') {
            cy.fileExists(second_file).then((fileExists) => {
                if (fileExists) path = second_file
            })
        }
    }).then(() =>{
        return path
    })
})

Cypress.Commands.add('download_file', (filename) => {
    cy.fetch_timestamped_file(filename).then(($file) => {
        cy.readFile($file, { timeout: 10000 })
    })
})

Cypress.Commands.add("fileExists", (filePath) => {
    return cy.task('fileExists', filePath)
})

Cypress.Commands.add("getFileMTime", (filePath) => {
    return cy.task('getFileMTime', filePath)
})
