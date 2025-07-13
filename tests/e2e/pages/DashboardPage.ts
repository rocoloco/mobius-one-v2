import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard page object
 * Contains dashboard-specific elements and actions
 */
export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly currentDSOCard: Locator;
  readonly workingCapitalCard: Locator;
  readonly pendingRecommendationsCard: Locator;
  readonly monthlyCollectedCard: Locator;
  readonly aiRecommendationsSection: Locator;
  readonly recentOutcomesSection: Locator;
  readonly reviewApproveButtons: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    
    // Metric cards
    this.currentDSOCard = page.locator('[class*="collection-metric"]:has-text("Current DSO")');
    this.workingCapitalCard = page.locator('[class*="collection-metric"]:has-text("Working Capital")');
    this.pendingRecommendationsCard = page.locator('[class*="collection-metric"]:has-text("Pending Recommendations")');
    this.monthlyCollectedCard = page.locator('[class*="collection-metric"]:has-text("This Month Collected")');
    
    // Main sections
    this.aiRecommendationsSection = page.locator('text=AI Recommendations').locator('..');
    this.recentOutcomesSection = page.locator('text=Recent Outcomes').locator('..');
    this.reviewApproveButtons = page.locator('button:has-text("Review & Approve")');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await super.goto('/');
  }

  /**
   * Verify dashboard loaded with all key elements
   */
  async verifyDashboardLoaded() {
    await this.verifyPageLoaded();
    await expect(this.pageTitle).toBeVisible();
    await this.verifyMetricCards();
    await this.verifyAIStatus();
  }

  /**
   * Verify all metric cards are present
   */
  async verifyMetricCards() {
    await expect(this.currentDSOCard).toBeVisible();
    await expect(this.workingCapitalCard).toBeVisible();
    await expect(this.pendingRecommendationsCard).toBeVisible();
    await expect(this.monthlyCollectedCard).toBeVisible();
  }

  /**
   * Check if DSO metric shows improvement
   */
  async verifyDSOImprovement() {
    const dsoText = await this.currentDSOCard.textContent();
    expect(dsoText).toContain('days');
    
    // Check for improvement indicator
    const improvementIndicator = this.currentDSOCard.locator('text*="vs last month"');
    await expect(improvementIndicator).toBeVisible();
  }

  /**
   * Verify working capital progress bar
   */
  async verifyWorkingCapitalProgress() {
    const progressBar = this.workingCapitalCard.locator('[role="progressbar"], .progress, [class*="progress"]');
    await expect(progressBar).toBeVisible();
  }

  /**
   * Check AI recommendations section
   */
  async verifyAIRecommendations() {
    await expect(this.aiRecommendationsSection).toBeVisible();
    
    // Check if there are pending recommendations
    const recommendationCards = this.page.locator('[class*="approval-pending"]');
    const count = await recommendationCards.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Click on a recommendation approval button
   */
  async clickReviewApprove(index: number = 0) {
    await this.reviewApproveButtons.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify recent outcomes section
   */
  async verifyRecentOutcomes() {
    await expect(this.recentOutcomesSection).toBeVisible();
    
    // Check for successful payment indicators
    const successfulPayments = this.page.locator('[class*="approval-approved"]');
    const count = await successfulPayments.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Get current DSO value
   */
  async getCurrentDSOValue() {
    const dsoText = await this.currentDSOCard.textContent();
    const match = dsoText?.match(/(\d+)\s*days/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Get pending recommendations count
   */
  async getPendingRecommendationsCount() {
    const recommendationsText = await this.pendingRecommendationsCard.textContent();
    const match = recommendationsText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify all metric cards show realistic data
   */
  async verifyMetricData() {
    // Check DSO is a reasonable number
    const dso = await this.getCurrentDSOValue();
    expect(dso).toBeGreaterThan(0);
    expect(dso).toBeLessThan(365); // Should be less than a year
    
    // Check working capital shows dollar amount
    const workingCapitalText = await this.workingCapitalCard.textContent();
    expect(workingCapitalText).toMatch(/\$[\d,]+/);
    
    // Check recommendations count
    const recommendationsCount = await this.getPendingRecommendationsCount();
    expect(recommendationsCount).toBeGreaterThanOrEqual(0);
  }
}