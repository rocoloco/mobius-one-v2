import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Customer {
  id: number;
  name: string;
  relationshipScore: number;
  totalOverdueAmount: number;
}

interface Invoice {
  id: number;
  totalAmount: number;
  daysPastDue: number;
  invoiceNumber: string;
}

export class AIService {
  static selectAIModel(invoice: Invoice, customer: Customer) {
    const accountValue = invoice.totalAmount;
    const riskScore = customer.relationshipScore;
    const daysPastDue = invoice.daysPastDue;

    // High-risk situations: >$100K, low relationship score, or >60 days overdue
    if (accountValue > 100000 || riskScore < 40 || daysPastDue > 60) {
      return {
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        cost: 0.20,
        reviewTime: 20
      };
    }

    // Medium-risk: $25K-100K or moderate relationship issues
    if (accountValue > 25000 || riskScore < 70 || daysPastDue > 30) {
      return {
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic', 
        cost: 0.05,
        reviewTime: 3
      };
    }

    // Low-risk: routine collections
    return {
      model: 'gpt-4o-mini',
      provider: 'openai',
      cost: 0.001,
      reviewTime: 0.5
    };
  }

  static async analyzeInvoice(customer: Customer, invoice: Invoice) {
    const modelConfig = this.selectAIModel(invoice, customer);

    const prompt = `You are an expert collections specialist. Analyze this situation and generate an appropriate collection email.

CUSTOMER: ${customer.name}
RELATIONSHIP SCORE: ${customer.relationshipScore}/100 (0=worst, 100=excellent)
INVOICE: #${invoice.invoiceNumber} 
AMOUNT: $${invoice.totalAmount}
DAYS OVERDUE: ${invoice.daysPastDue}

CRITICAL: Email tone MUST match the relationship score:

RELATIONSHIP SCORE 70-100 (Good relationship):
- Tone: Friendly, assuming oversight
- Language: "I'm sure this is just an oversight", "given your excellent payment history"
- Approach: Gentle reminder with payment link

RELATIONSHIP SCORE 40-69 (Moderate relationship):
- Tone: Professional but understanding
- Language: "We understand cash flow can be challenging", offer payment plans
- Approach: Firm but supportive, provide options

RELATIONSHIP SCORE 0-39 (Poor relationship):
- Tone: Firm, consequence-focused, urgent
- Language: "Immediate payment required", "failure to respond may result in..."
- Approach: Clear deadlines, consequences, escalation threats
- NO understanding language about "circumstances" or "oversights"

RISK LEVEL DETERMINATION:
- HIGH: Score <40 OR >60 days overdue OR >$100K
- MEDIUM: Score 40-69 OR 30-60 days overdue OR $25K-100K  
- LOW: Score 70+ AND <30 days overdue AND <$25K

Generate a professional email that matches the relationship score severity.

Provide your response as valid JSON with this exact structure:
{
  "scoring": {
    "score": ${customer.relationshipScore},
    "riskLevel": "[low/medium/high based on criteria above]"
  },
  "recommendation": {
    "reasoning": "[explain why you chose this tone based on the relationship score and risk factors]",
    "confidence": [confidence percentage 0-100]
  },
  "draftEmail": {
    "subject": "[email subject line matching the tone severity]",
    "body": "[complete email body with tone appropriate for score ${customer.relationshipScore}]"
  }
}`;

    // Try the selected model first, fallback to OpenAI if it fails
    try {
      if (modelConfig.provider === 'openai') {
        const response = await openai.chat.completions.create({
          model: modelConfig.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        const analysis = JSON.parse(response.choices[0].message.content!);

        return {
          analysis: {
            ...analysis,
            routing: {
              aiModel: 'gpt-4o-mini',
              estimatedCost: modelConfig.cost,
              estimatedReviewTime: modelConfig.reviewTime
            }
          }
        };
      } else {
        const response = await anthropic.messages.create({
          model: modelConfig.model,
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }

        const analysis = JSON.parse(content.text);

        return {
          analysis: {
            ...analysis,
            routing: {
              aiModel: 'claude-3.5-sonnet',
              estimatedCost: modelConfig.cost,
              estimatedReviewTime: modelConfig.reviewTime
            }
          }
        };
      }
    } catch (error: any) {
      // If the selected model fails, fallback to OpenAI
      console.log(`${modelConfig.provider} failed, falling back to OpenAI:`, error.message);

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        const analysis = JSON.parse(response.choices[0].message.content!);

        return {
          analysis: {
            ...analysis,
            routing: {
              aiModel: 'gpt-4o-mini',
              estimatedCost: 0.001,
              estimatedReviewTime: 0.5,
              fallbackUsed: true,
              originalModel: modelConfig.model
            }
          }
        };
      } catch (fallbackError: any) {
        throw new Error(`Both AI services failed: ${fallbackError.message}`);
      }
    }
  }
}