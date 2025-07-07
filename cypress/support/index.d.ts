/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to add a URL for crawling
       * @example cy.addUrlForCrawling('https://example.com')
       */
      addUrlForCrawling(url: string): Chainable<void>;

      /**
       * Custom command to wait for API response
       * @example cy.waitForApiResponse('GET', '/api/crawls')
       */
      waitForApiResponse(method: string, url: string): Chainable<void>;

      /**
       * Custom command to clear localStorage
       * @example cy.clearLocalStorage()
       */
      clearLocalStorage(): Chainable<void>;

      /**
       * Custom command to check if user is authenticated
       * @example cy.isAuthenticated()
       */
      isAuthenticated(): Chainable<boolean>;

      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Custom command to check toast message
       * @example cy.checkToastMessage('Success message')
       */
      checkToastMessage(message: string): Chainable<void>;
    }
  }
}

export {};
