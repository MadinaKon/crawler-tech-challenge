# Testing Documentation

This document provides comprehensive information about the testing strategy and implementation for the Web Crawler application.

## Overview

The application uses a multi-layered testing approach:

1. **End-to-End (E2E) Tests** - Cypress tests covering complete user workflows
2. **Unit Tests** - Individual component and function tests (future implementation)
3. **Integration Tests** - API and database integration tests (future implementation)

## E2E Testing with Cypress

### Test Coverage

The Cypress test suite covers the following happy-path scenarios:

#### 1. Authentication Flow (`authentication.cy.ts`)

- ✅ User login with valid credentials
- ✅ User registration process
- ✅ Logout functionality
- ✅ Form validation
- ✅ Error handling for invalid credentials
- ✅ Demo credentials display

#### 2. Dashboard Operations (`dashboard.cy.ts`)

- ✅ Dashboard layout and navigation
- ✅ URL input and crawl creation
- ✅ Crawl data display and filtering
- ✅ Navigation to crawl details
- ✅ Loading states and error handling
- ✅ Empty state handling

#### 3. Crawl Details (`crawl-details.cy.ts`)

- ✅ Crawl details page layout
- ✅ Crawl statistics display
- ✅ Broken links section
- ✅ Different crawl statuses (queued, running, done, error)
- ✅ Navigation back to dashboard
- ✅ Error handling and loading states

#### 4. User Journey (`user-journey.cy.ts`)

- ✅ Complete user registration and first crawl
- ✅ End-to-end crawl workflow
- ✅ Multiple crawls management
- ✅ Authentication persistence
- ✅ Error recovery scenarios

### Test Statistics

- **Total Test Files:** 4
- **Total Test Cases:** ~25
- **Coverage Areas:** Authentication, Dashboard, Details, User Journeys
- **Test Execution Time:** ~3-5 minutes (all tests)

## Running Tests

### Prerequisites

1. **Application Setup:**

   ```bash
   # Start backend and database
   docker-compose up -d

   # Start frontend development server
   npm run dev
   ```

2. **Verify Services:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8090`
   - Database: `localhost:3306`

### Quick Start

#### Using the Test Runner Script (Recommended)

```bash
# Run all tests with automatic service startup
./scripts/run-tests.sh -s -f all

# Run specific test suites
./scripts/run-tests.sh -s -f auth
./scripts/run-tests.sh -s -f dashboard
./scripts/run-tests.sh -s -f details
./scripts/run-tests.sh -s -f journey

# Open Cypress Test Runner (interactive mode)
./scripts/run-tests.sh -s -f -o
```

#### Using npm Scripts

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all E2E tests (headless mode)
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth
npm run test:e2e:dashboard
npm run test:e2e:details
npm run test:e2e:journey
```

#### Direct Cypress Commands

```bash
# Run all tests
npx cypress run

# Run specific spec file
npx cypress run --spec "cypress/e2e/authentication.cy.ts"

# Open test runner
npx cypress open
```

## Test Configuration

### Cypress Configuration (`cypress.config.ts`)

```typescript
{
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
}
```

### Custom Commands

The test suite includes several custom commands for common operations:

```typescript
// Authentication
cy.login(email, password); // Login with credentials
cy.logout(); // Logout user

// URL Management
cy.addUrlForCrawling(url); // Add URL for crawling

// Utility
cy.clearLocalStorage(); // Clear browser storage
cy.isAuthenticated(); // Check if user is authenticated
cy.waitForPageLoad(); // Wait for page to load
cy.checkToastMessage(message); // Check toast notifications
cy.waitForApiResponse(method, url); // Wait for API response
```

## Test Data

### Demo Users

Tests use predefined demo accounts:

| Email                  | Password   | Role  | Purpose            |
| ---------------------- | ---------- | ----- | ------------------ |
| `admin@webcrawler.com` | `admin123` | admin | Admin user tests   |
| `user@webcrawler.com`  | `user123`  | user  | Regular user tests |

### Mock Data Strategy

- **API Interception:** All API calls are mocked using `cy.intercept()`
- **Realistic Data:** Mock responses match actual API response formats
- **Scenario Coverage:** Different scenarios (success, error, loading) are tested
- **Consistency:** Tests are deterministic and don't depend on external services

## Continuous Integration

### GitHub Actions Workflow

The `.github/workflows/e2e-tests.yml` file defines CI/CD pipeline:

1. **Service Setup:** MySQL database and application services
2. **Dependency Installation:** Node.js and Go dependencies
3. **Application Startup:** Backend and frontend services
4. **Test Execution:** Cypress tests in headless mode
5. **Artifact Upload:** Screenshots and videos on failure

### Parallel Execution

The workflow includes both:

- **Sequential execution** of all tests
- **Parallel execution** of individual test suites for faster feedback

## Best Practices

### Test Organization

1. **Descriptive Test Names:** Tests clearly describe the scenario being tested
2. **Grouped Tests:** Related tests are grouped in describe blocks
3. **Setup/Teardown:** Proper beforeEach and afterEach hooks
4. **Custom Commands:** Reusable commands for common operations

### API Mocking

1. **Intercept All Calls:** All API calls are intercepted to ensure test reliability
2. **Realistic Responses:** Mock data matches actual API response structure
3. **Error Scenarios:** Both success and error responses are tested
4. **Loading States:** Tests verify loading indicators and states

### Assertions

1. **UI Elements:** Verify elements are present and have correct content
2. **User Interactions:** Test that user actions produce expected results
3. **Navigation:** Confirm proper page navigation and URL changes
4. **Error Handling:** Validate error messages and recovery scenarios

## Troubleshooting

### Common Issues

#### 1. Tests Failing Due to Timing

```bash
# Increase timeouts in cypress.config.ts
defaultCommandTimeout: 15000
requestTimeout: 15000
```

#### 2. Application Not Running

```bash
# Check service status
docker-compose ps
curl http://localhost:8090/health
curl http://localhost:3000
```

#### 3. API Mocking Issues

```typescript
// Ensure intercept patterns match actual API calls
cy.intercept("POST", "http://localhost:8090/api/crawls").as("createCrawl");
cy.wait("@createCrawl");
```

### Debugging Tips

1. **Use Interactive Mode:**

   ```bash
   npm run cypress:open
   ```

2. **Add Debug Statements:**

   ```typescript
   cy.log("Debug message");
   cy.pause(); // Pause test execution
   ```

3. **Check Network Tab:**

   - Verify API calls are being made
   - Check request/response data

4. **View Screenshots/Videos:**
   - Screenshots are saved on test failure
   - Videos are recorded for all test runs

## Future Enhancements

### Planned Test Improvements

1. **Unit Tests:** Add Jest/Vitest for component and utility function testing
2. **Integration Tests:** Add API integration tests using Supertest
3. **Performance Tests:** Add Lighthouse CI for performance testing
4. **Accessibility Tests:** Add axe-core for accessibility testing
5. **Visual Regression Tests:** Add Percy for visual testing

### Test Coverage Goals

- **E2E Coverage:** 90% of user workflows
- **Unit Coverage:** 80% of components and functions
- **Integration Coverage:** 95% of API endpoints
- **Accessibility Coverage:** 100% of user-facing components

## Contributing to Tests

### Adding New Tests

1. **Follow Naming Convention:** `feature-name.cy.ts`
2. **Use Custom Commands:** Leverage existing custom commands
3. **Mock API Calls:** Always intercept API calls for reliability
4. **Test Both Success and Error:** Cover both happy and error paths
5. **Update Documentation:** Update this file when adding new test categories

### Test Review Checklist

- [ ] Tests are descriptive and clear
- [ ] API calls are properly mocked
- [ ] Both success and error scenarios are covered
- [ ] Tests are independent and don't rely on other tests
- [ ] Custom commands are used for common operations
- [ ] Assertions are specific and meaningful

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [GitHub Actions Cypress Action](https://github.com/cypress-io/github-action)
- [Cypress Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
