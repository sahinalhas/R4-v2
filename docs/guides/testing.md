# Testing Guide

Comprehensive testing strategy and guidelines for Rehber360.

## 📋 Testing Philosophy

Rehber360 follows a **test pyramid approach**:

```
       /\
      /E2E\         ← Few, high-value integration tests
     /______\
    /        \
   /Integration\   ← API endpoint tests
  /______________\
 /                \
/   Unit Tests     \  ← Many, fast, isolated tests
/____________________\
```

---

## 🧪 Test Stack

- **Test Runner**: Vitest (fast, Vite-native)
- **Component Testing**: Testing Library
- **API Testing**: Supertest
- **Coverage**: vitest/coverage-v8
- **Mocking**: Mock Service Worker (MSW)

---

## 🚀 Running Tests

### Quick Start

```bash
# All tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage

# Only unit tests
npm run test:unit

# Only integration tests
npm run test:integration
```

### Coverage Reports

After running `npm run test:coverage`:

```bash
# View HTML report
open coverage/index.html

# Console summary shows:
# - % Statements covered
# - % Branches covered
# - % Functions covered
# - % Lines covered
```

**Coverage Goals:**
- Overall: 80%+
- Critical paths: 90%+
- Utilities: 100%

---

## 🎯 Unit Testing

### Testing Utilities

**Example: sanitization.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeObject } from '../server/utils/sanitization';

describe('sanitizeString', () => {
  it('removes script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const output = sanitizeString(input);
    expect(output).not.toContain('<script>');
    expect(output).toContain('Hello');
  });

  it('removes event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const output = sanitizeString(input);
    expect(output).not.toContain('onerror');
  });

  it('escapes HTML entities', () => {
    const input = '<div>Test & "quoted"</div>';
    const output = sanitizeString(input);
    expect(output).toContain('&lt;div&gt;');
    expect(output).toContain('&amp;');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes nested objects', () => {
    const input = {
      name: '<script>evil</script>John',
      notes: {
        content: '<img onerror="alert(1)">'
      }
    };
    const output = sanitizeObject(input);
    expect(output.name).not.toContain('<script>');
    expect(output.notes.content).not.toContain('onerror');
  });

  it('sanitizes arrays', () => {
    const input = ['<script>xss</script>', 'normal'];
    const output = sanitizeObject(input);
    expect(output[0]).not.toContain('<script>');
    expect(output[1]).toBe('normal');
  });
});
```

### Testing Services

**Example: students.service.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as studentService from '../server/features/students/services/students.service';
import * as studentRepo from '../server/features/students/repository/students.repository';

// Mock repository
vi.mock('../server/features/students/repository/students.repository');

describe('Student Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudents', () => {
    it('returns sanitized students', async () => {
      const mockStudents = [
        { id: 1, name: 'Ali Yılmaz', class_level: '9-A' }
      ];
      vi.mocked(studentRepo.findStudents).mockReturnValue(mockStudents);

      const result = await studentService.getStudents({ class_level: '9-A' });

      expect(studentRepo.findStudents).toHaveBeenCalledWith({ class_level: '9-A' });
      expect(result.students).toHaveLength(1);
      expect(result.students[0].name).toBe('Ali Yılmaz');
    });

    it('throws error for invalid filters', async () => {
      await expect(
        studentService.getStudents({ class_level: '<script>xss</script>' })
      ).rejects.toThrow();
    });
  });

  describe('createStudent', () => {
    it('validates required fields', async () => {
      await expect(
        studentService.createStudent({ name: '' })
      ).rejects.toThrow('Name is required');
    });

    it('sanitizes input before saving', async () => {
      const input = {
        name: '<script>evil</script>John',
        student_no: '2024-001',
        class_level: '9-A'
      };

      vi.mocked(studentRepo.createStudent).mockReturnValue({ id: 1, ...input });

      await studentService.createStudent(input);

      const callArg = vi.mocked(studentRepo.createStudent).mock.calls[0][0];
      expect(callArg.name).not.toContain('<script>');
    });
  });
});
```

---

## 🌐 Integration Testing

### API Endpoint Tests

**Example: students.api.test.ts**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index';
import { db } from '../server/lib/database/connection';

describe('Students API', () => {
  let sessionCookie: string;

  beforeAll(async () => {
    // Login to get session cookie
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@rehber360.com', password: 'demo' });
    
    sessionCookie = response.headers['set-cookie'][0];
  });

  afterAll(async () => {
    // Cleanup test data
    db.prepare('DELETE FROM students WHERE student_no LIKE "TEST-%"').run();
  });

  describe('GET /api/students', () => {
    it('returns student list', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.students).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('filters by class level', async () => {
      const response = await request(app)
        .get('/api/students?class_level=9-A')
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      response.body.students.forEach(student => {
        expect(student.class_level).toBe('9-A');
      });
    });

    it('requires authentication', async () => {
      const response = await request(app).get('/api/students');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/students', () => {
    it('creates new student', async () => {
      const newStudent = {
        name: 'Test Student',
        student_no: 'TEST-001',
        class_level: '9-A'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Cookie', sessionCookie)
        .send(newStudent);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Student');
      expect(response.body.id).toBeDefined();
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Cookie', sessionCookie)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Validation');
    });

    it('prevents duplicate student numbers', async () => {
      const student = {
        name: 'Test Student',
        student_no: 'TEST-DUP',
        class_level: '9-A'
      };

      await request(app)
        .post('/api/students')
        .set('Cookie', sessionCookie)
        .send(student);

      const response = await request(app)
        .post('/api/students')
        .set('Cookie', sessionCookie)
        .send(student);

      expect(response.status).toBe(409);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('updates student', async () => {
      const response = await request(app)
        .put('/api/students/1')
        .set('Cookie', sessionCookie)
        .send({ class_level: '10-A' });

      expect(response.status).toBe(200);
      expect(response.body.class_level).toBe('10-A');
    });

    it('sanitizes input', async () => {
      const response = await request(app)
        .put('/api/students/1')
        .set('Cookie', sessionCookie)
        .send({ notes: '<script>xss</script>Test' });

      expect(response.status).toBe(200);
      expect(response.body.notes).not.toContain('<script>');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('requires admin role', async () => {
      // Login as counselor (non-admin)
      const counselorLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'counselor@test.com', password: 'test' });

      const response = await request(app)
        .delete('/api/students/1')
        .set('Cookie', counselorLogin.headers['set-cookie'][0]);

      expect(response.status).toBe(403);
    });
  });
});
```

---

## 🎨 Component Testing

### React Component Tests

**Example: StudentCard.test.tsx**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentCard } from '../client/components/features/students/StudentCard';

describe('StudentCard', () => {
  const mockStudent = {
    id: 1,
    name: 'Ali Yılmaz',
    student_no: '2024-001',
    class_level: '9-A',
    risk_level: 'medium'
  };

  it('renders student information', () => {
    render(<StudentCard student={mockStudent} onViewProfile={vi.fn()} />);

    expect(screen.getByText('Ali Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('2024-001')).toBeInTheDocument();
    expect(screen.getByText(/Sınıf: 9-A/)).toBeInTheDocument();
  });

  it('displays risk badge', () => {
    render(<StudentCard student={mockStudent} onViewProfile={vi.fn()} />);

    const badge = screen.getByText('medium');
    expect(badge).toBeInTheDocument();
  });

  it('calls onViewProfile when button clicked', () => {
    const onViewProfile = vi.fn();
    render(<StudentCard student={mockStudent} onViewProfile={onViewProfile} />);

    const button = screen.getByText('Profil Görüntüle');
    fireEvent.click(button);

    expect(onViewProfile).toHaveBeenCalledWith(1);
  });

  it('renders high risk variant', () => {
    const highRiskStudent = { ...mockStudent, risk_level: 'high' };
    render(<StudentCard student={highRiskStudent} onViewProfile={vi.fn()} />);

    const badge = screen.getByText('high');
    expect(badge).toHaveClass('bg-destructive');
  });
});
```

### Hook Testing

**Example: useStudents.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStudents } from '../client/hooks/queries/students.query-hooks';
import * as studentsAPI from '../client/lib/api/endpoints/students.api';

// Mock API
vi.mock('../client/lib/api/endpoints/students.api');

describe('useStudents hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches students successfully', async () => {
    const mockStudents = [
      { id: 1, name: 'Ali Yılmaz' },
      { id: 2, name: 'Ayşe Demir' }
    ];

    vi.mocked(studentsAPI.getStudents).mockResolvedValue(mockStudents);

    const { result } = renderHook(() => useStudents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStudents);
    expect(studentsAPI.getStudents).toHaveBeenCalledTimes(1);
  });

  it('handles errors', async () => {
    vi.mocked(studentsAPI.getStudents).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useStudents(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('caches results', async () => {
    vi.mocked(studentsAPI.getStudents).mockResolvedValue([]);

    const { result, rerender } = renderHook(() => useStudents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender();

    // Should not refetch (cached)
    expect(studentsAPI.getStudents).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔒 Security Testing

See [Security Tests Documentation](../SECURITY_TESTS.md) for comprehensive security testing coverage.

**Key security tests:**
- XSS prevention
- SQL injection prevention
- AI prompt injection prevention
- File upload validation
- CSRF protection
- Input sanitization

---

## 📊 Test Coverage

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    '__tests__/',
    '*.config.ts',
    'dist/'
  ],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80
  }
}
```

---

## 🐛 Debugging Tests

### VSCode Debug Configuration

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

### Console Debugging

```typescript
it('debugs test', () => {
  console.log('Debug value:', someValue);
  
  // Or use Vitest's built-in debug
  import { debug } from '@testing-library/react';
  debug(); // Prints DOM tree
});
```

---

## ✅ Best Practices

1. **Write tests first** (TDD) for critical features
2. **Test behavior, not implementation** details
3. **Keep tests isolated** (no shared state)
4. **Use descriptive test names** (`it('should...', () => {})`)
5. **Mock external dependencies** (API calls, database)
6. **Test edge cases** (empty arrays, null values, errors)
7. **Clean up after tests** (database, mocks)
8. **Run tests before committing** (`npm run quality`)

---

**Related Documentation:**
- [Development Guide](./development.md)
- [Security Tests](../SECURITY_TESTS.md)

**Last Updated:** October 29, 2025
