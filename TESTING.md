# Testing Guide - Rehber360

Bu dokümantasyon, Rehber360 projesinde test yazma, çalıştırma ve bakım yapma konusunda kapsamlı bir kılavuz sunar.

## 📋 İçindekiler

- [Test Altyapısı](#test-altyapısı)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Test Türleri](#test-türleri)
- [Test Yazma](#test-yazma)
- [Best Practices](#best-practices)
- [CI/CD Entegrasyonu](#cicd-entegrasyonu)
- [Troubleshooting](#troubleshooting)

## 🛠️ Test Altyapısı

### Kullanılan Teknolojiler

- **Test Framework:** [Vitest](https://vitest.dev/) - Vite native, hızlı ve modern
- **Testing Library:** [@testing-library/react](https://testing-library.com/) - Component testing
- **Test Utilities:** Custom render wrappers, mock factories
- **Coverage:** Vitest built-in coverage (v8)
- **CI/CD:** GitHub Actions

### Klasör Yapısı

```
project/
├── test/                       # Test infrastructure
│   ├── setup.ts               # Global setup
│   ├── utils/                 # Test utilities
│   │   ├── render.tsx         # Custom render
│   │   └── test-data.ts       # Mock data factories
│   ├── mocks/                 # MSW handlers
│   └── fixtures/              # Test data
├── __tests__/                 # Organized tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests
└── [feature]/                 # Co-located tests
    ├── component.tsx
    └── component.test.tsx     # ✅ Test yanında
```

## 🚀 Hızlı Başlangıç

### 1. Gerekli Paketleri Kur

```bash
npm install
```

### 2. Testleri Çalıştır

```bash
# Tüm testleri çalıştır
npm test

# Watch mode (geliştirme için)
npm run test:watch

# UI mode (görsel interface)
npm run test:ui

# Coverage raporu
npm run test:coverage

# Sadece unit testler
npm run test:unit

# Sadece integration testler
npm run test:integration
```

### 3. İlk Testini Yaz

```typescript
// client/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });
});
```

## 📝 Test Türleri

### 1. Unit Tests (Birim Testler)

**Ne zaman:** Tek bir fonksiyon/modül test edilirken  
**Nerede:** Co-located (dosya yanında) veya `__tests__/unit/`

```typescript
// __tests__/unit/utils/validation.test.ts
import { describe, it, expect } from 'vitest';

describe('validateEmail', () => {
  it('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

**Özellikler:**
- ✅ Hızlı (< 50ms)
- ✅ İzole (bağımlılıklar mock)
- ✅ Çok sayıda test
- ✅ Deterministik

### 2. Component Tests

**Ne zaman:** React component davranışı test edilirken  
**Nerede:** Co-located (component yanında)

```typescript
// client/components/atoms/Button/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@test/utils/render';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**Best Practices:**
- ✅ User-centric queries (`getByRole`, `getByText`)
- ✅ Test davranış, implementation değil
- ✅ Async actions için `await`
- ❌ Implementation details test etme

### 3. Hook Tests

**Ne zaman:** Custom hook logic test edilirken  
**Nerede:** `__tests__/unit/hooks/`

```typescript
// __tests__/unit/hooks/use-pagination.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/use-pagination';

describe('usePagination', () => {
  it('navigates to next page', () => {
    const { result } = renderHook(() => usePagination(100, 10));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
  });
});
```

### 4. Integration Tests

**Ne zaman:** Birden fazla modül birlikte test edilirken  
**Nerede:** `__tests__/integration/`

```typescript
// __tests__/integration/api/students-api.test.ts
import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api/core/client';

describe('Students API Integration', () => {
  it('fetches and filters students', async () => {
    const response = await apiClient.get('/api/students');
    expect(response.data).toBeInstanceOf(Array);
  });
});
```

### 5. E2E Tests (Gelecek)

**Ne zaman:** Tam kullanıcı akışı test edilirken  
**Nerede:** `__tests__/e2e/`

```typescript
// __tests__/e2e/student-registration.test.ts
describe('Student Registration Flow', () => {
  it('completes full registration', async () => {
    // 1. Navigate to registration page
    // 2. Fill form
    // 3. Submit
    // 4. Verify success
  });
});
```

## 📖 Test Yazma Kılavuzu

### AAA Pattern (Arrange-Act-Assert)

```typescript
it('example test', () => {
  // Arrange: Setup test data
  const user = createMockUser({ role: 'Admin' });
  
  // Act: Perform action
  const result = checkPermission(user, 'delete');
  
  // Assert: Verify result
  expect(result).toBe(true);
});
```

### Testing Library Queries

**Öncelik Sırası:**

1. **Accessible Queries (Tercih Edilen)**
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText('Email')
   screen.getByPlaceholderText('Enter email')
   ```

2. **Semantic Queries**
   ```typescript
   screen.getByText('Welcome')
   screen.getByAltText('Profile picture')
   ```

3. **Test IDs (Son Çare)**
   ```typescript
   screen.getByTestId('custom-element')
   ```

### Async Testing

```typescript
it('loads data asynchronously', async () => {
  render(<DataComponent />);
  
  // Wait for element to appear
  expect(await screen.findByText('Loaded')).toBeInTheDocument();
  
  // Wait for condition
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

### Mocking

#### Function Mocking

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg');
```

#### Module Mocking

```typescript
vi.mock('@/lib/api/core/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));
```

### Custom Render

Tüm provider'larla birlikte render için:

```typescript
import { render } from '@test/utils/render';

const { queryClient } = render(<MyComponent />);
```

## ✅ Best Practices

### 1. Test Naming

```typescript
// ✅ GOOD: Descriptive, clear intent
it('displays error message when email is invalid', () => {});

// ❌ BAD: Vague
it('works', () => {});
```

### 2. Test Independence

```typescript
// ✅ GOOD: Each test is independent
describe('Calculator', () => {
  it('adds numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  it('subtracts numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});

// ❌ BAD: Tests depend on each other
let result;
it('setup', () => { result = calculate(); });
it('verify', () => { expect(result).toBe(5); });
```

### 3. Don't Test Implementation

```typescript
// ✅ GOOD: Test behavior
it('displays validation error', () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Email required')).toBeInTheDocument();
});

// ❌ BAD: Test implementation
it('calls validateEmail function', () => {
  const spy = vi.spyOn(utils, 'validateEmail');
  // Testing internal function calls
});
```

### 4. Avoid Test Duplication

```typescript
// ✅ GOOD: Use describe blocks and shared setup
describe('Button variants', () => {
  const variants = ['default', 'destructive', 'outline'];
  
  variants.forEach(variant => {
    it(`renders ${variant} variant`, () => {
      render(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

### 5. Keep Tests Fast

```typescript
// ✅ GOOD: Mock expensive operations
vi.mock('@/services/ai', () => ({
  analyzeProfile: vi.fn().mockResolvedValue({ score: 85 }),
}));

// ❌ BAD: Real API calls in tests
it('analyzes profile', async () => {
  await fetch('https://api.example.com/analyze'); // Slow!
});
```

## 🎯 Coverage Hedefleri

```
Target Coverage:
├── Statements: 70%+
├── Branches: 70%+
├── Functions: 70%+
└── Lines: 70%+
```

Coverage raporu görüntüleme:

```bash
npm run test:coverage
open coverage/index.html  # Coverage HTML report
```

## 🔄 CI/CD Entegrasyonu

### GitHub Actions

Testler otomatik olarak her push ve PR'da çalışır:

```yaml
# .github/workflows/test.yml
- run: npm run typecheck
- run: npm run lint
- run: npm run test:coverage
```

### Pre-commit Hooks

Husky ile commit öncesi testler:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "ReferenceError: ResizeObserver is not defined"

**Çözüm:** `test/setup.ts` dosyasında mock eklenmiş ✅

#### 2. "Cannot find module '@test/utils/render'"

**Çözüm:** `vitest.config.ts`'de alias tanımlı ✅

```typescript
resolve: {
  alias: {
    '@test': path.resolve(__dirname, './test'),
  },
}
```

#### 3. Tests hang or timeout

**Çözüm:** Async operations için `await` kullan:

```typescript
// ❌ BAD
it('loads data', () => {
  render(<AsyncComponent />);
  expect(screen.getByText('Data')).toBeInTheDocument(); // Fails!
});

// ✅ GOOD
it('loads data', async () => {
  render(<AsyncComponent />);
  expect(await screen.findByText('Data')).toBeInTheDocument();
});
```

#### 4. Component test fails with "not wrapped in act()"

**Çözüm:** User events için `userEvent.setup()` kullan:

```typescript
const user = userEvent.setup();
await user.click(button);
```

## 📚 Faydalı Kaynaklar

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 🎓 Örnekler

Proje içindeki örnek testler:

```
✅ client/lib/utils.test.ts              (Utility)
✅ client/components/atoms/Button/button.test.tsx  (Component)
✅ __tests__/unit/hooks/use-pagination.test.ts     (Hook)
✅ __tests__/unit/utils/validation.test.ts         (Unit)
```

## 📞 Yardım

Test yazarken sorun yaşıyorsanız:

1. Bu dokümantasyonu okuyun
2. Mevcut testlere bakın (örnekler)
3. Testing Library dokümantasyonunu kontrol edin
4. Vitest dokümantasyonunu kontrol edin

---

**Son Güncelleme:** 29 Ekim 2025  
**Versiyon:** 1.0  
**Yazar:** Rehber360 Development Team
