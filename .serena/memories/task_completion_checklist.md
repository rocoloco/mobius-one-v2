# Task Completion Checklist

## Before Completing Any Development Task

### 1. Code Quality Checks
```bash
npm run type-check   # Must pass - verify TypeScript types
npm run lint         # Must pass - check code quality with Next.js linting
```

### 2. Database Verification (if database changes made)
```bash
npm run db:status    # Check database health
npm run db:push      # Apply any schema changes
```

### 3. Testing
```bash
npm run test:api     # Test API endpoints if backend changes
npm run test         # Run full test suite for major changes
```

### 4. Build Verification
```bash
npm run build        # Ensure production build succeeds
```

## Post-Task Actions
- Verify application starts correctly with `npm run dev`
- Check that new features work in browser
- Ensure no TypeScript errors in IDE
- Confirm database connections if DB changes were made
- Test any new API endpoints manually or with tests

## Git Workflow
- Only commit when all checks pass
- Use meaningful commit messages
- Test locally before pushing
- Verify CI/CD if applicable

## Critical Notes
- Never commit with TypeScript errors
- Always test database changes with `npm run db:status`
- Run `npm run build` before considering task complete
- Check for console errors in browser after changes