# Suggested Commands for Development

## Development Commands
```bash
npm run dev          # Start development server (Next.js on port 3000)
npm run build        # Build for production
npm run start        # Start production server
```

## Code Quality Commands
```bash
npm run lint         # Run Next.js linting
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

## Database Commands
```bash
npm run db:setup     # Check database setup and provide instructions
npm run db:generate  # Generate Drizzle migration files
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset and reseed database
npm run db:status    # Check database health and statistics
npm run db:studio    # Open Drizzle Studio (localhost:4983)
npm run db:test      # Test database connection
```

## Testing Commands
```bash
npm run test              # Run all Playwright tests
npm run test:headed       # Run tests with browser UI
npm run test:api          # Run API tests only
npm run test:e2e          # Run E2E tests only
npm run test:integration  # Run integration tests only
npm run test:report       # View test reports
```

## System Commands (macOS)
```bash
git status           # Check git repository status
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
ls -la               # List files with details
find . -name "*.ts"  # Find TypeScript files
grep -r "pattern"    # Search for patterns in files
```

## Recommended Workflow After Changes
1. `npm run type-check` - Verify TypeScript types
2. `npm run lint` - Check code quality
3. `npm run test:api` - Test API endpoints
4. `npm run db:status` - Verify database health
5. `npm run build` - Ensure production build works