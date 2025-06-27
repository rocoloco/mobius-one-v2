# Business AI Assistant

## Overview

This is a full-stack business AI assistant application that integrates with Salesforce CRM and NetSuite ERP systems. The application provides a chat interface where users can interact with an AI assistant to query and analyze business data from these integrated systems.

## System Architecture

### Frontend Architecture
- **React** with TypeScript for the UI layer
- **Vite** for build tooling and development server
- **TailwindCSS** for styling with custom Salesforce-inspired color scheme
- **shadcn/ui** component library for consistent UI components
- **Wouter** for client-side routing
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

### Chat System
- Real-time chat interface with message history
- Support for user and AI assistant messages
- Message metadata handling for system data integration
- Conversation management with persistent storage

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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```