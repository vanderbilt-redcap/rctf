import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'tests/**/*.cy.js',
    // setupNodeEvents(on, config) {
    //   // import.meta is available in ESM configs
    //   return config
    // },
     setupNodeEvents(on, config) {
        require('./plugins/index.js')(on, config)
        return config
    },
    supportFile: false,
    allowCypressEnv: false
  },
  defaultCommandTimeout: 0,
  responseTimeout: 0,
  requestTimeout: 0,
})