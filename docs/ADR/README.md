# Architectural Decision Records (ADR)

This directory contains architectural decision records for Rehber360, documenting significant technical decisions made during development.

## What is an ADR?

An Architectural Decision Record (ADR) captures an important architectural decision made along with its context and consequences. It helps teams understand:

- **What** decision was made
- **Why** it was made
- **When** it was made
- **What alternatives** were considered
- **What consequences** (positive and negative) resulted

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](./001-feature-based-architecture.md) | Feature-Based Backend Architecture | Accepted | October 2025 |
| [002](./002-sqlite-database-choice.md) | SQLite as Primary Database | Accepted | September 2024 |
| [003](./003-session-based-authentication.md) | Session-Based Authentication over JWT | Accepted | September 2024 |
| [004](./004-react-query-state-management.md) | React Query for Server State Management | Accepted | September 2024 |
| [005](./005-atomic-design-pattern.md) | Atomic Design Pattern for Frontend Components | Accepted | October 2025 |

## ADR Template

When creating a new ADR, use this template:

```markdown
# ADR-XXX: [Title]

## Status
Accepted / Proposed / Deprecated / Superseded by ADR-YYY

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- ✅ Benefit 1
- ✅ Benefit 2

### Negative
- ⚠️ Trade-off 1
- ⚠️ Trade-off 2

## Alternatives Considered
What other options did we consider?

## References
- Links to relevant documentation
- Related ADRs

---
**Last Updated:** [Date]
**Supersedes:** [Previous ADR if any]
**Superseded by:** [Future ADR if deprecated]
```

## Key Decisions

### Backend Architecture

- **[ADR-001](./001-feature-based-architecture.md)**: Feature-based modular architecture for better scalability and maintainability
- **[ADR-002](./002-sqlite-database-choice.md)**: SQLite chosen for simplicity, performance, and portability
- **[ADR-003](./003-session-based-authentication.md)**: Session-based auth for better security and server-side control

### Frontend Architecture

- **[ADR-004](./004-react-query-state-management.md)**: React Query for efficient server state management and caching
- **[ADR-005](./005-atomic-design-pattern.md)**: Atomic design pattern for component organization and reusability

## Contributing

When making significant architectural decisions:

1. Create a new ADR using the template
2. Number it sequentially (ADR-006, ADR-007, etc.)
3. Discuss with the team
4. Update this README index
5. Reference the ADR in related documentation

## ADR Lifecycle

- **Proposed**: Under discussion, not yet implemented
- **Accepted**: Approved and implemented
- **Deprecated**: No longer recommended but still in use
- **Superseded**: Replaced by a newer ADR

---

**Last Updated:** October 29, 2025  
**Maintained by:** Architecture Team
