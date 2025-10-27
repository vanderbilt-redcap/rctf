//PARAMETER TYPES IMPORTED HERE
require('../index')

if (typeof window !== 'undefined') {
    require('../commands')
}

require('./support/all_mappings.mjs')
require('./support/all_types')

//STANDARD
require('./control_center')
require('./data_import')
require('./data_access_groups')
require('./development_only')
require('./download')
require('./interactions')
require('./login')
require('./longitudinal_events')
require('./online_designer')
require('./project_setup')
require('./record_home_page')
require('./record_status_dashboard')
require('./reporting')
require('./survey')
require('./user_rights')
require('./visibilty')
require('./visit_page')

//FILE PROCESSING
require('./csv')

//TEST SPECIFIC
require('./browse_projects')
require('./configuration_check')
require('./logging')
require('./misc')

console.log('RCTF: Core Step Definitions Loaded')