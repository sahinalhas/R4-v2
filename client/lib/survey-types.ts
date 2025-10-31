// Survey System Types

export type SurveyQuestionType = 
  | 'MULTIPLE_CHOICE' 
  | 'OPEN_ENDED' 
  | 'LIKERT' 
  | 'YES_NO' 
  | 'RATING' 
  | 'DROPDOWN';

export type SurveyTemplateType = 
  | 'MEB_STANDAR' 
  | 'OZEL' 
  | 'AKADEMIK' 
  | 'SOSYAL' 
  | 'REHBERLIK';

export type DistributionType = 
  | 'MANUAL_EXCEL' 
  | 'ONLINE_LINK' 
  | 'HYBRID';

export type SubmissionType = 
  | 'ONLINE' 
  | 'EXCEL_UPLOAD' 
  | 'MANUAL_ENTRY';

export type DistributionStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'CLOSED' 
  | 'ARCHIVED';

export interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  type: SurveyTemplateType;
  mebCompliant: boolean;
  isActive: boolean;
  createdBy?: string;
  tags?: string[];
  estimatedDuration?: number; // dakika
  targetGrades?: string[]; // ['9', '10', '11', '12']
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  templateId: string;
  questionText: string;
  questionType: SurveyQuestionType;
  required: boolean;
  orderIndex: number;
  options?: string[]; // For multiple choice, dropdown etc
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
  created_at: string;
}

export interface LikertScale {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  steps?: { value: number; label: string }[];
}

export interface SurveyDistribution {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  targetClasses?: string[]; // ['9/A', '10/B']
  targetStudents?: string[]; // student IDs
  distributionType: DistributionType;
  excelTemplate?: string; // Base64 encoded Excel file
  publicLink?: string; // UUID for public access
  startDate?: string;
  endDate?: string;
  allowAnonymous: boolean;
  maxResponses?: number;
  status: DistributionStatus;
  createdBy?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentInfo {
  name?: string;
  class?: string;
  number?: string;
  studentId?: string;
}

export interface SurveyResponse {
  id: string;
  distributionId: string;
  studentId?: string;
  studentInfo?: StudentInfo;
  responseData: Record<string, any>; // questionId -> answer
  submissionType: SubmissionType;
  isComplete: boolean;
  submittedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  created_at: string;
  updated_at: string;
}

// MEB Standart Anket Şablonları
export const MEB_SURVEY_TEMPLATES = {
  OGRENCI_MEMNUNIYET: {
    title: "Öğrenci Memnuniyet Anketi",
    type: "MEB_STANDAR" as SurveyTemplateType,
    mebCompliant: true,
    description: "MEB standartlarına uygun öğrenci memnuniyet değerlendirme anketi",
    estimatedDuration: 15,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["memnuniyet", "değerlendirme", "genel"]
  },
  OGRETMEN_DEGERLENDIRME: {
    title: "Öğretmen Değerlendirme Anketi",
    type: "MEB_STANDAR" as SurveyTemplateType,
    mebCompliant: true,
    description: "Öğretmen performans değerlendirme anketi",
    estimatedDuration: 20,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["öğretmen", "performans", "değerlendirme"]
  },
  OKUL_IKLIMI: {
    title: "Okul İklimi Değerlendirme",
    type: "MEB_STANDAR" as SurveyTemplateType,
    mebCompliant: true,
    description: "Okul ortamı ve iklimi değerlendirme anketi",
    estimatedDuration: 25,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["iklim", "ortam", "sosyal"]
  },
  REHBERLIK_IHTIYAC: {
    title: "Rehberlik İhtiyaç Belirleme",
    type: "REHBERLIK" as SurveyTemplateType,
    mebCompliant: true,
    description: "Öğrenci rehberlik ihtiyaçlarını belirleme anketi",
    estimatedDuration: 10,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["rehberlik", "ihtiyaç", "destek"]
  },
  AKADEMIK_BASARI: {
    title: "Akademik Başarı Değerlendirme",
    type: "AKADEMIK" as SurveyTemplateType,
    mebCompliant: true,
    description: "Öğrenci akademik başarı ve motivasyon değerlendirme anketi",
    estimatedDuration: 20,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["akademik", "başarı", "motivasyon"]
  },
  SOSYAL_BECERI: {
    title: "Sosyal Beceri Değerlendirme",
    type: "SOSYAL" as SurveyTemplateType,
    mebCompliant: true,
    description: "Öğrenci sosyal becerileri ve iletişim değerlendirme anketi",
    estimatedDuration: 15,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["sosyal", "beceri", "iletişim"]
  },
  TEKNOLOJI_KULLANIMI: {
    title: "Teknoloji Kullanımı ve Dijital Okuryazarlık",
    type: "OZEL" as SurveyTemplateType,
    mebCompliant: true,
    description: "Öğrenci teknoloji kullanımı ve dijital beceri değerlendirme",
    estimatedDuration: 12,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["teknoloji", "dijital", "beceri"]
  },
  OKUL_GUVENLIGI: {
    title: "Okul Güvenliği ve Disiplin",
    type: "MEB_STANDAR" as SurveyTemplateType,
    mebCompliant: true,
    description: "Okul güvenlik ve disiplin iklimi değerlendirme anketi",
    estimatedDuration: 18,
    targetGrades: ["9", "10", "11", "12"],
    tags: ["güvenlik", "disiplin", "kurallar"]
  }
};

// Survey Analytics Types
export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime?: number;
  responsesByClass: Record<string, number>;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: SurveyQuestionType;
  totalResponses: number;
  skipRate: number;
  responses: {
    value: any;
    count: number;
    percentage: number;
  }[];
  averageRating?: number; // For LIKERT and RATING questions
  sentiment?: 'positive' | 'neutral' | 'negative'; // For OPEN_ENDED questions
}

export interface ExcelTemplateConfig {
  includeStudentInfo: boolean;
  includeInstructions: boolean;
  customHeaders?: string[];
  responseFormat: 'single_sheet' | 'multi_sheet';
  includeValidation: boolean;
}