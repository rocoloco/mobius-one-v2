import { apiRequest } from "./queryClient";
import type { Conversation, Message, User, SystemConnection } from "@shared/schema";

export interface ChatResponse {
  userMessage: Message;
  aiMessage: Message;
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

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/messages`);
    return response.json();
  },

  async sendMessage(conversationId: number, content: string): Promise<ChatResponse> {
    const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
    return response.json();
  },

  // System operations
  async getSystemConnections(): Promise<SystemConnection[]> {
    const response = await apiRequest("GET", "/api/systems");
    return response.json();
  },

  async testSalesforceConnection(): Promise<{ status: string; data?: any }> {
    const response = await apiRequest("GET", "/api/salesforce/test");
    return response.json();
  },

  async testNetSuiteConnection(): Promise<{ status: string; data?: any }> {
    const response = await apiRequest("GET", "/api/netsuite/test");
    return response.json();
  },
};
