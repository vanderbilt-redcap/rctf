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

/**
 * @module Misc
 * @author Mark McEver <mark.mcever@vumc.org>
 * @param {string} expectedPrintContent - The content that should appear when printing instead of the normal page content.
 * @description Verify that the content is replaced with the specified content when the page is printed
 */
Given("I verify that when I print the current page the content is replaced with {string}", (expectedPrintContent) => {
    expectedPrintContent = `"${expectedPrintContent.trim()}"`

    const setEmulatedMedia = (media) => {
        Cypress.automation('remote:debugger:protocol', {
            command: 'Emulation.setEmulatedMedia',
            params: { media },
        })
    }

    const getCenterBeforeContent = () => {
        return cy.get('#center').then(html => {
            return window.getComputedStyle(html[0], '::before')
                .getPropertyValue('content')
                .replaceAll('\\"', '"')
                .trim()
        })
    }

    const assertPrintContentNotDisplayed = () => {
        cy.get('html')
            .invoke('prop', 'innerText')
            .should('have.length.gt', 1000)

        return getCenterBeforeContent().then(content => {
            expect(content).to.equal('none')
        })
    }

    const assertPrintContentDisplayed = () => {
        cy.get('html')
            .invoke('prop', 'innerText')
            .should('be.empty')

        return getCenterBeforeContent().then(content => {
            expect(content).to.equal(expectedPrintContent)
        })
    }

    assertPrintContentNotDisplayed().then(() => {
        setEmulatedMedia('print')
    })

    assertPrintContentDisplayed().then(() => {
        setEmulatedMedia('screen')
    })
    
    assertPrintContentNotDisplayed()
})