import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { testConnection } from '../lib/db'

async function main() {
  console.log('🚀 Starting database migration...')
  
  // Test connection first
  console.log('📡 Testing database connection...')
  const isConnected = await testConnection()
  
  if (!isConnected) {
    console.error('❌ Database connection failed. Please check your DATABASE_URL.')
    process.exit(1)
  }
  
  const connectionString = process.env.DATABASE_URL!
  
  // Configure migration client
  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })
  
  const db = drizzle(migrationClient)
  
  try {
    console.log('🔄 Running migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

main().catch((error) => {
  console.error('❌ Migration script failed:', error)
  process.exit(1)
})