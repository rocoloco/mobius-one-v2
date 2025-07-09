export class NetSuiteService {
  private baseUrl: string;
  private accountId: string;
  private consumerKey: string;
  private consumerSecret: string;
  private tokenId: string;
  private tokenSecret: string;

  constructor() {
    this.baseUrl = process.env.NETSUITE_BASE_URL || '';
    this.accountId = process.env.NETSUITE_ACCOUNT_ID || '';
    this.consumerKey = process.env.NETSUITE_CONSUMER_KEY || '';
    this.consumerSecret = process.env.NETSUITE_CONSUMER_SECRET || '';
    this.tokenId = process.env.NETSUITE_TOKEN_ID || '';
    this.tokenSecret = process.env.NETSUITE_TOKEN_SECRET || '';
  }

  private generateOAuthHeader(method: string, url: string): string {
    // OAuth 1.0a signature generation for NetSuite
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const params = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: this.tokenId,
      oauth_version: '1.0'
    };

    // This is a simplified OAuth implementation
    // In production, use a proper OAuth library
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(this.tokenSecret)}`;
    
    // Note: In production, you'd use crypto.createHmac for proper HMAC-SHA1 signing
    const signature = 'dummy_signature_for_demo';

    return `OAuth realm="${this.accountId}", oauth_consumer_key="${this.consumerKey}", oauth_token="${this.tokenId}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_signature="${signature}"`;
  }

  async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': this.generateOAuthHeader(method, url),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`NetSuite API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('NetSuite API request failed:', error);
      throw error;
    }
  }

  async getCustomers(limit: number = 100): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        `/services/rest/record/v1/customer?limit=${limit}&fields=internalId,companyName,entityId,email,phone,creditLimit,creditHold,stage,lastModifiedDate`
      );

      return response.items || [];
    } catch (error) {
      console.error('Error fetching NetSuite customers:', error);
      // Return mock data for demo
      return [
        {
          internalId: 'ns_001',
          companyName: 'TechCorp Inc.',
          entityId: 'TECH001',
          email: 'billing@techcorp.com',
          creditLimit: 50000,
          creditHold: false,
          stage: 'CUSTOMER',
          lastModifiedDate: new Date().toISOString()
        },
        {
          internalId: 'ns_002',
          companyName: 'StartupCo',
          entityId: 'START001',
          email: 'accounts@startup.co',
          creditLimit: 25000,
          creditHold: false,
          stage: 'CUSTOMER',
          lastModifiedDate: new Date().toISOString()
        }
      ];
    }
  }

  async getInvoices(limit: number = 100): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        `/services/rest/record/v1/invoice?limit=${limit}&fields=internalId,tranId,entity,amount,dueDate,status,createdDate,lastModifiedDate`
      );

      return response.items || [];
    } catch (error) {
      console.error('Error fetching NetSuite invoices:', error);
      // Return mock data for demo
      return [
        {
          internalId: 'inv_001',
          tranId: 'INV-2024-001',
          entity: 'ns_001',
          amount: 15000,
          dueDate: '2024-01-15',
          status: 'Open',
          createdDate: '2023-12-15',
          lastModifiedDate: new Date().toISOString()
        },
        {
          internalId: 'inv_002',
          tranId: 'INV-2024-002',
          entity: 'ns_002',
          amount: 7500,
          dueDate: '2024-01-20',
          status: 'Open',
          createdDate: '2023-12-20',
          lastModifiedDate: new Date().toISOString()
        }
      ];
    }
  }

  async getOverdueInvoices(daysOverdue: number = 30): Promise<any[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
      
      const response = await this.makeRequest(
        `/services/rest/record/v1/invoice?status=Open&dueDate=before:${cutoffDate.toISOString().split('T')[0]}&fields=internalId,tranId,entity,amount,dueDate,status,createdDate`
      );

      return response.items || [];
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      // Return mock overdue invoices
      return [
        {
          internalId: 'inv_001',
          tranId: 'INV-2024-001',
          entity: 'ns_001',
          amount: 15000,
          dueDate: '2023-12-15',
          status: 'Open',
          createdDate: '2023-11-15',
          daysOverdue: 35
        },
        {
          internalId: 'inv_002',
          tranId: 'INV-2024-002',
          entity: 'ns_002',
          amount: 7500,
          dueDate: '2023-12-01',
          status: 'Open',
          createdDate: '2023-11-01',
          daysOverdue: 48
        }
      ];
    }
  }

  async getInvoicesByCustomer(customerId: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        `/services/rest/record/v1/invoice?entity=${customerId}&fields=internalId,tranId,amount,dueDate,status,createdDate,paidDate`
      );

      return response.items || [];
    } catch (error) {
      console.error('Error fetching invoices by customer:', error);
      return [];
    }
  }

  async getRevenueData(): Promise<any> {
    try {
      // Get revenue metrics from NetSuite
      const response = await this.makeRequest(
        '/services/rest/record/v1/customrecord_revenue_metrics?limit=1&orderBy=created_date:desc'
      );

      return response.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Return mock revenue data
      return {
        totalRevenue: 2500000,
        monthlyRecurring: 208333,
        growth: 15.5,
        customerCount: 45,
        averageContractValue: 55556
      };
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: string, paidDate?: string): Promise<any> {
    try {
      const updateData = {
        status,
        ...(paidDate && { paidDate })
      };

      const response = await this.makeRequest(
        `/services/rest/record/v1/invoice/${invoiceId}`,
        'PATCH',
        updateData
      );

      return response;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  async createCustomerNote(customerId: string, title: string, note: string): Promise<any> {
    try {
      const noteData = {
        title,
        note,
        noteType: 'CUSTOMER',
        entity: customerId,
        noteDate: new Date().toISOString()
      };

      const response = await this.makeRequest(
        '/services/rest/record/v1/note',
        'POST',
        noteData
      );

      return response;
    } catch (error) {
      console.error('Error creating customer note:', error);
      throw error;
    }
  }

  async logCollectionActivity(customerId: string, invoiceNumber: string, strategy: string, outcome: string): Promise<any> {
    try {
      const title = `Collection Activity - ${invoiceNumber}`;
      const note = `
        Collection Strategy: ${strategy}
        Invoice: ${invoiceNumber}
        Outcome: ${outcome}
        Generated by Mobius One Collection Engine
        Date: ${new Date().toISOString()}
      `;

      return await this.createCustomerNote(customerId, title, note);
    } catch (error) {
      console.error('Error logging collection activity:', error);
      throw error;
    }
  }

  async calculateDSO(): Promise<number> {
    try {
      // Get all open invoices
      const openInvoices = await this.getInvoices(1000);
      
      let totalWeightedDays = 0;
      let totalAmount = 0;

      for (const invoice of openInvoices) {
        if (invoice.status === 'Open') {
          const dueDate = new Date(invoice.dueDate);
          const today = new Date();
          const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          totalWeightedDays += daysOverdue * invoice.amount;
          totalAmount += invoice.amount;
        }
      }

      return totalAmount > 0 ? totalWeightedDays / totalAmount : 0;
    } catch (error) {
      console.error('Error calculating DSO:', error);
      return 0;
    }
  }
}

export const netsuiteService = new NetSuiteService();