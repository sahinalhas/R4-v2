export type SelfAssessmentCategory = 'ACADEMIC' | 'SOCIAL_EMOTIONAL' | 'CAREER' | 'HEALTH' | 'FAMILY' | 'TALENTS';

export type QuestionType = 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'TEXT' | 'SCALE' | 'YES_NO' | 'DROPDOWN';

export type MappingStrategy = 'DIRECT' | 'AI_PARSE' | 'AI_STANDARDIZE' | 'MULTIPLE_FIELDS' | 'CALCULATED' | 'SCALE_CONVERT' | 'ARRAY_MERGE';

export type TransformationType = 'DIRECT' | 'AI_STANDARDIZE' | 'SCALE_CONVERT' | 'ARRAY_MERGE' | 'CUSTOM';

export type AssessmentStatus = 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'APPROVED' | 'REJECTED';

export type AIProcessingStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type UpdateType = 'SELF_ASSESSMENT' | 'AI_SUGGESTION' | 'MANUAL';

export type UpdateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPLIED';

export type ConflictResolution = 'NEWER_WINS' | 'MERGE' | 'MANUAL_REVIEW';

export type AuditAction = 'CREATED' | 'UPDATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PROFILE_UPDATED' | 'PARENT_CONSENT';

export type PerformedByRole = 'STUDENT' | 'PARENT' | 'COUNSELOR' | 'SYSTEM';

export interface SelfAssessmentTemplate {
  id: string;
  title: string;
  description?: string;
  category: SelfAssessmentCategory;
  targetGrades?: string[];
  isActive: boolean;
  requiresParentConsent: boolean;
  estimatedDuration?: number;
  orderIndex?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SelfAssessmentQuestion {
  id: string;
  templateId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  orderIndex: number;
  required: boolean;
  helpText?: string;
  targetProfileField?: string;
  mappingStrategy: MappingStrategy;
  mappingConfig?: MappingConfig;
  requiresApproval: boolean;
  created_at?: string;
}

export interface MappingConfig {
  strategy: MappingStrategy;
  targetTable?: string;
  targetField?: string;
  transformType?: 'TEXT' | 'ARRAY' | 'NUMBER' | 'DATE' | 'BOOLEAN';
  standardValues?: string[];
  allowCustom?: boolean;
  mappings?: Array<{
    field: string;
    extractFrom: string;
    parseWithAI?: boolean;
  }>;
  calculation?: string;
  sourceScale?: { min: number; max: number };
  targetScale?: { min: number; max: number };
  mapping?: Record<string, any>;
  mergeStrategy?: 'APPEND' | 'REPLACE' | 'UNIQUE_APPEND';
  separator?: string;
  aiPrompt?: string;
}

export interface StudentSelfAssessment {
  id: string;
  studentId: string;
  templateId: string;
  status: AssessmentStatus;
  completionPercentage: number;
  responseData: Record<string, any>;
  submittedAt?: string;
  parentConsentGiven: boolean;
  parentConsentDate?: string;
  parentConsentIp?: string;
  parentConsentToken?: string;
  parentConsentTokenExpiry?: number;
  parentName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  aiProcessingStatus: AIProcessingStatus;
  aiProcessingErrors?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProfileMappingRule {
  id: string;
  questionId: string;
  targetTable: string;
  targetField: string;
  transformationType: TransformationType;
  transformationConfig?: MappingConfig;
  validationRules?: ValidationRules;
  priority: number;
  conflictResolution: ConflictResolution;
  isActive: boolean;
  created_at?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  required?: boolean;
}

export interface ProfileUpdateQueue {
  id: string;
  studentId: string;
  assessmentId?: string;
  updateType: UpdateType;
  targetTable: string;
  targetField: string;
  currentValue?: string;
  proposedValue: string;
  reasoning?: string;
  confidence?: number;
  dataSource?: string;
  status: UpdateStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  autoApplyAfter?: string;
  created_at?: string;
}

export interface SelfAssessmentAuditLog {
  id: string;
  assessmentId: string;
  studentId: string;
  action: AuditAction;
  performedBy?: string;
  performedByRole?: PerformedByRole;
  changeData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  created_at?: string;
}

export interface AssessmentWithTemplate extends StudentSelfAssessment {
  template?: SelfAssessmentTemplate;
  questions?: SelfAssessmentQuestion[];
}

export interface TemplateWithQuestions extends SelfAssessmentTemplate {
  questions: SelfAssessmentQuestion[];
}

export interface UpdateSuggestion extends ProfileUpdateQueue {
  studentName?: string;
  fieldLabel?: string;
  assessmentTitle?: string;
}

export interface ProcessingResult {
  processedCount: number;
  suggestionsCreated: number;
  errors: string[];
}

export interface BulkApprovalRequest {
  studentId: string;
  assessmentId?: string;
  excludeIds?: string[];
}

export interface BulkApprovalResult {
  approvedCount: number;
  updatedFields: string[];
}

export interface AssessmentCompletionStats {
  templateId: string;
  templateTitle: string;
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  completionRate: number;
  averageCompletionTime?: number;
}

export interface StudentAssessmentProgress {
  studentId: string;
  totalTemplates: number;
  completedTemplates: number;
  inProgressTemplates: number;
  completionRate: number;
  lastAssessmentDate?: string;
}

export interface ParentConsentRequest {
  token: string;
  consentGiven: boolean;
  parentName: string;
}

export interface ParentConsentInfo {
  assessment: StudentSelfAssessment;
  template: SelfAssessmentTemplate;
  student: {
    id: string;
    name: string;
    class?: string;
  };
  requiresConsent: boolean;
  consentDetails: string;
}

export interface StartAssessmentRequest {
  templateId: string;
  studentId: string;
}

export interface SaveAssessmentDraftRequest {
  responseData: Record<string, any>;
  completionPercentage: number;
}

export interface SubmitAssessmentRequest {
  responseData: Record<string, any>;
  parentConsentGiven?: boolean;
}

export interface ApproveUpdateRequest {
  updateIds: string[];
  notes?: string;
}

export interface RejectUpdateRequest {
  updateId: string;
  reason: string;
}

export interface PendingUpdatesFilter {
  studentId?: string;
  category?: SelfAssessmentCategory;
  sortBy?: 'date' | 'student' | 'confidence';
}

export interface PendingUpdatesResponse {
  pending: Array<{
    id: string;
    studentName: string;
    studentId: string;
    assessmentTitle: string;
    updates: UpdateSuggestion[];
    submittedAt: string;
  }>;
  total: number;
}
