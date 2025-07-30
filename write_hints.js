const fs = require('fs')
const path = require('path')

// Create a global object named window (because it isn't available in Node by default)
global.window = {}

const transform = require('./step_definitions/support/transform_reg_ex_keys')
require('./step_definitions/support/mappings')
require('./step_definitions/support/all_mappings')

let output_str = `/**
 * The parameter definitions must be duplicated in this file,
 * because the file is not actually executed, but is instead
 * parsed like a configuration file.
 */

`

for (const key in window.parameterTypes) {
    if(transform.optional_parameters.includes(key)) {
        output_str += `defineParameterType({
            name: '${key}',
            regexp: ${transform.optionalRegExp(window.parameterTypes[key])},
        })\n\n`

    } else {
        output_str += `defineParameterType({
            name: '${key}',
            regexp: ${transform.transformToRegExp(window.parameterTypes[key])},
        })\n\n`
    }
}

// Check if the hints.js file already exists
const filePath = './step_definitions/support/hints.js';

if (fs.existsSync(filePath)) {
    // Read the existing content of the file
    const existingContent = fs.readFileSync(filePath, 'utf8');

    // Check if the content is different
    if (existingContent !== output_str) {
        // Update the file with the latest content
        fs.writeFileSync(filePath, output_str);
        console.log(`File ${filePath} updated successfully.`);
    } else {
        console.log(`File ${filePath} is already up to date. No changes made.`);
    }
} else {
    // The file does not exist, so create it
    fs.writeFileSync(filePath, output_str);
    console.log(`File ${filePath} created successfully.`);
}