# Codebase Structure

## Root Directory Structure
```
/
├── app/                    # Next.js App Router (main application)
│   ├── api/               # API routes (RESTful endpoints)
│   ├── auth/              # Authentication pages (signin/signup)
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page (CollectionDashboard)
│   └── providers.tsx      # React context providers
├── lib/                   # Shared libraries and utilities
│   ├── db.ts             # Database connection (Drizzle + Supabase)
│   ├── schema/           # Database schemas
│   ├── services/         # Business logic services
│   └── supabase/         # Supabase client configuration
├── tests/                 # Playwright test suite
│   ├── api/              # API endpoint tests
│   ├── e2e/              # End-to-end tests
│   └── integration/      # Integration tests
├── scripts/              # Utility scripts (database, setup, etc.)
├── backlog/              # Project management and task tracking
├── client/               # Frontend client code (legacy structure)
├── server/               # Server-side code (legacy structure)
├── shared/               # Shared code between client/server
└── attached_assets/      # Static assets and files
```

## Key API Endpoints
- `/api/auth/*` - Authentication (signin, signup, callback)
- `/api/customers/sync` - Customer data synchronization
- `/api/invoices` - Invoice management
- `/api/recommendations` - AI-powered collection recommendations
- `/api/approvals` - Human approval workflow
- `/api/collection-outcomes` - Collection results tracking
- `/api/dso-metrics` - DSO calculation and metrics

## Database Schema Location
- `lib/schema/collections.ts` - Main database schema definitions
- `lib/schema/auth.ts` - Authentication-related schemas

## Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - Playwright test configuration
- `drizzle.config.ts` - Database migration configuration
- `package.json` - Dependencies and scripts

## Environment Setup
- `.env` - Environment variables (not in git)
- `.env.example` - Template for environment variables
- `.env.test` - Test environment variables