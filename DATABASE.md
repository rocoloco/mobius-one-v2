# Mobius One Database Setup Guide

This guide will help you set up the Supabase database for the Mobius One Collection Acceleration Engine.

## Quick Start

```bash
# 1. Check database setup
npm run db:setup

# 2. Generate and push schema
npm run db:generate
npm run db:push

# 3. Seed with test data
npm run db:seed

# 4. Check database status
npm run db:status
```

## Prerequisites

1. **Node.js** 20 or higher
2. **Supabase Account** (free tier works fine)
3. **Environment Variables** configured

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project name: `mobius-one-collections`
6. Generate a secure password
7. Select a region close to you
8. Click "Create new project"

### 2. Get Database Credentials

Once your project is created:

1. Go to **Settings > API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_KEY`

3. Go to **Settings > Database**
4. Copy the **Connection string** → `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your actual password

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Update the values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Database URL
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# Other required variables...
ANTHROPIC_API_KEY=your-anthropic-key
```

### 4. Test Connection

```bash
npm run db:setup
```

This will:
- Check environment variables
- Test database connection
- Provide next steps

### 5. Generate Schema

```bash
npm run db:generate
```

This creates migration files in the `drizzle/` folder.

### 6. Push Schema to Database

```bash
npm run db:push
```

This creates all tables in your Supabase database.

### 7. Seed Test Data

```bash
npm run db:seed
```

This populates your database with realistic test data:
- 4 customers (TechCorp, StartupCo, DataFlow, CloudTech)
- 4 invoices (mix of paid and overdue)
- 3 AI recommendations
- 1 approval
- 1 collection outcome
- DSO metrics
- Collection configuration

### 8. Verify Setup

```bash
npm run db:status
```

This shows:
- Table statistics
- Data distribution
- Health score
- Recommendations

## Database Schema

### Core Tables

```sql
-- Customers (synced from Salesforce/NetSuite)
customers (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  account_health TEXT,
  total_revenue NUMERIC,
  payment_history JSONB,
  source TEXT NOT NULL -- 'salesforce' or 'netsuite'
)

-- Invoices (synced from NetSuite)
invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  amount NUMERIC NOT NULL,
  due_date TIMESTAMP,
  status TEXT NOT NULL, -- 'pending', 'overdue', 'paid'
  days_overdue INTEGER DEFAULT 0
)

-- AI Recommendations
recommendations (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  customer_id INTEGER REFERENCES customers(id),
  strategy TEXT NOT NULL, -- 'gentle_reminder', 'urgent_notice', 'personal_outreach'
  confidence_score INTEGER NOT NULL, -- 0-100
  draft_content TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  status TEXT DEFAULT 'pending' -- 'pending', 'approved', 'rejected'
)

-- Human Approvals
approvals (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id),
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'approved', 'rejected', 'modified'
  approved_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  outcome TEXT -- 'sent', 'failed'
)

-- Collection Outcomes
collection_outcomes (
  id SERIAL PRIMARY KEY,
  recommendation_id INTEGER REFERENCES recommendations(id),
  invoice_id INTEGER REFERENCES invoices(id),
  payment_received BOOLEAN DEFAULT false,
  days_to_payment INTEGER,
  amount_collected NUMERIC,
  customer_response TEXT -- 'positive', 'negative', 'none'
)

-- DSO Metrics
dso_metrics (
  id SERIAL PRIMARY KEY,
  current_dso NUMERIC NOT NULL,
  previous_dso NUMERIC,
  improvement NUMERIC,
  total_outstanding NUMERIC,
  working_capital_impact NUMERIC,
  calculated_at TIMESTAMP DEFAULT NOW()
)
```

## Available Scripts

```bash
# Database Management
npm run db:setup      # Check setup and provide instructions
npm run db:generate   # Generate migration files
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
npm run db:reset      # Reset and reseed database
npm run db:status     # Check database health
npm run db:studio     # Open Drizzle Studio

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run tests
```

## Database Management Tools

### Drizzle Studio

Visual database explorer:

```bash
npm run db:studio
```

Access at: http://localhost:4983

### Supabase Dashboard

Web interface for your database:
1. Go to your Supabase project
2. Click "Table Editor"
3. View and edit data directly

### SQL Editor

Run custom queries:
1. Go to "SQL Editor" in Supabase
2. Write and execute SQL queries
3. Save commonly used queries

## Data Relationships

```
customers (1) → (many) invoices
invoices (1) → (many) recommendations
recommendations (1) → (1) approvals
recommendations (1) → (1) collection_outcomes
```

## Sample Data Overview

The seed data creates a realistic scenario:

**Customers:**
- **TechCorp Inc.** - Good health, $500K revenue
- **StartupCo** - At-risk, $150K revenue
- **DataFlow Ltd.** - Good health, $750K revenue
- **CloudTech** - Churning, $200K revenue

**Invoices:**
- $15K overdue (35 days) - TechCorp
- $7.5K overdue (48 days) - StartupCo
- $25K paid - DataFlow
- $12K overdue (25 days) - CloudTech

**AI Recommendations:**
- Gentle reminder for TechCorp (92% confidence)
- Urgent notice for StartupCo (76% confidence)
- Personal outreach for CloudTech (65% confidence)

## Troubleshooting

### Common Issues

**Connection refused:**
```bash
# Check your DATABASE_URL
npm run db:setup
```

**Tables don't exist:**
```bash
# Create tables
npm run db:push
```

**No data:**
```bash
# Seed test data
npm run db:seed
```

**Permission denied:**
```bash
# Check your service key
# Verify IP whitelist in Supabase
```

### Environment Variables

Make sure these are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_KEY` - Service role key

### Reset Database

If you need to start fresh:

```bash
# WARNING: This will delete all data
npm run db:reset
```

## Production Setup

For production deployment:

1. **Use connection pooling**
2. **Set up SSL certificates**
3. **Configure backup strategy**
4. **Monitor connection limits**
5. **Set up read replicas if needed**

## Security Considerations

1. **Never commit service keys** to version control
2. **Use environment variables** for all secrets
3. **Enable Row Level Security** in Supabase
4. **Set up proper user roles**
5. **Monitor database access logs**

## Support

For database issues:
1. Check this documentation
2. Run `npm run db:status` for diagnostics
3. Review Supabase logs in dashboard
4. Check network connectivity
5. Verify environment variables

## Next Steps

Once your database is set up:
1. Start the development server: `npm run dev`
2. Visit http://localhost:3000
3. Check the dashboard loads with data
4. Test API endpoints
5. Run the test suite: `npm run test`