/**
 * Öğrenci öz-değerlendirme anketleri için standart değerler
 * AI standartlaştırma işlemleri bu değerleri kullanır
 */

export const STANDARD_SUBJECTS = [
  'Matematik',
  'Türkçe',
  'İngilizce',
  'Fen Bilgisi',
  'Sosyal Bilgiler',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Tarih',
  'Coğrafya',
  'Felsefe',
  'Din Kültürü ve Ahlak Bilgisi',
  'Beden Eğitimi',
  'Müzik',
  'Görsel Sanatlar',
  'Teknoloji ve Tasarım',
  'Bilişim Teknolojileri'
];

export const STANDARD_INTERESTS = [
  'Spor',
  'Müzik',
  'Resim ve Sanat',
  'Edebiyat',
  'Bilim',
  'Teknoloji',
  'Doğa ve Çevre',
  'Hayvanlar',
  'Tarih',
  'Coğrafya ve Seyahat',
  'Fotoğrafçılık',
  'Sinema ve Film',
  'Tiyatro',
  'Dans',
  'El Sanatları',
  'Yemek Pişirme',
  'Moda',
  'Yazılım ve Kodlama',
  'Robotik',
  'Astronomi'
];

export const STANDARD_HOBBIES = [
  'Futbol',
  'Basketbol',
  'Voleybol',
  'Yüzme',
  'Koşu',
  'Bisiklet',
  'Satranç',
  'Kitap Okuma',
  'Müzik Dinleme',
  'Enstrüman Çalma',
  'Resim Yapma',
  'Fotoğraf Çekme',
  'Video Çekme ve Montaj',
  'Yazı Yazma',
  'Blog Yazarlığı',
  'Bahçe İşleri',
  'El İşleri',
  'Yemek Yapma',
  'Oyun Oynama',
  'Programlama'
];

export const STANDARD_CAREER_GOALS = [
  'Doktor',
  'Mühendis',
  'Öğretmen',
  'Avukat',
  'İşletmeci',
  'Mimar',
  'Hemşire',
  'Eczacı',
  'Veteriner',
  'Psikolog',
  'Sosyal Çalışmacı',
  'Pilot',
  'Polis',
  'Asker',
  'İtfaiyeci',
  'Gazeteci',
  'Sanatçı',
  'Müzisyen',
  'Sporcu',
  'Yazılım Geliştirici',
  'Bilim İnsanı',
  'Aşçı',
  'Tasarımcı',
  'Fotoğrafçı',
  'Yönetici'
];

export const STANDARD_LEARNING_STYLES = [
  'Görsel öğrenme (resimler, şemalar, videolarla)',
  'İşitsel öğrenme (dinleyerek, tartışarak)',
  'Kinestetik öğrenme (yaparak, deneyerek)',
  'Okuma/Yazma (kitaplar, notlar alarak)',
  'Grup çalışması (arkadaşlarla beraber)',
  'Bireysel çalışma (tek başına)'
];

export const STANDARD_STUDY_HABITS = [
  'Her gün düzenli çalışırım',
  'Sadece sınav öncesi çalışırım',
  'Ev ödevlerimi zamanında yaparım',
  'Not tutmayı severim',
  'Özet çıkarırım',
  'Akıl haritaları kullanırım',
  'Sesli tekrar yaparım',
  'Arkadaşlarla çalışmayı tercih ederim'
];

export const STANDARD_SOCIAL_SKILLS = [
  'Takım çalışması',
  'Liderlik',
  'İletişim',
  'Empati',
  'Problem çözme',
  'Çatışma yönetimi',
  'Sunum yapma',
  'Dinleme',
  'İşbirliği',
  'Zaman yönetimi'
];

export const STANDARD_PERSONAL_TRAITS = [
  'Sorumluluk sahibi',
  'Güvenilir',
  'Yaratıcı',
  'Analitik düşünen',
  'Sabırlı',
  'Hırslı',
  'Meraklı',
  'Organize',
  'Esnek',
  'Girişimci',
  'Yardımsever',
  'İyimser',
  'Dikkatli',
  'Özgüvenli'
];

export const STANDARD_CHALLENGES = [
  'Matematik konularını anlamakta zorlanma',
  'Ödev yapmayı erteleme',
  'Konsantrasyon sorunu',
  'Sınav kaygısı',
  'Zaman yönetimi',
  'Arkadaşlık ilişkileri',
  'Özgüven eksikliği',
  'Motivasyon düşüklüğü',
  'Ders çalışma alışkanlığı',
  'Sunum yapma korkusu'
];

export const YES_NO_OPTIONS = ['Evet', 'Hayır'];

export const LIKERT_SCALE_1_5 = [
  '1 - Hiç katılmıyorum',
  '2 - Katılmıyorum',
  '3 - Kararsızım',
  '4 - Katılıyorum',
  '5 - Tamamen katılıyorum'
];

export const LIKERT_SCALE_1_10 = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
];

export const FREQUENCY_OPTIONS = [
  'Hiçbir zaman',
  'Nadiren',
  'Bazen',
  'Sıklıkla',
  'Her zaman'
];

export const GRADE_LEVELS = ['9', '10', '11', '12'];

/**
 * AI için mapping konfigürasyonu yardımcıları
 */
export function createAIStandardizeConfig(
  targetTable: string,
  targetField: string,
  standardValues: string[],
  allowCustom: boolean = false
) {
  return {
    strategy: 'AI_STANDARDIZE' as const,
    targetTable,
    targetField,
    standardValues,
    allowCustom,
    transformType: 'ARRAY' as const
  };
}

export function createDirectConfig(
  targetTable: string,
  targetField: string,
  transformType: 'TEXT' | 'ARRAY' | 'NUMBER' | 'DATE' | 'BOOLEAN' = 'TEXT'
) {
  return {
    strategy: 'DIRECT' as const,
    targetTable,
    targetField,
    transformType
  };
}

export function createScaleConvertConfig(
  targetTable: string,
  targetField: string,
  sourceScale: { min: number; max: number },
  targetScale: { min: number; max: number }
) {
  return {
    strategy: 'SCALE_CONVERT' as const,
    targetTable,
    targetField,
    sourceScale,
    targetScale
  };
}
