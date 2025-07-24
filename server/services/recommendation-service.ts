import { Customer, Invoice } from '@shared/schema';
import { RoutingDecision, RoutingContext } from './routing-service';

export interface CollectionRecommendation {
  id: string;
  customerId: string;
  invoiceId: string;
  modelUsed: string;
  confidence: number;
  recommendedAction: string;
  tone: 'gentle' | 'standard' | 'firm' | 'urgent';
  timing: 'immediate' | 'tomorrow' | 'next-week' | 'escalate';
  draftEmail?: {
    subject: string;
    body: string;
  };
  reasoning: string;
  alternatives: AlternativeAction[];
  businessImpact: {
    revenueAtRisk: number;
    relationshipRisk: 'low' | 'medium' | 'high';
    churnProbability: number;
  };
  approvalRequired: boolean;
  escalationTriggers: string[];
  createdAt: string;
}

export interface AlternativeAction {
  approach: string;
  confidence: number;
  description: string;
  timeline: string;
}

export class RecommendationService {
  /**
   * Generate collection recommendation using appropriate AI model
   */
  async generateRecommendation(
    context: RoutingContext,
    routingDecision: RoutingDecision
  ): Promise<CollectionRecommendation> {

    // In a real implementation, this would call the actual AI APIs
    // For now, we'll simulate the AI response based on the routing decision
    const aiResponse = await this.callAIModel(routingDecision);

    return {
      id: this.generateId(),
      customerId: context.customer.id,
      invoiceId: context.invoice.id,
      modelUsed: routingDecision.aiModel,
      confidence: aiResponse.confidence,
      recommendedAction: aiResponse.recommendedAction,
      tone: aiResponse.tone,
      timing: aiResponse.timing,
      draftEmail: aiResponse.draftEmail,
      reasoning: aiResponse.reasoning,
      alternatives: aiResponse.alternatives || [],
      businessImpact: this.calculateBusinessImpact(context),
      approvalRequired: routingDecision.reviewLevel !== 'quick_approve',
      escalationTriggers: this.generateEscalationTriggers(context, routingDecision),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Simulate AI model calls (replace with actual API calls)
   */
  private async callAIModel(routingDecision: RoutingDecision): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    switch (routingDecision.modelTier) {
      case 'ROUTINE':
        return this.simulateRoutineResponse();
      case 'STRATEGIC':
        return this.simulateStrategicResponse();
      case 'SENSITIVE':
        return this.simulateSensitiveResponse();
      default:
        return this.simulateRoutineResponse();
    }
  }

  /**
   * Simulate GPT-4o mini response for routine collections
   */
  private simulateRoutineResponse(): any {
    return {
      confidence: 85 + Math.floor(Math.random() * 10),
      recommendedAction: 'send_payment_reminder',
      tone: 'gentle',
      timing: 'immediate',
      draftEmail: {
        subject: 'Friendly payment reminder for Invoice #[INVOICE_NUMBER]',
        body: `Hi [CUSTOMER_NAME],

I hope this finds you well. I wanted to send a friendly reminder that Invoice #[INVOICE_NUMBER] for $[AMOUNT] is now [DAYS_OVERDUE] days past due.

Given your excellent relationship with us, I'm sure this is just an oversight. You can make the payment securely using this link: [PAYMENT_LINK]

If you have any questions or need to discuss payment terms, please don't hesitate to reach out.

Best regards,
[YOUR_NAME]`
      },
      reasoning: 'Low-risk customer with routine payment delay. Gentle reminder should resolve quickly.',
      alternatives: [
        {
          approach: 'phone_call',
          confidence: 75,
          description: 'Personal phone call to accounts payable',
          timeline: 'Within 2 business days'
        }
      ]
    };
  }

  /**
   * Simulate Claude 3.5 Sonnet response for strategic collections
   */
  private simulateStrategicResponse(): any {
    return {
      confidence: 72 + Math.floor(Math.random() * 15),
      recommendedAction: 'strategic_outreach',
      tone: 'standard',
      timing: 'immediate',
      draftEmail: {
        subject: 'Important: Account review needed for Invoice #[INVOICE_NUMBER]',
        body: `Dear [CUSTOMER_NAME],

I'm reaching out regarding Invoice #[INVOICE_NUMBER] for $[AMOUNT], which is currently [DAYS_OVERDUE] days past due.

Given the value of our partnership and your account history, I'd like to schedule a brief call to:
• Understand any challenges affecting payment
• Discuss payment options that work for your cash flow
• Ensure continued smooth operations

I'm available this week at your convenience. Please let me know what time works best.

Looking forward to resolving this quickly.

Best regards,
[YOUR_NAME]
[TITLE]`
      },
      reasoning: 'Strategic account with payment concerns. Relationship-focused approach with payment options.',
      alternatives: [
        {
          approach: 'executive_escalation',
          confidence: 68,
          description: 'Escalate to C-level discussion about partnership value',
          timeline: 'Schedule within 1 week'
        },
        {
          approach: 'payment_plan',
          confidence: 81,
          description: 'Offer structured payment plan to preserve relationship',
          timeline: 'Immediate offer'
        },
        {
          approach: 'account_review',
          confidence: 75,
          description: 'Comprehensive account health review with customer success',
          timeline: '2-3 business days'
        }
      ]
    };
  }

  /**
   * Simulate Claude Opus response for sensitive situations
   */
  private simulateSensitiveResponse(): any {
    return {
      confidence: 65 + Math.floor(Math.random() * 20),
      recommendedAction: 'executive_intervention',
      tone: 'firm',
      timing: 'escalate',
      reasoning: 'High-risk situation requiring immediate executive attention and relationship preservation strategy.',
      alternatives: [
        {
          approach: 'legal_consultation',
          confidence: 45,
          description: 'Consult legal team for collection options while preserving relationship',
          timeline: 'Within 24 hours'
        },
        {
          approach: 'executive_meeting',
          confidence: 70,
          description: 'CEO/CFO level meeting to discuss partnership continuation',
          timeline: 'Schedule within 48 hours'
        },
        {
          approach: 'payment_restructure',
          confidence: 60,
          description: 'Comprehensive payment restructuring with contract amendments',
          timeline: '1-2 weeks negotiation'
        }
      ]
    };
  }

  /**
   * Calculate business impact of collection situation
   */
  private calculateBusinessImpact(context: RoutingContext): {
    revenueAtRisk: number;
    relationshipRisk: 'low' | 'medium' | 'high';
    churnProbability: number;
  } {
    const { customer, invoice, relationshipScore, riskLevel } = context;
    const accountValue = (customer as any).arr || 0;

    // Calculate revenue at risk (invoice + potential churn)
    const immediateRisk = invoice.totalAmount;
    const churnMultiplier = riskLevel === 'high' ? 0.8 : riskLevel === 'medium' ? 0.3 : 0.1;
    const potentialChurnRisk = accountValue * churnMultiplier;
    const totalRevenueAtRisk = immediateRisk + potentialChurnRisk;

    // Determine relationship risk
    const relationshipRisk = relationshipScore >= 70 ? 'low' : 
                            relationshipScore >= 50 ? 'medium' : 'high';

    // Calculate churn probability
    const baseChurnProb = riskLevel === 'high' ? 0.4 : riskLevel === 'medium' ? 0.15 : 0.05;
    const daysPastDue = this.calculateDaysPastDue(invoice);
    const timeMultiplier = Math.min(2.0, 1 + (daysPastDue / 180)); // Max 2x for very overdue
    const churnProbability = Math.min(0.85, baseChurnProb * timeMultiplier);

    return {
      revenueAtRisk: Math.round(totalRevenueAtRisk),
      relationshipRisk,
      churnProbability: Math.round(churnProbability * 100) / 100
    };
  }

  /**
   * Generate escalation triggers based on context
   */
  private generateEscalationTriggers(
    context: RoutingContext, 
    routingDecision: RoutingDecision
  ): string[] {
    const triggers: string[] = [];
    const daysPastDue = this.calculateDaysPastDue(context.invoice);

    // Time-based triggers
    if (routingDecision.modelTier === 'ROUTINE') {
      triggers.push('No response within 48 hours');
      triggers.push('Payment not received within 7 days');
    } else if (routingDecision.modelTier === 'STRATEGIC') {
      triggers.push('No response within 24 hours');
      triggers.push('Negative customer feedback');
      triggers.push('Payment not received within 5 days');
    } else {
      triggers.push('No response within 12 hours');
      triggers.push('Any adverse customer communication');
      triggers.push('Legal consultation required');
    }

    // Risk-based triggers
    if (context.riskLevel === 'high') {
      triggers.push('Additional invoices become overdue');
      triggers.push('Customer usage drops significantly');
    }

    // Account value triggers
    const accountValue = (context.customer as any).arr || 0;
    if (accountValue > 50000) {
      triggers.push('Customer requests contract modifications');
      triggers.push('Competitor engagement detected');
    }

    return triggers;
  }

  /**
   * Calculate days past due
   */
  private calculateDaysPastDue(invoice: Invoice): number {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate recommendation before returning
   */
  validateRecommendation(recommendation: CollectionRecommendation): boolean {
    return !!(
      recommendation.id &&
      recommendation.customerId &&
      recommendation.invoiceId &&
      recommendation.confidence >= 0 &&
      recommendation.confidence <= 100 &&
      recommendation.recommendedAction &&
      recommendation.reasoning
    );
  }

  /**
   * Get human-readable summary of recommendation
   */
  getRecommendationSummary(recommendation: CollectionRecommendation): string {
    const risk = recommendation.businessImpact.relationshipRisk;
    const action = recommendation.recommendedAction.replace(/_/g, ' ');

    return `${recommendation.tone.toUpperCase()} ${action} (${recommendation.confidence}% confidence, ${risk} relationship risk)`;
  }
}

export const recommendationService = new RecommendationService();