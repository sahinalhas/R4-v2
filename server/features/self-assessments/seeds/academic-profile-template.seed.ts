import { randomUUID } from 'crypto';
import type { SelfAssessmentTemplate, SelfAssessmentQuestion } from '../../../../shared/types/self-assessment.types.js';
import { 
  STANDARD_SUBJECTS, 
  STANDARD_LEARNING_STYLES,
  STANDARD_STUDY_HABITS,
  createAIStandardizeConfig,
  createScaleConvertConfig,
  createDirectConfig,
  LIKERT_SCALE_1_5
} from '../constants/standard-values.js';

export const academicProfileTemplate: SelfAssessmentTemplate = {
  id: 'academic-profile-2025',
  title: 'Akademik Profil Öz-Değerlendirmesi',
  description: 'Bu anket, akademik güçlü ve zayıf yönlerinizi, öğrenme stilinizi ve çalışma alışkanlıklarınızı belirlemenize yardımcı olacaktır.',
  category: 'ACADEMIC',
  targetGrades: ['9', '10', '11', '12'],
  isActive: true,
  requiresParentConsent: false,
  estimatedDuration: 10,
  orderIndex: 1
};

export const academicProfileQuestions: SelfAssessmentQuestion[] = [
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'En iyi olduğun dersler hangileri? (Birden fazla seçebilirsin)',
    questionType: 'MULTI_SELECT',
    options: STANDARD_SUBJECTS,
    orderIndex: 1,
    required: true,
    helpText: 'Kendini başarılı hissettiğin, not ortalamanın yüksek olduğu dersleri seç.',
    targetProfileField: 'strongSubjects',
    mappingStrategy: 'AI_STANDARDIZE',
    mappingConfig: createAIStandardizeConfig(
      'standardized_academic_profile',
      'strongSubjects',
      STANDARD_SUBJECTS,
      false
    ),
    requiresApproval: true
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Zorlandığın dersler hangileri? (Birden fazla seçebilirsin)',
    questionType: 'MULTI_SELECT',
    options: STANDARD_SUBJECTS,
    orderIndex: 2,
    required: false,
    helpText: 'Daha fazla çalışman gereken, anlamakta zorlandığın dersleri seç.',
    targetProfileField: 'weakSubjects',
    mappingStrategy: 'AI_STANDARDIZE',
    mappingConfig: createAIStandardizeConfig(
      'standardized_academic_profile',
      'weakSubjects',
      STANDARD_SUBJECTS,
      false
    ),
    requiresApproval: true
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Nasıl öğrenmeyi tercih edersin?',
    questionType: 'MULTIPLE_CHOICE',
    options: STANDARD_LEARNING_STYLES,
    orderIndex: 3,
    required: true,
    helpText: 'Yeni bir konuyu öğrenirken hangi yöntem sana daha kolay gelir?',
    targetProfileField: 'learningStyle',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_academic_profile',
      'learningStyle',
      'TEXT'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Çalışma alışkanlıkların nasıl? (Birden fazla seçebilirsin)',
    questionType: 'MULTI_SELECT',
    options: STANDARD_STUDY_HABITS,
    orderIndex: 4,
    required: false,
    helpText: 'Genellikle nasıl ders çalışırsın?',
    targetProfileField: 'studyHabits',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_academic_profile',
      'studyHabits',
      'ARRAY'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Ders çalışma becerilerini 1-10 arasında nasıl değerlendirirsin?',
    questionType: 'SCALE',
    orderIndex: 5,
    required: true,
    helpText: '1: Çok zayıf, 10: Mükemmel',
    targetProfileField: 'studySkillsLevel',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_academic_profile',
      'studySkillsLevel',
      'NUMBER'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Ödevlerini düzenli olarak yapar mısın?',
    questionType: 'MULTIPLE_CHOICE',
    options: LIKERT_SCALE_1_5,
    orderIndex: 6,
    required: true,
    targetProfileField: 'homeworkCompletion',
    mappingStrategy: 'SCALE_CONVERT',
    mappingConfig: createScaleConvertConfig(
      'standardized_academic_profile',
      'homeworkCompletion',
      { min: 1, max: 5 },
      { min: 1, max: 10 }
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'academic-profile-2025',
    questionText: 'Akademik hedeflerin neler? Örneğin hangi üniversiteye, hangi bölüme gitmek istiyorsun?',
    questionType: 'TEXT',
    orderIndex: 7,
    required: false,
    helpText: 'Açık uçlu yazabilirsin. Henüz bilmiyorsan boş bırakabilirsin.',
    targetProfileField: 'academicGoals',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_academic_profile',
      'academicGoals',
      'TEXT'
    ),
    requiresApproval: true
  }
];
