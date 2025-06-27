export interface LiteLLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LiteLLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LiteLLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.LITELLM_API_KEY || process.env.OPENAI_API_KEY || "sk-test-key";
    this.baseUrl = process.env.LITELLM_BASE_URL || "https://api.openai.com/v1";
  }

  async generateResponse(messages: LiteLLMMessage[], systemContext?: string): Promise<string> {
    try {
      const systemMessage: LiteLLMMessage = {
        role: 'system',
        content: systemContext || `You are a helpful business AI assistant with access to Salesforce CRM and NetSuite ERP systems. 
        You can help users with:
        - Salesforce CRM operations (opportunities, leads, contacts, accounts)
        - NetSuite ERP functionality (revenue, financial data, reporting)
        - Business insights and analysis
        
        Provide professional, accurate responses. If you need to access specific system data, clearly indicate which system you're querying.`
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [systemMessage, ...messages],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`LiteLLM API error: ${response.status} ${response.statusText}`);
      }

      const data: LiteLLMResponse = await response.json();
      return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('LiteLLM API error:', error);
      return "I'm experiencing technical difficulties. Please check your API configuration and try again.";
    }
  }

  async generateContextualResponse(userMessage: string, conversationHistory: LiteLLMMessage[], systemData?: any): Promise<{ content: string; systemSource?: string }> {
    let systemContext = `You are a helpful business AI assistant with access to Salesforce CRM and NetSuite ERP systems.`;
    let systemSource: string | undefined;

    // Determine if the query is related to specific systems
    const salesforceKeywords = ['salesforce', 'crm', 'opportunity', 'lead', 'contact', 'account', 'pipeline'];
    const netsuiteKeywords = ['netsuite', 'erp', 'revenue', 'financial', 'report', 'accounting'];

    const messageText = userMessage.toLowerCase();
    
    if (salesforceKeywords.some(keyword => messageText.includes(keyword))) {
      systemSource = 'salesforce';
      systemContext += ` The user is asking about Salesforce CRM data. Provide relevant CRM insights and analysis.`;
    } else if (netsuiteKeywords.some(keyword => messageText.includes(keyword))) {
      systemSource = 'netsuite';
      systemContext += ` The user is asking about NetSuite ERP data. Provide relevant financial and business insights.`;
    }

    if (systemData) {
      systemContext += ` Here's relevant system data: ${JSON.stringify(systemData)}`;
    }

    const messages: LiteLLMMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const content = await this.generateResponse(messages, systemContext);
    
    return { content, systemSource };
  }
}

export const litellmService = new LiteLLMService();
