function transformToRegExp(keys){
    const escapedKeys = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`|${escapedKeys.join('|')}`)
}

function optionalRegExp(keys){
    const escapedKeys = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(?: (${escapedKeys.join('|')}||))?`)
}

//Add any parameterTypes that are optional to this array
let optional_parameters = [ 'ordinal', 'onlineDesignerButtons', 'fileRepoIcons', 'participantListIcons', 'disabled', 'labeledElement' ]

module.exports = {
    transformToRegExp: transformToRegExp,
    optionalRegExp: optionalRegExp,
    optional_parameters: optional_parameters
}