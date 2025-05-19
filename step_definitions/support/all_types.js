const { defineParameterType } = require('@badeball/cypress-cucumber-preprocessor')


// This file contains definitions for custom parameter types used in step definitions.
// Parameter type definitions have been consolidated here for easier reference and to avoid duplication.
// This should also make it easier to identify when refactoring/merging is appropriate.
// Comments indicate where the parameter type is used.
const transform = require('./transform_reg_ex_keys')

for (const key in window.parameterTypes) {
    if(transform.optional_parameters.includes(key)) {
        defineParameterType({
            name: key,
            regexp: transform.optionalRegExp(window.parameterTypes[key]),
        })
    } else {
        defineParameterType({
            name: key,
            regexp: transform.transformToRegExp(window.parameterTypes[key]),
        })
    }
}

defineParameterType({
    name: 'optionalString',
    regexp: /(.*?)/
})

defineParameterType({
    name: 'optionalQuotedString',
    regexp: /(?:"((?:[^"\\]|\\.)*)")?/
})