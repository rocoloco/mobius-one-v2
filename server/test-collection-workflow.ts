import { Customer, Invoice } from '@shared/schema';
import { scoringService } from './services/scoringService';
import { routingService } from './services/routing-service';
import { recommendationService } from './services/recommendation-service';

// Test the complete workflow
async function testCollectionWorkflow() {
  console.log('🧪 Testing Collection Workflow...\n');

  // Use strategic demo scenario for consistent testing (High-risk example)
  const testCustomer: Customer = {
    id: 'test_customer_001',
    name: 'Problematic Corp',
    email: 'billing@problematic.com',
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
    arr: 95000,
    segment: 'enterprise',
    paymentTerms: 'NET30',
    healthScore: 18, // Low health score for high-risk scenario
    relationshipScore: 18
  } as any;

  // Create overdue invoice matching strategic demo scenario
  const testInvoice: Invoice = {
    id: 'test_invoice_001',
    customerId: testCustomer.id,
    invoiceNumber: 'INV-2024-0756',
    issueDate: '2024-04-15T00:00:00Z',
    dueDate: '2024-05-15T00:00:00Z', // 92 days overdue
    totalAmount: 95000,
    paidAmount: 0,
    status: 'overdue',
    items: [{
      description: 'Enterprise SaaS Subscription',
      quantity: 1,
      unitPrice: 95000,
      total: 95000
    }]
  };

  try {
    // Step 1: Test scoring
    console.log('1️⃣ Testing Scoring Service...');
    const scoreResult = scoringService.calculateRelationshipScore(testCustomer, testInvoice);
    console.log(`   Score: ${scoreResult.score}/100`);
    console.log(`   Risk Level: ${scoreResult.riskLevel}`);
    console.log(`   Confidence: ${scoreResult.confidence}%\n`);

    // Step 2: Test routing
    console.log('2️⃣ Testing Routing Service...');
    const routingContext = {
      customer: testCustomer,
      invoice: testInvoice,
      relationshipScore: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      confidence: scoreResult.confidence
    };
    
    const routingDecision = routingService.routeCollectionRequest(routingContext);
    console.log(`   Model Tier: ${routingDecision.modelTier}`);
    console.log(`   AI Model: ${routingDecision.aiModel}`);
    console.log(`   Cost: $${routingDecision.estimatedCost}`);
    console.log(`   Review Time: ${routingDecision.estimatedReviewTime} minutes`);
    console.log(`   Reasoning: ${routingDecision.reasoning}\n`);

    // Step 3: Test recommendation
    console.log('3️⃣ Testing Recommendation Service...');
    const recommendation = await recommendationService.generateRecommendation(
      routingContext,
      routingDecision
    );
    console.log(`   Action: ${recommendation.recommendedAction}`);
    console.log(`   Confidence: ${recommendation.confidence}%`);
    console.log(`   Tone: ${recommendation.tone}`);
    console.log(`   Timing: ${recommendation.timing}`);
    console.log(`   Revenue at Risk: $${recommendation.businessImpact.revenueAtRisk}`);
    console.log(`   Churn Probability: ${(recommendation.businessImpact.churnProbability * 100).toFixed(1)}%`);
    
    if (recommendation.draftEmail) {
      console.log(`\n   📧 Draft Email:`);
      console.log(`   Subject: ${recommendation.draftEmail.subject}`);
      console.log(`   Body Preview: ${recommendation.draftEmail.body.substring(0, 100)}...`);
    }

    console.log('\n✅ Workflow test completed successfully!');
    
    return {
      scoring: scoreResult,
      routing: routingDecision,
      recommendation
    };

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    throw error;
  }
}

// Run the test
testCollectionWorkflow()
  .then(result => {
    console.log('\n🎉 All systems working!');
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });