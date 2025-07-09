import { test, expect } from '@playwright/test';

test.describe('Approvals API', () => {
  test('GET /api/approvals returns approval list', async ({ request }) => {
    const response = await request.get('/api/approvals');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // If there are approvals, validate structure
    if (data.length > 0) {
      const approval = data[0];
      expect(approval).toHaveProperty('id');
      expect(approval).toHaveProperty('action');
      expect(approval).toHaveProperty('approvedAt');
      expect(approval).toHaveProperty('userId');
      expect(approval).toHaveProperty('recommendation');
      expect(approval).toHaveProperty('customer');
      expect(approval).toHaveProperty('invoice');
    }
  });

  test('GET /api/approvals with action filter', async ({ request }) => {
    const response = await request.get('/api/approvals?action=approved');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // All approvals should have approved action
    data.forEach(approval => {
      expect(approval.action).toBe('approved');
    });
  });

  test('GET /api/approvals with user filter', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`/api/approvals?userId=${userId}`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // All approvals should be for the specified user
    data.forEach(approval => {
      expect(approval.userId).toBe(userId);
    });
  });

  test('Approval actions are valid', async ({ request }) => {
    const response = await request.get('/api/approvals');
    const data = await response.json();
    
    const validActions = ['approved', 'rejected', 'modified'];
    
    data.forEach(approval => {
      expect(validActions).toContain(approval.action);
    });
  });

  test('Approval timestamps are valid', async ({ request }) => {
    const response = await request.get('/api/approvals');
    const data = await response.json();
    
    data.forEach(approval => {
      expect(approval.approvedAt).toBeTruthy();
      expect(new Date(approval.approvedAt)).toBeInstanceOf(Date);
      
      // If executed, executedAt should be after approvedAt
      if (approval.executedAt) {
        expect(new Date(approval.executedAt)).toBeInstanceOf(Date);
        expect(new Date(approval.executedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(approval.approvedAt).getTime()
        );
      }
    });
  });

  test('POST /api/approvals validates required fields', async ({ request }) => {
    // Test missing recommendationId
    const response1 = await request.post('/api/approvals', {
      data: {
        userId: 1,
        action: 'approved'
      }
    });
    expect(response1.status()).toBe(400);
    
    // Test missing userId
    const response2 = await request.post('/api/approvals', {
      data: {
        recommendationId: 1,
        action: 'approved'
      }
    });
    expect(response2.status()).toBe(400);
    
    // Test missing action
    const response3 = await request.post('/api/approvals', {
      data: {
        recommendationId: 1,
        userId: 1
      }
    });
    expect(response3.status()).toBe(400);
  });

  test('POST /api/approvals validates action values', async ({ request }) => {
    const response = await request.post('/api/approvals', {
      data: {
        recommendationId: 1,
        userId: 1,
        action: 'invalid_action'
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.error).toContain('Invalid action');
  });
});