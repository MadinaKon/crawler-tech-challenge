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

  describe("Complete Crawl Workflow", () => {
    beforeEach(() => {
      cy.login("admin@webcrawler.com", "admin123");
    });

    it("should complete full crawl workflow from creation to details", () => {
      const testUrl = "https://test-site.com";

      // Step 1: Add URL for crawling
      cy.intercept("POST", "http://localhost:8090/api/crawls", {
        statusCode: 201,
        body: {
          id: 1,
          url: testUrl,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      }).as("createCrawl");

      cy.get('[data-testid="dashboard-url-input"]').type(testUrl);
      cy.get('[data-testid="dashboard-add-url"]').click();
      cy.wait("@createCrawl");

      // Step 2: Mock crawl completion
      cy.intercept("GET", "http://localhost:8090/api/crawls", {
        statusCode: 200,
        body: [
          {
            id: 1,
            url: testUrl,
            title: "Test Site",
            status: "completed",
            html_version: "HTML5",
            heading_counts: { h1: 1, h2: 3, h3: 5 },
            internal_links: 10,
            external_links: 5,
            inaccessible_links: 2,
            has_login_form: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:10:00Z",
          },
        ],
      }).as("getCompletedCrawl");

      cy.wait("@getCompletedCrawl");

      // Step 3: View crawl details
      cy.intercept("GET", "http://localhost:8090/api/crawls/1", {
        statusCode: 200,
        body: {
          id: 1,
          url: testUrl,
          title: "Test Site",
          status: "completed",
          html_version: "HTML5",
          heading_counts: { h1: 1, h2: 3, h3: 5 },
          internal_links: 10,
          external_links: 5,
          inaccessible_links: 2,
          has_login_form: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:10:00Z",
        },
      }).as("getCrawlDetails");

      cy.intercept("GET", "http://localhost:8090/api/crawls/1/broken-links", {
        statusCode: 200,
        body: [
          {
            id: 1,
            crawl_id: 1,
            url: "https://test-site.com/broken-1",
            status_code: 404,
            error_message: "Page not found",
            created_at: "2024-01-01T00:10:00Z",
          },
          {
            id: 2,
            crawl_id: 1,
            url: "https://test-site.com/broken-2",
            status_code: 500,
            error_message: "Server error",
            created_at: "2024-01-01T00:10:00Z",
          },
        ],
      }).as("getBrokenLinks");

      cy.get('[data-testid="actions-view-details"]').click();

      cy.wait("@getCrawlDetails");
      cy.wait("@getBrokenLinks");

      // Step 4: Verify details page
      cy.url().should("include", "/detail/1");
      cy.get("h1").should("contain", "Crawl Details");
      cy.get("div").should("contain", testUrl);
      cy.get("div").should("contain", "Test Site");
      cy.get("div").should("contain", "completed");
      cy.get("div").should("contain", "h1: 1");
      cy.get("div").should("contain", "h2: 3");
      cy.get("div").should("contain", "h3: 5");
      cy.get("div").should("contain", "Internal Links: 10");
      cy.get("div").should("contain", "External Links: 5");
      cy.get("div").should("contain", "Inaccessible Links: 2");
      cy.get("div").should("contain", "Login Form: Yes");

      // Step 5: Verify broken links
      cy.get("h2").should("contain", "Broken Links");
      cy.get("table tbody tr").should("have.length", 2);
      cy.get("table").should("contain", "https://test-site.com/broken-1");
      cy.get("table").should("contain", "https://test-site.com/broken-2");
      cy.get("table").should("contain", "404");
      cy.get("table").should("contain", "500");

      // Step 6: Navigate back to dashboard
      cy.get("button").contains("Back to Dashboard").click();
      cy.url().should("not.include", "/detail");
      cy.get("h1").should("contain", "Web Crawler Dashboard");
    });
  });

  describe("Multiple Crawls Management", () => {
    beforeEach(() => {
      cy.login("admin@webcrawler.com", "admin123");
    });

    it("should manage multiple crawls with different statuses", () => {
      // Mock multiple crawls with different statuses
      cy.intercept("GET", "http://localhost:8090/api/crawls", {
        statusCode: 200,
        body: [
          {
            id: 1,
            url: "https://site1.com",
            title: "Site 1",
            status: "completed",
            html_version: "HTML5",
            heading_counts: { h1: 1 },
            internal_links: 5,
            external_links: 2,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:05:00Z",
          },
          {
            id: 2,
            url: "https://site2.com",
            title: "Site 2",
            status: "pending",
            html_version: "HTML5",
            heading_counts: {},
            internal_links: 0,
            external_links: 0,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: "2024-01-01T00:10:00Z",
            updated_at: "2024-01-01T00:10:00Z",
          },
          {
            id: 3,
            url: "https://site3.com",
            title: "",
            status: "failed",
            html_version: "",
            heading_counts: {},
            internal_links: 0,
            external_links: 0,
            inaccessible_links: 0,
            has_login_form: false,
            error_message: "Connection timeout",
            created_at: "2024-01-01T00:15:00Z",
            updated_at: "2024-01-01T00:20:00Z",
          },
        ],
      }).as("getMultipleCrawls");

      cy.visit("/");
      cy.wait("@getMultipleCrawls");

      // Verify all crawls are displayed
      cy.get("table tbody tr").should("have.length", 3);
      cy.get("table").should("contain", "https://site1.com");
      cy.get("table").should("contain", "https://site2.com");
      cy.get("table").should("contain", "https://site3.com");
      cy.get("table").should("contain", "completed");
      cy.get("table").should("contain", "pending");
      cy.get("table").should("contain", "failed");

      // Add another crawl
      cy.intercept("POST", "http://localhost:8090/api/crawls", {
        statusCode: 201,
        body: {
          id: 4,
          url: "https://site4.com",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      }).as("createNewCrawl");

      cy.get('[data-testid="dashboard-url-input"]').type("https://site4.com");
      cy.get('[data-testid="dashboard-add-url"]').click();
      cy.wait("@createNewCrawl");

      // Verify new crawl is added
      cy.get("table tbody tr").should("have.length", 4);
      cy.get("table").should("contain", "https://site4.com");
    });
  });

  describe("Authentication Persistence", () => {
    it("should maintain authentication state across page refreshes", () => {
      // Login first
      cy.login("admin@webcrawler.com", "admin123");

      // Verify we're on dashboard
      cy.get("h1").should("contain", "Web Crawler Dashboard");

      // Refresh the page
      cy.reload();

      // Should still be authenticated and on dashboard
      cy.get("h1").should("contain", "Web Crawler Dashboard");
      cy.get("span").should("contain", "Welcome, Admin User");

      // Verify authentication tokens are still present
      cy.window().then((win) => {
        cy.wrap(win.localStorage.getItem("access_token")).should("not.be.null");
        cy.wrap(win.localStorage.getItem("refresh_token")).should(
          "not.be.null"
        );
        cy.wrap(win.localStorage.getItem("user")).should("not.be.null");
      });
    });

    it("should redirect to login when tokens are invalid", () => {
      // Login first
      cy.login("admin@webcrawler.com", "admin123");

      // Clear tokens to simulate expired/invalid tokens
      cy.window().then((win) => {
        win.localStorage.removeItem("access_token");
        win.localStorage.removeItem("refresh_token");
      });

      // Try to access dashboard
      cy.visit("/");

      // Should redirect to login
      cy.get("h3").should("contain", "Login");
    });
  });

  describe("Error Recovery", () => {
    beforeEach(() => {
      cy.login("admin@webcrawler.com", "admin123");
    });

    it("should recover from network errors and continue working", () => {
      // Simulate network error on first load
      cy.intercept("GET", "http://localhost:8090/api/crawls", {
        forceNetworkError: true,
      }).as("networkError");

      cy.visit("/");
      cy.wait("@networkError");

      // Should show error message
      cy.get("div").should("contain", "Failed to fetch data");

      // Retry with successful response
      cy.intercept("GET", "http://localhost:8090/api/crawls", {
        statusCode: 200,
        body: [],
      }).as("successfulLoad");

      cy.reload();
      cy.wait("@successfulLoad");

      // Should show empty state
      cy.get("h3").should("contain", "No crawl results yet");

      // Should be able to add new URL
      cy.intercept("POST", "http://localhost:8090/api/crawls", {
        statusCode: 201,
        body: {
          id: 1,
          url: "https://example.com",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      }).as("createCrawl");

      cy.get('[data-testid="dashboard-url-input"]').type("https://example.com");
      cy.get('[data-testid="dashboard-add-url"]').click();
      cy.wait("@createCrawl");

      // Should show success message
      cy.get("div").should("contain", "URL added successfully");
    });
  });
});
