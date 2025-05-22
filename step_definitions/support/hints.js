defineParameterType({
            name: 'tableTypes',
            regexp: /|a|logging|browse users|file repository|administrators|reports|report data|define events|data access groups|DAGs Switcher|record status dashboard|data collection instruments|codebook|import data display|participant list|user rights|record locking|e-signature and locking management|record home page/,
        })

defineParameterType({
            name: 'baseElement',
            regexp: /| on the tooltip| in the tooltip| on the role selector dropdown| in the role selector dropdown| on the dialog box| in the dialog box| on the Add\/Edit Branching Logic dialog box| in the Add\/Edit Branching Logic dialog box| within the data collection instrument list| on the action popup| in the action popup| in the Edit survey responses column| in the open date picker widget| in the File Repository breadcrumb| in the File Repository table| in the View Access section of User Access| in the Edit Access section of User Access| in the "Main project settings" section| in the "Use surveys in this project\?" row in the "Main project settings" section| in the "Use longitudinal data collection with defined events\?" row in the "Main project settings" section| in the "Use the MyCap participant-facing mobile app\?" row in the "Main project settings" section| in the "Enable optional modules and customizations" section| in the "Repeating instruments and events" row in the "Enable optional modules and customizations" section| in the "Auto-numbering for records" row in the "Enable optional modules and customizations" section| in the "Scheduling module" row in the "Enable optional modules and customizations" section| in the "Randomization module" row in the "Enable optional modules and customizations" section| in the "Designate an email field for communications \(including survey invitations and alerts\)" row in the "Enable optional modules and customizations" section| in the "Twilio SMS and Voice Call services for surveys and alerts" row in the "Enable optional modules and customizations" section| in the "Mosio SMS services for surveys and alerts" row in the "Enable optional modules and customizations" section| in the "SendGrid Template email services for Alerts & Notifications" row in the "Enable optional modules and customizations" section| in the validation row labeled "Code Postal 5 caracteres \(France\)"| in the validation row labeled "Date \(D-M-Y\)"| in the validation row labeled "Date \(M-D-Y\)"| in the validation row labeled "Date \(Y-M-D\)"| in the validation row labeled "Datetime \(D-M-Y H:M\)"| in the validation row labeled "Datetime \(M-D-Y H:M\)"| in the validation row labeled "Datetime \(Y-M-D H:M\)"| in the validation row labeled "Datetime w\/ seconds \(D-M-Y H:M:S\)"| in the validation row labeled "Datetime w\/ seconds \(M-D-Y H:M:S\)"| in the validation row labeled "Datetime w\/ seconds \(Y-M-D H:M:S\)"| in the validation row labeled "Email"| in the validation row labeled "Integer"| in the validation row labeled "Letters only"| in the validation row labeled "MRN \(10 digits\)"| in the validation row labeled "MRN \(generic\)"| in the validation row labeled "Number"| in the validation row labeled "Number \(1 decimal place - comma as decimal\)"| in the validation row labeled "Number \(1 decimal place\)"| in the validation row labeled "Number \(2 decimal places - comma as decimal\)"| in the validation row labeled "Number \(2 decimal places\)"| in the validation row labeled "Number \(3 decimal places - comma as decimal\)"| in the validation row labeled "Number \(3 decimal places\)"| in the validation row labeled "Number \(4 decimal places - comma as decimal\)"| in the validation row labeled "Number \(4 decimal places\)"| in the validation row labeled "Number \(comma as decimal\)"| in the validation row labeled "Phone \(Australia\)"| in the validation row labeled "Phone \(North America\)"| in the validation row labeled "Phone \(UK\)"| in the validation row labeled "Postal Code \(Australia\)"| in the validation row labeled "Postal Code \(Canada\)"| in the validation row labeled "Postal Code \(Germany\)"| in the validation row labeled "Social Security Number \(U\.S\.\)"| in the validation row labeled "Time \(HH:MM:SS\)"| in the validation row labeled "Time \(HH:MM\)"| in the validation row labeled "Time \(MM:SS\)"| in the validation row labeled "Vanderbilt MRN"| in the validation row labeled "Zipcode \(U\.S\.\)"/,
        })

defineParameterType({
            name: 'toDoTableTypes',
            regexp: /|Pending Requests|Low Priority Pending Requests|Completed & Archived Requests/,
        })

defineParameterType({
            name: 'userRightsChecks',
            regexp: /|Project Setup & Design|User Rights|Data Access Groups|Stats & Charts|Create Records|Survey Distribution Tools|Add\/Edit\/Organize Reports|Alerts & Notifications|Rename Records|Delete Records|Calendar|Data Import Tool|Data Comparison Tool|Logging|File Repository|Record Locking Customization|Lock\/Unlock \*Entire\* Records|Lock\/Unlock \*Entire\* Records \(record level\)|Data Quality - Create & edit rules|Data Quality - Execute rules|API Export|API Import\/Update|REDCap Mobile App - Allow users to collect data offline in the mobile app|REDCap Mobile App - Allow user to download data for all records to the app\?|Calendar & Scheduling|Email Logging/,
        })

defineParameterType({
            name: 'ordinal',
            regexp: /(?: (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|last||))?/,
        })

defineParameterType({
            name: 'recordStatusIcons',
            regexp: /|Incomplete|Unverified|Complete|Many statuses \(mixed\)|Incomplete \(no data saved\)|Partial Survey Response|Completed Survey Response|Many statuses \(all same\)/,
        })

defineParameterType({
            name: 'fileRepoIcons',
            regexp: /(?: (File Share|Restore|Delete|Delete Permanently||))?/,
        })

defineParameterType({
            name: 'onlineDesignerFieldIcons',
            regexp: /|Edit|Branching Logic|Copy|Move|Stop|Delete Field|Delete|"view"|"export"|"exclude"|"remove exclusion"|"Add signature"/,
        })

defineParameterType({
            name: 'participantListIcons',
            regexp: /(?: (green checkmark|gray bubble||))?/,
        })

defineParameterType({
            name: 'action',
            regexp: /|click on the|should see a|should NOT see a/,
        })

defineParameterType({
            name: 'addEditField',
            regexp: /|Add New Field|Edit Field/,
        })

defineParameterType({
            name: 'addField',
            regexp: /|Add Field|Add Matrix of Fields|Import from Field Bank/,
        })

defineParameterType({
            name: 'addOrSelect',
            regexp: /|add|select/,
        })

defineParameterType({
            name: 'articleType',
            regexp: /|a|the/,
        })

defineParameterType({
            name: 'aboveBelow',
            regexp: /|above|below/,
        })

defineParameterType({
            name: 'beforeAfter',
            regexp: /|before|after/,
        })

defineParameterType({
            name: 'cellAction',
            regexp: /| and click the new instance link| and click on the bubble| and click the repeating instrument bubble for the first instance| and click the repeating instrument bubble for the second instance| and click the repeating instrument bubble for the third instance/,
        })

defineParameterType({
            name: 'check',
            regexp: /|checked|unchecked|in the enabled state|in the disabled state/,
        })

defineParameterType({
            name: 'checkBoxRadio',
            regexp: /|checkbox|radio|toggle button/,
        })

defineParameterType({
            name: 'clickType',
            regexp: /|click on|check|uncheck|enable|disable/,
        })

defineParameterType({
            name: 'columnLabel',
            regexp: /||in the Matrix column/,
        })

defineParameterType({
            name: 'confirmation',
            regexp: /|accept|cancel/,
        })

defineParameterType({
            name: 'dateTimeType',
            regexp: /|timestamp|date|datetime/,
        })

defineParameterType({
            name: 'dataViewingRights',
            regexp: /|No Access|Read Only|View & Edit|Edit survey responses/,
        })

defineParameterType({
            name: 'disabled',
            regexp: /(?: (is disabled||))?/,
        })

defineParameterType({
            name: 'dropdownType',
            regexp: /|dropdown|multiselect|checkboxes|radio/,
        })

defineParameterType({
            name: 'editEvent',
            regexp: /|Edit|Delete/,
        })

defineParameterType({
            name: 'editField',
            regexp: /|Edit|Edit Matrix|Branching Logic|Copy|Move|Delete Field/,
        })

defineParameterType({
            name: 'editSurveyRights',
            regexp: /| with Edit survey responses checked| with Edit survey responses unchecked/,
        })

defineParameterType({
            name: 'enableDisable',
            regexp: /|enable|disable/,
        })

defineParameterType({
            name: 'elmType',
            regexp: /|input|list item|checkbox|span/,
        })

defineParameterType({
            name: 'enterType',
            regexp: /|verify|enter|clear field and enter|click on/,
        })

defineParameterType({
            name: 'fieldType',
            regexp: /|Text Box|Notes Box|Drop-down List|Radio Buttons|Checkboxes|Yes - No|True - False|Signature|File Upload|Slider|Descriptive Text|Begin New Section|Calculated Field/,
        })

defineParameterType({
            name: 'headerOrNot',
            regexp: /|header and|header/,
        })

defineParameterType({
            name: 'iframeVisibility',
            regexp: /|| in the iframe/,
        })

defineParameterType({
            name: 'inputType',
            regexp: /|input|password/,
        })

defineParameterType({
            name: 'instrumentSaveOptions',
            regexp: /|Save & Stay|Save & Exit Record|Save & Go To Next Record|Save & Exit Form|Save & Go To Next Form|Save & Go To Next Instance|Save & Add New Instance/,
        })

defineParameterType({
            name: 'labeledElement',
            regexp: /|button|link|field|section break|checkbox|toggle button|icon/,
        })

defineParameterType({
            name: 'labeledExactly',
            regexp: /|labeled|labeled exactly|in the row labeled|for the instrument row labeled|for the variable|for the File Repository file named|for Data Quality Rule #|within the Record Locking Customization table for the Data Collection Instrument named|the enabled survey icon link for the instrument row|the enabled survey icon link for the instrument row|for the Discrepant field labeled|within the Record Locking Customization table for the Data Collection Instrument named|for the field labeled/,
        })

defineParameterType({
            name: 'linkNames',
            regexp: /|link|tab|instrument|icon/,
        })

defineParameterType({
            name: 'loginTypes',
            regexp: /|attempt to login to REDCap with|am still logged in to REDCap with|login to REDCap with|successfully login to REDCap with|provide E-Signature credentials for/,
        })

defineParameterType({
            name: 'projectRequestLabel',
            regexp: /|Create Project|Send Request/,
        })

defineParameterType({
            name: 'notSeeDC',
            regexp: /|should see a Data Collection Instrument named|should NOT see a Data Collection Instrument named|should no longer see a Data Collection Instrument named/,
        })

defineParameterType({
            name: 'notSee',
            regexp: /||should NOT|should no longer|no longer/,
        })

defineParameterType({
            name: 'shouldOrShouldNot',
            regexp: /|should|should NOT/,
        })

defineParameterType({
            name: 'ordering',
            regexp: /|ascending|descending/,
        })

defineParameterType({
            name: 'onlineDesignerButtons',
            regexp: /(?: ("Enable"|"Disable"|"Choose action"|"Survey settings"|"Automated Invitations"|enabled survey icon|"View Report"|"Export Data"|"Stats & Charts"|"Execute"|"Save"||))?/,
        })

defineParameterType({
            name: 'projectStatus',
            regexp: /|Production|Development|Analysis\/Cleanup/,
        })

defineParameterType({
            name: 'projectType',
            regexp: /|Practice \/ Just for fun|Operational Support|Research|Quality Improvement|Other/,
        })

defineParameterType({
            name: 'recordIDEvent',
            regexp: /|record ID|event/,
        })

defineParameterType({
            name: 'repeatability',
            regexp: /|enabled|disabled|modifiable|unchangeable/,
        })

defineParameterType({
            name: 'saveButtonRouteMonitoring',
            regexp: /| on the dialog box for the Repeatable Instruments and Events module| on the Designate Instruments for My Events page| on the Online Designer page| and cancel the confirmation window| and accept the confirmation window| to rename an instrument| in the "Add New Field" dialog box| in the "Edit Field" dialog box| and will leave the tab open when I return to the REDCap project| on the active Data Quality rule/,
        })

defineParameterType({
            name: 'select',
            regexp: /|selected|unselected/,
        })

defineParameterType({
            name: 'tableName',
            regexp: /|| of the User Rights table| of the Reports table| of the Participant List table/,
        })

defineParameterType({
            name: 'timeType',
            regexp: /|seconds|second|minutes|minute/,
        })

defineParameterType({
            name: 'toDoRequestTypes',
            regexp: /|Move to prod|Approve draft changes|Copy project|Delete project/,
        })

defineParameterType({
            name: 'toDoTableIcons',
            regexp: /|process request|get more information|add or edit a comment|Move to low priority section|archive request notification/,
        })

defineParameterType({
            name: 'toDownloadFile',
            regexp: /| to download a file| near "with records in rows" to download a file| near "with records in columns" to download a file/,
        })

defineParameterType({
            name: 'userRightAction',
            regexp: /|add|remove/,
        })

defineParameterType({
            name: 'visibilityPrefix',
            regexp: /|an alert box with the following text:|a field named|a downloaded file named|Project status:|the exact time in the|today's date in the/,
        })

