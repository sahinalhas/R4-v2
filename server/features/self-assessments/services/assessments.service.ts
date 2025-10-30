import getDatabase from '../../../lib/database.js';
import { SelfAssessmentsRepository } from '../repository/index.js';
import { sanitizeString } from '../../../middleware/validation.js';
import { randomUUID } from 'crypto';
import type { 
  StudentSelfAssessment,
  AssessmentStatus,
  StartAssessmentRequest,
  SaveAssessmentDraftRequest,
  SubmitAssessmentRequest,
  ParentConsentRequest
} from '../../../../shared/types/self-assessment.types.js';

let assessmentsRepo: SelfAssessmentsRepository | null = null;

function getRepository(): SelfAssessmentsRepository {
  if (!assessmentsRepo) {
    const db = getDatabase();
    assessmentsRepo = new SelfAssessmentsRepository(db);
  }
  return assessmentsRepo;
}

export function startAssessment(request: StartAssessmentRequest): StudentSelfAssessment {
  const repo = getRepository();
  
  const assessment: Omit<StudentSelfAssessment, 'created_at' | 'updated_at'> = {
    id: randomUUID(),
    studentId: sanitizeString(request.studentId),
    templateId: sanitizeString(request.templateId),
    status: 'DRAFT',
    completionPercentage: 0,
    responseData: {},
    parentConsentGiven: false,
    aiProcessingStatus: 'PENDING'
  };

  return repo.create(assessment);
}

export function saveDraft(
  assessmentId: string,
  request: SaveAssessmentDraftRequest
): StudentSelfAssessment {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();

  const sanitizedData: Partial<StudentSelfAssessment> = {
    responseData: request.responseData,
    completionPercentage: request.completionPercentage,
    status: 'DRAFT'
  };

  return repo.update(sanitizedId, sanitizedData);
}

export function submitAssessment(
  assessmentId: string,
  request: SubmitAssessmentRequest,
  studentId: string
): StudentSelfAssessment {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();

  const assessment = repo.findById(sanitizedId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  if (assessment.studentId !== studentId) {
    throw new Error('Unauthorized: Assessment does not belong to this student');
  }

  const updateData: Partial<StudentSelfAssessment> = {
    responseData: request.responseData,
    completionPercentage: 100,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    parentConsentGiven: request.parentConsentGiven || false,
    aiProcessingStatus: 'PENDING'
  };

  return repo.update(sanitizedId, updateData);
}

export function getAssessmentById(assessmentId: string): StudentSelfAssessment | null {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();
  return repo.findById(sanitizedId);
}

export function getStudentAssessments(
  studentId: string,
  status?: AssessmentStatus
): StudentSelfAssessment[] {
  const sanitizedId = sanitizeString(studentId);
  const repo = getRepository();
  return repo.findByStudentId(sanitizedId, status ? { status } : undefined);
}

export function getAssessmentsByTemplate(templateId: string): StudentSelfAssessment[] {
  const sanitizedId = sanitizeString(templateId);
  const repo = getRepository();
  return repo.findByTemplateId(sanitizedId);
}

export function getPendingAIProcessing(): StudentSelfAssessment[] {
  const repo = getRepository();
  return repo.findPendingAIProcessing();
}

export function updateAIProcessingStatus(
  assessmentId: string,
  status: 'PENDING' | 'COMPLETED' | 'FAILED',
  errors?: string[]
): void {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();
  repo.updateAIProcessingStatus(sanitizedId, status, errors);
}

export function setParentConsent(
  assessmentId: string,
  request: ParentConsentRequest,
  ipAddress: string
): void {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();

  repo.setParentConsent(sanitizedId, {
    parentConsentGiven: request.consentGiven,
    parentConsentDate: new Date().toISOString(),
    parentConsentIp: ipAddress,
    parentName: sanitizeString(request.parentName)
  });
}

export function deleteAssessment(assessmentId: string): boolean {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();
  return repo.delete(sanitizedId);
}

export function approveAssessment(
  assessmentId: string,
  reviewedBy: string,
  notes?: string
): StudentSelfAssessment {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();

  const updateData: Partial<StudentSelfAssessment> = {
    status: 'APPROVED',
    reviewedBy: sanitizeString(reviewedBy),
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes ? sanitizeString(notes) : undefined
  };

  return repo.update(sanitizedId, updateData);
}

export function rejectAssessment(
  assessmentId: string,
  reviewedBy: string,
  reason: string
): StudentSelfAssessment {
  const sanitizedId = sanitizeString(assessmentId);
  const repo = getRepository();

  const updateData: Partial<StudentSelfAssessment> = {
    status: 'REJECTED',
    reviewedBy: sanitizeString(reviewedBy),
    reviewedAt: new Date().toISOString(),
    reviewNotes: sanitizeString(reason)
  };

  return repo.update(sanitizedId, updateData);
}
