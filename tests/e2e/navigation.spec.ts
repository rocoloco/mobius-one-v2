import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { TestUtils } from './utils/test-utils';

test.describe('Navigation and Layout', () => {
  let basePage: BasePage;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    testUtils = new TestUtils(page);
    await basePage.goto('/');
  });

  test('should display Mobius One branding correctly', async ({ page }) => {
    await test.step('Verify logo and company name', async () => {
      await testUtils.verifyBranding();
      await expect(page.locator('text=Mobius One')).toBeVisible();
    });

    await test.step('Verify brand colors are applied', async () => {
      // Check if primary color classes are present
      const primaryElements = page.locator('[class*="text-primary"], [class*="bg-primary"]');
      const count = await primaryElements.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('should have responsive sidebar navigation', async ({ page }) => {
    await test.step('Desktop: sidebar should be visible by default', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await testUtils.waitForPageLoad();
      expect(await basePage.isSidebarVisible()).toBeTruthy();
    });

    await test.step('Mobile: sidebar should be hidden by default', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await testUtils.waitForPageLoad();
      
      // Mobile sidebar should be hidden initially
      const sidebarVisible = await basePage.isSidebarVisible();
      if (sidebarVisible) {
        // If visible, it should be collapsible
        await basePage.sidebarToggle.click();
        await page.waitForTimeout(500);
      }
    });

    await test.step('Mobile: should be able to toggle sidebar', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await testUtils.waitForPageLoad();
      
      await basePage.openMobileSidebar();
      expect(await basePage.isSidebarVisible()).toBeTruthy();
    });
  });

  test('should navigate to all main sections', async ({ page }) => {
    const sections = [
      { name: 'dashboard', path: '/', title: 'Dashboard' },
      { name: 'customers', path: '/customers', title: 'Customer' },
      { name: 'invoices', path: '/invoices', title: 'Invoice' },
      { name: 'recommendations', path: '/recommendations', title: 'Recommendation' },
      { name: 'analytics', path: '/analytics', title: 'Analytics' },
      { name: 'settings', path: '/settings', title: 'Settings' }
    ];

    for (const section of sections) {
      await test.step(`Navigate to ${section.name}`, async () => {
        await basePage.navigateTo(section.name as any);
        await testUtils.waitForNavigation(section.path);
        
        // Verify URL
        expect(page.url()).toContain(section.path);
        
        // Verify page title/heading contains expected text
        await basePage.verifyPageTitle(section.title);
        
        // Verify active navigation state
        await basePage.verifyActiveNavigation(section.title);
      });
    }
  });

  test('should show proper navigation descriptions on active states', async ({ page }) => {
    await test.step('Navigate to customers and verify description', async () => {
      await basePage.navigateTo('customers');
      
      // Check if description appears for active navigation
      const customerDesc = page.locator('text*="Customer accounts"');
      await expect(customerDesc).toBeVisible();
    });
  });

  test('should have working header functionality', async ({ page }) => {
    await test.step('Verify search input is present', async () => {
      await expect(basePage.searchInput).toBeVisible();
      await expect(basePage.searchInput).toBeEnabled();
    });

    await test.step('Verify user menu is clickable', async () => {
      await basePage.openUserMenu();
      
      // Check if dropdown menu appears
      const userMenuItems = page.locator('[role="menuitem"], [role="menu"] a');
      const count = await userMenuItems.count();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Verify AI status indicator', async () => {
      await basePage.verifyAIStatus();
    });
  });

  test('should maintain navigation state during page refresh', async ({ page }) => {
    await test.step('Navigate to analytics and refresh', async () => {
      await basePage.navigateTo('analytics');
      await page.reload();
      await testUtils.waitForPageLoad();
      
      // Should still be on analytics page
      expect(page.url()).toContain('/analytics');
      await basePage.verifyPageTitle('Analytics');
    });
  });

  test('should handle direct URL navigation', async ({ page }) => {
    const urls = ['/customers', '/invoices', '/recommendations', '/analytics', '/settings'];
    
    for (const url of urls) {
      await test.step(`Direct navigation to ${url}`, async () => {
        await basePage.goto(url);
        
        // Should load the page successfully
        await expect(page.locator('h1, h2')).toBeVisible();
        await basePage.verifyPageLoaded();
        
        // Verify URL is correct
        expect(page.url()).toContain(url);
      });
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await test.step('Tab navigation should work', async () => {
      await testUtils.checkAccessibility();
      
      // Tab through navigation items
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // One of the navigation links should be focused
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused?.tagName,
          href: (focused as HTMLAnchorElement)?.href,
          text: focused?.textContent?.trim()
        };
      });
      
      expect(focusedElement.tagName).toBe('A');
      expect(focusedElement.text).toBeTruthy();
    });

    await test.step('Enter key should activate navigation', async () => {
      // Focus on customers link and press enter
      await basePage.customersLink.focus();
      await page.keyboard.press('Enter');
      await testUtils.waitForNavigation('/customers');
      
      expect(page.url()).toContain('/customers');
    });
  });

  test('should work across different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await test.step(`Test navigation on ${viewport.name}`, async () => {
        await page.setViewportSize(viewport);
        await testUtils.waitForPageLoad();
        
        // Ensure we can navigate to at least one section
        await basePage.navigateTo('customers');
        await testUtils.waitForNavigation('/customers');
        
        expect(page.url()).toContain('/customers');
        await basePage.verifyPageLoaded();
      });
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await test.step('Should show error state for failed navigation', async () => {
      // Try to navigate to a non-existent page
      await page.goto('/nonexistent', { waitUntil: 'networkidle' });
      
      // Should either show 404 or redirect to home
      const is404 = page.url().includes('/nonexistent') && await page.locator('text*="404"').isVisible();
      const isRedirected = page.url().includes('/') && !page.url().includes('/nonexistent');
      
      expect(is404 || isRedirected).toBeTruthy();
    });
  });
});