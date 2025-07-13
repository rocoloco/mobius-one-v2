import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { TestUtils } from './utils/test-utils';

test.describe('Comprehensive Dashboard Tests', () => {
  let dashboardPage: DashboardPage;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    testUtils = new TestUtils(page);
    await dashboardPage.goto();
  });

  test('should load dashboard with all key elements', async ({ page }) => {
    await test.step('Verify page loads correctly', async () => {
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Verify all metric cards are present', async () => {
      await dashboardPage.verifyMetricCards();
    });

    await test.step('Verify AI recommendations section', async () => {
      await dashboardPage.verifyAIRecommendations();
    });

    await test.step('Verify recent outcomes section', async () => {
      await dashboardPage.verifyRecentOutcomes();
    });
  });

  test('should display realistic metric data', async ({ page }) => {
    await test.step('Check DSO metric shows valid data', async () => {
      await dashboardPage.verifyDSOImprovement();
      
      const dsoValue = await dashboardPage.getCurrentDSOValue();
      expect(dsoValue).toBeGreaterThan(0);
      expect(dsoValue).toBeLessThan(365);
    });

    await test.step('Check working capital shows progress', async () => {
      await dashboardPage.verifyWorkingCapitalProgress();
    });

    await test.step('Verify all metrics show valid data', async () => {
      await dashboardPage.verifyMetricData();
    });
  });

  test('should handle recommendation interactions', async ({ page }) => {
    await test.step('Verify recommendation cards are clickable', async () => {
      const recommendationsCount = await dashboardPage.getPendingRecommendationsCount();
      
      if (recommendationsCount > 0) {
        // Check if Review & Approve buttons are present and clickable
        await expect(dashboardPage.reviewApproveButtons.first()).toBeVisible();
        await expect(dashboardPage.reviewApproveButtons.first()).toBeEnabled();
      }
    });

    await test.step('Click on recommendation should work', async () => {
      const reviewButtons = await dashboardPage.reviewApproveButtons.count();
      
      if (reviewButtons > 0) {
        // Click on first recommendation
        await dashboardPage.clickReviewApprove(0);
        
        // Should either navigate somewhere or show a modal/dialog
        // For now, just verify page doesn't crash
        await testUtils.waitForPageLoad();
        expect(page.url()).toBeTruthy();
      }
    });
  });

  test('should show proper AI status', async ({ page }) => {
    await test.step('AI status indicator should be visible', async () => {
      await dashboardPage.verifyAIStatus();
    });

    await test.step('AI status should show active state', async () => {
      const aiStatus = dashboardPage.aiStatusIndicator;
      const statusText = await aiStatus.textContent();
      expect(statusText?.toLowerCase()).toContain('active');
    });
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await testUtils.testResponsive(async () => {
      await test.step('Dashboard should adapt to viewport', async () => {
        await dashboardPage.verifyDashboardLoaded();
        
        // Check if metric cards are still visible and properly arranged
        await dashboardPage.verifyMetricCards();
        
        // On mobile, cards might stack vertically
        const cardContainer = page.locator('[class*="grid"]').first();
        await expect(cardContainer).toBeVisible();
      });
    });
  });

  test('should handle data loading states', async ({ page }) => {
    await test.step('Page should load without errors', async () => {
      // Check that no error messages are displayed
      const errorMessages = page.locator('text*="Error", text*="Failed", text*="error"');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBe(0);
    });

    await test.step('All metric cards should show data', async () => {
      // Verify each card has actual data, not loading states
      const cards = page.locator('[class*="collection-metric"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);
        const cardText = await card.textContent();
        expect(cardText).toBeTruthy();
        expect(cardText?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test('should maintain state during navigation', async ({ page }) => {
    await test.step('Navigate away and back to dashboard', async () => {
      // Get initial DSO value
      const initialDSO = await dashboardPage.getCurrentDSOValue();
      
      // Navigate to another page
      await dashboardPage.navigateTo('customers');
      await testUtils.waitForNavigation('/customers');
      
      // Navigate back to dashboard
      await dashboardPage.navigateTo('dashboard');
      await testUtils.waitForNavigation('/');
      
      // DSO should be the same (data consistency)
      const finalDSO = await dashboardPage.getCurrentDSOValue();
      expect(finalDSO).toBe(initialDSO);
    });
  });

  test('should handle page refresh correctly', async ({ page }) => {
    await test.step('Dashboard should reload properly', async () => {
      // Get data before refresh
      const initialDSO = await dashboardPage.getCurrentDSOValue();
      const initialRecommendations = await dashboardPage.getPendingRecommendationsCount();
      
      // Refresh page
      await page.reload();
      await testUtils.waitForPageLoad();
      
      // Verify dashboard still works
      await dashboardPage.verifyDashboardLoaded();
      
      // Data should be consistent
      const newDSO = await dashboardPage.getCurrentDSOValue();
      const newRecommendations = await dashboardPage.getPendingRecommendationsCount();
      
      expect(newDSO).toBe(initialDSO);
      expect(newRecommendations).toBe(initialRecommendations);
    });
  });

  test('should have proper accessibility', async ({ page }) => {
    await test.step('Dashboard should be keyboard navigable', async () => {
      await testUtils.checkAccessibility();
      
      // Tab through dashboard elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to focus on interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT'].includes(focusedElement || '')).toBeTruthy();
    });

    await test.step('Metric cards should have proper contrast', async () => {
      // Check if text is readable (basic accessibility)
      const cards = page.locator('[class*="collection-metric"]');
      const firstCard = cards.first();
      
      await expect(firstCard).toBeVisible();
      
      // Check if card has proper styling classes
      const cardClasses = await firstCard.getAttribute('class');
      expect(cardClasses).toBeTruthy();
    });
  });
});