
UPDATE redcap_config SET value='REDCAP_VERSION_MAGIC_STRING' WHERE field_name='redcap_version';
UPDATE redcap_config SET value='BASE_URL' WHERE field_name='redcap_base_url';
UPDATE redcap_config SET value='table' WHERE field_name='auth_meth_global';
UPDATE redcap_config SET value='sha512' WHERE field_name='password_algo';
UPDATE redcap_config SET value='0' WHERE field_name='is_development_server';
UPDATE redcap_config SET value = '1' WHERE field_name = 'database_query_tool_enabled';
UPDATE redcap_config SET value = 'fake-automated-testing-address@fake-domain.org' WHERE field_name = 'from_email';
UPDATE redcap_config SET value = 'fake-automated-testing-address@fake-domain.org' WHERE field_name = 'project_contact_email';
UPDATE redcap_config SET value = 0 WHERE field_name = 'auto_report_stats';
