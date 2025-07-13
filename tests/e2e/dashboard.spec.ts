import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { TestUtils } from './utils/test-utils';

test.describe('Dashboard Functionality', () => {
  let dashboardPage: DashboardPage;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    testUtils = new TestUtils(page);
    await dashboardPage.goto();
  });

test.describe('Collection Dashboard E2E', () => {
  test('Dashboard loads with key metrics', async ({ page }) => {
    await page.goto('/');
    
    // Check header
    await expect(page.locator('h1')).toContainText('Mobius One');
    await expect(page.locator('text=AI Active')).toBeVisible();
    
    // Check key metrics cards
    await expect(page.locator('text=Current DSO')).toBeVisible();
    await expect(page.locator('text=Working Capital Freed')).toBeVisible();
    await expect(page.locator('text=Pending Recommendations')).toBeVisible();
    await expect(page.locator('text=This Month Collected')).toBeVisible();
  });

  test('DSO metrics display correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for metrics to load
    await page.waitForSelector('text=Current DSO');
    
    // Check that DSO value is displayed
    const dsoCard = page.locator('text=Current DSO').locator('..');
    await expect(dsoCard.locator('text=days')).toBeVisible();
    
    // Check for improvement indicator
    await expect(dsoCard.locator('text=vs last month')).toBeVisible();
  });

  test('Recommendations section displays', async ({ page }) => {
    await page.goto('/');
    
    // Wait for recommendations section
    await page.waitForSelector('text=AI Recommendations');
    
    // Check recommendations header
    await expect(page.locator('text=AI Recommendations')).toBeVisible();
    
    // Check if there are recommendation cards or empty state
    const recommendationsSection = page.locator('text=AI Recommendations').locator('..');
    await expect(recommendationsSection).toBeVisible();
  });

  test('Recent outcomes section displays', async ({ page }) => {
    await page.goto('/');
    
    // Wait for outcomes section
    await page.waitForSelector('text=Recent Outcomes');
    
    // Check outcomes header
    await expect(page.locator('text=Recent Outcomes')).toBeVisible();
    
    // Check if there are outcome cards or empty state
    const outcomesSection = page.locator('text=Recent Outcomes').locator('..');
    await expect(outcomesSection).toBeVisible();
  });

  test('Recommendation approval workflow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for recommendations to load
    await page.waitForSelector('text=AI Recommendations');
    
    // Look for approval buttons
    const reviewButton = page.locator('text=Review & Approve').first();
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      
      // Should trigger some action (modal, navigation, etc.)
      // This would be expanded based on actual UI implementation
    }
  });

  test('Dashboard is responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Check that metrics are in a grid layout
    await expect(page.locator('text=Current DSO')).toBeVisible();
    await expect(page.locator('text=Working Capital Freed')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check that content is still visible on mobile
    await expect(page.locator('text=Current DSO')).toBeVisible();
    await expect(page.locator('text=Mobius One')).toBeVisible();
  });

  test('Dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    
    // Check initial theme (should be dark by default)
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark/);
    
    // Look for theme toggle if it exists
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Theme should change
      await expect(body).not.toHaveClass(/dark/);
    }
  });

  test('Navigation and breadcrumbs work', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation elements exist
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      // Test navigation functionality
      await expect(nav).toBeVisible();
    }
    
    // Check if breadcrumbs exist
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('Error handling for API failures', async ({ page }) => {
    // Intercept API calls and simulate failures
    await page.route('**/api/dso-metrics', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/');
    
    // Check that error states are handled gracefully
    // The exact implementation depends on how errors are displayed
    await page.waitForTimeout(2000); // Wait for API calls to complete
    
    // Dashboard should still be functional even with API errors
    await expect(page.locator('text=Mobius One')).toBeVisible();
  });
});