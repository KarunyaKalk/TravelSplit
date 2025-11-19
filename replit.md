# Money Splitter - Expense Sharing Application

## Overview

Money Splitter is a web application designed to help users track and split shared expenses among groups of friends. The application features a tropical/vacation-themed aesthetic while maintaining financial credibility. Users can create groups, add expenses, track who owes whom, and settle debts with a fun, approachable interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type safety and component-based UI development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- shadcn/ui component library (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Custom design system with tropical/vacation aesthetic (Poppins and Quicksand fonts)

**State Management Strategy**
- Server state managed through TanStack Query with centralized query client
- Local UI state managed with React hooks
- Form state handled by React Hook Form with Zod validation
- Authentication state cached via React Query

**Design Patterns**
- Component composition using Radix UI's slot pattern
- Custom hooks for reusable logic (useAuth, useToast, useIsMobile)
- Theme provider context for light/dark mode support
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the entire stack
- Session-based authentication using express-session

**API Design**
- RESTful API endpoints organized in routes.ts
- Middleware for request logging and JSON parsing
- Authentication middleware (isAuthenticated) protecting routes
- Standardized error handling and response formatting

**Business Logic Layer**
- Storage abstraction (IStorage interface) separating data access from routes
- DatabaseStorage implementation encapsulating all database operations
- Zod schemas for request validation using drizzle-zod integration

**Data Access Patterns**
- Repository pattern through the storage layer
- Drizzle ORM for type-safe database queries
- Relations defined in schema for joined queries
- Balance calculation logic in the storage layer

### Data Storage

**Database**
- PostgreSQL via Neon serverless
- Drizzle ORM for schema definition and migrations
- Connection pooling through @neondatabase/serverless

**Schema Design**
- **users**: User profiles with Replit Auth integration (id, email, firstName, lastName, profileImageUrl)
- **sessions**: Server-side session storage for authentication (sid, sess, expire)
- **contacts**: User-to-user contact relationships (userId, contactUserId)
- **groups**: Expense groups (id, name, createdBy)
- **groupMembers**: Many-to-many relationship between users and groups
- **expenses**: Individual expenses (id, groupId, title, amount, paidBy)
- **expenseSplits**: Many-to-many split of expenses among users (expenseId, userId, amount)

**Data Integrity**
- Foreign key constraints with cascade deletes
- UUID generation for primary keys
- Timestamps for created/updated tracking
- Decimal type for monetary amounts to ensure precision

### External Dependencies

**Authentication**
- Replit Auth via OpenID Connect (OIDC)
- Passport.js strategy for authentication flow
- Token-based session management with refresh token support
- Session storage in PostgreSQL using connect-pg-simple

**Third-Party Services**
- Neon Database (PostgreSQL serverless) for data persistence
- WebSocket support via ws package for Neon connections
- Google Fonts (Poppins, Quicksand) for typography

**Development Tools**
- Replit-specific plugins for development environment integration
- Vite plugins for runtime error overlay and development features
- esbuild for production server bundling

**Key Libraries**
- drizzle-orm and drizzle-kit for database management
- zod for runtime validation
- date-fns for date manipulation
- memoizee for function result caching
- nanoid for unique ID generation