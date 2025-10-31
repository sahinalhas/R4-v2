
/**
 * Unified Student Data Model
 * Birleşik Öğrenci Veri Modeli - Tüm sistemde tutarlı kullanım için
 */

export interface UnifiedStudent {
  // Temel Bilgiler - Required
  id: string;
  ad: string;
  soyad: string;
  
  // Eğitim Bilgileri
  class?: string;
  okulNo?: string;
  cinsiyet?: 'K' | 'E';
  dogumTarihi?: string;
  dogumYeri?: string;
  tcKimlikNo?: string; // Gizli alan
  
  // İletişim Bilgileri
  telefon?: string;
  eposta?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  
  // Veli Bilgileri
  veliAdi?: string;
  veliTelefon?: string;
  acilKisi?: string;
  acilTelefon?: string;
  anneMeslegi?: string;
  babaMeslegi?: string;
  kardesSayisi?: number;
  
  // Sistem Bilgileri
  kayitTarihi: string; // enrollmentDate
  durum?: 'aktif' | 'pasif' | 'mezun'; // status
  avatar?: string;
  notlar?: string;
  
  // Değerlendirme Bilgileri
  risk?: 'Düşük' | 'Orta' | 'Yüksek';
  rehberOgretmen?: string;
  etiketler?: string[];
  
  // Genel Bilgiler
  ilgiAlanlari?: string[];
  saglikNotu?: string;
  kanGrubu?: string;
  
  // Ek Profil Bilgileri (2025 SIS Standartları)
  dilBecerileri?: string;
  hobilerDetayli?: string;
  okulDisiAktiviteler?: string;
  ogrenciBeklentileri?: string;
  aileBeklentileri?: string;
}

/**
 * Backend Student Model (Database)
 */
export interface BackendStudent {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birthPlace?: string;
  tcIdentityNo?: string;
  address?: string;
  il?: string;
  ilce?: string;
  class?: string;
  enrollmentDate: string;
  status?: 'active' | 'inactive' | 'graduated';
  avatar?: string;
  parentContact?: string;
  notes?: string;
  gender?: 'K' | 'E';
  risk?: 'Düşük' | 'Orta' | 'Yüksek';
  motherOccupation?: string;
  fatherOccupation?: string;
  languageSkills?: string;
  hobbiesDetailed?: string;
  extracurricularActivities?: string;
  studentExpectations?: string;
  familyExpectations?: string;
}

/**
 * Data Transformation Utilities
 * Veri Dönüştürme Araçları
 */

export function backendToUnified(backend: BackendStudent): UnifiedStudent {
  return {
    id: backend.id,
    ad: backend.name || '',
    soyad: backend.surname || '',
    class: backend.class,
    cinsiyet: backend.gender,
    telefon: backend.phone,
    eposta: backend.email,
    adres: backend.address,
    il: backend.il,
    ilce: backend.ilce,
    dogumTarihi: backend.birthDate,
    dogumYeri: backend.birthPlace,
    tcKimlikNo: backend.tcIdentityNo,
    veliTelefon: backend.parentContact,
    kayitTarihi: backend.enrollmentDate || new Date().toISOString().split('T')[0],
    durum: backend.status === 'active' ? 'aktif' : backend.status === 'inactive' ? 'pasif' : backend.status === 'graduated' ? 'mezun' : 'aktif',
    avatar: backend.avatar,
    notlar: backend.notes,
    risk: backend.risk,
    anneMeslegi: backend.motherOccupation,
    babaMeslegi: backend.fatherOccupation,
    dilBecerileri: backend.languageSkills,
    hobilerDetayli: backend.hobbiesDetailed,
    okulDisiAktiviteler: backend.extracurricularActivities,
    ogrenciBeklentileri: backend.studentExpectations,
    aileBeklentileri: backend.familyExpectations
  };
}

export function unifiedToBackend(unified: UnifiedStudent): BackendStudent {
  return {
    id: unified.id,
    name: unified.ad || '',
    surname: unified.soyad || '',
    email: unified.eposta,
    phone: unified.telefon,
    address: unified.adres,
    il: unified.il,
    ilce: unified.ilce,
    class: unified.class,
    enrollmentDate: unified.kayitTarihi || new Date().toISOString().split('T')[0],
    status: unified.durum === 'aktif' ? 'active' : unified.durum === 'pasif' ? 'inactive' : unified.durum === 'mezun' ? 'graduated' : 'active',
    parentContact: unified.veliTelefon,
    birthDate: unified.dogumTarihi,
    birthPlace: unified.dogumYeri,
    tcIdentityNo: unified.tcKimlikNo,
    avatar: unified.avatar,
    notes: unified.notlar,
    gender: unified.cinsiyet,
    risk: unified.risk,
    motherOccupation: unified.anneMeslegi,
    fatherOccupation: unified.babaMeslegi,
    languageSkills: unified.dilBecerileri,
    hobbiesDetailed: unified.hobilerDetayli,
    extracurricularActivities: unified.okulDisiAktiviteler,
    studentExpectations: unified.ogrenciBeklentileri,
    familyExpectations: unified.aileBeklentileri
  };
}

/**
 * Frontend to Backend transformation (for API calls)
 */
export function frontendToBackend(student: Record<string, unknown> & { id: string }): BackendStudent {
  const s = student as Record<string, string | undefined>;
  return {
    id: student.id,
    name: (s.ad || s.name || '') as string,
    surname: (s.soyad || s.surname || '') as string,
    email: s.eposta || s.email,
    phone: s.telefon || s.phone,
    birthDate: s.dogumTarihi || s.birthDate,
    birthPlace: s.dogumYeri || s.birthPlace,
    tcIdentityNo: s.tcKimlikNo || s.tcIdentityNo,
    address: s.adres || s.address,
    class: s.class as string,
    enrollmentDate: (s.kayitTarihi || s.enrollmentDate || new Date().toISOString().split('T')[0]) as string,
    status: (s.durum === 'aktif' ? 'active' : s.durum === 'pasif' ? 'inactive' : s.durum === 'mezun' ? 'graduated' : s.status || 'active') as 'active' | 'inactive' | 'graduated',
    avatar: s.avatar,
    parentContact: s.veliTelefon || s.parentContact,
    notes: s.notlar || s.notes,
    gender: (s.cinsiyet || s.gender || 'K') as 'K' | 'E',
    risk: (s.risk || 'Düşük') as 'Düşük' | 'Orta' | 'Yüksek',
    motherOccupation: s.anneMeslegi || s.motherOccupation,
    fatherOccupation: s.babaMeslegi || s.fatherOccupation,
    languageSkills: s.dilBecerileri || s.languageSkills,
    hobbiesDetailed: s.hobilerDetayli || s.hobbiesDetailed,
    extracurricularActivities: s.okulDisiAktiviteler || s.extracurricularActivities,
    studentExpectations: s.ogrenciBeklentileri || s.studentExpectations,
    familyExpectations: s.aileBeklentileri || s.familyExpectations
  };
}

/**
 * Student Profile Completeness Metrics
 * Öğrenci Profil Tamlık Metrikleri
 */
export interface ProfileCompleteness {
  overall: number; // 0-100
  temelBilgiler: number;
  iletisimBilgileri: number;
  veliBilgileri: number;
  akademikProfil: number;
  sosyalDuygusalProfil: number;
  yetenekIlgiProfil: number;
  saglikProfil: number;
  davranisalProfil: number;
  
  eksikAlanlar: {
    kategori: string;
    alanlar: string[];
  }[];
}

/**
 * Unified Student Scores
 * Birleşik Öğrenci Skorları
 */
export interface UnifiedStudentScores {
  studentId: string;
  lastUpdated: string;
  
  // Ana Skorlar (0-100)
  akademikSkor: number;
  sosyalDuygusalSkor: number;
  davranissalSkor: number;
  motivasyonSkor: number;
  riskSkoru: number;
  
  // Detaylı Skorlar
  akademikDetay: {
    notOrtalamasi?: number;
    devamDurumu?: number;
    odeklikSeviyesi?: number;
  };
  
  sosyalDuygusalDetay: {
    empati?: number;
    ozFarkinalik?: number;
    duyguDuzenlemesi?: number;
    iliski?: number;
  };
  
  davranissalDetay: {
    olumluDavranis?: number;
    olumsuzDavranis?: number;
    mudahaleEtkinligi?: number;
  };
}

/**
 * Validation Rules
 * Validasyon Kuralları
 */
export const STUDENT_VALIDATION_RULES = {
  required: ['id', 'ad', 'soyad'],
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10,11}$/,
  minAge: 5,
  maxAge: 25,
  tcIdentityNo: /^[1-9][0-9]{10}$/
} as const;

/**
 * Profile Quality Thresholds
 * Profil Kalitesi Eşikleri
 */
export const PROFILE_QUALITY_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
  poor: 30
} as const;
