# Rehber360 - Architecture Overview

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Design Principles](#design-principles)
5. [System Components](#system-components)
6. [Data Flow](#data-flow)
7. [Deployment Architecture](#deployment-architecture)
8. [Scalability & Performance](#scalability--performance)

---

## System Overview

Rehber360 is a comprehensive student guidance and management system built as a modern full-stack TypeScript application. The system provides:

- **Student Management**: Complete student profiles, academic tracking, behavioral monitoring
- **AI-Powered Analytics**: ML-driven insights, risk assessment, and personalized recommendations
- **Counseling Tools**: Session management, survey distribution, intervention tracking
- **Exam Management**: Performance tracking, comparative analysis, goal setting
- **Career Guidance**: 71 career profiles with AI-powered matching
- **Advanced Reporting**: PDF/Excel exports, analytics dashboards, early warning systems

### Key Characteristics

- **Type-Safe**: Full TypeScript implementation (client + server + shared)
- **Modern Stack**: React 18, Express 5, Vite, SQLite
- **Feature-Based**: Modular architecture with clear separation of concerns
- **AI-First**: Integrated AI capabilities (OpenAI, Gemini, Ollama)
- **Real-time**: Live updates via React Query and background schedulers
- **Accessible**: WCAG AAA compliance, mobile-first design
- **Secure**: RBAC, input sanitization, encrypted backups

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │ React Query  │  │   Router     │          │
│  │  Components  │  │ State Mgmt   │  │  (Pages)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           │                 │                 │                 │
│           └─────────────────┴─────────────────┘                 │
│                            │                                    │
│                   ┌────────▼────────┐                           │
│                   │   API Client    │                           │
│                   │  (Axios/Fetch)  │                           │
│                   └────────┬────────┘                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│                         SERVER LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Express.js v5                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │Middleware│  │  Routes  │  │ Features │              │   │
│  │  │  Layer   │  │  Layer   │  │  Registry│              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                   │
│  ┌────────────────┬─────────┼─────────┬────────────────┐       │
│  │   Services     │   Repositories   │   AI Adapters  │       │
│  │ Business Logic │   Data Access    │  ML Integration│       │
│  └────────────────┴──────────────────┴────────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   SQLite     │  │  File System │  │  External    │          │
│  │  Database    │  │  (uploads,   │  │  AI APIs     │          │
│  │ (better-     │  │   backups)   │  │ (OpenAI,     │          │
│  │  sqlite3)    │  │              │  │  Gemini)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library with hooks and concurrent features |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Vite** | 6.x | Fast build tool with HMR |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible component primitives |
| **TanStack React Query** | 5.x | Server state management and caching |
| **React Hook Form** | 7.x | Performant form handling |
| **Zod** | 3.x | Schema validation (client + server) |
| **Recharts** | 2.x | Data visualization |
| **Framer Motion** | 11.x | Animation library |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 5.x | Web framework |
| **TypeScript** | 5.x | Type-safe backend development |
| **SQLite** | 3.x | Embedded relational database |
| **better-sqlite3** | 12.x | Synchronous SQLite driver |
| **bcryptjs** | 3.x | Password hashing |
| **Multer** | 2.x | File upload handling |
| **Zod** | 3.x | Runtime validation |

### AI/ML Integration

| Provider | Purpose | Status |
|----------|---------|--------|
| **OpenAI** | GPT-4o, GPT-4o-mini for advanced analysis | Optional |
| **Gemini** | Google AI for text analysis, STT | Primary |
| **Ollama** | Local LLM (Llama 3.1) for privacy | Recommended |

### Build & Development Tools

- **Vite**: Development server + production bundler
- **ESLint**: Code linting (TypeScript rules)
- **Prettier**: Code formatting
- **Vitest**: Unit/integration testing
- **Testing Library**: Component testing
- **Husky + lint-staged**: Pre-commit hooks

---

## Design Principles

### 1. Feature-Based Organization

```
Features are self-contained modules with:
- Routes: API endpoint handlers
- Services: Business logic layer
- Repositories: Data access layer
- Types: Feature-specific TypeScript definitions
```

**Benefits:**
- ✅ Easy to locate feature-specific code
- ✅ Clear ownership and responsibility
- ✅ Better scalability and maintainability
- ✅ Simplified testing (isolated features)

### 2. Separation of Concerns

**Three-Layer Architecture:**

```
Routes Layer    → Handle HTTP requests/responses
   ↓
Services Layer  → Business logic, validation, orchestration
   ↓
Repository Layer → Database queries and data access
```

**Why:**
- Testing: Each layer can be tested independently
- Maintainability: Changes in one layer don't affect others
- Reusability: Services can be shared across routes

### 3. Type Safety

- **Shared Types**: `shared/types/` for client-server contracts
- **Zod Schemas**: Runtime validation matching TypeScript types
- **Strict Mode**: TypeScript strict mode enabled
- **Type Inference**: Leverage TypeScript's type inference

### 4. Atomic Design (Frontend)

```
client/components/
  ├── atoms/        → Basic UI elements (Button, Input)
  ├── molecules/    → Simple combinations (SearchBar, FormField)
  ├── organisms/    → Complex components (Table, Dialog)
  └── features/     → Feature-specific components
```

### 5. Security-First

- Input sanitization at every entry point
- RBAC (Role-Based Access Control)
- Prepared statements (SQL injection prevention)
- CORS with whitelist
- Rate limiting on sensitive endpoints
- File upload validation (MIME type, size, malware detection)
- Encrypted backups (AES-256)

### 6. Performance Optimization

- **Code Splitting**: Route-based lazy loading
- **Caching**: React Query with 10-minute stale time for analytics
- **Virtual Scrolling**: Large lists (react-virtual)
- **Debouncing**: API calls and search inputs
- **Background Jobs**: Analytics, auto-complete, daily plans

---

## System Components

### Frontend Components

1. **Client Application** (`client/`)
   - React SPA with routing
   - Component library (atoms, molecules, organisms, features)
   - State management (React Query + Context)
   - API client layer

2. **Hooks System** (`client/hooks/`)
   - Query hooks (data fetching)
   - Mutation hooks (data updates)
   - State hooks (filters, forms)
   - Utility hooks (pagination, mobile layout)

3. **API Client** (`client/lib/api/`)
   - Core client (axios with interceptors)
   - Endpoint definitions (29 API modules)
   - Error handling
   - Type-safe requests/responses

### Backend Components

1. **Feature Registry** (`server/features/`)
   - 39 feature modules
   - Standardized structure (routes, services, repositories, types)
   - Modular routing

2. **Middleware Stack** (`server/middleware/`)
   - Authentication & authorization
   - Input validation & sanitization
   - File upload handling
   - Rate limiting
   - Error handling
   - CORS configuration

3. **AI Services** (`server/services/ai-adapters/`)
   - OpenAI adapter (GPT models)
   - Gemini adapter (Google AI)
   - Ollama adapter (local LLM)
   - Provider switching logic

4. **Background Schedulers** (`server/scripts/schedulers/`)
   - Analytics cache refresh (10 min)
   - Auto-complete sessions (hourly)
   - Daily action plans (09:00)

### Data Layer

1. **Database** (`database.db`)
   - 40+ tables
   - Normalized schema
   - WAL mode for performance
   - Auto-vacuum enabled

2. **Repositories** (`server/repositories/` + `server/features/*/repository/`)
   - Data access abstraction
   - Prepared statements
   - Transaction support

---

## Data Flow

### Standard Request Flow

```
1. User Action (UI)
   ↓
2. React Component Event Handler
   ↓
3. React Query Hook (useMutation/useQuery)
   ↓
4. API Client (axios)
   ↓
5. Express Route Handler
   ↓
6. Middleware (auth, validation, sanitization)
   ↓
7. Service Layer (business logic)
   ↓
8. Repository Layer (database query)
   ↓
9. Database (SQLite)
   ↓
10. Response (JSON)
   ↓
11. React Query Cache Update
   ↓
12. UI Re-render
```

### AI-Powered Flow

```
1. User triggers AI action
   ↓
2. Frontend sends request to AI endpoint
   ↓
3. Backend sanitizes AI prompt (injection prevention)
   ↓
4. AI Adapter selects provider (OpenAI/Gemini/Ollama)
   ↓
5. External AI API call
   ↓
6. Response parsed and validated
   ↓
7. AI suggestion saved to database (approval queue)
   ↓
8. Frontend displays suggestion for user approval
   ↓
9. User approves → Data updated in database
```

---

## Deployment Architecture

### Development Environment

```
Vite Dev Server (Port 5000)
  ├── Frontend: http://localhost:5000
  └── Backend: http://localhost:5000/api (proxied)

Database: ./database.db (local file)
```

### Production Environment (Replit VM)

```
Node.js Server (Port 3000)
  ├── Static Files: /dist/client/*
  ├── API: /api/*
  └── SPA Fallback: index.html

Database: ./database.db (persistent volume)
Backups: ./backups/ (automated daily)
```

**Build Process:**
1. `npm run build:client` → Vite bundles React app to `dist/client/`
2. `npm run build:server` → Vite bundles Express server to `dist/server/`
3. `npm start` → Runs production server from `dist/server/node-build.mjs`

---

## Scalability & Performance

### Current Optimizations

1. **Database Performance**
   - SQLite WAL mode (concurrent reads)
   - Indexed columns (frequent queries)
   - Analytics caching (10-minute TTL)

2. **Frontend Performance**
   - Route-based code splitting
   - React Query intelligent caching
   - Virtual scrolling for large lists
   - Lazy component loading
   - Debounced search/filter inputs

3. **API Performance**
   - Rate limiting (prevent abuse)
   - Efficient SQL queries (prepared statements)
   - Background job offloading

### Future Scalability Options

**When user base grows beyond SQLite's limits (10,000+ concurrent users):**

1. **Database Migration**: PostgreSQL or MySQL
2. **Caching Layer**: Redis for session/analytics
3. **Load Balancing**: Horizontal scaling with multiple servers
4. **CDN**: Static asset distribution
5. **Message Queue**: RabbitMQ/Bull for background jobs
6. **Microservices**: Split large features into separate services

**Current Design Supports:**
- Up to 1,000 concurrent users (tested)
- 50,000+ students per database
- 1M+ records (exams, sessions, surveys)
- Sub-second API response times

---

## Security Architecture

### Defense in Depth

```
Layer 1: Client-side validation (Zod schemas)
Layer 2: API input sanitization (XSS, SQL injection, AI prompt injection)
Layer 3: File upload validation (MIME, size, malware detection)
Layer 4: Authentication & Authorization (session-based, RBAC)
Layer 5: Database protection (prepared statements, transactions)
Layer 6: Backup encryption (AES-256)
```

See [Security Tests Documentation](../SECURITY_TESTS.md) for detailed security measures.

---

## Related Documentation

- [Backend Architecture](./backend.md)
- [Frontend Architecture](./frontend.md)
- [Database Architecture](./database.md)
- [API Documentation](../api/)
- [Development Guide](../guides/development.md)
- [Deployment Guide](../guides/deployment.md)

---

**Last Updated:** October 29, 2025  
**Version:** 2.0.0  
**Maintained by:** Rehber360 Development Team
