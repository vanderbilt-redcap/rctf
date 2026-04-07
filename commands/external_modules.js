Cypress.Commands.add('enable_modules', (csrf_token) => {
    let modules = Cypress.env('bootstrap_settings')['modules']

    if(modules !== undefined && csrf_token !== undefined){

        for (const [key, value] of Object.entries(modules)) {
            if (value === true) {
                const folder = key;
                const [prefix, version] = folder.split('_v');

                cy.request({
                    method: 'POST',
                    url: `/redcap_v${Cypress.env('redcap_version')}/ExternalModules/manager/ajax/enable-module.php`,
                    form: true,
                    body: {
                        prefix: prefix,
                        version: `v${version}`,
                        redcap_csrf_token: csrf_token
                    }
                })

            }
        }
    }
})

Cypress.Commands.add('getCsrfToken', () => {
    // Wait for the page JS to define the global var
    return cy.window({ log: false }).then((win) => {
        // Retry until token appears (Cypress auto-retries the .then block if we throw)
        const token = win.redcap_csrf_token;
        if (!token) {
            throw new Error('CSRF token not available on window yet');
        }
        return token;
    });
});
