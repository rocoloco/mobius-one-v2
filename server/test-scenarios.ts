import { Customer, Invoice } from '@shared/schema';
import { scoringService } from './services/scoringService';
import { routingService } from './services/routing-service';
import { recommendationService } from './services/recommendation-service';

// Test scenarios aligned with strategic demo scenarios
const scenarios = [
  {
    name: 'Low Risk - Acme Corporation (12 days overdue)',
    customer: { arr: 45000, healthScore: 85, segment: 'enterprise', relationshipScore: 85 },
    daysOverdue: 12,
    expectedRisk: 'low',
    expectedModel: 'gpt-4o-mini'
  },
  {
    name: 'Medium Risk - GlobalTech Industries (35 days overdue)',
    customer: { arr: 32000, healthScore: 58, segment: 'midmarket', relationshipScore: 58 },
    daysOverdue: 35,
    expectedRisk: 'medium',
    expectedModel: 'claude-3.5-sonnet'
  },
  {
    name: 'High Risk - Problematic Corp (92 days overdue)',
    customer: { arr: 95000, healthScore: 18, segment: 'enterprise', relationshipScore: 18 },
    daysOverdue: 92,
    expectedRisk: 'high',
    expectedModel: 'claude-opus-4'
  }
];

function createTestCustomer(overrides: any): Customer {
  return {
    id: `test_customer_${Date.now()}`,
    name: `${overrides.segment} Customer`,
    email: 'billing@customer.com',
    phone: '555-0123',
    address: {
      street: '123 Business St',
      city: 'Tech City',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    arr: overrides.arr,
    segment: overrides.segment,
    paymentTerms: 'NET30',
    healthScore: overrides.healthScore
  } as any;
}

function createTestInvoice(customerId: string, daysOverdue: number): Invoice {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - daysOverdue);
  
  return {
    id: `test_invoice_${Date.now()}`,
    customerId,
    invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000)}`,
    issueDate: new Date(dueDate.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
    dueDate: dueDate.toISOString(),
    totalAmount: Math.floor(Math.random() * 50000) + 5000,
    paidAmount: 0,
    status: 'overdue',
    items: [{
      description: 'Monthly SaaS Subscription',
      quantity: 1,
      unitPrice: 12500,
      total: 12500
    }]
  };
}

async function testScenarios() {
  console.log('🧪 Testing Collection Scenarios...\n');
  
  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 ${scenario.name.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    
    const customer = createTestCustomer(scenario.customer);
    const invoice = createTestInvoice(customer.id, scenario.daysOverdue);
    
    try {
      // Step 1: Scoring
      const scoreResult = scoringService.calculateRelationshipScore(customer, invoice);
      console.log(`📊 SCORING:`);
      console.log(`   Score: ${scoreResult.score}/100`);
      console.log(`   Risk Level: ${scoreResult.riskLevel}`);
      console.log(`   Confidence: ${scoreResult.confidence}%`);
      
      // Step 2: Routing
      const routingContext = {
        customer,
        invoice,
        relationshipScore: scoreResult.score,
        riskLevel: scoreResult.riskLevel,
        confidence: scoreResult.confidence
      };
      
      const routingDecision = routingService.routeCollectionRequest(routingContext);
      console.log(`\n🔀 ROUTING:`);
      console.log(`   Model Tier: ${routingDecision.modelTier}`);
      console.log(`   AI Model: ${routingDecision.aiModel}`);
      console.log(`   Expected Model: ${scenario.expectedModel}`);
      console.log(`   Model Match: ${routingDecision.aiModel === scenario.expectedModel ? '✅' : '❌'}`);
      console.log(`   Cost: $${routingDecision.estimatedCost}`);
      console.log(`   Review Time: ${routingDecision.estimatedReviewTime} minutes`);
      console.log(`   Reasoning: ${routingDecision.reasoning}`);
      
      // Step 3: Recommendation
      const recommendation = await recommendationService.generateRecommendation(
        routingContext,
        routingDecision
      );
      console.log(`\n💡 RECOMMENDATION:`);
      console.log(`   Action: ${recommendation.recommendedAction}`);
      console.log(`   Confidence: ${recommendation.confidence}%`);
      console.log(`   Tone: ${recommendation.tone}`);
      console.log(`   Timing: ${recommendation.timing}`);
      console.log(`   Revenue at Risk: $${recommendation.businessImpact.revenueAtRisk}`);
      console.log(`   Churn Risk: ${(recommendation.businessImpact.churnProbability * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`❌ Scenario failed: ${error.message}`);
    }
  }
  
  console.log('\n✅ All scenarios tested!');
}

// Run the scenarios
testScenarios()
  .then(() => {
    console.log('\n🎉 Scenario testing complete!');
  })
  .catch(error => {
    console.error('\n💥 Scenario testing failed:', error.message);
    process.exit(1);
  });