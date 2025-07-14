import { ScoringService } from './scoringService';
import { Customer, Invoice } from '@shared/schema';

// Simple data generator for testing
class SaaSDataGenerator {
  generateCustomer(): Customer {
    return {
      id: `test-customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '555-0123',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  generateTestDataset(count: number) {
    const customers = [];
    for (let i = 0; i < count; i++) {
      customers.push(this.generateCustomer());
    }
    return { customers };
  }
}

interface TestScenario {
  name: string;
  description: string;
  customer: Customer;
  invoice: Invoice;
  expectedScore: number;
  expectedRisk: 'low' | 'medium' | 'high';
}

export class TestDataSetup {
  private generator = new SaaSDataGenerator();
  private scoringService = new ScoringService();

  /**
   * Generate comprehensive test scenarios for the scoring algorithm
   */
  createTestScenarios(): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Excellent customer scenarios
    scenarios.push(this.createScenario(
      'excellent-enterprise-ontime',
      'Large enterprise customer with perfect payment history',
      'enterprise',
      'excellent',
      0, // days overdue
      85 // expected score
    ));

    scenarios.push(this.createScenario(
      'excellent-enterprise-slightly-late',
      'Large enterprise customer, first time 10 days late',
      'enterprise', 
      'excellent',
      10,
      78
    ));

    // Good customer scenarios
    scenarios.push(this.createScenario(
      'good-midmarket-normal',
      'Mid-market customer with good payment history',
      'midmarket',
      'good',
      15,
      72
    ));

    scenarios.push(this.createScenario(
      'good-midmarket-concerning',
      'Mid-market customer, 30 days late but historically good',
      'midmarket',
      'good',
      30,
      65
    ));

    // Average customer scenarios  
    scenarios.push(this.createScenario(
      'average-smb-typical',
      'Small business with inconsistent payment patterns',
      'smb',
      'average',
      20,
      58
    ));

    scenarios.push(this.createScenario(
      'average-smb-problematic',
      'Small business, 45 days late with average history',
      'smb',
      'average', 
      45,
      45
    ));

    // Poor customer scenarios
    scenarios.push(this.createScenario(
      'poor-any-risky',
      'Customer with poor payment history, 60 days late',
      'smb',
      'poor',
      60,
      25
    ));

    scenarios.push(this.createScenario(
      'poor-enterprise-salvageable',
      'High-value enterprise customer with recent payment issues',
      'enterprise',
      'poor',
      35,
      40
    ));

    return scenarios;
  }

  /**
   * Create a specific test scenario
   */
  private createScenario(
    name: string,
    description: string,
    segment: 'enterprise' | 'midmarket' | 'smb',
    reliability: 'excellent' | 'good' | 'average' | 'poor',
    daysOverdue: number,
    expectedScore: number
  ): TestScenario {
    // Generate base customer
    const customer = this.generator.generateCustomer();

    // Override with scenario-specific values
    (customer as any).segment = segment;
    (customer as any).healthScore = this.getHealthScoreForReliability(reliability);

    // Create invoice with specific overdue status
    const invoice = this.createOverdueInvoice(customer, daysOverdue);

    const expectedRisk = expectedScore >= 70 ? 'low' : 
                        expectedScore >= 40 ? 'medium' : 'high';

    return {
      name,
      description,
      customer,
      invoice,
      expectedScore,
      expectedRisk
    };
  }

  /**
   * Create an invoice with specific overdue days
   */
  private createOverdueInvoice(customer: Customer, daysOverdue: number): Invoice {
    const today = new Date();
    const issueDate = new Date(today);
    issueDate.setDate(issueDate.getDate() - (daysOverdue + 15)); // Issue 15 days before due

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15); // 15 day terms

    const amount = (customer as any).segment === 'enterprise' ? 50000 :
                  (customer as any).segment === 'midmarket' ? 15000 : 3000;

    return {
      id: `test-invoice-${customer.id}`,
      customerId: customer.id,
      invoiceNumber: `TEST-${Date.now()}`,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      totalAmount: amount,
      paidAmount: 0,
      status: 'overdue',
      items: [{
        description: 'Test SaaS Subscription',
        quantity: 1,
        unitPrice: amount,
        total: amount
      }]
    };
  }

  private getHealthScoreForReliability(reliability: string): number {
    const scores = { excellent: 95, good: 80, average: 65, poor: 40 };
    return scores[reliability as keyof typeof scores];
  }

  /**
   * Run scoring tests and validate results
   */
  runScoringTests(scenarios: TestScenario[]): TestResult[] {
    const results: TestResult[] = [];

    scenarios.forEach(scenario => {
      const scoreResult = this.scoringService.calculateRelationshipScore(
        scenario.customer,
        scenario.invoice
      );

      const passed = this.validateScoreResult(scenario, scoreResult);

      results.push({
        scenario: scenario.name,
        description: scenario.description,
        expected: {
          score: scenario.expectedScore,
          risk: scenario.expectedRisk
        },
        actual: {
          score: scoreResult.score,
          risk: scoreResult.riskLevel,
          confidence: scoreResult.confidence
        },
        passed,
        deviation: Math.abs(scoreResult.score - scenario.expectedScore),
        details: scoreResult
      });
    });

    return results;
  }

  private validateScoreResult(scenario: TestScenario, result: any): boolean {
    const scoreDeviation = Math.abs(result.score - scenario.expectedScore);
    const riskMatches = result.riskLevel === scenario.expectedRisk;

    // Allow 10 point deviation in score, must match risk level
    return scoreDeviation <= 10 && riskMatches;
  }

  /**
   * Generate test report
   */
  generateTestReport(results: TestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const passRate = (passedTests / totalTests * 100).toFixed(1);

    let report = `\n📊 SCORING ALGORITHM TEST REPORT\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `✅ Tests Passed: ${passedTests}/${totalTests} (${passRate}%)\n\n`;

    // Group by pass/fail
    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);

    if (passed.length > 0) {
      report += `🟢 PASSED TESTS:\n`;
      passed.forEach(result => {
        report += `  ✓ ${result.scenario}: Expected ${result.expected.score}, Got ${result.actual.score} (±${result.deviation})\n`;
      });
      report += `\n`;
    }

    if (failed.length > 0) {
      report += `🔴 FAILED TESTS:\n`;
      failed.forEach(result => {
        report += `  ✗ ${result.scenario}:\n`;
        report += `    Expected: Score ${result.expected.score}, Risk ${result.expected.risk}\n`;
        report += `    Actual: Score ${result.actual.score}, Risk ${result.actual.risk}\n`;
        report += `    Deviation: ${result.deviation} points\n`;
        report += `    Description: ${result.description}\n\n`;
      });
    }

    // Score distribution analysis
    report += `📈 SCORE DISTRIBUTION:\n`;
    const scoreRanges = [
      { range: '80-100', count: results.filter(r => r.actual.score >= 80).length },
      { range: '60-79', count: results.filter(r => r.actual.score >= 60 && r.actual.score < 80).length },
      { range: '40-59', count: results.filter(r => r.actual.score >= 40 && r.actual.score < 60).length },
      { range: '0-39', count: results.filter(r => r.actual.score < 40).length }
    ];

    scoreRanges.forEach(range => {
      report += `  ${range.range}: ${range.count} tests\n`;
    });

    return report;
  }

  /**
   * Setup method for integration with testing framework
   */
  setupTestData(): {
    scenarios: TestScenario[];
    fullDataset: ReturnType<SaaSDataGenerator['generateTestDataset']>;
    runTests: () => TestResult[];
  } {
    const scenarios = this.createTestScenarios();
    const fullDataset = this.generator.generateTestDataset(100); // Smaller for testing

    const runTests = () => {
      const results = this.runScoringTests(scenarios);
      console.log(this.generateTestReport(results));
      return results;
    };

    return {
      scenarios,
      fullDataset,
      runTests
    };
  }
}

interface TestResult {
  scenario: string;
  description: string;
  expected: {
    score: number;
    risk: 'low' | 'medium' | 'high';
  };
  actual: {
    score: number;
    risk: 'low' | 'medium' | 'high';
    confidence: number;
  };
  passed: boolean;
  deviation: number;
  details: any;
}

// Export for use in tests
export const testDataSetup = new TestDataSetup();