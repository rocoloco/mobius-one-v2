import Anthropic from '@anthropic-ai/sdk';
import { Customer, Invoice } from '../schema/collections';

export class AIOrchestrator {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async analyzeCollectionOpportunity(
    invoice: Invoice,
    customer: Customer,
    paymentHistory: any[],
    accountHealth: any
  ) {
    const prompt = `
You are an AI assistant helping with accounts receivable collections. Analyze this overdue invoice and recommend the best collection strategy.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount: $${invoice.amount}
- Days Overdue: ${invoice.daysOverdue}
- Due Date: ${invoice.dueDate}

Customer Details:
- Name: ${customer.name}
- Account Health: ${customer.accountHealth}
- Total Revenue: $${customer.totalRevenue}
- Payment History: ${JSON.stringify(paymentHistory)}

Recent Account Activity:
${JSON.stringify(accountHealth)}

Based on this information:
1. Assess the collection probability (0-100%)
2. Evaluate relationship risk (low/medium/high)
3. Recommend a strategy (gentle_reminder/urgent_notice/personal_outreach)
4. Draft a collection email that maintains customer relationship
5. Explain your reasoning

Format your response as JSON with these fields:
{
  "confidenceScore": number (0-100),
  "riskAssessment": "low" | "medium" | "high",
  "strategy": "gentle_reminder" | "urgent_notice" | "personal_outreach",
  "draftContent": "email content here",
  "reasoning": "explanation of your approach"
}
`;

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return {
          confidenceScore: result.confidenceScore,
          riskAssessment: result.riskAssessment,
          strategy: result.strategy,
          draftContent: result.draftContent,
          reasoning: result.reasoning
        };
      }
      
      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('Error analyzing collection opportunity:', error);
      throw error;
    }
  }

  async generatePersonalizedOutreach(
    customer: Customer,
    invoice: Invoice,
    context: string
  ): Promise<string> {
    const prompt = `
Generate a personalized collection email for:
- Customer: ${customer.name}
- Invoice: ${invoice.invoiceNumber} for $${invoice.amount}
- Context: ${context}

The email should be professional, maintain relationship, and encourage prompt payment.
`;

    const response = await this.claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    throw new Error('Unexpected response format from Claude');
  }

  async assessRelationshipRisk(
    customer: Customer,
    recentInteractions: any[]
  ): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
    recommendation: string;
  }> {
    const prompt = `
Assess the relationship risk for collection activities:

Customer: ${customer.name}
Account Health: ${customer.accountHealth}
Recent Interactions: ${JSON.stringify(recentInteractions)}

Evaluate:
1. Risk of damaging the relationship
2. Key factors to consider
3. Recommendation for approach

Format as JSON with riskLevel, factors array, and recommendation.
`;

    const response = await this.claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return JSON.parse(content.text);
    }
    
    throw new Error('Unexpected response format from Claude');
  }
}