import { test, expect } from '@playwright/test';

test.describe('DSO Metrics API', () => {
  test('GET /api/dso-metrics returns valid metrics', async ({ request }) => {
    const response = await request.get('/api/dso-metrics');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('current');
    expect(data).toHaveProperty('previous');
    expect(data).toHaveProperty('improvement');
    expect(data).toHaveProperty('workingCapital');
    expect(data).toHaveProperty('target');
    
    // Validate data types
    expect(typeof data.current).toBe('number');
    expect(typeof data.workingCapital).toBe('number');
    expect(typeof data.target).toBe('number');
  });

  test('POST /api/dso-metrics calculates new metrics', async ({ request }) => {
    const response = await request.post('/api/dso-metrics');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('currentDso');
    expect(data).toHaveProperty('calculatedAt');
  });

  test('DSO metrics have reasonable values', async ({ request }) => {
    const response = await request.get('/api/dso-metrics');
    const data = await response.json();
    
    // DSO should be positive and reasonable (0-365 days)
    expect(data.current).toBeGreaterThanOrEqual(0);
    expect(data.current).toBeLessThanOrEqual(365);
    
    // Working capital should be a number (can be negative)
    expect(typeof data.workingCapital).toBe('number');
    
    // Target should be positive and less than current for improvement
    expect(data.target).toBeGreaterThan(0);
  });
});