import { test, expect } from '@playwright/test';

test.describe('Layout and Sidebar Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have sidebar visible on desktop', async ({ page }) => {
    // Set desktop viewport  
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar is visible on desktop
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Check if logo text is visible
    const logoText = sidebar.locator('text=Mobius One');
    await expect(logoText).toBeVisible();
  });

  test('should not overlap main content on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Get sidebar and main content positions
    const sidebar = page.locator('[data-testid="sidebar"]');
    const mainContent = page.locator('main');
    
    // Ensure both elements are visible
    await expect(sidebar).toBeVisible();
    await expect(mainContent).toBeVisible();
    
    const sidebarBox = await sidebar.boundingBox();
    const mainContentBox = await mainContent.boundingBox();
    
    expect(sidebarBox).toBeTruthy();
    expect(mainContentBox).toBeTruthy();
    
    if (sidebarBox && mainContentBox) {
      // Main content should start after sidebar ends (no overlap)
      console.log(`Sidebar ends at: ${sidebarBox.x + sidebarBox.width}`);
      console.log(`Main content starts at: ${mainContentBox.x}`);
      expect(mainContentBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width);
    }
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Desktop sidebar should be hidden on mobile
    const desktopSidebar = page.locator('[data-testid="sidebar"]');
    await expect(desktopSidebar).toBeHidden();
    
    // Mobile sidebar should be hidden initially
    const mobileSidebar = page.locator('[data-testid="mobile-sidebar"]');
    const sidebarBox = await mobileSidebar.boundingBox();
    
    // Mobile sidebar should be off-screen
    if (sidebarBox) {
      expect(sidebarBox.x).toBeLessThan(0);
    }
  });

  test('should open sidebar when hamburger menu is clicked on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click hamburger menu button (look for the menu icon specifically)
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await menuButton.click();
    
    // Mobile sidebar should now be visible
    await page.waitForTimeout(500); // Wait for animation
    const mobileSidebar = page.locator('[data-testid="mobile-sidebar"]');
    const sidebarBox = await mobileSidebar.boundingBox();
    
    if (sidebarBox) {
      expect(sidebarBox.x).toBeGreaterThanOrEqual(0);
    }
  });

  test('should close sidebar when X button is clicked', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // First open the sidebar
    const menuButton = page.locator('button[aria-label="Menu"]').or(page.getByRole('button').filter({ has: page.locator('svg') }).first());
    await menuButton.click();
    
    // Wait for sidebar to be visible
    await page.waitForTimeout(500);
    
    // Click X button to close - look specifically in the mobile sidebar
    const mobileSidebar = page.locator('[data-testid="mobile-sidebar"]');
    const closeButton = mobileSidebar.locator('button').filter({ has: page.locator('svg') });
    await closeButton.click();
    
    // Sidebar should be hidden again
    await page.waitForTimeout(500); // Wait for animation
    const sidebarBox = await mobileSidebar.boundingBox();
    if (sidebarBox) {
      expect(sidebarBox.x).toBeLessThan(0);
    }
  });

  test('should display navigation items correctly in desktop sidebar', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that all navigation items are present in the desktop sidebar
    const sidebar = page.locator('[data-testid="sidebar"]');
    const navItems = ['Dashboard', 'Customers', 'Invoices', 'Recommendations', 'Analytics', 'Settings'];
    
    for (const item of navItems) {
      const navItem = sidebar.locator(`text=${item}`).first();
      await expect(navItem).toBeVisible();
    }
  });

  test('should show AI Engine Active status in desktop sidebar', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if AI Engine Active chip is visible in desktop sidebar
    const sidebar = page.locator('[data-testid="sidebar"]');
    const aiStatus = sidebar.locator('text=AI Engine Active');
    await expect(aiStatus).toBeVisible();
  });
});