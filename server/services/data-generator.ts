import { faker } from '@faker-js/faker';
import { Customer, Invoice } from '@shared/schema';

interface CustomerProfile {
  segment: 'enterprise' | 'midmarket' | 'smb';
  reliability: 'excellent' | 'good' | 'average' | 'poor';
  paymentCycle: number; // days
  avgInvoiceAmount: number;
  seasonality: 'q4-heavy' | 'consistent' | 'summer-dip';
  churnRisk: number; // 0-1
}

interface PaymentBehavior {
  onTimeRate: number;
  avgDaysLate: number;
  disputeRate: number;
  partialPaymentRate: number;
}

export class SaaSDataGenerator {
  private readonly segmentProfiles: Record<string, Partial<CustomerProfile>> = {
    enterprise: {
      segment: 'enterprise',
      paymentCycle: 30,
      avgInvoiceAmount: 150000,
      seasonality: 'q4-heavy',
      churnRisk: 0.05
    },
    midmarket: {
      segment: 'midmarket', 
      paymentCycle: 15,
      avgInvoiceAmount: 25000,
      seasonality: 'consistent',
      churnRisk: 0.12
    },
    smb: {
      segment: 'smb',
      paymentCycle: 15,
      avgInvoiceAmount: 5000,
      seasonality: 'summer-dip',
      churnRisk: 0.25
    }
  };

  private readonly reliabilityPatterns: Record<string, PaymentBehavior> = {
    excellent: { onTimeRate: 0.95, avgDaysLate: 2, disputeRate: 0.01, partialPaymentRate: 0.02 },
    good: { onTimeRate: 0.82, avgDaysLate: 6, disputeRate: 0.03, partialPaymentRate: 0.05 },
    average: { onTimeRate: 0.68, avgDaysLate: 12, disputeRate: 0.08, partialPaymentRate: 0.12 },
    poor: { onTimeRate: 0.45, avgDaysLate: 28, disputeRate: 0.15, partialPaymentRate: 0.25 }
  };

  /**
   * Generate a complete dataset for testing
   */
  generateTestDataset(customerCount: number = 1000): {
    customers: Customer[];
    invoices: Invoice[];
    paymentHistory: any[];
  } {
    const customers: Customer[] = [];
    const invoices: Invoice[] = [];
    const paymentHistory: any[] = [];

    for (let i = 0; i < customerCount; i++) {
      const customer = this.generateCustomer();
      customers.push(customer);

      // Generate 12 months of invoices and payment history
      const customerInvoices = this.generateCustomerInvoices(customer, 12);
      invoices.push(...customerInvoices);

      const customerPayments = this.generatePaymentHistory(customer, customerInvoices);
      paymentHistory.push(...customerPayments);
    }

    return { customers, invoices, paymentHistory };
  }

  /**
   * Generate a single realistic customer
   */
  generateCustomer(): Customer {
    // Randomly assign segment with realistic distribution
    const segments = ['enterprise', 'midmarket', 'smb'];
    const segmentWeights = [0.1, 0.3, 0.6]; // 10% enterprise, 30% midmarket, 60% smb
    const segment = this.weightedRandom(segments, segmentWeights);

    const reliability = this.getReliabilityForSegment(segment);
    const profile = { ...this.segmentProfiles[segment], reliability };

    // Generate realistic company data
    const accountAge = faker.number.int({ min: 1, max: 60 }); // 1-60 months
    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - accountAge);

    return {
      id: faker.string.uuid(),
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: 'USA'
      },
      createdAt: createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      // Add SaaS-specific fields
      segment: profile.segment!,
      arr: this.calculateARR(profile),
      paymentTerms: `NET${profile.paymentCycle}`,
      healthScore: this.calculateHealthScore(reliability!),
      usageMetrics: this.generateUsageMetrics(profile),
      supportTickets: this.generateSupportHistory(reliability!),
      contractValue: profile.avgInvoiceAmount! * 12
    } as Customer;
  }

  /**
   * Generate monthly invoices for a customer
   */
  private generateCustomerInvoices(customer: Customer, months: number): Invoice[] {
    const invoices: Invoice[] = [];
    const baseAmount = (customer as any).contractValue / 12;

    for (let month = 0; month < months; month++) {
      const invoiceDate = new Date();
      invoiceDate.setMonth(invoiceDate.getMonth() - (months - month - 1));

      const seasonalMultiplier = this.getSeasonalMultiplier(
        (customer as any).segment,
        invoiceDate.getMonth()
      );

      const amount = Math.round(baseAmount * seasonalMultiplier);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + this.getPaymentTerms(customer));

      invoices.push({
        id: faker.string.uuid(),
        customerId: customer.id,
        invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${faker.number.int({ min: 1000, max: 9999 })}`,
        issueDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        totalAmount: amount,
        paidAmount: 0,
        status: 'pending',
        items: [{
          description: 'Monthly SaaS Subscription',
          quantity: 1,
          unitPrice: amount,
          total: amount
        }]
      });
    }

    return invoices;
  }

  /**
   * Generate realistic payment history based on customer reliability
   */
  private generatePaymentHistory(customer: Customer, invoices: Invoice[]): any[] {
    const payments: any[] = [];
    const reliability = (customer as any).healthScore;
    const behavior = this.getBehaviorForReliability(reliability);

    invoices.forEach(invoice => {
      const isOnTime = Math.random() < behavior.onTimeRate;
      const hasDispute = Math.random() < behavior.disputeRate;
      const isPartialPayment = Math.random() < behavior.partialPaymentRate;

      let paymentDate = new Date(invoice.dueDate);
      if (!isOnTime) {
        const daysLate = Math.round(
          faker.number.float({ min: 1, max: behavior.avgDaysLate * 2 })
        );
        paymentDate.setDate(paymentDate.getDate() + daysLate);
      }

      const paymentAmount = isPartialPayment ? 
        invoice.totalAmount * faker.number.float({ min: 0.3, max: 0.8 }) : 
        invoice.totalAmount;

      payments.push({
        id: faker.string.uuid(),
        invoiceId: invoice.id,
        customerId: customer.id,
        amount: Math.round(paymentAmount),
        paymentDate: paymentDate.toISOString(),
        method: faker.helpers.arrayElement(['check', 'wire', 'ach', 'credit_card']),
        isOnTime,
        daysLate: isOnTime ? 0 : Math.round((paymentDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        hasDispute,
        isPartialPayment
      });

      // If partial payment, generate follow-up payment
      if (isPartialPayment) {
        const remainingAmount = invoice.totalAmount - paymentAmount;
        const followUpDate = new Date(paymentDate);
        followUpDate.setDate(followUpDate.getDate() + faker.number.int({ min: 7, max: 30 }));

        payments.push({
          id: faker.string.uuid(),
          invoiceId: invoice.id,
          customerId: customer.id,
          amount: Math.round(remainingAmount),
          paymentDate: followUpDate.toISOString(),
          method: faker.helpers.arrayElement(['check', 'wire', 'ach']),
          isOnTime: false,
          daysLate: Math.round((followUpDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
          hasDispute: false,
          isPartialPayment: false,
          isFollowUp: true
        });
      }
    });

    return payments;
  }

  /**
   * Helper methods
   */
  private weightedRandom<T>(items: T[], weights: number[]): T {
    const random = Math.random();
    let sum = 0;

    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  private getReliabilityForSegment(segment: string): 'excellent' | 'good' | 'average' | 'poor' {
    const reliabilityDistribution = {
      enterprise: { excellent: 0.4, good: 0.4, average: 0.15, poor: 0.05 },
      midmarket: { excellent: 0.2, good: 0.4, average: 0.3, poor: 0.1 },
      smb: { excellent: 0.1, good: 0.3, average: 0.4, poor: 0.2 }
    };

    const distribution = reliabilityDistribution[segment as keyof typeof reliabilityDistribution];
    const rand = Math.random();

    if (rand < distribution.excellent) return 'excellent';
    if (rand < distribution.excellent + distribution.good) return 'good';
    if (rand < distribution.excellent + distribution.good + distribution.average) return 'average';
    return 'poor';
  }

  private calculateARR(profile: Partial<CustomerProfile>): number {
    const base = profile.avgInvoiceAmount! * 12;
    const variance = 0.2; // 20% variance
    return Math.round(base * (1 + (Math.random() - 0.5) * variance));
  }

  private calculateHealthScore(reliability: string): number {
    const scores = { excellent: 95, good: 80, average: 65, poor: 40 };
    const base = scores[reliability as keyof typeof scores];
    return base + faker.number.int({ min: -5, max: 5 });
  }

  private generateUsageMetrics(profile: Partial<CustomerProfile>) {
    const baseUsage = profile.segment === 'enterprise' ? 0.85 : 
                     profile.segment === 'midmarket' ? 0.70 : 0.55;

    return {
      monthlyActiveUsers: faker.number.int({ min: 10, max: 1000 }),
      featureAdoption: baseUsage + (Math.random() - 0.5) * 0.3,
      apiCalls: faker.number.int({ min: 1000, max: 100000 }),
      storageUsed: faker.number.float({ min: 0.1, max: 0.9 }),
      lastLogin: faker.date.recent({ days: 30 }).toISOString()
    };
  }

  private generateSupportHistory(reliability: string) {
    const ticketCounts = { excellent: 1, good: 3, average: 6, poor: 12 };
    const count = ticketCounts[reliability as keyof typeof ticketCounts];

    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      subject: faker.lorem.sentence(),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      status: faker.helpers.arrayElement(['open', 'resolved', 'closed']),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      sentiment: reliability === 'poor' ? 'negative' : 
                reliability === 'excellent' ? 'positive' : 'neutral'
    }));
  }

  private getSeasonalMultiplier(segment: string, month: number): number {
    if (segment === 'enterprise') {
      // Q4 heavy (Oct, Nov, Dec get 20% boost)
      return month >= 9 ? 1.2 : 0.95;
    } else if (segment === 'smb') {
      // Summer dip (Jun, Jul, Aug get 15% reduction)
      return month >= 5 && month <= 7 ? 0.85 : 1.05;
    }
    return 1.0; // Consistent for midmarket
  }

  private getPaymentTerms(customer: Customer): number {
    const segment = (customer as any).segment;
    return segment === 'enterprise' ? 30 : 15;
  }

  private getBehaviorForReliability(healthScore: number): PaymentBehavior {
    if (healthScore >= 90) return this.reliabilityPatterns.excellent;
    if (healthScore >= 75) return this.reliabilityPatterns.good;
    if (healthScore >= 60) return this.reliabilityPatterns.average;
    return this.reliabilityPatterns.poor;
  }

  /**
   * Export data to JSON files for testing
   */
  exportToFiles(data: ReturnType<typeof this.generateTestDataset>, basePath = './test-data') {
    const fs = require('fs');
    const path = require('path');

    // Create directory if it doesn't exist
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // Write data files
    fs.writeFileSync(
      path.join(basePath, 'customers.json'),
      JSON.stringify(data.customers, null, 2)
    );

    fs.writeFileSync(
      path.join(basePath, 'invoices.json'),
      JSON.stringify(data.invoices, null, 2)
    );

    fs.writeFileSync(
      path.join(basePath, 'payment-history.json'),
      JSON.stringify(data.paymentHistory, null, 2)
    );

    console.log(`✅ Generated test data exported to ${basePath}/`);
    console.log(`📊 Customers: ${data.customers.length}`);
    console.log(`📄 Invoices: ${data.invoices.length}`);
    console.log(`💰 Payments: ${data.paymentHistory.length}`);
  }
}

// Usage example and export script
export function generateSampleData() {
  const generator = new SaaSDataGenerator();
  const testData = generator.generateTestDataset(1000);
  generator.exportToFiles(testData);
  return testData;
}

// For immediate testing
if (require.main === module) {
  generateSampleData();
}