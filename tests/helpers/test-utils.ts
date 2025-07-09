import { APIRequestContext } from '@playwright/test';

export class TestDataHelper {
  constructor(private request: APIRequestContext) {}

  async createTestCustomer(data: Partial<any> = {}) {
    const customerData = {
      externalId: `test_${Date.now()}`,
      name: 'Test Customer',
      accountHealth: 'good',
      totalRevenue: 100000,
      source: 'test',
      ...data
    };

    // Note: This would require a test-specific endpoint or direct DB access
    // For now, this is a placeholder for the helper structure
    return customerData;
  }

  async createTestInvoice(customerId: number, data: Partial<any> = {}) {
    const invoiceData = {
      invoiceNumber: `INV-TEST-${Date.now()}`,
      customerId,
      amount: 5000,
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'overdue',
      daysOverdue: 30,
      ...data
    };

    return invoiceData;
  }

  async createTestRecommendation(customerId: number, invoiceId: number, data: Partial<any> = {}) {
    const recommendationData = {
      customerId,
      invoiceId,
      strategy: 'gentle_reminder',
      confidenceScore: 85,
      riskAssessment: 'low',
      draftContent: 'Dear Customer, your invoice is overdue...',
      reasoning: 'Customer has good payment history',
      status: 'pending',
      ...data
    };

    return recommendationData;
  }

  async cleanupTestData() {
    // Clean up test data
    // This would require cleanup endpoints or direct DB access
    console.log('Cleaning up test data...');
  }
}

export class APITestHelper {
  constructor(private request: APIRequestContext) {}

  async waitForAPI(endpoint: string, expectedStatus = 200, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.request.get(endpoint);
        if (response.status() === expectedStatus) {
          return response;
        }
      } catch (error) {
        console.log(`Attempt ${i + 1} failed for ${endpoint}`);
      }
      
      await this.delay(1000 * (i + 1)); // Exponential backoff
    }
    
    throw new Error(`API endpoint ${endpoint} did not respond with ${expectedStatus} after ${maxRetries} attempts`);
  }

  async validateAPIResponse(response: any, expectedStructure: any) {
    const data = await response.json();
    
    Object.keys(expectedStructure).forEach(key => {
      if (!(key in data)) {
        throw new Error(`Missing property: ${key}`);
      }
      
      const expectedType = expectedStructure[key];
      const actualType = typeof data[key];
      
      if (actualType !== expectedType) {
        throw new Error(`Property ${key} should be ${expectedType} but is ${actualType}`);
      }
    });
    
    return data;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const testConfig = {
  apiBaseURL: 'http://localhost:3000/api',
  defaultTimeout: 30000,
  retryAttempts: 3,
  
  // Test data constants
  testCustomer: {
    name: 'Test Customer Corp',
    accountHealth: 'good',
    totalRevenue: 250000
  },
  
  testInvoice: {
    amount: 15000,
    daysOverdue: 35,
    status: 'overdue'
  },
  
  testRecommendation: {
    strategy: 'gentle_reminder',
    confidenceScore: 90,
    riskAssessment: 'low'
  }
};

export function generateTestId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function calculateExpectedDSO(invoices: any[]): number {
  if (invoices.length === 0) return 0;
  
  let totalWeightedDays = 0;
  let totalAmount = 0;
  
  invoices.forEach(invoice => {
    const amount = Number(invoice.amount);
    const daysOverdue = invoice.daysOverdue || 0;
    
    totalWeightedDays += daysOverdue * amount;
    totalAmount += amount;
  });
  
  return totalAmount > 0 ? totalWeightedDays / totalAmount : 0;
}

export function mockAPIResponse(status: number, data: any) {
  return {
    status: () => status,
    json: () => Promise.resolve(data),
    ok: () => status >= 200 && status < 300
  };
}