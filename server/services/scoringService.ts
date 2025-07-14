import { Invoice, Customer } from '@shared/schema';

export interface ScoringFactors {
  // Payment History (35% weight)
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    defaultHistory: number;
    avgDaysLate: number;
    paymentFrequency: number;
  };
  
  // Financial Health (25% weight)
  financialHealth: {
    creditUtilization: number;
    debtToIncomeRatio: number;
    cashFlowStability: number;
    accountBalance: number;
    revenueGrowth: number;
  };
  
  // Relationship Factors (20% weight)
  relationship: {
    accountAge: number;
    communicationResponsiveness: number;
    previousResolutions: number;
    contractCompliance: number;
    businessPartnership: number;
  };
  
  // Behavioral Indicators (15% weight)
  behavioral: {
    contactAttempts: number;
    responseTime: number;
    disputeHistory: number;
    engagementLevel: number;
  };
  
  // External Factors (5% weight)
  external: {
    industryRisk: number;
    economicIndicators: number;
    seasonalFactors: number;
  };
}

export interface ScoreResult {
  score: number;
  confidence: number;
  factors: {
    paymentHistory: number;
    financialHealth: number;
    relationship: number;
    behavioral: number;
    external: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export class ScoringService {
  private readonly weights = {
    paymentHistory: 0.35,
    financialHealth: 0.25,
    relationship: 0.20,
    behavioral: 0.15,
    external: 0.05
  };

  /**
   * Calculate comprehensive relationship score based on customer data
   */
  calculateRelationshipScore(customer: Customer, invoice: Invoice): ScoreResult {
    const factors = this.extractScoringFactors(customer, invoice);
    
    // Calculate component scores (0-100)
    const paymentScore = this.calculatePaymentHistoryScore(factors.paymentHistory);
    const financialScore = this.calculateFinancialHealthScore(factors.financialHealth);
    const relationshipScore = this.calculateRelationshipFactorScore(factors.relationship);
    const behavioralScore = this.calculateBehavioralScore(factors.behavioral);
    const externalScore = this.calculateExternalScore(factors.external);

    // Weighted final score
    const finalScore = Math.round(
      paymentScore * this.weights.paymentHistory +
      financialScore * this.weights.financialHealth +
      relationshipScore * this.weights.relationship +
      behavioralScore * this.weights.behavioral +
      externalScore * this.weights.external
    );

    // Calculate confidence based on data completeness and consistency
    const confidence = this.calculateConfidence(factors, finalScore);

    return {
      score: finalScore,
      confidence,
      factors: {
        paymentHistory: paymentScore,
        financialHealth: financialScore,
        relationship: relationshipScore,
        behavioral: behavioralScore,
        external: externalScore
      },
      riskLevel: this.determineRiskLevel(finalScore),
      recommendation: this.generateRecommendation(finalScore, confidence)
    };
  }

  /**
   * Calculate payment history score using weighted factors
   */
  private calculatePaymentHistoryScore(history: ScoringFactors['paymentHistory']): number {
    const onTimeRate = history.onTimePayments / (history.onTimePayments + history.latePayments);
    const defaultPenalty = history.defaultHistory * 50; // Severe penalty for defaults
    const latePenalty = Math.min(history.avgDaysLate * 5, 70); // Aggressive penalty for late payments
    const frequencyBonus = Math.min(history.paymentFrequency * 10, 20); // Regular payments bonus
    
    const baseScore = onTimeRate * 100;
    const adjustedScore = baseScore - defaultPenalty - latePenalty + frequencyBonus;
    
    return Math.max(0, Math.min(100, adjustedScore));
  }

  /**
   * Calculate financial health score
   */
  private calculateFinancialHealthScore(financial: ScoringFactors['financialHealth']): number {
    const utilizationScore = Math.max(0, 100 - (financial.creditUtilization * 100));
    const debtRatioScore = Math.max(0, 100 - (financial.debtToIncomeRatio * 50));
    const stabilityScore = financial.cashFlowStability * 100;
    const balanceScore = Math.min(100, Math.log10(financial.accountBalance + 1) * 20);
    const growthScore = Math.min(100, Math.max(0, financial.revenueGrowth * 50 + 50));
    
    return Math.round((utilizationScore + debtRatioScore + stabilityScore + balanceScore + growthScore) / 5);
  }

  /**
   * Calculate relationship factor score
   */
  private calculateRelationshipFactorScore(relationship: ScoringFactors['relationship']): number {
    const ageScore = Math.min(100, relationship.accountAge * 10); // Longer relationship = better
    const responsivenessScore = relationship.communicationResponsiveness * 100;
    const resolutionScore = Math.min(100, relationship.previousResolutions * 20);
    const complianceScore = relationship.contractCompliance * 100;
    const partnershipScore = relationship.businessPartnership * 100;
    
    return Math.round((ageScore + responsivenessScore + resolutionScore + complianceScore + partnershipScore) / 5);
  }

  /**
   * Calculate behavioral score
   */
  private calculateBehavioralScore(behavioral: ScoringFactors['behavioral']): number {
    const contactScore = Math.max(0, 100 - (behavioral.contactAttempts * 10)); // Fewer attempts = better
    const responseScore = Math.max(0, 100 - (behavioral.responseTime * 20)); // Faster response = better
    const disputeScore = Math.max(0, 100 - (behavioral.disputeHistory * 25)); // Fewer disputes = better
    const engagementScore = behavioral.engagementLevel * 100;
    
    return Math.round((contactScore + responseScore + disputeScore + engagementScore) / 4);
  }

  /**
   * Calculate external factors score
   */
  private calculateExternalScore(external: ScoringFactors['external']): number {
    const industryScore = (1 - external.industryRisk) * 100;
    const economicScore = external.economicIndicators * 100;
    const seasonalScore = external.seasonalFactors * 100;
    
    return Math.round((industryScore + economicScore + seasonalScore) / 3);
  }

  /**
   * Calculate confidence score using machine learning principles
   */
  private calculateConfidence(factors: ScoringFactors, finalScore: number): number {
    // Data completeness score
    const dataCompleteness = this.calculateDataCompleteness(factors);
    
    // Score consistency (how well different factors agree)
    const scoreConsistency = this.calculateScoreConsistency(factors);
    
    // Historical accuracy (simulated - in real implementation, this would be ML-based)
    const historicalAccuracy = this.calculateHistoricalAccuracy(finalScore);
    
    // Confidence intervals based on data volume
    const dataVolume = this.calculateDataVolume(factors);
    
    // Weighted confidence calculation
    const confidence = Math.round(
      dataCompleteness * 0.3 +
      scoreConsistency * 0.25 +
      historicalAccuracy * 0.25 +
      dataVolume * 0.2
    );
    
    return Math.max(10, Math.min(100, confidence));
  }

  /**
   * Calculate data completeness percentage
   */
  private calculateDataCompleteness(factors: ScoringFactors): number {
    const totalFields = 20; // Total number of scoring factors
    let completedFields = 0;
    
    // Check payment history completeness
    if (factors.paymentHistory.onTimePayments > 0) completedFields++;
    if (factors.paymentHistory.latePayments >= 0) completedFields++;
    if (factors.paymentHistory.defaultHistory >= 0) completedFields++;
    if (factors.paymentHistory.avgDaysLate >= 0) completedFields++;
    if (factors.paymentHistory.paymentFrequency > 0) completedFields++;
    
    // Check financial health completeness
    if (factors.financialHealth.creditUtilization >= 0) completedFields++;
    if (factors.financialHealth.debtToIncomeRatio >= 0) completedFields++;
    if (factors.financialHealth.cashFlowStability >= 0) completedFields++;
    if (factors.financialHealth.accountBalance >= 0) completedFields++;
    if (factors.financialHealth.revenueGrowth !== undefined) completedFields++;
    
    // Check relationship completeness
    if (factors.relationship.accountAge > 0) completedFields++;
    if (factors.relationship.communicationResponsiveness >= 0) completedFields++;
    if (factors.relationship.previousResolutions >= 0) completedFields++;
    if (factors.relationship.contractCompliance >= 0) completedFields++;
    if (factors.relationship.businessPartnership >= 0) completedFields++;
    
    // Check behavioral completeness
    if (factors.behavioral.contactAttempts >= 0) completedFields++;
    if (factors.behavioral.responseTime >= 0) completedFields++;
    if (factors.behavioral.disputeHistory >= 0) completedFields++;
    if (factors.behavioral.engagementLevel >= 0) completedFields++;
    
    // Check external completeness
    if (factors.external.industryRisk >= 0) completedFields++;
    
    return (completedFields / totalFields) * 100;
  }

  /**
   * Calculate score consistency across different factors
   */
  private calculateScoreConsistency(factors: ScoringFactors): number {
    const paymentScore = this.calculatePaymentHistoryScore(factors.paymentHistory);
    const financialScore = this.calculateFinancialHealthScore(factors.financialHealth);
    const relationshipScore = this.calculateRelationshipFactorScore(factors.relationship);
    
    const scores = [paymentScore, financialScore, relationshipScore];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (stdDev * 2));
    return consistencyScore;
  }

  /**
   * Calculate historical accuracy (simulated ML-based prediction)
   */
  private calculateHistoricalAccuracy(score: number): number {
    // In a real implementation, this would use ML models trained on historical data
    // For now, simulate based on score ranges that typically perform well
    if (score >= 80) return 92; // High scores are typically very accurate
    if (score >= 60) return 78; // Medium scores have moderate accuracy
    if (score >= 40) return 65; // Low scores have lower accuracy
    return 45; // Very low scores have poor accuracy
  }

  /**
   * Calculate data volume score
   */
  private calculateDataVolume(factors: ScoringFactors): number {
    // Simulate data volume based on payment history and relationship age
    const paymentDataPoints = factors.paymentHistory.onTimePayments + factors.paymentHistory.latePayments;
    const relationshipMonths = factors.relationship.accountAge;
    
    const volumeScore = Math.min(100, (paymentDataPoints * 5) + (relationshipMonths * 2));
    return volumeScore;
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 85) return 'low';
    if (score >= 65) return 'medium';
    return 'high';
  }

  /**
   * Generate recommendation based on score and confidence
   */
  private generateRecommendation(score: number, confidence: number): string {
    if (confidence < 60) {
      return 'Collect more data before making collection decisions';
    }
    
    if (score >= 80) {
      return 'Gentle reminder approach - high probability of voluntary payment';
    } else if (score >= 60) {
      return 'Standard collection process - customer likely to respond positively';
    } else if (score >= 40) {
      return 'Firm but respectful approach - monitor closely for relationship preservation';
    } else {
      return 'Escalated collection strategy - consider professional collection services';
    }
  }

  /**
   * Extract scoring factors from customer and invoice data
   */
  private extractScoringFactors(customer: Customer, invoice: Invoice): ScoringFactors {
    // In a real implementation, this would extract from actual data
    // For now, generate realistic factors based on available data
    
    const daysPastDue = Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
    const accountAge = Math.max(1, Math.floor((Date.now() - new Date(customer.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    // Add escalating penalty multiplier
    const overdueMultiplier = daysPastDue > 60 ? 3.0 : 
                             daysPastDue > 30 ? 2.0 : 1.0;
    
    return {
      paymentHistory: {
        onTimePayments: Math.max(1, 10 - Math.floor(daysPastDue / 30)),
        latePayments: Math.floor(daysPastDue / 30),
        defaultHistory: daysPastDue > 90 ? 1 : 0,
        avgDaysLate: Math.min(60, (daysPastDue / 2) * overdueMultiplier),
        paymentFrequency: Math.max(0.1, 1 - (daysPastDue / 365))
      },
      financialHealth: {
        creditUtilization: Math.min(1, invoice.totalAmount / 100000),
        debtToIncomeRatio: Math.min(1, invoice.totalAmount / 50000),
        cashFlowStability: Math.max(0.3, 1 - (daysPastDue / 180)),
        accountBalance: invoice.totalAmount,
        revenueGrowth: Math.random() * 0.4 - 0.1 // -10% to +30%
      },
      relationship: {
        accountAge: accountAge,
        communicationResponsiveness: Math.max(0.2, 1 - (daysPastDue / 90)),
        previousResolutions: Math.max(0, 3 - Math.floor(daysPastDue / 60)),
        contractCompliance: Math.max(0.1, 1 - (daysPastDue / 120)),
        businessPartnership: Math.max(0.3, 1 - (daysPastDue / 150))
      },
      behavioral: {
        contactAttempts: Math.floor(daysPastDue / 15),
        responseTime: Math.min(5, daysPastDue / 10),
        disputeHistory: daysPastDue > 60 ? 1 : 0,
        engagementLevel: Math.max(0.1, 1 - (daysPastDue / 100))
      },
      external: {
        industryRisk: 0.3, // 30% industry risk (moderate)
        economicIndicators: 0.7, // 70% positive economic indicators
        seasonalFactors: 0.8 // 80% positive seasonal factors
      }
    };
  }
}

export const scoringService = new ScoringService();