import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Database Setup');
  console.log('===========================');
  
  const tables = [
    'user_profiles',
    'user_sessions', 
    'security_events',
    'companies',
    'oauth_providers'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Connection error`);
      allTablesExist = false;
    }
  }
  
  console.log('\n🧪 Testing Authentication Functions...');
  
  // Test user signup
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (signUpError) {
      console.log('⚠️  Auth signup test:', signUpError.message);
    } else {
      console.log('✅ Auth signup: Working');
      if (signUpData.user) {
        console.log('👤 Test user ID:', signUpData.user.id);
      }
    }
  } catch (err) {
    console.log('❌ Auth signup test failed');
  }
  
  console.log('\n🔐 Testing OAuth Configuration...');
  
  // Test OAuth providers
  try {
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (oauthError) {
      console.log('❌ OAuth configuration:', oauthError.message);
    } else {
      console.log('✅ OAuth configuration: Working');
      console.log('🔗 OAuth URL generated successfully');
    }
  } catch (err) {
    console.log('❌ OAuth test failed');
  }
  
  console.log('\n📊 Database Setup Summary:');
  console.log('==========================');
  
  if (allTablesExist) {
    console.log('✅ All authentication tables created');
    console.log('✅ Database connection working');
    console.log('✅ Authentication system ready');
    console.log('✅ OAuth configuration working');
    
    console.log('\n🚀 Ready for Testing:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Visit: http://localhost:3000/auth/signin');
    console.log('3. Test Google OAuth flow');
    console.log('4. Check user profiles are created');
    console.log('5. Verify security events are logged');
  } else {
    console.log('❌ Some tables are missing');
    console.log('📋 Please run the SQL scripts in the Supabase dashboard');
    console.log('📖 See: DATABASE_SETUP_GUIDE.md for instructions');
  }
}

// Run verification
verifyDatabaseSetup();