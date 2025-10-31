# ADR-005: Atomic Design Pattern for Frontend Components

## Status

**Accepted** - October 2025

## Context

Rehber360 frontend initially had components scattered across different directories with no clear organization:

```
components/
├── StudentCard.tsx
├── ExamTable.tsx
├── Button.tsx
├── DashboardStats.tsx
├── FilterPanel.tsx
├── ... (150+ components, no structure)
```

**Problems:**
- **Inconsistency**: Multiple button implementations, duplicated code
- **Scalability**: Hard to find components as codebase grew
- **Reusability**: Unclear which components are reusable
- **Naming Conflicts**: Similar component names causing confusion
- **Onboarding**: New developers struggled to understand component hierarchy
- **Testing**: Unclear what level of testing each component needed

## Decision

**Adopt Atomic Design pattern** for organizing UI components into a clear hierarchy:

```
Atoms → Molecules → Organisms → Features/Pages
```

### Directory Structure

```
client/components/
├── atoms/           # Basic UI elements (Button, Input, Badge)
│   ├── Button/
│   │   ├── button.tsx
│   │   └── index.ts
│   ├── Input/
│   └── ... (19 atoms)
│
├── molecules/       # Simple combinations (StatCard, SearchBar)
│   ├── StatCard/
│   ├── PageHeader/
│   └── ... (11 molecules)
│
├── organisms/       # Complex components (Table, Dialog, Form)
│   ├── Dialog/
│   ├── Table/
│   └── ... (24 organisms)
│
└── features/        # Feature-specific components
    ├── students/
    │   ├── StudentCard.tsx
    │   ├── StudentTable.tsx
    │   └── StudentFilters.tsx
    └── ... (18 feature folders)
```

### Principles

1. **Atoms**: Basic building blocks (Button, Input, Badge)
   - No dependencies on other components
   - Highly reusable
   - Controlled through props
   - Use CVA for variants

2. **Molecules**: Simple combinations of atoms (StatCard, SearchBar)
   - Compose 2-3 atoms
   - Single responsibility
   - Still reusable across features

3. **Organisms**: Complex components (Table, Dialog, Form)
   - Compose molecules and atoms
   - Can be stateful
   - Feature-agnostic

4. **Features**: Feature-specific components (StudentCard, ExamTable)
   - Business logic tied to feature
   - Not intended for reuse across features
   - Can import from all levels

### Example Hierarchy

```tsx
// Atom: Button
<Button variant="primary" size="md">Click Me</Button>

// Molecule: StatCard (uses Button + Badge atoms)
<StatCard label="Students" value={850} trend={5} />

// Organism: Table (uses many atoms/molecules)
<Table data={students} columns={columns} onRowClick={handleClick} />

// Feature: StudentTable (uses Table organism + student-specific logic)
<StudentTable 
  students={students} 
  onViewProfile={handleView}
  onEdit={handleEdit}
/>
```

## Consequences

### Positive

✅ **Clear Hierarchy**: Easy to understand component relationships  
✅ **Reusability**: Atoms/molecules reused across features  
✅ **Consistency**: Single source of truth for UI elements  
✅ **Scalability**: Structure scales with component count  
✅ **Testability**: Clear testing strategy per level  
✅ **Discoverability**: Easy to find components  
✅ **Reduced Duplication**: ~40% reduction in duplicate code  
✅ **Better Naming**: Component name + location clarifies purpose  
✅ **Easier Refactoring**: Impact analysis clear from hierarchy  

### Negative

⚠️ **Learning Curve**: Team needs to understand atomic design  
⚠️ **Directory Depth**: More nested folders  
⚠️ **Classification Decisions**: Sometimes unclear what level a component belongs to  

### Neutral

- **Storybook**: Natural fit for atomic design (atoms → molecules → organisms)
- **Design System**: Foundation for future design system

## Alternatives Considered

### 1. Flat Structure

```
components/
├── Button.tsx
├── StudentCard.tsx
├── ExamTable.tsx
└── ... (150+ files)
```

**Pros:**
- Simple
- No hierarchy to learn

**Cons:**
- Doesn't scale
- Hard to find components
- No clear reusability boundaries
- Naming conflicts

**Verdict:** **Rejected** - Poor scalability.

### 2. Feature-Based Only

```
components/
├── students/
│   ├── Button.tsx
│   ├── StudentCard.tsx
│   └── StudentTable.tsx
├── exams/
│   ├── Button.tsx  (duplicate!)
│   ├── ExamCard.tsx
│   └── ExamTable.tsx
```

**Pros:**
- Colocates feature components

**Cons:**
- Duplicate atoms/molecules
- No shared component library
- Inconsistent UI
- Larger bundle size

**Verdict:** **Rejected** - Too much duplication.

### 3. Material-UI Structure

```
components/
├── inputs/
├── navigation/
├── surfaces/
├── data-display/
└── feedback/
```

**Pros:**
- Logical grouping by function

**Cons:**
- Unclear hierarchy
- Component classification ambiguous
- Not as intuitive as atomic design

**Verdict:** **Rejected** - Atomic design clearer.

### 4. BEM + Utility

```
components/
├── ui/          # Reusable UI
└── domain/      # Domain-specific
```

**Pros:**
- Simple two-tier structure

**Cons:**
- Still unclear what goes in "ui" vs "domain"
- No clear hierarchy for reusability
- Less granular than atomic design

**Verdict:** **Rejected** - Not granular enough.

## Component Classification Guide

### How to classify a component:

```
Is it a basic HTML element wrapper?
  YES → Atom (Button, Input, Badge)
  NO ↓

Does it compose 2-3 atoms?
  YES → Molecule (StatCard, SearchBar)
  NO ↓

Is it complex but feature-agnostic?
  YES → Organism (Table, Dialog, Form)
  NO ↓

Is it tied to a specific feature?
  YES → Feature component (StudentCard, ExamTable)
```

### Examples

| Component | Level | Reasoning |
|-----------|-------|-----------|
| Button | Atom | Basic HTML button wrapper |
| Input | Atom | Basic HTML input wrapper |
| StatCard | Molecule | Combines Badge + Text atoms |
| SearchBar | Molecule | Combines Input + Button atoms |
| Table | Organism | Complex, reusable across features |
| Dialog | Organism | Complex, feature-agnostic |
| StudentCard | Feature | Student-specific business logic |
| ExamTable | Feature | Exam-specific formatting |

## Radix UI Integration

Radix UI primitives fit naturally into atomic design:

```
Radix Primitives → Atoms
  ├── DialogPrimitive → Dialog (Organism)
  ├── ButtonPrimitive → Button (Atom)
  └── InputPrimitive → Input (Atom)
```

**Example:**

```tsx
// atoms/Button/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} />;
}
```

## Migration Impact

### Before Atomic Design

```
components/ (flat)
├── 150+ files (no organization)
├── Duplicate buttons/inputs
├── Inconsistent styling
└── Hard to find components
```

### After Atomic Design

```
components/
├── atoms/ (19 reusable)
├── molecules/ (11 reusable)
├── organisms/ (24 reusable)
└── features/ (18 domain-specific)

Total: 54 unique components
Reduction: ~64% (eliminated duplicates)
```

### Code Reusability

**Before:** 30% of components reused  
**After:** 85% of atoms/molecules/organisms reused  

**Example:**
- Button atom: Used in 120+ places
- StatCard molecule: Used in 15+ dashboards
- Table organism: Used in 8+ features

## Testing Strategy by Level

### Atoms

```typescript
// Visual regression tests
// Prop combination tests
describe('Button', () => {
  it('renders all variants', () => {
    render(<Button variant="primary">Click</Button>);
    render(<Button variant="secondary">Click</Button>);
    // ...
  });
});
```

### Molecules

```typescript
// Integration tests (atoms work together)
describe('StatCard', () => {
  it('displays stat with trend', () => {
    render(<StatCard label="Students" value={850} trend={5} />);
    expect(screen.getByText('850')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});
```

### Organisms

```typescript
// Complex interaction tests
describe('Table', () => {
  it('sorts data when column clicked', () => {
    render(<Table data={mockData} columns={columns} />);
    fireEvent.click(screen.getByText('Name'));
    // Assert sorted order
  });
});
```

### Features

```typescript
// Feature-specific business logic tests
describe('StudentTable', () => {
  it('shows risk badge for high-risk students', () => {
    render(<StudentTable students={studentsWithHighRisk} />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });
});
```

## Shadcn/UI Integration

Shadcn components map to atomic design:

```
Shadcn Component → Our Component Level
├── button.tsx → atoms/Button
├── input.tsx → atoms/Input
├── card.tsx → atoms/Card
├── dialog.tsx → organisms/Dialog
└── table.tsx → organisms/Table
```

**Copy, don't install:**
```bash
# Shadcn CLI copies component to our codebase
npx shadcn-ui add button

# Places in: client/components/atoms/Button/
```

## Storybook (Future)

Atomic design enables Storybook organization:

```
Storybook
├── Atoms
│   ├── Button
│   ├── Input
│   └── Badge
├── Molecules
│   ├── StatCard
│   └── SearchBar
├── Organisms
│   ├── Table
│   └── Dialog
└── Features
    ├── Students
    └── Exams
```

## Performance Benefits

### Bundle Size

**Before:** 450kb (many duplicates)  
**After:** 280kb (deduplicated)  
**Reduction:** 38%  

### Tree Shaking

Atomic design enables better tree shaking:

```tsx
// Only import what you need
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

// No longer importing entire component library
```

## References

- **Atomic Design Methodology**: https://atomicdesign.bradfrost.com/
- **Frontend Architecture**: docs/architecture/frontend.md
- **Component Guidelines**: client/components/README.md
- **FAZ 1 Modernization**: dosya.md (Task 1.3 - Atomic Design Implementation)

---

**Last Updated:** October 29, 2025  
**Next Review:** N/A (stable pattern)  
**Supersedes:** Flat component structure  
**Superseded by:** N/A
