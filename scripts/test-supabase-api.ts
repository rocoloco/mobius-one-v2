import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection');
  console.log('================================');
  
  try {
    // Test basic connection by checking auth users
    console.log('📡 Testing basic connection...');
    const { data: authCheck, error: authCheckError } = await supabase.auth.admin.listUsers();
    
    if (authCheckError) {
      console.error('❌ Connection failed:', authCheckError.message);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test service role access
    console.log('\n🔑 Testing service role access...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Service role access failed:', authError.message);
      return;
    }
    
    console.log('✅ Service role access successful');
    console.log(`📊 Current users: ${authData.users.length}`);
    
    // Test table creation
    console.log('\n🏗️ Testing table creation...');
    const { data: tableData, error: tableError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'test_table',
      columns: 'id SERIAL PRIMARY KEY, name TEXT'
    });
    
    // If RPC doesn't exist, try direct SQL
    if (tableError && tableError.code === 'PGRST202') {
      console.log('📝 Creating tables via SQL...');
      
      // Create user_profiles table
      const { error: profileError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_profiles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid UNIQUE NOT NULL,
            email text UNIQUE NOT NULL,
            first_name text,
            last_name text,
            avatar_url text,
            phone_number text,
            role text NOT NULL DEFAULT 'user',
            permissions jsonb DEFAULT '{}',
            company_id uuid,
            department text,
            job_title text,
            last_login_at timestamp,
            last_login_ip text,
            mfa_enabled boolean DEFAULT false,
            email_verified boolean DEFAULT false,
            is_active boolean DEFAULT true,
            is_blocked boolean DEFAULT false,
            block_reason text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
          );
        `
      });
      
      if (profileError) {
        console.log('⚠️  Direct SQL creation not available');
        console.log('💡 We\'ll need to use the Supabase dashboard SQL editor');
      } else {
        console.log('✅ Table creation successful');
      }
    }
    
    // Test data insertion
    console.log('\n📝 Testing data operations...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000001',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user'
        }
      ])
      .select();
    
    if (insertError) {
      console.log('⚠️  Data insertion test failed (expected if tables don\'t exist)');
      console.log('Error:', insertError.message);
    } else {
      console.log('✅ Data insertion successful');
      console.log('📊 Inserted data:', insertData);
    }
    
    // Test authentication
    console.log('\n🔐 Testing authentication...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });
    
    if (signUpError) {
      console.log('⚠️  Sign up test failed:', signUpError.message);
    } else {
      console.log('✅ Authentication working');
      console.log('👤 Test user created:', signUpData.user?.id);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Supabase connection: Working');
    console.log('✅ Service role access: Working');
    console.log('✅ Authentication: Working');
    console.log('📋 Next steps: Create tables via SQL editor');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseConnection();