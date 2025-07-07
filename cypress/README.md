# Cypress E2E Test Suite

This directory contains comprehensive end-to-end tests for the Web Crawler application using Cypress.

## Test Structure

### Test Files

1. **`authentication.cy.ts`** - Authentication flow tests

   - Login functionality (valid/invalid credentials)
   - Registration process
   - Logout functionality
   - Demo credentials display
   - Form validation

2. **`dashboard.cy.ts`** - Dashboard functionality tests

   - Dashboard layout and elements
   - URL input and crawl creation
   - Crawl data display
   - Navigation to details
   - Loading states
   - Error handling

3. **`crawl-details.cy.ts`** - Crawl details page tests

   - Details page layout
   - Crawl statistics display
   - Broken links section
   - Navigation back to dashboard
   - Different crawl statuses (pending, completed, failed)
   - Error handling and loading states

4. **`user-journey.cy.ts`** - Complete user workflow tests
   - End-to-end user registration and first crawl
   - Complete crawl workflow from creation to details
   - Multiple crawls management
   - Authentication persistence
   - Error recovery scenarios

## Running Tests

### Prerequisites

1. **Start the application:**

   ```bash
   # Start backend and database
   docker-compose up -d

   # Start frontend development server
   npm run dev
   ```

2. **Ensure the application is running on:**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8090`

### Available Commands

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all E2E tests (headless mode)
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth        # Authentication tests only
npm run test:e2e:dashboard   # Dashboard tests only
npm run test:e2e:details     # Crawl details tests only
npm run test:e2e:journey     # User journey tests only

# Run Cypress directly
npx cypress run              # Run all tests
npx cypress open             # Open test runner
```

## Test Configuration

### Base Configuration (`cypress.config.ts`)

- **Base URL:** `http://localhost:3000`
- **Viewport:** 1280x720
- **Timeouts:** 10 seconds for commands and requests
- **Video recording:** Disabled
- **Screenshots:** Enabled on failure

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

The tests use the following demo accounts:

- **Admin User:**

  - Email: `admin@webcrawler.com`
  - Password: `admin123`
  - Role: `admin`

- **Regular User:**
  - Email: `user@webcrawler.com`
  - Password: `user123`
  - Role: `user`

### Mock Data

Tests use Cypress interceptors to mock API responses, ensuring:

- Consistent test results
- Fast test execution
- No dependency on external services
- Controlled test scenarios

## Test Scenarios Covered

### Happy Path Scenarios

1. **User Registration & Login**

   - New user registration
   - Successful login with valid credentials
   - Demo credentials usage
   - Form validation

2. **Dashboard Operations**

   - Viewing crawl list
   - Adding new URLs for crawling
   - Viewing crawl statuses
   - Navigation to details

3. **Crawl Management**

   - Creating new crawls
   - Viewing crawl progress
   - Accessing crawl details
   - Managing multiple crawls

4. **Crawl Details**

   - Viewing crawl statistics
   - Analyzing broken links
   - Understanding crawl results
   - Navigation between pages

5. **Error Handling**
   - Network errors
   - Invalid credentials
   - API failures
   - Recovery scenarios

### Edge Cases

- Empty crawl lists
- Failed crawls
- Network timeouts
- Invalid URLs
- Authentication token expiration
- Page refreshes during operations

## Best Practices

### Test Organization

- **Describe blocks** group related tests
- **BeforeEach hooks** set up test state
- **Custom commands** reduce code duplication
- **Meaningful test names** describe the scenario

### API Mocking

- **Intercept API calls** to control responses
- **Mock different scenarios** (success, error, loading)
- **Use realistic data** that matches the application

### Assertions

- **Check UI elements** are present and correct
- **Verify API calls** are made with correct data
- **Test user interactions** and their effects
- **Validate error states** and recovery

### Performance

- **Minimize API calls** by mocking responses
- **Use efficient selectors** (data-testid when possible)
- **Avoid unnecessary waits** by using proper assertions

## Troubleshooting

### Common Issues

1. **Tests failing due to timing:**

   - Increase timeouts in `cypress.config.ts`
   - Use `cy.wait()` for API calls
   - Add proper assertions before interactions

2. **Application not running:**

   - Ensure Docker containers are healthy
   - Check frontend and backend are accessible
   - Verify demo users exist in database

3. **API mocking issues:**
   - Check intercept patterns match actual API calls
   - Verify response format matches application expectations
   - Use `cy.wait('@alias')` to ensure mocks are used

### Debugging

1. **Use Cypress Test Runner:**

   ```bash
   npm run cypress:open
   ```

2. **Add debugging statements:**

   ```typescript
   cy.log("Debug message");
   cy.pause(); // Pause test execution
   ```

3. **Check network tab:**
   - Verify API calls are being made
   - Check request/response data

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: docker-compose up -d
      - run: npm run dev &
      - run: npm run test:e2e
```

## Contributing

When adding new tests:

1. **Follow the existing structure** and naming conventions
2. **Add meaningful test descriptions** that explain the scenario
3. **Use custom commands** for common operations
4. **Mock API responses** to ensure test reliability
5. **Test both success and error scenarios**
6. **Update this README** if adding new test categories or commands
