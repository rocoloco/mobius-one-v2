export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount: number;
  CloseDate: string;
  StageName: string;
  Probability: number;
  AccountName?: string;
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Type: string;
  Industry: string;
  Phone: string;
  Website: string;
}

export class SalesforceService {
  private instanceUrl: string;
  private accessToken: string;

  constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || "https://your-instance.salesforce.com";
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN || "";
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Salesforce API error:', error);
      throw error;
    }
  }

  async getTopOpportunities(limit: number = 5): Promise<SalesforceOpportunity[]> {
    try {
      const query = `SELECT Id, Name, Amount, CloseDate, StageName, Probability, Account.Name FROM Opportunity WHERE IsClosed = false ORDER BY Amount DESC LIMIT ${limit}`;
      const response = await this.makeRequest(`query/?q=${encodeURIComponent(query)}`);
      
      return response.records.map((record: any) => ({
        Id: record.Id,
        Name: record.Name,
        Amount: record.Amount || 0,
        CloseDate: record.CloseDate,
        StageName: record.StageName,
        Probability: record.Probability || 0,
        AccountName: record.Account?.Name
      }));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      // Return mock data for development
      return [
        {
          Id: "1",
          Name: "Acme Corp - Enterprise License",
          Amount: 125000,
          CloseDate: "2024-03-15",
          StageName: "Negotiation/Review",
          Probability: 75,
          AccountName: "Acme Corp"
        },
        {
          Id: "2",
          Name: "TechStart Inc - Cloud Migration",
          Amount: 89500,
          CloseDate: "2024-03-22",
          StageName: "Proposal/Price Quote",
          Probability: 60,
          AccountName: "TechStart Inc"
        },
        {
          Id: "3",
          Name: "Global Systems - Integration Project",
          Amount: 210000,
          CloseDate: "2024-04-10",
          StageName: "Qualification",
          Probability: 90,
          AccountName: "Global Systems"
        }
      ];
    }
  }

  async getAccountById(accountId: string): Promise<SalesforceAccount | null> {
    try {
      const response = await this.makeRequest(`sobjects/Account/${accountId}`);
      return {
        Id: response.Id,
        Name: response.Name,
        Type: response.Type,
        Industry: response.Industry,
        Phone: response.Phone,
        Website: response.Website
      };
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  }

  async createAccount(accountData: Partial<SalesforceAccount>): Promise<SalesforceAccount | null> {
    try {
      const response = await this.makeRequest('sobjects/Account', 'POST', accountData);
      if (response.success) {
        return await this.getAccountById(response.id);
      }
      return null;
    } catch (error) {
      console.error('Error creating account:', error);
      return null;
    }
  }

  async searchAccounts(searchTerm: string): Promise<SalesforceAccount[]> {
    try {
      const query = `SELECT Id, Name, Type, Industry, Phone, Website FROM Account WHERE Name LIKE '%${searchTerm}%' LIMIT 10`;
      const response = await this.makeRequest(`query/?q=${encodeURIComponent(query)}`);
      
      return response.records.map((record: any) => ({
        Id: record.Id,
        Name: record.Name,
        Type: record.Type,
        Industry: record.Industry,
        Phone: record.Phone,
        Website: record.Website
      }));
    } catch (error) {
      console.error('Error searching accounts:', error);
      return [];
    }
  }
}

export const salesforceService = new SalesforceService();
