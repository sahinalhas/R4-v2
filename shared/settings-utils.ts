import type { AppSettings, PresentationTab, PresentationCategory, PresentationItem } from './types.js';

export function parseDocumentToPresentationSystem(documentText: string): PresentationTab[] {
  const lines = documentText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const tabs: PresentationTab[] = [];
  let currentTab: PresentationTab | null = null;
  const categoryStack: PresentationCategory[] = [];
  
  for (const line of lines) {
    if (/^\d+$/.test(line)) continue;
    
    const headerMatch = line.match(/^(\d+(?:\.\d+)*)\.\s+(.+)$/);
    
    if (headerMatch) {
      const [, number, title] = headerMatch;
      const depth = number.split('.').length - 1;
      
      if (depth === 0) {
        currentTab = {
          id: `tab-${number}`,
          title: title.trim(),
          categories: []
        };
        tabs.push(currentTab);
        categoryStack.length = 0;
        continue;
      }
      
      const category: PresentationCategory = {
        id: `category-${number}`,
        title: title.trim(),
        number,
        items: [],
        children: []
      };
      
      categoryStack.splice(depth - 1);
      
      if (categoryStack.length > 0) {
        categoryStack[categoryStack.length - 1].children.push(category);
      } else if (currentTab) {
        currentTab.categories.push(category);
      }
      
      categoryStack.push(category);
    } else {
      const item: PresentationItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: line.trim(),
        editable: true
      };
      
      if (categoryStack.length > 0) {
        categoryStack[categoryStack.length - 1].items.push(item);
      }
    }
  }
  
  return tabs;
}

export function getDefaultPresentationSystem(): PresentationTab[] {
  const documentText = `2. BİREYSEL ÇALIŞMALAR
2.1. (Ö) GELİŞİMSEL VE ÖNLEYİCİ HİZMETLER
2.1.1. ÖOB BİREYİ TANIMA ÇALIŞMALARI
B.K.P.1.c Yaşam Pencerem
B.K.G.4.c Öğrenci Bilgi Formu
B.K.G.12.c Yol Haritam
B.K.O.1.c Bana Kendini Anlat
B.K.G.3.c Kendimi Tanıyorum
B.K.A.7.c Şiddet Algısı Anketi
B.K.A.8.c Şiddet Sıklığı Anketi
B.K.A.9.c Şiddet Meşruiyeti Anketi
B.G.G.10.c. Şiddet Algısı Anketi (Veli)
B.G.G.11.c. Şiddet Sıklığı Anketi (Veli)
B.G.G.12.c. Şiddet Meşruiyeti Anketi (Veli)
B.G.G.13.c. Şiddet Algısı Anketi (Öğretmen)
B.G.G.14.c. Şiddet Sıklığı Anketi (Öğretmen)
B.G.G.15.c. Şiddet Meşruiyeti Anketi (Öğretmen 4-6.sınıf)
B.G.G.16.c. Şiddet Meşruiyeti Anketi (Öğretmen 7-12. sınıf)
B.K.İ.1.c Verimli Ders Çalışma Kontrol Listesi
B.G.G.2.c Çocuğumu Tanıyorum Formu
B.G.G.1.c Aile içi Gözlem Formu
B.G.G.3.c DEHB Gözlem Formu
B.G.G.4.c Ev Ziyaret Formu
B.G.G.7.c Öğrenci Gözlem Kaydı
B.G.G.8.a Özel Öğrenme Güçlüğü Gözlem Formu
B.K.G.7.c Öğrenci-Ön görüşme Formu
B.K.A.2.c Devamsızlık Nedenleri Anketi
ÖOB99 Diğer
2.1.2. ÖOV BİLGİ VERME ÇALIŞMALARI
2.1.2.1. ÖOVK SOSYAL DUYGUSAL GELİŞİM
ÖOVKb Aile
ÖOVKb Arkadaşlık İlişkileri
ÖOVKb Davranış Sorunları
ÖOVKb Psikolojik Uyum
ÖOVKb Sağlık
ÖOVKb Sosyal Uyum
ÖOVKb Sosyo-ekonomik Konular
2.1.2.2. ÖOVE AKADEMİK GELİŞİM
ÖOVEb Başarısızlık Nedenleri
ÖOVEb Çalışma Programı Hazırlama
ÖOVEb Ders Seçimi
ÖOVEb Devamsızlığı Önleme
ÖOVEb Devamsızlık Nedenleri
ÖOVEb Dikkat Geliştirme Çalışmaları
ÖOVEb Hedef Belirleme
ÖOVEb Motivasyon
ÖOVEb Okul Kuralları
ÖOVEb Okul ve Çevresindeki Eğitim Olanakları
ÖOVEb Okula ve Çevreye Uyum
ÖOVEb Okulda Seçilebilecek Alan/Dallar
ÖOVEb Okulun Fiziksel İmkânları
ÖOVEb Okulun Sosyo-kültürel İmkânları
ÖOVEb Öğrenciyi İlgilendiren Yönetmelikler
ÖOVEb Öğrenme Stilleri
ÖOVEb Öz Disiplin Geliştirme
ÖOVEb Rehberlik ve Psikolojik Danışma Servisinin Tanıtılması
ÖOVEb Serbest Zamanı Değerlendirme
ÖOVEb Sınav Kaygısı
ÖOVEb Sınavda Başarılı Olma Stratejileri
ÖOVEb Sosyal Kulüpler
ÖOVEb Üst Öğrenimde Yararlanılacak Burslar ve Barınma Olanakları
ÖOVEb Üst Öğrenime Geçiş Sınavları
ÖOVEb Verimli Ders Çalışma
ÖOVEb Yurt Dışı Eğitim Olanakları
ÖOVEb Zamanı Yönetimi
2.1.2.3. ÖOVM KARİYER GELİŞİMİ
ÖOVMb Çalışan/İşveren Hak ve Sorumlulukları
ÖOVMb Çevredeki İş Olanakları ve Çalışma Koşulları
ÖOVMb İş Görüşmesi Becerileri
ÖOVMb İş ve Mesleğe Hazırlayan Kurum ve Kursların Tanıtımı
ÖOVMb İş ve Meslek Etiği
ÖOVMb İş Yaşamına Yönelik Beceriler
ÖOVMb Kariyer Planlama
ÖOVMb Meslek Sahibi Olmanın Önemi
ÖOVMb Meslek Seçerken Dikkat Edilmesi Gereken Hususlar
ÖOVMb Meslek Tanıtımı
ÖOVMb Meslek ve Değer İlişkisi
ÖOVMb Meslek ve İlgi İlişkisi
ÖOVMb Meslek ve Kişisel Özellik İlişkisi
ÖOVMb Meslek ve Yetenek İlişkisi
ÖOVMb Mesleki Hedef Belirleme
ÖOVMb Mesleklerin İncelenmesi
ÖOVMb Öz Geçmiş Hazırlama
ÖOVMb Staj
2.1.3. (ÖOY) YÖNELTME VE İZLEME
ÖOY Alan/Dal Tercihleri
ÖOY Seçmeli Ders
ÖOY Sosyal Kulüpler
ÖOY Üst Öğrenim Kurumuna Geçen Öğrencilerin İzlenmesi
2.2. (İ) İYİLEŞTİRİCİ HİZMETLER
2.2.1. İB BİREYSEL PSİKOLOJİK DANIŞMA
İB Aile
İB Davranış Sorunları
İB Okula ve Çevreye Uyum
İB Psikolojik Uyum
İB Sağlık
İB Sosyal Uyum
İB Sosyo-ekonomik Konular
İB Yöneltme Yerleştirme
İB OBM
2.2.2. (İP) PSİKOSOSYAL MÜDAHALE
2.2.2.1. İPbB BİLDİRİM YÜKÜMLÜLÜĞÜ
İPbB Cinsel İstismar
İPbB Duygusal İhmal
İPbB Duygusal İstismar
İPbB Eğitim ile İlgili İhmal
İPbB Ekonomik İstismar
İPbB Fiziksel İhmal
İPbB Fiziksel İstismar
İPbB Madde Bulundurma
İPbB Madde Kullanımı
İPbB Madde Satışı
İPbB Sağlık İhmali
2.2.2.2. İPbT KORUYUCU VE DESTEKLEYİCİ TEDBİR
İPbT Danışmanlık Tedbiri
İPbT Danışmanlık ve Eğitim Tedbiri
İPbT Eğitim Tedbiri
2.2.2.3. İPbİ İNTİHAR
İPbİ Tamamlanmamış İntihar
İPbİ Tamamlanmış İntihar
2.2.3. İS SEVK (YÖNLENDİRME)
İS RAM RPD Hizmetleri Bölümüne Yönlendirme
İS Sağlık Kuruluşuna Yönlendirme
İS ASHÇB 'ye Bağlı Kuruluşlara Yönlendirme
İS Diğer
2.3. (D) DESTEK HİZMETLER
2.3.1. (DM) MÜŞAVİRLİK
2.3.1.1. DMV VELİYE YÖNELİK
DMVG Aile
DMVG Akademik Konular
DMVG Davranış Sorunları
DMVG Okula ve Çevreye Uyum
DMVG Psikolojik Uyum
DMVG Sağlık
DMVG Sosyal Uyum
DMVG Sosyo-ekonomik Konular
DMVG Yöneltme Yerleştirme
2.3.1.2. DMÖ ÖĞRETMENE YÖNELİK
DMÖG Aile
DMÖG Akademik Konular
DMÖG Davranış Sorunları
DMÖG Okula ve Çevreye Uyum
DMÖG Psikolojik Uyum
DMÖG Sağlık
DMÖG Sosyal Uyum
DMÖG Sosyo-ekonomik Konular
DMÖG Yöneltme Yerleştirme
3. GRUP ÇALIŞMALARI
3.1. (Ö) GELİŞİMSEL VE ÖNLEYİCİ HİZMETLER
3.1.1. GRUP BİREYİ TANIMA ÇALIŞMALARI
G.K.P.1.c Grup Yaşam Pencerem
G.K.G.4.c Grup Bilgi Formu
G.K.G.12.c Grup Yol Haritam
3.1.2. GÖV BİLGİ VERME ÇALIŞMALARI
3.1.2.1. GÖOVK SOSYAL DUYGUSAL GELİŞİM
GÖOVKb Grup Aile
GÖOVKb Grup Arkadaşlık İlişkileri
GÖOVKb Grup Davranış Sorunları
GÖOVKb Grup Psikolojik Uyum
3.1.2.2. GÖOVE AKADEMİK GELİŞİM
GÖOVEb Grup Başarısızlık Nedenleri
GÖOVEb Grup Çalışma Programı Hazırlama
GÖOVEb Grup Motivasyon
GÖOVEb Grup Okul Kuralları
3.2. (İ) İYİLEŞTİRİCİ HİZMETLER
3.2.1. İGB BİREYSEL PSİKOLOJİK DANIŞMA
İGB Grup Aile
İGB Grup Davranış Sorunları
İGB Grup Okula ve Çevreye Uyum
İGB Grup Psikolojik Uyum`;

  return parseDocumentToPresentationSystem(documentText);
}

export function getDefaultSettings(): AppSettings {
  return {
    theme: "light",
    language: "tr",
    dateFormat: "dd.MM.yyyy",
    timeFormat: "HH:mm",
    weekStart: 1,
    notifications: { email: true, sms: false, push: true, digestHour: 9 },
    data: {
      autosave: true,
      autosaveInterval: 5,
      anonymizeOnExport: true,
      backupFrequency: "weekly",
    },
    integrations: {
      mebisEnabled: false,
      mebisToken: "",
      eokulEnabled: false,
      eokulApiKey: "",
    },
    privacy: { analyticsEnabled: false, dataSharingEnabled: false },
    account: {
      displayName: "Kullanıcı",
      email: "user@example.com",
      institution: "Okul",
      signature: "",
    },
    school: { periods: [] },
    presentationSystem: getDefaultPresentationSystem(),
  };
}

export function mergeWithDefaults(partial: Partial<AppSettings>): AppSettings {
  const defaults = getDefaultSettings();
  
  if (!partial || Object.keys(partial).length === 0) {
    return defaults;
  }
  
  return {
    ...defaults,
    ...partial,
    notifications: {
      ...defaults.notifications,
      ...(partial.notifications || {}),
    },
    data: { ...defaults.data, ...(partial.data || {}) },
    integrations: {
      ...defaults.integrations,
      ...(partial.integrations || {}),
    },
    privacy: { ...defaults.privacy, ...(partial.privacy || {}) },
    account: { ...defaults.account, ...(partial.account || {}) },
    school: { ...defaults.school, ...(partial.school || {}) },
    presentationSystem: partial.presentationSystem && partial.presentationSystem.length > 0 
      ? partial.presentationSystem 
      : getDefaultPresentationSystem(),
  };
}
