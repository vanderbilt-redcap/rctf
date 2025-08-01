//#############################################################################
//# Commands       A B C D E F G H I J K L M N O P Q R S T U V W X Y Z        #
//#############################################################################

Cypress.Commands.add('base_db_seed', () => {

    /**
     * This path used to be set via Cypress.env('redcap_source_path'),
     * but that became unecessary when we decided to standardize cloud vs. local setups.
     */
    let redcap_source_path = '../redcap_source'

    if(redcap_source_path === undefined){
        alert('redcap_source_path, which defines where your REDCap source code exists, is missing in cypress.env.json.  Please configure it before proceeding.')
    }

    //Get MySQL array from Environment Variables
    let mysql = Cypress.env('mysql')

    cy.task('snapshotExists').then((snapshot_exists) => {

        //If a snapshot exists, let us import it
        if(snapshot_exists){

            //Import the DB snapshot
            cy.mysql_snapshot_import()

            //Here we get the latest URL after logging in
            cy.readFile('test_db/latest_snapshot.info').then((text) => {
                const line = text.split("\n")
                cy.login({ username: line[1], password: line[2] })
                window.user_info.set_previous_user_type()
                cy.visit(line[0])
            })

        } else if (decodeURIComponent(location.href).includes('Continue Last Run.feature')) {
            cy.readFile('test_db/latest_url.info').then((urlData) => {
                urlData = JSON.parse(urlData)

                /**
                 * Simply load the previous URL to pick up where we left off.
                 * Leave the session & DB as-is.
                 */
                window.redcap_url_pre_survey = urlData.redcap_url_pre_survey
                cy.visit(urlData.url)
            })

        } else {

            // We can skip populating the base db seed on successive runs by adding a false value to the mysql['initial_db_seed'] key in cypress.env.json
            // This should really ever be run in development but shouldn't necessarily harm production since we still need a DB lock file to proceed
            cy.task('dbSeedLockExists').then((db_seed_exists) => {

                if(
                    !mysql.hasOwnProperty('skip_db_seed') ||
                    mysql.hasOwnProperty('skip_db_seed') && mysql['skip_db_seed'] && !db_seed_exists ||
                    !mysql['skip_db_seed']
                ) {

                    cy.task('populateStructureAndData', {
                        redcap_version: Cypress.env('redcap_version'),
                        advanced_user_info: window.compareVersions.compare(Cypress.env('redcap_version'), '10.1.0', '>='),
                        source_location: redcap_source_path
                    }).then((structure_and_data_file_exists) => {

                        //Only run this block if the Structure and Data File exists and has gone through proper processes
                        if (structure_and_data_file_exists) {

                            //Create the database if it doesn't exist
                            cy.mysql_db('create_database', '', false).then(() => {

                                //Pull in the structure and data from REDCap Source
                                cy.mysql_db('structure_and_data', window.base_url).then(() => {

                                    if (Cypress.env('redcap_hooks_path') !== undefined) {
                                        const redcap_hooks_path = "REDCAP_HOOKS_PATH/" + Cypress.env('redcap_hooks_path').replace(/\//g, "\\/");
                                        cy.mysql_db('hooks_config', redcap_hooks_path) //Fetch the hooks SQL seed data
                                    }

                                    //Clear out all cookies
                                    Cypress.session.clearAllSavedSessions()

                                    //Create a DB Seed Lock file
                                    cy.task('createInitialDbSeedLock')
                                })

                            })

                        } else {
                            alert('Warning: Error generating structure and data file.  This usually happpens because your REDCap source code is missing files.')
                        }

                    })
                }
            })
        }
    })

})

Cypress.Commands.add('mysql_db', (type, replace = '', include_db_name = true, framework = true) => {

    const mysql = Cypress.env("mysql")

    let version = Cypress.env('redcap_version')

    if(version === undefined){
        alert('redcap_version, which defines what version of REDCap you use in the seed database, is missing from cypress.env.json.  Please configure it before proceeding.')
    }

    //Create the MySQL Installation
    cy.task('generateMySQLCommand', {
        mysql_name: mysql['path'],
        host: mysql['host'],
        port: mysql['port'],
        db_name: mysql['db_name'],
        db_user: mysql['db_user'],
        db_pass: mysql['db_pass'],
        type: type,
        replace: replace,
        include_db_name: include_db_name,
        framework: framework
    }).then((mysql_cli) => {

        //Execute the MySQL Command
        cy.exec(mysql_cli['cmd'], { timeout: 100000}).then((data_import) => {
            expect(data_import['code']).to.eq(0)

            //Clean up after ourselves
            cy.task('deleteFile', { path: mysql_cli['tmp'] }).then((deleted_tmp_file) => {
                expect(deleted_tmp_file).to.eq(true)
            })
        })
    })
})

Cypress.Commands.add('mysql_query', (query) => {
    const mysql = Cypress.env("mysql")

    const cmd = `${mysql['path']} -h${mysql['host']} --port=${mysql['port']} ${mysql['db_name']} -u${mysql['db_user']} -p${mysql['db_pass']} -e "${query}" -N -s`

    cy.exec(cmd, { timeout: 100000}).then((response) => {
        expect(response['code']).to.eq(0)
        return response['stdout']
    })
})

Cypress.Commands.add('mysql_snapshot_export', () => {
    const mysql = Cypress.env("mysql")

    const cmd = `${mysql['path']}dump -h${mysql['host']} --port=${mysql['port']} ${mysql['db_name']} -u${mysql['db_user']} -p${mysql['db_pass']} > test_db/latest_snapshot.sql`

    cy.exec(cmd, { timeout: 100000}).then((response) => {
        expect(response['code']).to.eq(0)
        return response['stdout']
    })
})

Cypress.Commands.add('mysql_snapshot_import', () => {
    const mysql = Cypress.env("mysql")

    const cmd = `${mysql['path']} -h${mysql['host']} --port=${mysql['port']} ${mysql['db_name']} -u${mysql['db_user']} -p${mysql['db_pass']} < test_db/latest_snapshot.sql`

    cy.exec(cmd, { timeout: 100000}).then((response) => {
        expect(response['code']).to.eq(0)
        return response['stdout']
    })
})