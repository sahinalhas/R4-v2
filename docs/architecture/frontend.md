# Frontend Architecture

## 📋 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Atomic Design Pattern](#atomic-design-pattern)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Routing & Navigation](#routing--navigation)
7. [Component Patterns](#component-patterns)
8. [Hooks System](#hooks-system)
9. [Styling & Theming](#styling--theming)
10. [Performance Optimizations](#performance-optimizations)

---

## Overview

The Rehber360 frontend is a modern **React 18 SPA** built with TypeScript, leveraging the latest React features including hooks, concurrent rendering, and Suspense.

### Key Technologies

- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 6.x (fast HMR, optimized builds)
- **Styling**: Tailwind CSS 4.x + Radix UI primitives
- **State Management**: TanStack React Query + Context API
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **Data Visualization**: Recharts
- **Animation**: Framer Motion
- **Testing**: Vitest + Testing Library

### Architecture Principles

1. **Atomic Design**: Component hierarchy (atoms → molecules → organisms → features)
2. **Type Safety**: TypeScript strict mode + Zod runtime validation
3. **Performance**: Code splitting, lazy loading, virtual scrolling
4. **Accessibility**: WCAG AAA compliance, keyboard navigation, screen reader support
5. **Modularity**: Feature-based organization with clear boundaries

---

## Directory Structure

```
client/
├── assets/                      # Static assets (images, fonts, styles)
│   ├── images/                  # Imported images
│   ├── fonts/                   # Custom fonts
│   ├── styles/                  # Global CSS
│   └── README.md                # Asset usage guide
│
├── components/                  # UI Components (Atomic Design)
│   ├── atoms/                   # Basic UI elements
│   │   ├── Button/
│   │   │   ├── button.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── ... (19 atoms)
│   │
│   ├── molecules/               # Simple combinations
│   │   ├── StatCard/
│   │   ├── PageHeader/
│   │   ├── TagInput/
│   │   └── ... (11 molecules)
│   │
│   ├── organisms/               # Complex components
│   │   ├── Dialog/
│   │   ├── Table/
│   │   ├── Form/
│   │   └── ... (24 organisms)
│   │
│   └── features/                # Feature-specific components
│       ├── students/
│       │   ├── StudentCard.tsx
│       │   ├── StudentTable.tsx
│       │   └── StudentFilters.tsx
│       ├── counseling/
│       ├── surveys/
│       └── ... (18 feature folders)
│
├── hooks/                       # Custom React hooks
│   ├── queries/                 # React Query hooks
│   │   ├── students.query-hooks.ts
│   │   └── exams.query-hooks.ts
│   ├── mutations/               # Mutation hooks
│   ├── state/                   # State management hooks
│   │   ├── student-filters.state.ts
│   │   └── student-filter.state.ts
│   └── utils/                   # Utility hooks
│       ├── pagination.utils.ts
│       ├── mobile-layout.utils.ts
│       └── toast.utils.ts
│
├── lib/                         # Libraries & utilities
│   ├── api/                     # API client
│   │   ├── core/
│   │   │   ├── client.ts        # Axios instance with interceptors
│   │   │   ├── interceptors.ts  # Request/response interceptors
│   │   │   └── error-handler.ts
│   │   ├── endpoints/           # API endpoint modules (29 files)
│   │   │   ├── students.api.ts
│   │   │   ├── surveys.api.ts
│   │   │   └── ...
│   │   ├── hooks/               # React Query integration
│   │   └── types/               # API request/response types
│   │
│   ├── i18n/                    # Internationalization
│   │   ├── config.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   └── utils/                   # Utility functions
│       ├── cn.ts                # Class name utility
│       ├── date.ts              # Date formatting
│       └── validation.ts        # Validation helpers
│
├── pages/                       # Page components (routes)
│   ├── Dashboard.tsx
│   ├── Students.tsx
│   ├── Counseling.tsx
│   ├── Surveys.tsx
│   └── ... (20+ pages)
│
├── layout/                      # Layout components
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Footer.tsx
│
├── services/                    # Business logic services
│   ├── auth.service.ts
│   ├── survey.service.ts
│   └── ...
│
├── constants/                   # Application constants
│   ├── routes.ts
│   ├── permissions.ts
│   └── navigation.ts
│
├── App.tsx                      # Root component
├── main.tsx                     # Application entry point
└── global.css                   # Global styles
```

---

## Atomic Design Pattern

### Component Hierarchy

```
Atoms (19 components)
  ├── Button, Input, Textarea, Label, Checkbox
  ├── Radio Group, Switch, Slider, Select
  ├── Badge, Avatar, Separator, Skeleton
  ├── Progress, Toggle, Alert, Aspect Ratio
  └── Toast, Toaster

Molecules (11 components)
  ├── Enhanced Textarea (with AI suggestions)
  ├── Standard Field (form field wrapper)
  ├── Tag Input (multiple tag input)
  ├── Multi Select (searchable multi-select)
  ├── Stat Card (metric display)
  ├── Stats Grid (multiple stats)
  ├── Modern Card (styled container)
  ├── Voice Input Button (STT integration)
  ├── Voice Input Status (recording indicator)
  ├── Page Header (title + breadcrumbs)
  └── Breadcrumb (navigation trail)

Organisms (24 components)
  ├── Dialog, Alert Dialog, Drawer, Sheet
  ├── Popover, Hover Card, Tooltip
  ├── Context Menu, Dropdown Menu, Navigation Menu, Menubar
  ├── Sidebar, Scroll Area, Pagination
  ├── Tabs, Accordion, Collapsible, Toggle Group
  ├── Table, Chart, Calendar
  └── Form, Command, Card

Features (18 feature folders)
  ├── students, counseling, surveys, exams
  ├── ai, ai-suggestions, ai-tools, analytics
  ├── charts, dashboard, exam-management, learning
  ├── live-profile, profile-sync, settings, shared
  ├── social, student-profile
  └── common (AIStatusIndicator, ErrorBoundary, RiskSummaryWidget)
```

### Example: Atom Component

```tsx
// client/components/atoms/Button/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
```

### Example: Feature Component

```tsx
// client/components/features/students/StudentCard.tsx
import { Card } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import type { Student } from '@shared/types/student.types';

interface StudentCardProps {
  student: Student;
  onViewProfile: (id: number) => void;
}

export default function StudentCard({ student, onViewProfile }: StudentCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{student.name}</h3>
          <p className="text-sm text-muted-foreground">{student.student_no}</p>
          <p className="text-sm">Sınıf: {student.class_level}</p>
        </div>
        
        {student.risk_level && (
          <Badge variant={student.risk_level === 'high' ? 'destructive' : 'secondary'}>
            {student.risk_level}
          </Badge>
        )}
      </div>
      
      <div className="mt-4">
        <Button onClick={() => onViewProfile(student.id)} size="sm">
          Profil Görüntüle
        </Button>
      </div>
    </Card>
  );
}
```

---

## State Management

### Three-Tier State Strategy

#### 1. Server State: React Query

```tsx
// client/hooks/queries/students.query-hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, createStudent } from '@/lib/api/endpoints/students.api';

export function useStudents(filters?: any) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => getStudents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
```

#### 2. UI State: React Context

```tsx
// client/context/auth-context.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await loginAPI(email, password);
    setUser(response.user);
  };
  
  const logout = () => setUser(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 3. Component State: useState/useReducer

```tsx
// For local component state (forms, toggles, modals)
function StudentFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  
  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide' : 'Show'} Filters
      </Button>
      
      {isOpen && (
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          {/* ... */}
        </Select>
      )}
    </div>
  );
}
```

---

## API Integration

### API Client Structure

```
client/lib/api/
├── core/
│   ├── client.ts          # Axios instance
│   ├── interceptors.ts    # Request/response interceptors
│   └── error-handler.ts   # Error handling
├── endpoints/
│   ├── students.api.ts    # Student API calls
│   ├── surveys.api.ts     # Survey API calls
│   └── ... (27 more)
└── types/
    ├── requests.ts        # Request types
    └── responses.ts       # Response types
```

### API Client Implementation

```typescript
// client/lib/api/core/client.ts
import axios from 'axios';
import { setupInterceptors } from './interceptors';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

setupInterceptors(apiClient);

export { apiClient };
```

### Interceptors

```typescript
// client/lib/api/core/interceptors.ts
export function setupInterceptors(client: AxiosInstance) {
  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = { ...config.params, _t: Date.now() };
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}
```

### API Endpoint Example

```typescript
// client/lib/api/endpoints/students.api.ts
import { apiClient } from '../core/client';
import type { Student, CreateStudentRequest } from '@shared/types/student.types';

export async function getStudents(filters?: any): Promise<Student[]> {
  const { data } = await apiClient.get('/students', { params: filters });
  return data;
}

export async function getStudent(id: number): Promise<Student> {
  const { data } = await apiClient.get(`/students/${id}`);
  return data;
}

export async function createStudent(student: CreateStudentRequest): Promise<Student> {
  const { data } = await apiClient.post('/students', student);
  return data;
}

export async function updateStudent(id: number, updates: Partial<Student>): Promise<Student> {
  const { data } = await apiClient.put(`/students/${id}`, updates);
  return data;
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(`/students/${id}`);
}
```

---

## Routing & Navigation

### Route Structure

```tsx
// client/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="counseling" element={<Counseling />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="exams" element={<Exams />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Protected Route Component

```tsx
// client/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
```

---

## Component Patterns

### Compound Components

```tsx
// Compound component pattern for flexible composition
<Tabs defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="exams">Exams</TabsTrigger>
    <TabsTrigger value="counseling">Counseling</TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile">
    <ProfileTab student={student} />
  </TabsContent>
  
  <TabsContent value="exams">
    <ExamsTab studentId={student.id} />
  </TabsContent>
  
  <TabsContent value="counseling">
    <CounselingTab studentId={student.id} />
  </TabsContent>
</Tabs>
```

### Render Props

```tsx
// Virtual scrolling with render props
<VirtualList
  items={students}
  height={600}
  itemHeight={80}
  renderItem={(student) => (
    <StudentCard key={student.id} student={student} />
  )}
/>
```

### Higher-Order Components (HOC)

```tsx
// withAuth HOC for permission-based rendering
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user } = useAuth();
    
    if (!requiredRoles.includes(user?.role)) {
      return <Unauthorized />;
    }
    
    return <Component {...props} />;
  };
}

// Usage
const AdminDashboard = withAuth(Dashboard, ['admin']);
```

---

## Hooks System

### Query Hooks (Data Fetching)

Located in `client/hooks/queries/`

```typescript
// Example: Student queries
export function useStudents(filters) { /* ... */ }
export function useStudent(id) { /* ... */ }
export function useStudentStats() { /* ... */ }
```

### Mutation Hooks (Data Updates)

Located in `client/hooks/mutations/`

```typescript
// Example: Student mutations
export function useCreateStudent() { /* ... */ }
export function useUpdateStudent() { /* ... */ }
export function useDeleteStudent() { /* ... */ }
```

### State Hooks (Local State)

Located in `client/hooks/state/`

```typescript
// Example: Filter state management
export function useStudentFilters() {
  const [filters, setFilters] = useState({
    classLevel: '',
    riskLevel: '',
    searchTerm: ''
  });
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  return { filters, updateFilter };
}
```

### Utility Hooks

Located in `client/hooks/utils/`

```typescript
// Pagination hook
export function usePagination(totalItems: number, itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
    goToPage: setCurrentPage
  };
}
```

---

## Styling & Theming

### Tailwind CSS + CSS Variables

```css
/* client/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }
  
  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    /* ... dark mode variables */
  }
}
```

### Class Name Utility

```typescript
// client/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

---

## Performance Optimizations

### 1. Code Splitting

```tsx
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/students" element={<Students />} />
  </Routes>
</Suspense>
```

### 2. Virtual Scrolling

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function StudentList({ students }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <StudentCard student={students[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. React Query Caching

```tsx
// Optimistic updates for better UX
const mutation = useMutation({
  mutationFn: updateStudent,
  onMutate: async (newStudent) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['students', id] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['students', id]);
    
    // Optimistically update
    queryClient.setQueryData(['students', id], newStudent);
    
    return { previous };
  },
  onError: (err, newStudent, context) => {
    // Rollback on error
    queryClient.setQueryData(['students', id], context.previous);
  },
});
```

### 4. Debounced Search

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function SearchBar() {
  const { refetch } = useStudents();
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      refetch({ searchTerm: term });
    }, 300),
    [refetch]
  );
  
  return (
    <Input
      type="search"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search students..."
    />
  );
}
```

---

## Related Documentation

- [Architecture Overview](./overview.md)
- [Backend Architecture](./backend.md)
- [Database Architecture](./database.md)
- [Component Library](../../client/components/)

---

**Last Updated:** October 29, 2025  
**Maintained by:** Frontend Team
