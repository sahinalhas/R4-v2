# Test Infrastructure

Bu klasör, Rehber360 projesinin test altyapısını içerir.

## Klasör Yapısı

```
test/
  ├── setup.ts              # Global test setup ve konfigürasyon
  ├── utils/                # Test utility fonksiyonları
  │   ├── render.tsx        # Custom render with providers
  │   └── test-data.ts      # Mock data factory fonksiyonları
  ├── mocks/                # MSW handlers ve mock server
  │   ├── handlers.ts       # API mock handlers
  │   └── server.ts         # MSW server setup
  └── fixtures/             # Test data fixtures
      └── students.ts       # Student mock data
```

## Test Türleri

### 1. Co-located Tests (Önerilen)
Her component/module yanında `.test.ts` dosyası:

```
client/components/atoms/Button/
  ├── button.tsx
  ├── button.test.tsx       ✅ Component yanında
  └── index.ts
```

### 2. __tests__ Klasörü
Daha büyük integration ve e2e testleri için:

```
__tests__/
  ├── unit/                 # Unit tests
  │   ├── utils/
  │   ├── services/
  │   └── hooks/
  ├── integration/          # Integration tests
  │   ├── api/
  │   └── features/
  └── e2e/                  # End-to-end tests
      └── critical-flows/
```

## Kullanım

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage

# UI mode
npm run test:ui
```

### Test Yazma

#### Utility Test Örneği
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from './date-utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01');
    expect(formatDate(date)).toBe('01/01/2023');
  });
});
```

#### Component Test Örneği
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@test/utils/render';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

#### Hook Test Örneği
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStudents } from './use-students';

describe('useStudents', () => {
  it('fetches students successfully', async () => {
    const { result } = renderHook(() => useStudents());
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

## Best Practices

1. **Test Naming**: Açıklayıcı test adları kullanın
2. **Arrange-Act-Assert**: AAA pattern'ini takip edin
3. **DRY**: Test utilities kullanarak tekrarı azaltın
4. **Isolation**: Her test bağımsız olmalı
5. **Coverage**: En az %70 code coverage hedefleyin
6. **Fast Tests**: Testler hızlı çalışmalı (< 100ms ideal)

## Utilities

### Custom Render
`@test/utils/render` - React Query ve Router ile birlikte component render eder

### Mock Data
`@test/utils/test-data` - Factory fonksiyonları ile mock data oluşturur

### Fixtures
`@test/fixtures/*` - Önceden tanımlı test data setleri
