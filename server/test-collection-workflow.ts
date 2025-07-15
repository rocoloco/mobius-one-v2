import { Customer, Invoice } from '@shared/schema';
import { scoringService } from './services/scoringService';
import { routingService } from './services/routing-service';
import { recommendationService } from './services/recommendation-service';

// Test the complete workflow
async function testCollectionWorkflow() {
  console.log('🧪 Testing Collection Workflow...\n');

  // Create test customer and invoice
  const testCustomer: Customer = {
    id: 'test_customer_001',
    name: 'Acme Corp',
    email: 'billing@acme.com',
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
    arr: 75000,
    segment: 'midmarket',
    paymentTerms: 'NET15',
    healthScore: 68
  } as any;

  // Create overdue invoice
  const testInvoice: Invoice = {
    id: 'test_invoice_001',
    customerId: testCustomer.id,
    invoiceNumber: 'INV-2024-001',
    issueDate: '2024-06-01T00:00:00Z',
    dueDate: '2024-06-16T00:00:00Z', // 28 days overdue
    totalAmount: 12500,
    paidAmount: 0,
    status: 'overdue',
    items: [{
      description: 'Monthly SaaS Subscription',
      quantity: 1,
      unitPrice: 12500,
      total: 12500
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