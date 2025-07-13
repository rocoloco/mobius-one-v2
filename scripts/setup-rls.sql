-- Enable Row Level Security (RLS) for all authentication tables
-- This ensures zero trust security at the database level

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Only service role can insert new profiles (handled by API)
CREATE POLICY "Service role can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Enable RLS on user_sessions table
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage sessions
CREATE POLICY "Service role can manage sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on security_events table
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own security events
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert security events
CREATE POLICY "Service role can insert security events" ON security_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can view all security events
CREATE POLICY "Admins can view all security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Company admins can update their company
CREATE POLICY "Company admins can update company" ON companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM user_profiles
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Enable RLS on oauth_providers table
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth providers
CREATE POLICY "Users can view own oauth providers" ON oauth_providers
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage OAuth providers
CREATE POLICY "Service role can manage oauth providers" ON oauth_providers
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to get current user's role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY definer
AS $$
    SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY definer
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

-- Create function to check if user is manager or admin
CREATE OR REPLACE FUNCTION auth.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY definer
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    );
$$;

-- Create function to get user's company ID
CREATE OR REPLACE FUNCTION auth.current_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY definer
AS $$
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid();
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_risk_score ON security_events(risk_score);

CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider);
CREATE INDEX idx_oauth_providers_provider_id ON oauth_providers(provider_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();