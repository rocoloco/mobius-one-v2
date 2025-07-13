import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for Mobius One E2E tests
 */

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded with network idle
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Check if element is visible and enabled
   */
  async isElementReady(selector: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
    return element;
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(expectedUrl?: string) {
    await this.page.waitForLoadState('networkidle');
    if (expectedUrl) {
      expect(this.page.url()).toContain(expectedUrl);
    }
  }

  /**
   * Check responsive design at different viewports
   */
  async testResponsive(action: () => Promise<void>) {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.waitForPageLoad();
      await action();
    }
  }

  /**
   * Check if Mobius One branding is present
   */
  async verifyBranding() {
    // Check logo
    await expect(this.page.locator('img[alt="Mobius One"]')).toBeVisible();
    
    // Check company name
    await expect(this.page.locator('text=Mobius One')).toBeVisible();
    
    // Check brand colors are applied (by checking if primary class exists)
    const hasLogo = await this.page.locator('[class*="text-primary"]').count() > 0;
    expect(hasLogo).toBeTruthy();
  }

  /**
   * Verify navigation accessibility
   */
  async checkAccessibility() {
    // Check if navigation is keyboard accessible
    await this.page.keyboard.press('Tab');
    const focused = await this.page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT'].includes(focused || '')).toBeTruthy();
  }
}