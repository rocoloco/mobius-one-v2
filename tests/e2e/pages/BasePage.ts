import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page object for all Mobius One pages
 * Contains common elements and actions shared across all pages
 */
export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly sidebarToggle: Locator;
  readonly sidebar: Locator;
  readonly userMenu: Locator;
  readonly searchInput: Locator;
  readonly aiStatusIndicator: Locator;
  readonly notificationButton: Locator;

  // Navigation links
  readonly dashboardLink: Locator;
  readonly customersLink: Locator;
  readonly invoicesLink: Locator;
  readonly recommendationsLink: Locator;
  readonly analyticsLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.logo = page.locator('img[alt="Mobius One"]');
    this.sidebarToggle = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    this.userMenu = page.locator('[role="button"]:has([role="img"])');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.notificationButton = page.locator('button:has(svg):has-text("")').nth(0);
    
    // Sidebar
    this.sidebar = page.locator('[class*="sidebar"], aside, nav').first();
    this.aiStatusIndicator = page.locator('text=AI Active, text=AI Engine Active');
    
    // Navigation links
    this.dashboardLink = page.locator('a[href="/"], a:has-text("Dashboard")');
    this.customersLink = page.locator('a[href="/customers"], a:has-text("Customers")');
    this.invoicesLink = page.locator('a[href="/invoices"], a:has-text("Invoices")');
    this.recommendationsLink = page.locator('a[href="/recommendations"], a:has-text("Recommendations")');
    this.analyticsLink = page.locator('a[href="/analytics"], a:has-text("Analytics")');
    this.settingsLink = page.locator('a[href="/settings"], a:has-text("Settings")');
  }

  /**
   * Navigate to any page
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify the page loaded correctly
   */
  async verifyPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.page.locator('text=Mobius One')).toBeVisible();
  }

  /**
   * Check if sidebar is visible (desktop)
   */
  async isSidebarVisible() {
    return await this.sidebar.isVisible();
  }

  /**
   * Open mobile sidebar
   */
  async openMobileSidebar() {
    if (!await this.isSidebarVisible()) {
      await this.sidebarToggle.click();
      await expect(this.sidebar).toBeVisible();
    }
  }

  /**
   * Close mobile sidebar
   */
  async closeMobileSidebar() {
    // Click the X button or overlay to close
    const closeButton = this.page.locator('button:has(svg):has-text(""), button[aria-label*="close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Navigate using sidebar links
   */
  async navigateTo(section: 'dashboard' | 'customers' | 'invoices' | 'recommendations' | 'analytics' | 'settings') {
    // Ensure sidebar is open on mobile
    if (!await this.isSidebarVisible()) {
      await this.openMobileSidebar();
    }

    const linkMap = {
      dashboard: this.dashboardLink,
      customers: this.customersLink,
      invoices: this.invoicesLink,
      recommendations: this.recommendationsLink,
      analytics: this.analyticsLink,
      settings: this.settingsLink,
    };

    const link = linkMap[section];
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify active navigation state
   */
  async verifyActiveNavigation(section: string) {
    const activeLink = this.page.locator(`a:has-text("${section}")[class*="primary"], a:has-text("${section}")[class*="active"]`);
    await expect(activeLink).toBeVisible();
  }

  /**
   * Search for something
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.userMenu.click();
    await this.page.waitForTimeout(500); // Wait for dropdown animation
  }

  /**
   * Verify AI status is active
   */
  async verifyAIStatus() {
    await expect(this.aiStatusIndicator).toBeVisible();
  }

  /**
   * Check page title and heading
   */
  async verifyPageTitle(expectedTitle: string) {
    const heading = this.page.locator('h1, h2').first();
    await expect(heading).toContainText(expectedTitle);
  }

  /**
   * Get current URL path
   */
  async getCurrentPath() {
    return new URL(this.page.url()).pathname;
  }
}