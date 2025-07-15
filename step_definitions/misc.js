const { Given } = require('@badeball/cypress-cucumber-preprocessor')

/**
 * @module Misc
 * @author Mark McEver <mark.mcever@vumc.org>
 * @example Then I verify that the External Storage server has a file whose name contains "pid13_formParticipantConsent_id1"
 * @param {shouldOrShouldNot} action - should or should NOT
 * @param {string} partialFilename - a filename or portion of a filename to check
 * @description Verifies whether a file exists on the External Storage server 
 */
Given("I {shouldOrShouldNot} see a file on the External Storage server whose name contains {string}", (shouldOrShouldNot, partialFilename) => {
    const expected = shouldOrShouldNot === 'should'
    cy.task('matchingFileExists', {
        path: 'cypress/sftp_uploads',
        partialFilename: partialFilename
    }).then(actual => {
        expect(actual).to.equal(expected)
    })
})
