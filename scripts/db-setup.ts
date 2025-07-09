import { testConnection } from '../lib/db'
import { config } from 'dotenv'

// Load environment variables
config()

async function setupDatabase() {
  console.log('🚀 Mobius One Database Setup')
  console.log('================================')
  
  // Check environment variables
  console.log('📋 Checking environment variables...')
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.log('\n📝 Setup Instructions:')
    console.log('1. Create a Supabase project at https://supabase.com')
    console.log('2. Go to Settings > API in your Supabase dashboard')
    console.log('3. Copy the following values to your .env file:')
    console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - Anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('   - Service role key → SUPABASE_SERVICE_KEY')
    console.log('4. Go to Settings > Database')
    console.log('5. Copy the connection string → DATABASE_URL')
    console.log('6. Run this script again')
    process.exit(1)
  }
  
  console.log('✅ Environment variables configured')
  
  // Test database connection
  console.log('\n📡 Testing database connection...')
  const isConnected = await testConnection()
  
  if (!isConnected) {
    console.error('❌ Database connection failed')
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Verify your DATABASE_URL is correct')
    console.log('2. Check that your Supabase project is running')
    console.log('3. Ensure your IP is whitelisted in Supabase')
    console.log('4. Try regenerating your database password')
    process.exit(1)
  }
  
  console.log('✅ Database connection successful!')
  
  // Next steps
  console.log('\n🎯 Next Steps:')
  console.log('1. Generate database schema:')
  console.log('   npm run db:generate')
  console.log('')
  console.log('2. Push schema to database:')
  console.log('   npm run db:push')
  console.log('')
  console.log('3. Seed database with test data:')
  console.log('   npm run db:seed')
  console.log('')
  console.log('4. Open Drizzle Studio to view data:')
  console.log('   npm run db:studio')
  console.log('')
  console.log('5. Start the development server:')
  console.log('   npm run dev')
  
  console.log('\n🚀 Database setup completed successfully!')
}

// Run setup
setupDatabase().catch((error) => {
  console.error('❌ Database setup failed:', error)
  process.exit(1)
})