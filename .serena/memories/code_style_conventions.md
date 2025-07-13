# Code Style and Conventions

## TypeScript Configuration
- **Strict mode enabled** - Full TypeScript strict checking
- **ES modules** - Using "type": "module" in package.json
- **Path aliases**: 
  - `@/*` maps to `./client/src/*`
  - `@shared/*` maps to `./shared/*`

## File Structure Patterns
- **App Router structure** - Using Next.js 13+ app directory
- **API routes** - RESTful API endpoints in `app/api/`
- **Shared libraries** - Common code in `lib/` directory
- **Database schemas** - In `lib/schema/`
- **Services** - Business logic in `lib/services/`

## Naming Conventions
- **Files**: kebab-case for files and directories
- **Components**: PascalCase for React components
- **Functions**: camelCase for function names
- **Constants**: UPPER_SNAKE_CASE for environment variables
- **Database**: snake_case for table and column names

## Code Patterns
- **Export const functions** for API routes (GET, POST, PUT, etc.)
- **Named exports** preferred over default exports
- **Type-first approach** - Define types/schemas before implementation
- **Error handling** - Using try/catch with proper error responses
- **Environment variables** - Proper validation and fallbacks

## Database Patterns
- **Drizzle ORM** - Type-safe database operations
- **Schema-first** - Define database schema in code
- **Migrations** - Version-controlled database changes
- **Connection pooling** - Configured for Supabase

## Component Patterns
- **Functional components** with hooks
- **TypeScript interfaces** for component props
- **Compound component patterns** for complex UI
- **Custom hooks** for reusable logic

## API Patterns
- **RESTful endpoints** - Following REST conventions
- **JSON responses** - Consistent response format
- **Error handling** - Proper HTTP status codes
- **Type validation** - Using Zod schemas

## No Linting/Formatting Config
The project currently has no ESLint or Prettier configuration files, relying on Next.js built-in linting via `npm run lint`.