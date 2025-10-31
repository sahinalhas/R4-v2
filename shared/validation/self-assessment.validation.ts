import { z } from 'zod';

export const selfAssessmentCategorySchema = z.enum([
  'ACADEMIC',
  'SOCIAL_EMOTIONAL',
  'CAREER',
  'HEALTH',
  'FAMILY',
  'TALENTS'
]);

export const questionTypeSchema = z.enum([
  'MULTIPLE_CHOICE',
  'MULTI_SELECT',
  'TEXT',
  'SCALE',
  'YES_NO',
  'DROPDOWN'
]);

export const mappingStrategySchema = z.enum([
  'DIRECT',
  'AI_PARSE',
  'AI_STANDARDIZE',
  'MULTIPLE_FIELDS',
  'CALCULATED',
  'SCALE_CONVERT',
  'ARRAY_MERGE'
]);

export const assessmentStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'PROCESSING',
  'APPROVED',
  'REJECTED'
]);

export const selfAssessmentTemplateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Başlık zorunludur').max(200, 'Başlık maksimum 200 karakter olabilir'),
  description: z.string().optional(),
  category: selfAssessmentCategorySchema,
  targetGrades: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  requiresParentConsent: z.boolean().default(false),
  estimatedDuration: z.number().min(1).max(120).optional(),
  orderIndex: z.number().optional()
});

export const mappingConfigSchema = z.object({
  strategy: mappingStrategySchema,
  targetTable: z.string().optional(),
  targetField: z.string().optional(),
  transformType: z.enum(['TEXT', 'ARRAY', 'NUMBER', 'DATE', 'BOOLEAN']).optional(),
  standardValues: z.array(z.string()).optional(),
  allowCustom: z.boolean().optional(),
  mappings: z.array(z.object({
    field: z.string(),
    extractFrom: z.string(),
    parseWithAI: z.boolean().optional()
  })).optional(),
  calculation: z.string().optional(),
  sourceScale: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  targetScale: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  mapping: z.record(z.any()).optional(),
  mergeStrategy: z.enum(['APPEND', 'REPLACE', 'UNIQUE_APPEND']).optional(),
  separator: z.string().optional(),
  aiPrompt: z.string().optional()
}).optional();

export const selfAssessmentQuestionSchema = z.object({
  id: z.string().optional(),
  templateId: z.string().min(1, 'Şablon ID gereklidir'),
  questionText: z.string().min(1, 'Soru metni zorunludur').max(500, 'Soru metni maksimum 500 karakter olabilir'),
  questionType: questionTypeSchema,
  options: z.array(z.string()).optional(),
  orderIndex: z.number().min(0),
  required: z.boolean().default(false),
  helpText: z.string().max(300).optional(),
  targetProfileField: z.string().optional(),
  mappingStrategy: mappingStrategySchema,
  mappingConfig: mappingConfigSchema,
  requiresApproval: z.boolean().default(true)
});

export const studentSelfAssessmentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Öğrenci ID gereklidir'),
  templateId: z.string().min(1, 'Şablon ID gereklidir'),
  status: assessmentStatusSchema.default('DRAFT'),
  completionPercentage: z.number().min(0).max(100).default(0),
  responseData: z.record(z.any()),
  submittedAt: z.string().optional(),
  parentConsentGiven: z.boolean().default(false),
  parentConsentDate: z.string().optional(),
  parentConsentIp: z.string().optional(),
  parentName: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNotes: z.string().max(1000).optional(),
  aiProcessingStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED']).default('PENDING').optional(),
  aiProcessingErrors: z.array(z.string()).default([]).optional()
});

export const profileMappingRuleSchema = z.object({
  id: z.string().optional(),
  questionId: z.string().min(1, 'Soru ID gereklidir'),
  targetTable: z.string().min(1, 'Hedef tablo gereklidir'),
  targetField: z.string().min(1, 'Hedef alan gereklidir'),
  transformationType: z.enum(['DIRECT', 'AI_STANDARDIZE', 'SCALE_CONVERT', 'ARRAY_MERGE', 'CUSTOM']),
  transformationConfig: mappingConfigSchema,
  validationRules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.string()).optional(),
    required: z.boolean().optional()
  }).optional(),
  priority: z.number().min(1).default(1),
  conflictResolution: z.enum(['NEWER_WINS', 'MERGE', 'MANUAL_REVIEW']).default('NEWER_WINS'),
  isActive: z.boolean().default(true)
});

export const profileUpdateQueueSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Öğrenci ID gereklidir'),
  assessmentId: z.string().optional(),
  updateType: z.enum(['SELF_ASSESSMENT', 'AI_SUGGESTION', 'MANUAL']),
  targetTable: z.string().min(1, 'Hedef tablo gereklidir'),
  targetField: z.string().min(1, 'Hedef alan gereklidir'),
  currentValue: z.string().optional(),
  proposedValue: z.string().min(1, 'Önerilen değer gereklidir'),
  reasoning: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1).optional(),
  dataSource: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'AUTO_APPLIED']).default('PENDING'),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNotes: z.string().max(1000).optional(),
  autoApplyAfter: z.string().optional()
});

export const startAssessmentSchema = z.object({
  templateId: z.string().min(1, 'Şablon ID gereklidir'),
  studentId: z.string().min(1, 'Öğrenci ID gereklidir')
});

export const saveAssessmentDraftSchema = z.object({
  responseData: z.record(z.any()),
  completionPercentage: z.number().min(0).max(100)
});

export const submitAssessmentSchema = z.object({
  responseData: z.record(z.any()),
  parentConsentGiven: z.boolean().optional()
});

export const approveUpdateSchema = z.object({
  updateIds: z.array(z.string()).min(1, 'En az bir güncelleme ID gereklidir'),
  notes: z.string().max(1000).optional()
});

export const rejectUpdateSchema = z.object({
  updateId: z.string().min(1, 'Güncelleme ID gereklidir'),
  reason: z.string().min(1, 'Red nedeni zorunludur').max(500)
});

export const bulkApprovalSchema = z.object({
  studentId: z.string().min(1, 'Öğrenci ID gereklidir'),
  assessmentId: z.string().optional(),
  excludeIds: z.array(z.string()).optional()
});

export const parentConsentSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
  consentGiven: z.boolean(),
  parentName: z.string().min(1, 'Veli adı gereklidir').max(100)
});

export const pendingUpdatesFilterSchema = z.object({
  studentId: z.string().optional(),
  category: selfAssessmentCategorySchema.optional(),
  sortBy: z.enum(['date', 'student', 'confidence']).optional()
});

export type SelfAssessmentTemplateFormValues = z.infer<typeof selfAssessmentTemplateSchema>;
export type SelfAssessmentQuestionFormValues = z.infer<typeof selfAssessmentQuestionSchema>;
export type StudentSelfAssessmentFormValues = z.infer<typeof studentSelfAssessmentSchema>;
export type ProfileMappingRuleFormValues = z.infer<typeof profileMappingRuleSchema>;
export type ProfileUpdateQueueFormValues = z.infer<typeof profileUpdateQueueSchema>;
export type StartAssessmentFormValues = z.infer<typeof startAssessmentSchema>;
export type SaveAssessmentDraftFormValues = z.infer<typeof saveAssessmentDraftSchema>;
export type SubmitAssessmentFormValues = z.infer<typeof submitAssessmentSchema>;
export type ApproveUpdateFormValues = z.infer<typeof approveUpdateSchema>;
export type RejectUpdateFormValues = z.infer<typeof rejectUpdateSchema>;
export type BulkApprovalFormValues = z.infer<typeof bulkApprovalSchema>;
export type ParentConsentFormValues = z.infer<typeof parentConsentSchema>;
export type PendingUpdatesFilterFormValues = z.infer<typeof pendingUpdatesFilterSchema>;
