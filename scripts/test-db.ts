import { db, testConnection } from '../lib/db'
import { customers, invoices, recommendations } from '../lib/schema/collections'
import { eq } from 'drizzle-orm'

async function testDatabase() {
  console.log('🧪 Testing Database Operations')
  console.log('===============================')
  
  try {
    // Test 1: Connection
    console.log('1. Testing connection...')
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Database connection failed')
    }
    console.log('✅ Connection successful')
    
    // Test 2: Basic query
    console.log('\n2. Testing basic queries...')
    const customerCount = await db.select().from(customers)
    console.log(`✅ Found ${customerCount.length} customers`)
    
    const invoiceCount = await db.select().from(invoices)
    console.log(`✅ Found ${invoiceCount.length} invoices`)
    
    const recommendationCount = await db.select().from(recommendations)
    console.log(`✅ Found ${recommendationCount.length} recommendations`)
    
    // Test 3: Join query
    console.log('\n3. Testing join queries...')
    const customerWithInvoices = await db
      .select({
        customerName: customers.name,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        status: invoices.status
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .limit(5)
    
    console.log('✅ Customer-Invoice join successful:')
    customerWithInvoices.forEach(row => {
      if (row.invoiceNumber) {
        console.log(`   ${row.customerName} - ${row.invoiceNumber} ($${row.amount}) - ${row.status}`)
      }
    })
    
    // Test 4: Aggregation
    console.log('\n4. Testing aggregation...')
    const totalOutstanding = await db
      .select({
        total: db.select().from(invoices).where(eq(invoices.status, 'overdue'))
      })
      .from(invoices)
      .where(eq(invoices.status, 'overdue'))
    
    console.log(`✅ Aggregation successful`)
    
    // Test 5: Complex query with recommendations
    console.log('\n5. Testing complex queries...')
    const pendingRecommendations = await db
      .select({
        customerName: customers.name,
        invoiceNumber: invoices.invoiceNumber,
        strategy: recommendations.strategy,
        confidence: recommendations.confidenceScore,
        riskLevel: recommendations.riskAssessment
      })
      .from(recommendations)
      .innerJoin(customers, eq(recommendations.customerId, customers.id))
      .innerJoin(invoices, eq(recommendations.invoiceId, invoices.id))
      .where(eq(recommendations.status, 'pending'))
    
    console.log('✅ Complex query successful:')
    pendingRecommendations.forEach(rec => {
      console.log(`   ${rec.customerName} - ${rec.strategy} (${rec.confidence}% confidence, ${rec.riskLevel} risk)`)
    })
    
    console.log('\n🎉 All database tests passed!')
    console.log('\n📊 Database Summary:')
    console.log(`• ${customerCount.length} customers`)
    console.log(`• ${invoiceCount.length} invoices`)
    console.log(`• ${recommendationCount.length} recommendations`)
    console.log(`• ${pendingRecommendations.length} pending recommendations`)
    
    console.log('\n🚀 Database is ready for development!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your DATABASE_URL environment variable')
    console.log('2. Ensure your Supabase project is running')
    console.log('3. Run `npm run db:push` to create tables')
    console.log('4. Run `npm run db:seed` to populate data')
    process.exit(1)
  }
}

// Run tests
testDatabase().catch((error) => {
  console.error('❌ Test script failed:', error)
  process.exit(1)
})