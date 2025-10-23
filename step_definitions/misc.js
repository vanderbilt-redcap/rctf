import {rctf} from '../rctf.mjs'

/**
 * @module Misc
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {shouldOrShouldNot} action
 * @param {string} partialFilename - a filename or portion of a filename to check
 * @description Verifies whether a file exists on the External Storage server 
 */
Given("I {shouldOrShouldNot} see a file on the External Storage server whose name contains {string}", (shouldOrShouldNot, partialFilename) => {
    const expected = shouldOrShouldNot === 'should'
    cy.task('matchingFileExists', {
        dirPath: rctf.STORAGE_DIRECTORY_LOCATIONS['sftp server'],
        partialFilename: partialFilename
    }).then(actual => {
        expect(actual).to.equal(expected)
    })
})
