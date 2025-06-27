# Business AI Assistant

## Overview

This is a full-stack business AI assistant application that integrates with Salesforce CRM and NetSuite ERP systems. The application provides a chat interface where users can interact with an AI assistant to query and analyze business data from these integrated systems.

## System Architecture

### Frontend Architecture
- **React** with TypeScript for the UI layer
- **React Router** for multi-page navigation and routing
- **Vite** for build tooling and development server
- **TailwindCSS** for styling with custom retro-inspired color scheme
- **HeroUI** component library with retro theme enhancements
- **TanStack Query** for server state management and caching

### Backend Architecture
- **Express.js** server with TypeScript
- **REST API** architecture with organized route handlers
- **In-memory storage** with interface abstraction for database operations
- **LiteLLM** integration for AI chat functionality
- **Service layer** pattern for external system integrations

### Database Layer
- **Drizzle ORM** with PostgreSQL schema definitions
- **Neon Database** serverless PostgreSQL for production
- Tables: users, conversations, messages, system_connections
- Zod validation schemas for type safety

## Key Components

### Multi-Page Application Architecture
- **Public Landing Page**: Value proposition and onboarding experience (no authentication required)
- **Login/Signup Page**: Authentication interface with demo mode support
- **Dashboard**: System status and activity overview with real-time metrics (default authenticated page)
- **Query Interface**: Main conversational AI interface with iOS-style chat
- **Settings**: System connections and user preferences management
- **History**: Past sessions with search, filter, and export capabilities
- **Help**: Documentation, examples, and FAQ section

### Navigation System
- Left sidebar navigation with collapsible mobile support
- Breadcrumb navigation for deep sections
- Quick action floating button for new queries
- User profile integration in sidebar

### Chat System with iOS UX Patterns
- iOS Messages-style conversation interface with bubble logic
- Apple's typing indicators and message status patterns
- Progressive disclosure for complex data visualization
- Retro terminal aesthetic with modern usability standards

### External Integrations
- **Salesforce Service**: CRM data access (opportunities, accounts, leads)
- **NetSuite Service**: ERP functionality (revenue data, customers)
- **LiteLLM Service**: AI response generation with system context

### Authentication & User Management
- User profile management with roles and permissions
- Session-based authentication structure
- System connection tracking per user

## Data Flow

1. User submits message through chat interface
2. Frontend sends request to Express API endpoint
3. Message stored in database with conversation context
4. AI service processes message with system context
5. External services queried if business data needed
6. AI response generated and stored
7. Response streamed back to frontend
8. UI updates with new messages and any data visualizations

## External Dependencies

### Core Dependencies
- **React ecosystem**: React, React DOM, TanStack Query
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: TailwindCSS, class-variance-authority
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Backend**: Express.js, TypeScript execution (tsx)
- **AI Integration**: LiteLLM API client
- **Validation**: Zod schemas

### External Services
- **Salesforce API**: CRM data integration
- **NetSuite SuiteScript**: ERP data access
- **OpenAI/LiteLLM**: AI language model services
- **Neon Database**: Serverless PostgreSQL hosting

## Deployment Strategy

### Development Environment
- Replit-based development with hot reload
- Vite dev server on port 5000
- PostgreSQL module for database development
- Environment variables for API keys and connection strings

### Production Build
- Vite builds frontend assets to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Node.js production server serves static files and API
- Database migrations via Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `LITELLM_API_KEY` or `OPENAI_API_KEY`: AI service authentication
- `SALESFORCE_*`: Salesforce API credentials
- `NETSUITE_*`: NetSuite integration settings

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Added PostgreSQL database with Drizzle ORM
- June 27, 2025. Implemented retro UI theme with terminal aesthetics
- June 27, 2025. Enhanced retro theme with Apple UX patterns:
  * Added iOS spring animation curves and timing
  * Implemented iOS Messages-style conversation bubbles
  * Enhanced input areas with Apple interaction patterns
  * Integrated iOS navigation hierarchies with retro styling
  * Added Apple accessibility standards (44px touch targets, focus management)
  * Maintained retro visual identity while improving usability
- June 27, 2025. Restructured into multi-page application:
  * Migrated from Wouter to React Router for robust routing
  * Created 6 main pages: Landing, Dashboard, Query, History, Settings, Help
  * Implemented collapsible sidebar navigation with system status
  * Added breadcrumb navigation and quick action floating button
  * Enhanced user experience with proper page transitions and loading states
- June 27, 2025. Implemented authentication architecture:
  * Created public landing page without sidebar navigation
  * Added login/signup page with demo mode support
  * Restructured app routing with authenticated and public sections
  * Dashboard now serves as default authenticated home page
  * All CTAs on landing page properly redirect to login flow
- June 27, 2025. Enhanced visual design with Apple-inspired improvements:
  * Refined color system: Orange (#FF6B35) primary, Blue (#007AFF) secondary, Apple semantic colors
  * Improved typography with Inter font family, proper type scale (12px-32px), enhanced line heights (1.6)
  * Implemented 8px base spacing system following Apple's design guidelines
  * Added micro-animations: button hover states with scale transforms, haptic feedback simulation
  * Enhanced button interactions with Apple-style press ripples and loading states
  * Implemented skeleton loading screens with smooth pulse animations
  * Added Apple-style focus rings and accessibility improvements
  * Maintained retro terminal aesthetic while improving usability and visual hierarchy
- June 27, 2025. Created comprehensive business intelligence dashboard:
  * Welcome section with personalized greeting, user role, and real-time system status
  * Quick stats cards: Today's queries, system connections, data freshness, response times
  * Business insights: Revenue pipeline, collection alerts, deal activity, system performance
  * AI usage statistics with accuracy rates and efficiency metrics
  * Recent activity timeline with detailed status tracking and user attribution
  * Integrated navigation sidebar with all major application sections
  * Footer with system status indicators, sync timestamps, and support actions
  * Applied Apple-inspired design system throughout with consistent spacing and animations
- June 27, 2025. Complete transformation to authentic Shadcn/UI design language:
  * Completely redesigned with pure white backgrounds (#FFFFFF) and minimal gray borders (#E5E7EB)
  * Removed all colored backgrounds - eliminated blue/beige/tan card backgrounds
  * Applied authentic Shadcn color system: Dark gray text (#111827), medium gray secondary (#6B7280)
  * Limited color usage to primary blue (#2563EB) for main CTAs only (Ask AI, Send buttons)
  * Implemented gray outline buttons for secondary actions and minimal status badges
  * Created clean white cards with 1px gray borders and subtle shadows (0 1px 3px rgba(0,0,0,0.1))
  * Applied generous padding (16px, 24px) and proper typography hierarchy
  * Designed minimal icons in gray tones throughout interface
  * Built professional business tool aesthetic - clean, minimal, not colorful or playful
  * Achieved authentic Shadcn/UI reference design matching https://ui.shadcn.com/examples/dashboard
  * Result: Enterprise-grade interface that looks like professional business software
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```