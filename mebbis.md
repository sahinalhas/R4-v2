# MEBBİS Otomatik Görüşme Aktarım Sistemi

## 📋 Genel Bakış

Bu doküman, Rehber360'daki görüşme kayıtlarının MEBBİS (Milli Eğitim Bakanlığı Bilgi Sistemi) platformuna otomatik olarak aktarılması için geliştirilecek sistemin detaylı planını içermektedir.

### Amaç
Rehberlik öğretmenlerinin Rehber360'da kaydettiği görüşmeleri, tek tuşla MEBBİS sistemine aktararak manuel veri girişi yükünü ortadan kaldırmak ve zaman tasarrufu sağlamak.

### Hedef Kullanıcı Deneyimi
1. Kullanıcı "Görüşme Kayıtları" sayfasında "MEBBİS'e Aktar" butonuna tıklar
2. Yeni bir tarayıcı sekmesinde MEBBİS açılır
3. QR kod ile giriş yapar (telefonla tarama)
4. Giriş sonrası sistem otomatik devam eder
5. Tüm girilmemiş görüşmeler sırayla MEBBİS'e kaydedilir
6. İlerleme ekranda gösterilir
7. Tamamlandığında başarı bildirimi alır

---

## 🏗️ Sistem Mimarisi

### Üç Bileşenli Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI (Tarayıcı)                      │
└──────────┬──────────────────────────────────┬────────────────┘
           │                                  │
           │                                  │
    ┌──────▼──────┐                    ┌──────▼──────┐
    │  Rehber360  │◄───────────────────┤   Chrome    │
    │ Web Sitesi  │     API Calls      │  Extension  │
    └──────┬──────┘                    └──────┬──────┘
           │                                  │
           │                                  │
    ┌──────▼──────┐                    ┌──────▼──────┐
    │  Database   │                    │   MEBBİS    │
    │  (SQLite)   │                    │  Web Sitesi │
    └─────────────┘                    └─────────────┘
```

### Bileşen 1: Rehber360 Backend (Mevcut Sistem)

**Görevler:**
- MEBBİS'e aktarılmamış görüşmeleri listele
- Görüşme verilerini JSON formatında sun
- Aktarım durumunu takip et
- API endpoint'leri sağla

**Yeni Database Alanı:**
```sql
ALTER TABLE counseling_sessions ADD COLUMN mebbisExported BOOLEAN DEFAULT FALSE;
ALTER TABLE counseling_sessions ADD COLUMN mebbisExportedAt DATETIME;
ALTER TABLE counseling_sessions ADD COLUMN mebbisExportedBy TEXT;
ALTER TABLE counseling_sessions ADD COLUMN mebbisExportError TEXT;
```

**Yeni API Endpoint'leri:**
```
GET  /api/counseling/mebbis/pending     - Girilmemiş görüşmeler
POST /api/counseling/mebbis/export      - Export işlemini başlat
PUT  /api/counseling/mebbis/:id/mark    - Başarılı/başarısız işaretle
GET  /api/counseling/mebbis/stats       - Export istatistikleri
```

---

### Bileşen 2: Chrome Extension (Yeni Geliştirme)

**Manifest V3 Yapısı:**
```json
{
  "manifest_version": 3,
  "name": "Rehber360 - MEBBİS Aktarıcı",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "tabs",
    "scripting",
    "notifications"
  ],
  "host_permissions": [
    "https://mebbis.meb.gov.tr/*",
    "https://*.replit.dev/*",
    "https://*.replit.app/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://mebbis.meb.gov.tr/*"],
      "js": ["content-mebbis.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

**Extension Dosya Yapısı:**
```
chrome-extension/
├── manifest.json
├── background.js          (Service Worker - koordinasyon)
├── content-mebbis.js      (MEBBİS sayfasında çalışır)
├── popup.html             (Extension popup UI)
├── popup.js               (Popup logic)
├── utils/
│   ├── api-client.js      (Rehber360 API iletişimi)
│   ├── mebbis-mapper.js   (Veri mapping)
│   └── storage.js         (Chrome Storage API)
└── assets/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**Extension İş Akışı:**
```
1. Background Service Worker (background.js)
   - Rehber360'dan mesaj dinler
   - Export işlemini koordine eder
   - Tab yönetimi yapar

2. Content Script (content-mebbis.js)
   - MEBBİS DOM yapısını analiz eder
   - Form alanlarını bulur
   - Verileri doldurur
   - Submit işlemini yapar
   - Sonuçları background'a bildirir

3. Popup (popup.html/js)
   - Manuel başlatma seçeneği
   - İlerleme gösterimi
   - Ayarlar
```

---

### Bileşen 3: Rehber360 Frontend (Mevcut Sistem + Yeni UI)

**Yeni Bileşenler:**
```typescript
// components/counseling/MebbisExportButton.tsx
// components/counseling/MebbisExportDialog.tsx
// components/counseling/MebbisExportProgress.tsx
```

**UI Konumları:**
- **Görüşme Kayıtları Sayfası**: Ana export butonu
- **Öğrenci Profili**: Tekil görüşme export
- **Toplu İşlemler**: Seçili görüşmeleri export

---

## 🔄 Detaylı İş Akışı

### Faz 1: Hazırlık ve Başlatma

```
1. Kullanıcı Rehber360'da "MEBBİS'e Aktar" butonuna tıklar
   ↓
2. Frontend API'ye istek atar: GET /api/counseling/mebbis/pending
   ↓
3. Backend girilmemiş görüşmeleri döner:
   {
     "sessions": [
       {
         "id": "session-123",
         "studentId": "st-456",
         "studentName": "Ahmet Yılmaz",
         "sessionDate": "2025-10-20",
         "sessionType": "individual",
         "topic": "Akademik Destek",
         ...
       }
     ],
     "total": 5
   }
   ↓
4. Frontend Chrome Extension'a mesaj gönderir:
   chrome.runtime.sendMessage(extensionId, {
     action: "START_MEBBIS_EXPORT",
     data: sessions
   })
   ↓
5. Extension Chrome Storage'a kaydeder ve MEBBİS'i açar
```

### Faz 2: MEBBİS Giriş ve Navigasyon

```
1. Extension MEBBİS'i yeni sekmede açar
   window.open("https://mebbis.meb.gov.tr")
   ↓
2. QR Kod Ekranı Algılaması
   Content script QR kod elementini arar:
   - Selector: ".qr-code-container" veya benzeri
   - Eğer bulursa: "QR kod ile giriş yapın" bildirimi
   ↓
3. BEKLEME DURUMU
   - setInterval ile giriş kontrolü
   - Her 2 saniyede bir ana sayfaya ulaşıldı mı kontrol
   - Kontrol: document.querySelector(".user-info") gibi
   ↓
4. Giriş Algılandı
   - "Giriş başarılı, devam ediliyor..." bildirimi
   - Navigation flow başlar
   ↓
5. İlgili Sayfaya Gitme
   Örnek MEBBİS URL yapısı (tahmin):
   - Ana Sayfa: /dashboard
   - Öğrenci Arama: /student/search
   - Görüşme Kayıt: /counseling/session/new
```

### Faz 3: Form Doldurma ve Kaydetme

```
Her bir görüşme için:

1. Öğrenci Seçimi
   - Öğrenci adı/TC ile arama yap
   - Dropdown'dan seç
   - Doğrulama: Doğru öğrenci seçildi mi?
   ↓
2. Görüşme Formu Sayfasına Git
   - "Yeni Görüşme Kaydı" butonuna tıkla
   - Sayfa yüklenene kadar bekle
   ↓
3. Form Alanlarını Doldur
   MEBBİS Form → Rehber360 Mapping:
   
   // Bireysel/Grup seçimi
   document.querySelector('input[value="Bireysel"]').click();
   
   // RPD Hizmet Türü
   selectDropdown('#rpdHizmetTuru', session.topic);
   
   // 1. Aşama
   selectDropdown('#asama1', session.stage1 || 'Yüz Yüze');
   
   // 2. Aşama
   selectDropdown('#asama2', session.stage2 || 'Rehberlik Servisi');
   
   // 3. Aşama
   selectDropdown('#asama3', session.stage3 || '');
   
   // Görüşme Tarihi
   document.querySelector('#gorusmeTarihi').value = session.sessionDate;
   
   // Görüşme Başlama Saati
   document.querySelector('#baslangicSaati').value = session.entryTime;
   
   // Görüşme Bitiş Saati
   document.querySelector('#bitisSaati').value = session.exitTime;
   
   // Çalışma Yapıldığı Yer
   document.querySelector('#calismaYeri').value = session.sessionLocation;
   
   // Oturum Sayısı
   document.querySelector('#oturumSayisi').value = 1;
   
   // Disiplin Durumu (opsiyonel)
   if (session.disciplineStatus) {
     selectDropdown('#disiplinDurumu', session.disciplineStatus);
   }
   
   // Açıklama (detaylar)
   document.querySelector('#aciklama').value = 
     session.sessionDetails + '\n\n' + session.detailedNotes;
   ↓
4. Kaydet Butonuna Tıkla
   document.querySelector('#kaydetBtn').click();
   ↓
5. Başarı Kontrolü
   - Bekle: 2 saniye
   - Kontrol: Başarı mesajı var mı?
   - document.querySelector('.success-message')
   ↓
6. Sonucu Rehber360'a Bildir
   
   BAŞARILI İSE:
   PUT /api/counseling/mebbis/:id/mark
   {
     "exported": true,
     "exportedAt": "2025-10-25T18:30:00Z"
   }
   
   BAŞARISIZ İSE:
   PUT /api/counseling/mebbis/:id/mark
   {
     "exported": false,
     "error": "Form kaydetme hatası"
   }
   ↓
7. Bir Sonraki Görüşmeye Geç
   - Progress güncelle (2/5 tamamlandı)
   - Repeat: Adım 1'e dön
```

### Faz 4: Tamamlanma

```
Tüm görüşmeler işlendi
   ↓
Extension Bildirimi:
- "✅ 5 görüşme başarıyla aktarıldı"
- "⚠️ 1 görüşme başarısız"
   ↓
Rehber360 UI Güncelleme:
- Export dialog'u güncelle
- Başarı/hata listesi göster
- Başarısız olanları tekrar deneme seçeneği
```

---

## 📊 Veri Mapping: Rehber360 ↔ MEBBİS

### MEBBİS Form Alanları (Screenshot'tan)

```javascript
const MEBBIS_FORM_FIELDS = {
  // Görüşme Ayrıntıları bölümü
  birimGroup: {
    selector: 'input[name="birimGroup"]',
    type: 'radio',
    options: ['Bireysel', 'Grup']
  },
  
  rpdHizmetTuru: {
    selector: '#rpdHizmetTuru',
    type: 'dropdown',
    required: true
  },
  
  asama1: {
    selector: '#asama1',
    type: 'dropdown',
    label: '1. Aşama',
    required: true
  },
  
  asama2: {
    selector: '#asama2',
    type: 'dropdown',
    label: '2. Aşama',
    required: true
  },
  
  asama3: {
    selector: '#asama3',
    type: 'dropdown',
    label: '3. Aşama',
    required: false
  },
  
  gorusmeTarihi: {
    selector: '#gorusmeTarihi',
    type: 'date',
    format: 'DD/MM/YYYY',
    required: true
  },
  
  baslangicSaati: {
    selector: '#baslangicSaati',
    type: 'time',
    format: 'HH:mm',
    required: true
  },
  
  bitisSaati: {
    selector: '#bitisSaati',
    type: 'time',
    format: 'HH:mm',
    required: true
  },
  
  calismaYapilanYer: {
    selector: '#calismaYapilanYer',
    type: 'dropdown',
    required: true
  },
  
  oturumSayisi: {
    selector: '#oturumSayisi',
    type: 'number',
    required: true
  },
  
  // Disiplin/Öğretmen ödül-ceza bilgisi
  disiplinDurumu: {
    selector: '#disiplinDurumu',
    type: 'dropdown',
    required: false,
    note: 'Bu alan zorunlu değildir. Aynı öğrenci ile aynı konuda yapılan ardışık görüşmeler için kullanılır.'
  },
  
  // Çalışma Yöntemi
  calismaYontemi: {
    selector: 'input[name="calismaYontemi"]',
    type: 'radio',
    options: ['Seçiniz', 'Kurda zevk edilisi öğrenci', 'Olayla ilgili grubuj alınan öğrenci/şahit'],
    required: true
  },
  
  // Akran Görüşmesi checkbox
  akranGorusmesi: {
    selector: '#akranGorusmesi',
    type: 'checkbox',
    required: false
  },
  
  // Açıklama
  aciklama: {
    selector: '#aciklama',
    type: 'textarea',
    required: false
  }
};
```

### Rehber360 → MEBBİS Mapping Tablosu

| Rehber360 Alan | MEBBİS Alan | Dönüşüm Kuralı |
|----------------|-------------|----------------|
| `sessionType` | `birimGroup` | "individual" → "Bireysel"<br>"group" → "Grup" |
| `topic` | `rpdHizmetTuru` | Direkt mapping (dropdown values eşleşmeli) |
| `participantType` + `sessionMode` | `asama1` | "yüz_yüze" → "Yüz Yüze"<br>"telefon" → "Telefon"<br>"online" → "Online" |
| `sessionLocation` | `asama2` | "Rehberlik Servisi", "Sınıf", vb. |
| - | `asama3` | Opsiyonel, boş bırakılabilir |
| `sessionDate` | `gorusmeTarihi` | Format: DD/MM/YYYY |
| `entryTime` | `baslangicSaati` | Format: HH:mm |
| `exitTime` | `bitisSaati` | Format: HH:mm |
| `sessionLocation` | `calismaYapilanYer` | Direkt mapping |
| - | `oturumSayisi` | Default: 1 |
| `disciplineStatus` | `disiplinDurumu` | Varsa doldur, yoksa boş |
| `participantType` | `calismaYontemi` | Mapping gerekli |
| - | `akranGorusmesi` | İlgili checkbox işaretlenebilir |
| `sessionDetails` + `detailedNotes` | `aciklama` | Birleştir |

---

## 💾 Database Değişiklikleri

### 1. counseling_sessions Tablosu (Güncelleme)

```sql
-- Yeni sütunlar ekle
ALTER TABLE counseling_sessions 
ADD COLUMN mebbisExported BOOLEAN DEFAULT FALSE;

ALTER TABLE counseling_sessions 
ADD COLUMN mebbisExportedAt DATETIME;

ALTER TABLE counseling_sessions 
ADD COLUMN mebbisExportedBy TEXT;

ALTER TABLE counseling_sessions 
ADD COLUMN mebbisExportError TEXT;

ALTER TABLE counseling_sessions 
ADD COLUMN mebbisRetryCount INTEGER DEFAULT 0;

-- Index ekle (performans için)
CREATE INDEX idx_counseling_mebbis_exported 
ON counseling_sessions(mebbisExported, sessionDate);
```

### 2. mebbis_export_log Tablosu (Yeni)

```sql
CREATE TABLE IF NOT EXISTS mebbis_export_log (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  exportedBy TEXT NOT NULL,
  exportedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  errorMessage TEXT,
  mebbisResponse TEXT,
  retryCount INTEGER DEFAULT 0,
  FOREIGN KEY (sessionId) REFERENCES counseling_sessions (id) ON DELETE CASCADE
);

CREATE INDEX idx_mebbis_log_status ON mebbis_export_log(status, exportedAt);
CREATE INDEX idx_mebbis_log_session ON mebbis_export_log(sessionId);
```

### 3. mebbis_field_mapping Tablosu (Yapılandırma)

```sql
CREATE TABLE IF NOT EXISTS mebbis_field_mapping (
  id TEXT PRIMARY KEY,
  rehber360Field TEXT NOT NULL,
  mebbisField TEXT NOT NULL,
  mappingType TEXT NOT NULL CHECK (mappingType IN ('direct', 'transform', 'conditional')),
  transformFunction TEXT,
  isRequired BOOLEAN DEFAULT FALSE,
  defaultValue TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Örnek kayıtlar
INSERT INTO mebbis_field_mapping VALUES
('map-1', 'sessionType', 'birimGroup', 'transform', 'sessionTypeTransform', true, 'Bireysel', 'Individual/Group mapping'),
('map-2', 'sessionDate', 'gorusmeTarihi', 'direct', NULL, true, NULL, 'Date format DD/MM/YYYY'),
('map-3', 'topic', 'rpdHizmetTuru', 'direct', NULL, true, NULL, 'Direct topic mapping');
```

---

## 🔌 API Endpoint Detayları

### 1. GET /api/counseling/mebbis/pending

**Amaç**: MEBBİS'e aktarılmamış görüşmeleri listele

**Request:**
```http
GET /api/counseling/mebbis/pending?limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Döndürülecek kayıt sayısı (default: 50, max: 100)
- `offset`: Sayfalama için offset
- `sessionType`: Filtreleme (individual/group)
- `dateFrom`: Başlangıç tarihi
- `dateTo`: Bitiş tarihi

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-123",
        "studentId": "st-456",
        "studentName": "Ahmet Yılmaz",
        "studentClass": "9-A",
        "sessionType": "individual",
        "sessionDate": "2025-10-20",
        "entryTime": "09:00",
        "exitTime": "09:45",
        "topic": "Akademik Destek",
        "sessionLocation": "Rehberlik Servisi",
        "sessionMode": "yüz_yüze",
        "participantType": "Öğrenci",
        "sessionDetails": "...",
        "detailedNotes": "...",
        "disciplineStatus": null,
        "mebbisExported": false,
        "mebbisRetryCount": 0
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. POST /api/counseling/mebbis/export

**Amaç**: Export işlemini başlat (opsiyonel bulk export)

**Request:**
```http
POST /api/counseling/mebbis/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionIds": ["session-123", "session-456"],
  "mode": "extension" // veya "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export-789",
    "sessionCount": 2,
    "estimatedTime": 120, // saniye
    "status": "pending"
  }
}
```

---

### 3. PUT /api/counseling/mebbis/:sessionId/mark

**Amaç**: Görüşmeyi MEBBİS'e aktarıldı/başarısız olarak işaretle

**Request (Başarılı):**
```http
PUT /api/counseling/mebbis/session-123/mark
Authorization: Bearer <token>
Content-Type: application/json

{
  "exported": true,
  "exportedAt": "2025-10-25T18:30:00Z",
  "mebbisResponse": "Kayıt başarıyla oluşturuldu"
}
```

**Request (Başarısız):**
```http
PUT /api/counseling/mebbis/session-123/mark
Authorization: Bearer <token>
Content-Type: application/json

{
  "exported": false,
  "error": "Form doğrulama hatası: RPD Hizmet Türü geçersiz",
  "retryable": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "mebbisExported": true,
    "mebbisExportedAt": "2025-10-25T18:30:00Z",
    "updated": true
  }
}
```

---

### 4. GET /api/counseling/mebbis/stats

**Amaç**: MEBBİS export istatistiklerini getir

**Request:**
```http
GET /api/counseling/mebbis/stats?dateFrom=2025-10-01&dateTo=2025-10-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "exported": 125,
    "pending": 20,
    "failed": 5,
    "exportRate": 83.3,
    "lastExportAt": "2025-10-25T18:30:00Z",
    "failureReasons": [
      {
        "reason": "Form doğrulama hatası",
        "count": 3
      },
      {
        "reason": "Öğrenci bulunamadı",
        "count": 2
      }
    ]
  }
}
```

---

## 🎨 Frontend Bileşenleri

### 1. MebbisExportButton.tsx

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { MebbisExportDialog } from './MebbisExportDialog';
import { useMebbisExport } from '@/hooks/counseling/useMebbisExport';

export function MebbisExportButton() {
  const [showDialog, setShowDialog] = useState(false);
  const { getPendingSessions, isLoading } = useMebbisExport();

  const handleClick = async () => {
    const sessions = await getPendingSessions();
    if (sessions.length === 0) {
      toast.info('Tüm görüşmeler MEBBİS\'e aktarılmış');
      return;
    }
    setShowDialog(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        MEBBİS'e Aktar
      </Button>

      {showDialog && (
        <MebbisExportDialog
          open={showDialog}
          onOpenChange={setShowDialog}
        />
      )}
    </>
  );
}
```

---

### 2. MebbisExportDialog.tsx

```typescript
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MebbisExportProgress } from './MebbisExportProgress';
import { useMebbisExport } from '@/hooks/counseling/useMebbisExport';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface MebbisExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MebbisExportDialog({ open, onOpenChange }: MebbisExportDialogProps) {
  const { 
    pendingSessions, 
    startExport, 
    exportStatus,
    isLoading 
  } = useMebbisExport();

  const [step, setStep] = useState<'prepare' | 'exporting' | 'complete'>('prepare');

  const handleStartExport = async () => {
    setStep('exporting');
    
    // Chrome Extension'ı tetikle
    const extensionId = 'YOUR_EXTENSION_ID'; // Extension yayınlandığında
    
    chrome.runtime.sendMessage(extensionId, {
      action: 'START_MEBBIS_EXPORT',
      data: {
        apiUrl: window.location.origin,
        authToken: localStorage.getItem('authToken'),
        sessions: pendingSessions
      }
    }, (response) => {
      if (response?.success) {
        // Extension başarıyla başladı
        console.log('MEBBİS export started');
      } else {
        toast.error('Chrome Extension bulunamadı. Lütfen extension\'ı yükleyin.');
        setStep('prepare');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>MEBBİS'e Görüşme Aktarımı</DialogTitle>
          <DialogDescription>
            Rehber360'daki görüşmeler MEBBİS sistemine otomatik olarak aktarılacak
          </DialogDescription>
        </DialogHeader>

        {step === 'prepare' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{pendingSessions.length} görüşme</strong> MEBBİS'e aktarılmayı bekliyor.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">İşlem Adımları:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>MEBBİS sayfası yeni sekmede açılacak</li>
                <li>QR kod ile giriş yapın (telefonla tarama)</li>
                <li>Giriş sonrası otomatik devam edilecek</li>
                <li>Her görüşme sırayla kaydedilecek</li>
                <li>İşlem tamamlandığında bildirim alacaksınız</li>
              </ol>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Chrome Extension yüklü olmalıdır. 
                <a href="#" className="underline ml-1">Extension'ı yükleyin</a>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button onClick={handleStartExport} disabled={isLoading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                MEBBİS'i Aç ve Başlat
              </Button>
            </div>
          </div>
        )}

        {step === 'exporting' && (
          <MebbisExportProgress
            sessions={pendingSessions}
            status={exportStatus}
            onComplete={() => setStep('complete')}
          />
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                MEBBİS export işlemi tamamlandı!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {exportStatus.success}
                </div>
                <div className="text-sm text-muted-foreground">Başarılı</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {exportStatus.failed}
                </div>
                <div className="text-sm text-muted-foreground">Başarısız</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {exportStatus.total}
                </div>
                <div className="text-sm text-muted-foreground">Toplam</div>
              </div>
            </div>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Kapat
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

### 3. MebbisExportProgress.tsx

```typescript
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface MebbisExportProgressProps {
  sessions: any[];
  status: {
    current: number;
    total: number;
    success: number;
    failed: number;
    currentSession?: string;
  };
  onComplete: () => void;
}

export function MebbisExportProgress({ 
  sessions, 
  status, 
  onComplete 
}: MebbisExportProgressProps) {
  const progress = (status.current / status.total) * 100;

  useEffect(() => {
    if (status.current === status.total) {
      setTimeout(onComplete, 1000);
    }
  }, [status.current, status.total, onComplete]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>İlerleme</span>
          <span>{status.current} / {status.total}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {status.currentSession && (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>İşleniyor: {status.currentSession}</span>
        </div>
      )}

      <ScrollArea className="h-64 border rounded-lg p-4">
        <div className="space-y-2">
          {sessions.map((session) => {
            const isProcessed = session.mebbisExported !== undefined;
            const isSuccess = session.mebbisExported === true;
            const isFailed = session.mebbisExported === false;
            const isPending = !isProcessed;

            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="font-medium">{session.studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {session.sessionDate} - {session.topic}
                  </div>
                  {isFailed && session.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {session.error}
                    </div>
                  )}
                </div>

                <div>
                  {isPending && (
                    <div className="text-muted-foreground">Bekliyor</div>
                  )}
                  {isSuccess && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {isFailed && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
```

---

## 🔧 Chrome Extension Kod Örnekleri

### background.js (Service Worker)

```javascript
// MEBBİS Export koordinasyonu

const EXTENSION_STATE = {
  sessions: [],
  currentIndex: 0,
  apiUrl: '',
  authToken: '',
  status: {
    success: 0,
    failed: 0,
    current: 0,
    total: 0
  }
};

// Rehber360'dan mesaj dinle
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'START_MEBBIS_EXPORT') {
      startMebbisExport(request.data)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true; // Async response
    }
  }
);

async function startMebbisExport(data) {
  // State'i ayarla
  EXTENSION_STATE.sessions = data.sessions;
  EXTENSION_STATE.apiUrl = data.apiUrl;
  EXTENSION_STATE.authToken = data.authToken;
  EXTENSION_STATE.status.total = data.sessions.length;
  EXTENSION_STATE.currentIndex = 0;

  // Chrome Storage'a kaydet
  await chrome.storage.local.set({ mebbisExportState: EXTENSION_STATE });

  // MEBBİS'i yeni sekmede aç
  const tab = await chrome.tabs.create({
    url: 'https://mebbis.meb.gov.tr',
    active: true
  });

  // Tab ID'yi kaydet
  await chrome.storage.local.set({ mebbisTabId: tab.id });

  // Content script'in yüklenmesini bekle
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
}

function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url?.includes('mebbis.meb.gov.tr')) {
    // Content script'e mesaj gönder
    chrome.tabs.sendMessage(tabId, {
      action: 'CHECK_LOGIN_STATUS'
    });
  }
}

// Content script'ten mesaj dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'LOGIN_DETECTED':
      handleLoginDetected(sender.tab.id);
      break;
    
    case 'FORM_SUBMITTED':
      handleFormSubmitted(request.data);
      break;
    
    case 'EXPORT_ERROR':
      handleExportError(request.error);
      break;
  }
});

async function handleLoginDetected(tabId) {
  console.log('MEBBİS giriş algılandı, export başlıyor...');
  
  // İlk görüşmeyi işle
  const state = await chrome.storage.local.get('mebbisExportState');
  const session = state.mebbisExportState.sessions[0];
  
  chrome.tabs.sendMessage(tabId, {
    action: 'PROCESS_SESSION',
    session: session
  });
}

async function handleFormSubmitted(data) {
  const state = await chrome.storage.local.get('mebbisExportState');
  const currentState = state.mebbisExportState;
  
  // Rehber360 API'ye bildir
  await fetch(`${currentState.apiUrl}/api/counseling/mebbis/${data.sessionId}/mark`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentState.authToken}`
    },
    body: JSON.stringify({
      exported: data.success,
      exportedAt: new Date().toISOString(),
      error: data.error
    })
  });

  // Status güncelle
  currentState.currentIndex++;
  currentState.status.current++;
  if (data.success) {
    currentState.status.success++;
  } else {
    currentState.status.failed++;
  }

  await chrome.storage.local.set({ mebbisExportState: currentState });

  // Bir sonraki görüşme varsa işle
  if (currentState.currentIndex < currentState.sessions.length) {
    const nextSession = currentState.sessions[currentState.currentIndex];
    const tabId = (await chrome.storage.local.get('mebbisTabId')).mebbisTabId;
    
    chrome.tabs.sendMessage(tabId, {
      action: 'PROCESS_SESSION',
      session: nextSession
    });
  } else {
    // Tamamlandı
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'MEBBİS Export Tamamlandı',
      message: `${currentState.status.success} başarılı, ${currentState.status.failed} başarısız`
    });
  }
}
```

---

### content-mebbis.js (Content Script)

```javascript
// MEBBİS sayfasında çalışır

let isLoggedIn = false;
let loginCheckInterval = null;

// Background'dan mesaj dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'CHECK_LOGIN_STATUS':
      checkLoginStatus();
      break;
    
    case 'PROCESS_SESSION':
      processSession(request.session);
      break;
  }
});

function checkLoginStatus() {
  // QR kod ekranı mı kontrol et
  const qrCodeElement = document.querySelector('.qr-code-container');
  
  if (qrCodeElement) {
    console.log('QR kod ekranı algılandı, giriş bekleniyor...');
    
    // Her 2 saniyede bir giriş kontrolü
    loginCheckInterval = setInterval(() => {
      const userInfo = document.querySelector('.user-info');
      const dashboard = document.querySelector('.dashboard');
      
      if (userInfo || dashboard) {
        isLoggedIn = true;
        clearInterval(loginCheckInterval);
        
        // Background'a bildir
        chrome.runtime.sendMessage({
          action: 'LOGIN_DETECTED'
        });
      }
    }, 2000);
  } else {
    // Zaten giriş yapılmış olabilir
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      isLoggedIn = true;
      chrome.runtime.sendMessage({
        action: 'LOGIN_DETECTED'
      });
    }
  }
}

async function processSession(session) {
  try {
    console.log('İşleniyor:', session.studentName);
    
    // 1. Öğrenci arama sayfasına git
    await navigateToStudentSearch();
    await sleep(1000);
    
    // 2. Öğrenci ara ve seç
    await searchAndSelectStudent(session.studentName);
    await sleep(1000);
    
    // 3. Görüşme formu sayfasına git
    await navigateToCounselingForm();
    await sleep(1000);
    
    // 4. Formu doldur
    await fillCounselingForm(session);
    await sleep(500);
    
    // 5. Kaydet
    const success = await submitForm();
    
    // 6. Sonucu bildir
    chrome.runtime.sendMessage({
      action: 'FORM_SUBMITTED',
      data: {
        sessionId: session.id,
        success: success,
        error: success ? null : 'Form kaydetme hatası'
      }
    });
    
  } catch (error) {
    console.error('Session işleme hatası:', error);
    
    chrome.runtime.sendMessage({
      action: 'FORM_SUBMITTED',
      data: {
        sessionId: session.id,
        success: false,
        error: error.message
      }
    });
  }
}

async function navigateToStudentSearch() {
  // MEBBİS'te öğrenci arama sayfasına git
  // URL örnek: /student/search
  const searchLink = document.querySelector('a[href*="student"]');
  if (searchLink) {
    searchLink.click();
    await waitForPageLoad();
  }
}

async function searchAndSelectStudent(studentName) {
  const searchInput = document.querySelector('#studentSearchInput');
  if (!searchInput) {
    throw new Error('Öğrenci arama inputu bulunamadı');
  }
  
  // Öğrenci adını yaz
  searchInput.value = studentName;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Ara butonuna tıkla
  const searchButton = document.querySelector('#searchButton');
  if (searchButton) {
    searchButton.click();
    await sleep(2000); // Sonuçların yüklenmesini bekle
  }
  
  // İlk sonucu seç
  const firstResult = document.querySelector('.student-result-item');
  if (!firstResult) {
    throw new Error('Öğrenci bulunamadı');
  }
  
  firstResult.click();
  await waitForPageLoad();
}

async function navigateToCounselingForm() {
  // Görüşme kaydı oluştur sayfasına git
  const newCounselingButton = document.querySelector('button:contains("Yeni Görüşme")');
  if (newCounselingButton) {
    newCounselingButton.click();
    await waitForPageLoad();
  }
}

async function fillCounselingForm(session) {
  // Bireysel/Grup seçimi
  const sessionTypeRadio = session.sessionType === 'individual' 
    ? document.querySelector('input[value="Bireysel"]')
    : document.querySelector('input[value="Grup"]');
  if (sessionTypeRadio) {
    sessionTypeRadio.click();
  }
  
  // RPD Hizmet Türü
  selectDropdownOption('#rpdHizmetTuru', session.topic);
  
  // 1. Aşama
  const asama1Value = mapSessionModeToAsama1(session.sessionMode);
  selectDropdownOption('#asama1', asama1Value);
  
  // 2. Aşama
  selectDropdownOption('#asama2', session.sessionLocation);
  
  // Görüşme Tarihi
  const dateInput = document.querySelector('#gorusmeTarihi');
  if (dateInput) {
    dateInput.value = formatDate(session.sessionDate);
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Başlangıç Saati
  const startTimeInput = document.querySelector('#baslangicSaati');
  if (startTimeInput) {
    startTimeInput.value = session.entryTime;
    startTimeInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Bitiş Saati
  const endTimeInput = document.querySelector('#bitisSaati');
  if (endTimeInput) {
    endTimeInput.value = session.exitTime;
    endTimeInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Çalışma Yeri
  selectDropdownOption('#calismaYapilanYer', session.sessionLocation);
  
  // Oturum Sayısı
  const sessionCountInput = document.querySelector('#oturumSayisi');
  if (sessionCountInput) {
    sessionCountInput.value = '1';
    sessionCountInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Disiplin Durumu (opsiyonel)
  if (session.disciplineStatus) {
    selectDropdownOption('#disiplinDurumu', session.disciplineStatus);
  }
  
  // Açıklama
  const descriptionTextarea = document.querySelector('#aciklama');
  if (descriptionTextarea) {
    const description = [
      session.sessionDetails,
      session.detailedNotes
    ].filter(Boolean).join('\n\n');
    
    descriptionTextarea.value = description;
    descriptionTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

async function submitForm() {
  const submitButton = document.querySelector('#kaydetBtn, button[type="submit"]');
  if (!submitButton) {
    throw new Error('Kaydet butonu bulunamadı');
  }
  
  submitButton.click();
  await sleep(2000); // Kaydetme işlemi için bekle
  
  // Başarı mesajı kontrolü
  const successMessage = document.querySelector('.success-message, .alert-success');
  const errorMessage = document.querySelector('.error-message, .alert-danger');
  
  if (errorMessage) {
    throw new Error(errorMessage.textContent.trim());
  }
  
  return !!successMessage;
}

// Yardımcı fonksiyonlar

function selectDropdownOption(selector, value) {
  const dropdown = document.querySelector(selector);
  if (!dropdown) return;
  
  // Select element
  if (dropdown.tagName === 'SELECT') {
    const option = Array.from(dropdown.options).find(
      opt => opt.text.includes(value) || opt.value === value
    );
    if (option) {
      dropdown.value = option.value;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

function mapSessionModeToAsama1(sessionMode) {
  const mapping = {
    'yüz_yüze': 'Yüz Yüze',
    'telefon': 'Telefon',
    'online': 'Online'
  };
  return mapping[sessionMode] || 'Yüz Yüze';
}

function formatDate(dateString) {
  // "2025-10-20" -> "20/10/2025"
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}
```

---

## 🛡️ Güvenlik ve Hata Yönetimi

### 1. Authentication

```javascript
// Extension'da API çağrıları için auth token kullanımı

async function callRehber360API(endpoint, options = {}) {
  const state = await chrome.storage.local.get('mebbisExportState');
  const { apiUrl, authToken } = state.mebbisExportState;
  
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}
```

### 2. Rate Limiting

```typescript
// Backend: MEBBİS export için rate limiting
import rateLimit from 'express-rate-limit';

const mebbisExportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 50, // Maksimum 50 export
  message: 'Çok fazla export isteği. Lütfen 15 dakika bekleyin.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/counseling/mebbis/export', mebbisExportLimiter);
```

### 3. Retry Mekanizması

```javascript
// Extension: Başarısız işlemleri tekrar dene

async function processSessionWithRetry(session, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await processSession(session);
      return { success: true };
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        await sleep(2000 * attempt); // Exponential backoff
      }
    }
  }
  
  return {
    success: false,
    error: lastError.message,
    retries: maxRetries
  };
}
```

### 4. Validation

```typescript
// Backend: Session validation
import { z } from 'zod';

const MebbisExportSessionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string().min(1, 'Öğrenci adı gerekli'),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı'),
  entryTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçersiz saat formatı'),
  exitTime: z.string().regex(/^\d{2}:\d{2}$/, 'Geçersiz saat formatı'),
  topic: z.string().min(1, 'Konu gerekli'),
  sessionLocation: z.string().min(1, 'Görüşme yeri gerekli'),
  sessionMode: z.enum(['yüz_yüze', 'telefon', 'online']),
  sessionType: z.enum(['individual', 'group'])
});

// Endpoint'te kullanım
app.get('/api/counseling/mebbis/pending', async (req, res) => {
  const sessions = await getPendingSessions();
  
  // Validate her session
  const validSessions = sessions.filter(session => {
    try {
      MebbisExportSessionSchema.parse(session);
      return true;
    } catch (error) {
      console.error(`Invalid session ${session.id}:`, error);
      return false;
    }
  });
  
  res.json({ sessions: validSessions });
});
```

---

## 📦 Deployment ve Dağıtım

### Chrome Extension Yayınlama

1. **Extension'ı Paketleme**
   ```bash
   cd chrome-extension
   zip -r rehber360-mebbis-extension.zip *
   ```

2. **Chrome Web Store'a Yükleme**
   - https://chrome.google.com/webstore/devconsole
   - "Yeni Öğe" → ZIP yükle
   - Açıklama, ekran görüntüleri ekle
   - İncelemeye gönder (1-3 gün)

3. **Extension ID**
   - Yayınlandıktan sonra bir ID alacak
   - Bu ID'yi Rehber360 koduna ekle:
   ```typescript
   const CHROME_EXTENSION_ID = 'abcdefghijklmnop'; // Gerçek ID
   ```

### Rehber360 Güncelleme

1. **Database Migration**
   ```typescript
   // server/lib/database/migrations/add-mebbis-fields.ts
   export function addMebbisFields(db: Database) {
     db.exec(`
       ALTER TABLE counseling_sessions 
       ADD COLUMN mebbisExported BOOLEAN DEFAULT FALSE;
       
       ALTER TABLE counseling_sessions 
       ADD COLUMN mebbisExportedAt DATETIME;
       
       -- Diğer alanlar...
     `);
   }
   ```

2. **Backend Deploy**
   - Yeni API endpoint'leri ekle
   - Test et
   - Replit'te publish

3. **Frontend Deploy**
   - Yeni UI bileşenlerini ekle
   - Build et
   - Deploy

---

## 🧪 Test Senaryoları

### 1. Unit Tests

```typescript
// __tests__/mebbis-export.test.ts
import { describe, it, expect } from 'vitest';
import { mapSessionToMebbis } from '@/utils/mebbis-mapper';

describe('MEBBİS Mapper', () => {
  it('should map individual session correctly', () => {
    const session = {
      sessionType: 'individual',
      sessionMode: 'yüz_yüze',
      sessionDate: '2025-10-20',
      entryTime: '09:00',
      exitTime: '09:45'
    };
    
    const mapped = mapSessionToMebbis(session);
    
    expect(mapped.birimGroup).toBe('Bireysel');
    expect(mapped.asama1).toBe('Yüz Yüze');
    expect(mapped.gorusmeTarihi).toBe('20/10/2025');
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/mebbis-api.test.ts
describe('MEBBİS API Endpoints', () => {
  it('should get pending sessions', async () => {
    const response = await fetch('/api/counseling/mebbis/pending', {
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.sessions).toBeInstanceOf(Array);
  });
  
  it('should mark session as exported', async () => {
    const response = await fetch('/api/counseling/mebbis/session-123/mark', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exported: true,
        exportedAt: new Date().toISOString()
      })
    });
    
    expect(response.ok).toBe(true);
  });
});
```

### 3. E2E Tests (Manuel)

**Test Checklist:**
- [ ] "MEBBİS'e Aktar" butonu görünüyor
- [ ] Butona tıklandığında dialog açılıyor
- [ ] Pending sessions listeleniyor
- [ ] "Başlat" butonu MEBBİS'i açıyor
- [ ] QR kod ekranı algılanıyor
- [ ] Giriş sonrası otomatik devam ediyor
- [ ] Form alanları doğru doldurulıyor
- [ ] Kaydetme işlemi başarılı
- [ ] Progress güncellemesi çalışıyor
- [ ] Hata durumları doğru yönetiliyor
- [ ] Tamamlanma bildirimi geliyor
- [ ] Database güncelleniyor

---

## 📝 Kullanıcı Dokümantasyonu

### Extension Kurulum Rehberi

**Adım 1: Extension İndirme**
1. Chrome Web Store'u açın
2. "Rehber360 MEBBİS Aktarıcı" arayın
3. "Chrome'a Ekle" butonuna tıklayın
4. İzinleri onaylayın

**Adım 2: İlk Kurulum**
1. Extension ikonuna tıklayın
2. "Rehber360 Bağlantısı Kur" butonuna basın
3. Rehber360 URL'nizi girin (örn: https://rehber360.replit.app)
4. "Bağlan" butonuna tıklayın

**Adım 3: Kullanım**
1. Rehber360'da Görüşme Kayıtları sayfasına gidin
2. "MEBBİS'e Aktar" butonuna tıklayın
3. Açılan dialog'da "MEBBİS'i Aç ve Başlat" butonuna basın
4. Yeni sekmede MEBBİS açılacak
5. QR kod ile giriş yapın (telefonunuzla tarayın)
6. Giriş yaptıktan sonra otomatik devam edilecek
7. İşlem tamamlanana kadar bekleyin
8. Tamamlama bildirimini bekleyin

### Sık Karşılaşılan Sorunlar

**Q: Extension bulunamadı hatası alıyorum**
A: Chrome Extension'ın yüklü olduğundan emin olun. Extension ikonunu tarayıcı toolbar'ında görmelisiniz.

**Q: QR kod ekranında takılı kaldı**
A: QR kod ile giriş yaptıktan sonra birkaç saniye bekleyin. Otomatik olarak devam edecektir.

**Q: Bazı görüşmeler başarısız oluyor**
A: Export sonuç ekranında başarısız görüşmeleri görebilirsiniz. "Tekrar Dene" butonuyla yeniden deneyebilirsiniz. Hata mesajlarını kontrol edin.

**Q: MEBBİS'te alan bulunamadı hatası**
A: MEBBİS formu güncellenmiş olabilir. Extension'ın yeni versiyonunu yükleyin.

---

## 🎯 Gelecek Geliştirmeler

### Faz 1 (MVP - Minimum Viable Product)
- [x] Temel export işlevi
- [x] QR kod giriş desteği
- [x] Bireysel görüşme aktarımı
- [x] Basit hata yönetimi
- [x] Progress tracking

### Faz 2 (İyileştirmeler)
- [ ] Grup görüşmesi aktarımı
- [ ] Toplu seçim ve aktarım
- [ ] Otomatik retry mekanizması
- [ ] Detaylı log sistemi
- [ ] Export geçmişi ve raporlama

### Faz 3 (Gelişmiş Özellikler)
- [ ] Zamanlı otomatik export (Her gece 00:00'da)
- [ ] MEBBİS form değişikliklerini otomatik algılama
- [ ] Çoklu okul desteği
- [ ] Export template'leri (farklı form yapıları için)
- [ ] MEBBİS'ten veri çekme (senkronizasyon)

### Faz 4 (Entegrasyon)
- [ ] Diğer MEB sistemleri (e-Okul, MEBBIS API)
- [ ] Toplu öğrenci profili senkronizasyonu
- [ ] Raporlama ve analytics
- [ ] Mobil uygulama desteği

---

## 📊 Performans ve Ölçümler

### Metrikler

**Kullanım Metrikleri:**
- Günlük export sayısı
- Başarı oranı (%)
- Ortalama export süresi
- Kullanıcı başına export sayısı

**Hata Metrikleri:**
- Hata tipleri ve frekansları
- Retry oranı
- Timeout oranı

**Sistem Metrikleri:**
- API response time
- Extension performansı
- Database query time

### Monitoring

```typescript
// Backend: Export metrikleri toplama
async function trackExportMetrics(sessionId: string, success: boolean, duration: number) {
  await db.run(`
    INSERT INTO export_metrics (sessionId, success, duration, timestamp)
    VALUES (?, ?, ?, ?)
  `, [sessionId, success, duration, new Date().toISOString()]);
}

// Metrik sorguları
async function getExportStats(dateFrom: string, dateTo: string) {
  return db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
      AVG(duration) as avgDuration,
      MAX(duration) as maxDuration
    FROM export_metrics
    WHERE timestamp BETWEEN ? AND ?
  `, [dateFrom, dateTo]);
}
```

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] HTTPS zorunlu (MEBBİS ve Rehber360)
- [ ] Auth token güvenli depolama (Chrome Storage Sync)
- [ ] API rate limiting uygulandı
- [ ] Input validation (tüm form alanları)
- [ ] SQL injection koruması (prepared statements)
- [ ] XSS koruması (sanitized inputs)
- [ ] CORS yapılandırması doğru
- [ ] Extension permissions minimum düzeyde
- [ ] Hassas veriler loglanmıyor
- [ ] Error messages kullanıcıya teknik detay vermeden

---

## 📞 Destek ve İletişim

**Teknik Destek:**
- Email: support@rehber360.com
- Dokümantasyon: https://docs.rehber360.com/mebbis-export
- GitHub Issues: https://github.com/rehber360/mebbis-extension/issues

**Güncellemeler:**
- Extension otomatik güncellenir (Chrome Web Store)
- Rehber360 backend güncellemeleri deployment ile
- Değişiklik notları: CHANGELOG.md

---

## 🏁 Sonuç

Bu MEBBİS otomasyon sistemi, Rehber360 kullanıcılarının görüşme kayıtlarını hızlı ve güvenli bir şekilde MEBBİS sistemine aktarmasını sağlayacaktır.

**Temel Avantajlar:**
✅ Zaman tasarrufu (manuel girişe göre %90 daha hızlı)
✅ Hata oranı azalması (otomatik veri transferi)
✅ Kullanıcı dostu (tek tuş ile çalışma)
✅ Minimal kurulum (sadece Chrome Extension)
✅ Güvenli (tüm veriler şifreli iletişim)

**İmplementasyon Süresi Tahmini:**
- Backend geliştirme: 3-5 gün
- Chrome Extension geliştirme: 5-7 gün
- Frontend entegrasyonu: 2-3 gün
- Test ve debugging: 3-5 gün
- **Toplam:** 2-3 hafta

**Başarı Kriterleri:**
- Export başarı oranı >95%
- Ortalama export süresi <30 saniye/görüşme
- Kullanıcı memnuniyeti >4.5/5
- Hata oranı <5%

---

**Versiyon:** 1.0.0  
**Son Güncelleme:** 25 Ekim 2025  
**Durum:** Planlama Tamamlandı - Geliştirme Bekliyor
