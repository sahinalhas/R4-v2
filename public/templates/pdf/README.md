# PDF Templates

PDF şablonları için klasör.

## Kullanılabilir Şablonlar

Henüz şablon eklenmemiş. PDF şablonlarını buraya ekleyebilirsiniz.

## Şablon Ekleme

PDF şablonlarını bu klasöre ekleyin:

```bash
cp your-template.pdf public/templates/pdf/
```

## Kullanım

```typescript
const pdfUrl = '/templates/pdf/your-template.pdf';
const response = await fetch(pdfUrl);
const blob = await response.blob();
```
