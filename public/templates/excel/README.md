# Excel Templates

Excel şablonları için klasör.

## Kullanılabilir Şablonlar

Henüz şablon eklenmemiş. Excel şablonlarını buraya ekleyebilirsiniz.

## Şablon Ekleme

Excel şablonlarını bu klasöre ekleyin:

```bash
cp your-template.xlsx public/templates/excel/
```

## Kullanım

```typescript
const excelUrl = '/templates/excel/your-template.xlsx';
const response = await fetch(excelUrl);
const blob = await response.blob();

// xlsx kütüphanesi ile işle
import * as XLSX from 'xlsx';
const arrayBuffer = await blob.arrayBuffer();
const workbook = XLSX.read(arrayBuffer, { type: 'array' });
```
