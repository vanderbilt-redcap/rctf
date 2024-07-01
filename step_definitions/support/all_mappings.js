function transformKeysToRegExp(variable){
    return Object.keys(variable).filter(key => key !== '')
}

window.parameterTypes = {
    tableTypes: transformKeysToRegExp(window.tableMappings),
    baseElement: transformKeysToRegExp(window.elementChoices),
    toDoTableTypes: transformKeysToRegExp(window.toDoListTables),
    userRightsChecks: transformKeysToRegExp(window.userRightChecks),
    ordinal: transformKeysToRegExp(window.ordinalChoices),
    recordStatusIcons: transformKeysToRegExp(window.recordStatusIcons),
    fileRepoIcons: transformKeysToRegExp(window.fileRepoIcons),
    onlineDesignerFieldIcons: transformKeysToRegExp(window.onlineDesignerFieldIcons),
    participantListIcons: transformKeysToRegExp(window.participantListIcons),
    addEditField: ['Add New Field', 'Edit Field'],
    addField: ['Add Field', 'Add Matrix of Fields', 'Import from Field Bank'],
    addOrSelect: ['add', 'select'],
    articleType: ['a', 'the'],
    aboveBelow: ['above', 'below'],
    beforeAfter: ['before', 'after'],
    cellAction: [
        ' and click the new instance link',
        ' and click on the bubble',
        ' and click the repeating instrument bubble for the first instance',
        ' and click the repeating instrument bubble for the second instance',
        ' and click the repeating instrument bubble for the third instance',
    ],
    check: ['checked', 'unchecked'],
    checkBoxRadio: ['checkbox', 'radio'],
    clickType: ['click on', 'check', 'uncheck'],
    confirmation: ['accept', 'cancel'],
    dataViewingRights: ['No Access', 'Read Only', 'View & Edit', 'Edit survey responses'],
    disabled: ['is disabled'],
    dropdownType: ['dropdown', 'multiselect', 'checkboxes', 'radio'],
    editEvent: ['Edit', 'Delete'],
    editField: ['Edit', 'Branching Logic', 'Copy', 'Move', 'Delete Field'],
    editSurveyRights: [
        ' with Edit survey responses checked',
        ' with Edit survey responses unchecked',
    ],
    enableDisable: ['enable', 'disable'],
    elmType: ['input', 'list item', 'checkbox', 'span'],
    enterType: ['verify', 'enter', 'clear field and enter', 'click on'],
    fieldType: [
        'Text Box',
        'Notes Box',
        'Drop-down List',
        'Radio Buttons',
        'Checkboxes',
        'Yes - No',
        'True - False',
        'Signature',
        'File Upload',
        'Slider',
        'Descriptive Text',
        'Begin New Section',
        'Calculated Field',
    ],
    headerOrNot: ['header and', 'header'],
    iframeVisibility: ['', ' in the iframe'],
    instrumentSaveOptions: [
        'Save & Stay',
        'Save & Exit Record',
        'Save & Go To Next Record',
        'Save & Exit Form',
        'Save & Go To Next Form',
        'Save & Go To Next Instance',
        'Save & Add New Instance',
    ],
    labeledElement: ['button', 'link', 'field', 'section break'],
    labeledExactly: ['labeled', 'labeled exactly', 'in the row labeled', 'for the instrument row labeled', 'for the variable', 'for the File Repository file named', 'for Data Quality Rule #', 'within the Record Locking Customization table for the Data Collection Instrument named', 'the enabled survey icon link for the instrument row', 'the enabled survey icon link for the instrument row'],
    linkNames: ['link', 'tab', 'instrument', 'icon'],
    projectRequestLabel: ['Create Project', 'Send Request'],
    notSee: ['', 'should', 'should NOT', 'should no longer'],
    ordering: ['ascending', 'descending'],
    onlineDesignerButtons: ['"Enable"', '"Disable"', '"Choose action"', '"Survey settings"', '"Automated Invitations"', 'enabled survey icon', '"View Report"', '"Execute"', '"Save"'],
    projectStatus: ['Production', 'Development', 'Analysis/Cleanup'],
    projectType: [
        'Practice / Just for fun',
        'Operational Support',
        'Research',
        'Quality Improvement',
        'Other',
    ],
    recordIDEvent: ['record ID', 'event'],
    repeatability: ['enabled', 'disabled', 'modifiable', 'unchangeable'],
    saveButtonRouteMonitoring: [
        ' on the dialog box for the Repeatable Instruments and Events module',
        ' on the Designate Instruments for My Events page',
        ' on the Online Designer page',
        ' and cancel the confirmation window',
        ' and accept the confirmation window',
        ' in the dialog box to request a change in project status',
        ' to rename an instrument',
        ' in the "Add New Field" dialog box',
        ' in the "Edit Field" dialog box',
        ' and will leave the tab open when I return to the REDCap project'
    ],
    select: ['selected', 'unselected'],
    tableName: ['', ' of the User Rights table', ' of the Reports table', ' of the Participant List table'],
    timeType: ['seconds', 'second', 'minutes', 'minute'],
    toDoRequestTypes: ['Move to prod', 'Approve draft changes', 'Copy project', 'Delete project'],
    toDoTableIcons: [
        'process request',
        'get more information',
        'add or edit a comment',
        'Move to low priority section',
        'archive request notification',
    ],
    toDownloadFile: [' to download a file', ' near "with records in rows" to download a file', ' near "with records in columns" to download a file'],
    userRightAction: ['add', 'remove'],
    visibilityPrefix: ['an alert box with the following text:', 'a field named', 'a downloaded file named', 'Project status:', 'the exact time in the', "today's date in the"]
}