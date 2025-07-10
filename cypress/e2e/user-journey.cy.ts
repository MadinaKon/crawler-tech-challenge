/// <reference types="cypress" />

describe("User Journey - Complete Workflows", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Complete User Registration and First Crawl", () => {
    it("should allow new user to register and create their first crawl", () => {
      const testEmail = `newuser${Date.now()}@example.com`;
      const testUrl = "https://example.com";

      // Start at login page
      cy.visit("/");
      cy.get("h3").should("contain", "Login");

      // Switch to registration
      cy.get("button").contains("Register").click();
      cy.get("h3").should("contain", "Register");

      // Fill registration form
      cy.get('input[name="name"]').type("New Test User");
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type("newpassword123");

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

      // Add first URL for crawling
      cy.intercept("POST", "http://localhost:8090/api/crawls", {
        statusCode: 201,
        body: {
          id: 1,
          url: testUrl,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      }).as("createFirstCrawl");

      cy.intercept("GET", "http://localhost:8090/api/crawls", {
        statusCode: 200,
        body: [
          {
            id: 1,
            url: testUrl,
            title: "Example Domain",
            status: "pending",
            html_version: "HTML5",
            heading_counts: {},
            internal_links: 0,
            external_links: 0,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      }).as("getCrawls");

      cy.get('input[placeholder*="URL"]').type(testUrl);
      cy.get("button").contains("Add URL").click();

      cy.wait("@createFirstCrawl");
      cy.wait("@getCrawls");

      // Should show success message and display crawl
      cy.get("div").should("contain", "URL added successfully");
      cy.get("table").should("contain", testUrl);
      cy.get("table").should("contain", "pending");
    });
  });
});
