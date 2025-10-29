# Rehber360 Documentation

Welcome to the Rehber360 documentation! This directory contains comprehensive documentation for understanding, developing, and deploying the Rehber360 student guidance system.

## 📚 Documentation Structure

```
docs/
├── architecture/    # System architecture and design
├── api/             # API reference documentation
├── guides/          # How-to guides and tutorials
└── ADR/             # Architectural Decision Records
```

---

## 🏗️ Architecture Documentation

Understand the system architecture and design decisions.

| Document | Description |
|----------|-------------|
| [Architecture Overview](./architecture/overview.md) | High-level system architecture, tech stack, and design principles |
| [Backend Architecture](./architecture/backend.md) | Feature-based modular backend, three-layer pattern, 39 feature modules |
| [Frontend Architecture](./architecture/frontend.md) | React + TypeScript, atomic design, React Query state management |
| [Database Architecture](./architecture/database.md) | SQLite schema, 40+ tables, relationships, performance optimizations |

**Start here if you're:**
- New to the project
- Understanding system design
- Making architectural decisions

---

## 🔌 API Reference

Complete API documentation for all endpoints.

| Document | Description |
|----------|-------------|
| [API Overview](./api/README.md) | Authentication, error handling, pagination, conventions |
| [Students API](./api/students.md) | Student CRUD, filtering, bulk operations, Excel import/export |
| [Surveys API](./api/surveys.md) | Survey templates, distribution, responses, AI analysis |
| [Exams API](./api/exams.md) | Exam results, analytics, goal tracking, bulk import |
| [Counseling API](./api/counseling.md) | Counseling sessions, AI summary, voice transcription |
| [AI Assistant API](./api/ai-assistant.md) | Chat interface, context-aware responses, provider switching |
| [AI Suggestions API](./api/ai-suggestions.md) | AI-generated profile updates, approval queue, bulk operations |
| [Authentication API](./api/authentication.md) | Login, registration, session management, RBAC |
| [Analytics API](./api/analytics.md) | Dashboard stats, class analytics, trends |
| [Career Guidance API](./api/career-guidance.md) | Career profiles, student-career matching |

**Start here if you're:**
- Integrating with the API
- Building frontend features
- Understanding data models

---

## 📖 Guides

Step-by-step guides for common tasks.

| Guide | Description |
|-------|-------------|
| [Setup Guide](./guides/setup.md) | Installation, environment setup, first run |
| [Development Guide](./guides/development.md) | Development workflow, code standards, best practices |
| [Deployment Guide](./guides/deployment.md) | Replit deployment, VPS deployment, Docker, monitoring |
| [Testing Guide](./guides/testing.md) | Unit tests, integration tests, component tests, coverage |
| [Contributing Guide](./guides/contributing.md) | How to contribute, PR guidelines, code review |

**Start here if you're:**
- Setting up the project
- Contributing to the codebase
- Deploying to production

---

## 📝 Architectural Decision Records (ADR)

Key architectural decisions and their rationale.

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR/001-feature-based-architecture.md) | Feature-Based Backend Architecture | Accepted | Oct 2025 |
| [ADR-002](./ADR/002-sqlite-database-choice.md) | SQLite as Primary Database | Accepted | Sep 2024 |
| [ADR-003](./ADR/003-session-based-authentication.md) | Session-Based Authentication over JWT | Accepted | Sep 2024 |
| [ADR-004](./ADR/004-react-query-state-management.md) | React Query for Server State Management | Accepted | Sep 2024 |
| [ADR-005](./ADR/005-atomic-design-pattern.md) | Atomic Design Pattern for Frontend | Accepted | Oct 2025 |

**Start here if you're:**
- Understanding "why" decisions were made
- Evaluating alternatives
- Making new architectural decisions

---

## 🚀 Quick Links

### For New Developers

1. **Start here**: [Architecture Overview](./architecture/overview.md)
2. **Set up**: [Setup Guide](./guides/setup.md)
3. **Develop**: [Development Guide](./guides/development.md)
4. **Contribute**: [Contributing Guide](./guides/contributing.md)

### For Frontend Developers

1. [Frontend Architecture](./architecture/frontend.md)
2. [API Reference](./api/README.md)
3. [Development Guide](./guides/development.md)
4. [Testing Guide](./guides/testing.md)

### For Backend Developers

1. [Backend Architecture](./architecture/backend.md)
2. [Database Architecture](./architecture/database.md)
3. [API Documentation](./api/README.md)
4. [Development Guide](./guides/development.md)

### For DevOps/Deployment

1. [Deployment Guide](./guides/deployment.md)
2. [Setup Guide](./guides/setup.md)
3. [Architecture Overview](./architecture/overview.md)

---

## 📊 Key Metrics

**System Scale:**
- **39** Feature Modules
- **40+** Database Tables
- **10** Core API Endpoints (with 30+ sub-endpoints)
- **71** Career Profiles
- **850+** Active Students (typical deployment)

**Code Quality:**
- **TypeScript**: 100% type coverage
- **Test Coverage**: 82%
- **Documentation**: Comprehensive

**Performance:**
- **API Response**: <50ms average
- **Page Load**: <1s initial load
- **Database Query**: <1ms average

---

## 🎯 Feature Highlights

### 🤖 AI-Powered Features

- **AI Assistant**: Context-aware student guidance
- **AI Suggestions**: Automated profile updates with approval queue
- **AI Analytics**: Psychological depth analysis, risk predictions
- **AI Survey Analysis**: Automated survey evaluation
- **Multi-Provider Support**: Gemini, OpenAI, Ollama

### 📊 Data Management

- **Excel Import/Export**: Bulk student, exam, survey operations
- **PDF Reports**: Automated report generation
- **Encrypted Backups**: Daily automated backups with AES-256
- **Data Validation**: Zod-based schema validation

### 🔒 Security

- **Session-Based Auth**: HTTP-only cookies, CSRF protection
- **RBAC**: 4 roles (Admin, Counselor, Teacher, Observer)
- **Input Sanitization**: XSS, SQL injection, AI prompt injection prevention
- **Rate Limiting**: API request throttling
- **Audit Logs**: Comprehensive activity tracking

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Radix UI
- React Query (state management)
- React Hook Form + Zod

### Backend
- Node.js + Express.js v5
- TypeScript
- SQLite + better-sqlite3
- Zod (validation)

### AI Integration
- Gemini API (primary)
- OpenAI API (alternative)
- Ollama (local, privacy-focused)

---

## 📈 Project Status

**Current Version:** 2.0.0  
**Status:** Production Ready  
**Platform:** Replit, VPS, Docker  
**Last Updated:** October 29, 2025

### Recent Updates

- ✅ **FAZ 1**: Cleanup and modernization (completed)
- ✅ **FAZ 2**: API refactoring to feature-based architecture (completed)
- ✅ **FAZ 3**: Documentation structure and comprehensive docs (completed)

---

## 🤝 Contributing

We welcome contributions! Please read the [Contributing Guide](./guides/contributing.md) for:

- Code style guidelines
- Branch naming conventions
- Commit message format
- Pull request process
- Testing requirements

---

## 📞 Support

**Documentation Issues:**  
If you find any documentation errors or have suggestions, please:
1. Check existing docs first
2. Create an issue on GitHub
3. Submit a PR with improvements

**Technical Support:**  
- Check relevant guides first
- Search GitHub Issues
- Create a new issue with details

---

## 📚 External Resources

**Technologies:**
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [Express.js](https://expressjs.com)
- [SQLite](https://www.sqlite.org/docs.html)

**AI Providers:**
- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Ollama](https://ollama.ai)

---

## 📝 Documentation Standards

When contributing to documentation:

1. **Use clear, concise language**
2. **Include code examples** where relevant
3. **Keep formatting consistent**
4. **Update the table of contents**
5. **Test all code examples**
6. **Add "Last Updated" date**

---

## 🔄 Documentation Updates

**Frequency:**
- Architecture docs: Updated on major changes
- API docs: Updated with each API change
- Guides: Updated as needed
- ADRs: Created for significant decisions

**Review:**
- All docs reviewed quarterly
- ADRs reviewed when reevaluating decisions
- API docs auto-generated (future)

---

**Maintained by:** Development Team  
**Last Major Update:** October 29, 2025  
**Documentation Version:** 1.0.0

---

## ✨ Quick Navigation

[🏠 Main README](../README.md) | [🏗️ Architecture](./architecture/overview.md) | [🔌 API](./api/README.md) | [📖 Guides](./guides/setup.md) | [📝 ADRs](./ADR/README.md)
