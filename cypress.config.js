const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://meuapp.local",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    video: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    env: {
      apiUrl: "https://meuapp.local/api",
      adminEmail: "admin@nosdeafeto.com",
      adminPassword: "Admin123",
    },
  },
});
