import { randomUUID } from 'crypto';
import type { SelfAssessmentTemplate, SelfAssessmentQuestion } from '../../../../shared/types/self-assessment.types.js';
import { 
  STANDARD_CAREER_GOALS, 
  STANDARD_INTERESTS,
  STANDARD_HOBBIES,
  createAIStandardizeConfig,
  createDirectConfig
} from '../constants/standard-values.js';

export const careerInterestsTemplate: SelfAssessmentTemplate = {
  id: 'career-interests-2025',
  title: 'Kariyer ve İlgi Alanları Anketi',
  description: 'Gelecek hedeflerin, ilgi alanların ve hobilerinle ilgili bilgi toplamak için bu anketi doldur.',
  category: 'CAREER',
  targetGrades: ['9', '10', '11', '12'],
  isActive: true,
  requiresParentConsent: false,
  estimatedDuration: 8,
  orderIndex: 2
};

export const careerInterestsQuestions: SelfAssessmentQuestion[] = [
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Gelecekte ne olmak istiyorsun?',
    questionType: 'TEXT',
    orderIndex: 1,
    required: false,
    helpText: 'Hayalindeki meslek veya kariyer hedefin nedir? Henüz karar vermediysen, ilgini çeken alanları yazabilirsin.',
    targetProfileField: 'careerGoals',
    mappingStrategy: 'AI_STANDARDIZE',
    mappingConfig: createAIStandardizeConfig(
      'standardized_talents_interests_profile',
      'careerGoals',
      STANDARD_CAREER_GOALS,
      true
    ),
    requiresApproval: true
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'İlgi alanların neler? (Birden fazla seçebilirsin)',
    questionType: 'MULTI_SELECT',
    options: STANDARD_INTERESTS,
    orderIndex: 2,
    required: true,
    helpText: 'Hangi konulara ilgi duyuyorsun? Seni heyecanlandıran, zaman ayırmaktan keyif aldığın şeyler neler?',
    targetProfileField: 'interests',
    mappingStrategy: 'AI_STANDARDIZE',
    mappingConfig: createAIStandardizeConfig(
      'standardized_talents_interests_profile',
      'interests',
      STANDARD_INTERESTS,
      true
    ),
    requiresApproval: true
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Hobilerin neler? (Birden fazla seçebilirsin)',
    questionType: 'MULTI_SELECT',
    options: STANDARD_HOBBIES,
    orderIndex: 3,
    required: false,
    helpText: 'Boş zamanlarında ne yapmayı seversin?',
    targetProfileField: 'hobbiesDetailed',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'students',
      'hobbiesDetailed',
      'ARRAY'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Yukarıdaki listede olmayan başka bir hobiyi var mı? Varsa yaz.',
    questionType: 'TEXT',
    orderIndex: 4,
    required: false,
    targetProfileField: 'additionalHobbies',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'students',
      'additionalInfo',
      'TEXT'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Kendini farklı kılan, özel bir yeteneğin var mı? Varsa açıkla.',
    questionType: 'TEXT',
    orderIndex: 5,
    required: false,
    helpText: 'Örneğin: Çok iyi resim çizerim, enstrüman çalarım, yazılım geliştiririm, vs.',
    targetProfileField: 'talents',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_talents_interests_profile',
      'talents',
      'TEXT'
    ),
    requiresApproval: true
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Katıldığın kulüp, takım veya etkinlikler var mı?',
    questionType: 'TEXT',
    orderIndex: 6,
    required: false,
    helpText: 'Spor takımı, müzik grubu, okul kulübü gibi...',
    targetProfileField: 'extracurricular',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_talents_interests_profile',
      'extracurricular',
      'TEXT'
    ),
    requiresApproval: false
  },
  {
    id: randomUUID(),
    templateId: 'career-interests-2025',
    questionText: 'Kariyer hedefine ulaşmak için şu an ne yapıyorsun?',
    questionType: 'TEXT',
    orderIndex: 7,
    required: false,
    helpText: 'Kurs, workshop, kitap okuma, proje geliştirme gibi...',
    targetProfileField: 'careerPreparation',
    mappingStrategy: 'DIRECT',
    mappingConfig: createDirectConfig(
      'standardized_talents_interests_profile',
      'careerPreparation',
      'TEXT'
    ),
    requiresApproval: true
  }
];
