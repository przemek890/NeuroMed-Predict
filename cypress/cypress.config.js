const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/*.cy.{js,jsx,ts,tsx}',
    videosFolder: '/app/cypress/videos',
    baseUrl: process.env.DOMAIN || 'http://localhost:3000',
    video: true,
    videoCompression: 32,
    trashAssetsBeforeRuns: false,
    browser: 'electron',
    headless: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: '/app/cypress/logs/json',
      overwrite: false,
      html: false,
      json: true,
    },
  },
});
