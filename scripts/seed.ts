import { db } from '../lib/db'
import { 
  customers, 
  invoices, 
  recommendations, 
  approvals, 
  collectionOutcomes, 
  dsoMetrics, 
  collectionConfig 
} from '../lib/schema/collections'

async function seedDatabase() {
  console.log('🌱 Seeding database...')
  
  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...')
    await db.delete(collectionOutcomes)
    await db.delete(approvals)
    await db.delete(recommendations)
    await db.delete(dsoMetrics)
    await db.delete(collectionConfig)
    await db.delete(invoices)
    await db.delete(customers)
    
    // Seed customers
    console.log('👥 Seeding customers...')
    const seedCustomers = await db.insert(customers).values([
      {
        externalId: 'sf_001',
        name: 'TechCorp Inc.',
        accountHealth: 'good',
        totalRevenue: '500000',
        lastActivityDate: new Date('2024-01-15'),
        paymentHistory: [
          { amount: 25000, date: '2023-12-01', daysToPay: 30 },
          { amount: 30000, date: '2023-11-01', daysToPay: 25 },
          { amount: 20000, date: '2023-10-01', daysToPay: 35 }
        ],
        source: 'salesforce'
      },
      {
        externalId: 'sf_002',
        name: 'StartupCo',
        accountHealth: 'at-risk',
        totalRevenue: '150000',
        lastActivityDate: new Date('2024-01-10'),
        paymentHistory: [
          { amount: 10000, date: '2023-12-15', daysToPay: 45 },
          { amount: 15000, date: '2023-11-15', daysToPay: 50 }
        ],
        source: 'salesforce'
      },
      {
        externalId: 'ns_001',
        name: 'DataFlow Ltd.',
        accountHealth: 'good',
        totalRevenue: '750000',
        lastActivityDate: new Date('2024-01-20'),
        paymentHistory: [
          { amount: 50000, date: '2023-12-10', daysToPay: 20 },
          { amount: 40000, date: '2023-11-10', daysToPay: 22 },
          { amount: 35000, date: '2023-10-10', daysToPay: 18 }
        ],
        source: 'netsuite'
      },
      {
        externalId: 'ns_002',
        name: 'CloudTech Solutions',
        accountHealth: 'churning',
        totalRevenue: '200000',
        lastActivityDate: new Date('2024-01-05'),
        paymentHistory: [
          { amount: 8000, date: '2023-12-20', daysToPay: 60 },
          { amount: 12000, date: '2023-11-20', daysToPay: 55 }
        ],
        source: 'netsuite'
      }
    ]).returning()
    
    console.log(`✅ Created ${seedCustomers.length} customers`)
    
    // Seed invoices
    console.log('📄 Seeding invoices...')
    const seedInvoices = await db.insert(invoices).values([
      {
        invoiceNumber: 'INV-2024-001',
        customerId: seedCustomers[0].id,
        amount: '15000',
        dueDate: new Date('2024-01-15'),
        status: 'overdue',
        daysOverdue: 35,
        createdAt: new Date('2023-12-15')
      },
      {
        invoiceNumber: 'INV-2024-002',
        customerId: seedCustomers[1].id,
        amount: '7500',
        dueDate: new Date('2024-01-20'),
        status: 'overdue',
        daysOverdue: 48,
        createdAt: new Date('2023-12-20')
      },
      {
        invoiceNumber: 'INV-2024-003',
        customerId: seedCustomers[2].id,
        amount: '25000',
        dueDate: new Date('2024-01-25'),
        status: 'paid',
        daysOverdue: 0,
        paidDate: new Date('2024-01-22'),
        createdAt: new Date('2023-12-25')
      },
      {
        invoiceNumber: 'INV-2024-004',
        customerId: seedCustomers[3].id,
        amount: '12000',
        dueDate: new Date('2024-02-01'),
        status: 'overdue',
        daysOverdue: 25,
        createdAt: new Date('2024-01-01')
      }
    ]).returning()
    
    console.log(`✅ Created ${seedInvoices.length} invoices`)
    
    // Seed recommendations
    console.log('🤖 Seeding recommendations...')
    const seedRecommendations = await db.insert(recommendations).values([
      {
        invoiceId: seedInvoices[0].id,
        customerId: seedCustomers[0].id,
        strategy: 'gentle_reminder',
        confidenceScore: 92,
        riskAssessment: 'low',
        draftContent: 'Dear TechCorp Inc.,\n\nI hope this email finds you well. I wanted to reach out regarding invoice INV-2024-001 for $15,000, which is now 35 days past due.\n\nGiven your excellent payment history and strong relationship with us, I wanted to personally follow up to see if there are any questions or concerns about this invoice.\n\nCould we schedule a brief call to discuss this? I\'m confident we can resolve this quickly.\n\nBest regards,\nAccounts Receivable Team',
        reasoning: 'Customer has excellent payment history (avg 30 days) and good account health. Low risk approach recommended to maintain relationship.',
        status: 'pending'
      },
      {
        invoiceId: seedInvoices[1].id,
        customerId: seedCustomers[1].id,
        strategy: 'urgent_notice',
        confidenceScore: 76,
        riskAssessment: 'medium',
        draftContent: 'Dear StartupCo,\n\nThis is an urgent notice regarding invoice INV-2024-002 for $7,500, which is now 48 days overdue.\n\nWe understand that startups face cash flow challenges, and we\'re here to help. Please contact us immediately to discuss payment options or a payment plan.\n\nFailure to respond within 7 days may result in collection proceedings.\n\nPlease call us at your earliest convenience.\n\nAccounts Receivable Team',
        reasoning: 'Customer shows at-risk account health with slower payment history (avg 47 days). Urgent but supportive approach needed.',
        status: 'pending'
      },
      {
        invoiceId: seedInvoices[3].id,
        customerId: seedCustomers[3].id,
        strategy: 'personal_outreach',
        confidenceScore: 65,
        riskAssessment: 'high',
        draftContent: 'Dear CloudTech Solutions,\n\nI wanted to personally reach out regarding invoice INV-2024-004 for $12,000, which is now 25 days overdue.\n\nI noticed some changes in your payment patterns recently, and I wanted to understand if there are any challenges we can help address.\n\nWould you be available for a brief call this week to discuss this invoice and your account status?\n\nI\'m committed to finding a solution that works for both of us.\n\nBest regards,\n[Account Manager Name]',
        reasoning: 'Customer showing churning behavior with declining payment performance. High-touch personal approach needed to salvage relationship.',
        status: 'pending'
      }
    ]).returning()
    
    console.log(`✅ Created ${seedRecommendations.length} recommendations`)
    
    // Seed some approvals
    console.log('✅ Seeding approvals...')
    const seedApprovals = await db.insert(approvals).values([
      {
        recommendationId: seedRecommendations[0].id,
        userId: 1,
        action: 'approved',
        approvedAt: new Date('2024-01-28'),
        executedAt: new Date('2024-01-28'),
        outcome: 'sent'
      }
    ]).returning()
    
    console.log(`✅ Created ${seedApprovals.length} approvals`)
    
    // Seed collection outcomes
    console.log('💰 Seeding collection outcomes...')
    const seedOutcomes = await db.insert(collectionOutcomes).values([
      {
        recommendationId: seedRecommendations[0].id,
        invoiceId: seedInvoices[2].id,
        paymentReceived: true,
        daysToPayment: 3,
        customerResponse: 'positive',
        amountCollected: '25000',
        collectedAt: new Date('2024-01-25'),
        impactNotes: 'Customer responded positively and paid within 3 days of gentle reminder'
      }
    ]).returning()
    
    console.log(`✅ Created ${seedOutcomes.length} collection outcomes`)
    
    // Seed DSO metrics
    console.log('📊 Seeding DSO metrics...')
    const seedDSO = await db.insert(dsoMetrics).values([
      {
        currentDso: '42',
        previousDso: '47',
        improvement: '5',
        totalOutstanding: '34500',
        workingCapitalImpact: '125000',
        invoiceCount: 2,
        calculatedAt: new Date()
      }
    ]).returning()
    
    console.log(`✅ Created ${seedDSO.length} DSO metrics`)
    
    // Seed collection config
    console.log('⚙️ Seeding collection config...')
    const seedConfig = await db.insert(collectionConfig).values([
      {
        userId: 1,
        firstReminderDays: 30,
        secondReminderDays: 45,
        escalationDays: 60,
        autoApproveThreshold: 90,
        emailTemplates: {
          gentle_reminder: 'Dear {customerName}, your invoice {invoiceNumber} is {daysOverdue} days overdue...',
          urgent_notice: 'URGENT: Invoice {invoiceNumber} for {amount} is now {daysOverdue} days overdue...',
          personal_outreach: 'Hi {customerName}, I wanted to personally reach out about invoice {invoiceNumber}...'
        }
      }
    ]).returning()
    
    console.log(`✅ Created ${seedConfig.length} collection configs`)
    
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run seeding
seedDatabase().catch((error) => {
  console.error('❌ Seed script failed:', error)
  process.exit(1)
})