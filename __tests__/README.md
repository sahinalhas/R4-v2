# Tests Directory

Bu klasör, organize edilmiş unit, integration ve e2e testlerini içerir.

## Klasör Yapısı

```
__tests__/
  ├── unit/                 # Unit tests (izole testler)
  │   ├── utils/            # Utility fonksiyon testleri
  │   ├── services/         # Service layer testleri
  │   └── hooks/            # Custom hook testleri
  ├── integration/          # Integration tests
  │   ├── api/              # API endpoint testleri
  │   └── features/         # Feature integration testleri
  └── e2e/                  # End-to-end tests
      └── critical-flows/   # Kritik kullanıcı akışları
```

## Ne Zaman Kullanmalı?

### Co-located Tests (Tercih Edilen)
✅ Component testleri için
✅ Küçük utility testleri için
✅ Hızlı feedback döngüsü için

**Örnek:**
```
client/lib/utils/cn.ts
client/lib/utils/cn.test.ts  ← Dosya yanında
```

### __tests__ Klasörü
✅ Büyük integration testleri için
✅ API endpoint testleri için
✅ Feature-wide testler için
✅ E2E testleri için

**Örnek:**
```
__tests__/integration/api/students-api.test.ts
__tests__/e2e/student-registration-flow.test.ts
```

## Test Kategorileri

### Unit Tests
- Tek bir fonksiyon/modülü test eder
- Bağımlılıkları mock'lar
- Hızlı çalışır (< 50ms)
- Çok sayıda yazılır

### Integration Tests
- Birden fazla modülün birlikte çalışmasını test eder
- Gerçek bağımlılıklar (veya minimal mock)
- Orta hızda (< 500ms)
- Kritik akışları test eder

### E2E Tests
- Tüm uygulama akışını test eder
- Gerçek kullanıcı senaryoları
- Yavaş (> 1s)
- Az sayıda, kritik akışlar için

## Örnekler

### Unit Test
```typescript
// __tests__/unit/utils/format-date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils/format-date';

describe('formatDate', () => {
  it('formats date in DD/MM/YYYY format', () => {
    expect(formatDate('2023-01-15')).toBe('15/01/2023');
  });
});
```

### Integration Test
```typescript
// __tests__/integration/api/students-api.test.ts
import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api/core/client';

describe('Students API', () => {
  it('fetches and filters students', async () => {
    const response = await apiClient.get('/api/students');
    expect(response.data).toBeInstanceOf(Array);
  });
});
```

### E2E Test
```typescript
// __tests__/e2e/student-registration.test.ts
import { describe, it } from 'vitest';
import { render, screen, waitFor } from '@test/utils/render';

describe('Student Registration Flow', () => {
  it('completes full registration', async () => {
    // Render app
    // Navigate to registration
    // Fill form
    // Submit
    // Verify success
  });
});
```

## Coverage Hedefleri

- **Unit Tests**: %80+ coverage
- **Integration Tests**: Kritik API endpoint'ler
- **E2E Tests**: Ana kullanıcı akışları

## CI/CD Entegrasyonu

Testler otomatik olarak her commit'te çalışır:

```yaml
# .github/workflows/test.yml örneği
- run: npm test
- run: npm run test:coverage
```
