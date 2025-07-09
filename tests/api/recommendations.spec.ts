import { test, expect } from '@playwright/test';

test.describe('Recommendations API', () => {
  test('GET /api/recommendations returns recommendation list', async ({ request }) => {
    const response = await request.get('/api/recommendations');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // If there are recommendations, validate structure
    if (data.length > 0) {
      const recommendation = data[0];
      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('customer');
      expect(recommendation).toHaveProperty('invoice');
      expect(recommendation).toHaveProperty('strategy');
      expect(recommendation).toHaveProperty('confidence');
      expect(recommendation).toHaveProperty('riskLevel');
      expect(recommendation).toHaveProperty('draftContent');
    }
  });

  test('GET /api/recommendations with status filter', async ({ request }) => {
    const response = await request.get('/api/recommendations?status=pending');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // All recommendations should have pending status
    data.forEach(rec => {
      expect(rec.status).toBe('pending');
    });
  });

  test('GET /api/recommendations with limit', async ({ request }) => {
    const limit = 5;
    const response = await request.get(`/api/recommendations?limit=${limit}`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeLessThanOrEqual(limit);
  });

  test('Recommendation confidence scores are valid', async ({ request }) => {
    const response = await request.get('/api/recommendations');
    const data = await response.json();
    
    data.forEach(rec => {
      expect(rec.confidence).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeLessThanOrEqual(100);
      expect(typeof rec.confidence).toBe('number');
    });
  });

  test('Recommendation strategies are valid', async ({ request }) => {
    const response = await request.get('/api/recommendations');
    const data = await response.json();
    
    const validStrategies = ['gentle_reminder', 'urgent_notice', 'personal_outreach'];
    
    data.forEach(rec => {
      expect(validStrategies).toContain(rec.strategy);
    });
  });

  test('Recommendation risk levels are valid', async ({ request }) => {
    const response = await request.get('/api/recommendations');
    const data = await response.json();
    
    const validRiskLevels = ['low', 'medium', 'high'];
    
    data.forEach(rec => {
      expect(validRiskLevels).toContain(rec.riskLevel);
    });
  });
});