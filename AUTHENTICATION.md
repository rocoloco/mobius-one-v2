# Authentication System - Zero Trust Security

## Overview

Mobius One implements a comprehensive zero trust authentication system with the following features:

- **Multi-factor Authentication**: Email/password and Google OAuth
- **Zero Trust Architecture**: Every request is validated and logged
- **Session Management**: Secure session handling with automatic expiry
- **Risk Assessment**: Real-time risk scoring for all authentication attempts
- **Security Monitoring**: Comprehensive logging of all security events
- **Row Level Security**: Database-level access control

## Architecture

### Core Components

1. **Authentication Service** (`lib/services/auth.ts`)
   - Handles sign up, sign in, and session management
   - Implements risk assessment and security logging
   - Manages OAuth flows

2. **Database Schema** (`lib/schema/auth.ts`)
   - User profiles with comprehensive metadata
   - Session tracking with device fingerprinting
   - Security events logging
   - OAuth provider management

3. **API Routes** (`app/api/auth/`)
   - RESTful authentication endpoints
   - Secure cookie handling
   - Input validation and sanitization

4. **Middleware** (`middleware.ts`)
   - Route protection
   - Session validation
   - Security headers
   - Zero trust enforcement

## Security Features

### Zero Trust Principles

1. **Never Trust, Always Verify**
   - Every request is authenticated and authorized
   - No implicit trust based on network location
   - Continuous validation of user identity

2. **Principle of Least Privilege**
   - Role-based access control (RBAC)
   - Granular permissions system
   - Company-level data isolation

3. **Assume Breach**
   - Comprehensive audit logging
   - Real-time threat detection
   - Automated response to suspicious activity

### Risk Assessment

The system continuously assesses risk based on:

- **IP Address**: Geolocation and threat intelligence
- **Device Fingerprinting**: Browser and device characteristics
- **Behavioral Analysis**: Login patterns and frequency
- **Session Context**: Time, location, and access patterns

Risk levels: `low`, `medium`, `high`, `critical`

### Security Monitoring

All authentication events are logged with:

- **Event Type**: login, logout, password_change, suspicious_activity
- **Risk Score**: Calculated risk level
- **Context**: IP, user agent, location, device fingerprint
- **Action Taken**: allowed, blocked, requires_mfa

## Database Schema

### Core Tables

```sql
-- User profiles (extends Supabase auth.users)
user_profiles (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL, -- References auth.users.id
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  role text DEFAULT 'user',
  company_id uuid,
  last_login_at timestamp,
  last_login_ip text,
  mfa_enabled boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_blocked boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Session management
user_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  expires_at timestamp NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  last_accessed_at timestamp DEFAULT now()
);

-- Security events
security_events (
  id uuid PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  risk_score text DEFAULT 'low',
  risk_factors jsonb DEFAULT '[]',
  action_taken text,
  created_at timestamp DEFAULT now()
);

-- OAuth providers
oauth_providers (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_id text NOT NULL,
  provider_data jsonb DEFAULT '{}',
  connected_at timestamp DEFAULT now(),
  last_used_at timestamp
);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- Users can only access their own data
- Admins can view all data within their scope
- Service role can perform administrative operations
- Company-level data isolation

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with email/password
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/signout` - Sign out and invalidate session
- `GET /api/auth/me` - Get current user information

### Request/Response Format

```typescript
// Sign up request
{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Sign in request
{
  email: string;
  password: string;
}

// Response format
{
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    lastLoginAt: string;
  };
}
```

## Configuration

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. **Enable Authentication**
   ```sql
   -- In Supabase SQL editor
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
   ```

2. **Configure OAuth Providers**
   - Go to Authentication > Settings > Auth Providers
   - Enable Google OAuth
   - Add your Google OAuth credentials

3. **Set up Email Templates**
   - Customize email templates in Authentication > Settings > Email Templates

## Usage

### Client-Side Authentication

```typescript
// Sign up
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});

// Sign in
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePassword123!'
  })
});

// Get current user
const response = await fetch('/api/auth/me');
const { user } = await response.json();
```

### Server-Side Authentication

```typescript
import { validateRequest } from '@/lib/services/auth';

// In API route or middleware
const { valid, profile } = await validateRequest(request);

if (!valid || !profile) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Use profile data
console.log(profile.email, profile.role);
```

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management

- Sessions expire after 24 hours
- Automatic logout on suspicious activity
- Secure HTTP-only cookies
- CSRF protection

### Rate Limiting

- Failed login attempts are tracked
- Automatic blocking after multiple failures
- Progressive delays for repeated attempts

### Monitoring

- All authentication events are logged
- Real-time risk assessment
- Automated alerting for critical events
- Compliance reporting

## Testing

### Unit Tests

```bash
# Run authentication tests
npm run test:auth

# Run security tests
npm run test:security
```

### Integration Tests

```bash
# Run full authentication flow tests
npm run test:integration
```

## Deployment

### Production Considerations

1. **Environment Variables**
   - Use secure secret management
   - Rotate keys regularly
   - Enable audit logging

2. **Database Security**
   - Enable SSL connections
   - Configure IP whitelisting
   - Set up read replicas

3. **Monitoring**
   - Set up alerting for failed logins
   - Monitor session patterns
   - Track security events

4. **Backup and Recovery**
   - Regular database backups
   - Test restoration procedures
   - Document incident response

## Troubleshooting

### Common Issues

1. **Session Validation Failures**
   - Check cookie settings
   - Verify middleware configuration
   - Ensure database connectivity

2. **OAuth Flow Issues**
   - Verify redirect URLs
   - Check provider configuration
   - Validate SSL certificates

3. **Performance Issues**
   - Monitor database queries
   - Optimize session storage
   - Scale database resources

### Debug Mode

Enable debug logging:

```env
DEBUG=auth:*
LOG_LEVEL=debug
```

## Contributing

When contributing to the authentication system:

1. **Security First**: Always consider security implications
2. **Test Coverage**: Maintain 100% test coverage
3. **Documentation**: Update this document with changes
4. **Review Process**: All changes require security review

## Support

For authentication-related issues:

1. Check the logs in the security_events table
2. Review the troubleshooting section
3. Contact the security team
4. Escalate critical issues immediately