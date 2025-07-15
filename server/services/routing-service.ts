import { Customer, Invoice } from '@shared/schema';

export interface RoutingDecision {
  modelTier: 'ROUTINE' | 'STRATEGIC' | 'SENSITIVE';
  aiModel: 'gpt-4o-mini' | 'claude-3.5-sonnet' | 'claude-opus-4';
  estimatedCost: number;
  reviewLevel: 'quick_approve' | 'strategic_review' | 'executive_review';
  estimatedReviewTime: number; // minutes
  reasoning: string;
  promptTemplate: string;
}

export interface RoutingContext {
  customer: Customer;
  invoice: Invoice;
  relationshipScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export class RoutingService {
  private readonly modelConfigs = {
    ROUTINE: {
      aiModel: 'gpt-4o-mini' as const,
      costPerRequest: 0.001,
      reviewLevel: 'quick_approve' as const,
      estimatedReviewTime: 0.5 // 30 seconds
    },
    STRATEGIC: {
      aiModel: 'claude-3.5-sonnet' as const,
      costPerRequest: 0.05,
      reviewLevel: 'strategic_review' as const,
      estimatedReviewTime: 3 // 3 minutes
    },
    SENSITIVE: {
      aiModel: 'claude-opus-4' as const,
      costPerRequest: 0.20,
      reviewLevel: 'executive_review' as const,
      estimatedReviewTime: 20 // 20 minutes
    }
  };

  /**
   * Route collection recommendation to appropriate AI model
   */
  routeCollectionRequest(context: RoutingContext): RoutingDecision {
    const modelTier = this.determineModelTier(context);
    const config = this.modelConfigs[modelTier];

    return {
      modelTier,
      aiModel: config.aiModel,
      estimatedCost: config.costPerRequest,
      reviewLevel: config.reviewLevel,
      estimatedReviewTime: config.estimatedReviewTime,
      reasoning: this.generateRoutingReason(context, modelTier),
      promptTemplate: this.getPromptTemplate(modelTier, context)
    };
  }

  /**
   * Determine which AI model tier to use based on business rules
   */
  private determineModelTier(context: RoutingContext): 'ROUTINE' | 'STRATEGIC' | 'SENSITIVE' {
    const { customer, invoice, relationshipScore, riskLevel, confidence } = context;

    // Calculate key factors
    const accountValue = (customer as any).arr || 0;
    const invoiceAmount = invoice.totalAmount;
    const daysPastDue = this.calculateDaysPastDue(invoice);

    // SENSITIVE triggers (requires executive review)
    if (this.requiresExecutiveReview(accountValue, daysPastDue, relationshipScore, riskLevel)) {
      return 'SENSITIVE';
    }

    // STRATEGIC triggers (requires deeper analysis)
    if (this.requiresStrategicAnalysis(accountValue, invoiceAmount, relationshipScore, riskLevel, confidence)) {
      return 'STRATEGIC';
    }

    // Default to ROUTINE (quick approval)
    return 'ROUTINE';
  }

  /**
   * Check if account requires executive review
   */
  private requiresExecutiveReview(
    accountValue: number, 
    daysPastDue: number, 
    relationshipScore: number, 
    riskLevel: string
  ): boolean {
    return (
      accountValue > 100000 ||                    // $100K+ ARR accounts
      daysPastDue > 90 ||                        // 90+ days overdue
      relationshipScore < 40 ||                  // Severely damaged relationships
      riskLevel === 'high'                       // High-risk customers
    );
  }

  /**
   * Check if account requires strategic analysis
   */
  private requiresStrategicAnalysis(
    accountValue: number,
    invoiceAmount: number,
    relationshipScore: number,
    riskLevel: string,
    confidence: number
  ): boolean {
    return (
      accountValue > 25000 ||                    // $25K+ ARR accounts
      invoiceAmount > 10000 ||                   // Large invoices
      relationshipScore < 65 ||                  // Relationship concerns
      riskLevel === 'medium' ||                  // Medium-risk customers
      confidence < 70                            // Low confidence in scoring
    );
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
   * Generate human-readable reasoning for routing decision
   */
  private generateRoutingReason(context: RoutingContext, modelTier: string): string {
    const { customer, invoice, relationshipScore, riskLevel } = context;
    const accountValue = (customer as any).arr || 0;
    const daysPastDue = this.calculateDaysPastDue(invoice);

    switch (modelTier) {
      case 'SENSITIVE':
        const sensitiveReasons = [];
        if (accountValue > 100000) sensitiveReasons.push(`high-value account ($${accountValue.toLocaleString()})`);
        if (daysPastDue > 90) sensitiveReasons.push(`severely overdue (${daysPastDue} days)`);
        if (relationshipScore < 40) sensitiveReasons.push(`damaged relationship (score: ${relationshipScore})`);
        if (riskLevel === 'high') sensitiveReasons.push('high churn risk');

        return `Executive review required: ${sensitiveReasons.join(', ')}`;

      case 'STRATEGIC':
        const strategicReasons = [];
        if (accountValue > 25000) strategicReasons.push(`significant account ($${accountValue.toLocaleString()})`);
        if (invoice.totalAmount > 10000) strategicReasons.push(`large invoice ($${invoice.totalAmount.toLocaleString()})`);
        if (relationshipScore < 65) strategicReasons.push(`relationship concerns (score: ${relationshipScore})`);
        if (riskLevel === 'medium') strategicReasons.push('moderate risk');

        return `Strategic analysis needed: ${strategicReasons.join(', ')}`;

      case 'ROUTINE':
        return `Standard collection process: low-risk account with routine payment issue (${daysPastDue} days overdue)`;

      default:
        return 'Standard routing applied';
    }
  }

  /**
   * Get AI prompt template based on model tier
   */
  private getPromptTemplate(modelTier: string, context: RoutingContext): string {
    const baseContext = this.buildBaseContext(context);

    switch (modelTier) {
      case 'ROUTINE':
        return this.getRoutinePrompt(baseContext);
      case 'STRATEGIC':
        return this.getStrategicPrompt(baseContext);
      case 'SENSITIVE':
        return this.getSensitivePrompt(baseContext);
      default:
        return this.getRoutinePrompt(baseContext);
    }
  }

  /**
   * Build base context for all prompts
   */
  private buildBaseContext(context: RoutingContext): string {
    const { customer, invoice, relationshipScore, riskLevel } = context;
    const daysPastDue = this.calculateDaysPastDue(invoice);

    return `
CUSTOMER CONTEXT:
- Company: ${customer.name}
- ARR: $${((customer as any).arr || 0).toLocaleString()}
- Relationship Score: ${relationshipScore}/100 (${riskLevel} risk)
- Account Age: ${this.calculateAccountAge(customer)} months

INVOICE DETAILS:
- Amount: $${invoice.totalAmount.toLocaleString()}
- Invoice #: ${invoice.invoiceNumber}
- Days Overdue: ${daysPastDue}
- Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

PAYMENT CONTEXT:
- Payment Terms: ${(customer as any).paymentTerms || 'NET15'}
- Health Score: ${(customer as any).healthScore || 'Unknown'}/100
- Support Tickets: ${((customer as any).supportTickets || []).length} recent
`;
  }

  /**
   * Routine collection prompt (GPT-4o mini)
   */
  private getRoutinePrompt(baseContext: string): string {
    return `${baseContext}

TASK: Generate standard payment reminder recommendation

REQUIREMENTS:
1. Professional, relationship-preserving tone
2. Draft email (subject + body, max 150 words)
3. Recommended timing (immediate/tomorrow/next-week)
4. Confidence score (0-100%)
5. Brief reasoning (1-2 sentences)

OUTPUT FORMAT:
{
  "recommendedAction": "send_payment_reminder",
  "confidence": 85,
  "tone": "friendly_reminder",
  "timing": "immediate",
  "draftEmail": {
    "subject": "Payment reminder for Invoice #...",
    "body": "Hi [Name],\\n\\n..."
  },
  "reasoning": "Standard overdue timeline with good payment history suggests gentle reminder appropriate",
  "alternatives": []
}`;
  }

  /**
   * Strategic collection prompt (Claude 3.5 Sonnet)
   */
  private getStrategicPrompt(baseContext: string): string {
    return `${baseContext}

TASK: Strategic collection recommendation with relationship preservation

PROVIDE COMPREHENSIVE ANALYSIS:

1. SITUATION ASSESSMENT
   - Risk factors and relationship implications
   - Payment probability analysis
   - Competitive considerations

2. STRATEGIC OPTIONS (provide 3 alternatives)
   For each option:
   - Approach and tactics
   - Success probability (0-100%)
   - Resource requirements
   - Timeline and milestones
   - Relationship impact

3. RECOMMENDED APPROACH
   - Primary recommendation with reasoning
   - Draft communication strategy
   - Success metrics
   - Escalation triggers

4. BUSINESS IMPACT
   - Revenue at risk
   - Relationship preservation considerations
   - Long-term account value implications

OUTPUT: Structured JSON with detailed analysis ready for human strategic review`;
  }

  /**
   * Sensitive situation prompt (Claude Opus 4)
   */
  private getSensitivePrompt(baseContext: string): string {
    return `${baseContext}

CRITICAL SITUATION REQUIRING EXECUTIVE BRIEFING

PROVIDE EXECUTIVE DECISION PACKAGE:

1. CRISIS ASSESSMENT
   - Immediate threats and timeline
   - Root cause analysis
   - Stakeholder impact mapping
   - Financial exposure calculation

2. STRATEGIC RESPONSE OPTIONS
   - Crisis containment strategy
   - Relationship recovery plan
   - Legal/compliance considerations
   - Communication framework

3. EXECUTIVE ACTION PLAN
   - Immediate actions (next 24 hours)
   - Short-term strategy (next 2 weeks)
   - Long-term relationship recovery
   - Success/failure scenarios

4. RESOURCE REQUIREMENTS
   - Leadership involvement needed
   - Budget allocation
   - Decision timeline
   - Escalation protocols

5. RISK MITIGATION
   - Reputation management
   - Financial exposure limits
   - Competitive intelligence
   - Relationship preservation strategies

OUTPUT: Executive briefing with clear recommendations and action items`;
  }

  /**
   * Calculate account age in months
   */
  private calculateAccountAge(customer: Customer): number {
    if (!customer.createdAt) return 0;
    const created = new Date(customer.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  }
}

export const routingService = new RoutingService();