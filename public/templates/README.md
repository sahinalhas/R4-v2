# Templates

Bu klasör PDF ve Excel şablonlarını içerir. Bu şablonlar, raporlar ve dışa aktarma işlemleri için kullanılır.

## Klasör Yapısı

```
templates/
├── pdf/              # PDF şablonları
│   └── .gitkeep
├── excel/            # Excel şablonları
│   └── .gitkeep
└── README.md         # Bu dosya
```

## PDF Şablonları

PDF şablonları `jspdf` ve `jspdf-autotable` kütüphaneleri kullanılarak oluşturulur.

### Önerilen PDF Şablonları

- `student-report.pdf` - Öğrenci rapor şablonu
- `class-report.pdf` - Sınıf rapor şablonu
- `counseling-session-report.pdf` - Görüşme rapor şablonu
- `exam-results-report.pdf` - Sınav sonuçları rapor şablonu
- `attendance-report.pdf` - Devamsızlık rapor şablonu

### PDF Oluşturma Örneği

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function generateStudentReport(studentData: StudentData) {
  const doc = new jsPDF();
  
  // Başlık
  doc.setFontSize(18);
  doc.text('Öğrenci Raporu', 14, 22);
  
  // Öğrenci Bilgileri
  doc.setFontSize(12);
  doc.text(`Ad Soyad: ${studentData.fullName}`, 14, 35);
  doc.text(`Sınıf: ${studentData.class}`, 14, 42);
  doc.text(`Öğrenci No: ${studentData.studentNumber}`, 14, 49);
  
  // Tablo ekle
  doc.autoTable({
    head: [['Ders', 'Not', 'Durum']],
    body: studentData.grades.map(g => [g.subject, g.score, g.status]),
    startY: 60,
  });
  
  // PDF'i kaydet
  doc.save(`ogrenci-raporu-${studentData.studentNumber}.pdf`);
}
```

## Excel Şablonları

Excel şablonları `xlsx` kütüphanesi kullanılarak oluşturulur.

### Önerilen Excel Şablonları

- `student-list-template.xlsx` - Öğrenci listesi şablonu
- `survey-template.xlsx` - Anket şablonu
- `exam-scores-template.xlsx` - Sınav notları şablonu
- `attendance-template.xlsx` - Devamsızlık şablonu
- `counseling-sessions-template.xlsx` - Görüşmeler şablonu

### Excel Oluşturma Örneği

```typescript
import * as XLSX from 'xlsx';

function generateStudentListExcel(students: Student[]) {
  // Veriyi hazırla
  const data = students.map(student => ({
    'Öğrenci No': student.studentNumber,
    'Ad Soyad': student.fullName,
    'Sınıf': student.class,
    'E-posta': student.email,
    'Telefon': student.phone,
    'Durum': student.status,
  }));
  
  // Worksheet oluştur
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Workbook oluştur
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Öğrenciler');
  
  // Excel dosyasını kaydet
  XLSX.writeFile(workbook, 'ogrenci-listesi.xlsx');
}
```

## Template Dosyalarını Ekleme

### 1. PDF Template Dosyası Eklemek

```bash
# Template dosyasını kopyala
cp path/to/template.pdf public/templates/pdf/
```

### 2. Excel Template Dosyası Eklemek

```bash
# Template dosyasını kopyala
cp path/to/template.xlsx public/templates/excel/
```

## Template'lere Erişim

Template dosyalarına doğrudan URL üzerinden erişilebilir:

```typescript
// PDF template
const pdfTemplateUrl = '/templates/pdf/student-report.pdf';

// Excel template
const excelTemplateUrl = '/templates/excel/student-list-template.xlsx';

// Fetch ile yükle
const response = await fetch(pdfTemplateUrl);
const blob = await response.blob();
```

## Best Practices

1. **Dosya İsimlendirme**
   - Küçük harf kullanın: `student-report.pdf`
   - Tire ile ayırın: `counseling-session-report.pdf`
   - Açıklayıcı isimler: `exam-results-2024.pdf`

2. **Dosya Boyutu**
   - PDF'ler için maksimum 5 MB
   - Excel dosyaları için maksimum 10 MB

3. **Versiyonlama**
   - Template'lerde versiyon belirtin: `student-report-v1.pdf`
   - Büyük değişikliklerde yeni versiyon oluşturun

4. **Dokümantasyon**
   - Her template için kullanım amacını belgelendirin
   - Örnek kullanım kodları ekleyin

## Güvenlik Notları

- Template dosyaları public klasöründe olduğu için herkese açıktır
- Hassas bilgi içeren template'ler eklemekten kaçının
- Dinamik içerik için backend'de generate edin

## İlgili Dosyalar

- PDF generation: `client/lib/utils/exporters/`
- Excel generation: `client/lib/utils/exporters/`
- Export helpers: `client/lib/utils/helpers/export-helpers.ts`
