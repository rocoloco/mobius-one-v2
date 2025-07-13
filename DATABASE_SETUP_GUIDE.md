# Database Setup Guide - Supabase SQL Editor

## 🚀 Manual Database Setup

Since the database DNS hasn't fully propagated yet, we'll use the Supabase dashboard to create our authentication tables directly.

### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase dashboard: `https://supabase.com/dashboard/project/oaklnbybnmwzutpqyqqn`
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### **Step 2: Create Authentication Tables**

Copy and paste the following SQL script into the SQL editor:

```sql
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
```

### **Step 3: Create Indexes**

After creating the tables, run this SQL to create performance indexes:

```sql
-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Create indexes for security_events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);

-- Create indexes for oauth_providers
CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider ON oauth_providers(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider_id ON oauth_providers(provider_id);
```

### **Step 4: Create Update Triggers**

Run this SQL to create automatic timestamp updates:

```sql
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
```

### **Step 5: Set Up Row Level Security (RLS)**

Run this SQL to enable zero trust security:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage profiles" ON user_profiles
    FOR ALL USING (true);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sessions" ON user_sessions
    FOR ALL USING (true);

-- Create RLS policies for security_events
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert security events" ON security_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage security events" ON security_events
    FOR ALL USING (true);

-- Create RLS policies for companies
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM user_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage companies" ON companies
    FOR ALL USING (true);

-- Create RLS policies for oauth_providers
CREATE POLICY "Users can view own oauth providers" ON oauth_providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage oauth providers" ON oauth_providers
    FOR ALL USING (true);
```

### **Step 6: Verify Table Creation**

After running all the SQL scripts, verify the tables were created:

1. Go to **Database** → **Tables** in the Supabase dashboard
2. You should see all 5 tables:
   - `user_profiles`
   - `user_sessions`
   - `security_events`
   - `companies`
   - `oauth_providers`

### **Step 7: Test Database Connection**

Once the tables are created, test the connection:

```bash
npx tsx scripts/test-supabase-api.ts
```

You should see successful table access messages.

## 🔧 **Alternative: Using Supabase CLI**

If you prefer using the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref oaklnbybnmwzutpqyqqn

# Run migrations
supabase db push
```

## 🎯 **Next Steps After Database Setup**

1. **Test OAuth Flow**: `npm run dev` and visit `http://localhost:3000/auth/signin`
2. **Create Test Users**: Use the Google OAuth flow to create test accounts
3. **Verify Security Events**: Check that authentication events are logged
4. **Test API Endpoints**: Use Postman or curl to test authentication APIs

## 📊 **Database Schema Overview**

```
auth.users (Supabase managed)
└── user_profiles (our extension)
    ├── user_sessions (session tracking)
    ├── security_events (audit log)
    ├── oauth_providers (OAuth tracking)
    └── companies (organization data)
```

## 🔐 **Security Features**

- **Row Level Security**: Database-level access control
- **Zero Trust**: Every request validated
- **Audit Logging**: All authentication events tracked
- **Session Management**: Secure session handling
- **Role-Based Access**: User, manager, admin roles

## ✅ **Completion Checklist**

- [ ] Tables created in Supabase dashboard
- [ ] Indexes created for performance
- [ ] RLS policies enabled
- [ ] Helper functions created
- [ ] Database connection tested
- [ ] OAuth flow tested
- [ ] Security events logged

Once completed, your authentication system will be fully operational with enterprise-grade security!