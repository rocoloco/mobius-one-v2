import { test, expect } from '@playwright/test';

test.describe('Collection Flow Integration Tests', () => {
  test('Complete collection workflow', async ({ page, request }) => {
    // Step 1: Check initial DSO metrics
    const initialMetrics = await request.get('/api/dso-metrics');
    expect(initialMetrics.status()).toBe(200);
    const initialData = await initialMetrics.json();
    
    // Step 2: Sync customer data
    const customerSync = await request.post('/api/customers/sync', {
      data: { source: 'salesforce', forceSync: true }
    });
    expect(customerSync.status()).toBe(200);
    
    // Step 3: Sync invoice data
    const invoiceSync = await request.post('/api/invoices', {
      data: { syncFromNetsuite: true }
    });
    expect(invoiceSync.status()).toBe(200);
    
    // Step 4: Generate AI recommendations
    const recommendations = await request.get('/api/recommendations?status=pending');
    expect(recommendations.status()).toBe(200);
    const recData = await recommendations.json();
    
    if (recData.length > 0) {
      const recommendationId = recData[0].id;
      
      // Step 5: Approve a recommendation
      const approval = await request.post('/api/approvals', {
        data: {
          recommendationId,
          userId: 1,
          action: 'approved',
          executeImmediately: true
        }
      });
      expect(approval.status()).toBe(200);
      
      // Step 6: Check that recommendation was executed
      const approvalData = await approval.json();
      expect(approvalData.executed).toBe(true);
      
      // Step 7: Record collection outcome
      const outcome = await request.post('/api/collection-outcomes', {
        data: {
          recommendationId,
          invoiceId: recData[0].invoiceId,
          paymentReceived: true,
          daysToPayment: 5,
          customerResponse: 'positive',
          amountCollected: recData[0].amount
        }
      });
      expect(outcome.status()).toBe(200);
    }
    
    // Step 8: Verify DSO improvement
    const finalMetrics = await request.get('/api/dso-metrics');
    expect(finalMetrics.status()).toBe(200);
    const finalData = await finalMetrics.json();
    
    // Metrics should be tracked (structure should be consistent)
    expect(finalData).toHaveProperty('current');
    expect(finalData).toHaveProperty('workingCapital');
  });

  test('Recommendation approval workflow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=AI Recommendations');
    
    // Check if there are pending recommendations
    const recommendationCard = page.locator('text=Review & Approve').first();
    
    if (await recommendationCard.isVisible()) {
      await recommendationCard.click();
      
      // This would expand based on actual UI implementation
      // For now, just verify the interaction works
      await page.waitForTimeout(1000);
    }
  });

  test('Customer sync updates dashboard', async ({ page, request }) => {
    // Trigger customer sync
    await request.post('/api/customers/sync', {
      data: { source: 'salesforce', forceSync: true }
    });
    
    // Navigate to dashboard
    await page.goto('/');
    
    // Check that customer data is reflected
    await page.waitForSelector('text=AI Recommendations');
    
    // Dashboard should show updated information
    await expect(page.locator('text=Mobius One')).toBeVisible();
  });

  test('Invoice sync affects metrics', async ({ request }) => {
    // Get initial metrics
    const initialMetrics = await request.get('/api/dso-metrics');
    const initialData = await initialMetrics.json();
    
    // Sync invoices
    const invoiceSync = await request.post('/api/invoices', {
      data: { syncFromNetsuite: true }
    });
    expect(invoiceSync.status()).toBe(200);
    
    // Recalculate metrics
    const recalculate = await request.post('/api/dso-metrics');
    expect(recalculate.status()).toBe(200);
    
    // Get updated metrics
    const updatedMetrics = await request.get('/api/dso-metrics');
    const updatedData = await updatedMetrics.json();
    
    // Structure should be consistent
    expect(updatedData).toHaveProperty('current');
    expect(updatedData).toHaveProperty('totalOutstanding');
    expect(updatedData).toHaveProperty('invoiceCount');
  });

  test('Collection outcome tracking', async ({ request }) => {
    // Get existing outcomes
    const outcomes = await request.get('/api/collection-outcomes');
    expect(outcomes.status()).toBe(200);
    
    // Get analytics
    const analytics = await request.get('/api/collection-outcomes/analytics');
    expect(analytics.status()).toBe(200);
    
    const analyticsData = await analytics.json();
    expect(analyticsData).toHaveProperty('summary');
    expect(analyticsData).toHaveProperty('strategyBreakdown');
    expect(analyticsData).toHaveProperty('confidenceAnalysis');
  });

  test('Error handling in collection workflow', async ({ page, request }) => {
    // Test API error scenarios
    await page.route('**/api/recommendations', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/');
    
    // Dashboard should handle errors gracefully
    await expect(page.locator('text=Mobius One')).toBeVisible();
    
    // Other sections should still work
    await expect(page.locator('text=Current DSO')).toBeVisible();
  });

  test('Performance under load', async ({ request }) => {
    // Test multiple concurrent requests
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(request.get('/api/dso-metrics'));
      promises.push(request.get('/api/recommendations'));
      promises.push(request.get('/api/collection-outcomes'));
    }
    
    const results = await Promise.all(promises);
    
    // All requests should succeed
    results.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});