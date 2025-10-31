/**
 * Student Data Processor Service
 * Merkezi Öğrenci Veri İşleme Servisi
 * 
 * Tüm öğrenci verilerinin normalizasyonu, validasyonu ve dönüştürülmesi
 * için merkezi servis
 */

import type { UnifiedStudent, BackendStudent, ProfileCompleteness, STUDENT_VALIDATION_RULES } from '../../shared/types/student.types.js';
import { backendToUnified, unifiedToBackend } from '../../shared/types/student.types.js';

/**
 * Normalize student data
 * Öğrenci verisini normalize et
 */
export function normalizeStudentData(student: any): UnifiedStudent {
  const normalized: any = { ...student };
  
  // ID normalizasyonu
  if (normalized.id && typeof normalized.id === 'string') {
    normalized.id = normalized.id.trim();
  }
  
  // Ad-Soyad normalizasyonu
  if (normalized.ad && typeof normalized.ad === 'string') {
    normalized.ad = normalized.ad.trim();
  }
  if (normalized.soyad && typeof normalized.soyad === 'string') {
    normalized.soyad = normalized.soyad.trim();
  }
  
  // Backend formatından dönüşüm
  if (normalized.name && !normalized.ad && !normalized.soyad) {
    const nameParts = normalized.name.split(' ');
    normalized.ad = nameParts[0] || '';
    normalized.soyad = nameParts.slice(1).join(' ') || '';
  }
  
  // Alan eşlemeleri
  if (normalized.className && !normalized.class) {
    normalized.class = normalized.className;
  }
  if (normalized.gender && !normalized.cinsiyet) {
    normalized.cinsiyet = normalized.gender;
  }
  if (normalized.email && !normalized.eposta) {
    normalized.eposta = normalized.email;
  }
  if (normalized.phone && !normalized.telefon) {
    normalized.telefon = normalized.phone;
  }
  if (normalized.address && !normalized.adres) {
    normalized.adres = normalized.address;
  }
  if (normalized.birthDate && !normalized.dogumTarihi) {
    normalized.dogumTarihi = normalized.birthDate;
  }
  if (normalized.parentContact && !normalized.veliTelefon) {
    normalized.veliTelefon = normalized.parentContact;
  }
  if (normalized.enrollmentDate && !normalized.kayitTarihi) {
    normalized.kayitTarihi = normalized.enrollmentDate;
  }
  if (normalized.notes && !normalized.notlar) {
    normalized.notlar = normalized.notes;
  }
  
  // Durum normalizasyonu
  if (normalized.status && !normalized.durum) {
    if (normalized.status === 'active') normalized.durum = 'aktif';
    else if (normalized.status === 'inactive') normalized.durum = 'pasif';
    else if (normalized.status === 'graduated') normalized.durum = 'mezun';
  }
  
  // Kayıt tarihi varsayılan
  if (!normalized.kayitTarihi) {
    normalized.kayitTarihi = new Date().toISOString().split('T')[0];
  }
  
  // Etiketler array'e çevir
  if (normalized.etiketler && typeof normalized.etiketler === 'string') {
    normalized.etiketler = normalized.etiketler.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  
  // İlgi alanları array'e çevir
  if (normalized.ilgiAlanlari && typeof normalized.ilgiAlanlari === 'string') {
    normalized.ilgiAlanlari = normalized.ilgiAlanlari.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  
  return normalized as UnifiedStudent;
}

/**
 * Validate student data
 * Öğrenci verisini doğrula
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateStudentData(student: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Zorunlu alanlar
  if (!student || typeof student !== 'object') {
    errors.push('Geçersiz öğrenci verisi');
    return { valid: false, errors, warnings };
  }
  
  if (!student.id || typeof student.id !== 'string' || student.id.trim().length === 0) {
    errors.push('Öğrenci ID zorunludur');
  }
  
  const hasAd = student.ad && typeof student.ad === 'string' && student.ad.trim().length > 0;
  const hasSoyad = student.soyad && typeof student.soyad === 'string' && student.soyad.trim().length > 0;
  const hasName = student.name && typeof student.name === 'string' && student.name.trim().length > 0;
  
  if (!hasName && !(hasAd && hasSoyad)) {
    errors.push('Öğrenci adı ve soyadı zorunludur');
  }
  
  // E-posta validasyonu
  if (student.eposta || student.email) {
    const email = student.eposta || student.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }
  }
  
  // Telefon validasyonu
  if (student.telefon || student.phone) {
    const phone = student.telefon || student.phone;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      warnings.push('Telefon numarası 10-11 haneli olmalıdır');
    }
  }
  
  // Cinsiyet validasyonu
  if (student.cinsiyet || student.gender) {
    const gender = student.cinsiyet || student.gender;
    if (gender !== 'K' && gender !== 'E') {
      errors.push('Cinsiyet K veya E olmalıdır');
    }
  }
  
  // Doğum tarihi validasyonu
  if (student.dogumTarihi || student.birthDate) {
    const birthDate = student.dogumTarihi || student.birthDate;
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      errors.push('Geçerli bir doğum tarihi giriniz');
    } else {
      const age = new Date().getFullYear() - date.getFullYear();
      if (age < 5 || age > 25) {
        warnings.push('Öğrenci yaşı 5-25 aralığında olmalıdır');
      }
    }
  }
  
  // Risk seviyesi validasyonu
  if (student.risk) {
    if (!['Düşük', 'Orta', 'Yüksek'].includes(student.risk)) {
      errors.push('Risk seviyesi Düşük, Orta veya Yüksek olmalıdır');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate profile completeness
 * Profil tamlık oranını hesapla
 */
export function calculateProfileCompleteness(student: UnifiedStudent): ProfileCompleteness {
  const scores = {
    temelBilgiler: 0,
    iletisimBilgileri: 0,
    veliBilgileri: 0
  };
  
  const eksikAlanlar: { kategori: string; alanlar: string[] }[] = [];
  
  // Temel Bilgiler (7 alan)
  const temelFields = [
    { key: 'ad', label: 'Ad' },
    { key: 'soyad', label: 'Soyad' },
    { key: 'class', label: 'Sınıf' },
    { key: 'okulNo', label: 'Okul No' },
    { key: 'cinsiyet', label: 'Cinsiyet' },
    { key: 'dogumTarihi', label: 'Doğum Tarihi' },
    { key: 'kayitTarihi', label: 'Kayıt Tarihi' }
  ];
  
  const temelEksik: string[] = [];
  let temelDolu = 0;
  
  temelFields.forEach(field => {
    if (student[field.key as keyof UnifiedStudent]) {
      temelDolu++;
    } else {
      temelEksik.push(field.label);
    }
  });
  
  scores.temelBilgiler = Math.round((temelDolu / temelFields.length) * 100);
  if (temelEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'Temel Bilgiler', alanlar: temelEksik });
  }
  
  // İletişim Bilgileri (5 alan)
  const iletisimFields = [
    { key: 'telefon', label: 'Telefon' },
    { key: 'eposta', label: 'E-posta' },
    { key: 'adres', label: 'Adres' },
    { key: 'il', label: 'İl' },
    { key: 'ilce', label: 'İlçe' }
  ];
  
  const iletisimEksik: string[] = [];
  let iletisimDolu = 0;
  
  iletisimFields.forEach(field => {
    if (student[field.key as keyof UnifiedStudent]) {
      iletisimDolu++;
    } else {
      iletisimEksik.push(field.label);
    }
  });
  
  scores.iletisimBilgileri = Math.round((iletisimDolu / iletisimFields.length) * 100);
  if (iletisimEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'İletişim Bilgileri', alanlar: iletisimEksik });
  }
  
  // Veli Bilgileri (4 alan)
  const veliFields = [
    { key: 'veliAdi', label: 'Veli Adı' },
    { key: 'veliTelefon', label: 'Veli Telefon' },
    { key: 'acilKisi', label: 'Acil Durum Kişisi' },
    { key: 'acilTelefon', label: 'Acil Durum Telefon' }
  ];
  
  const veliEksik: string[] = [];
  let veliDolu = 0;
  
  veliFields.forEach(field => {
    if (student[field.key as keyof UnifiedStudent]) {
      veliDolu++;
    } else {
      veliEksik.push(field.label);
    }
  });
  
  scores.veliBilgileri = Math.round((veliDolu / veliFields.length) * 100);
  if (veliEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'Veli Bilgileri', alanlar: veliEksik });
  }
  
  // Genel doluluk oranı
  const overall = Math.round(
    (scores.temelBilgiler + scores.iletisimBilgileri + scores.veliBilgileri) / 3
  );
  
  return {
    overall,
    temelBilgiler: scores.temelBilgiler,
    iletisimBilgileri: scores.iletisimBilgileri,
    veliBilgileri: scores.veliBilgileri,
    akademikProfil: 0, // Will be calculated from academic_profiles table
    sosyalDuygusalProfil: 0, // Will be calculated from social_emotional_profiles table
    yetenekIlgiProfil: 0, // Will be calculated from talents_interests_profiles table
    saglikProfil: 0, // Will be calculated from standardized_health_profiles table
    davranisalProfil: 0, // Will be calculated from behavior_incidents table
    eksikAlanlar
  };
}

/**
 * Sanitize student data for safe storage
 * Öğrenci verisini güvenli saklama için temizle
 */
export function sanitizeStudentData(student: any): any {
  const sanitized = { ...student };
  
  // XSS koruması - HTML etiketlerini temizle
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  // String alanları temizle
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Compare two student objects for changes
 * İki öğrenci nesnesini karşılaştır
 */
export function detectStudentChanges(
  original: UnifiedStudent,
  updated: UnifiedStudent
): { changed: boolean; changes: string[] } {
  const changes: string[] = [];
  
  const fieldsToCheck: (keyof UnifiedStudent)[] = [
    'ad', 'soyad', 'class', 'cinsiyet', 'telefon', 'eposta',
    'adres', 'veliAdi', 'veliTelefon', 'risk', 'rehberOgretmen'
  ];
  
  fieldsToCheck.forEach(field => {
    if (original[field] !== updated[field]) {
      changes.push(field);
    }
  });
  
  return {
    changed: changes.length > 0,
    changes
  };
}

export default {
  normalizeStudentData,
  validateStudentData,
  calculateProfileCompleteness,
  sanitizeStudentData,
  detectStudentChanges,
  backendToUnified,
  unifiedToBackend
};
