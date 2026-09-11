import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    specPattern: 'tests/**/*.cy.js',
    setupNodeEvents(on, config) {
        require('./plugins/index.js')(on, config)
        return config
    },
    supportFile: false,
  },
})