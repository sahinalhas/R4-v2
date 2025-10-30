# 📋 Öğrenci Öz-Değerlendirme Anket Sistemi - Implementasyon Rehberi

## 📌 İçindekiler
1. [Sistem Genel Bakış](#1-sistem-genel-bakış)
2. [Mimari Tasarım](#2-mimari-tasarım)
3. [Database Schema](#3-database-schema)
4. [Backend API Tasarımı](#4-backend-api-tasarımı)
5. [Veri Eşleştirme Sistemi](#5-veri-eşleştirme-sistemi)
6. [Frontend Bileşenler](#6-frontend-bileşenler)
7. [Güvenlik ve KVKK Uyumluluk](#7-güvenlik-ve-kvkk-uyumluluk)
8. [İmplementasyon Aşamaları](#8-implementasyon-aşamaları)
9. [Örnek Anket Şablonları](#9-örnek-anket-şablonları)
10. [Test Senaryoları](#10-test-senaryoları)

---

## 1. Sistem Genel Bakış

### 🎯 Problem
Rehber öğretmenleri, öğrenci profil bilgilerini manuel olarak tek tek girmek zorunda kalıyor. Bu:
- ⏱️ Çok zaman alıcı
- ❌ Hatalara açık
- 📉 Profil tamamlanma oranlarını düşürüyor
- 🔄 Güncelleme zorluğu yaratıyor

### 💡 Çözüm
Öğrencilerin kendi profil bilgilerini anketler aracılığıyla girmesini sağlayan, rehber öğretmen onayı ile çalışan akıllı bir sistem.

### 🎁 Faydalar
- ✅ **Rehber öğretmen iş yükü %70-80 azalır**
- ✅ **Öğrenci katılımı ve farkındalığı artar**
- ✅ **Veriler daha güncel ve doğru olur**
- ✅ **AI sistemi daha iyi çalışır** (daha fazla kaliteli veri)
- ✅ **KVKK uyumlu** (öğrenci ve veli onaylı veri toplama)
- ✅ **Profil tamamlanma oranı artış**

### 🔄 Veri Akışı

```
┌─────────────────┐
│   Öğrenci       │
│ Anketi Doldurur │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ AI ile Veri İşleme      │
│ - Standartlaştırma      │
│ - Kategorizasyon        │
│ - Güvenlik Kontrolü     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Profil Güncelleme       │
│ Önerileri Kuyruğu       │
│ (Onay Bekliyor)         │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Rehber Öğretmen         │
│ İnceleme ve Onay        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Otomatik Profil         │
│ Güncelleme              │
│ + Audit Log             │
└─────────────────────────┘
```

---

## 2. Mimari Tasarım

### 🏗️ Sistem Mimarisi

#### Katmanlar

```
┌─────────────────────────────────────────────┐
│           FRONTEND LAYER                     │
│  - Öğrenci Anket Arayüzü                    │
│  - Rehber Öğretmen Onay Paneli              │
│  - Veli Onay Ekranı (opsiyonel)             │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│           API LAYER                          │
│  - Self Assessment API                       │
│  - Profile Mapping API                       │
│  - Approval Queue API                        │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│           SERVICE LAYER                      │
│  - Data Mapping Service                      │
│  - AI Standardization Service                │
│  - Approval Workflow Service                 │
│  - Profile Update Service                    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│           DATA LAYER                         │
│  - Self Assessments                          │
│  - Mapping Rules                             │
│  - Profile Update Queue                      │
│  - Audit Logs                                │
└─────────────────────────────────────────────┘
```

### 🔌 Mevcut Sistemle Entegrasyon

Bu sistem, mevcut Rehber360 sistemine tam entegre olacak:

1. **Mevcut Survey Sistemi**: Genişletilecek (yeni anket tipi eklenecek)
2. **AI Suggestion Queue**: Kullanılacak (profile update suggestions)
3. **Student Profile**: Güncellenecek (otomatik güncelleme)
4. **Standardized Profile**: AI analizi için veri kaynağı olacak

### 📊 Veri Modeli Özeti

```
survey_templates (mevcut)
    ↓
self_assessment_templates (yeni - özel tip)
    ↓
student_self_assessments (yeni)
    ↓
profile_mapping_rules (yeni)
    ↓
profile_update_suggestions (mevcut AI queue'yu kullanır)
    ↓
students (mevcut - güncellenecek)
```

---

## 3. Database Schema

### 📦 Yeni Tablolar

#### 3.1. self_assessment_templates

Öğrenci öz-değerlendirme anket şablonları

```sql
CREATE TABLE IF NOT EXISTS self_assessment_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'ACADEMIC', 'SOCIAL_EMOTIONAL', 'CAREER', 'HEALTH', 'FAMILY', 'TALENTS'
  targetGrades TEXT, -- JSON array: ["9", "10", "11", "12"]
  isActive BOOLEAN DEFAULT TRUE,
  requiresParentConsent BOOLEAN DEFAULT FALSE, -- Hassas bilgiler için veli onayı gerekli mi?
  estimatedDuration INTEGER, -- dakika
  orderIndex INTEGER, -- Öğrenciye gösterilme sırası
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2. self_assessment_questions

Öz-değerlendirme soruları ve eşleştirme bilgileri

```sql
CREATE TABLE IF NOT EXISTS self_assessment_questions (
  id TEXT PRIMARY KEY,
  templateId TEXT NOT NULL,
  questionText TEXT NOT NULL,
  questionType TEXT NOT NULL, -- 'MULTIPLE_CHOICE', 'MULTI_SELECT', 'TEXT', 'SCALE', 'YES_NO'
  options TEXT, -- JSON array
  orderIndex INTEGER NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  helpText TEXT, -- Öğrenciye yardımcı açıklama
  
  -- VERİ EŞLEŞTİRME BİLGİLERİ (en önemli kısım!)
  targetProfileField TEXT, -- Hedef profil alanı: 'strongSubjects', 'interests', 'careerGoals' vb.
  mappingStrategy TEXT NOT NULL, -- 'DIRECT', 'AI_PARSE', 'MULTIPLE_FIELDS', 'CALCULATED'
  mappingConfig TEXT, -- JSON: Eşleştirme detayları
  
  requiresApproval BOOLEAN DEFAULT TRUE, -- Bu soru cevabı onay gerektirir mi?
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (templateId) REFERENCES self_assessment_templates (id) ON DELETE CASCADE
);
```

**mappingConfig Örnekleri:**

```json
// DIRECT - Doğrudan eşleştirme
{
  "strategy": "DIRECT",
  "targetField": "hobbies",
  "transformType": "ARRAY" // TEXT, ARRAY, NUMBER, DATE, BOOLEAN
}

// AI_PARSE - AI ile standartlaştırma
{
  "strategy": "AI_PARSE",
  "targetField": "strongSubjects",
  "standardValues": ["Matematik", "Fen Bilgisi", "Türkçe", ...], // Standart değerler
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

// CALCULATED - Hesaplanan değer
{
  "strategy": "CALCULATED",
  "targetField": "socialAwareness",
  "calculation": "SCALE_TO_10", // Ölçek dönüşümü
  "sourceScale": [1, 5]
}
```

#### 3.3. student_self_assessments

Öğrencilerin doldurduğu anketler

```sql
CREATE TABLE IF NOT EXISTS student_self_assessments (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  templateId TEXT NOT NULL,
  
  -- Durum bilgisi
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'PROCESSING', 'APPROVED', 'REJECTED'
  completionPercentage INTEGER DEFAULT 0,
  
  -- Cevaplar
  responseData TEXT NOT NULL, -- JSON: {questionId: answer}
  
  -- Onay süreci
  submittedAt DATETIME,
  parentConsentGiven BOOLEAN DEFAULT FALSE,
  parentConsentDate DATETIME,
  parentConsentIp TEXT,
  
  reviewedBy TEXT, -- Rehber öğretmen ID
  reviewedAt DATETIME,
  reviewNotes TEXT,
  
  -- AI işleme
  aiProcessingStatus TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
  aiProcessingErrors TEXT, -- JSON array
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (templateId) REFERENCES self_assessment_templates (id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users (id)
);
```

#### 3.4. profile_mapping_rules

Soru cevaplarından profil alanlarına eşleştirme kuralları

```sql
CREATE TABLE IF NOT EXISTS profile_mapping_rules (
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  
  -- Hedef profil alanı
  targetTable TEXT NOT NULL, -- 'students', 'standardized_academic_profile', 'standardized_social_emotional_profile' vb.
  targetField TEXT NOT NULL,
  
  -- Dönüşüm kuralı
  transformationType TEXT NOT NULL, -- 'DIRECT', 'AI_STANDARDIZE', 'SCALE_CONVERT', 'ARRAY_MERGE', 'CUSTOM'
  transformationConfig TEXT, -- JSON
  
  -- Validasyon
  validationRules TEXT, -- JSON: min, max, pattern, enum vb.
  
  -- Öncelik ve konflikt çözümü
  priority INTEGER DEFAULT 1, -- Aynı alana birden fazla kaynak varsa
  conflictResolution TEXT DEFAULT 'NEWER_WINS', -- 'NEWER_WINS', 'MERGE', 'MANUAL_REVIEW'
  
  isActive BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (questionId) REFERENCES self_assessment_questions (id) ON DELETE CASCADE
);
```

#### 3.5. profile_update_queue

Onay bekleyen profil güncellemeleri (mevcut AI suggestion queue'yu genişletir)

```sql
CREATE TABLE IF NOT EXISTS profile_update_queue (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  assessmentId TEXT, -- NULL ise manuel güncelleme
  
  -- Güncelleme detayları
  updateType TEXT NOT NULL, -- 'SELF_ASSESSMENT', 'AI_SUGGESTION', 'MANUAL'
  targetTable TEXT NOT NULL,
  targetField TEXT NOT NULL,
  currentValue TEXT,
  proposedValue TEXT NOT NULL,
  
  -- Meta bilgi
  reasoning TEXT, -- Neden bu güncelleme öneriliyor?
  confidence DECIMAL(3,2), -- AI confidence (0.00-1.00)
  dataSource TEXT, -- Hangi anketten geldi?
  
  -- Onay süreci
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPLIED'
  reviewedBy TEXT,
  reviewedAt DATETIME,
  reviewNotes TEXT,
  autoApplyAfter DATETIME, -- Belirli bir tarihten sonra otomatik uygula
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (assessmentId) REFERENCES student_self_assessments (id) ON DELETE CASCADE,
  FOREIGN KEY (reviewedBy) REFERENCES users (id)
);
```

#### 3.6. self_assessment_audit_log

Tüm işlemlerin detaylı kaydı (KVKK uyumluluk için kritik)

```sql
CREATE TABLE IF NOT EXISTS self_assessment_audit_log (
  id TEXT PRIMARY KEY,
  assessmentId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  
  action TEXT NOT NULL, -- 'CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PROFILE_UPDATED'
  performedBy TEXT, -- User ID (öğrenci, veli, rehber öğretmen)
  performedByRole TEXT, -- 'STUDENT', 'PARENT', 'COUNSELOR', 'SYSTEM'
  
  changeData TEXT, -- JSON: Ne değişti?
  ipAddress TEXT,
  userAgent TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assessmentId) REFERENCES student_self_assessments (id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
);
```

### 🔗 Mevcut Tablolara Eklenecek Alanlar

#### students tablosuna eklemeler

```sql
ALTER TABLE students ADD COLUMN lastSelfAssessmentDate DATETIME;
ALTER TABLE students ADD COLUMN selfAssessmentCompletionRate INTEGER DEFAULT 0; -- Yüzde
ALTER TABLE students ADD COLUMN profileDataSource TEXT DEFAULT 'MANUAL'; -- 'MANUAL', 'SELF_ASSESSMENT', 'MIXED'
```

---

## 4. Backend API Tasarımı

### 🛣️ API Endpoints

#### 4.1. Self Assessment Templates API

**GET /api/self-assessments/templates**
- Öğrenciye gösterilecek anketleri listele
- Query params: `grade`, `category`, `completed`

```typescript
Response: {
  templates: [
    {
      id: string,
      title: string,
      description: string,
      category: string,
      estimatedDuration: number,
      requiresParentConsent: boolean,
      completionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
      lastAttemptDate?: string
    }
  ]
}
```

**GET /api/self-assessments/templates/:id**
- Anket detaylarını ve sorularını getir

```typescript
Response: {
  template: {...},
  questions: [
    {
      id: string,
      questionText: string,
      questionType: string,
      options?: string[],
      helpText?: string,
      required: boolean
    }
  ],
  requiresParentConsent: boolean
}
```

#### 4.2. Student Self Assessment API

**POST /api/self-assessments/start**
- Yeni bir öz-değerlendirme başlat

```typescript
Request: {
  templateId: string,
  studentId: string
}

Response: {
  assessmentId: string,
  status: 'DRAFT'
}
```

**PUT /api/self-assessments/:id/save**
- Taslak olarak kaydet (henüz gönderme)

```typescript
Request: {
  responseData: {
    [questionId: string]: any
  },
  completionPercentage: number
}

Response: {
  success: boolean,
  savedAt: string
}
```

**POST /api/self-assessments/:id/submit**
- Anketi gönder

```typescript
Request: {
  responseData: {
    [questionId: string]: any
  },
  parentConsentGiven?: boolean // Gerekirse
}

Response: {
  success: boolean,
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

### 📅 Faz 2: Core API Endpoints (2-3 Gün) ✅ **TAMAMLANDI**

**Hedef:** Anket oluşturma, doldurma, gönderme API'lerini yaz.

#### Adımlar:

1. **Service Layer** ✅
   - [x] `templates.service.ts` - Anket şablonları yönetimi
   - [x] `assessments.service.ts` - Öğrenci anket işlemleri
   - [x] `mapping.service.ts` - Veri eşleştirme mantığı
   - [x] `approval.service.ts` - Onay süreci yönetimi

2. **API Routes** ✅
   - [x] `GET /api/self-assessments/templates`
   - [x] `GET /api/self-assessments/templates/:id`
   - [x] `POST /api/self-assessments/start`
   - [x] `PUT /api/self-assessments/:id/save`
   - [x] `POST /api/self-assessments/:id/submit`
   - [x] `GET /api/self-assessments/my-assessments`

3. **Middleware** ✅
   - [x] `ensureStudentOwnership` - Öğrenci yetki kontrolü
   - [x] `ensureCounselorRole` - Rehber öğretmen kontrolü
   - [x] Rate limiting

**Test:**
- [x] Server başarıyla çalışıyor
- [x] Tüm endpoint'ler tanımlandı
- [x] Error handling eklendi
- [x] Validation eklendi

### 📅 Faz 3: AI İşleme ve Mapping (2-3 Gün) ✅ **TAMAMLANDI**

**Hedef:** Anket cevaplarını profil güncellemelerine dönüştür.

#### Adımlar:

1. **AI Processing Service** ✅
   - [x] `ai-processor.service.ts` oluştur
   - [x] `processAssessment()` - Ana işleme fonksiyonu
   - [x] `processMappingRule()` - Her kural için işlem
   - [x] `aiStandardize()` - AI ile standartlaştırma
   - [x] `convertScale()` - Ölçek dönüştürme
   - [x] `mergeArrays()` - Array birleştirme

2. **Mapping Strategies Implementation** ✅
   - [x] DIRECT stratejisi
   - [x] AI_STANDARDIZE stratejisi
   - [x] SCALE_CONVERT stratejisi
   - [x] ARRAY_MERGE stratejisi
   - [x] MULTIPLE_FIELDS stratejisi

3. **Integration** ✅
   - [x] Anket submit edildiğinde otomatik işleme tetikle
   - [x] İşleme sonuçlarını `profile_update_queue`'ya kaydet
   - [x] Hata durumlarını logla

4. **Ek İyileştirmeler** ✅
   - [x] Audit logging service eklendi
   - [x] Standart değerler ve prompt templates oluşturuldu
   - [x] Örnek anket şablonları (Akademik Profil, Kariyer İlgi Alanları) seed edildi
   - [x] AI Provider entegrasyonu tamamlandı (Gemini, OpenAI, Ollama)

**Test:**
- [x] Seed script başarıyla çalıştı
- [x] Template ve sorular veritabanına eklendi
- [x] Tüm mapping stratejileri implement edildi
- [x] AI entegrasyonu çalışıyor

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
