
# 🎤 Ses-Yazı Çevirme Sistemi

Modern Web Speech API tabanlı, merkezi ve yeniden kullanılabilir ses tanıma sistemi.

## 🎯 Özellikler

- ✅ **Web Speech API** - Tamamen ücretsiz, tarayıcı yerleşik
- ✅ **Türkçe Desteği** - Mükemmel `tr-TR` dil desteği
- ✅ **Gerçek Zamanlı** - Anlık transcript gösterimi
- ✅ **Modern UI** - Google Docs/WhatsApp benzeri kullanıcı deneyimi
- ✅ **Otomatik Durma** - 60 saniye timeout
- ✅ **Hata Yönetimi** - Türkçe hata mesajları ve çözüm önerileri
- ✅ **Klavye Kısayolu** - `Ctrl+Shift+S` ile hızlı başlatma
- ✅ **Responsive** - Tüm cihazlarda uyumlu

## 📦 Kurulum

Tüm gerekli dosyalar zaten eklenmiştir:

```
client/
  ├── hooks/
  │   ├── useSpeechRecognition.ts        # Core hook
  │   └── useVoiceKeyboardShortcut.ts    # Klavye kısayolu
  ├── components/ui/
  │   ├── voice-input-button.tsx         # Mikrofon butonu
  │   ├── voice-input-status.tsx         # Durum göstergesi
  │   └── enhanced-textarea.tsx          # Güncellenmiş (ses desteği)
  └── lib/utils/
      └── speech-utils.ts                # Yardımcı fonksiyonlar

shared/types/
  └── speech.types.ts                    # Tip tanımları
```

## 🚀 Kullanım

### 1. Temel Hook Kullanımı

```tsx
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

function MyComponent() {
  const {
    isListening,
    transcript,
    startListening,
    stopListening
  } = useSpeechRecognition({
    language: 'tr-TR',
    onTranscript: (text) => console.log(text)
  });

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? 'Durdur' : 'Başlat'}
    </button>
  );
}
```

### 2. VoiceInputButton Kullanımı

```tsx
import { VoiceInputButton } from '@/components/ui/voice-input-button';

function MyForm() {
  const handleTranscript = (text: string) => {
    console.log('Transkript:', text);
  };

  return (
    <VoiceInputButton
      onTranscript={handleTranscript}
      size="md"
      language="tr-TR"
    />
  );
}
```

### 3. EnhancedTextarea ile Ses Desteği

```tsx
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';

function MyForm() {
  const [notes, setNotes] = useState('');

  return (
    <EnhancedTextarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Notlarınızı yazın veya söyleyin..."
      enableVoice={true}
      voiceLanguage="tr-TR"
      voiceMode="append"
    />
  );
}
```

## ⚙️ Konfigürasyon

`client/lib/utils/speech-utils.ts` dosyasında:

```typescript
export const SPEECH_CONFIG = {
  language: 'tr-TR',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  autoStopTimeout: 60000,  // 60 saniye
  silenceTimeout: 3000,    // 3 saniye
};
```

## 🎨 Özelleştirme

### Buton Boyutları
- `sm` - 32x32px
- `md` - 40x40px (varsayılan)
- `lg` - 48x48px

### Buton Varyantları
- `inline` - Input içinde (desktop)
- `standalone` - Ayrı buton (mobil)

### Ses Modu
- `append` - Metni ekle (varsayılan)
- `replace` - Metni değiştir

## 🔐 Hata Yönetimi

Sistem otomatik olarak hataları yakalar ve kullanıcıya bildirir:

| Hata | Mesaj | Çözüm |
|------|-------|-------|
| `not-allowed` | Mikrofon izni verilmedi | Ayarlardan izin ver |
| `no-speech` | Ses algılanamadı | Daha yüksek sesle konuş |
| `network` | İnternet yok | Bağlantıyı kontrol et |
| `not-supported` | Tarayıcı desteklemiyor | Chrome/Edge kullan |

## 🌐 Tarayıcı Desteği

- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Opera 27+
- ⚠️ Safari 14.1+ (kısıtlı)
- ❌ Firefox (flag gerekli)

## 📱 Responsive Tasarım

- **Desktop (>768px)**: Input içinde sağ köşe
- **Tablet (768-1024px)**: Input yanında
- **Mobil (<768px)**: Input altında veya FAB

## 🎯 Örnek Entegrasyonlar

Sistem şu alanlarda otomatik olarak etkinleştirilmiştir:

- ✅ Görüşme notları (`EnhancedCompleteSessionDialog`)
- ✅ Aile katılımı notları (`AileKatilimiSection`)
- ✅ Ev ziyareti gözlemleri (`EvZiyaretleriSection`)
- ✅ Davranış takibi (`DavranisTakibiSection`)

## 🔧 Sorun Giderme

### Mikrofon çalışmıyor
1. Tarayıcı iznini kontrol edin
2. HTTPS bağlantısı olduğundan emin olun
3. Mikrofon donanımını test edin

### Ses tanınmıyor
1. Daha net ve yüksek sesle konuşun
2. İnternet bağlantınızı kontrol edin
3. Türkçe dil ayarını doğrulayın

## 📚 API Referansı

Detaylı API dokümantasyonu için tip tanımlarına bakın:
`shared/types/speech.types.ts`

## 🎉 Başarı!

Sistem artık tüm metin giriş alanlarında kullanıma hazır!
