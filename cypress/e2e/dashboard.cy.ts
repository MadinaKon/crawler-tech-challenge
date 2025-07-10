/// <reference types="cypress" />

describe("Dashboard", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.login("admin@webcrawler.com", "admin123");
  });

  describe("Dashboard Layout", () => {
    it("should display dashboard with correct elements", () => {
      cy.get("h1").should("contain", "Web Crawler Dashboard");
      cy.get("p").should("contain", "Monitor and manage your website crawls");

      // Header elements
      cy.get("header").should("be.visible");
      cy.get("span").should("contain", "Welcome, Admin User");
      cy.get("button").contains("Logout").should("be.visible");

      // URL input section
      cy.get('input[placeholder*="URL"]').should("be.visible");
      cy.get("button").contains("Add URL").should("be.visible");
    });

    it("should show empty state when no crawls exist", () => {
      // Mock empty response
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 200,
        body: [],
      }).as("getCrawls");

      cy.visit("/");
      cy.wait("@getCrawls");

      cy.get("h3").should("contain", "No crawl results yet");
      cy.get("p").should(
        "contain",
        "Add a URL above to start crawling websites"
      );
    });
  });

  describe("URL Input and Crawl Creation", () => {
    it("should successfully add a URL for crawling", () => {
      const testUrl = "https://example.com";

      cy.intercept("POST", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 201,
        body: {
          id: 1,
          url: testUrl,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      }).as("createCrawl");

      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            url: testUrl,
            title: "Example Domain",
            status: "pending",
            html_version: "HTML5",
            heading_counts: { h1: 1, h2: 2 },
            internal_links: 5,
            external_links: 3,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      }).as("getCrawls");

      cy.get('input[placeholder*="URL"]').type(testUrl);
      cy.get("button").contains("Add URL").click();

      cy.wait("@createCrawl");
      cy.wait("@getCrawls");

      // Should show success message
      cy.get("div").should("contain", "URL added successfully");

      // Should display the crawl in the table
      cy.get("table").should("contain", testUrl);
      cy.get("table").should("contain", "pending");
    });

    it("should show error for invalid URL format", () => {
      const invalidUrl = "not-a-valid-url";

      cy.get('input[placeholder*="URL"]').type(invalidUrl);
      cy.get("button").contains("Add URL").click();

      // Should show error message
      cy.get("div").should("contain", "Failed to add URL");
    });

    it("should show error for empty URL", () => {
      cy.get("button").contains("Add URL").click();

      // Should show validation error
      cy.get("div").should("contain", "Failed to add URL");
    });

    it("should handle network errors gracefully", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 500,
        body: { error: "Internal server error" },
      }).as("createCrawlError");

      cy.get('input[placeholder*="URL"]').type("https://example.com");
      cy.get("button").contains("Add URL").click();

      cy.wait("@createCrawlError");

      // Should show error message
      cy.get("div").should("contain", "Failed to add URL");
    });

    it("should allow adding a new URL for crawling", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/crawls`).as("addCrawl");
      cy.get('[data-testid="dashboard-url-input"]').type("https://example.com");
      cy.get('[data-testid="dashboard-add-url"]').click();
      cy.wait("@addCrawl");
      cy.get('[data-testid="dashboard-table-row"]').should("exist");
    });

    it("should show empty state when there are no crawls", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, { body: [] }).as(
        "getCrawls"
      );
      cy.reload();
      cy.wait("@getCrawls");
      cy.get('[data-testid="dashboard-empty-state"]').should("be.visible");
    });
  });

  describe("Crawl Data Display", () => {
    beforeEach(() => {
      // Mock crawl data
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 200,
        body: [
          {
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
          {
            id: 2,
            url: "https://test.com",
            title: "Test Site",
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
        ],
      }).as("getCrawls");

      cy.visit("/");
      cy.wait("@getCrawls");
    });

    it("should display crawl results in a table", () => {
      cy.get("table").should("be.visible");

      // Check table headers
      cy.get("table thead").should("contain", "URL");
      cy.get("table thead").should("contain", "Title");
      cy.get("table thead").should("contain", "Status");
      cy.get("table thead").should("contain", "Actions");

      // Check table data
      cy.get("table tbody tr").should("have.length", 2);
      cy.get("table").should("contain", "https://example.com");
      cy.get("table").should("contain", "https://test.com");
      cy.get("table").should("contain", "completed");
      cy.get("table").should("contain", "pending");
    });

    it("should display correct status badges", () => {
      cy.get("table").should("contain", "completed");
      cy.get("table").should("contain", "pending");
    });

    it("should show action buttons for each crawl", () => {
      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get("button").should("contain", "View Details");
        });
    });

    it("should allow bulk re-run and delete", () => {
      // Select first two rows
      cy.get('[data-testid="dashboard-table-row"]')
        .eq(0)
        .find('input[type="checkbox"]')
        .check();
      cy.get('[data-testid="dashboard-table-row"]')
        .eq(1)
        .find('input[type="checkbox"]')
        .check();

      // Bulk re-run
      cy.get('[data-testid="bulk-re-run"]').click();
      cy.get('[data-testid="toast"]').should("contain", "Bulk re-run started");

      // Bulk delete
      cy.get('[data-testid="dashboard-table-row"]')
        .eq(0)
        .find('input[type="checkbox"]')
        .check();
      cy.get('[data-testid="dashboard-table-row"]')
        .eq(1)
        .find('input[type="checkbox"]')
        .check();
      cy.get('[data-testid="bulk-delete"]').click();
      cy.get('[data-testid="toast"]').should(
        "contain",
        "Bulk delete completed"
      );
    });

    it("should allow individual Start, Stop, and View Details actions", () => {
      // Open actions menu for first row
      cy.get('[data-testid="actions-menu"]').first().click();
      cy.get('[data-testid="actions-start"]').click();
      cy.get('[data-testid="toast"]').should("contain", "Started processing");

      // Open actions menu for first row again
      cy.get('[data-testid="actions-menu"]').first().click();
      cy.get('[data-testid="actions-stop"]').click();
      cy.get('[data-testid="toast"]').should("contain", "Stopped processing");

      // Open actions menu for first row again
      cy.get('[data-testid="actions-menu"]').first().click();
      cy.get('[data-testid="actions-view-details"]').click();
      cy.url().should("include", "/detail/");
    });
  });

  describe("Crawl Details Navigation", () => {
    beforeEach(() => {
      // Mock crawl data
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            url: "https://example.com",
            title: "Example Domain",
            status: "completed",
            html_version: "HTML5",
            heading_counts: { h1: 1, h2: 2 },
            internal_links: 5,
            external_links: 3,
            inaccessible_links: 0,
            has_login_form: false,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:05:00Z",
          },
        ],
      }).as("getCrawls");

      cy.visit("/");
      cy.wait("@getCrawls");
    });

    it("should navigate to crawl details page", () => {
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls/1`, {
        statusCode: 200,
        body: {
          id: 1,
          url: "https://example.com",
          title: "Example Domain",
          status: "completed",
          html_version: "HTML5",
          heading_counts: { h1: 1, h2: 2 },
          internal_links: 5,
          external_links: 3,
          inaccessible_links: 0,
          has_login_form: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z",
        },
      }).as("getCrawlDetails");

      cy.get("table tbody tr")
        .first()
        .within(() => {
          cy.get("button").contains("View Details").click();
        });

      cy.wait("@getCrawlDetails");

      // Should navigate to details page
      cy.url().should("include", "/detail/1");
      cy.get("h1").should("contain", "Crawl Details");
    });
  });

  describe("Loading States", () => {
    it("should show loading state while fetching data", () => {
      // Delay the API response to test loading state
      cy.intercept("GET", `${Cypress.env("apiUrl")}/crawls`, (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: [],
        });
      }).as("getCrawls");

      cy.visit("/");

      // Should show loading spinner
      cy.get(".animate-spin").should("be.visible");

      cy.wait("@getCrawls");

      // Loading spinner should disappear
      cy.get(".animate-spin").should("not.exist");
    });

    it("should show loading state while adding URL", () => {
      cy.intercept("POST", `${Cypress.env("apiUrl")}/crawls`, (req) => {
        req.reply({
          delay: 1000,
          statusCode: 201,
          body: { id: 1, url: "https://example.com", status: "pending" },
        });
      }).as("createCrawl");

      cy.get('input[placeholder*="URL"]').type("https://example.com");
      cy.get("button").contains("Add URL").click();

      // Button should show loading state
      cy.get("button").contains("Add URL").should("be.disabled");

      cy.wait("@createCrawl");

      // Button should be enabled again
      cy.get("button").contains("Add URL").should("not.be.disabled");
    });
  });
});
