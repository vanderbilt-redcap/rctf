const {
    CucumberExpression,
    ParameterType,
    ParameterTypeRegistry,
} = require('@cucumber/cucumber-expressions')

const parameterTypeRegistry = new ParameterTypeRegistry()

globalThis.defineParameterType = ({ name, regexp, transformer }) => {
    const regexSources = (Array.isArray(regexp) ? regexp : [regexp]).map((currentRegExp) => {
        if (currentRegExp instanceof RegExp) {
            return currentRegExp.source
        }
        
        return String(currentRegExp)
    })
    
    parameterTypeRegistry.defineParameterType(new ParameterType(
        name,
        regexSources,
        null,
        (...values) => {
            if (transformer) {
                return transformer(...values)
            }
            
            return values[0]
        },
        false,
        false,
    ))
}

const registeredStepDefinitions = []
globalThis.Given = (pattern, action) => {
    registeredStepDefinitions.push({
        pattern,
        action,
        expression: new CucumberExpression(pattern, parameterTypeRegistry),
    })
}

require('../step_definitions/index.js')

function compileStepText(stepText) {
    const matchingStepDefinitions = []
    
    for (const stepDefinition of registeredStepDefinitions) {
        const argumentMatches = stepDefinition.expression.match(stepText)
        
        if (!argumentMatches) {
            // This step text does not match this step definition.
            continue
        }
        
        matchingStepDefinitions.push({
            stepDefinition,
            arguments: argumentMatches.map((argumentMatch) => {
                return argumentMatch.getValue(undefined)
            }),
        })
    }

    if (matchingStepDefinitions.length === 0) {
        throw new Error(`Could not find a matching step definition`)
    }

    if (matchingStepDefinitions.length > 1) {
        const matchingPatterns = matchingStepDefinitions
            .map((currentMatch) => currentMatch.stepDefinition.pattern)
            .join(' | ')
            
        throw new Error(`Matched multiple step definitions: ${matchingPatterns}`)
    }
    
    const matchedStepDefinition = matchingStepDefinitions[0]

    return () => {
        matchedStepDefinition.stepDefinition.action(...matchedStepDefinition.arguments)
    }
}

function executeStep(stepText, expectedFailureMessage) {
    const stepAction = compileStepText(stepText)

    const failHandler = (error) => {
        // The action failed
        Cypress.off('fail', failHandler)
        
        try {
            if(expectedFailureMessage !== undefined){
                expect(error.message).to.equal(expectedFailureMessage)
            }
            else{
                throw error
            }
         } catch (caughtError) {
            if(Cypress.config('isInteractive')){
                Cypress.stop()
            }
            throw caughtError
        }
    }
    
    Cypress.on('fail', failHandler)
    
    stepAction()
    
    return cy.then(() => {
        // The action succeeded
        Cypress.off('fail', failHandler)
        
        if(expectedFailureMessage){
            if(Cypress.config('isInteractive')){
                Cypress.stop()
            }
            throw new Error('Step succeeded when it was expected to fail')
        }
    })
}

function setPageContent(pageHtml) {
    /**
     * Our label detection logic requires a parent element in some cases.
     */
    pageHtml = `<div>${pageHtml}</div>`

    return cy.document().then((documentObject) => {
        documentObject.open()
        documentObject.write(pageHtml)
        documentObject.close()
    })
}

function assertSuccess(stepText) {
    if(arguments.length !== 1){
        throw new Error('Unexpected number of arguments for assertSuccess()')
    }
    
    it('Assert Success: ' + stepText, () => {
        return executeStep(stepText)
    })
}

function assertFailure(stepText, expectedFailureMessage) {
    it('Assert Failure: ' + stepText, () => {
        executeStep(stepText, expectedFailureMessage ?? '')
    })
}

/**
 * RCTF tests should be designed such that HTML is fully set/loaded
 * before each step is run. This eliminates the need for a timeout,
 * and allows tests to execute very quickly.
 */
Cypress.config('defaultCommandTimeout', 0)

const htmlByType = {
    'button': `<button disabled>My button</button>`,
    'link': `<a>My link</a>`,
    'field': `My field: <input disabled>`,
    'checkbox': `<input type='checkbox' disabled> My checkbox`,
    'icon': [
        `
            <style>
                /* Simulate what Font Awesome does */
                .icon:before {
                    content: "😜";
                }
            </style>

            <i class='icon' title='My icon'></i>
        `,
        `<img title='My icon'>`,
    ],
    'dropdown': `My dropdown: <select disabled></select>`,
    'radio': `<input type='radio' disabled> My radio`,
    'textarea': `My textarea: <textarea disabled></textarea>`,
    'tab': `<a class='tab-link'>My tab</a>`,
}

parameterTypes.optionalLabeledElement.forEach(type => {
    let html = htmlByType[type]
    if(html === undefined){
        throw new Error('Test html needs to be specified for the following labeled element type: ' + type)
    }

    if(!(html instanceof Array)){
        html = [html]
    }

    html.forEach(currentHtml => {
        describe('Assert Visibility: ' + type, () => {
            beforeEach(() => {
                return setPageContent(currentHtml)
            })
        
            assertSuccess(`I should see a ${type} labeled "My ${type}"`)
            assertSuccess(`I should NOT see a ${type} labeled "Other ${type}"`)
            assertFailure(`I should see a ${type} labeled "Other ${type}"`, `The ${type} labeled "Other ${type}" could not be found`)
            assertFailure(`I should NOT see a ${type} labeled "My ${type}"`, `The ${type} labeled "My ${type}" was unexpectedly found`)

            let disabledAction
            if(['link', 'icon', 'tab'].includes(type)){
                disabledAction = (step) => {
                    assertFailure(step, 'The "that is disabled" suffix it not supported for this element')
                }
            }
            else{
                disabledAction = assertSuccess
            }

            disabledAction(`I should see a ${type} labeled "My ${type}" that is disabled`)
        })
    })
})

describe('Assert checkbox status', () => {
    beforeEach(() => {
        return setPageContent(`
            <input type='checkbox' checked> Checked Checkbox
            <input type='checkbox'> Unchecked Checkbox
        `)
    })

    assertSuccess('I should see a checkbox labeled "Checked Checkbox" that is checked')
    assertSuccess('I should see a checkbox labeled "Unchecked Checkbox" that is unchecked')
})

describe('Assert Visibility: Text', () => {
    beforeEach(() => {
        return setPageContent('Expected Text')
    })

    assertSuccess('I should see "Expected Text"')
    assertSuccess('I should NOT see "Unexpected Text"')
    assertFailure('I should see "Unexpected Text"', 'Expected text was not found: Unexpected Text')
    assertFailure('I should NOT see "Expected Text"', 'Unexpected text was found: Expected Text')
})

describe('Misc. assertions', () => {
    it('Ensure innerText is used instead of textContent since the former automatically normalizes whitespace between elements and favors matching using simple spaces rather than newlines, tabs, or nbsps', () => {
        const parts = Cypress.spec.absolute.split('/')
        parts.pop() // pop filename
        parts.pop() // pop visibility dir
        expect(parts.at(-1)).to.equal('rctf')
        const rctfPath = parts.join('/')
        // We limit the line length because unexpected very long line matches (e.g. minified files) will make cypress go very slowly.
        const command = `grep "\\.textContent" "${rctfPath}" -r --exclude-dir={coverage,docs,node_modules} | grep -v "Ignore this line when verifying textContext usage" | cut -c1-1000`
        cy.exec(command, {failOnNonZeroExit: false}).then(result => {
            assert.equal('', result.stdout, 'Found unexpected instances of textContent. They should likely be replaced with innerText')
        })
    })
})
