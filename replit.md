# Mobius One - Collections Acceleration Engine

## Overview

Mobius One is an autonomous revenue optimization platform that starts with collection acceleration to prove AI can make trusted revenue decisions. The MVP focuses on a single autonomous workflow that accelerates collections for overdue invoices by analyzing customer data across Salesforce and NetSuite, making intelligent outreach decisions with relationship preservation, and measuring revenue impact.

**Target Customer**: CFOs at $5-15M ARR SaaS companies with 50+ day DSO looking to free up $100K+ working capital through automated, intelligent collections that preserve customer relationships.

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
- June 27, 2025. Complete transformation to authentic Shadcn/UI design language with OKLCH:
  * Implemented authentic Shadcn/UI OKLCH color system across all pages (landing, dashboard, query, settings, help, history)
  * Applied modern OKLCH color space for superior color consistency and accessibility
  * Updated CSS variables to use OKLCH values: oklch(1 0 0) for backgrounds, oklch(0.141 0.005 285.823) for foreground
  * Enhanced primary color with OKLCH: oklch(0.705 0.213 47.604) for better contrast and saturation
  * Redesigned all pages with consistent white backgrounds, minimal gray borders, and professional typography
  * Updated Tailwind config to support full Shadcn/UI design tokens and semantic color system
  * Applied 0.65rem border radius throughout for modern, friendly appearance
  * Created cohesive enterprise-grade interface suitable for business executives and CFOs
  * Maintained clean, minimal aesthetic without playful colors or unnecessary visual complexity
  * Result: Production-ready business intelligence platform with authentic Shadcn/UI design language
- June 28, 2025. Steve Jobs-inspired radical simplification transformation:
  * Applied "one interface, no modes" principle - eliminated dashboard/query mode confusion
  * Removed all dashboard clutter: Recent Insights section, System Status section, system health indicators
  * Created pure conversational interface with AI insights presented naturally in greeting context
  * Implemented warm, magical micro-interactions: gentle pulse animations, soft glow effects, breathing cards
  * Enhanced warmth with cream-to-white gradient backgrounds and improved typography (1.6 line height)
  * Added contextual suggested questions that relate directly to mentioned business insights
  * Applied mobile-first accessibility with 44px touch targets and iOS-style interactions
  * Result: Interface feels like talking to intelligent business advisor rather than using software
- January 2, 2025. Complete Mobius brand color transformation:
  * Implemented official Mobius brand colors: Navy (#061A40), Teal (#048BA8), Sage (#C1EDCC)
  * Updated sidebar with navy gradient background and white text throughout
  * Integrated official Mobius "M" logo in the sidebar header
  * Applied warm background gradient: #FAFBFC to subtle sage tint
  * Redesigned chat input with proper focus states using teal accent color
  * Updated "Ask AI" button with teal gradient and hover animations
  * Styled suggested questions with teal left borders and subtle backgrounds
  * Added magical micro-interactions: fade-in animations, subtle pulse effects, hover transformations
  * Applied consistent typography using Mobius color palette for headings and body text
  * Result: Professional, trustworthy interface that reinforces Mobius brand identity
- January 2, 2025. Font system implementation and UI cleanup:
  * Added Google Fonts: Inter (400, 500, 600) and Poppins (600, 700) with proper preconnect optimization
  * Applied Poppins font to "Mobius One" branding and all headings for strong brand presence
  * Applied Inter font to all body text, chat interface, and UI elements with proper line-height (1.6)
  * Implemented font-weight hierarchy: 400 (normal), 500 (medium), 600 (semibold) for emphasis
  * Resolved garbled text issue by removing unused shadcn/ui sidebar component causing conflicts
  * Fixed search input functionality on History page and other form elements
  * Result: Professional typography system with excellent readability and brand consistency
- January 2, 2025. Complete History page philosophical redesign following Jobs' principles:
  * Removed all dashboard elements: metrics cards, bulk actions, filters, sorting controls
  * Transformed from database management tool to conversational memory browsing experience
  * Applied conversational language throughout: "Let's revisit our conversations" vs "Manage conversation history"
  * Added personalized greeting with time-sensitive messaging and user acknowledgment
  * Implemented rich conversation previews focusing on continuation rather than management
  * Applied consistent Mobius brand colors and typography for seamless experience continuity
  * Added encouraging contextual messaging emphasizing relationship building over data management
  * Created intuitive navigation that flows naturally from conversation browsing to continuation
  * Result: Maintains "one continuous surface" experience - feels like browsing business memory with intelligent assistant
- January 2, 2025. Complete Settings page transformation from technical administration to intelligence expansion:
  * Changed core philosophy from "System Connections" to "Expand Mobius Intelligence"
  * Replaced technical system cards with capability-focused intelligence source cards
  * Added business value descriptions: "Sales Intelligence", "Financial Intelligence" with specific capabilities
  * Implemented recent insights preview to show immediate value of each connection
  * Created encouraging "Expand My Knowledge" section with conversational language
  * Added popular integrations showcase with business benefit descriptions
  * Applied consistent Mobius brand colors and magical micro-interactions
  * Only show technical details when there's a connection problem (progressive disclosure)
  * Result: Settings feels like expanding AI superpowers rather than managing technical integrations
- January 2, 2025. Complete Settings page redesign following Steve Jobs specification:
  * Removed all duplicate systems, test buttons, tab navigation, and technical language
  * Implemented three clear sections: Intelligence Sources, Notifications & Updates, Privacy & Data
  * Applied exact Mobius brand colors and Poppins/Inter typography throughout
  * Added interactive radio buttons for notification preferences with visual feedback
  * Created privacy controls with dropdown selectors for data scope, conversation history, team access
  * Used inline styles with proper focus states and hover animations for all interactive elements
  * Applied outcome-focused language: "How should I keep you informed" vs "Configure notifications"
  * Result: Settings page feels empowering and magical rather than administrative or technical
- January 2, 2025. Sidebar navigation cleanup and profile menu implementation:
  * Removed user profile section from bottom-left sidebar to focus navigation on core functionality
  * Cleaned sidebar to only show: Home, History, Settings, Help (following Steve Jobs design principles)
  * Created top-right profile menu component with dropdown functionality
  * Added profile menu to all main pages (Home, Settings, History, Help) with consistent positioning
  * Implemented proper click-outside handling and hover effects for professional user experience
  * Applied consistent Mobius brand colors and typography throughout profile menu
  * Result: Navigation follows universal UX patterns with focused sidebar and familiar top-right account access
- January 2, 2025. Complete Help page transformation following Steve Jobs philosophy:
  * Changed core philosophy from "Learn how to use Mobius One" to "Discover what becomes possible"
  * Created inspiring hero section: "Unlock Your Business Intelligence" with immediate call-to-action
  * Added success stories section with real business outcomes: $450K found, 18% growth, 5hrs to 5min
  * Implemented conversational getting started guide focusing on business value, not technical steps
  * Created powerful questions library organized by business function with clickable examples
  * All questions route back to home page to encourage immediate engagement
  * Applied consistent Mobius branding and magical micro-interactions throughout
  * Result: Help page now inspires and empowers users rather than teaching software functionality
- January 2, 2025. Complete replacement of "Query" with conversational language throughout application:
  * Replaced all "Ask AI" buttons with "Ask Mobius" for consistent brand identity
  * Updated all "AI Assistant" references to "Mobius" in chat components and message displays
  * Changed "AI Insight" labels to "Mobius Insight" in message bubbles and analysis components
  * Updated database entries: converted "New Query Session" titles to "New Conversation"
  * Fixed floating action button navigation from broken `/query` route to home page (`/`)
  * Updated dashboard terminology: "todaysQueries" → "todaysConversations", "quickQueries" → "quickQuestions"
  * Applied conversational language consistently: "Mobius is thinking..." instead of "AI is thinking..."
  * Result: Application now feels like conversing with intelligent business advisor rather than using database software
- January 14, 2025. Official logo integration and mobile responsive fixes:
  * Integrated official Mobius "M" logo files from ZIP folder throughout application
  * Applied proper logos: light background version for landing header, dark background version for sidebar and footer
  * Updated all components: Landing page header/footer, Sidebar (collapsed/expanded), Login page, and favicon
  * Fixed mobile responsive layout issues: button overflow, text wrapping, horizontal scrolling prevention
  * Applied responsive design improvements: proper width constraints, mobile-first padding, typography scaling
  * Result: Professional brand consistency with official logos and optimal mobile experience
- January 15, 2025. Real AI-powered collections analysis integration:
  * Implemented authentic OpenAI and Anthropic API integration for collections analysis
  * Created intelligent AI model routing based on risk factors: invoice amount, relationship score, days overdue
  * Added automatic fallback mechanism from Anthropic Claude 3.5 Sonnet to OpenAI GPT-4o-mini when credits insufficient
  * Routes high-risk scenarios (>$100K, score <40, >60 days overdue) to Claude 3.5 Sonnet for strategic analysis
  * Routes routine scenarios to GPT-4o-mini for cost-effective analysis
  * Generated real collection emails with personalized tone and professional language
  * Fixed frontend API request parameter ordering issue that was causing "Method is not a valid HTTP token" errors
  * Result: Authentic AI analysis replacing mock data with real intelligence and strategic recommendations
- January 15, 2025. Strategic demo scenarios implementation:
  * Replaced random invoice generation with strategic demo scenarios showcasing AI routing capabilities
  * Created 10 strategic test cases: 3 low-risk (GPT-4o-mini), 4 medium-risk (Claude 3.5 Sonnet), 3 high-risk (Claude Opus)
  * Each scenario designed to trigger specific AI model routing based on relationship score, amount, and days overdue
  * Low-risk: Score 70+, amounts $8K-45K, 8-18 days overdue (friendly tone, quick approval)
  * Medium-risk: Score 40-69, amounts $18K-32K, 28-42 days overdue (professional tone, strategic review)
  * High-risk: Score 18-32, amounts $12K-95K, 68-92 days overdue (firm tone, executive review)
  * Updated client-side transformations to handle strategic demo data with proper risk level indicators
  * Result: Consistent test scenarios that properly demonstrate AI routing logic and relationship-based analysis
- January 19, 2025. Application cleanup and page consolidation:
  * Removed unnecessary pages: empty-queue.tsx, home.tsx, query.tsx, history.tsx, help.tsx, not-found.tsx
  * Streamlined routing to focus on core functionality: collections, chat, settings, dashboard, landing, login
  * Updated navigation components to remove references to deleted pages
  * Replaced help page links with external documentation links (https://docs.mobiusone.com)
  * Consolidated empty state handling directly within collections.tsx instead of separate empty-queue page
  * Updated dashboard.tsx to reference /chat instead of deleted /query route
  * Result: Cleaner, more focused application structure with fewer redundant pages and simplified navigation
- January 19, 2025. Enhanced completion experience with celebration stages:
  * Implemented multi-stage completion experience: celebration, impact visualization, next actions
  * Added animated confetti effects with falling particles in multiple colors
  * Created business impact metrics display: working capital freed, cash acceleration days, relationship preservation
  * Added progressive stage transitions: 7-second celebration, 8-second impact, final action stage
  * Implemented custom animations: scale-up, slide-up-immediate, fade-in-simple, confetti fall effects
  * Enhanced timing for emotional impact: 1.2s scale animations, 0.8s slide animations, 1s fade animations
  * Extended confetti duration to 5-8 seconds for lasting celebration effect
  * Fixed completion logic to prioritize isComplete check and prevent race conditions
  * Enhanced user experience with gradient backgrounds, shadow effects, and micro-interactions
  * Fixed misleading "8 new invoices" hardcoded message to accurate "Daily batch complete" messaging
  * Clarified completion logic to recognize daily batch completion vs all-invoices-ever completion
  * Fixed workflow completion logic to prevent premature celebration when users approve invoices for batch
  * Replaced binary completion check with workflow-aware states (working, queue-exhausted, user-quit)
  * Users can now approve multiple invoices without being forced into celebration screen
  * Result: Engaging 15-second completion experience that celebrates business achievements and guides next steps
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```