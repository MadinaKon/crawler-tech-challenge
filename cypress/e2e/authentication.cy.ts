/// <reference types="cypress" />

describe("Authentication", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });

  describe("Login Flow", () => {
    it("should display login form by default", () => {
      cy.get("h3").should("contain", "Login");
      cy.get('[data-testid="login-email"]').should("be.visible");
      cy.get('[data-testid="login-password"]').should("be.visible");
      cy.get('[data-testid="login-submit"]').should("contain", "Login");
    });

    it("should successfully login with valid admin credentials", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`).as(
        "loginRequest"
      );

      cy.get('[data-testid="login-email"]').type("admin@webcrawler.com");
      cy.get('[data-testid="login-password"]').type("admin123");
      cy.get('[data-testid="login-submit"]').click();

      // Wait for API response
      cy.wait("@loginRequest");

      // Should redirect to dashboard
      cy.url().should("not.include", "/login");
      cy.get("h1").should("contain", "Web Crawler Dashboard");
      cy.get("span").should("contain", "Welcome, Admin User");
    });

    it("should successfully login with valid user credentials", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`).as(
        "loginRequest"
      );

      cy.get('[data-testid="login-email"]').type("user@webcrawler.com");
      cy.get('[data-testid="login-password"]').type("user123");
      cy.get('[data-testid="login-submit"]').click();

      cy.wait("@loginRequest");

      cy.url().should("not.include", "/login");
      cy.get("h1").should("contain", "Web Crawler Dashboard");
      cy.get("span").should("contain", "Welcome, Test User");
    });

    it("should show error message with invalid credentials", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/login`, {
        statusCode: 401,
        body: { error: "Invalid credentials" },
      }).as("loginRequest");

      cy.get('[data-testid="login-email"]').type("invalid@example.com");
      cy.get('[data-testid="login-password"]').type("wrongpassword");
      cy.get('[data-testid="login-submit"]').click();

      cy.wait("@loginRequest");

      // Should stay on login page
      cy.url().should("include", "/");
      cy.get("h3").should("contain", "Login");
    });

    it("should show validation errors for empty fields", () => {
      cy.get('[data-testid="login-submit"]').click();

      // Should stay on login page without making API call
      cy.url().should("include", "/");
      cy.get("h3").should("contain", "Login");
    });
  });

  describe("Registration Flow", () => {
    it("should switch to registration form", () => {
      cy.get('[data-testid="login-switch-register"]').click();
      cy.get("h3").should("contain", "Register");
      cy.get('[data-testid="register-name"]').should("be.visible");
      cy.get('[data-testid="register-email"]').should("be.visible");
      cy.get('[data-testid="register-password"]').should("be.visible");
      cy.get('[data-testid="register-submit"]').should("contain", "Register");
    });

    it("should successfully register a new user", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/register`).as(
        "registerRequest"
      );

      cy.get('[data-testid="login-switch-register"]').click();

      const testEmail = `test${Date.now()}@example.com`;

      cy.get('[data-testid="register-name"]').type("Test User");
      cy.get('[data-testid="register-email"]').type(testEmail);
      cy.get('[data-testid="register-password"]').type("testpassword123");
      cy.get('[data-testid="register-confirm-password"]').type(
        "testpassword123"
      );
      cy.get('[data-testid="register-submit"]').click();

      cy.wait("@registerRequest");

      // Should redirect to dashboard after successful registration
      cy.url().should("not.include", "/login");
      cy.get("h1").should("contain", "Web Crawler Dashboard");
    });

    it("should show error for duplicate email registration", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/auth/register`, {
        statusCode: 400,
        body: { error: "Email already exists" },
      }).as("registerRequest");

      cy.get('[data-testid="login-switch-register"]').click();

      cy.get('[data-testid="register-name"]').type("Test User");
      cy.get('[data-testid="register-email"]').type("admin@webcrawler.com");
      cy.get('[data-testid="register-password"]').type("testpassword123");
      cy.get('[data-testid="register-confirm-password"]').type(
        "testpassword123"
      );
      cy.get('[data-testid="register-submit"]').click();

      cy.wait("@registerRequest");

      // Should stay on registration page
      cy.url().should("include", "/");
      cy.get("h3").should("contain", "Register");
    });
  });

  describe("Logout Flow", () => {
    beforeEach(() => {
      // Login first
      cy.login("admin@webcrawler.com", "admin123");
    });

    it("should successfully logout user", () => {
      cy.get("button").contains("Logout").click();

      // Should redirect to login page
      cy.url().should("include", "/");
      cy.get("h3").should("contain", "Login");

      // Should clear authentication state
      cy.window().then((win) => {
        cy.wrap(win.localStorage.getItem("access_token")).should("be.null");
        cy.wrap(win.localStorage.getItem("refresh_token")).should("be.null");
        cy.wrap(win.localStorage.getItem("user")).should("be.null");
      });
    });

    it("should prevent access to dashboard after logout", () => {
      cy.logout();

      // Try to access dashboard directly
      cy.visit("/dashboard");

      // Should redirect to login
      cy.url().should("include", "/");
      cy.get("h3").should("contain", "Login");
    });
  });

  describe("Demo Credentials Display", () => {
    it("should show demo credentials in development mode", () => {
      cy.get("p").should("contain", "Demo accounts:");
      cy.get("p").should("contain", "Admin: admin@webcrawler.com / admin123");
      cy.get("p").should("contain", "User: user@webcrawler.com / user123");
    });
  });
});
