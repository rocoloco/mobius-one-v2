# Mobius One Testing Suite

This directory contains comprehensive tests for the Mobius One Collection Acceleration Engine using Playwright.

## Test Structure

```
tests/
├── api/                    # API endpoint tests
│   ├── dso-metrics.spec.ts     # DSO calculation tests
│   ├── recommendations.spec.ts  # AI recommendation tests
│   └── approvals.spec.ts       # Approval workflow tests
├── e2e/                    # End-to-end tests
│   └── dashboard.spec.ts       # Dashboard UI tests
├── integration/            # Integration tests
│   └── collection-flow.spec.ts # Complete workflow tests
├── helpers/                # Test utilities
│   └── test-utils.ts          # Common test functions
└── README.md              # This file
```

## Getting Started

### Prerequisites

1. Node.js 20 or higher
2. PostgreSQL database (for integration tests)
3. Environment variables configured

### Installation

```bash
npm install
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:headed

# Run specific test suites
npm run test:api        # API tests only
npm run test:e2e        # E2E tests only
npm run test:integration # Integration tests only

# View test report
npm run test:report
```

## Test Types

### API Tests (`tests/api/`)

Test individual API endpoints for:
- Response structure validation
- Error handling
- Data validation
- Performance

**Example:**
```typescript
test('GET /api/dso-metrics returns valid metrics', async ({ request }) => {
  const response = await request.get('/api/dso-metrics');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('current');
  expect(data).toHaveProperty('workingCapital');
});
```

### End-to-End Tests (`tests/e2e/`)

Test complete user workflows:
- Dashboard functionality
- User interactions
- Responsive design
- Error states

**Example:**
```typescript
test('Dashboard loads with key metrics', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Current DSO')).toBeVisible();
  await expect(page.locator('text=AI Recommendations')).toBeVisible();
});
```

### Integration Tests (`tests/integration/`)

Test complete business workflows:
- Data synchronization
- Collection workflows
- Cross-system integration

**Example:**
```typescript
test('Complete collection workflow', async ({ request }) => {
  // 1. Sync customer data
  // 2. Generate recommendations
  // 3. Approve recommendations
  // 4. Track outcomes
  // 5. Verify metrics improvement
});
```

## Test Configuration

### Environment Variables

Tests use `.env.test` for configuration:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mobius_test
ANTHROPIC_API_KEY=test-key
MOCK_EXTERNAL_APIS=true
```

### Playwright Configuration

Key settings in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  reporter: 'html'
});
```

## Test Helpers

### TestDataHelper

Utilities for creating test data:

```typescript
const helper = new TestDataHelper(request);
const customer = await helper.createTestCustomer();
const invoice = await helper.createTestInvoice(customer.id);
```

### APITestHelper

Utilities for API testing:

```typescript
const apiHelper = new APITestHelper(request);
await apiHelper.waitForAPI('/api/dso-metrics');
await apiHelper.validateAPIResponse(response, expectedStructure);
```

## Test Data Management

### Mock Data

Tests use mock data for external APIs:
- Salesforce account data
- NetSuite invoice data
- Claude AI responses

### Database Cleanup

Integration tests clean up data after execution:

```typescript
afterEach(async () => {
  await helper.cleanupTestData();
});
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` branch
- Pull requests
- Scheduled runs

Workflow includes:
- Database setup
- Environment configuration
- Test execution
- Report generation

### Test Reports

- HTML reports available in `playwright-report/`
- Screenshots and videos for failed tests
- Performance metrics tracking

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   test('DSO metrics calculation reflects invoice changes', async ({ request }) => {
   ```

2. **Test error conditions**
   ```typescript
   test('API returns 400 for invalid recommendation data', async ({ request }) => {
   ```

3. **Use page objects for complex UI**
   ```typescript
   const dashboard = new DashboardPage(page);
   await dashboard.waitForMetricsToLoad();
   ```

### Test Organization

1. Group related tests in `describe` blocks
2. Use `beforeEach` for common setup
3. Keep tests independent and isolated
4. Use meaningful assertions

### Performance Testing

1. Monitor API response times
2. Test with realistic data volumes
3. Verify memory usage
4. Test concurrent operations

## Debugging Tests

### Running Single Tests

```bash
npx playwright test --grep "DSO metrics"
```

### Debug Mode

```bash
npx playwright test --debug
```

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

## Contributing

1. Write tests for new features
2. Ensure tests pass before submitting PRs
3. Update documentation for new test patterns
4. Follow existing naming conventions

## Common Issues

### Database Connection

```bash
# Start local PostgreSQL
docker run -d --name postgres-test -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

### Port Conflicts

```bash
# Kill processes using port 3000
lsof -ti:3000 | xargs kill -9
```

### Test Timeouts

Increase timeout for slow operations:

```typescript
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

## Monitoring

### Test Metrics

Track test execution metrics:
- Pass/fail rates
- Execution time
- Flaky test detection
- Coverage reports

### Performance Monitoring

Monitor application performance during tests:
- API response times
- Database query performance
- Memory usage
- Resource utilization

## Support

For test-related issues:
1. Check existing test documentation
2. Review test failure logs
3. Use debug mode for investigation
4. Ask team for help with complex scenarios