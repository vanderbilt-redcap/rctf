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
            if(expectedFailureMessage){
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
        executeStep(stepText, expectedFailureMessage)
    })
}

/**
 * RCTF tests should be designed such that HTML is fully set/loaded
 * before each step is run. This eliminates the need for a timeout,
 * and allows tests to execute very quickly.
 */
Cypress.config('defaultCommandTimeout', 0)


Object.entries({
    'button': `<button>My {{type}}</button>`,
    'link': `<a>My {{type}}</a>`,
    'checkbox': `<input type='checkbox'> My {{type}}`,
    // 'icon': [
        // `<i title='My {{type}}></i>`,
        // `<i></i> My {{type}}`,
        // `<img title='My {{type}}>`,
        // `<img> My {{type}}`,
    // ],
    'dropdown': `My {{type}}: <select></select>`,
    'radio': `<input type='radio'> My {{type}}`,
    'textarea': `My {{type}}: <textarea></textarea>`,
    'tab': `<a class='tab-link'>My {{type}}</a>`,
}).forEach(([type, html]) => {
    if(!(html instanceof Array)){
        html = [html]
    }

    html.forEach(currentHtml => {
        describe('Assert Visibility: ' + type, () => {
            beforeEach(() => {
                return setPageContent(currentHtml.replaceAll('{{type}}', type))
            })
        
            assertSuccess(`I should see a ${type} labeled "My ${type}"`)
            assertSuccess(`I should NOT see a ${type} labeled "Other ${type}"`)
            assertFailure(`I should see a ${type} labeled "Other ${type}"`, `The ${type} labeled "Other ${type}" could not be found`)
            assertFailure(`I should NOT see a ${type} labeled "My ${type}"`, `The ${type} labeled "My ${type}" was unexpectedly found`)
        })
    })
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