# Trực Ca AI - Operations Monitoring Platform

## Overview

Trực Ca AI is an AI-powered operations monitoring and alerting platform for managing IT infrastructure and systems across shift rotations. The platform automatically collects data from multiple sources (ELK, Prometheus, Polestar, application logs), analyzes incidents using AI, generates intelligent context-aware alerts, and supports shift coordination with automated multi-channel notifications.

The system serves as a centralized hub for:
- Real-time system monitoring and status visualization
- AI-driven log analysis and severity assessment
- Automated alert routing based on shift schedules
- Incident tracking and reporting
- Configuration management for systems, contacts, groups, and alert rules

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Material Design principles adapted for enterprise dashboards
- Custom color system with severity-based theming (down, critical, major, minor, clear)
- Typography using Inter font for UI and JetBrains Mono for monospace data
- Responsive grid layouts with mobile-first approach
- Dark/light theme support via context provider

**Component Architecture:**
- Reusable UI components in `/client/src/components/ui/`
- Domain-specific components (AlertRow, SystemCard, MetricCard, etc.)
- Form components with react-hook-form and Zod validation
- Centralized theme management through ThemeProvider context

**State Management:**
- TanStack Query for API data fetching and caching
- React hooks for local component state
- Custom query client configuration with error handling

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety
- Drizzle ORM for database interactions
- PostgreSQL via Neon serverless driver with WebSocket support

**API Design:**
- RESTful API endpoints under `/api` prefix
- CRUD operations for all major entities (systems, contacts, groups, rules, alerts, schedules, incidents)
- Specialized endpoints for alert acknowledgment and statistics
- Middleware for request logging and JSON parsing

**Data Layer:**
- Storage abstraction layer (`server/storage.ts`) wrapping database operations
- Schema definitions in `shared/schema.ts` using Drizzle and Zod
- Type-safe database queries using Drizzle ORM
- Migration support via drizzle-kit

**Core Entities:**
- **Systems**: Monitored infrastructure with IP, severity levels, and Polestar codes
- **Contacts**: Personnel with roles (team leaders, operators, technical staff)
- **Groups**: Teams with Chatwork integration for notifications
- **AlertRules**: Configurable conditions for triggering alerts
- **Alerts**: System-generated alerts with severity levels and AI analysis
- **Schedules**: Shift rotation assignments
- **Incidents**: Aggregated alert events with resolution tracking
- **Notifications**: Multi-channel notification logs
- **LogAnalysis**: AI-processed log entries

### AI Integration

**Service Layer:**
- OpenAI API integration via Replit AI Integrations service
- GPT-5-mini model for cost-effective analysis
- Automated log analysis generating:
  - Issue summaries in Vietnamese
  - Severity assessment (down/critical/major/minor/clear)
  - Root cause analysis
  - Recommended remediation actions

**AI Workflows:**
- `analyzeLogWithAI()`: Processes raw log content and returns structured analysis
- `processAlertWithAI()`: Enriches alerts with AI-generated insights
- Vietnamese language processing for localized incident reporting

### Notification System

**Multi-Channel Delivery:**
- **Chatwork**: Primary notification channel with group-based routing
- **Email**: Secondary channel for major/critical alerts
- **SMS**: Emergency channel for down/critical status only

**Routing Logic:**
- Severity-based escalation (down/critical → all channels, major → Chatwork + Email, minor → Chatwork only)
- Schedule-aware contact selection based on active shifts
- Group-based distribution via Chatwork Group IDs
- Notification status tracking (sent/failed)

**Implementation:**
- `sendMultiChannelNotification()`: Orchestrates delivery across channels
- Asynchronous processing to avoid blocking alert generation
- Fallback logging when external services unavailable

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Managed PostgreSQL with WebSocket connections
- **Drizzle ORM**: Type-safe database toolkit and query builder
- Connection pooling via `@neondatabase/serverless`

### AI Services
- **OpenAI API**: Via Replit AI Integrations service (no separate API key required)
- Model: GPT-5-mini for log analysis and incident classification
- Billed to Replit credits

### Third-Party Integrations
- **Chatwork**: Team messaging platform for alert notifications (Group ID based routing)
- **Polestar**: External monitoring system (integration via system codes)
- **ELK Stack**: Log aggregation source (mentioned in requirements, integration pending)
- **Prometheus**: Metrics collection source (mentioned in requirements, integration pending)

### UI Component Libraries
- **Radix UI**: Unstyled accessible component primitives
- **Shadcn/ui**: Pre-styled component collection built on Radix
- **Lucide React**: Icon library
- **date-fns**: Date manipulation and formatting

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **ESBuild**: Server-side bundling for production

### Session Management
- **connect-pg-simple**: PostgreSQL-backed session store for Express
- Session persistence in database (implied by dependency)