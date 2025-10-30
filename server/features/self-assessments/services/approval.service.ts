import getDatabase from '../../../lib/database.js';
import { UpdateQueueRepository } from '../repository/index.js';
import { sanitizeString } from '../../../middleware/validation.js';
import * as auditService from './audit.service.js';
import type { 
  ProfileUpdateQueue,
  UpdateStatus,
  PendingUpdatesFilter,
  PendingUpdatesResponse,
  ApproveUpdateRequest,
  RejectUpdateRequest,
  BulkApprovalRequest,
  BulkApprovalResult
} from '../../../../shared/types/self-assessment.types.js';

let updateQueueRepo: UpdateQueueRepository | null = null;

function getRepository(): UpdateQueueRepository {
  if (!updateQueueRepo) {
    const db = getDatabase();
    updateQueueRepo = new UpdateQueueRepository(db);
  }
  return updateQueueRepo;
}

export function getPendingUpdates(filter?: PendingUpdatesFilter): PendingUpdatesResponse {
  const repo = getRepository();
  const db = getDatabase();

  let query = `
    SELECT 
      puq.*,
      s.firstName || ' ' || s.lastName as studentName,
      sat.title as assessmentTitle
    FROM profile_update_queue puq
    JOIN students s ON puq.studentId = s.id
    LEFT JOIN student_self_assessments ssa ON puq.assessmentId = ssa.id
    LEFT JOIN self_assessment_templates sat ON ssa.templateId = sat.id
    WHERE puq.status = 'PENDING'
  `;
  
  const params: any[] = [];

  if (filter?.studentId) {
    query += ' AND puq.studentId = ?';
    params.push(sanitizeString(filter.studentId));
  }

  if (filter?.sortBy === 'date') {
    query += ' ORDER BY puq.created_at DESC';
  } else if (filter?.sortBy === 'student') {
    query += ' ORDER BY studentName ASC';
  } else if (filter?.sortBy === 'confidence') {
    query += ' ORDER BY puq.confidence DESC';
  } else {
    query += ' ORDER BY puq.created_at DESC';
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  const groupedByStudent = new Map<string, {
    id: string;
    studentId: string;
    studentName: string;
    assessmentTitle: string;
    updates: ProfileUpdateQueue[];
    submittedAt: string;
  }>();

  rows.forEach(row => {
    const studentId = row.studentId;
    
    if (!groupedByStudent.has(studentId)) {
      groupedByStudent.set(studentId, {
        id: row.assessmentId || row.id,
        studentId: row.studentId,
        studentName: row.studentName,
        assessmentTitle: row.assessmentTitle || 'Manuel Güncelleme',
        updates: [],
        submittedAt: row.created_at
      });
    }

    const group = groupedByStudent.get(studentId)!;
    group.updates.push({
      id: row.id,
      studentId: row.studentId,
      assessmentId: row.assessmentId,
      updateType: row.updateType,
      targetTable: row.targetTable,
      targetField: row.targetField,
      currentValue: row.currentValue,
      proposedValue: row.proposedValue,
      reasoning: row.reasoning,
      confidence: row.confidence,
      dataSource: row.dataSource,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewNotes: row.reviewNotes,
      autoApplyAfter: row.autoApplyAfter,
      created_at: row.created_at
    });
  });

  return {
    pending: Array.from(groupedByStudent.values()),
    total: rows.length
  };
}

export function getSuggestionsByStudent(studentId: string): ProfileUpdateQueue[] {
  const sanitizedId = sanitizeString(studentId);
  const repo = getRepository();
  return repo.findByStudentId(sanitizedId, { status: 'PENDING' });
}

export function approveUpdate(
  request: ApproveUpdateRequest,
  reviewedBy: string
): { success: boolean; appliedCount: number; updatedFields: string[] } {
  const repo = getRepository();
  const db = getDatabase();
  const updatedFields: string[] = [];
  const errors: Array<{ updateId: string; error: string }> = [];
  let successCount = 0;

  const ALLOWED_TABLES = ['students', 'standardized_academic_profile', 'standardized_social_emotional_profile', 'standardized_talents_interests_profile'];
  
  db.transaction(() => {
    for (const updateId of request.updateIds) {
      const sanitizedId = sanitizeString(updateId);
      const update = repo.findById(sanitizedId);
      
      if (!update || update.status !== 'PENDING') {
        console.warn(`Update ${updateId} not found or not pending, skipping`);
        continue;
      }

      const targetTable = sanitizeString(update.targetTable);
      const targetField = sanitizeString(update.targetField);
      const proposedValue = update.proposedValue;
      const studentId = sanitizeString(update.studentId);

      if (!ALLOWED_TABLES.includes(targetTable)) {
        console.error(`Invalid target table: ${targetTable}`);
        errors.push({ updateId, error: 'Invalid target table' });
        continue;
      }

      try {
        let value: any = proposedValue;

        try {
          value = JSON.parse(proposedValue);
        } catch {
          value = proposedValue;
        }

        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        const updateQuery = `
          UPDATE ${targetTable}
          SET ${targetField} = ?, updated_at = CURRENT_TIMESTAMP
          WHERE ${targetTable === 'students' ? 'id' : 'studentId'} = ?
        `;

        const updateStmt = db.prepare(updateQuery);
        const result = updateStmt.run(value, studentId);

        if (result.changes > 0) {
          repo.update(sanitizedId, {
            status: 'APPROVED',
            reviewedBy: sanitizeString(reviewedBy),
            reviewedAt: new Date().toISOString(),
            reviewNotes: request.notes ? sanitizeString(request.notes) : undefined
          });

          updatedFields.push(targetField);
          successCount++;

          auditService.logAudit({
            assessmentId: update.assessmentId || 'manual-update',
            studentId: studentId,
            action: 'PROFILE_UPDATED',
            performedBy: reviewedBy,
            performedByRole: 'COUNSELOR',
            changeData: {
              updateId: sanitizedId,
              targetTable,
              targetField,
              previousValue: update.currentValue,
              newValue: proposedValue,
              reviewNotes: request.notes
            }
          });

          console.log(`✅ Update ${updateId} approved and applied successfully`);
        } else {
          console.warn(`No rows updated for ${updateId}`);
          errors.push({ updateId, error: 'No rows updated' });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to apply update ${updateId}:`, errorMsg);
        errors.push({ updateId, error: errorMsg });
      }
    }
  })();

  if (errors.length > 0) {
    console.error(`Approval completed with ${errors.length} errors:`, errors);
  }

  return {
    success: successCount > 0,
    appliedCount: successCount,
    updatedFields
  };
}

export function rejectUpdate(request: RejectUpdateRequest, reviewedBy: string): boolean {
  const sanitizedId = sanitizeString(request.updateId);
  const repo = getRepository();
  const update = repo.findById(sanitizedId);

  if (!update) {
    throw new Error('Güncelleme bulunamadı');
  }

  repo.update(sanitizedId, {
    status: 'REJECTED',
    reviewedBy: sanitizeString(reviewedBy),
    reviewedAt: new Date().toISOString(),
    reviewNotes: sanitizeString(request.reason)
  });

  auditService.logAudit({
    assessmentId: update.assessmentId || 'manual-update',
    studentId: update.studentId,
    action: 'REJECTED',
    performedBy: reviewedBy,
    performedByRole: 'COUNSELOR',
    changeData: {
      updateId: sanitizedId,
      targetTable: update.targetTable,
      targetField: update.targetField,
      rejectedValue: update.proposedValue,
      reason: request.reason
    }
  });

  console.log(`❌ Update ${sanitizedId} rejected by ${reviewedBy}`);

  return true;
}

export function bulkApproveUpdates(
  request: BulkApprovalRequest,
  reviewedBy: string
): BulkApprovalResult {
  const repo = getRepository();
  let updates = repo.findByStudentId(sanitizeString(request.studentId), {
    status: 'PENDING'
  });

  if (request.assessmentId) {
    updates = updates.filter(u => u.assessmentId === request.assessmentId);
  }

  const updateIds = updates
    .filter(u => !request.excludeIds?.includes(u.id))
    .map(u => u.id);

  const result = approveUpdate({ updateIds }, reviewedBy);

  return {
    approvedCount: result.appliedCount,
    updatedFields: result.updatedFields
  };
}

export function getUpdateById(updateId: string): ProfileUpdateQueue | null {
  const sanitizedId = sanitizeString(updateId);
  const repo = getRepository();
  return repo.findById(sanitizedId);
}
