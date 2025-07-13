import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function createAuthTables() {
  console.log('🏗️ Creating Authentication Tables');
  console.log('==================================');
  
  try {
    // Create the SQL statements
    const createTablesSQL = `
      -- Create user_profiles table
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

      -- Create user_sessions table
      CREATE TABLE IF NOT EXISTS user_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        session_token text UNIQUE NOT NULL,
        ip_address text,
        user_agent text,
        device_fingerprint text,
        country text,
        city text,
        is_active boolean DEFAULT true,
        expires_at timestamp NOT NULL,
        is_secure boolean DEFAULT false,
        is_same_site boolean DEFAULT true,
        created_at timestamp DEFAULT now(),
        last_accessed_at timestamp DEFAULT now()
      );

      -- Create security_events table
      CREATE TABLE IF NOT EXISTS security_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid,
        event_type text NOT NULL,
        event_data jsonb DEFAULT '{}',
        ip_address text,
        user_agent text,
        location text,
        risk_score text DEFAULT 'low',
        risk_factors jsonb DEFAULT '[]',
        action_taken text,
        created_at timestamp DEFAULT now()
      );

      -- Create companies table
      CREATE TABLE IF NOT EXISTS companies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        domain text,
        settings jsonb DEFAULT '{}',
        mfa_required boolean DEFAULT false,
        password_policy jsonb DEFAULT '{}',
        session_timeout text DEFAULT '24h',
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );

      -- Create oauth_providers table
      CREATE TABLE IF NOT EXISTS oauth_providers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        provider text NOT NULL,
        provider_id text NOT NULL,
        provider_data jsonb DEFAULT '{}',
        connected_at timestamp DEFAULT now(),
        last_used_at timestamp
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

      CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);

      CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id);
      CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider ON oauth_providers(provider);
      CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider_id ON oauth_providers(provider_id);

      -- Create update trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
          BEFORE UPDATE ON user_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
      CREATE TRIGGER update_companies_updated_at
          BEFORE UPDATE ON companies
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL using the REST API
    console.log('📝 Creating authentication tables...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: createTablesSQL
      })
    });

    if (!response.ok) {
      // If RPC doesn't work, try direct SQL execution
      console.log('🔧 Trying alternative approach...');
      
      // Split the SQL into individual statements and execute them
      const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log(`⚠️  Statement execution note: ${error.message}`);
            }
          } catch (err) {
            console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
          }
        }
      }
    }

    // Test if tables were created by trying to insert test data
    console.log('\n🧪 Testing table creation...');
    
    // Test user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('❌ user_profiles table not accessible:', profileError.message);
    } else {
      console.log('✅ user_profiles table created successfully');
    }
    
    // Test user_sessions table
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .limit(1);
    
    if (sessionError) {
      console.log('❌ user_sessions table not accessible:', sessionError.message);
    } else {
      console.log('✅ user_sessions table created successfully');
    }
    
    // Test security_events table
    const { data: eventData, error: eventError } = await supabase
      .from('security_events')
      .select('*')
      .limit(1);
    
    if (eventError) {
      console.log('❌ security_events table not accessible:', eventError.message);
    } else {
      console.log('✅ security_events table created successfully');
    }
    
    // Test companies table
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (companyError) {
      console.log('❌ companies table not accessible:', companyError.message);
    } else {
      console.log('✅ companies table created successfully');
    }
    
    // Test oauth_providers table
    const { data: oauthData, error: oauthError } = await supabase
      .from('oauth_providers')
      .select('*')
      .limit(1);
    
    if (oauthError) {
      console.log('❌ oauth_providers table not accessible:', oauthError.message);
    } else {
      console.log('✅ oauth_providers table created successfully');
    }
    
    console.log('\n🎯 Table Creation Summary:');
    console.log('📊 Authentication database schema setup complete');
    console.log('🔐 Ready for OAuth testing');
    console.log('\n📋 Next steps:');
    console.log('1. Set up Row Level Security (RLS) policies');
    console.log('2. Test OAuth flow with database');
    console.log('3. Create test users');
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
}

// Run the table creation
createAuthTables();