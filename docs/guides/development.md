# Development Guide

Best practices and workflows for developing Rehber360.

## 🎯 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run dev

# 4. Make changes (code, test, commit)

# 5. Run quality checks before commit
npm run quality
```

---

## 🏗️ Project Structure

```
rehber360/
├── client/              # Frontend (React + TypeScript)
│   ├── components/      # UI components (atomic design)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API client, utilities
│   ├── pages/           # Page components
│   └── services/        # Business logic
│
├── server/              # Backend (Express + TypeScript)
│   ├── features/        # 39 feature modules
│   ├── middleware/      # Express middleware
│   ├── services/        # Shared services (AI, encryption)
│   ├── lib/             # Database, utilities
│   └── index.ts         # Server entry point
│
├── shared/              # Shared types (client + server)
│   └── types/           # TypeScript definitions
│
├── __tests__/           # Test files
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
│
└── docs/                # Documentation
    ├── architecture/    # Architecture docs
    ├── api/             # API reference
    └── guides/          # User guides
```

---

## 🧩 Component Development

### Atomic Design Pattern

Follow the atomic design hierarchy:

```
Atoms → Molecules → Organisms → Features/Pages
```

**Example: Creating a new component**

```tsx
// 1. Create atom (client/components/atoms/Badge/badge.tsx)
export function Badge({ children, variant }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }))}>{children}</span>;
}

// 2. Create molecule (client/components/molecules/StatCard/stat-card.tsx)
export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card>
      <Badge variant={trend > 0 ? 'success' : 'danger'}>{value}</Badge>
      <span>{label}</span>
    </Card>
  );
}

// 3. Use in organism/feature (client/components/features/dashboard/DashboardStats.tsx)
export function DashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Students" value={850} trend={5} />
      <StatCard label="High Risk" value={23} trend={-2} />
    </div>
  );
}
```

---

## 🔌 API Development

### Creating a New Feature

Follow the **three-layer pattern**:

```
Routes → Services → Repositories
```

**Example: Creating a new "Attendance" feature**

```typescript
// 1. Repository (server/features/attendance/repository/attendance.repository.ts)
export function findAttendance(studentId: number, date: string) {
  return db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date = ?')
    .get(studentId, date);
}

// 2. Service (server/features/attendance/services/attendance.service.ts)
export async function getStudentAttendance(studentId: number, date: string) {
  const sanitized = sanitizeObject({ studentId, date });
  return attendanceRepo.findAttendance(sanitized.studentId, sanitized.date);
}

// 3. Routes (server/features/attendance/routes/attendance.routes.ts)
export async function getAttendanceHandler(req: Request, res: Response) {
  try {
    const { studentId, date } = req.query;
    const attendance = await attendanceService.getStudentAttendance(+studentId, date);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
}

// 4. Register feature (server/features/attendance/index.ts)
const attendanceRouter = Router();
attendanceRouter.get('/', requireAuth, getAttendanceHandler);
export default attendanceRouter;

// 5. Add to registry (server/features/index.ts)
featureRegistry.use('/attendance', attendanceRouter);
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

```tsx
// ✅ GOOD: Use utility classes with cn() helper
<div className={cn('bg-white p-4 rounded-lg', isActive && 'border-2 border-primary')} />

// ❌ BAD: Inline styles
<div style={{ backgroundColor: 'white', padding: '1rem' }} />

// ✅ GOOD: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" />

// ✅ GOOD: Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
```

### Component Variants (CVA)

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva('px-4 py-2 rounded-md', {
  variants: {
    variant: {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      outline: 'border border-input'
    },
    size: {
      sm: 'text-sm h-9',
      md: 'text-base h-10',
      lg: 'text-lg h-11'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});
```

---

## 🧪 Testing

### Writing Tests

```typescript
// Unit test example
describe('sanitizeString', () => {
  it('removes script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const output = sanitizeString(input);
    expect(output).not.toContain('<script>');
  });
});

// Integration test example
describe('GET /api/students', () => {
  it('returns student list', async () => {
    const response = await request(app)
      .get('/api/students')
      .set('Cookie', sessionCookie);
    
    expect(response.status).toBe(200);
    expect(response.body.students).toBeInstanceOf(Array);
  });
});

// Component test example
describe('StudentCard', () => {
  it('renders student name', () => {
    render(<StudentCard student={mockStudent} />);
    expect(screen.getByText('Ali Yılmaz')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **Component Tests**: Critical UI components

---

## 🔒 Security Practices

### Input Sanitization

**Always sanitize user input:**

```typescript
import { sanitizeObject } from '@/utils/sanitization';

// In service layer
export function createStudent(data: any) {
  const sanitized = sanitizeObject(data);
  return studentRepo.create(sanitized);
}
```

### SQL Injection Prevention

**Always use prepared statements:**

```typescript
// ✅ GOOD: Prepared statement
const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
const student = stmt.get(studentId);

// ❌ BAD: String interpolation
const student = db.prepare(`SELECT * FROM students WHERE id = ${studentId}`).get();
```

### AI Prompt Injection Prevention

```typescript
import { sanitizeAIPrompt } from '@/utils/sanitization';

const userPrompt = sanitizeAIPrompt(req.body.message);
const response = await aiService.generateResponse(userPrompt);
```

---

## 📊 Performance Best Practices

### React Performance

```tsx
// ✅ Memoize expensive calculations
const sortedStudents = useMemo(
  () => students.sort((a, b) => a.name.localeCompare(b.name)),
  [students]
);

// ✅ Debounce search inputs
const debouncedSearch = useMemo(
  () => debounce((term: string) => refetch({ searchTerm: term }), 300),
  [refetch]
);

// ✅ Virtual scrolling for large lists
<VirtualList items={students} itemHeight={80} />
```

### Database Performance

```typescript
// ✅ Use indexes for frequent queries
CREATE INDEX idx_students_class_level ON students(class_level);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);

// ✅ Batch operations
const stmt = db.prepare('INSERT INTO students (...) VALUES (...)');
const insertMany = db.transaction((students) => {
  for (const student of students) stmt.run(student);
});
insertMany(studentsArray);
```

---

## 🔄 State Management

### React Query Patterns

```typescript
// Query hook
export function useStudents(filters?: any) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => getStudents(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

// Mutation with optimistic updates
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateStudent,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['students', newData.id] });
      const previous = queryClient.getQueryData(['students', newData.id]);
      queryClient.setQueryData(['students', newData.id], newData);
      return { previous };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['students', newData.id], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
}
```

---

## 🐛 Debugging

### Enable Debug Logs

```env
NODE_ENV=development
DEBUG=rehber:*
```

### Chrome DevTools

1. Open DevTools (F12)
2. Check **Console** for errors
3. Use **Network** tab for API debugging
4. Use **React DevTools** extension

### Server Debugging

```bash
# VSCode launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/server/index.ts",
  "env": { "NODE_ENV": "development" }
}
```

---

## 📝 Code Style

### TypeScript

```typescript
// ✅ Use explicit types for function parameters
function calculateNet(correct: number, wrong: number): number {
  return correct - (wrong / 4);
}

// ✅ Use type inference for local variables
const student = getStudent(1);  // Type inferred

// ✅ Use interfaces for objects
interface Student {
  id: number;
  name: string;
  class_level: string;
}

// ✅ Avoid 'any', use 'unknown' if needed
function parseJSON(input: string): unknown {
  return JSON.parse(input);
}
```

### Naming Conventions

- **Components**: PascalCase (`StudentCard`)
- **Files**: kebab-case (`student-card.tsx`)
- **Functions**: camelCase (`getStudents`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`StudentFilters`)

---

## 🔧 Git Workflow

### Branch Naming

- `feature/student-import` - New features
- `fix/exam-calculation-bug` - Bug fixes
- `refactor/api-structure` - Code refactoring
- `docs/api-documentation` - Documentation updates

### Commit Messages

Follow conventional commits:

```
feat: add bulk student import
fix: correct exam net calculation
refactor: migrate to feature-based structure
docs: update API documentation
test: add counseling session tests
```

### Before Committing

```bash
# Run quality checks
npm run quality

# This runs:
# - TypeScript type checking
# - ESLint
# - Prettier
# - Tests
```

---

**Related Documentation:**
- [Setup Guide](./setup.md)
- [Testing Guide](./testing.md)
- [Contributing Guide](./contributing.md)

**Last Updated:** October 29, 2025
