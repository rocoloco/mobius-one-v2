# Development Guidelines

## Design Patterns

### API Design
- **RESTful conventions** - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- **Consistent response format** - Always return JSON with proper status codes
- **Error handling** - Use try/catch blocks and return meaningful error messages
- **Type validation** - Use Zod schemas for request/response validation

### Database Patterns
- **Type-safe operations** - Use Drizzle ORM for all database interactions
- **Schema-first development** - Define database schema before implementation
- **Migration-based changes** - All schema changes through migration files
- **Connection pooling** - Configured for production Supabase usage

### Component Architecture
- **Functional components** - Use React hooks instead of class components
- **Compound components** - Break complex UI into reusable pieces
- **Custom hooks** - Extract reusable logic into custom hooks
- **Type-safe props** - Define TypeScript interfaces for all component props

### State Management
- **React Query** - Use for server state management and caching
- **Local state** - Use useState for simple component state
- **Context sparingly** - Only for truly global state (theme, auth)

## Security Considerations
- **Environment variables** - Never commit secrets to git
- **Input validation** - Validate all user inputs with Zod schemas
- **Authentication** - Use Supabase Auth for user management
- **API protection** - Implement proper authorization checks
- **SQL injection prevention** - Use Drizzle ORM parameterized queries

## Performance Guidelines
- **Database queries** - Optimize with proper indexing and query patterns
- **API responses** - Return only necessary data
- **Client-side rendering** - Use Next.js SSR/SSG appropriately
- **Image optimization** - Use Next.js Image component
- **Bundle analysis** - Monitor bundle size and lazy load when possible

## Testing Strategy
- **API testing** - Test all endpoints with Playwright
- **E2E testing** - Test critical user workflows
- **Integration testing** - Test database operations and external integrations
- **Error scenarios** - Test edge cases and error conditions

## Documentation Requirements
- **Code comments** - Document complex business logic
- **API documentation** - Keep endpoint descriptions up to date
- **README updates** - Update setup instructions when process changes
- **Type definitions** - Use descriptive type names and interfaces