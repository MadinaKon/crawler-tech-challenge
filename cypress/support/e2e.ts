// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on("uncaught:exception", (err, _runnable) => {
  // returning false here prevents Cypress from failing the test
  // on uncaught exceptions (useful for React development mode)
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  return true;
});

// Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.include", "/login");
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  cy.get("button").contains("Logout").click();
  cy.url().should("include", "/");
});

// Custom command to add a URL for crawling
Cypress.Commands.add("addUrlForCrawling", (url: string) => {
  cy.get('input[placeholder*="URL"]').type(url);
  cy.get("button").contains("Add URL").click();
});

// Custom command to wait for API response
Cypress.Commands.add("waitForApiResponse", (method: string, url: string) => {
  cy.intercept(method, url).as("apiCall");
  cy.wait("@apiCall");
});
