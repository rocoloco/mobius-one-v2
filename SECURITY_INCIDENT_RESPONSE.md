# Security Incident Response: Rotating Compromised Secrets

## Overview

This document provides step-by-step instructions for rotating all secrets that may have been compromised due to the .env file being tracked in version control.

## Affected Secrets

The following secrets were exposed and need to be rotated immediately:

1. **Supabase Keys**
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY

2. **Database Credentials**
   - DATABASE_URL (contains password)

3. **Anthropic Claude API Key**
   - ANTHROPIC_API_KEY

4. **External Service Credentials**
   - SALESFORCE_CLIENT_SECRET
   - SALESFORCE_ACCESS_TOKEN
   - NETSUITE_CONSUMER_SECRET
   - NETSUITE_TOKEN_SECRET
   - SENDGRID_API_KEY

## Rotation Instructions

### 1. Supabase Keys

**Immediate Action Required:**

1. **Log into Supabase Dashboard**
   - Go to https://app.supabase.com
   - Navigate to your project: `oaklnbybnmwzutpqyqqn`

2. **Rotate Service Role Key**
   - Go to Settings > API
   - Under "Project API keys", click "Reset" next to the service_role key
   - Copy the new key and update SUPABASE_SERVICE_KEY in your .env file

3. **Rotate Anon Key**
   - In the same section, reset the anon key
   - Update NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file

4. **Update Database Password**
   - Go to Settings > Database
   - Reset the database password
   - Update the DATABASE_URL with the new password

### 2. Anthropic Claude API Key

**Immediate Action Required:**

1. **Log into Anthropic Console**
   - Go to https://console.anthropic.com
   - Navigate to API Keys section

2. **Revoke Compromised Key**
   - Find the key starting with `sk-ant-api03-wUR1oCLQ2xNcgKcKsAXr...`
   - Delete/revoke this key immediately

3. **Generate New Key**
   - Create a new API key
   - Update ANTHROPIC_API_KEY in your .env file

### 3. SendGrid API Key

1. **Log into SendGrid**
   - Go to https://app.sendgrid.com
   - Navigate to Settings > API Keys

2. **Revoke Old Key**
   - Find and delete any existing keys

3. **Create New Key**
   - Generate a new API key with appropriate permissions
   - Update SENDGRID_API_KEY in your .env file

### 4. Salesforce Credentials

1. **Log into Salesforce**
   - Go to your Salesforce org
   - Navigate to Setup > Apps > Connected Apps

2. **Reset Client Secret**
   - Find your connected app
   - Reset the client secret
   - Update SALESFORCE_CLIENT_SECRET in your .env file

3. **Revoke Access Tokens**
   - Go to Setup > Sessions
   - Revoke all existing sessions/tokens for the compromised credentials
   - Generate new access token
   - Update SALESFORCE_ACCESS_TOKEN in your .env file

### 5. NetSuite Credentials

1. **Log into NetSuite**
   - Go to your NetSuite account
   - Navigate to Setup > Integration > Web Services Preferences

2. **Reset Token Credentials**
   - Go to Setup > Users/Roles > Access Tokens
   - Revoke the existing token
   - Create new token ID and secret
   - Update NETSUITE_TOKEN_ID and NETSUITE_TOKEN_SECRET

3. **Reset Consumer Credentials**
   - Go to Setup > Integration > Web Services Preferences
   - Reset consumer key and secret if possible
   - Update NETSUITE_CONSUMER_KEY and NETSUITE_CONSUMER_SECRET

## Post-Rotation Checklist

- [ ] All secrets have been rotated
- [ ] .env file has been updated with new secrets
- [ ] .env file is now in .gitignore
- [ ] .env file has been removed from git tracking
- [ ] Application has been tested with new credentials
- [ ] Team members have been notified of the security incident
- [ ] Monitoring has been set up to detect unauthorized usage

## Prevention Measures

1. **Never commit .env files to version control**
2. **Use .env.example for template sharing**
3. **Implement pre-commit hooks to prevent .env commits**
4. **Regular secret rotation schedule**
5. **Use secret management services for production**

## Emergency Contacts

- **Security Team**: [Add your security team contact]
- **Infrastructure Team**: [Add your infrastructure team contact]
- **On-call Engineer**: [Add on-call contact information]

## Timeline

- **Discovery**: [Add timestamp when issue was discovered]
- **Initial Response**: [Add timestamp when response began]
- **Secrets Rotated**: [Add timestamp when all secrets are rotated]
- **Verification Complete**: [Add timestamp when verification is complete]

## Notes

Document any additional steps taken or issues encountered during the rotation process.