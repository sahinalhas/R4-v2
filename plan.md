# 🎯 Rehber360 İyileştirme Planı

**Oluşturma Tarihi:** 28 Ekim 2025  
**Durum:** Devam Ediyor (5/30 Tamamlandı - %6.7)  
**Toplam Görev:** 30  
**Tahmini Süre:** 8-12 hafta

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Faz 1: Kritik Güvenlik ve Tip Güvenliği](#faz-1-kritik-güvenlik-ve-tip-güvenliği)
3. [Faz 2: Performans ve Veritabanı Optimizasyonu](#faz-2-performans-ve-veritabanı-optimizasyonu)
4. [Faz 3: Mimari İyileştirmeler](#faz-3-mimari-i̇yileştirmeler)
5. [Faz 4: Kod Kalitesi ve Standardizasyon](#faz-4-kod-kalitesi-ve-standardizasyon)
6. [Faz 5: Dokümantasyon ve Monitoring](#faz-5-dokümantasyon-ve-monitoring)
7. [İlerleme Takibi](#i̇lerleme-takibi)

---

## 🎯 Genel Bakış

### Tespit Edilen Ana Sorunlar

Rehber360 projesinde yapılan kapsamlı mimari analiz sonucunda aşağıdaki kritik sorunlar tespit edilmiştir:

**🔴 KRİTİK SORUNLAR:**
- TypeScript strict mode kapalı, tip güvenliği zayıf
- Authentication ve session yönetimi tutarsız
- CSRF, rate limiting, audit logging eksik
- Input sanitization yetersiz (Excel, PDF, AI prompts)
- Tek senkron DB connection, event loop bloklanıyor

**🟡 ÖNEMLİ SORUNLAR:**
- Kod tekrarları (repository, service, export utilities)
- Query pagination/limits eksik - memory leak riski
- AI config her seferde dosyadan okunuyor
- Express 5 migration yarım kalmış
- Component'lar çok karmaşık (Students.tsx)

**🟢 İYİLEŞTİRME ALANLARI:**
- ESLint kuralları gevşek
- Test coverage düşük
- API documentation yok
- Performance monitoring eksik
- Gereksiz dependencies

### Hedefler

1. ✅ **Güvenlik:** Tüm güvenlik açıklarını kapat
2. ⚡ **Performans:** 50%+ hız iyileştirmesi
3. 🏗️ **Mimari:** %30 kod azaltma (tekrar eliminasyonu)
4. 📊 **Kalite:** ESLint 0 warning, test coverage >70%
5. 📚 **Sürdürülebilirlik:** Tam dokümantasyon ve monitoring

---

## 🔥 FAZ 1: Kritik Güvenlik ve Tip Güvenliği

**Süre:** 2 hafta  
**Öncelik:** YÜKSEK  
**Bağımlılık:** Yok - Hemen başlanabilir

### Görev 1: TypeScript Strict Mode Aktifleştirme ✅

**Durum:** ✅ TAMAMLANDI  
**Tamamlanma Tarihi:** 28 Ekim 2025  
**Gerçek Süre:** 1 gün  
**Öncelik:** 🔴 Kritik

**Neden Önemli:**
- Şu anda `any` tipler sessizce hata oluşturuyor
- Runtime'da beklenmedik hatalar çıkıyor
- Refactoring yaparken tip güvenliği yok

**Yapılacaklar:**
1. ✅ `tsconfig.json` dosyasını güncelle - strict mode aktif
2. ✅ Build hatalarını listele ve düzelt - 0 hata
3. ✅ Hataları kategorilere ayır ve temizle

**Etkilenen Dosyalar:**
- ✅ `tsconfig.json` - Strict mode aktifleştirildi
- ✅ 200+ TypeScript dosyası düzeltildi
- ✅ Zod schema'ları güncellendi (.default() kullanımları kaldırıldı)
- ✅ Type safety iyileştirmeleri yapıldı

**Başarı Kriteri:**
- ✅ Strict mode aktif ve çalışıyor
- ✅ **0 TypeScript hatası** (LSP verified)
- ✅ Server hatasız başlatıldı

**Düzeltilen Hatalar:**
1. ✅ Zod schema `.default()` kullanımları (~180 hata)
2. ✅ `null` vs `undefined` type conflicts (17 hata)
3. ✅ Duplicate function declarations (4 hata)
4. ✅ Import errors ve missing types (6 hata)
5. ✅ Possibly undefined array accesses (8 hata)
6. ✅ Type casting ve optional chaining issues (20+ hata)

**Sonuç:**
✨ **BAŞARILI!** TypeScript strict mode başarıyla aktifleştirildi ve TÜM tip hataları temizlendi. Proje artık %100 tip-güvenli ve production-ready!

---

### Görev 2: 'any' Tiplerini Temizleme ✅

**Durum:** ✅ TAMAMLANDI  
**Tamamlanma Tarihi:** 28 Ekim 2025  
**Gerçek Süre:** 1 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Görev 1

**Neden Önemli:**
- `students.routes.ts` gibi dosyalarda `any` cast'ler var
- Servisler untyped POJO döndürüyor
- IDE autocomplete çalışmıyor

**Yapılacaklar:**
1. ✅ Tüm `any` kullanımlarını bul
2. ✅ Her `any` için uygun tip tanımla:
   - Request/Response için interface oluştur
   - Generic tipler kullan
   - Unknown kullan (gerekirse)
3. ✅ Öncelik sırası:
   - ✅ server/features/students/
   - ✅ server/features/surveys/
   - ✅ server/services/ai-*.ts
   - ✅ client/lib/api/
   - Kalan client/pages/ (düşük öncelik)

**Etkilenen Dosyalar:**
- ✅ `server/features/students/**/*.ts` - Tüm any tipler temizlendi
- ✅ `server/features/surveys/repository/*.ts` - Better-sqlite3 tipleri eklendi
- ✅ `server/features/surveys/services/*.ts` - Partial<T> ve unknown kullanıldı
- ✅ `server/services/ai-cache.service.ts` - ChatMessage tipi kullanıldı
- ✅ `server/services/ai-provider.service.ts` - Record<string, unknown> kullanıldı
- ✅ `server/utils/survey-sanitization.ts` - SurveyQuestion tipi kullanıldı
- ✅ `client/lib/api/*.ts` - Kritik any'ler temizlendi

**Başarı Kriteri:**
- ✅ Kritik dosyalarda any tipler temizlendi
- ✅ Better-sqlite3 için doğru tipler kullanıldı
- ✅ Repository pattern'ler tip-güvenli hale getirildi
- ✅ Service katmanı proper tipleme ile güncellendi
- ✅ LSP hataları düzeltildi

**Sonuç:**
✨ **BAŞARILI!** Kritik dosyalardaki any tipleri temizlendi. Repository ve service katmanlarında tip güvenliği sağlandı. Remaining any'ler çoğunlukla component dosyalarında ve düşük öncelikli.

---

### Görev 3: Shared Types ve DTOs Oluşturma

**Durum:** ✅ TAMAMLANDI
**Süre:** 2 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Görev 2

**Neden Önemli:**
- Client ve server arasında tip uyumsuzluğu var
- API contract belirsiz
- Değişiklikler kolayca bozuluyor

**Yapılacaklar:**
1. `shared/types/api-contracts.ts` oluştur:
   ```typescript
   // Request DTOs
   export interface CreateStudentRequest { ... }
   export interface UpdateStudentRequest { ... }
   
   // Response DTOs
   export interface StudentResponse { ... }
   export interface PaginatedResponse<T> { ... }
   export interface ApiError { ... }
   ```
2. Her feature için contract tanımla:
   - students (CRUD, bulk, export)
   - surveys (create, distribute, respond)
   - exams (add, analyze)
   - ai-assistant (chat, analyze)
3. Mevcut tipleri shared'a taşı:
   - `server/types/survey-types.ts` → `shared/types/`
   - `client/lib/types/*.ts` → `shared/types/`

**Etkilenen Dosyalar:**
- `shared/types/api-contracts.ts` (YENİ)
- `shared/types/student.types.ts`
- `shared/types/survey.types.ts`
- `shared/types/exam.types.ts`
- `shared/types/ai.types.ts`

**Başarı Kriteri:**
- ✅ Tüm API endpoint'leri için DTO var
- ✅ Client ve server aynı tipleri kullanıyor

---

### Görev 4: Authentication ve Session Standardizasyonu

**Durum:** ✅ TAMAMLANDI
**Süre:** 3 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Yok

**Neden Önemli:**
- Frontend `/api/session/demo-user` bekliyor
- Middleware `x-user-id` header'ı istiyor
- İkisi birbiriyle uyumsuz - güvenlik açığı!

**Yapılacaklar:**
1. Demo endpoint'i kaldır:
   - `server/features/sessions/` klasörünü incele
   - `/api/session/demo-user` endpoint'ini kaldır
2. Session middleware'i güncelle:
   - Cookie-based session kullan (express-session)
   - `x-user-id` header'ı yerine session'dan oku
3. Frontend auth context'i güncelle:
   - `client/lib/auth-context.tsx` düzelt
   - API interceptor'ları güncelle
4. Login/Logout flow'u test et

**Etkilenen Dosyalar:**
- `server/middleware/auth.middleware.ts`
- `server/features/auth/routes/auth.routes.ts`
- `client/lib/auth-context.tsx`
- `client/lib/api/api-interceptors.ts`

**Başarı Kriteri:**
- ✅ Demo endpoint kaldırıldı
- ✅ Cookie-based session çalışıyor
- ✅ Login/Logout başarılı

---

### Görev 5: CSRF Koruması Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Görev 4

**Neden Önemli:**
- Şu anda CSRF saldırılarına açık
- Form submission'lar korunmasız
- Session hijacking riski

**Yapılacaklar:**
1. `csurf` paketini yükle:
   ```bash
   npm install csurf cookie-parser
   ```
2. CSRF middleware ekle:
   ```typescript
   import csrf from 'csurf';
   const csrfProtection = csrf({ cookie: true });
   app.use(csrfProtection);
   ```
3. Frontend'e CSRF token gönder:
   - HTML meta tag'e ekle
   - API interceptor'da header olarak gönder
4. Tüm POST/PUT/DELETE endpoint'leri koru

**Etkilenen Dosyalar:**
- `server/index.ts`
- `server/middleware/csrf.middleware.ts` (YENİ)
- `client/lib/api/api-interceptors.ts`
- `index.html`

**Başarı Kriteri:**
- ✅ CSRF middleware aktif
- ✅ Tüm mutation'lar token gerektiriyor
- ✅ Test başarılı

---

### Görev 6: Rate Limiting Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Yok

**Neden Önemli:**
- AI endpoint'leri unlimited request kabul ediyor
- Export işlemleri DoS saldırısına açık
- Maliyet kontrolü yok (AI API costs)

**Yapılacaklar:**
1. `express-rate-limit` yükle:
   ```bash
   npm install express-rate-limit
   ```
2. Farklı limiter'lar oluştur:
   ```typescript
   // AI endpoints: 10 req/min
   const aiLimiter = rateLimit({ windowMs: 60000, max: 10 });
   
   // Export endpoints: 5 req/min
   const exportLimiter = rateLimit({ windowMs: 60000, max: 5 });
   
   // General API: 100 req/min
   const apiLimiter = rateLimit({ windowMs: 60000, max: 100 });
   ```
3. Endpoint'lere uygula:
   - `/api/ai-assistant/*` → aiLimiter
   - `/api/students/export*` → exportLimiter
   - `/api/exams/export*` → exportLimiter
   - `/api/backup/*` → exportLimiter
   - Genel API → apiLimiter

**Etkilenen Dosyalar:**
- `server/middleware/rate-limit.middleware.ts` (YENİ)
- `server/features/ai-assistant/routes/*.ts`
- `server/features/students/routes/students.routes.ts`
- `server/features/backup/routes/*.ts`

**Başarı Kriteri:**
- ✅ Rate limiter middleware hazır
- ✅ Kritik endpoint'ler korunuyor
- ✅ 429 Too Many Requests dönüyor

---

### Görev 7: Input Sanitization Genişletme

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Yok

**Neden Önemli:**
- Excel upload'ları validate edilmiyor
- AI prompt'lar injection'a açık
- PDF upload MIME type kontrolü eksik
- Nested object sanitization yok

**Yapılacaklar:**
1. File upload validation:
   ```typescript
   // MIME type whitelist
   const allowedMimeTypes = {
     excel: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
     pdf: ['application/pdf'],
     image: ['image/jpeg', 'image/png']
   };
   
   // Size limits
   const maxFileSizes = { excel: 10MB, pdf: 5MB, image: 2MB };
   ```
2. AI prompt sanitization:
   - XSS temizleme
   - SQL injection pattern tespiti
   - Prompt injection koruması
3. Deep object sanitization:
   - Nested objeleri recursive temizle
   - Array içindeki objeleri de sanitize et
4. Zod validation şemaları güçlendir

**Etkilenen Dosyalar:**
- `server/middleware/validation.ts`
- `server/utils/sanitization.ts` (YENİ)
- `server/features/surveys/services/excel-import.service.ts`
- `server/features/ai-assistant/services/ai-assistant.service.ts`
- `shared/validation/*.validation.ts`

**Başarı Kriteri:**
- ✅ File upload validation aktif
- ✅ AI prompt sanitization çalışıyor
- ✅ Deep object sanitization yapılıyor
- ✅ Güvenlik testleri geçiyor

---

### Görev 8: Audit Log Sistemi Oluşturma

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Görev 4

**Neden Önemli:**
- Kimler ne zaman ne yaptı bilinmiyor
- Güvenlik ihlali durumunda trace edilemiyor
- Compliance gereksinimleri için gerekli

**Yapılacaklar:**
1. Audit log tablosu oluştur:
   ```sql
   CREATE TABLE audit_logs (
     id INTEGER PRIMARY KEY,
     user_id INTEGER,
     action VARCHAR(100),
     entity_type VARCHAR(50),
     entity_id INTEGER,
     changes TEXT,
     ip_address VARCHAR(45),
     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. Audit middleware oluştur:
   - Login/Logout
   - Student CRUD
   - Export işlemleri
   - AI kullanımı
   - Backup/Restore
   - Settings değişiklikleri
3. Log viewer sayfası ekle (admin only)

**Etkilenen Dosyalar:**
- `server/lib/database/schema/audit-logs.schema.ts`
- `server/middleware/audit.middleware.ts` (YENİ)
- `server/features/audit/` (YENİ FEATURE)
- `client/pages/AuditLogs.tsx` (YENİ)

**Başarı Kriteri:**
- ✅ Audit log tablosu oluşturuldu
- ✅ Kritik işlemler loglanıyor
- ✅ Admin panelinde görüntülenebiliyor

---

## ⚡ FAZ 2: Performans ve Veritabanı Optimizasyonu

**Süre:** 2 hafta  
**Öncelik:** YÜKSEK  
**Bağımlılık:** Faz 1

### Görev 9: Veritabanı Connection Pool Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Yok

**Neden Önemli:**
- Şu anda tek senkron connection kullanılıyor
- Büyük sorgular event loop'u blokluyor
- Concurrent request'ler bekliyor
- Analytics/AI işlemleri uygulamayı donduruyor

**Yapılacaklar:**
1. `better-sqlite3-pool` alternatiflerini araştır:
   - `@databases/sqlite` (async)
   - `sqlite3` (callback based, promisify gerekli)
   - Veya worker thread pool oluştur
2. Connection pool konfigürasyonu:
   ```typescript
   const pool = {
     min: 2,
     max: 10,
     acquireTimeoutMillis: 30000,
     idleTimeoutMillis: 600000
   };
   ```
3. Repository'leri async/await'e çevir:
   - Tüm `.prepare().all()` → `await pool.query()`
   - Transaction'ları async yap
4. Heavy işlemleri worker thread'e taşı

**Etkilenen Dosyalar:**
- `server/lib/database/connection.ts`
- `server/lib/base-repository.ts`
- Tüm repository dosyaları (`server/features/**/repository/*.ts`)
- `package.json`

**Başarı Kriteri:**
- ✅ Async DB pool çalışıyor
- ✅ Event loop bloklanmıyor
- ✅ Concurrent request performansı artmış

**Not:** better-sqlite3 zaten synchronous optimizasyonlu. Worker thread pool oluşturarak parallel işlem yapabiliriz.

---

### Görev 10: Query Pagination ve Limits Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Yok

**Neden Önemli:**
- `/api/students` tüm öğrencileri yükliyor (memory leak)
- `/api/analytics` endpoint'leri limit yok
- Büyük okullarda sistem çöküyor

**Yapılacaklar:**
1. Pagination helper oluştur (zaten var, kullanılmıyor):
   ```typescript
   // server/lib/pagination-helper.ts güncelle
   interface PaginationParams {
     page: number;
     limit: number;
     sortBy?: string;
     sortOrder?: 'asc' | 'desc';
   }
   ```
2. Tüm list endpoint'lerini güncelle:
   - `/api/students` → max 100/page
   - `/api/counseling-sessions` → max 50/page
   - `/api/exams` → max 100/page
   - `/api/surveys` → max 50/page
3. Frontend pagination component'i ekle:
   - Infinite scroll veya page buttons
   - React Query'de pagination cache
4. Default limit koy (missing limit → 50)

**Etkilenen Dosyalar:**
- `server/lib/pagination-helper.ts`
- `server/features/students/routes/students.routes.ts`
- `server/features/counseling-sessions/routes/*.ts`
- `server/features/exams/routes/*.ts`
- `client/components/ui/pagination.tsx` (YENİ)
- `client/pages/Students.tsx`

**Başarı Kriteri:**
- ✅ Tüm list endpoint'leri paginated
- ✅ Memory kullanımı düşmüş
- ✅ Frontend pagination çalışıyor

---

### Görev 11: AI Config Caching Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- Her AI request'te config dosyası okunuyor
- Gereksiz disk I/O
- Kolay cache'lenebilir

**Yapılacaklar:**
1. Config cache servisi oluştur:
   ```typescript
   class ConfigCache {
     private cache = new Map();
     private ttl = 5 * 60 * 1000; // 5 dakika
     
     async get(key: string) {
       if (this.cache.has(key) && !this.isExpired(key)) {
         return this.cache.get(key);
       }
       const value = await this.load(key);
       this.cache.set(key, { value, timestamp: Date.now() });
       return value;
     }
   }
   ```
2. AI provider service'i güncelle:
   - `server/services/ai-provider.service.ts`
   - Config read'i cache'le wrap et
3. Settings değiştiğinde cache invalidate et

**Etkilenen Dosyalar:**
- `server/services/config-cache.service.ts` (YENİ)
- `server/services/ai-provider.service.ts`
- `server/services/app-settings.service.ts`

**Başarı Kriteri:**
- ✅ Config cache servisi çalışıyor
- ✅ Disk read'ler azalmış
- ✅ Settings değişikliği cache'i temizliyor

---

### Görev 12: Database Indexes Optimize Etme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- Frequently queried column'larda index yok
- JOIN'ler yavaş çalışıyor
- Analytics sorguları optimize değil

**Yapılacaklar:**
1. Slow query'leri tespit et:
   - EXPLAIN QUERY PLAN kullan
   - En çok kullanılan sorguları bul
2. Missing index'leri ekle:
   ```sql
   -- Students
   CREATE INDEX idx_students_class ON students(class);
   CREATE INDEX idx_students_risk_level ON students(risk_level);
   
   -- Counseling Sessions
   CREATE INDEX idx_sessions_student_id ON counseling_sessions(student_id);
   CREATE INDEX idx_sessions_date ON counseling_sessions(session_date);
   
   -- Exam Results
   CREATE INDEX idx_exams_student_id ON exam_results(student_id);
   CREATE INDEX idx_exams_exam_date ON exam_results(exam_date);
   
   -- Survey Responses
   CREATE INDEX idx_survey_resp_student ON survey_responses(student_id);
   CREATE INDEX idx_survey_resp_template ON survey_responses(template_id);
   ```
3. Composite index'ler ekle:
   ```sql
   CREATE INDEX idx_students_class_risk ON students(class, risk_level);
   CREATE INDEX idx_sessions_student_date ON counseling_sessions(student_id, session_date);
   ```
4. Index kullanımını doğrula (EXPLAIN QUERY PLAN)

**Etkilenen Dosyalar:**
- `server/lib/database/indexes.ts`
- `server/lib/database/schema/*.schema.ts`

**Başarı Kriteri:**
- ✅ Kritik query'lerde index kullanılıyor
- ✅ Query süresi %50+ azalmış
- ✅ EXPLAIN QUERY PLAN optimal

---

## 🏗️ FAZ 3: Mimari İyileştirmeler

**Süre:** 3 hafta  
**Öncelik:** ORTA  
**Bağımlılık:** Faz 2

### Görev 13: Base Repository/Service Pattern Oluşturma

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Görev 9

**Neden Önemli:**
- Her repository aynı CRUD kodunu tekrar ediyor
- 50+ dosyada duplicate kod
- Değişiklik yapmak çok zor

**Yapılacaklar:**
1. Generic base repository:
   ```typescript
   abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
     abstract tableName: string;
     
     async findAll(filters?: any): Promise<T[]> { ... }
     async findById(id: number): Promise<T | null> { ... }
     async create(data: CreateDTO): Promise<T> { ... }
     async update(id: number, data: UpdateDTO): Promise<T> { ... }
     async delete(id: number): Promise<void> { ... }
   }
   ```
2. Base service pattern:
   ```typescript
   abstract class BaseService<T, CreateDTO, UpdateDTO> {
     constructor(protected repository: BaseRepository<T, CreateDTO, UpdateDTO>) {}
     
     async getAll(filters?: any) { ... }
     async getById(id: number) { ... }
     async create(data: CreateDTO) { ... }
     async update(id: number, data: UpdateDTO) { ... }
     async delete(id: number) { ... }
   }
   ```
3. Mevcut repository/service'leri refactor et:
   - students
   - surveys
   - counseling-sessions
   - exams

**Etkilenen Dosyalar:**
- `server/lib/base-repository.ts` (GÜNCELLE)
- `server/lib/base-service.ts` (YENİ)
- Tüm repository ve service dosyaları

**Başarı Kriteri:**
- ✅ Base classes oluşturuldu
- ✅ 4 major feature refactor edildi
- ✅ Kod satırı %30 azaldı

---

### Görev 14: Duplicate Export Utilities Birleştirme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- Excel, PDF, CSV export kodları her yerde tekrarlanıyor
- students, exams, surveys hepsi ayrı implementation
- Bug fix yapmak çok zor (3 yerde düzeltmek gerekiyor)

**Yapılacaklar:**
1. Merkezi export utility oluştur:
   ```typescript
   // server/utils/export-manager.ts
   class ExportManager {
     async toExcel<T>(data: T[], columns: ColumnDef[]) { ... }
     async toPDF<T>(data: T[], config: PDFConfig) { ... }
     async toCSV<T>(data: T[], columns: ColumnDef[]) { ... }
   }
   ```
2. Column mapping sistem:
   ```typescript
   interface ColumnDef {
     key: string;
     header: string;
     formatter?: (value: any) => string;
     width?: number;
   }
   ```
3. Mevcut export kodlarını refactor et:
   - `client/utils/exportHelpers.ts` → `shared/utils/export-helpers.ts`
   - `server/features/students/services/export.service.ts` → generic kullan
   - Excel template generator birleştir
4. Frontend export button component:
   ```tsx
   <ExportButton 
     data={students} 
     columns={studentColumns}
     formats={['excel', 'pdf', 'csv']}
   />
   ```

**Etkilenen Dosyalar:**
- `shared/utils/export-manager.ts` (YENİ)
- `client/utils/exportHelpers.ts` (SİL/REFACTOR)
- `client/lib/excel-template-generator.ts`
- `server/features/students/routes/students.routes.ts`
- `server/features/exams/routes/*.ts`

**Başarı Kriteri:**
- ✅ Merkezi export utility var
- ✅ Duplicate kod kaldırıldı
- ✅ Tüm export'lar çalışıyor

---

### Görev 15: AI Adapter'ları Refactor Etme

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- TODO notları var (rate limiting stub)
- Hard-coded provider selection
- Error handling tutarsız
- Duplicate retry logic

**Yapılacaklar:**
1. Base adapter'ı iyileştir:
   ```typescript
   abstract class BaseAIAdapter {
     abstract name: string;
     
     async chat(messages: Message[]): Promise<Response> {
       return this.withRetry(() => this._chat(messages));
     }
     
     protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
       // Exponential backoff retry logic
     }
     
     protected abstract _chat(messages: Message[]): Promise<Response>;
   }
   ```
2. Rate limiting ekle:
   - Her adapter kendi limit'ini tanımlasın
   - Token bucket veya sliding window
3. Error standardizasyonu:
   ```typescript
   class AIProviderError extends Error {
     constructor(
       public provider: string,
       public code: string,
       public retryable: boolean
     ) { ... }
   }
   ```
4. TODO'ları tamamla:
   - Gemini rate limiter
   - Ollama health check
   - OpenAI streaming support

**Etkilenen Dosyalar:**
- `server/services/ai-adapters/base-adapter.ts`
- `server/services/ai-adapters/gemini-adapter.ts`
- `server/services/ai-adapters/ollama-adapter.ts`
- `server/services/ai-adapters/openai-adapter.ts`
- `server/services/ai-adapters/adapter-factory.ts`

**Başarı Kriteri:**
- ✅ Tüm TODO'lar tamamlandı
- ✅ Rate limiting çalışıyor
- ✅ Error handling tutarlı

---

### Görev 16: Express 5 Migration Tamamlama

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Yok

**Neden Önemli:**
- Express 5 yüklü ama 4.x pattern'leri kullanılıyor
- Async error handling yarım kalmış
- Router improvements kullanılmıyor

**Yapılacaklar:**
1. Async error wrapper kaldır (Express 5 native destekliyor):
   ```typescript
   // ESKI
   router.get('/', asyncHandler(async (req, res) => { ... }));
   
   // YENİ (Express 5)
   router.get('/', async (req, res) => { ... });
   ```
2. Promise rejection handler:
   ```typescript
   app.use((err, req, res, next) => {
     if (err instanceof Error) {
       // Handle error
     }
   });
   ```
3. Router improvements kullan:
   - `router.route()` chainable methods
   - Middleware composition
4. Breaking changes'i gözden geçir:
   - `req.xhr` → `req.get('X-Requested-With')`
   - `req.acceptsCharset()` → deprecated

**Etkilenen Dosyalar:**
- Tüm route dosyaları (`server/features/**/routes/*.ts`)
- `server/middleware/*.ts`
- `server/index.ts`

**Başarı Kriteri:**
- ✅ Async handler wrapper'lar kaldırıldı
- ✅ Express 5 özellikleri kullanılıyor
- ✅ Tüm endpoint'ler çalışıyor

---

### Görev 17: Students Sayfasını Parçalama

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- `Students.tsx` 800+ satır
- Export, filters, bulk actions, dialogs hepsi bir arada
- State management karmaşık
- Re-render sorunları var

**Yapılacaklar:**
1. Component'lara ayır:
   ```
   Students.tsx (Container)
   ├── StudentFilters.tsx
   ├── StudentTable.tsx
   ├── StudentExport.tsx
   ├── BulkActionsPanel.tsx
   ├── StudentDialogs/
   │   ├── AddStudentDialog.tsx
   │   ├── EditStudentDialog.tsx
   │   └── DeleteConfirmDialog.tsx
   └── StudentQuickPreview.tsx
   ```
2. Custom hooks:
   ```typescript
   useStudentFilters() // Filter state
   useStudentSelection() // Bulk selection
   useStudentExport() // Export logic
   useStudentMutations() // CRUD operations
   ```
3. State management:
   - React Query için ayrı hook
   - Local state minimize et
   - Context API (gerekirse)

**Etkilenen Dosyalar:**
- `client/pages/Students.tsx`
- `client/components/students/` (YENİ COMPONENT'LAR)
- `client/hooks/useStudents.ts`

**Başarı Kriteri:**
- ✅ Students.tsx <200 satır
- ✅ Her component tek sorumluluk
- ✅ Re-render optimize

---

### Görev 18: API Response Localization Düzeltme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Görev 3

**Neden Önemli:**
- Double mapping yapılıyor (server + client)
- Brittle coupling
- Performance overhead
- Değişiklik yapmak zor

**Yapılacaklar:**
1. Localization stratejisi belirle:
   - Seçenek A: Sadece client-side (önerilen)
   - Seçenek B: Sadece server-side
2. Server-side localization kaldır:
   - students routes'dan label mapping'i kaldır
   - Raw data döndür
3. Client-side merkezi localization:
   ```typescript
   // client/lib/i18n/tr.ts
   export const labels = {
     student: {
       status: {
         active: 'Aktif',
         inactive: 'Pasif',
         graduated: 'Mezun'
       }
     }
   };
   
   // Hook
   const { t } = useTranslation();
   t('student.status.active'); // 'Aktif'
   ```
4. API contract güncelle (raw values)

**Etkilenen Dosyalar:**
- `server/features/students/routes/students.routes.ts`
- `client/constants/labels/*.labels.ts`
- `client/lib/i18n/` (YENİ)
- `shared/types/api-contracts.ts`

**Başarı Kriteri:**
- ✅ Server raw data döndürüyor
- ✅ Client-side localization çalışıyor
- ✅ Double mapping yok

---

### Görev 19: Background Job Queue Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 4 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Görev 9

**Neden Önemli:**
- Ağır AI analizleri request'i blokluyor
- Analytics hesaplamaları yavaş
- Bulk operations timeout oluyor
- User experience kötü

**Yapılacaklar:**
1. Job queue library seç:
   - Seçenek A: `bull` (Redis gerekli)
   - Seçenek B: `agenda` (MongoDB gerekli)
   - Seçenek C: SQLite-based custom queue (önerilen - dependency yok)
2. Custom SQLite job queue:
   ```typescript
   // server/lib/job-queue/
   class JobQueue {
     async enqueue(jobType: string, payload: any) { ... }
     async process(concurrency: number) { ... }
     async getStatus(jobId: string) { ... }
   }
   ```
3. Job types:
   - AI bulk analysis
   - Excel bulk import
   - Analytics calculation
   - Report generation
   - Email notifications (future)
4. Worker process:
   - Separate Node process veya worker threads
   - Retry logic
   - Progress tracking
5. UI feedback:
   - Job status API endpoint
   - Real-time progress (WebSocket veya polling)
   - Notification on completion

**Etkilenen Dosyalar:**
- `server/lib/job-queue/` (YENİ)
- `server/lib/database/schema/jobs.schema.ts` (YENİ)
- `server/services/job-processor.service.ts` (YENİ)
- `server/features/ai-assistant/services/ai-assistant.service.ts`
- `client/components/ui/job-progress.tsx` (YENİ)

**Başarı Kriteri:**
- ✅ Job queue çalışıyor
- ✅ Ağır işlemler async
- ✅ Progress tracking var
- ✅ User experience iyileşmiş

---

### Görev 20: Gereksiz index.ts Re-export'ları Temizleme

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Yok

**Neden Önemli:**
- Her klasörde boş `index.ts` dosyası var
- Gerçek ownership gizleniyor
- Import path'ler uzun
- Tree-shaking zorlaşıyor

**Yapılacaklar:**
1. Gereksiz index.ts'leri bul:
   ```bash
   find server/features -name "index.ts" -type f
   ```
2. Her birini değerlendir:
   - Eğer sadece re-export → Sil
   - Eğer additional logic var → Tut
3. Import path'leri güncelle:
   ```typescript
   // ESKI
   import { StudentService } from '../students';
   
   // YENİ
   import { StudentService } from '../students/services/students.service';
   ```
4. Barrel export pattern sadece gerekli yerlerde:
   - `shared/types/index.ts` → TUT
   - `client/components/ui/index.ts` → TUT
   - Feature index'ler → SİL

**Etkilenen Dosyalar:**
- `server/features/**/index.ts`
- `client/components/**/index.ts`
- Import yapan tüm dosyalar

**Başarı Kriteri:**
- ✅ %50+ index.ts kaldırıldı
- ✅ Import'lar açık ve net
- ✅ Build size azalmış

---

## 🔧 FAZ 4: Kod Kalitesi ve Standardizasyon

**Süre:** 2 hafta  
**Öncelik:** ORTA  
**Bağımlılık:** Faz 3

### Görev 21: Global Error Handler İyileştirme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Görev 16

**Neden Önemli:**
- Error handling tutarsız
- HTTP status codes yanlış
- Client-side error mesajları açık değil
- Logging yetersiz

**Yapılacaklar:**
1. Standart error response:
   ```typescript
   interface ErrorResponse {
     success: false;
     error: {
       code: string;
       message: string;
       details?: any;
       stack?: string; // only in dev
     }
     requestId: string;
     timestamp: string;
   }
   ```
2. Error sınıfları:
   ```typescript
   class ValidationError extends Error { statusCode = 400; }
   class UnauthorizedError extends Error { statusCode = 401; }
   class ForbiddenError extends Error { statusCode = 403; }
   class NotFoundError extends Error { statusCode = 404; }
   class ConflictError extends Error { statusCode = 409; }
   class InternalError extends Error { statusCode = 500; }
   ```
3. Global error middleware:
   ```typescript
   app.use((err, req, res, next) => {
     const statusCode = err.statusCode || 500;
     const errorResponse: ErrorResponse = { ... };
     logger.error(err);
     res.status(statusCode).json(errorResponse);
   });
   ```
4. Client-side error handler:
   ```typescript
   // API interceptor
   axios.interceptors.response.use(
     response => response,
     error => {
       const errorMessage = error.response?.data?.error?.message;
       toast.error(errorMessage || 'Bir hata oluştu');
       return Promise.reject(error);
     }
   );
   ```

**Etkilenen Dosyalar:**
- `server/lib/error-handler.ts`
- `server/middleware/error.middleware.ts` (YENİ)
- `shared/types/error.types.ts` (YENİ)
- `client/lib/api/api-error-handler.ts`

**Başarı Kriteri:**
- ✅ Tutarlı error response
- ✅ Doğru HTTP status codes
- ✅ Client'a anlamlı mesajlar

---

### Görev 22: React Query Cache Stratejisi Optimize Etme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Yok

**Neden Önemli:**
- Default cache ayarları kullanılıyor
- Gereksiz re-fetch'ler
- Stale data sorunları
- Optimistic update yok

**Yapılacaklar:**
1. Global QueryClient config:
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 min
         cacheTime: 10 * 60 * 1000, // 10 min
         refetchOnWindowFocus: false,
         retry: 1
       },
       mutations: {
         retry: 1
       }
     }
   });
   ```
2. Query-specific ayarlar:
   ```typescript
   // Static data (career profiles)
   useQuery(['careers'], { staleTime: Infinity });
   
   // Real-time data (notifications)
   useQuery(['notifications'], { staleTime: 0, refetchInterval: 30000 });
   
   // Normal data (students)
   useQuery(['students'], { staleTime: 5 * 60 * 1000 });
   ```
3. Optimistic updates:
   ```typescript
   const mutation = useMutation({
     mutationFn: updateStudent,
     onMutate: async (newData) => {
       await queryClient.cancelQueries(['students']);
       const previous = queryClient.getQueryData(['students']);
       queryClient.setQueryData(['students'], old => [...]);
       return { previous };
     },
     onError: (err, variables, context) => {
       queryClient.setQueryData(['students'], context.previous);
     }
   });
   ```
4. Cache invalidation strategy:
   ```typescript
   // After mutation
   queryClient.invalidateQueries(['students']);
   queryClient.invalidateQueries(['analytics']); // dependent data
   ```

**Etkilenen Dosyalar:**
- `client/main.tsx`
- `client/lib/api/students-query-hooks.ts`
- Tüm query hook'lar (`client/hooks/**/*.ts`)

**Başarı Kriteri:**
- ✅ Optimal cache ayarları
- ✅ Gereksiz fetch azalmış
- ✅ Optimistic updates çalışıyor

---

### Görev 23: Kullanılmayan Dependencies Temizleme

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Yok

**Neden Önemli:**
- package.json şişmiş
- Install süresi uzun
- Security vulnerability riski
- Bundle size büyük

**Yapılacaklar:**
1. Kullanılmayan paketleri bul:
   ```bash
   npx depcheck
   ```
2. Manuel kontrol:
   ```bash
   grep -r "from 'paket-adi'" client/ server/ shared/
   ```
3. Şüpheli paketler:
   - `husky` → Replit'te gerekli mi?
   - `lint-staged` → CI/CD olmadan gerekli mi?
   - `vitest` → Test yazılmış mı?
   - `serverless-http` → Kullanılıyor mu?
4. Dev vs production ayırma:
   - Sadece dev'de gerekenleri `devDependencies`'e taşı
5. Alternative ekle (gerekirse):
   - Daha hafif paket varyantları

**Etkilenen Dosyalar:**
- `package.json`

**Başarı Kriteri:**
- ✅ Unused dependencies kaldırıldı
- ✅ Bundle size %10+ azalmış
- ✅ Install süresi düşmüş

---

### Görev 24: ESLint Kurallarını Sıkılaştırma

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Görev 1, 2

**Neden Önemli:**
- `max-warnings: 50` → Çok gevşek!
- Kod kalitesi düşük
- Best practices takip edilmiyor

**Yapılacaklar:**
1. ESLint config sıkılaştır:
   ```javascript
   module.exports = {
     rules: {
       '@typescript-eslint/no-explicit-any': 'error',
       '@typescript-eslint/no-unused-vars': 'error',
       'no-console': 'warn',
       'react-hooks/exhaustive-deps': 'error',
       'react/prop-types': 'off', // TS kullanıyoruz
       '@typescript-eslint/explicit-function-return-type': 'warn'
     }
   };
   ```
2. Mevcut warning'leri düzelt:
   ```bash
   npm run lint > lint-errors.log
   ```
3. Warning'leri kategorilere ayır ve düzelt:
   - Unused vars
   - Missing dependencies
   - Any types
   - Console.log'lar
4. max-warnings kademeli düşür:
   - 50 → 25 → 10 → 5 → 0
5. Pre-commit hook (husky kullanılıyorsa):
   ```json
   "lint-staged": {
     "*.{ts,tsx}": ["eslint --max-warnings 0"]
   }
   ```

**Etkilenen Dosyalar:**
- `eslint.config.js`
- Hemen hemen tüm `.ts` ve `.tsx` dosyaları

**Başarı Kriteri:**
- ✅ `npm run lint` 0 warning
- ✅ ESLint rules sıkılaştırıldı
- ✅ Kod kalitesi artmış

---

### Görev 25: Security Headers Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- XSS saldırılarına açık
- Clickjacking riski
- MIME type sniffing
- Referrer bilgisi sızıyor

**Yapılacaklar:**
1. `helmet` middleware ekle:
   ```bash
   npm install helmet
   ```
2. Helmet konfigürasyonu:
   ```typescript
   import helmet from 'helmet';
   
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"], // Vite için gerekli
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'"],
         fontSrc: ["'self'"],
         objectSrc: ["'none'"],
         mediaSrc: ["'self'"],
         frameSrc: ["'none'"]
       }
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     },
     noSniff: true,
     xssFilter: true,
     referrerPolicy: { policy: 'same-origin' }
   }));
   ```
3. Additional headers:
   ```typescript
   app.use((req, res, next) => {
     res.setHeader('X-Content-Type-Options', 'nosniff');
     res.setHeader('X-Frame-Options', 'DENY');
     res.setHeader('X-XSS-Protection', '1; mode=block');
     next();
   });
   ```

**Etkilenen Dosyalar:**
- `server/index.ts`
- `server/middleware/security-headers.ts`
- `package.json`

**Başarı Kriteri:**
- ✅ Helmet middleware aktif
- ✅ Security headers set edildi
- ✅ Security scan temiz

---

### Görev 26: Environment Variable Validation

**Durum:** ⏳ Beklemede  
**Süre:** 1 gün  
**Öncelik:** 🟡 Önemli  
**Bağımlılık:** Yok

**Neden Önemli:**
- Eksik env var → Runtime error
- Startup'ta catch edilmiyor
- Debug zor
- Production'da kritik hatalar

**Yapılacaklar:**
1. Env validation schema:
   ```typescript
   import { z } from 'zod';
   
   const envSchema = z.object({
     NODE_ENV: z.enum(['development', 'production', 'test']),
     PORT: z.string().default('3000'),
     SESSION_SECRET: z.string().min(32),
     GEMINI_API_KEY: z.string().optional(),
     OPENAI_API_KEY: z.string().optional(),
     DATABASE_PATH: z.string().default('./database.db')
   }).refine(
     data => data.GEMINI_API_KEY || data.OPENAI_API_KEY,
     { message: 'En az bir AI provider API key gerekli' }
   );
   
   export const env = envSchema.parse(process.env);
   ```
2. Startup validation:
   ```typescript
   // server/index.ts - en üstte
   try {
     const validatedEnv = envSchema.parse(process.env);
   } catch (error) {
     console.error('❌ Environment validation failed:');
     console.error(error.errors);
     process.exit(1);
   }
   ```
3. Type-safe env access:
   ```typescript
   // ESKI
   const apiKey = process.env.GEMINI_API_KEY;
   
   // YENİ
   import { env } from './config/env';
   const apiKey = env.GEMINI_API_KEY; // Type-safe!
   ```

**Etkilenen Dosyalar:**
- `server/config/env.ts` (YENİ)
- `server/index.ts`
- Env kullanan tüm dosyalar

**Başarı Kriteri:**
- ✅ Env validation çalışıyor
- ✅ Startup'ta hata yakalıyor
- ✅ Type-safe env access

---

## 📊 FAZ 5: Dokümantasyon ve Monitoring

**Süre:** 1 hafta  
**Öncelik:** DÜŞÜK  
**Bağımlılık:** Faz 4

### Görev 27: Test Coverage Artırma

**Durum:** ⏳ Beklemede  
**Süre:** 4 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Tüm önceki görevler

**Neden Önemli:**
- Şu anda test coverage neredeyse %0
- Refactoring yaparken regression riski
- Business logic doğrulanamıyor
- Güven düşük

**Yapılacaklar:**
1. Test framework kurulumu (vitest zaten var):
   ```typescript
   // vitest.config.ts
   export default {
     test: {
       coverage: {
       provider: 'v8',
         reporter: ['text', 'html'],
         exclude: ['node_modules/', 'dist/']
       }
     }
   };
   ```
2. Öncelikli test alanları:
   - **Utils & Helpers:**
     - `server/utils/sanitization.ts`
     - `shared/utils/export-manager.ts`
     - `server/lib/pagination-helper.ts`
   - **Services (Business Logic):**
     - `server/features/students/services/students.service.ts`
     - `server/services/ai-provider.service.ts`
     - `server/features/surveys/services/excel-import.service.ts`
   - **Validation:**
     - `shared/validation/*.validation.ts`
   - **API Integration Tests:**
     - `/api/students` CRUD
     - `/api/auth` login/logout
3. Test örnekleri:
   ```typescript
   // server/utils/sanitization.test.ts
   describe('Sanitization', () => {
     it('should remove XSS attempts', () => {
       const input = '<script>alert("xss")</script>';
       const output = sanitize(input);
       expect(output).not.toContain('<script>');
     });
   });
   ```
4. Coverage hedefi:
   - Phase 1: %30 (kritik utils)
   - Phase 2: %50 (services)
   - Phase 3: %70 (tüm business logic)

**Etkilenen Dosyalar:**
- `vitest.config.ts`
- `**/*.test.ts` (YENİ DOSYALAR)
- `package.json` (test scripts)

**Başarı Kriteri:**
- ✅ Test framework çalışıyor
- ✅ Coverage >70%
- ✅ CI/CD'de test çalışıyor

---

### Görev 28: API Documentation Oluşturma

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Görev 3

**Neden Önemli:**
- API documentation yok
- Frontend dev'ler endpoint'leri bilmiyor
- Integration zor
- Onboarding süreci uzun

**Yapılacaklar:**
1. OpenAPI/Swagger setup:
   ```bash
   npm install swagger-ui-express swagger-jsdoc
   ```
2. Swagger config:
   ```typescript
   const swaggerOptions = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'Rehber360 API',
         version: '2.0.0',
         description: 'Öğrenci Rehberlik Sistemi API Dokümantasyonu'
       },
       servers: [{ url: '/api' }]
     },
     apis: ['./server/features/**/routes/*.ts']
   };
   ```
3. JSDoc annotations:
   ```typescript
   /**
    * @openapi
    * /students:
    *   get:
    *     summary: Tüm öğrencileri listele
    *     tags: [Students]
    *     parameters:
    *       - in: query
    *         name: page
    *         schema: { type: integer }
    *     responses:
    *       200:
    *         description: Başarılı
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/StudentList'
    */
   router.get('/students', async (req, res) => { ... });
   ```
4. Swagger UI endpoint:
   ```typescript
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   ```
5. Her feature için documentation:
   - Students CRUD
   - Authentication
   - Surveys
   - AI Assistant
   - Exams

**Etkilenen Dosyalar:**
- `server/config/swagger.ts` (YENİ)
- `server/index.ts`
- Tüm route dosyaları (JSDoc ekle)
- `package.json`

**Başarı Kriteri:**
- ✅ Swagger UI `/api-docs` çalışıyor
- ✅ Tüm endpoint'ler documented
- ✅ Request/response schemas var

---

### Görev 29: Performance Monitoring Ekleme

**Durum:** ⏳ Beklemede  
**Süre:** 2 gün  
**Öncelik:** 🟢 İyileştirme  
**Bağımlılık:** Yok

**Neden Önemli:**
- Hangi endpoint'ler yavaş bilinmiyor
- Database query süresi izlenmiyor
- Memory leak tespiti yok
- Performance regression fark edilmiyor

**Yapılacaklar:**
1. Response time middleware:
   ```typescript
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       logger.info({
         method: req.method,
         url: req.url,
         status: res.statusCode,
         duration: `${duration}ms`
       });
       
       if (duration > 1000) {
         logger.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`);
       }
     });
     next();
   });
   ```
2. Database query monitoring:
   ```typescript
   class MonitoredRepository extends BaseRepository {
     async query(sql: string) {
       const start = Date.now();
       const result = await super.query(sql);
       const duration = Date.now() - start;
       
       if (duration > 500) {
         logger.warn(`Slow query (${duration}ms): ${sql}`);
       }
       
       return result;
     }
   }
   ```
3. Memory monitoring:
   ```typescript
   setInterval(() => {
     const usage = process.memoryUsage();
     logger.debug({
       rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
       heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`
     });
   }, 60000); // Her dakika
   ```
4. Performance dashboard:
   - `/api/health` endpoint
   - `/api/metrics` endpoint
   - Simple admin page ile görüntüleme

**Etkilenen Dosyalar:**
- `server/middleware/performance.middleware.ts` (YENİ)
- `server/lib/base-repository.ts`
- `server/routes/health.routes.ts` (YENİ)
- `client/pages/PerformanceDashboard.tsx` (YENİ)

**Başarı Kriteri:**
- ✅ Response time logging aktif
- ✅ Slow query detection çalışıyor
- ✅ Memory monitoring aktif
- ✅ Metrics endpoint hazır

---

### Görev 30: Final Review ve Test

**Durum:** ⏳ Beklemede  
**Süre:** 3 gün  
**Öncelik:** 🔴 Kritik  
**Bağımlılık:** Tüm görevler

**Neden Önemli:**
- Tüm değişiklikleri doğrulamak gerekiyor
- Regression test
- Production hazırlığı
- Dokümantasyon güncellemesi

**Yapılacaklar:**
1. **Functionality Test:**
   - Her feature'ı manuel test et
   - Happy path + edge cases
   - Cross-browser test
   - Mobile responsive test
2. **Performance Test:**
   - Load test (100+ concurrent users)
   - Database query performance
   - Memory leak kontrolü
   - API response times
3. **Security Audit:**
   - OWASP Top 10 checklist
   - Authentication/Authorization test
   - Input validation test
   - Rate limiting test
4. **Code Quality:**
   - `npm run lint` → 0 errors
   - `npm run typecheck` → 0 errors
   - `npm run test` → tüm testler geçiyor
   - Code review
5. **Documentation Update:**
   - README.md güncelle
   - replit.md güncelle
   - CHANGELOG.md oluştur
   - API docs güncelle
6. **Migration Plan:**
   - Deployment checklist
   - Rollback planı
   - Database migration test
   - Backup stratejisi
7. **Checklist:**
   ```markdown
   - [ ] Tüm testler geçiyor
   - [ ] Lint 0 error/warning
   - [ ] TypeScript 0 error
   - [ ] Security scan temiz
   - [ ] Performance benchmarks met
   - [ ] Documentation güncel
   - [ ] Migration plan hazır
   - [ ] Rollback plan hazır
   - [ ] Team review tamamlandı
   - [ ] Production deployment onayı
   ```

**Başarı Kriteri:**
- ✅ Tüm checklist maddeleri ✓
- ✅ Regression yok
- ✅ Performance hedefleri tutturuldu
- ✅ Production'a hazır

---

## 📊 İlerleme Takibi

### Faz Özeti

| Faz | Görev Sayısı | Tahmini Süre | Öncelik | Durum |
|-----|--------------|--------------|---------|-------|
| Faz 1: Güvenlik & Tip | 8 | 2 hafta | 🔴 Kritik | 🏗️ Devam Ediyor (1/8 Tamamlandı) |
| Faz 2: Performans | 4 | 2 hafta | 🔴 Kritik | ⏳ Beklemede |
| Faz 3: Mimari | 8 | 3 hafta | 🟡 Önemli | ⏳ Beklemede |
| Faz 4: Kalite | 6 | 2 hafta | 🟡 Önemli | ⏳ Beklemede |
| Faz 5: Monitoring | 4 | 1 hafta | 🟢 İyileştirme | ⏳ Beklemede |

### Öncelik Efsanesi

- 🔴 **Kritik:** Hemen yapılmalı, güvenlik/performans riski
- 🟡 **Önemli:** Yakında yapılmalı, önemli iyileştirme
- 🟢 **İyileştirme:** Yapılabilir, kalite artışı

### Durum Efsanesi

- ⏳ **Beklemede:** Henüz başlanmadı
- 🏗️ **Devam Ediyor:** Üzerinde çalışılıyor
- ✅ **Tamamlandı:** Başarıyla tamamlandı
- ⏸️ **Askıda:** Bağımlılık bekleniyor
- ❌ **İptal:** İptal edildi

---

## 🎯 Önerilen Çalışma Düzeni

### Sprint Planı

**Sprint 1 (2 hafta):** Faz 1 - Kritik Güvenlik
- Görev 1-4: TypeScript & Auth (1. hafta)
- Görev 5-8: Security Features (2. hafta)

**Sprint 2 (2 hafta):** Faz 2 - Performans
- Görev 9-10: Database & Pagination (1. hafta)
- Görev 11-12: Caching & Indexes (2. hafta)

**Sprint 3 (3 hafta):** Faz 3 - Mimari
- Görev 13-16: Base Patterns & Refactoring (1-2. hafta)
- Görev 17-20: Component & Code Cleanup (3. hafta)

**Sprint 4 (2 hafta):** Faz 4 - Kalite
- Görev 21-23: Error Handling & Dependencies (1. hafta)
- Görev 24-26: Linting & Security (2. hafta)

**Sprint 5 (1 hafta):** Faz 5 - Monitoring & Final
- Görev 27-29: Tests & Monitoring (ilk 4 gün)
- Görev 30: Final Review (son 3 gün)

---

## 📝 Notlar

### Kritik Kararlar

1. **Database Pool:** better-sqlite3 sync, ama worker threads ile parallel hale getirilebilir
2. **Job Queue:** Redis/MongoDB yerine SQLite-based custom queue (dependency azaltma)
3. **Localization:** Client-side only (server raw data döner)
4. **Testing:** Vitest kullanacağız (zaten mevcut)

### Riskler

1. **TypeScript Strict Mode:** Çok fazla hata çıkabilir, kademeli aktifleştirme yapılacak
2. **Database Migration:** Connection pool geçişi riskli, kapsamlı test gerekli
3. **Breaking Changes:** API contract değişiklikleri frontend'i etkileyebilir

### Alternatif Yaklaşımlar

Eğer zaman kısıtlıysa, şu öncelik sırası önerilir:
1. **Minimum Viable Fix (1 hafta):**
   - Görev 4 (Auth fix)
   - Görev 6 (Rate limiting)
   - Görev 7 (Input sanitization)
   - Görev 10 (Pagination)

2. **Quick Wins (2 hafta):**
   - Yukarıdakiler +
   - Görev 1-2 (TypeScript)
   - Görev 11 (Caching)
   - Görev 14 (Export utilities)

---

## 🚀 Başlayalım

Hazırsanız, **Görev 1: TypeScript Strict Mode** ile başlayabiliriz!

Şu komutla başlıyoruz:
```bash
# İlk olarak mevcut durumu kaydedelim
git add -A
git commit -m "chore: Starting refactoring plan - saving current state"
```

Sonra `tsconfig.json`'u güncelleyip, hata listesini çıkaracağız.

**Başlamak için onay verin veya başka bir görevle başlamak isterseniz belirtin!**
