/// <reference types="cypress" />

describe("Crawl Details", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.login("admin@webcrawler.com", "admin123");
  });

  describe("Crawl Details Page Layout", () => {
    beforeEach(() => {
      // Mock crawl details data
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "Example Domain",
          status: "completed",
          html_version: "HTML5",
          heading_counts: { h1: 1, h2: 2, h3: 3 },
          internal_links: 5,
          external_links: 3,
          inaccessible_links: 1,
          has_login_form: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z",
        },
      }).as("getCrawlDetails");

      cy.visit("/detail/1");
      cy.wait("@getCrawlDetails");
    });

    it("should display crawl details page with correct elements", () => {
      cy.get("h1").should("contain", "Crawl Details");

      // Back button
      cy.get("button").contains("Back to Dashboard").should("be.visible");

      // Basic crawl information
      cy.get("div").should("contain", "https://example.com");
      cy.get("div").should("contain", "Example Domain");
      cy.get("div").should("contain", "completed");
      cy.get("div").should("contain", "HTML5");
    });

    it("should display crawl statistics correctly", () => {
      // Heading counts
      cy.get("div").should("contain", "Heading Counts");
      cy.get("div").should("contain", "h1: 1");
      cy.get("div").should("contain", "h2: 2");
      cy.get("div").should("contain", "h3: 3");

      // Link counts
      cy.get("div").should("contain", "Internal Links: 5");
      cy.get("div").should("contain", "External Links: 3");
      cy.get("div").should("contain", "Inaccessible Links: 1");

      // Login form detection
      cy.get("div").should("contain", "Login Form: No");
    });

    it("should display timestamps correctly", () => {
      cy.get("div").should("contain", "Created:");
      cy.get("div").should("contain", "Updated:");
    });
  });

  describe("Broken Links Section", () => {
    beforeEach(() => {
      // Mock crawl details
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "Example Domain",
          status: "completed",
          html_version: "HTML5",
          heading_counts: { h1: 1 },
          internal_links: 5,
          external_links: 3,
          inaccessible_links: 2,
          has_login_form: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z",
        },
      }).as("getCrawlDetails");

      // Mock broken links data
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1/broken-links`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            crawl_id: 1,
            url: "https://example.com/broken-link-1",
            status_code: 404,
            error_message: "Page not found",
            created_at: "2024-01-01T00:05:00Z",
          },
          {
            id: 2,
            crawl_id: 1,
            url: "https://example.com/broken-link-2",
            status_code: 500,
            error_message: "Internal server error",
            created_at: "2024-01-01T00:05:00Z",
          },
        ],
      }).as("getBrokenLinks");

      cy.visit("/detail/1");
      cy.wait("@getCrawlDetails");
      cy.wait("@getBrokenLinks");
    });

    it("should display broken links section", () => {
      cy.get("h2").should("contain", "Broken Links");
      cy.get("table").should("be.visible");

      // Table headers
      cy.get("table thead").should("contain", "URL");
      cy.get("table thead").should("contain", "Status Code");
      cy.get("table thead").should("contain", "Error Message");

      // Table data
      cy.get("table tbody tr").should("have.length", 2);
      cy.get("table").should("contain", "https://example.com/broken-link-1");
      cy.get("table").should("contain", "https://example.com/broken-link-2");
      cy.get("table").should("contain", "404");
      cy.get("table").should("contain", "500");
      cy.get("table").should("contain", "Page not found");
      cy.get("table").should("contain", "Internal server error");
    });

    it("should show correct status code badges", () => {
      cy.get("table").should("contain", "404");
      cy.get("table").should("contain", "500");
    });

    it("should display empty state when no broken links", () => {
      // Mock empty broken links
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1/broken-links`, {
        statusCode: 200,
        body: [],
      }).as("getEmptyBrokenLinks");

      cy.visit("/detail/1");
      cy.wait("@getEmptyBrokenLinks");

      cy.get("h2").should("contain", "Broken Links");
      cy.get("div").should("contain", "No broken links found");
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "Example Domain",
          status: "completed",
          html_version: "HTML5",
          heading_counts: { h1: 1 },
          internal_links: 5,
          external_links: 3,
          inaccessible_links: 0,
          has_login_form: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z",
        },
      }).as("getCrawlDetails");

      cy.visit("/detail/1");
      cy.wait("@getCrawlDetails");
    });

    it("should navigate back to dashboard", () => {
      cy.get("button").contains("Back to Dashboard").click();

      cy.url().should("not.include", "/detail");
      cy.url().should("include", "/");
      cy.get("h1").should("contain", "Web Crawler Dashboard");
    });

    it("should handle direct URL access", () => {
      // Test accessing details page directly
      cy.visit("/detail/999");

      // Should handle non-existent crawl gracefully
      cy.get("div").should("contain", "Crawl not found");
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 404,
        body: { error: "Crawl not found" },
      }).as("getCrawlError");

      cy.visit("/detail/1");
      cy.wait("@getCrawlError");

      // Should show error message
      cy.get("div").should("contain", "Failed to load crawl details");
    });

    it("should handle network errors", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        forceNetworkError: true,
      }).as("getCrawlNetworkError");

      cy.visit("/detail/1");
      cy.wait("@getCrawlNetworkError");

      // Should show error message
      cy.get("div").should("contain", "Failed to load crawl details");
    });
  });

  describe("Loading States", () => {
    it("should show loading state while fetching crawl details", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: {
            id: 1,
            url: "https://example.com",
            title: "Example Domain",
            status: "completed",
            html_version: "HTML5",
            heading_counts: { h1: 1 },
            internal_links: 5,
            external_links: 3,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:05:00Z",
          },
        });
      }).as("getCrawlDetails");

      cy.visit("/detail/1");

      // Should show loading spinner
      cy.get(".animate-spin").should("be.visible");

      cy.wait("@getCrawlDetails");

      // Loading spinner should disappear
      cy.get(".animate-spin").should("not.exist");
    });
  });

  describe("Different Crawl Statuses", () => {
    it("should display pending crawl correctly", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "",
          status: "pending",
          html_version: "",
          heading_counts: {},
          internal_links: 0,
          external_links: 0,
          inaccessible_links: 0,
          has_login_form: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      }).as("getPendingCrawl");

      cy.visit("/detail/1");
      cy.wait("@getPendingCrawl");

      cy.get("div").should("contain", "pending");
      cy.get("div").should("contain", "Crawl is still in progress");
    });

    it("should display failed crawl correctly", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "",
          status: "failed",
          html_version: "",
          heading_counts: {},
          internal_links: 0,
          external_links: 0,
          inaccessible_links: 0,
          has_login_form: false,
          error_message: "Connection timeout",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z",
        },
      }).as("getFailedCrawl");

      cy.visit("/detail/1");
      cy.wait("@getFailedCrawl");

      cy.get("div").should("contain", "failed");
      cy.get("div").should("contain", "Connection timeout");
    });
  });
});
