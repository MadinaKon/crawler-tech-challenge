// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************


// Custom command to check if user is authenticated
Cypress.Commands.add("isAuthenticated", () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem("access_token");
    return token !== null;
  });
});

// Custom command to wait for page load
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should("not.exist");
});

// Custom command to check toast messages
Cypress.Commands.add("checkToastMessage", (message: string) => {
  cy.get('[data-testid="toast"]').should("contain", message);
});

// Type declarations for custom commands
export interface Cypress {
  Chainable: {
    login(email: string, password: string): Cypress.Chainable<void>;
    logout(): Cypress.Chainable<void>;
    addUrlForCrawling(url: string): Cypress.Chainable<void>;
    waitForApiResponse(method: string, url: string): Cypress.Chainable<void>;
  };
}

declare global {
  interface Cypress {
    Chainable: {
      login(email: string, password: string): Cypress.Chainable<void>;
      logout(): Cypress.Chainable<void>;
      addUrlForCrawling(url: string): Cypress.Chainable<void>;
      waitForApiResponse(method: string, url: string): Cypress.Chainable<void>;
    };
  }
}
