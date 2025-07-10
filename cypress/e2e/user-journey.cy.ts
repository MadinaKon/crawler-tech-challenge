/// <reference types="cypress" />

describe("User Journey - Complete Workflows", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Complete User Registration and First Crawl", () => {
    it("should allow new user to register and create their first crawl", () => {
      const testEmail = `newuser${Date.now()}@example.com`;

      // Start at login page
      cy.visit("/");
      cy.get("h3").should("contain", "Login");

      // Switch to registration
      cy.get("button").contains("Register").click();
      cy.get("h3").should("contain", "Register");

      // Fill registration form
      cy.get('[data-testid="register-name"]').type("New Test User");
      cy.get('input[type="email"]').type(testEmail);
      cy.get('[data-testid="register-password"]').type("newpassword123");
      cy.get('[data-testid="register-confirm-password"]').type(
        "newpassword123"
      );
      // Mock successful registration
      cy.intercept("POST", "http://localhost:8090/api/auth/register", {
        statusCode: 201,
        body: {
          access_token: "new-user-token",
          refresh_token: "new-refresh-token",
          user: {
            id: 999,
            email: testEmail,
            name: "New Test User",
            role: "user",
          },
        },
      }).as("registerUser");

      cy.get('button[type="submit"]').click();
      cy.wait("@registerUser");

      // Should be redirected to dashboard
      cy.get("h1").should("contain", "Web Crawler Dashboard");
      cy.get("span").should("contain", "Welcome, New Test User");
    });
  });
});
