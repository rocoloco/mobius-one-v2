import { apiRequest } from "./queryClient";
import type { Conversation, Message, User, SystemConnection } from "@shared/schema";

export interface ChatResponse {
  userMessage: Message;
  aiMessage: Message;
}

export interface SystemTestResponse {
  status: 'connected' | 'error';
  message?: string;
  data?: any;
}

export const chatApi = {
  // User operations
  async getCurrentUser(): Promise<User> {
    const response = await apiRequest("GET", "/api/user");
    return response.json();
  },

  // Conversation operations
  async getConversations(): Promise<Conversation[]> {
    const response = await apiRequest("GET", "/api/conversations");
    return response.json();
  },

  async createConversation(title: string): Promise<Conversation> {
    const response = await apiRequest("POST", "/api/conversations", { title });
    return response.json();
  },

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation> {
    const response = await apiRequest("PUT", `/api/conversations/${id}`, updates);
    return response.json();
  },

  async deleteConversation(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/conversations/${id}`);
  },

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/messages`);
    return response.json();
  },

  async sendMessage(conversationId: number, content: string): Promise<ChatResponse> {
    const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
    return response.json();
  },

  async deleteMessage(messageId: number): Promise<void> {
    await apiRequest("DELETE", `/api/messages/${messageId}`);
  },

  // System operations
  async getSystemConnections(): Promise<SystemConnection[]> {
    const response = await apiRequest("GET", "/api/systems");
    return response.json();
  },

  async updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection> {
    const response = await apiRequest("PUT", `/api/systems/${id}`, updates);
    return response.json();
  },

  async testSalesforceConnection(): Promise<SystemTestResponse> {
    const response = await apiRequest("GET", "/api/salesforce/test");
    return response.json();
  },

  async testNetSuiteConnection(): Promise<SystemTestResponse> {
    const response = await apiRequest("GET", "/api/netsuite/test");
    return response.json();
  },

  // Salesforce-specific operations
  async getSalesforceOpportunities(limit?: number): Promise<any[]> {
    const response = await apiRequest("GET", `/api/salesforce/opportunities${limit ? `?limit=${limit}` : ''}`);
    return response.json();
  },

  async getSalesforceAccounts(searchTerm?: string): Promise<any[]> {
    const response = await apiRequest("GET", `/api/salesforce/accounts${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
    return response.json();
  },

  async createSalesforceAccount(accountData: any): Promise<any> {
    const response = await apiRequest("POST", "/api/salesforce/accounts", accountData);
    return response.json();
  },

  // NetSuite-specific operations
  async getNetSuiteRevenue(period?: string): Promise<any[]> {
    const response = await apiRequest("GET", `/api/netsuite/revenue${period ? `?period=${period}` : ''}`);
    return response.json();
  },

  async getNetSuiteFinancialSummary(startDate: string, endDate: string): Promise<any> {
    const response = await apiRequest("GET", `/api/netsuite/financial-summary?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  },

  async getNetSuiteCustomers(customerId?: string): Promise<any[]> {
    const response = await apiRequest("GET", `/api/netsuite/customers${customerId ? `/${customerId}` : ''}`);
    return response.json();
  },

  async createNetSuiteCustomer(customerData: any): Promise<any> {
    const response = await apiRequest("POST", "/api/netsuite/customers", customerData);
    return response.json();
  },

  // Export functionality
  async exportConversation(conversationId: number, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/export?format=${format}`);
    return response.blob();
  },

  async exportAllConversations(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await apiRequest("GET", `/api/conversations/export?format=${format}`);
    return response.blob();
  },

  // Analytics and insights
  async getConversationAnalytics(conversationId?: number): Promise<any> {
    const response = await apiRequest("GET", `/api/analytics/conversations${conversationId ? `/${conversationId}` : ''}`);
    return response.json();
  },

  async getSystemUsageAnalytics(): Promise<any> {
    const response = await apiRequest("GET", "/api/analytics/systems");
    return response.json();
  },
};
