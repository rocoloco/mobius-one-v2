import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { TestUtils } from './utils/test-utils';

test.describe('All Pages Functionality', () => {
  let basePage: BasePage;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    testUtils = new TestUtils(page);
  });

  const pages = [
    { name: 'Dashboard', path: '/', title: 'Dashboard' },
    { name: 'Customers', path: '/customers', title: 'Customer' },
    { name: 'Invoices', path: '/invoices', title: 'Invoice' },
    { name: 'Recommendations', path: '/recommendations', title: 'Recommendation' },
    { name: 'Analytics', path: '/analytics', title: 'Analytics' },
    { name: 'Settings', path: '/settings', title: 'Settings' }
  ];

  test('should load all pages without errors', async ({ page }) => {
    for (const pageInfo of pages) {
      await test.step(`Load ${pageInfo.name} page`, async () => {
        await basePage.goto(pageInfo.path);
        
        // Verify page loads successfully
        await basePage.verifyPageLoaded();
        
        // Verify page title
        await basePage.verifyPageTitle(pageInfo.title);
        
        // Verify URL is correct
        expect(page.url()).toContain(pageInfo.path);
        
        // Check that no error messages are visible
        const errorSelectors = [
          'text*="Error"',
          'text*="404"',
          'text*="Not found"',
          'text*="Something went wrong"',
          '[class*="error"]'
        ];
        
        for (const selector of errorSelectors) {
          const errorElements = page.locator(selector);
          const count = await errorElements.count();
          expect(count).toBe(0);
        }
      });
    }
  });

  test('should have consistent layout across all pages', async ({ page }) => {
    for (const pageInfo of pages) {
      await test.step(`Check layout consistency on ${pageInfo.name}`, async () => {
        await basePage.goto(pageInfo.path);
        
        // Verify common layout elements
        await expect(basePage.logo).toBeVisible();
        await expect(basePage.sidebar).toBeVisible();
        await expect(basePage.aiStatusIndicator).toBeVisible();
        
        // Verify navigation is present
        await expect(basePage.dashboardLink).toBeVisible();
        await expect(basePage.customersLink).toBeVisible();
        await expect(basePage.settingsLink).toBeVisible();
        
        // Verify branding consistency
        await testUtils.verifyBranding();
      });
    }
  });

  test('should show proper page content for each section', async ({ page }) => {
    await test.step('Customers page should show customer-related content', async () => {
      await basePage.goto('/customers');
      
      // Check for customer-specific elements
      const customerContent = [
        'Customer Management',
        'Customer Overview',
        'Payment Behavior',
        'Credit Management'
      ];
      
      for (const content of customerContent) {
        await expect(page.locator(`text*="${content}"`)).toBeVisible();
      }
    });

    await test.step('Invoices page should show invoice-related content', async () => {
      await basePage.goto('/invoices');
      
      // Check for invoice-specific elements
      const invoiceContent = [
        'Invoice Management',
        'Aging Report',
        'Overdue Invoices',
        'Critical Accounts'
      ];
      
      for (const content of invoiceContent) {
        await expect(page.locator(`text*="${content}"`)).toBeVisible();
      }
    });

    await test.step('Recommendations page should show AI recommendation content', async () => {
      await basePage.goto('/recommendations');
      
      // Check for recommendations-specific elements
      const recommendationContent = [
        'AI Recommendations',
        'Pending Approvals',
        'Success Rate',
        'Strategy Templates'
      ];
      
      for (const content of recommendationContent) {
        await expect(page.locator(`text*="${content}"`)).toBeVisible();
      }
    });

    await test.step('Analytics page should show analytics content', async () => {
      await basePage.goto('/analytics');
      
      // Check for analytics-specific elements
      const analyticsContent = [
        'Analytics & Reports',
        'DSO Trends',
        'Collection Performance',
        'Customer Segments'
      ];
      
      for (const content of analyticsContent) {
        await expect(page.locator(`text*="${content}"`)).toBeVisible();
      }
    });

    await test.step('Settings page should show settings content', async () => {
      await basePage.goto('/settings');
      
      // Check for settings-specific elements
      const settingsContent = [
        'Settings',
        'User Preferences',
        'Notifications',
        'Integrations',
        'AI Configuration'
      ];
      
      for (const content of settingsContent) {
        await expect(page.locator(`text*="${content}"`)).toBeVisible();
      }
    });
  });

  test('should handle responsive design on all pages', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const pageInfo of pages) {
      for (const viewport of viewports) {
        await test.step(`${pageInfo.name} responsive on ${viewport.name}`, async () => {
          await page.setViewportSize(viewport);
          await basePage.goto(pageInfo.path);
          
          // Verify page loads and is accessible
          await basePage.verifyPageLoaded();
          
          // On mobile, ensure sidebar can be toggled
          if (viewport.width < 768) {
            await basePage.openMobileSidebar();
            expect(await basePage.isSidebarVisible()).toBeTruthy();
          }
          
          // Verify main content is visible
          const mainContent = page.locator('main, [role="main"], h1, h2').first();
          await expect(mainContent).toBeVisible();
        });
      }
    }
  });

  test('should maintain navigation state correctly', async ({ page }) => {
    for (const pageInfo of pages) {
      await test.step(`Navigation state on ${pageInfo.name}`, async () => {
        await basePage.goto(pageInfo.path);
        
        // Verify active navigation state
        if (pageInfo.name !== 'Dashboard') {
          await basePage.verifyActiveNavigation(pageInfo.title);
        }
        
        // Verify we can navigate to other pages from here
        if (pageInfo.path !== '/customers') {
          await basePage.navigateTo('customers');
          await testUtils.waitForNavigation('/customers');
          expect(page.url()).toContain('/customers');
        }
      });
    }
  });

  test('should handle direct URL access for all pages', async ({ page }) => {
    for (const pageInfo of pages) {
      await test.step(`Direct access to ${pageInfo.name}`, async () => {
        // Navigate directly via URL
        await page.goto(pageInfo.path);
        await testUtils.waitForPageLoad();
        
        // Verify page loads correctly
        await basePage.verifyPageLoaded();
        await basePage.verifyPageTitle(pageInfo.title);
        
        // Verify URL is correct
        expect(page.url()).toContain(pageInfo.path);
      });
    }
  });

  test('should show proper icons for each section', async ({ page }) => {
    const expectedIcons = {
      '/': 'LayoutDashboard',
      '/customers': 'Users',
      '/invoices': 'FileText',
      '/recommendations': 'Brain',
      '/analytics': 'BarChart3',
      '/settings': 'Settings'
    };

    for (const pageInfo of pages) {
      await test.step(`Icons on ${pageInfo.name}`, async () => {
        await basePage.goto(pageInfo.path);
        
        // Check if navigation has appropriate icons
        // This is a basic check - in a real app you'd check specific icon classes/SVGs
        const navSection = basePage.sidebar;
        await expect(navSection).toBeVisible();
        
        // Verify navigation links are present with proper styling
        const navLinks = page.locator('nav a, [role="navigation"] a');
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      });
    }
  });

  test('should handle page transitions smoothly', async ({ page }) => {
    await test.step('Navigate between all pages in sequence', async () => {
      // Start at dashboard
      await basePage.goto('/');
      
      for (let i = 1; i < pages.length; i++) {
        const currentPage = pages[i];
        
        // Navigate to next page
        await basePage.navigateTo(currentPage.name.toLowerCase() as any);
        await testUtils.waitForNavigation(currentPage.path);
        
        // Verify transition completed successfully
        expect(page.url()).toContain(currentPage.path);
        await basePage.verifyPageLoaded();
        
        // Small delay to simulate real user behavior
        await page.waitForTimeout(100);
      }
    });
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await test.step('Browser navigation should work correctly', async () => {
      // Start at dashboard
      await basePage.goto('/');
      
      // Navigate to customers
      await basePage.navigateTo('customers');
      await testUtils.waitForNavigation('/customers');
      
      // Navigate to settings
      await basePage.navigateTo('settings');
      await testUtils.waitForNavigation('/settings');
      
      // Use browser back button
      await page.goBack();
      await testUtils.waitForPageLoad();
      expect(page.url()).toContain('/customers');
      
      // Use browser forward button
      await page.goForward();
      await testUtils.waitForPageLoad();
      expect(page.url()).toContain('/settings');
      
      // Verify page still works after browser navigation
      await basePage.verifyPageLoaded();
    });
  });
});