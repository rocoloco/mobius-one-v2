export class SalesforceService {
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor() {
    // Initialize with environment variables
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN || null;
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || null;
  }

  async authenticate(): Promise<void> {
    if (!process.env.SALESFORCE_CLIENT_ID || !process.env.SALESFORCE_CLIENT_SECRET) {
      throw new Error('Salesforce credentials not configured');
    }

    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.SALESFORCE_CLIENT_ID,
          client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`Salesforce authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.instanceUrl = data.instance_url;
    } catch (error) {
      console.error('Salesforce authentication error:', error);
      throw error;
    }
  }

  async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(`${this.instanceUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAccounts(limit: number = 100): Promise<any[]> {
    try {
      const query = `
        SELECT Id, Name, Type, Rating, Industry, AnnualRevenue, 
               NumberOfEmployees, LastActivityDate, CreatedDate, 
               BillingCity, BillingState, BillingCountry
        FROM Account 
        WHERE Type = 'Customer - Direct' 
        ORDER BY LastActivityDate DESC 
        LIMIT ${limit}
      `;

      const response = await this.makeRequest(
        `/services/data/v57.0/query?q=${encodeURIComponent(query)}`
      );

      return response.records || [];
    } catch (error) {
      console.error('Error fetching Salesforce accounts:', error);
      throw error;
    }
  }

  async getOpportunitiesByAccount(accountId: string): Promise<any[]> {
    try {
      const query = `
        SELECT Id, Name, Amount, CloseDate, CreatedDate, StageName, 
               IsClosed, IsWon, Probability, LastActivityDate
        FROM Opportunity 
        WHERE AccountId = '${accountId}' 
        ORDER BY CreatedDate DESC
      `;

      const response = await this.makeRequest(
        `/services/data/v57.0/query?q=${encodeURIComponent(query)}`
      );

      return response.records || [];
    } catch (error) {
      console.error('Error fetching Salesforce opportunities:', error);
      throw error;
    }
  }

  async getTopOpportunities(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT Id, Name, Amount, CloseDate, Account.Name, StageName, 
               Probability, CreatedDate, LastActivityDate
        FROM Opportunity 
        WHERE Amount > 0 AND IsClosed = false
        ORDER BY Amount DESC 
        LIMIT ${limit}
      `;

      const response = await this.makeRequest(
        `/services/data/v57.0/query?q=${encodeURIComponent(query)}`
      );

      return response.records || [];
    } catch (error) {
      console.error('Error fetching top opportunities:', error);
      throw error;
    }
  }

  async getRecentActivities(accountId: string, limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT Id, Subject, ActivityDate, Status, Priority, Description, 
               CreatedDate, LastModifiedDate, WhoId, WhatId
        FROM Task 
        WHERE WhatId = '${accountId}' 
        ORDER BY ActivityDate DESC 
        LIMIT ${limit}
      `;

      const response = await this.makeRequest(
        `/services/data/v57.0/query?q=${encodeURIComponent(query)}`
      );

      return response.records || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  async getAccountHealth(accountId: string): Promise<any> {
    try {
      // Get account with related data
      const query = `
        SELECT Id, Name, Type, Rating, Industry, LastActivityDate,
               (SELECT Id, Amount, CloseDate, StageName FROM Opportunities 
                WHERE IsClosed = false ORDER BY Amount DESC LIMIT 5),
               (SELECT Id, Subject, Status, Priority FROM Tasks 
                WHERE Status != 'Completed' ORDER BY CreatedDate DESC LIMIT 5),
               (SELECT Id, Subject, Status FROM Cases 
                WHERE IsClosed = false ORDER BY CreatedDate DESC LIMIT 5)
        FROM Account 
        WHERE Id = '${accountId}'
      `;

      const response = await this.makeRequest(
        `/services/data/v57.0/query?q=${encodeURIComponent(query)}`
      );

      return response.records?.[0] || null;
    } catch (error) {
      console.error('Error fetching account health:', error);
      throw error;
    }
  }

  async createTask(accountId: string, subject: string, description: string): Promise<any> {
    try {
      const taskData = {
        WhatId: accountId,
        Subject: subject,
        Description: description,
        Status: 'Not Started',
        Priority: 'Normal',
        ActivityDate: new Date().toISOString().split('T')[0],
      };

      const response = await this.makeRequest(
        '/services/data/v57.0/sobjects/Task',
        'POST',
        taskData
      );

      return response;
    } catch (error) {
      console.error('Error creating Salesforce task:', error);
      throw error;
    }
  }

  async logCollectionActivity(accountId: string, invoiceNumber: string, strategy: string, outcome: string): Promise<any> {
    try {
      const subject = `Collection Activity - ${invoiceNumber}`;
      const description = `
        Collection Strategy: ${strategy}
        Invoice: ${invoiceNumber}
        Outcome: ${outcome}
        Generated by Mobius One Collection Engine
      `;

      return await this.createTask(accountId, subject, description);
    } catch (error) {
      console.error('Error logging collection activity:', error);
      throw error;
    }
  }
}

export const salesforceService = new SalesforceService();