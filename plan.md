# 📋 Öğrenci Profil Anket Sistemi - Implementasyon Rehberi

## 📌 İçindekiler
1. [Sistem Genel Bakış](#1-sistem-genel-bakış)
2. [Mimari Tasarım](#2-mimari-tasarım)
3. [Link Dağıtım Sistemi](#3-link-dağıtım-sistemi)
4. [Database Schema](#4-database-schema)
5. [Backend API Tasarımı](#5-backend-api-tasarımı)
6. [Veri Eşleştirme Sistemi](#6-veri-eşleştirme-sistemi)
7. [QR Kod ve PDF Sistemi](#7-qr-kod-ve-pdf-sistemi)
8. [Frontend Bileşenler](#8-frontend-bileşenler)
9. [Güvenlik ve KVKK Uyumluluk](#9-güvenlik-ve-kvkk-uyumluluk)
10. [İmplementasyon Aşamaları](#10-implementasyon-aşamaları)
11. [Örnek Anket Şablonları](#11-örnek-anket-şablonları)
12. [Test Senaryoları](#12-test-senaryoları)

---

## 1. Sistem Genel Bakış

### 🎯 Problem
Rehber öğretmenleri, öğrenci profil bilgilerini manuel olarak tek tek girmek zorunda kalıyor. Bu:
- ⏱️ Çok zaman alıcı
- ❌ Hatalara açık
- 📉 Profil tamamlanma oranlarını düşürüyor
- 🔄 Güncelleme zorluğu yaratıyor

### 💡 Çözüm
Öğrencilerin kendi profil bilgilerini **link/QR kod üzerinden** anketler aracılığıyla girmesini sağlayan, rehber öğretmen onayı ile çalışan akıllı bir sistem.

### ⭐ Temel Özellikler

#### 🎯 Modüler Yapı
- 6 kategori: Akademik, Sosyal-Duygusal, Kariyer, Sağlık, Aile, Yetenek/Hobiler
- Her anket bağımsız olarak dağıtılabilir
- Mevcut "Anket ve Test" sistemi içinde yeni kategori

#### 🔗 İki Dağıtım Modu
**1. Genel Link (Kimlik Doğrulamalı)**
- Tek link, tüm öğrenciler için
- Öğrenci TC/Öğrenci No ile giriş yapar
- Web sitesinde, WhatsApp grubunda paylaşılabilir

**2. Özel Linkler (QR Kodlu)**
- Her öğrenciye benzersiz link + QR kod
- Kimlik doğrulama gerektirmez
- PDF bastırılıp sınıfta dağıtılır
- Öğrenci eve gidince doldurur

#### 👥 Kullanıcı Rolleri
- **Rehber Öğretmen**: Sistemi kullanır, anket oluşturur, dağıtır, onaylar
- **Öğrenci**: Login gerektirmez, sadece link/QR üzerinden anketi doldurur
- **Sistem**: AI ile veri işler, profil güncelleme önerileri oluşturur

### 🎁 Faydalar
- ✅ **Rehber öğretmen iş yükü %70-80 azalır**
- ✅ **Öğrenci katılımı ve farkındalığı artar**
- ✅ **Veriler daha güncel ve doğru olur**
- ✅ **Esnek dağıtım** (Web link veya QR kod)
- ✅ **AI sistemi daha iyi çalışır** (daha fazla kaliteli veri)
- ✅ **KVKK uyumlu** (öğrenci ve veli onaylı veri toplama)
- ✅ **Profil tamamlanma oranı artış**

### 🔄 Veri Akışı

```
┌──────────────────────────────────────────────────┐
│        REHBER ÖĞRETMEN                           │
│  1. Anket Oluştur (Akademik/Sosyal/Kariyer...)  │
│  2. Dağıtım Modu Seç:                            │
│     ☐ Genel Link (Web'de paylaş)                │
│     ☑ Özel Linkler (QR bastır)                  │
│  3. Hedef Öğrencileri Seç                        │
│  4. Link/QR Oluştur                              │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        DAĞITIM SİSTEMİ                           │
│  • Genel Link: Web sitesine koy                  │
│  • Özel Linkler: PDF çıktı al, bastır, dağıt    │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        ÖĞRENCİ (Login Yok!)                      │
│  • Link tıkla VEYA QR okut                       │
│  • (Genel linkse) TC/Öğrenci No gir              │
│  • Anketi doldur                                 │
│  • Gönder                                        │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        AI İLE VERİ İŞLEME                        │
│  • Standartlaştırma                              │
│  • Kategorizasyon                                │
│  • Güvenlik Kontrolü                             │
│  • Profil alanlarına eşleştirme                  │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        ONAY KUYRUĞU                              │
│  Rehber öğretmen için hazır güncellemeler        │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        REHBER ÖĞRETMEN ONAY PANELİ              │
│  • Öğrenci cevaplarını incele                    │
│  • Profil güncelleme önerilerini gözden geçir    │
│  • Onayla / Reddet / Düzenle                     │
└──────────────┬───────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────┐
│        OTOMATİK PROFİL GÜNCELLEME                │
│  • Onaylanan veriler profillere yazılır          │
│  • Audit log kaydedilir                          │
│  • AI sistemi için veri hazır                    │
└──────────────────────────────────────────────────┘
```

---

## 2. Mimari Tasarım

### 🏗️ Sistem Mimarisi

#### Katmanlar

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Rehber Öğretmen Paneli (Login Gerekli)        │    │
│  │  - Anket oluşturma ve düzenleme                │    │
│  │  - Dağıtım modu seçimi                          │    │
│  │  - Link/QR oluşturma ve yönetimi                │    │
│  │  - Takip paneli (kim doldurdu/doldurmadı)       │    │
│  │  - Onay kuyruğu                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Öğrenci Anket Sayfası (Login YOK!)             │    │
│  │  - Genel link: Kimlik doğrulama ekranı          │    │
│  │  - Özel link: Direkt anket açılır               │    │
│  │  - Anket doldurma arayüzü                       │    │
│  │  - Teşekkür/Onay ekranı                         │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                           │
│  - Survey Link API (link oluşturma, doğrulama)          │
│  - Student Verification API (TC/No doğrulama)           │
│  - Response Submission API (cevap kaydetme)             │
│  - Profile Mapping API (veri eşleştirme)                │
│  - Approval Queue API (onay süreci)                     │
│  - QR/PDF Generation API (PDF oluşturma)                │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                         │
│  - Link Generation Service (güvenli token oluşturma)    │
│  - Student Auth Service (kimlik doğrulama)              │
│  - Data Mapping Service (cevap → profil eşleştirme)     │
│  - AI Standardization Service (AI ile standartlaştırma) │
│  - Approval Workflow Service (onay süreci yönetimi)     │
│  - Profile Update Service (otomatik güncelleme)         │
│  - QR Code Service (QR oluşturma)                       │
│  - PDF Generation Service (çıktı oluşturma)             │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│  - Survey Templates (anket şablonları)                   │
│  - Survey Links (genel/özel linkler)                     │
│  - Link Tracking (takip kayıtları)                       │
│  - Student Responses (öğrenci cevapları)                 │
│  - Mapping Rules (eşleştirme kuralları)                  │
│  - Profile Update Queue (onay kuyruğu)                   │
│  - Audit Logs (denetim kayıtları)                        │
└─────────────────────────────────────────────────────────┘
```

### 🔌 Mevcut Sistemle Entegrasyon

Bu sistem, mevcut Rehber360 sistemine tam entegre olacak:

1. **Mevcut Survey/Test Sistemi**: 
   - Genişletilecek (yeni kategori: "Öğrenci Profil Anketi")
   - Normal anketlerle aynı oluşturma arayüzü
   - Ek özellik: Dağıtım modu seçimi ve profil eşleştirme

2. **Student Management**: 
   - TC kimlik no ve öğrenci no ile doğrulama
   - Sınıf/şube filtreleme

3. **AI Suggestion Queue**: 
   - Profil güncelleme önerileri için kullanılacak
   - Mevcut onay mekanizması genişletilecek

4. **Student Profile**: 
   - Onaylanan verilerle otomatik güncelleme
   - Standartlaştırılmış profil alanları

### 📊 Veri Modeli Özeti

```
survey_templates (mevcut - genişletilecek)
    ↓
    category: 'STUDENT_PROFILE' (yeni)
    profileMappingEnabled: true
    ↓
survey_links (yeni)
    ├── Genel Link (publicLink: true)
    └── Özel Linkler (publicLink: false, studentId: specific)
    ↓
student_responses (yeni)
    ↓
profile_mapping_rules (yeni)
    ↓
profile_update_queue (yeni)
    ↓
students (mevcut - güncellenecek)
```

---

## 3. Link Dağıtım Sistemi

### 🔗 İki Dağıtım Modu Detayları

#### Mod 1: Genel Link (Public Link)

**Kullanım Senaryoları:**
- Tüm okula duyuru yapılacak
- Web sitesinde paylaşılacak
- WhatsApp grubuna atılacak
- Toplu e-posta gönderilecek

**Çalışma Prensibi:**
```
1. Rehber öğretmen "Genel Link" seçer
2. Sistem tek bir public link oluşturur
   Örnek: https://rehber360.com/survey/public/abc123xyz
3. Link tıklanınca → Kimlik doğrulama ekranı açılır
4. Öğrenci TC kimlik no veya Öğrenci no girer
5. Sistem öğrenciyi tanır
6. Eğer geçerliyse → Anketi açar
7. Eğer daha önce doldurduysa → "Zaten doldurdunuz" mesajı
```

**Güvenlik:**
- Link herkese açık ama kimlik doğrulama gerekli
- Rate limiting (saniyede max 5 istek)
- CAPTCHA (opsiyonel, çok fazla deneme olursa)
- IP takibi (kötüye kullanım tespiti)

**Avantajlar:**
- Tek link, kolay paylaşım
- Toplu dağıtım için ideal
- E-posta/telefon gerekmez

**Dezavantajlar:**
- Öğrenci TC/No bilmeli
- Takip daha zor (kim tıkladı ama doldurmadı?)

---

#### Mod 2: Özel Linkler (Personal Links)

**Kullanım Senaryoları:**
- Belirli öğrenci grubuna özel
- Takip önemli (kim doldurdu/doldurmadı)
- QR kod ile fiziksel dağıtım
- Güvenlik öncelikli

**Çalışma Prensibi:**
```
1. Rehber öğretmen "Özel Linkler" seçer
2. Hedef öğrencileri seçer (örn: 9-A sınıfı, 25 öğrenci)
3. Sistem her öğrenci için benzersiz token oluşturur
   Ahmet: https://rehber360.com/survey/s/token_ahmet_123
   Ayşe:  https://rehber360.com/survey/s/token_ayse_456
4. QR kod + öğrenci bilgili PDF oluşturur
5. Rehber öğretmen PDF'i bastırır, sınıfta dağıtır
6. Öğrenci QR okutunca → Kimlik doğrulama YOK, direkt anket açılır
7. Cevaplar kaydedilir
```

**PDF Çıktı Formatı:**
```
┌─────────────────────────────────────┐
│  Akademik Profil Anketi             │
│  Rehber360 - 2024/2025 Dönemi       │
├─────────────────────────────────────┤
│  ÖĞRENCİ BİLGİLERİ                  │
│  Ad Soyad: Ahmet Yılmaz             │
│  Sınıf: 9-A                         │
│  Numara: 123                        │
├─────────────────────────────────────┤
│         [QR KOD BURAYA]             │
│                                     │
│      ██████████████                 │
│      ██          ██                 │
│      ██  QR KOD ██                 │
│      ██          ██                 │
│      ██████████████                 │
│                                     │
├─────────────────────────────────────┤
│  Link (QR okutamazsan):             │
│  rehber360.com/s/abc123             │
├─────────────────────────────────────┤
│  ⏰ Son Tarih: 30 Kasım 2024        │
│  📱 Telefonla QR okut, anketi doldur│
└─────────────────────────────────────┘
```

**Güvenlik:**
- Her link tek kullanımlık (opsiyonel)
- Süre sınırı (örn: 30 gün)
- Token tahmin edilemez (crypto random)
- Öğrenci sadece kendi linkini kullanabilir

**Avantajlar:**
- Kimlik doğrulama gerekmez (öğrenci için kolay)
- Tam takip (kim tıkladı, kim doldurmadı)
- QR kod ile modern ve pratik
- Yüksek güvenlik

**Dezavantajlar:**
- PDF bastırma gerekir
- Dağıtım lojistiği (sınıfta kağıt dağıtımı)

---

### 📊 Dağıtım Modu Karşılaştırması

| Özellik | Genel Link | Özel Linkler |
|---------|------------|--------------|
| Paylaşım | Web/WhatsApp | Kağıt/QR kod |
| Kimlik Doğrulama | Gerekli (TC/No) | Gerekmez |
| Takip | Dolduranlar | Tam detay |
| Güvenlik | Orta | Yüksek |
| Kurulum | Çok kolay | Orta (PDF basmak) |
| Kullanım | Toplu duyuru | Özel grup |
| Maliyet | Sıfır | Kağıt + yazıcı |

---

### 🔄 Link Yaşam Döngüsü

**Oluşturma:**
1. Rehber öğretmen anket oluşturur
2. Dağıtım modu seçer
3. "Link Oluştur" butonuna basar
4. Sistem linkler oluşturur (veritabanına kaydeder)
5. PDF/Link rehber öğretmene sunulur

**Aktif Kullanım:**
- Öğrenciler anketi doldurur
- Her tıklama ve doldurma kaydedilir
- Rehber öğretmen canlı takip eder

**Hatırlatma:**
- Doldurmayan öğrenciler listelenir
- Rehber öğretmen hatırlatma gönderebilir (manuel)

**Kapanma:**
- Manuel: Rehber öğretmen "Anketi Kapat" der
- Otomatik: Belirlenen son tarihte otomatik kapanır
- Kapalı linkler çalışmaz ("Anket sona erdi" mesajı)

**Arşivleme:**
- Eski anket linkleri silinmez, arşivlenir
- Raporlama ve denetim için saklanır

---

## 4. Database Schema

### 📦 Yeni Tablolar

#### 4.1. survey_templates (Mevcut - Genişletilecek)

Mevcut anket sistemi tablosuna yeni alanlar eklenecek:

```sql
-- Mevcut survey_templates tablosuna eklenecek alanlar
ALTER TABLE survey_templates ADD COLUMN category TEXT DEFAULT 'GENERAL';
-- 'GENERAL', 'TEST', 'STUDENT_PROFILE'

ALTER TABLE survey_templates ADD COLUMN profileMappingEnabled BOOLEAN DEFAULT FALSE;
-- Öğrenci profil anketi mi? (true ise mapping kuralları aktif)

ALTER TABLE survey_templates ADD COLUMN distributionMode TEXT DEFAULT 'INTERNAL';
-- 'INTERNAL' (sistem içi), 'PUBLIC_LINK' (genel link), 'PERSONAL_LINKS' (özel linkler)

ALTER TABLE survey_templates ADD COLUMN allowAnonymous BOOLEAN DEFAULT FALSE;
-- Anonim katılıma izin var mı?
```

#### 4.2. survey_links (Yeni)

Oluşturulan anket linkleri

```sql
CREATE TABLE IF NOT EXISTS survey_links (
  id TEXT PRIMARY KEY,
  surveyTemplateId TEXT NOT NULL,
  
  -- Link Tipi
  linkType TEXT NOT NULL, -- 'PUBLIC' (genel), 'PERSONAL' (kişiye özel)
  
  -- Token ve URL
  token TEXT NOT NULL UNIQUE, -- Benzersiz güvenli token
  fullUrl TEXT NOT NULL, -- Tam URL
  
  -- Kişiselleştirme (PERSONAL tipinde)
  studentId TEXT, -- Hangi öğrenci için (NULL ise PUBLIC)
  studentName TEXT,
  studentClass TEXT,
  studentNumber TEXT,
  
  -- QR Kod
  qrCodeData TEXT, -- QR kod base64 image data (PERSONAL için)
  pdfGenerated BOOLEAN DEFAULT FALSE,
  pdfFilePath TEXT,
  
  -- Geçerlilik
  isActive BOOLEAN DEFAULT TRUE,
  expiresAt DATETIME, -- Link süresi dolma tarihi
  maxUses INTEGER DEFAULT 1, -- Kaç kez kullanılabilir (PUBLIC için unlimited: -1)
  currentUses INTEGER DEFAULT 0,
  
  -- Takip
  firstAccessedAt DATETIME, -- İlk tıklama
  lastAccessedAt DATETIME, -- Son tıklama
  completedAt DATETIME, -- Doldurulma tarihi
  
  -- Güvenlik
  ipRestrictions TEXT, -- JSON: İzin verilen IP'ler (opsiyonel)
  requiresConsent BOOLEAN DEFAULT FALSE,
  
  createdBy TEXT NOT NULL, -- Oluşturan rehber öğretmen
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (surveyTemplateId) REFERENCES survey_templates (id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users (id)
);

-- İndeksler
CREATE INDEX idx_survey_links_token ON survey_links(token);
CREATE INDEX idx_survey_links_student ON survey_links(studentId);
CREATE INDEX idx_survey_links_template ON survey_links(surveyTemplateId);
```

#### 4.3. survey_link_tracking (Yeni)

Link tıklama ve kullanım takibi

```sql
CREATE TABLE IF NOT EXISTS survey_link_tracking (
  id TEXT PRIMARY KEY,
  linkId TEXT NOT NULL,
  
  -- Olay Bilgisi
  eventType TEXT NOT NULL, -- 'ACCESSED', 'STARTED', 'COMPLETED', 'FAILED'
  eventData TEXT, -- JSON: Ek bilgiler
  
  -- Kullanıcı Bilgisi
  ipAddress TEXT,
  userAgent TEXT,
  deviceType TEXT, -- 'mobile', 'tablet', 'desktop'
  
  -- Kimlik Doğrulama (PUBLIC link için)
  verificationMethod TEXT, -- 'TC_NO', 'STUDENT_NO', 'TOKEN' (PERSONAL)
  verifiedStudentId TEXT,
  
  -- Zaman
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (linkId) REFERENCES survey_links (id) ON DELETE CASCADE,
  FOREIGN KEY (verifiedStudentId) REFERENCES students (id)
);

CREATE INDEX idx_link_tracking_link ON survey_link_tracking(linkId);
CREATE INDEX idx_link_tracking_event ON survey_link_tracking(eventType);
```

#### 4.4. student_survey_responses (Yeni)

Öğrenci anket cevapları

```sql
CREATE TABLE IF NOT EXISTS student_survey_responses (
  id TEXT PRIMARY KEY,
  surveyTemplateId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  linkId TEXT, -- Hangi link üzerinden dolduruldu (NULL ise sistem içi)
  
  -- Cevaplar
  responseData TEXT NOT NULL, -- JSON: {questionId: answer}
  
  -- Durum
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED'
  completionPercentage INTEGER DEFAULT 0,
  
  -- Zaman
  startedAt DATETIME,
  submittedAt DATETIME,
  
  -- Veli Onayı (gerekirse)
  parentConsentGiven BOOLEAN DEFAULT FALSE,
  parentConsentDate DATETIME,
  
  -- AI İşleme
  aiProcessingStatus TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
  aiProcessingErrors TEXT, -- JSON array
  
  -- Onay
  reviewedBy TEXT, -- Rehber öğretmen ID
  reviewedAt DATETIME,
  reviewNotes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (surveyTemplateId) REFERENCES survey_templates (id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (linkId) REFERENCES survey_links (id),
  FOREIGN KEY (reviewedBy) REFERENCES users (id)
);

CREATE INDEX idx_responses_student ON student_survey_responses(studentId);
CREATE INDEX idx_responses_template ON student_survey_responses(surveyTemplateId);
CREATE INDEX idx_responses_status ON student_survey_responses(status);
```

#### 4.5. student_verification_attempts (Yeni)

Kimlik doğrulama denemeleri (PUBLIC link için güvenlik)

```sql
CREATE TABLE IF NOT EXISTS student_verification_attempts (
  id TEXT PRIMARY KEY,
  linkId TEXT NOT NULL,
  
  -- Deneme Bilgisi
  verificationType TEXT NOT NULL, -- 'TC_NO', 'STUDENT_NO'
  inputValue TEXT NOT NULL, -- Girilen değer (hashlenir)
  success BOOLEAN DEFAULT FALSE,
  
  -- Öğrenci (başarılıysa)
  verifiedStudentId TEXT,
  
  -- Güvenlik
  ipAddress TEXT NOT NULL,
  userAgent TEXT,
  
  -- Rate Limiting
  attemptCount INTEGER DEFAULT 1, -- Aynı IP'den kaç deneme
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (linkId) REFERENCES survey_links (id) ON DELETE CASCADE,
  FOREIGN KEY (verifiedStudentId) REFERENCES students (id)
);

CREATE INDEX idx_verification_ip ON student_verification_attempts(ipAddress, created_at);
CREATE INDEX idx_verification_link ON student_verification_attempts(linkId);
```

#### 4.6. survey_questions (Mevcut - Genişletilecek)

Mevcut soru tablosuna profil eşleştirme için yeni alanlar:

```sql
-- Mevcut survey_questions tablosuna eklenecek
ALTER TABLE survey_questions ADD COLUMN profileMappingEnabled BOOLEAN DEFAULT FALSE;
-- Bu soru profil eşleştirme için mi?

ALTER TABLE survey_questions ADD COLUMN targetProfileField TEXT;
-- Hedef profil alanı: 'strongSubjects', 'interests', 'careerGoals' vb.

ALTER TABLE survey_questions ADD COLUMN mappingStrategy TEXT;
-- 'DIRECT', 'AI_PARSE', 'MULTIPLE_FIELDS', 'CALCULATED'

ALTER TABLE survey_questions ADD COLUMN mappingConfig TEXT;
-- JSON: Eşleştirme detayları
```

**mappingConfig Örnekleri:**

```json
// DIRECT - Doğrudan eşleştirme
{
  "strategy": "DIRECT",
  "targetField": "phone",
  "transformType": "TEXT"
}

// AI_PARSE - AI ile standartlaştırma
{
  "strategy": "AI_PARSE",
  "targetField": "strongSubjects",
  "standardValues": ["Matematik", "Fen Bilgisi", "Türkçe", "İngilizce"],
  "allowCustom": false
}

// MULTIPLE_FIELDS - Birden fazla alana eşleştir
{
  "strategy": "MULTIPLE_FIELDS",
  "mappings": [
    {"field": "interests", "extractFrom": "response"},
    {"field": "careerGoals", "extractFrom": "response", "parseWithAI": true}
  ]
}
```

#### 4.7. profile_mapping_rules (Yeni)

Soru cevaplarından profil alanlarına eşleştirme kuralları

```sql
CREATE TABLE IF NOT EXISTS profile_mapping_rules (
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  
  -- Hedef profil alanı
  targetTable TEXT NOT NULL, -- 'students', 'standardized_academic_profile' vb.
  targetField TEXT NOT NULL,
  
  -- Dönüşüm kuralı
  transformationType TEXT NOT NULL, -- 'DIRECT', 'AI_STANDARDIZE', 'SCALE_CONVERT', 'ARRAY_MERGE'
  transformationConfig TEXT, -- JSON
  
  -- Validasyon
  validationRules TEXT, -- JSON: min, max, pattern, enum
  
  -- Öncelik
  priority INTEGER DEFAULT 1,
  conflictResolution TEXT DEFAULT 'NEWER_WINS',
  
  isActive BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (questionId) REFERENCES survey_questions (id) ON DELETE CASCADE
);
```

#### 4.8. profile_update_queue (Yeni)

Onay bekleyen profil güncellemeleri

```sql
CREATE TABLE IF NOT EXISTS profile_update_queue (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  responseId TEXT, -- student_survey_responses.id
  
  -- Güncelleme detayları
  updateType TEXT NOT NULL, -- 'SURVEY_RESPONSE', 'AI_SUGGESTION', 'MANUAL'
  targetTable TEXT NOT NULL,
  targetField TEXT NOT NULL,
  currentValue TEXT,
  proposedValue TEXT NOT NULL,
  
  -- Meta bilgi
  reasoning TEXT,
  confidence DECIMAL(3,2),
  dataSource TEXT,
  
  -- Onay süreci
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  reviewedBy TEXT,
  reviewedAt DATETIME,
  reviewNotes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (responseId) REFERENCES student_survey_responses (id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users (id)
);

CREATE INDEX idx_update_queue_student ON profile_update_queue(studentId);
CREATE INDEX idx_update_queue_status ON profile_update_queue(status);
```

#### 4.9. survey_audit_log (Yeni)

Tüm işlemlerin detaylı kaydı (KVKK uyumluluk için)

```sql
CREATE TABLE IF NOT EXISTS survey_audit_log (
  id TEXT PRIMARY KEY,
  surveyTemplateId TEXT,
  linkId TEXT,
  responseId TEXT,
  studentId TEXT,
  
  action TEXT NOT NULL, -- 'LINK_CREATED', 'ACCESSED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PROFILE_UPDATED'
  performedBy TEXT, -- User ID
  performedByRole TEXT, -- 'COUNSELOR', 'SYSTEM', 'STUDENT'
  
  changeData TEXT, -- JSON: Ne değişti?
  ipAddress TEXT,
  userAgent TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (surveyTemplateId) REFERENCES survey_templates (id),
  FOREIGN KEY (linkId) REFERENCES survey_links (id),
  FOREIGN KEY (responseId) REFERENCES student_survey_responses (id),
  FOREIGN KEY (studentId) REFERENCES students (id)
);

CREATE INDEX idx_audit_action ON survey_audit_log(action, created_at);
CREATE INDEX idx_audit_student ON survey_audit_log(studentId);
```

### 🔗 Mevcut Tablolara Eklenecek Alanlar

#### students tablosuna eklemeler

```sql
ALTER TABLE students ADD COLUMN lastSurveyResponseDate DATETIME;
ALTER TABLE students ADD COLUMN surveyCompletionRate INTEGER DEFAULT 0; -- Yüzde
ALTER TABLE students ADD COLUMN profileDataSource TEXT DEFAULT 'MANUAL'; -- 'MANUAL', 'SURVEY', 'MIXED'
```

## 5. Backend API Tasarımı

### 🛣️ API Endpoints

#### 5.1. Link Management API (Rehber Öğretmen)

**POST /api/survey-links/create**
- Anket linki oluştur

```typescript
Request: {
  surveyTemplateId: string,
  linkType: 'PUBLIC' | 'PERSONAL',
  studentIds?: string[], // PERSONAL için
  expiresAt?: Date,
  maxUses?: number // PUBLIC için (-1 = unlimited)
}

Response: {
  success: boolean,
  links: [
    {
      id: string,
      token: string,
      fullUrl: string,
      linkType: string,
      studentId?: string,
      studentName?: string,
      qrCodeData?: string // base64 QR image
    }
  ],
  pdfUrl?: string // PERSONAL için toplu PDF
}
```

**GET /api/survey-links/:templateId**
- Bir anket için oluşturulan tüm linkler

```typescript
Response: {
  public Link?: {
    id: string,
    url: string,
    accessCount: number,
    completionCount: number
  },
  personalLinks: [
    {
      id: string,
      studentName: string,
      studentClass: string,
      url: string,
      accessed: boolean,
      completed: boolean,
      completedAt?: Date
    }
  ]
}
```

**POST /api/survey-links/generate-pdf**
- Özel linkler için PDF oluştur

```typescript
Request: {
  linkIds: string[]
}

Response: {
  pdfUrl: string,
  generatedCount: number
}
```

#### 5.2. Public Link Access API (Öğrenci - Kimlik Doğrulama)

**GET /api/survey/public/:token**
- PUBLIC link erişimi - kimlik doğrulama ekranı

```typescript
Response: {
  surveyTitle: string,
  description: string,
  isActive: boolean,
  requiresVerification: true,
  verificationMethods: ['TC_NO', 'STUDENT_NO']
}
```

**POST /api/survey/public/:token/verify**
- Kimlik doğrulama yap

```typescript
Request: {
  verificationType: 'TC_NO' | 'STUDENT_NO',
  value: string
}

Response: {
  success: boolean,
  verified: boolean,
  message: string,
  sessionToken?: string, // Başarılıysa
  alreadyCompleted?: boolean
}
```

**GET /api/survey/public/:token/questions**
- Anket sorularını getir (doğrulandıktan sonra)

```typescript
Headers: {
  Authorization: 'Bearer {sessionToken}'
}

Response: {
  survey: {...},
  questions: [...],
  studentId: string
}
```

#### 5.3. Personal Link Access API (Öğrenci - Direkt Erişim)

**GET /api/survey/s/:token**
- PERSONAL link erişimi - kimlik doğrulama YOK

```typescript
Response: {
  success: boolean,
  survey: {
    id: string,
    title: string,
    description: string,
    category: string
  },
  student: {
    name: string,
    class: string
  },
  questions: [...],
  alreadyCompleted: boolean,
  isExpired: boolean
}
```

#### 5.4. Survey Response API (Öğrenci)

**POST /api/survey-response/start**
- Anket doldurmaya başla

```typescript
Request: {
  linkToken: string,
  sessionToken?: string // PUBLIC link için
}

Response: {
  responseId: string,
  studentId: string
}
```

**PUT /api/survey-response/:id/save**
- Taslak kaydet

```typescript
Request: {
  responseData: {
    [questionId: string]: any
  },
  completionPercentage: number
}

Response: {
  success: boolean
}
```

**POST /api/survey-response/:id/submit**
- Anketi gönder

```typescript
Request: {
  responseData: {
    [questionId: string]: any
  }
}

Response: {
  success: boolean,
  message: string
}
```

---

## 6. Veri Eşleştirme Sistemi

*(Mevcut mapping stratejileri korunacak - DIRECT, AI_PARSE, SCALE_CONVERT, ARRAY_MERGE, MULTIPLE_FIELDS)*

Detaylı mapping kuralları ve AI işleme servisleri mevcut planda tanımlandığı gibi çalışacak. Tek fark: Artık anket cevapları `student_survey_responses` tablosundan gelecek.

---

## 7. QR Kod ve PDF Sistemi

### 📱 QR Kod Oluşturma

**Kütüphane:** `qrcode` (Node.js)

```typescript
// server/services/qr-code.service.ts

import QRCode from 'qrcode';

class QRCodeService {
  async generateQRCode(url: string): Promise<string> {
    // Base64 QR kod resmi oluştur
    const qrDataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });
    
    return qrDataURL; // data:image/png;base64,...
  }
  
  async generateQRCodes(urls: string[]): Promise<Map<string, string>> {
    const qrCodes = new Map();
    
    for (const url of urls) {
      const qrCode = await this.generateQRCode(url);
      qrCodes.set(url, qrCode);
    }
    
    return qrCodes;
  }
}
```

### 📄 PDF Oluşturma

**Kütüphane:** `jspdf` ve `jspdf-autotable`

```typescript
// server/services/pdf-generation.service.ts

import { jsPDF } from 'jspdf';

class PDFGenerationService {
  async generateStudentSurveyPDF(links: SurveyLink[]): Promise<Buffer> {
    const pdf = new jsPDF();
    
    links.forEach((link, index) => {
      if (index > 0) pdf.addPage();
      
      // Başlık
      pdf.setFontSize(16);
      pdf.text(link.surveyTitle, 105, 20, { align: 'center' });
      
      // Öğrenci Bilgileri
      pdf.setFontSize(12);
      pdf.text(`Ad Soyad: ${link.studentName}`, 20, 40);
      pdf.text(`Sınıf: ${link.studentClass}`, 20, 50);
      pdf.text(`Numara: ${link.studentNumber}`, 20, 60);
      
      // QR Kod
      pdf.addImage(link.qrCodeData, 'PNG', 70, 80, 70, 70);
      
      // Link
      pdf.setFontSize(10);
      pdf.text(`Link: ${link.fullUrl}`, 105, 165, { align: 'center' });
      
      // Son Tarih
      pdf.text(`Son Tarih: ${link.expiresAt}`, 105, 175, { align: 'center' });
    });
    
    return Buffer.from(pdf.output('arraybuffer'));
  }
}
```

---

## 8. Frontend Bileşenler

### 🎨 Rehber Öğretmen Paneli

**Anket Oluşturma Sayfası:**
```
┌────────────────────────────────────────┐
│ Yeni Öğrenci Profil Anketi Oluştur     │
├────────────────────────────────────────┤
│ Anket Başlığı: [_________________]     │
│ Kategori: ☑ Akademik Profil           │
│ Hedef Sınıf: ☑ 9 ☑ 10 ☐ 11 ☐ 12     │
│                                        │
│ SORULAR:                               │
│ 1. [Soru metni...]                    │
│    Profil Eşleştirme:                 │
│    Hedef Alan: strongSubjects ▼       │
│    Strateji: AI_PARSE ▼               │
│                                        │
│ [+ Soru Ekle]                         │
│                                        │
│ ─────────────────────────────────────  │
│ DAĞITIM AYARLARI                       │
│                                        │
│ ○ Genel Link (Web'de paylaş)          │
│   • Tek link, kimlik doğrulama gerekli│
│                                        │
│ ● Özel Linkler (QR Bastır)            │
│   • Her öğrenciye ayrı link + QR      │
│   Hedef Öğrenciler:                   │
│   Sınıf Seç: [9-A ▼] [Tümünü Seç ☑]   │
│   Seçilen: 25 öğrenci                 │
│                                        │
│ Son Tarih: [30.11.2024 ▼]             │
│                                        │
│ [İptal] [Kaydet ve Link Oluştur]      │
└────────────────────────────────────────┘
```

**Link Yönetim Paneli:**
```
┌────────────────────────────────────────┐
│ Akademik Profil Anketi - 9. Sınıflar  │
├────────────────────────────────────────┤
│ Dağıtım: Özel Linkler (QR)            │
│ Oluşturulma: 15.11.2024               │
│ Son Tarih: 30.11.2024                 │
│                                        │
│ [📥 PDF İndir] [📊 Rapor] [🔗 Linkler]│
│                                        │
│ İLERLEME: ██████░░░░ 60% (15/25)      │
│                                        │
│ DOLDURANLAR (15):                     │
│ ✅ Ahmet Yılmaz - 9A - 16.11.2024     │
│ ✅ Ayşe Kaya - 9A - 17.11.2024        │
│ ...                                    │
│                                        │
│ DOLDURMAYANLAR (10):                   │
│ ❌ Mehmet Demir - 9B                   │
│ ❌ Fatma Şahin - 9C                    │
│ [Hatırlatma Gönder]                    │
└────────────────────────────────────────┘
```

### 📱 Öğrenci Anket Sayfası

**Genel Link - Kimlik Doğrulama:**
```
┌────────────────────────────────────────┐
│      AKADEMIK PROFIL ANKETİ            │
├────────────────────────────────────────┤
│ Bu anketi doldurabilmek için          │
│ kimliğini doğrulaman gerekiyor.       │
│                                        │
│ ○ TC Kimlik No ile Giriş              │
│ ● Öğrenci No ile Giriş               │
│                                        │
│ Öğrenci No: [___________]             │
│                                        │
│ [Doğrula ve Başla]                    │
└────────────────────────────────────────┘
```

**Özel Link - Direkt Anket:**
```
┌────────────────────────────────────────┐
│  Merhaba Ahmet Yılmaz! (9-A)          │
├────────────────────────────────────────┤
│  AKADEMIK PROFIL ANKETİ                │
│                                        │
│  1/10  En iyi olduğun dersler?        │
│  ☑ Matematik                          │
│  ☑ Fizik                              │
│  ☐ Kimya                              │
│  ☐ Biyoloji                           │
│  ☐ Türkçe                             │
│                                        │
│  [Önceki] [Sonraki]                   │
│                                        │
│  ██░░░░░░░░ 10%                        │
│  [Taslak Kaydet] [Gönder]             │
└────────────────────────────────────────┘
```

---

## 9. Güvenlik ve KVKK Uyumluluk

### 🔒 Güvenlik Önlemleri

**1. Link Güvenliği:**
- Crypto-secure random token (32+ karakter)
- Link süre sınırı (default 30 gün)
- Tek kullanımlık linkler (opsiyonel)
- HTTPS zorunlu

**2. Rate Limiting:**
```typescript
// PUBLIC link kimlik doğrulama
- Aynı IP'den dakikada max 5 deneme
- 10 başarısız denemeden sonra CAPTCHA
- 20 başarısız denemeden sonra IP ban (geçici)

// API endpoints
- /api/survey-links/create: Dakikada 10 istek
- /api/survey-response/submit: Dakikada 3 istek
```

**3. Veri Güvenliği:**
- TC kimlik no hashlenerek saklanır
- Öğrenci no hashlenerek saklanır  
- IP adresleri anonimleştirilir (son oktet maskelenir)
- Audit log tam kayıt

**4. KVKK Uyumluluk:**
- Açık rıza metni (anket başlangıcında)
- Veli onayı seçeneği (hassas bilgiler için)
- Veri saklama süresi (maks 2 yıl, sonra anonimleştirilir)
- Silme hakkı (öğrenci talebinde veriler silinir)

---

## 10. İmplementasyon Aşamaları

### Faz 1: Temel Alt Yapı (1 hafta)
1. Database migration - Yeni tablolar oluştur
2. Link generation service
3. QR kod servisi
4. Basit API endpoints

### Faz 2: Link Sistemleri (1 hafta)
5. PUBLIC link + kimlik doğrulama
6. PERSONAL link sistemi
7. PDF generation
8. Link tracking

### Faz 3: Frontend (1 hafta)
9. Rehber öğretmen: Link oluşturma arayüzü
10. Öğrenci: Anket doldurma sayfası
11. Takip paneli

### Faz 4: AI ve Onay (1 hafta)
12. Profil mapping servisi
13. AI standardization
14. Onay kuyruğu UI

### Faz 5: Test ve Güvenlik (1 hafta)
15. Güvenlik testleri
16. Load testing
17. KVKK uyumluluk kontrolü

---

## 11. Örnek Anket Şablonları

### 📚 Akademik Profil Anketi

**Kategori:** STUDENT_PROFILE - Akademik
**Sorular:**

1. En iyi olduğun dersler hangileri? (Çoklu seçim)
   - Mapping: `strongSubjects` (AI_PARSE)

2. En zorlandığın dersler? (Çoklu seçim)
   - Mapping: `weakSubjects` (AI_PARSE)

3. Ders çalışma saatin (günlük ortalama)? (Skala 0-5 saat)
   - Mapping: `studyHoursDaily` (DIRECT)

### 🎭 Sosyal-Duygusal Profil Anketi

1. Kendini ne kadar sosyal biri olarak görüyorsun? (1-5)
   - Mapping: `socialAwareness` (SCALE_CONVERT 1-10)

2. Arkadaş çevren nasıl? (Çoklu seçim)
   - Mapping: `socialCircle` (ARRAY_MERGE)

### 🎯 Kariyer İlgileri Anketi

1. Gelecekte ne olmak istiyorsun? (Açık uçlu)
   - Mapping: `careerGoals`, `interests` (MULTIPLE_FIELDS + AI)

2. İlgilendiğin meslek alanları? (Çoklu seçim)
   - Mapping: `careerInterests` (AI_PARSE)

*(Diğer kategoriler benzer şekilde tanımlanır)*

---

## 12. Test Senaryoları

### Senaryo 1: Genel Link ile Toplu Dağıtım

1. Rehber öğretmen "Akademik Profil" anketi oluşturur
2. "Genel Link" seçer, tüm 9. sınıflar için
3. Link okul web sitesine konur
4. Öğrenci linke tıklar
5. TC kimlik no ile doğrulama yapar
6. Anketi doldurur ve gönderir
7. Rehber öğretmen onay kuyruğunda görür
8. Onaylar, profil otomatik güncellenir

### Senaryo 2: QR Kod ile Sınıf Dağıtımı

1. Rehber öğretmen "Kariyer İlgileri" anketi oluşturur
2. "Özel Linkler" seçer, 10-A sınıfı (30 öğrenci)
3. PDF oluşturur ve bastırır
4. Sınıfta dağıtır
5. Öğrenci eve gidince QR okutarak anketi doldurur
6. Takip panelinde "Dolduruldu" görünür
7. Doldurmayan 5 öğrenciye hatırlatma gönderilir

### Senaryo 3: Güvenlik Testi

1. Kötü niyetli kullanıcı PUBLIC link bulur
2. 100 farklı TC no dener
3. 5. denemeden sonra CAPTCHA çıkar
4. 20. denemeden sonra IP banlanır
5. Tüm denemeler audit log'a kaydedilir

---

**Plan.md Güncelleme Tamamlandı! ✅**

Sistem artık:
- ✅ Link-based (QR kodlu) anket dağıtımı
- ✅ İki mod: Genel Link + Özel Linkler
- ✅ Öğrenci login gerektirmez
- ✅ Modüler anket yapısı (6 kategori)
- ✅ Mevcut survey sistemi entegrasyonu
- ✅ Tam güvenlik ve KVKK uyumluluğu
  assessmentId: string,
  status: 'SUBMITTED',
  message: 'Anketiniz başarıyla gönderildi. Rehber öğretmeniniz inceledikten sonra profiliniz güncellenecektir.'
}
```

**GET /api/self-assessments/my-assessments**
- Öğrencinin doldurduğu anketler

```typescript
Query: {
  studentId: string,
  status?: string
}

Response: {
  assessments: [
    {
      id: string,
      templateTitle: string,
      status: string,
      completionPercentage: number,
      submittedAt?: string,
      reviewedAt?: string
    }
  ]
}
```

#### 4.3. Profile Mapping & Processing API

**POST /api/self-assessments/:id/process**
- Anket cevaplarını işle ve profil güncelleme önerileri oluştur
- (Sistem içi - otomatik tetiklenir)

```typescript
Request: {
  assessmentId: string
}

Response: {
  processedCount: number,
  suggestionsCreated: number,
  errors: string[]
}
```

**GET /api/profile-updates/suggestions/:studentId**
- Belirli bir öğrenci için onay bekleyen güncellemeler

```typescript
Response: {
  suggestions: [
    {
      id: string,
      targetField: string,
      currentValue: any,
      proposedValue: any,
      reasoning: string,
      confidence: number,
      dataSource: string,
      createdAt: string
    }
  ]
}
```

#### 4.4. Counselor Approval API

**GET /api/profile-updates/pending**
- Tüm onay bekleyen güncellemeler (rehber öğretmen için)

```typescript
Query: {
  studentId?: string,
  category?: string,
  sortBy?: 'date' | 'student' | 'confidence'
}

Response: {
  pending: [
    {
      id: string,
      studentName: string,
      studentId: string,
      assessmentTitle: string,
      updates: [
        {
          field: string,
          currentValue: any,
          proposedValue: any,
          confidence: number
        }
      ],
      submittedAt: string
    }
  ],
  total: number
}
```

**POST /api/profile-updates/:id/approve**
- Güncellemeyi onayla ve profili güncelle

```typescript
Request: {
  updateIds: string[], // Birden fazla güncellemyi toplu onay
  notes?: string
}

Response: {
  success: boolean,
  appliedCount: number,
  updatedFields: string[]
}
```

**POST /api/profile-updates/:id/reject**
- Güncellemeyi reddet

```typescript
Request: {
  updateId: string,
  reason: string
}

Response: {
  success: boolean
}
```

**POST /api/profile-updates/bulk-approve**
- Bir öğrencinin tüm güncellemelerini toplu onayla

```typescript
Request: {
  studentId: string,
  assessmentId?: string,
  excludeIds?: string[] // Hariç tutulacak güncelleme ID'leri
}

Response: {
  approvedCount: number,
  updatedFields: string[]
}
```

#### 4.5. Parent Consent API

**GET /api/self-assessments/:id/parent-consent**
- Veli onay ekranı (tokenli link ile erişim)

```typescript
Query: {
  token: string // Güvenli token
}

Response: {
  assessment: {...},
  student: {...},
  requiresConsent: boolean,
  consentDetails: string
}
```

**POST /api/self-assessments/:id/parent-consent**
- Veli onayı kaydet

```typescript
Request: {
  token: string,
  consentGiven: boolean,
  parentName: string
}

Response: {
  success: boolean,
  message: string
}
```

---

## 5. Veri Eşleştirme Sistemi

### 🗺️ Mapping Stratejileri

#### 5.1. DIRECT - Doğrudan Eşleştirme

En basit durum: Cevap direkt olarak alana kaydedilir.

**Örnek:**
- Soru: "Telefon numaranız nedir?"
- Cevap: "05551234567"
- Hedef: `students.phone`
- Dönüşüm: Yok (direkt kaydet)

```typescript
{
  strategy: 'DIRECT',
  targetTable: 'students',
  targetField: 'phone',
  validation: {
    pattern: /^[0-9]{10,11}$/
  }
}
```

#### 5.2. AI_STANDARDIZE - AI ile Standartlaştırma

Öğrenci serbest metin girdiğinde, AI ile standart değerlere çevir.

**Örnek:**
- Soru: "En iyi olduğun dersler hangileri?"
- Cevap: "mat, fizik, kimya"
- AI çıktısı: ["Matematik", "Fizik", "Kimya"]
- Hedef: `standardized_academic_profile.strongSubjects`

```typescript
{
  strategy: 'AI_STANDARDIZE',
  targetTable: 'standardized_academic_profile',
  targetField: 'strongSubjects',
  standardValues: [...DERS_TAXONOMY], // Standart değer listesi
  aiPrompt: `Kullanıcı bu dersleri yazdı: {input}. 
             Standart ders isimlerine dönüştür: {standardValues}`,
  confidence_threshold: 0.7
}
```

#### 5.3. SCALE_CONVERT - Ölçek Dönüştürme

Farklı ölçekler arasında dönüşüm.

**Örnek:**
- Soru: "Kendini ne kadar sosyal biri olarak görürsün? (1-5)"
- Cevap: 4
- Dönüşüm: (4/5) * 10 = 8
- Hedef: `standardized_social_emotional_profile.socialAwareness` (1-10 skala)

```typescript
{
  strategy: 'SCALE_CONVERT',
  sourceScale: { min: 1, max: 5 },
  targetScale: { min: 1, max: 10 },
  targetTable: 'standardized_social_emotional_profile',
  targetField: 'socialAwareness'
}
```

#### 5.4. ARRAY_MERGE - Çoklu Seçim Birleştirme

Birden fazla seçenek işaretlendiğinde.

**Örnek:**
- Soru: "Hobileriniz nelerdir? (Çoklu seçim)"
- Cevap: ["Futbol", "Müzik", "Resim"]
- Hedef: `students.hobbiesDetailed`

```typescript
{
  strategy: 'ARRAY_MERGE',
  targetTable: 'students',
  targetField: 'hobbiesDetailed',
  mergeStrategy: 'APPEND', // veya 'REPLACE', 'UNIQUE_APPEND'
  separator: ', '
}
```

#### 5.5. MULTIPLE_FIELDS - Birden Fazla Alana Eşleştirme

Bir cevap birden fazla alana kaydedilebilir.

**Örnek:**
- Soru: "Gelecekte ne olmak istiyorsun ve neden?"
- Cevap: "Doktor olmak istiyorum çünkü insanlara yardım etmeyi seviyorum."
- AI Çıkarımları:
  - Kariyer hedefi: "Doktor"
  - İlgi alanları: "Sağlık", "İnsanlara yardım"
  - Motivasyon: "Yardımseverlik"

```typescript
{
  strategy: 'MULTIPLE_FIELDS',
  mappings: [
    {
      targetTable: 'standardized_talents_interests_profile',
      targetField: 'careerGoals',
      extract: 'career_from_text',
      aiPrompt: 'Extract career goal from: {input}'
    },
    {
      targetTable: 'standardized_talents_interests_profile',
      targetField: 'interests',
      extract: 'interests_from_text',
      aiPrompt: 'Extract interest areas from: {input}'
    }
  ]
}
```

### 🤖 AI Processing Service

```typescript
// server/services/self-assessment-ai-processor.service.ts

class SelfAssessmentAIProcessor {
  
  async processAssessment(assessmentId: string): Promise<ProcessingResult> {
    const assessment = await this.getAssessment(assessmentId);
    const questions = await this.getQuestions(assessment.templateId);
    const mappingRules = await this.getMappingRules(questions);
    
    const suggestions: ProfileUpdateSuggestion[] = [];
    
    for (const [questionId, answer] of Object.entries(assessment.responseData)) {
      const question = questions.find(q => q.id === questionId);
      const rules = mappingRules.filter(r => r.questionId === questionId);
      
      for (const rule of rules) {
        const suggestion = await this.processMappingRule(
          rule,
          answer,
          question,
          assessment.studentId
        );
        
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }
    
    // Önerileri profile_update_queue'ya kaydet
    await this.saveSuggestions(suggestions);
    
    return {
      processedCount: suggestions.length,
      errors: []
    };
  }
  
  private async processMappingRule(
    rule: MappingRule,
    answer: any,
    question: Question,
    studentId: string
  ): Promise<ProfileUpdateSuggestion | null> {
    
    let processedValue = answer;
    let confidence = 1.0;
    
    switch (rule.transformationType) {
      case 'DIRECT':
        processedValue = answer;
        break;
        
      case 'AI_STANDARDIZE':
        const aiResult = await this.aiStandardize(
          answer,
          rule.transformationConfig
        );
        processedValue = aiResult.value;
        confidence = aiResult.confidence;
        break;
        
      case 'SCALE_CONVERT':
        processedValue = this.convertScale(
          answer,
          rule.transformationConfig
        );
        break;
        
      case 'ARRAY_MERGE':
        const currentValue = await this.getCurrentValue(
          studentId,
          rule.targetTable,
          rule.targetField
        );
        processedValue = this.mergeArrays(
          currentValue,
          answer,
          rule.transformationConfig
        );
        break;
    }
    
    // Validasyon
    if (!this.validate(processedValue, rule.validationRules)) {
      return null;
    }
    
    return {
      studentId,
      targetTable: rule.targetTable,
      targetField: rule.targetField,
      proposedValue: processedValue,
      confidence,
      reasoning: `Öğrenci anketten: "${question.questionText}"`
    };
  }
  
  private async aiStandardize(
    input: any,
    config: any
  ): Promise<{ value: any; confidence: number }> {
    const prompt = this.buildStandardizationPrompt(input, config);
    const aiResponse = await this.aiService.analyze(prompt);
    
    return {
      value: aiResponse.standardizedValue,
      confidence: aiResponse.confidence
    };
  }
}
```

---

## 6. Frontend Bileşenler

### 🎨 Öğrenci Anket Arayüzü

#### 6.1. AssessmentList Bileşeni

Öğrenciye gösterilecek anketler listesi.

**Konum:** `client/pages/SelfAssessments/AssessmentList.tsx`

```typescript
interface AssessmentListProps {
  studentId: string;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({ studentId }) => {
  const { data: templates } = useQuery({
    queryKey: ['self-assessment-templates', studentId],
    queryFn: () => api.getSelfAssessmentTemplates(studentId)
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profilini Tamamla</h2>
        <Badge>
          {templates?.filter(t => t.completionStatus === 'COMPLETED').length} / {templates?.length} Tamamlandı
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map(template => (
          <AssessmentCard
            key={template.id}
            template={template}
            onStart={() => handleStart(template.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 6.2. AssessmentForm Bileşeni

Anket doldurma formu.

**Konum:** `client/pages/SelfAssessments/AssessmentForm.tsx`

```typescript
export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessmentId,
  templateId
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const { data: template } = useQuery({
    queryKey: ['self-assessment-template', templateId],
    queryFn: () => api.getSelfAssessmentTemplate(templateId)
  });
  
  const saveDraftMutation = useMutation({
    mutationFn: () => api.saveSelfAssessmentDraft(assessmentId, {
      responseData: responses,
      completionPercentage: calculateCompletion()
    })
  });
  
  const submitMutation = useMutation({
    mutationFn: () => api.submitSelfAssessment(assessmentId, {
      responseData: responses
    }),
    onSuccess: () => {
      toast.success('Anketiniz başarıyla gönderildi!');
      navigate('/self-assessments');
    }
  });
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* İlerleme Çubuğu */}
      <Progress value={calculateCompletion()} className="mb-6" />
      
      {/* Soru */}
      <QuestionRenderer
        question={template?.questions[currentQuestionIndex]}
        value={responses[template?.questions[currentQuestionIndex]?.id]}
        onChange={(value) => handleAnswer(
          template?.questions[currentQuestionIndex]?.id,
          value
        )}
      />
      
      {/* Navigasyon */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Önceki
        </Button>
        
        <Button
          variant="outline"
          onClick={() => saveDraftMutation.mutate()}
        >
          Taslak Kaydet
        </Button>
        
        {currentQuestionIndex < template?.questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          >
            Sonraki
          </Button>
        ) : (
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!isComplete()}
          >
            Gönder
          </Button>
        )}
      </div>
    </div>
  );
};
```

#### 6.3. QuestionRenderer Bileşeni

Farklı soru tiplerine göre input render eder.

```typescript
export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange
}) => {
  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
      return (
        <RadioGroup value={value} onValueChange={onChange}>
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
      
    case 'MULTI_SELECT':
      return (
        <div className="space-y-2">
          {question.options?.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                checked={value?.includes(option)}
                onCheckedChange={(checked) => {
                  const newValue = checked
                    ? [...(value || []), option]
                    : value?.filter(v => v !== option);
                  onChange(newValue);
                }}
              />
              <Label>{option}</Label>
            </div>
          ))}
        </div>
      );
      
    case 'SCALE':
      return (
        <div className="space-y-4">
          <Slider
            value={[value || 1]}
            onValueChange={([v]) => onChange(v)}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Hiç Katılmıyorum</span>
            <span className="font-bold">{value || 1}</span>
            <span>Tamamen Katılıyorum</span>
          </div>
        </div>
      );
      
    case 'TEXT':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cevabınızı buraya yazın..."
          rows={4}
        />
      );
      
    case 'YES_NO':
      return (
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">Evet</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">Hayır</Label>
          </div>
        </RadioGroup>
      );
  }
};
```

### 🎯 Rehber Öğretmen Onay Paneli

#### 6.4. PendingUpdatesPanel Bileşeni

**Konum:** `client/pages/ProfileUpdates/PendingUpdatesPanel.tsx`

```typescript
export const PendingUpdatesPanel: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  const { data: pendingUpdates } = useQuery({
    queryKey: ['pending-profile-updates', selectedStudent],
    queryFn: () => api.getPendingProfileUpdates(selectedStudent)
  });
  
  const approveAllMutation = useMutation({
    mutationFn: (studentId: string) => api.bulkApproveUpdates(studentId),
    onSuccess: () => {
      toast.success('Tüm güncellemeler onaylandı');
      queryClient.invalidateQueries(['pending-profile-updates']);
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Profil Güncelleme Onayları
        </h2>
        <Badge variant="secondary">
          {pendingUpdates?.total || 0} Bekleyen Güncelleme
        </Badge>
      </div>
      
      <Tabs defaultValue="by-student">
        <TabsList>
          <TabsTrigger value="by-student">Öğrenciye Göre</TabsTrigger>
          <TabsTrigger value="by-field">Alana Göre</TabsTrigger>
          <TabsTrigger value="recent">Yeni Gelenler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-student">
          <div className="space-y-4">
            {pendingUpdates?.pending.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.studentName}</CardTitle>
                      <CardDescription>
                        {item.assessmentTitle} - {format(new Date(item.submittedAt), 'dd MMMM yyyy', { locale: tr })}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => approveAllMutation.mutate(item.studentId)}
                      variant="default"
                    >
                      Hepsini Onayla ({item.updates.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {item.updates.map(update => (
                      <UpdateItem
                        key={update.id}
                        update={update}
                        onApprove={() => handleApprove(update.id)}
                        onReject={() => handleReject(update.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

#### 6.5. UpdateItem Bileşeni

```typescript
const UpdateItem: React.FC<UpdateItemProps> = ({
  update,
  onApprove,
  onReject
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium">{getFieldLabel(update.field)}</div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label className="text-xs text-gray-500">Mevcut Değer</Label>
              <div className="text-sm">
                {update.currentValue || <em className="text-gray-400">Boş</em>}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Önerilen Değer</Label>
              <div className="text-sm font-medium text-green-600">
                {update.proposedValue}
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">
              Güven: {Math.round(update.confidence * 100)}%
            </Badge>
            {update.confidence < 0.8 && (
              <Badge variant="warning">
                Düşük Güven - İncele
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={onApprove}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReject}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Güvenlik ve KVKK Uyumluluk

### 🔒 Güvenlik Katmanları

#### 7.1. Kimlik Doğrulama

```typescript
// Öğrenci sadece kendi anketlerine erişebilir
middleware.ensureStudentOwnership = (req, res, next) => {
  const { assessmentId } = req.params;
  const { studentId } = req.user;
  
  const assessment = db.prepare(`
    SELECT studentId FROM student_self_assessments
    WHERE id = ?
  `).get(assessmentId);
  
  if (assessment.studentId !== studentId) {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }
  
  next();
};

// Rehber öğretmen yetkisi kontrolü
middleware.ensureCounselorRole = (req, res, next) => {
  if (!['COUNSELOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Sadece rehber öğretmenler erişebilir' });
  }
  next();
};
```

#### 7.2. Veli Onayı Sistemi

Hassas bilgiler (sağlık, özel gereksinimler) için veli onayı gerekli.

```typescript
// Veli onay linki oluştur
async function generateParentConsentLink(assessmentId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  db.prepare(`
    UPDATE student_self_assessments
    SET parentConsentToken = ?, parentConsentTokenExpiry = ?
    WHERE id = ?
  `).run(token, Date.now() + 7 * 24 * 60 * 60 * 1000, assessmentId); // 7 gün geçerli
  
  return `${process.env.BASE_URL}/parent-consent/${token}`;
}

// Veli onay endpoint'i
router.post('/parent-consent/:token', async (req, res) => {
  const { token } = req.params;
  const { consentGiven, parentName } = req.body;
  
  const assessment = db.prepare(`
    SELECT * FROM student_self_assessments
    WHERE parentConsentToken = ? AND parentConsentTokenExpiry > ?
  `).get(token, Date.now());
  
  if (!assessment) {
    return res.status(404).json({ error: 'Geçersiz veya süresi dolmuş link' });
  }
  
  db.prepare(`
    UPDATE student_self_assessments
    SET parentConsentGiven = ?,
        parentConsentDate = ?,
        parentConsentIp = ?,
        parentName = ?
    WHERE id = ?
  `).run(consentGiven, new Date().toISOString(), req.ip, parentName, assessment.id);
  
  // Audit log
  await logAudit({
    assessmentId: assessment.id,
    action: 'PARENT_CONSENT',
    performedBy: parentName,
    performedByRole: 'PARENT',
    ipAddress: req.ip
  });
  
  res.json({ success: true });
});
```

#### 7.3. Veri Gizliliği

```typescript
// Hassas alanları filtreleme
function sanitizeStudentData(student: any, requesterRole: string): any {
  const sensitiveFields = ['tcIdentityNo', 'tcKimlikNo'];
  
  if (!['ADMIN', 'COUNSELOR'].includes(requesterRole)) {
    sensitiveFields.forEach(field => {
      if (student[field]) {
        student[field] = '***********'; // Maskele
      }
    });
  }
  
  return student;
}
```

#### 7.4. Audit Logging

Tüm işlemler kaydedilir (KVKK compliance).

```typescript
async function logAudit(data: AuditLogData): Promise<void> {
  await db.prepare(`
    INSERT INTO self_assessment_audit_log (
      id, assessmentId, studentId, action, 
      performedBy, performedByRole, changeData, 
      ipAddress, userAgent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateId(),
    data.assessmentId,
    data.studentId,
    data.action,
    data.performedBy,
    data.performedByRole,
    JSON.stringify(data.changeData),
    data.ipAddress,
    data.userAgent
  );
}
```

#### 7.5. Rate Limiting

Kötü niyetli kullanımı önleme.

```typescript
import rateLimit from 'express-rate-limit';

const assessmentSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Maksimum 5 anket gönderimi
  message: 'Çok fazla anket gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
});

router.post('/self-assessments/:id/submit', 
  assessmentSubmitLimiter,
  async (req, res) => {
    // ...
  }
);
```

### 📋 KVKK Checklist

✅ **Açık Rıza:** Öğrenci anketi doldururken ne amaçla kullanılacağını biliyor  
✅ **Veli Onayı:** Hassas bilgiler için veli onayı alınıyor  
✅ **Veri Minimizasyonu:** Sadece gerekli veriler toplanıyor  
✅ **Amaç Sınırlaması:** Veriler sadece rehberlik amacıyla kullanılıyor  
✅ **Saklama Süresi:** Mezuniyet sonrası N yıl saklanacak (konfigüre edilebilir)  
✅ **Silme Hakkı:** Öğrenci/veli isterse veriler silinebilir  
✅ **Erişim Hakkı:** Öğrenci kendi verilerini görebilir  
✅ **Düzeltme Hakkı:** Yanlış bilgiler düzeltilebilir  
✅ **İşlem Kaydı:** Tüm işlemler audit log'da  
✅ **Güvenli Saklama:** Veritabanı şifreli, erişim kontrollü  

---

## 8. İmplementasyon Aşamaları

### 📅 Faz 1: Database ve Backend Altyapısı (1-2 Gün)

**Hedef:** Veri yapısını ve temel API'leri oluştur.

#### Adımlar:

1. **Database Migration** ✅ **TAMAMLANDI**
   - [x] `self_assessment_templates` tablosu oluştur
   - [x] `self_assessment_questions` tablosu oluştur
   - [x] `student_self_assessments` tablosu oluştur
   - [x] `profile_mapping_rules` tablosu oluştur
   - [x] `profile_update_queue` tablosu oluştur
   - [x] `self_assessment_audit_log` tablosu oluştur
   - [x] `students` tablosuna yeni alanlar ekle

2. **TypeScript Types** ✅ **TAMAMLANDI**
   - [x] `shared/types/self-assessment.types.ts` oluştur
   - [x] Tüm interface'leri tanımla

3. **Validation Schemas** ✅ **TAMAMLANDI**
   - [x] `shared/validation/self-assessment.validation.ts` oluştur
   - [x] Zod şemaları yaz

4. **Repository Layer** ✅ **TAMAMLANDI**
   - [x] `server/features/self-assessments/repository/templates.repository.ts`
   - [x] `server/features/self-assessments/repository/assessments.repository.ts`
   - [x] `server/features/self-assessments/repository/mapping-rules.repository.ts`
   - [x] `server/features/self-assessments/repository/update-queue.repository.ts`

**Dosya Yapısı:**
```
server/
  features/
    self-assessments/
      repository/
        templates.repository.ts
        assessments.repository.ts
        mapping-rules.repository.ts
        update-queue.repository.ts
      services/
        (Faz 2'de)
      routes/
        (Faz 2'de)
      types/
        self-assessment.types.ts
```

### 📅 Faz 2: Core API Endpoints (2-3 Gün)

**Hedef:** Anket oluşturma, doldurma, gönderme API'lerini yaz.

#### Adımlar:

1. **Service Layer**
   - [ ] `templates.service.ts` - Anket şablonları yönetimi
   - [ ] `assessments.service.ts` - Öğrenci anket işlemleri
   - [ ] `mapping.service.ts` - Veri eşleştirme mantığı
   - [ ] `approval.service.ts` - Onay süreci yönetimi

2. **API Routes**
   - [ ] `GET /api/self-assessments/templates`
   - [ ] `GET /api/self-assessments/templates/:id`
   - [ ] `POST /api/self-assessments/start`
   - [ ] `PUT /api/self-assessments/:id/save`
   - [ ] `POST /api/self-assessments/:id/submit`
   - [ ] `GET /api/self-assessments/my-assessments`

3. **Middleware**
   - [ ] `ensureStudentOwnership` - Öğrenci yetki kontrolü
   - [ ] `ensureCounselorRole` - Rehber öğretmen kontrolü
   - [ ] Rate limiting

**Test:**
- [ ] Postman/Thunder Client ile tüm endpoint'leri test et
- [ ] Error handling test et
- [ ] Validation test et

### 📅 Faz 3: AI İşleme ve Mapping (2-3 Gün)

**Hedef:** Anket cevaplarını profil güncellemelerine dönüştür.

#### Adımlar:

1. **AI Processing Service**
   - [ ] `ai-processor.service.ts` oluştur
   - [ ] `processAssessment()` - Ana işleme fonksiyonu
   - [ ] `processMappingRule()` - Her kural için işlem
   - [ ] `aiStandardize()` - AI ile standartlaştırma
   - [ ] `convertScale()` - Ölçek dönüştürme
   - [ ] `mergeArrays()` - Array birleştirme

2. **Mapping Strategies Implementation**
   - [ ] DIRECT stratejisi
   - [ ] AI_STANDARDIZE stratejisi
   - [ ] SCALE_CONVERT stratejisi
   - [ ] ARRAY_MERGE stratejisi
   - [ ] MULTIPLE_FIELDS stratejisi

3. **Integration**
   - [ ] Anket submit edildiğinde otomatik işleme tetikle
   - [ ] İşleme sonuçlarını `profile_update_queue`'ya kaydet
   - [ ] Hata durumlarını logla

**Test:**
- [ ] Mock anket cevapları ile test et
- [ ] Her mapping stratejisini ayrı ayrı test et
- [ ] AI confidence threshold test et

### 📅 Faz 4: Onay Süreci API'leri (1-2 Gün)

**Hedef:** Rehber öğretmen onay paneli için API'ler.

#### Adımlar:

1. **Approval API Routes**
   - [ ] `GET /api/profile-updates/pending`
   - [ ] `GET /api/profile-updates/suggestions/:studentId`
   - [ ] `POST /api/profile-updates/:id/approve`
   - [ ] `POST /api/profile-updates/:id/reject`
   - [ ] `POST /api/profile-updates/bulk-approve`

2. **Profile Update Service**
   - [ ] `applyUpdate()` - Güncellemeyi uygula
   - [ ] `bulkApprove()` - Toplu onay
   - [ ] `rejectUpdate()` - Reddetme

3. **Audit Logging**
   - [ ] Her onay/red işlemini logla
   - [ ] Profil değişikliklerini kaydet

**Test:**
- [ ] Güncelleme onaylama flow'unu test et
- [ ] Toplu onay test et
- [ ] Audit log'ları kontrol et

### 📅 Faz 5: Frontend - Öğrenci Arayüzü (3-4 Gün)

**Hedef:** Öğrencilerin anket doldurabileceği arayüz.

#### Adımlar:

1. **Pages**
   - [ ] `client/pages/SelfAssessments/AssessmentList.tsx`
   - [ ] `client/pages/SelfAssessments/AssessmentForm.tsx`
   - [ ] `client/pages/SelfAssessments/AssessmentComplete.tsx`

2. **Components**
   - [ ] `AssessmentCard.tsx` - Anket kartı
   - [ ] `QuestionRenderer.tsx` - Soru render komponenti
   - [ ] `ProgressTracker.tsx` - İlerleme göstergesi
   - [ ] `AssessmentStats.tsx` - Tamamlanma istatistikleri

3. **Hooks**
   - [ ] `useSelfAssessments.ts`
   - [ ] `useAssessmentForm.ts`

4. **API Client**
   - [ ] `client/lib/api/endpoints/self-assessments.api.ts`

**Test:**
- [ ] Anket listeleme
- [ ] Anket başlatma
- [ ] Taslak kaydetme
- [ ] Anket gönderme
- [ ] Responsive tasarım

### 📅 Faz 6: Frontend - Rehber Öğretmen Paneli (2-3 Gün)

**Hedef:** Rehber öğretmen onay arayüzü.

#### Adımlar:

1. **Pages**
   - [ ] `client/pages/ProfileUpdates/PendingUpdatesPanel.tsx`
   - [ ] `client/pages/ProfileUpdates/UpdateReview.tsx`

2. **Components**
   - [ ] `UpdateItem.tsx` - Güncelleme öğesi
   - [ ] `BulkApprovalDialog.tsx` - Toplu onay dialogu
   - [ ] `UpdateHistory.tsx` - Güncelleme geçmişi

3. **Hooks**
   - [ ] `useProfileUpdates.ts`
   - [ ] `useApprovalActions.ts`

**Test:**
- [ ] Bekleyen güncellemeler listeleme
- [ ] Tekli onay/red
- [ ] Toplu onay
- [ ] Filtreleme ve sıralama

### 📅 Faz 7: Veli Onay Sistemi (1-2 Gün) - Opsiyonel

**Hedef:** Hassas bilgiler için veli onayı.

#### Adımlar:

1. **Backend**
   - [ ] Parent consent token generation
   - [ ] `GET /api/self-assessments/:id/parent-consent`
   - [ ] `POST /api/self-assessments/:id/parent-consent`

2. **Frontend**
   - [ ] `client/pages/ParentConsent.tsx`
   - [ ] Token doğrulama
   - [ ] Onay formu

**Test:**
- [ ] Token geçerliliği
- [ ] Onay işlemi
- [ ] Email bildirimi (opsiyonel)

### 📅 Faz 8: Örnek Anket Şablonları Oluşturma (1 Gün)

**Hedef:** Hazır anket şablonları ve mapping kuralları.

#### Adımlar:

1. **Seed Data**
   - [ ] Akademik Profil Anketi
   - [ ] Sosyal-Duygusal Anket
   - [ ] Kariyer ve Hedefler Anketi
   - [ ] Hobiler ve Yetenekler Anketi

2. **Mapping Rules**
   - [ ] Her soru için mapping kuralı tanımla
   - [ ] AI standardization değerlerini ayarla

**Dosya:**
```typescript
// server/seeds/self-assessment-templates.seed.ts
export const academicProfileTemplate = {
  id: 'academic-profile-2025',
  title: 'Akademik Profil Öz-Değerlendirmesi',
  category: 'ACADEMIC',
  questions: [
    {
      id: 'strong-subjects',
      questionText: 'En iyi olduğun dersler hangileri?',
      questionType: 'MULTI_SELECT',
      options: DERS_TAXONOMY,
      mappingStrategy: 'AI_STANDARDIZE',
      targetProfileField: 'strongSubjects'
    },
    // ...
  ]
};
```

### 📅 Faz 9: Entegrasyon ve Test (2-3 Gün)

**Hedef:** Tüm sistemi entegre et ve kapsamlı test et.

#### Adımlar:

1. **Integration Tests**
   - [ ] End-to-end flow testi
   - [ ] Öğrenci anket doldurma → İşleme → Onay → Profil güncelleme

2. **UI/UX Review**
   - [ ] Kullanıcı deneyimi gözden geçir
   - [ ] Responsive tasarım kontrolü
   - [ ] Accessibility

3. **Performance**
   - [ ] Sorgu optimizasyonları
   - [ ] Caching stratejisi
   - [ ] Bundle size

4. **Documentation**
   - [ ] API dokümantasyonu
   - [ ] Kullanıcı kılavuzu (öğrenci için)
   - [ ] Kullanıcı kılavuzu (rehber öğretmen için)

### 📅 Faz 10: Deployment ve Monitoring (1 Gün)

**Hedef:** Canlıya al ve izleme kurulumu.

#### Adımlar:

1. **Deployment**
   - [ ] Production build
   - [ ] Database migration
   - [ ] Seed data yükleme

2. **Monitoring**
   - [ ] Error tracking
   - [ ] Usage analytics
   - [ ] Performance monitoring

3. **Training**
   - [ ] Rehber öğretmenlere eğitim
   - [ ] Öğrencilere tanıtım

---

## 9. Örnek Anket Şablonları

### 📚 9.1. Akademik Profil Öz-Değerlendirmesi

**Hedef:** Akademik güçlü/zayıf yönler, öğrenme stili, çalışma alışkanlıkları

```typescript
const academicProfileTemplate = {
  id: 'academic-profile-2025',
  title: 'Akademik Profil Öz-Değerlendirmesi',
  description: 'Akademik güçlü yönlerini, zayıf yönlerini ve öğrenme stilini keşfet',
  category: 'ACADEMIC',
  targetGrades: ['9', '10', '11', '12'],
  estimatedDuration: 10,
  requiresParentConsent: false,
  
  questions: [
    {
      id: 'strong-subjects',
      questionText: 'Hangi derslerde daha başarılısın? (En fazla 5 tane seçebilirsin)',
      questionType: 'MULTI_SELECT',
      options: [
        'Matematik', 'Fizik', 'Kimya', 'Biyoloji',
        'Türk Dili ve Edebiyatı', 'İngilizce', 'Tarih',
        'Coğrafya', 'Felsefe', 'Din Kültürü',
        'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar'
      ],
      required: true,
      helpText: 'Notların yüksek olan veya konuları kolay kavradığın dersleri seç',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'strongSubjects',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_academic_profile',
        targetField: 'strongSubjects',
        transformType: 'ARRAY'
      }
    },
    
    {
      id: 'weak-subjects',
      questionText: 'Hangi derslerde daha çok zorlanıyorsun?',
      questionType: 'MULTI_SELECT',
      options: [/* aynı liste */],
      required: false,
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'weakSubjects',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_academic_profile',
        targetField: 'weakSubjects',
        transformType: 'ARRAY'
      }
    },
    
    {
      id: 'learning-style',
      questionText: 'Nasıl öğrendiğinde daha iyi anlıyorsun?',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        'Görsel malzemeler (diyagram, grafik, resim) ile',
        'Dinleyerek ve tartışarak',
        'Yaparak ve deneyerek',
        'Okuyarak ve yazarak'
      ],
      required: true,
      
      mappingStrategy: 'AI_PARSE',
      targetProfileField: 'learningStyle',
      mappingConfig: {
        strategy: 'AI_STANDARDIZE',
        targetTable: 'standardized_academic_profile',
        targetField: 'learningStyle',
        standardValues: ['GÖRSEL', 'İŞİTSEL', 'KİNESTETİK', 'OKUMA_YAZMA'],
        aiPrompt: 'Kullanıcı cevabını standart öğrenme stili kategorisine dönüştür'
      }
    },
    
    {
      id: 'study-skills',
      questionText: 'Çalışma becerilerini nasıl değerlendirirsin? (1-10)',
      questionType: 'SCALE',
      required: false,
      helpText: '1 = Çok zayıf, 10 = Mükemmel',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'studySkills',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_academic_profile',
        targetField: 'studySkills',
        transformType: 'NUMBER'
      }
    },
    
    {
      id: 'homework-completion',
      questionText: 'Ödevlerini ne sıklıkla tamamlıyorsun? (1-10)',
      questionType: 'SCALE',
      required: false,
      helpText: '1 = Neredeyse hiç, 10 = Her zaman',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'homeworkCompletion',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_academic_profile',
        targetField: 'homeworkCompletion',
        transformType: 'NUMBER'
      }
    },
    
    {
      id: 'academic-goals',
      questionText: 'Akademik hedeflerin nelerdir? (Serbest metin)',
      questionType: 'TEXT',
      required: false,
      helpText: 'Örnek: YKS\'de yüksek puan almak, üniversitede mühendislik okumak...',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'studentExpectations',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'students',
        targetField: 'studentExpectations',
        transformType: 'TEXT'
      }
    }
  ]
};
```

### 💭 9.2. Sosyal-Duygusal Anket

**Hedef:** Sosyal beceriler, duygusal farkındalık, arkadaşlık ilişkileri

```typescript
const socialEmotionalTemplate = {
  id: 'social-emotional-2025',
  title: 'Sosyal ve Duygusal Gelişim Anketi',
  description: 'Sosyal becerilerini ve duygusal durumunu değerlendir',
  category: 'SOCIAL_EMOTIONAL',
  targetGrades: ['9', '10', '11', '12'],
  estimatedDuration: 12,
  requiresParentConsent: false,
  
  questions: [
    {
      id: 'self-awareness',
      questionText: 'Duygularının ne zaman farkında oluyorsun? (1-10)',
      questionType: 'SCALE',
      required: true,
      helpText: '1 = Neredeyse hiç, 10 = Her zaman',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'selfAwareness',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'selfAwareness',
        transformType: 'NUMBER'
      }
    },
    
    {
      id: 'emotional-regulation',
      questionText: 'Öfkelendiğinde veya üzüldüğünde kendini ne kadar kontrol edebiliyorsun? (1-10)',
      questionType: 'SCALE',
      required: true,
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'emotionalRegulation',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'emotionalRegulation',
        transformType: 'NUMBER'
      }
    },
    
    {
      id: 'peer-relations',
      questionText: 'Arkadaşlık ilişkilerini nasıl tanımlarsın?',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        'Çok güçlü - Birçok yakın arkadaşım var',
        'İyi - Birkaç yakın arkadaşım var',
        'Orta - Arkadaşlarım var ama çok yakın değiliz',
        'Zayıf - Az arkadaşım var',
        'Çok zayıf - Neredeyse hiç arkadaşım yok'
      ],
      required: true,
      
      mappingStrategy: 'AI_STANDARDIZE',
      targetProfileField: 'peerRelations',
      mappingConfig: {
        strategy: 'AI_STANDARDIZE',
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'peerRelations',
        standardValues: ['ÇOK_ZAYIF', 'ZAYIF', 'ORTA', 'İYİ', 'ÇOK_İYİ']
      }
    },
    
    {
      id: 'empathy',
      questionText: 'Başkalarının duygularını ne kadar anlayabiliyorsun? (1-10)',
      questionType: 'SCALE',
      required: true,
      helpText: 'Empati: Kendini başkasının yerine koyabilme',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'empathy',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'empathy',
        transformType: 'NUMBER'
      }
    },
    
    {
      id: 'friend-count',
      questionText: 'Kaç tane yakın arkadaşın var?',
      questionType: 'MULTIPLE_CHOICE',
      options: ['0', '1-2', '3-5', '6-10', '10+'],
      required: false,
      
      mappingStrategy: 'SCALE_CONVERT',
      targetProfileField: 'friendCount',
      mappingConfig: {
        strategy: 'SCALE_CONVERT',
        mapping: {
          '0': 0,
          '1-2': 1.5,
          '3-5': 4,
          '6-10': 8,
          '10+': 12
        },
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'friendCount'
      }
    },
    
    {
      id: 'bullying-status',
      questionText: 'Okulda zorbalık yaşadın mı?',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        'Hayır, hiç zorbalık yaşamadım',
        'Evet, zorbalığa maruz kaldım',
        'Evet, başkalarına zorbalık yaptım',
        'Her ikisi de oldu'
      ],
      required: true,
      helpText: 'Bu bilgi gizli kalacak ve sadece sana yardım etmek için kullanılacak',
      
      mappingStrategy: 'AI_STANDARDIZE',
      targetProfileField: 'bullyingStatus',
      mappingConfig: {
        strategy: 'AI_STANDARDIZE',
        targetTable: 'standardized_social_emotional_profile',
        targetField: 'bullyingStatus',
        standardValues: ['YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ']
      }
    }
  ]
};
```

### 🎯 9.3. Kariyer ve Hedefler Anketi

```typescript
const careerGoalsTemplate = {
  id: 'career-goals-2025',
  title: 'Kariyer ve Gelecek Hedefleri',
  description: 'Gelecek planlarını ve kariyer hedeflerini paylaş',
  category: 'CAREER',
  targetGrades: ['10', '11', '12'],
  estimatedDuration: 8,
  
  questions: [
    {
      id: 'career-aspiration',
      questionText: 'Gelecekte ne olmak istiyorsun?',
      questionType: 'TEXT',
      required: false,
      helpText: 'Meslek, alan veya hedef belirt. Örnek: Doktor, yazılımcı, öğretmen...',
      
      mappingStrategy: 'MULTIPLE_FIELDS',
      targetProfileField: 'careerGoals',
      mappingConfig: {
        strategy: 'MULTIPLE_FIELDS',
        mappings: [
          {
            targetTable: 'standardized_talents_interests_profile',
            targetField: 'careerGoals',
            aiPrompt: 'Extract career goals from text: {input}'
          },
          {
            targetTable: 'students',
            targetField: 'studentExpectations',
            extract: 'full_text'
          }
        ]
      }
    },
    
    {
      id: 'university-preference',
      questionText: 'Üniversitede ne okumak istiyorsun?',
      questionType: 'TEXT',
      required: false,
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'educationGoals',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_talents_interests_profile',
        targetField: 'educationGoals'
      }
    },
    
    {
      id: 'interests',
      questionText: 'İlgi alanların nelerdir?',
      questionType: 'MULTI_SELECT',
      options: [
        'Teknoloji ve Bilgisayar',
        'Sanat ve Müzik',
        'Spor',
        'Bilim ve Araştırma',
        'Edebiyat ve Yazarlık',
        'İş ve Girişimcilik',
        'Sağlık ve Tıp',
        'Eğitim',
        'Hukuk',
        'Mühendislik',
        'Sosyal Bilimler',
        'Doğa ve Çevre'
      ],
      required: true,
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'interests',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_talents_interests_profile',
        targetField: 'interests',
        transformType: 'ARRAY'
      }
    }
  ]
};
```

### 🏥 9.4. Sağlık ve Özel Gereksinimler Anketi

```typescript
const healthProfileTemplate = {
  id: 'health-profile-2025',
  title: 'Sağlık Bilgileri ve Özel Gereksinimler',
  description: 'Sağlık durumunu ve özel ihtiyaçlarını bildir',
  category: 'HEALTH',
  requiresParentConsent: true, // VELİ ONAYI GEREKLİ!
  estimatedDuration: 5,
  
  questions: [
    {
      id: 'blood-type',
      questionText: 'Kan grubun nedir?',
      questionType: 'DROPDOWN',
      options: [
        'Bilmiyorum',
        'A Rh+',
        'A Rh-',
        'B Rh+',
        'B Rh-',
        'AB Rh+',
        'AB Rh-',
        '0 Rh+',
        '0 Rh-'
      ],
      required: false,
      
      mappingStrategy: 'AI_STANDARDIZE',
      targetProfileField: 'bloodType',
      mappingConfig: {
        strategy: 'AI_STANDARDIZE',
        targetTable: 'standardized_health_profile',
        targetField: 'bloodType',
        standardValues: [
          'A_RH_POSITIVE', 'A_RH_NEGATIVE',
          'B_RH_POSITIVE', 'B_RH_NEGATIVE',
          'AB_RH_POSITIVE', 'AB_RH_NEGATIVE',
          'O_RH_POSITIVE', 'O_RH_NEGATIVE',
          'BİLİNMİYOR'
        ]
      }
    },
    
    {
      id: 'allergies',
      questionText: 'Alerjin var mı? (Varsa belirt)',
      questionType: 'TEXT',
      required: false,
      helpText: 'Örnek: Polen, fındık, antibiyotik...',
      
      mappingStrategy: 'ARRAY_MERGE',
      targetProfileField: 'allergies',
      mappingConfig: {
        strategy: 'ARRAY_MERGE',
        targetTable: 'standardized_health_profile',
        targetField: 'allergies',
        separator: ','
      }
    },
    
    {
      id: 'chronic-diseases',
      questionText: 'Kronik bir hastalığın var mı?',
      questionType: 'TEXT',
      required: false,
      
      mappingStrategy: 'ARRAY_MERGE',
      targetProfileField: 'chronicDiseases',
      mappingConfig: {
        strategy: 'ARRAY_MERGE',
        targetTable: 'standardized_health_profile',
        targetField: 'chronicDiseases'
      }
    },
    
    {
      id: 'special-needs',
      questionText: 'Özel bir desteğe ihtiyacın var mı?',
      questionType: 'TEXT',
      required: false,
      helpText: 'Örnek: Görme/işitme engeli, öğrenme güçlüğü, dikkat eksikliği...',
      
      mappingStrategy: 'DIRECT',
      targetProfileField: 'specialNeeds',
      mappingConfig: {
        strategy: 'DIRECT',
        targetTable: 'standardized_health_profile',
        targetField: 'specialNeeds'
      }
    }
  ]
};
```

---

## 10. Test Senaryoları

### ✅ 10.1. Unit Tests

```typescript
// server/features/self-assessments/services/__tests__/mapping.service.test.ts

describe('MappingService', () => {
  describe('DIRECT mapping', () => {
    it('should map simple text value directly', async () => {
      const result = await mappingService.processMappingRule({
        transformationType: 'DIRECT',
        targetField: 'phone',
        targetTable: 'students'
      }, '05551234567', mockQuestion, 'student-1');
      
      expect(result.proposedValue).toBe('05551234567');
      expect(result.confidence).toBe(1.0);
    });
  });
  
  describe('AI_STANDARDIZE mapping', () => {
    it('should standardize subject names using AI', async () => {
      const result = await mappingService.processMappingRule({
        transformationType: 'AI_STANDARDIZE',
        transformationConfig: {
          standardValues: ['Matematik', 'Fizik', 'Kimya']
        }
      }, 'mat, fizik', mockQuestion, 'student-1');
      
      expect(result.proposedValue).toEqual(['Matematik', 'Fizik']);
    });
  });
  
  describe('SCALE_CONVERT mapping', () => {
    it('should convert 1-5 scale to 1-10 scale', async () => {
      const result = await mappingService.processMappingRule({
        transformationType: 'SCALE_CONVERT',
        transformationConfig: {
          sourceScale: { min: 1, max: 5 },
          targetScale: { min: 1, max: 10 }
        }
      }, 4, mockQuestion, 'student-1');
      
      expect(result.proposedValue).toBe(7.5);
    });
  });
});
```

### 🔄 10.2. Integration Tests

```typescript
// test/integration/self-assessment-flow.test.ts

describe('Self-Assessment Flow', () => {
  it('should complete full student assessment workflow', async () => {
    // 1. Öğrenci anketi başlatır
    const startResponse = await request(app)
      .post('/api/self-assessments/start')
      .send({
        templateId: 'academic-profile-2025',
        studentId: 'student-1'
      })
      .expect(200);
    
    const assessmentId = startResponse.body.assessmentId;
    
    // 2. Taslak kaydeder
    await request(app)
      .put(`/api/self-assessments/${assessmentId}/save`)
      .send({
        responseData: {
          'strong-subjects': ['Matematik', 'Fizik']
        },
        completionPercentage: 25
      })
      .expect(200);
    
    // 3. Tüm cevapları gönderir
    await request(app)
      .post(`/api/self-assessments/${assessmentId}/submit`)
      .send({
        responseData: {
          'strong-subjects': ['Matematik', 'Fizik'],
          'weak-subjects': ['Edebiyat'],
          'learning-style': 'Görsel malzemeler ile',
          'study-skills': 7
        }
      })
      .expect(200);
    
    // 4. AI işleme otomatik başlar
    await waitForProcessing(assessmentId);
    
    // 5. Rehber öğretmen bekleyen güncellemeleri görür
    const pendingResponse = await request(app)
      .get('/api/profile-updates/pending')
      .query({ studentId: 'student-1' })
      .expect(200);
    
    expect(pendingResponse.body.pending.length).toBeGreaterThan(0);
    
    // 6. Rehber öğretmen toplu onaylar
    await request(app)
      .post('/api/profile-updates/bulk-approve')
      .send({ studentId: 'student-1' })
      .expect(200);
    
    // 7. Profil güncellenmiş olmalı
    const studentProfile = await db.prepare(`
      SELECT * FROM standardized_academic_profile
      WHERE studentId = ?
    `).get('student-1');
    
    expect(JSON.parse(studentProfile.strongSubjects)).toContain('Matematik');
  });
});
```

### 🔒 10.3. Security Tests

```typescript
describe('Security Tests', () => {
  it('should prevent student from accessing other students assessments', async () => {
    await request(app)
      .get('/api/self-assessments/assessment-2') // Başka öğrencinin
      .set('Authorization', 'Bearer student-1-token')
      .expect(403);
  });
  
  it('should require parent consent for sensitive data', async () => {
    const response = await request(app)
      .post('/api/self-assessments/health-assessment/submit')
      .send({
        responseData: { /* ... */ },
        parentConsentGiven: false
      })
      .expect(400);
    
    expect(response.body.error).toContain('Veli onayı gerekli');
  });
  
  it('should log all profile updates to audit log', async () => {
    await request(app)
      .post('/api/profile-updates/update-1/approve')
      .expect(200);
    
    const logs = await db.prepare(`
      SELECT * FROM self_assessment_audit_log
      WHERE action = 'PROFILE_UPDATED'
    `).all();
    
    expect(logs.length).toBeGreaterThan(0);
  });
});
```

### 📊 10.4. Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should process 100 assessments in under 5 seconds', async () => {
    const start = Date.now();
    
    const promises = Array.from({ length: 100 }, (_, i) =>
      aiProcessor.processAssessment(`assessment-${i}`)
    );
    
    await Promise.all(promises);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });
  
  it('should handle concurrent profile updates', async () => {
    const promises = Array.from({ length: 50 }, () =>
      request(app)
        .post('/api/profile-updates/approve')
        .send({ updateIds: ['update-1'] })
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    // Sadece biri başarılı olmalı (concurrency control)
    expect(successful.length).toBe(1);
  });
});
```

---

## 🎯 Sonuç ve Başarı Metrikleri

### Başarı Kriterleri

✅ **Profil Tamamlanma Oranı**: %30'dan %80'e çıkmalı  
✅ **Rehber Öğretmen Zaman Tasarrufu**: %70-80 azalma  
✅ **Öğrenci Katılımı**: En az %60 öğrenci anketi doldurmalı  
✅ **Veri Doğruluğu**: AI confidence %80 üzeri olmalı  
✅ **Sistem Performansı**: Anket işleme < 3 saniye  

### Gelecek İyileştirmeler

1. **Periyodik Güncelleme Anketleri**: Yılda 2 kez profil güncelleme
2. **Veli Anketi**: Aileler de bilgi girebilir
3. **Öğretmen Değerlendirme Anketi**: Branş öğretmenlerinden feedback
4. **Gamification**: Anket doldurma için rozetler/ödüller
5. **AI Chatbot**: Öğrenciye anket sırasında yardımcı olan bot
6. **Analytics Dashboard**: Anket tamamlanma istatistikleri

---

**Bu rehber, Öğrenci Öz-Değerlendirme Anket Sistemi'nin baştan sona implementasyonu için gerekli tüm bilgileri içerir. Her aşama detaylı açıklanmış, örnek kodlar verilmiş ve test senaryoları tanımlanmıştır.**

**İyi çalışmalar! 🚀**
