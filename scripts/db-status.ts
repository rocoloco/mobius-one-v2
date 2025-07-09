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
import { sql } from 'drizzle-orm'

async function checkDatabaseStatus() {
  console.log('📊 Mobius One Database Status')
  console.log('===============================')
  
  try {
    // Check each table
    const tables = [
      { name: 'customers', table: customers },
      { name: 'invoices', table: invoices },
      { name: 'recommendations', table: recommendations },
      { name: 'approvals', table: approvals },
      { name: 'collection_outcomes', table: collectionOutcomes },
      { name: 'dso_metrics', table: dsoMetrics },
      { name: 'collection_config', table: collectionConfig }
    ]
    
    const stats = []
    
    for (const { name, table } of tables) {
      try {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(table)
        stats.push({
          table: name,
          count: result.count,
          status: '✅'
        })
      } catch (error) {
        stats.push({
          table: name,
          count: 0,
          status: '❌',
          error: error.message
        })
      }
    }
    
    // Display table statistics
    console.log('\n📋 Table Statistics:')
    console.log('---------------------')
    stats.forEach(stat => {
      console.log(`${stat.status} ${stat.table.padEnd(20)} ${stat.count.toString().padStart(6)} rows`)
      if (stat.error) {
        console.log(`    Error: ${stat.error}`)
      }
    })
    
    // Calculate totals
    const totalRows = stats.reduce((sum, stat) => sum + stat.count, 0)
    const healthyTables = stats.filter(stat => stat.status === '✅').length
    const totalTables = stats.length
    
    console.log('\n📈 Summary:')
    console.log(`Total Tables: ${totalTables}`)
    console.log(`Healthy Tables: ${healthyTables}`)
    console.log(`Total Records: ${totalRows}`)
    console.log(`Health Score: ${Math.round((healthyTables / totalTables) * 100)}%`)
    
    // Check for specific data patterns
    if (stats.find(s => s.table === 'customers')?.count > 0) {
      console.log('\n🔍 Data Analysis:')
      
      // Customer distribution by source
      const customersBySource = await db
        .select({ 
          source: customers.source, 
          count: sql<number>`count(*)` 
        })
        .from(customers)
        .groupBy(customers.source)
      
      console.log('Customer Sources:')
      customersBySource.forEach(item => {
        console.log(`  ${item.source}: ${item.count} customers`)
      })
      
      // Invoice status distribution
      const invoicesByStatus = await db
        .select({ 
          status: invoices.status, 
          count: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(${invoices.amount}::numeric)`
        })
        .from(invoices)
        .groupBy(invoices.status)
      
      console.log('\nInvoice Status:')
      invoicesByStatus.forEach(item => {
        console.log(`  ${item.status}: ${item.count} invoices ($${Number(item.totalAmount || 0).toLocaleString()})`)
      })
      
      // Recommendation confidence distribution
      const recommendationsByConfidence = await db
        .select({ 
          confidenceRange: sql<string>`
            CASE 
              WHEN ${recommendations.confidenceScore} >= 90 THEN 'High (90%+)'
              WHEN ${recommendations.confidenceScore} >= 70 THEN 'Medium (70-89%)'
              ELSE 'Low (<70%)'
            END
          `,
          count: sql<number>`count(*)`
        })
        .from(recommendations)
        .groupBy(sql`confidence_range`)
      
      console.log('\nRecommendation Confidence:')
      recommendationsByConfidence.forEach(item => {
        console.log(`  ${item.confidenceRange}: ${item.count} recommendations`)
      })
    }
    
    // Health recommendations
    console.log('\n💡 Recommendations:')
    
    if (totalRows === 0) {
      console.log('• Run `npm run db:seed` to populate with test data')
    }
    
    if (healthyTables < totalTables) {
      console.log('• Some tables are missing - run `npm run db:push` to create them')
    }
    
    if (stats.find(s => s.table === 'invoices')?.count > 0) {
      console.log('• Database is ready for collection automation')
    }
    
    console.log('• Use `npm run db:studio` to explore data visually')
    
  } catch (error) {
    console.error('❌ Database status check failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your DATABASE_URL environment variable')
    console.log('2. Ensure your Supabase project is running')
    console.log('3. Run `npm run db:push` to create missing tables')
    process.exit(1)
  }
}

// Run status check
checkDatabaseStatus().catch((error) => {
  console.error('❌ Status check failed:', error)
  process.exit(1)
})