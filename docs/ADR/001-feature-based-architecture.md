# ADR-001: Feature-Based Backend Architecture

## Status

**Accepted** - October 2025

## Context

The Rehber360 backend initially followed a traditional layered architecture with separate controllers/, services/, and models/ directories. As the application grew to 39 feature modules, this structure became difficult to maintain:

- **Scalability Issues**: Finding feature-specific code required searching across multiple directories
- **Code Navigation**: Developers had to jump between 3-4 directories to understand a single feature
- **Team Ownership**: Unclear ownership boundaries for features
- **Onboarding Difficulty**: New developers struggled to understand the codebase structure
- **Merge Conflicts**: Multiple teams working on different features often touched the same files

## Decision

**Adopt feature-based modular architecture** where each feature is self-contained with its own routes, services, repositories, and types.

### Structure

```
server/features/<feature-name>/
├── routes/              # API endpoint handlers
├── services/            # Business logic layer
├── repository/          # Data access layer
├── types/               # Feature-specific types
└── index.ts             # Feature router export
```

### Principles

1. **Self-Contained Features**: Each feature module contains all code related to that feature
2. **Consistent Structure**: All features follow the same three-layer pattern (routes → services → repositories)
3. **Clear Boundaries**: Features don't directly import from other features (use shared services if needed)
4. **Independent Testing**: Each feature can be tested in isolation

### Example

```typescript
// server/features/students/index.ts
import { Router } from 'express';
import { getStudentsHandler, createStudentHandler } from './routes/students.routes';
import { requireAuth } from '../../middleware/auth.middleware';

const studentsRouter = Router();
studentsRouter.use(requireAuth);
studentsRouter.get('/', getStudentsHandler);
studentsRouter.post('/', createStudentHandler);

export default studentsRouter;

// server/features/index.ts (registry)
import studentsRouter from './students';
import surveysRouter from './surveys';
// ... 37 more imports

featureRegistry.use('/students', studentsRouter);
featureRegistry.use('/surveys', surveysRouter);
// ... 37 more registrations
```

## Consequences

### Positive

✅ **Improved Code Organization**: Feature-specific code is colocated, making it easy to find
✅ **Better Scalability**: Adding new features doesn't require modifying existing directory structure
✅ **Clearer Ownership**: Teams can own specific feature modules
✅ **Easier Onboarding**: New developers can understand one feature at a time
✅ **Reduced Merge Conflicts**: Features are isolated, reducing cross-team conflicts
✅ **Simplified Testing**: Features can be tested independently
✅ **Feature Reusability**: Features can be extracted into separate microservices if needed

### Negative

⚠️ **Code Duplication**: Some shared logic might be duplicated across features (mitigated by shared services)
⚠️ **Directory Depth**: More nested directories (acceptable trade-off)
⚠️ **Migration Effort**: Required significant refactoring from old structure (one-time cost)

### Neutral

- **Learning Curve**: Developers familiar with traditional layered architecture need to adapt
- **Tooling**: IDE indexing may take longer with more directories (negligible impact)

## Alternatives Considered

### 1. Traditional Layered Architecture

```
server/
├── controllers/
├── services/
├── repositories/
└── models/
```

**Rejected because:**
- Poor scalability as feature count grows
- Difficult to locate feature-specific code
- High merge conflict rate
- Unclear ownership boundaries

### 2. Domain-Driven Design (DDD)

```
server/
├── domain/
│   ├── students/
│   ├── counseling/
│   └── ...
├── application/
└── infrastructure/
```

**Rejected because:**
- Overly complex for our use case
- Higher learning curve
- More boilerplate code
- Better suited for larger enterprise applications

### 3. Microservices

Separate services for each feature module.

**Rejected because:**
- Unnecessary complexity for current scale
- Infrastructure overhead
- Network latency between services
- Harder to maintain for small team
- SQLite database doesn't support distributed transactions

**Future Consideration**: If the application scales beyond 10,000+ concurrent users, feature modules can be extracted into microservices without major refactoring.

## References

- **FAZ 2 Modernization Plan** (dosya.md): Task 2.1 - API Route Refactoring
- **Backend Architecture Documentation**: docs/architecture/backend.md
- **Feature Registry**: server/features/README.md

## Implementation Notes

- **Migration completed**: October 2025
- **Total features**: 39 modules
- **Lines of code refactored**: ~15,000
- **Breaking changes**: None (API endpoints unchanged)
- **Test coverage maintained**: 82%

## Decision Makers

- **Proposed by**: Development Team Lead
- **Approved by**: Architecture Review Board
- **Implemented by**: Backend Team

---

**Last Updated:** October 29, 2025  
**Supersedes:** N/A (initial architectural decision)  
**Superseded by:** N/A
