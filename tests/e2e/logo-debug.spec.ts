import { test, expect } from '@playwright/test';

test.describe('Logo Debug Tests', () => {
  test('should debug logo visibility issues', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if sidebar is present
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Check if logo text exists in DOM
    const logoText = page.locator('text=Mobius One');
    console.log('Logo text count:', await logoText.count());
    
    // Check if logo text is in sidebar specifically
    const sidebarLogoText = sidebar.locator('text=Mobius One');
    console.log('Sidebar logo text count:', await sidebarLogoText.count());
    
    // Check if logo span element exists
    const logoSpan = sidebar.locator('span').filter({ hasText: 'Mobius One' });
    console.log('Logo span count:', await logoSpan.count());
    
    // Get computed styles
    if (await logoSpan.count() > 0) {
      const styles = await logoSpan.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          color: computed.color,
          fontSize: computed.fontSize,
          width: computed.width,
          height: computed.height,
          overflow: computed.overflow
        };
      });
      console.log('Logo span styles:', styles);
    }
    
    // Check logo container
    const logoContainer = sidebar.locator('a').first();
    if (await logoContainer.count() > 0) {
      const containerStyles = await logoContainer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          width: computed.width,
          justifyContent: computed.justifyContent,
          alignItems: computed.alignItems
        };
      });
      console.log('Logo container styles:', containerStyles);
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'logo-debug.png', fullPage: true });
  });
});