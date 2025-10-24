const { Given, defineParameterType } = require('@cucumber/cucumber')

const stepUsage = []
globalThis.logStepUsage = (i) => {
    stepUsage[i].count++
}

globalThis.defineParameterType = defineParameterType
globalThis.Given = (step, ignoredAction) => {
    stepUsage.push({
        step: step,
        count: 0
    })
    
    let argCount
    const parsedArgs = ignoredAction
        .toString()
        .split('\n')[0]
        .split('(')[1]
        .split(')')[0]
        .split(',')

    if(typeof step === 'string'){
        // Use the number of params in the step string
        argCount = (step.match(/\{/g) || []).length
        
        const lastArg = parsedArgs.at(-1).trim()
        if(lastArg === 'dataTable'){
            argCount++
        }
    }
    else{
        // Must be a regex instead of string
        if(parsedArgs.length === 1 && parsedArgs[0] === ''){
            argCount = 0
        }
        else{
            argCount = parsedArgs.length
        }
    }
    
    const args = Array.from({ length: argCount }, (_, i) => `arg${i}`);
    const stepIndex = stepUsage.length-1
    const action = new Function(...args, `logStepUsage(${stepIndex})`)
    
    Given(step, action)
}

process.on('exit', () => {
    stepUsage.sort((a,b) => {
        return b.count - a.count
    })

    const fs = require('fs')
    fs.writeFileSync('step-usage.json', JSON.stringify(stepUsage, null, 2))
})

require('./step_definitions/index')