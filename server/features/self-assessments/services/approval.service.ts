import getDatabase from '../../../lib/database.js';
import { UpdateQueueRepository } from '../repository/index.js';
import { sanitizeString } from '../../../middleware/validation.js';
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

  db.transaction(() => {
    for (const updateId of request.updateIds) {
      const sanitizedId = sanitizeString(updateId);
      const update = repo.findById(sanitizedId);
      
      if (!update || update.status !== 'PENDING') {
        continue;
      }

      const targetTable = update.targetTable;
      const targetField = update.targetField;
      const proposedValue = update.proposedValue;
      const studentId = update.studentId;

      try {
        let updateQuery: string;
        let value: any = proposedValue;

        try {
          value = JSON.parse(proposedValue);
        } catch {
          value = proposedValue;
        }

        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        updateQuery = `
          UPDATE ${targetTable}
          SET ${targetField} = ?, updated_at = CURRENT_TIMESTAMP
          WHERE ${targetTable === 'students' ? 'id' : 'studentId'} = ?
        `;

        const updateStmt = db.prepare(updateQuery);
        updateStmt.run(value, studentId);

        repo.update(sanitizedId, {
          status: 'APPROVED',
          reviewedBy: sanitizeString(reviewedBy),
          reviewedAt: new Date().toISOString(),
          reviewNotes: request.notes ? sanitizeString(request.notes) : undefined
        });

        updatedFields.push(targetField);
      } catch (error) {
        console.error(`Failed to apply update ${updateId}:`, error);
      }
    }
  })();

  return {
    success: true,
    appliedCount: request.updateIds.length,
    updatedFields
  };
}

export function rejectUpdate(request: RejectUpdateRequest, reviewedBy: string): boolean {
  const sanitizedId = sanitizeString(request.updateId);
  const repo = getRepository();

  repo.update(sanitizedId, {
    status: 'REJECTED',
    reviewedBy: sanitizeString(reviewedBy),
    reviewedAt: new Date().toISOString(),
    reviewNotes: sanitizeString(request.reason)
  });

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
