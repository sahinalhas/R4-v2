# Backend Architecture

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Feature-Based Architecture](#feature-based-architecture)
4. [Three-Layer Pattern](#three-layer-pattern)
5. [Middleware Stack](#middleware-stack)
6. [AI Integration](#ai-integration)
7. [Background Jobs](#background-jobs)
8. [Security](#security)
9. [Error Handling](#error-handling)
10. [Performance](#performance)

---

## Overview

The Rehber360 backend is built with **Express.js v5** and TypeScript, following a **feature-based modular architecture** with clear separation of concerns.

### Key Technologies

- **Runtime**: Node.js 20
- **Framework**: Express.js 5.x
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with better-sqlite3 (synchronous)
- **Validation**: Zod schemas
- **Security**: bcryptjs, input sanitization, RBAC
- **File Handling**: Multer with custom validation

### Core Principles

1. **Feature Modularity**: Self-contained feature modules
2. **Separation of Concerns**: Routes → Services → Repositories
3. **Type Safety**: TypeScript + Zod runtime validation
4. **Security First**: Multiple layers of protection
5. **Performance**: Caching, optimized queries, background jobs

---

## Directory Structure

```
server/
├── config/                      # Configuration management
│   ├── env.ts                   # Environment validation (Zod)
│   ├── database.ts              # Database config
│   ├── ai.ts                    # AI provider config
│   ├── cors.ts                  # CORS settings
│   └── index.ts                 # Config exports
│
├── features/                    # Feature modules (39 features)
│   ├── students/
│   │   ├── routes/              # Express route handlers
│   │   ├── services/            # Business logic
│   │   ├── repository/          # Data access layer
│   │   ├── types/               # Feature-specific types
│   │   └── index.ts             # Feature router
│   ├── surveys/
│   ├── exams/
│   ├── counseling-sessions/
│   ├── ai-assistant/
│   └── ... (35 more features)
│
├── lib/                         # Core libraries
│   ├── database/
│   │   ├── connection.ts        # SQLite connection
│   │   ├── schema.ts            # Database schema
│   │   └── migrations.ts        # Schema migrations
│   └── utils/                   # Shared utilities
│
├── middleware/                  # Express middleware
│   ├── auth.middleware.ts       # Authentication
│   ├── validation.ts            # Input validation
│   ├── file-validation.middleware.ts  # File upload security
│   ├── error-handler.ts         # Global error handling
│   └── rate-limit.ts            # Rate limiting
│
├── services/                    # Shared services
│   ├── ai-adapters/             # AI provider integrations
│   │   ├── openai-adapter.ts
│   │   ├── gemini-adapter.ts
│   │   └── ollama-adapter.ts
│   ├── encryption.service.ts    # Backup encryption
│   └── notification.service.ts  # Notification system
│
├── scripts/                     # Background scripts
│   ├── schedulers/
│   │   ├── analytics-cache.scheduler.ts
│   │   ├── auto-complete-sessions.scheduler.ts
│   │   └── daily-action-plan.scheduler.ts
│   └── seed-data.ts             # Database seeding
│
├── utils/                       # Utility functions
│   ├── sanitization.ts          # Input sanitization
│   ├── validation.ts            # Validation helpers
│   └── logger.ts                # Logging utility
│
├── index.ts                     # Main server entry point
└── node-build.ts                # Production build entry
```

---

## Feature-Based Architecture

### Feature Module Structure

Each feature follows a **consistent four-layer structure**:

```
server/features/<feature-name>/
├── routes/                      # Route handlers
│   └── <feature>.routes.ts
├── services/                    # Business logic
│   └── <feature>.service.ts
├── repository/                  # Data access
│   └── <feature>.repository.ts
├── types/                       # Type definitions
│   └── <feature>.types.ts
└── index.ts                     # Feature router export
```

### Example: Students Feature

```typescript
// server/features/students/index.ts
import { Router } from 'express';
import { getStudentsHandler, createStudentHandler } from './routes/students.routes';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { simpleRateLimit } from '../../middleware/validation';

const studentsRouter = Router();

// Apply middleware
studentsRouter.use(requireAuth);

// Define routes
studentsRouter.get('/', 
  simpleRateLimit(200, 15 * 60 * 1000), 
  getStudentsHandler
);

studentsRouter.post('/', 
  requireRole(['admin', 'counselor']),
  simpleRateLimit(50, 15 * 60 * 1000),
  createStudentHandler
);

export default studentsRouter;
```

### Feature Registry

All features are registered in a central registry:

```typescript
// server/features/index.ts
import { Router } from 'express';
import studentsRouter from './students';
import surveysRouter from './surveys';
import examsRouter from './exams';
// ... 36 more imports

const featureRegistry = Router();

// Register all features
featureRegistry.use('/students', studentsRouter);
featureRegistry.use('/surveys', surveysRouter);
featureRegistry.use('/exams', examsRouter);
// ... 36 more registrations

export default featureRegistry;
```

### Current Features (39 Total)

**Core Features:**
- students, surveys, exams, counseling-sessions

**Academic Features:**
- exam-management, progress, subjects, study, attendance

**AI Features:**
- ai-assistant, ai-suggestions, advanced-ai-analysis, daily-insights, deep-analysis, standardized-profile, holistic-profile, profile-sync

**Support Features:**
- behavior, risk-assessment, special-education, intervention-tracking, early-warning, enhanced-risk

**Administrative:**
- auth, users, settings, backup, notifications, documents, meeting-notes

**Advanced:**
- career-guidance, personalized-learning, advanced-analytics, advanced-reports, analytics, reports, search, social-network, parent-communication, coaching, sessions

---

## Three-Layer Pattern

### 1. Routes Layer

**Responsibility:** Handle HTTP requests and responses

```typescript
// server/features/students/routes/students.routes.ts
import { Request, Response } from 'express';
import * as studentService from '../services/students.service';

export async function getStudentsHandler(req: Request, res: Response) {
  try {
    const filters = req.query;
    const students = await studentService.getStudents(filters);
    res.json(students);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch students',
      message: error.message 
    });
  }
}
```

**Best Practices:**
- ✅ Thin controllers (minimal logic)
- ✅ Extract query params/body
- ✅ Call service layer
- ✅ Handle errors gracefully
- ✅ Return appropriate HTTP status codes

### 2. Services Layer

**Responsibility:** Business logic, validation, orchestration

```typescript
// server/features/students/services/students.service.ts
import * as studentRepo from '../repository/students.repository';
import { sanitizeObject } from '../../../utils/sanitization';
import { studentSchema } from '../types/students.types';

export async function getStudents(filters: any) {
  // Business logic
  const sanitized = sanitizeObject(filters);
  
  // Orchestrate repository calls
  const students = studentRepo.findStudents(sanitized);
  const stats = studentRepo.getStudentStats();
  
  return {
    students,
    total: students.length,
    stats
  };
}

export async function createStudent(data: any) {
  // Validation
  const validated = studentSchema.parse(data);
  
  // Business rules
  if (validated.age < 6) {
    throw new Error('Student must be at least 6 years old');
  }
  
  // Sanitization
  const sanitized = sanitizeObject(validated);
  
  // Database operation
  return studentRepo.createStudent(sanitized);
}
```

**Best Practices:**
- ✅ Validate input (Zod schemas)
- ✅ Sanitize data (XSS, SQL injection prevention)
- ✅ Implement business rules
- ✅ Orchestrate multiple repository calls
- ✅ Transform data as needed

### 3. Repository Layer

**Responsibility:** Direct database access

```typescript
// server/features/students/repository/students.repository.ts
import { db } from '../../../lib/database/connection';
import type { Student } from '../types/students.types';

export function findStudents(filters: any): Student[] {
  let query = 'SELECT * FROM students WHERE 1=1';
  const params: any[] = [];
  
  if (filters.classLevel) {
    query += ' AND class_level = ?';
    params.push(filters.classLevel);
  }
  
  if (filters.searchTerm) {
    query += ' AND (name LIKE ? OR student_no LIKE ?)';
    params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
  }
  
  return db.prepare(query).all(...params) as Student[];
}

export function createStudent(data: Student) {
  const stmt = db.prepare(`
    INSERT INTO students (name, student_no, class_level, created_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name,
    data.student_no,
    data.class_level,
    new Date().toISOString()
  );
  
  return {
    id: result.lastInsertRowid,
    ...data
  };
}
```

**Best Practices:**
- ✅ Use prepared statements (SQL injection prevention)
- ✅ Keep queries simple and focused
- ✅ Return typed data
- ✅ Handle database errors
- ✅ Use transactions for multi-step operations

---

## Middleware Stack

### Request Processing Pipeline

```
Incoming Request
   ↓
1. CORS Middleware (cors.ts)
   ↓
2. Body Parsing (express.json, express.urlencoded)
   ↓
3. Cookie Parsing (cookie-parser)
   ↓
4. Rate Limiting (rate-limit.ts)
   ↓
5. Authentication (auth.middleware.ts)
   ↓
6. Authorization (requireRole)
   ↓
7. Input Validation & Sanitization (validation.ts)
   ↓
8. File Upload Validation (file-validation.middleware.ts)
   ↓
9. Route Handler (feature routes)
   ↓
10. Error Handler (error-handler.ts)
   ↓
Response
```

### Key Middleware

#### 1. Authentication Middleware

```typescript
// server/middleware/auth.middleware.ts
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

#### 2. File Upload Validation

```typescript
// server/middleware/file-validation.middleware.ts
export const uploadExcelFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // MIME type validation
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    
    // Magic number validation
    validateMagicNumber(file.buffer, (isValid) => {
      if (!isValid) {
        return cb(new Error('File content does not match type'));
      }
      cb(null, true);
    });
  }
});
```

#### 3. Input Sanitization

```typescript
// server/utils/sanitization.ts
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, sanitizeObject(value)])
    );
  }
  return obj;
}
```

---

## AI Integration

### AI Adapter Pattern

```
User Request → AI Service → Provider Adapter → External AI API
```

### Provider Adapters

```typescript
// server/services/ai-adapters/openai-adapter.ts
export async function generateOpenAIResponse(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}

// server/services/ai-adapters/gemini-adapter.ts
export async function generateGeminiResponse(prompt: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// server/services/ai-adapters/ollama-adapter.ts
export async function generateOllamaResponse(prompt: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({ model: 'llama3', prompt })
  });
  
  return await response.json();
}
```

### AI Prompt Sanitization

```typescript
// Prevent prompt injection attacks
export function sanitizeAIPrompt(input: string): string {
  return input
    .replace(/ignore\s+(previous|all)\s+instructions?/gi, '')
    .replace(/(you\s+are|act\s+as|pretend\s+to\s+be)\s+(now\s+)?a\s+\w+/gi, '')
    .replace(/SYSTEM:|ASSISTANT:|USER:/gi, '')
    .replace(/```[\s\S]*?```/g, '[code removed]');
}
```

---

## Background Jobs

### Scheduled Tasks

```typescript
// server/scripts/schedulers/analytics-cache.scheduler.ts
setInterval(async () => {
  console.log('🔄 Refreshing analytics cache...');
  await refreshAnalyticsCache();
}, 10 * 60 * 1000); // Every 10 minutes

// server/scripts/schedulers/daily-action-plan.scheduler.ts
cron.schedule('0 9 * * *', async () => {
  console.log('📋 Generating daily action plans...');
  await generateDailyPlans();
});

// server/scripts/schedulers/auto-complete-sessions.scheduler.ts
cron.schedule('0 * * * *', async () => {
  console.log('✅ Auto-completing old sessions...');
  await autoCompleteSessions();
});
```

---

## Security

### Security Layers

1. **Input Sanitization**: XSS, SQL injection, AI prompt injection prevention
2. **File Upload Validation**: MIME type, magic number, size, malware detection
3. **Authentication**: Session-based with secure cookies
4. **Authorization**: Role-based access control (RBAC)
5. **Rate Limiting**: Prevent abuse and DoS attacks
6. **CORS**: Whitelist allowed origins
7. **Encryption**: AES-256 for backups

See [Security Tests Documentation](../SECURITY_TESTS.md) for comprehensive security details.

---

## Error Handling

### Global Error Handler

```typescript
// server/middleware/error-handler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', err);
  
  // Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // Database errors
  if (err.message.includes('SQLITE')) {
    return res.status(500).json({
      error: 'Database error',
      message: 'An error occurred while accessing the database'
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
}
```

---

## Performance

### Optimizations

1. **Database**:
   - SQLite WAL mode (concurrent reads)
   - Indexed columns (student_no, class_level, dates)
   - Analytics caching (10-minute TTL)

2. **API**:
   - Rate limiting (prevent abuse)
   - Prepared statements (faster execution)
   - Efficient queries (avoid N+1)

3. **Background Jobs**:
   - Offload heavy tasks (analytics, auto-complete)
   - Scheduled execution (non-blocking)

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Frontend Architecture](./frontend.md)
- [Database Architecture](./database.md)
- [API Documentation](../api/)

---

**Last Updated:** October 29, 2025  
**Maintained by:** Backend Team
