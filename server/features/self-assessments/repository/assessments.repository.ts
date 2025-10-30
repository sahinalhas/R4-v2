import type Database from 'better-sqlite3';
import type { StudentSelfAssessment, AssessmentWithTemplate, AssessmentStatus, AIProcessingStatus } from '../../../../shared/types/self-assessment.types';

export class SelfAssessmentsRepository {
  constructor(private db: Database.Database) {}

  create(assessment: Omit<StudentSelfAssessment, 'created_at' | 'updated_at'>): StudentSelfAssessment {
    const stmt = this.db.prepare(`
      INSERT INTO student_self_assessments (
        id, studentId, templateId, status, completionPercentage, responseData,
        submittedAt, parentConsentGiven, parentConsentDate, parentConsentIp,
        reviewedBy, reviewedAt, reviewNotes, aiProcessingStatus, aiProcessingErrors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const aiProcessingStatus = assessment.aiProcessingStatus || 'PENDING';
    const aiProcessingErrors = assessment.aiProcessingErrors || [];

    stmt.run(
      assessment.id,
      assessment.studentId,
      assessment.templateId,
      assessment.status,
      assessment.completionPercentage,
      JSON.stringify(assessment.responseData),
      assessment.submittedAt || null,
      assessment.parentConsentGiven ? 1 : 0,
      assessment.parentConsentDate || null,
      assessment.parentConsentIp || null,
      assessment.reviewedBy || null,
      assessment.reviewedAt || null,
      assessment.reviewNotes || null,
      aiProcessingStatus,
      JSON.stringify(aiProcessingErrors)
    );

    return this.findById(assessment.id)!;
  }

  findById(id: string): StudentSelfAssessment | null {
    const stmt = this.db.prepare(`
      SELECT * FROM student_self_assessments WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToAssessment(row);
  }

  findByStudentId(studentId: string, params?: { status?: AssessmentStatus }): StudentSelfAssessment[] {
    let query = 'SELECT * FROM student_self_assessments WHERE studentId = ?';
    const queryParams: any[] = [studentId];

    if (params?.status) {
      query += ' AND status = ?';
      queryParams.push(params.status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return rows.map(row => this.mapRowToAssessment(row));
  }

  findByTemplateId(templateId: string): StudentSelfAssessment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_self_assessments
      WHERE templateId = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(templateId) as any[];
    return rows.map(row => this.mapRowToAssessment(row));
  }

  findByStatus(status: AssessmentStatus): StudentSelfAssessment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_self_assessments
      WHERE status = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(status) as any[];
    return rows.map(row => this.mapRowToAssessment(row));
  }

  findPendingAIProcessing(): StudentSelfAssessment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_self_assessments
      WHERE status = 'SUBMITTED' AND aiProcessingStatus = 'PENDING'
      ORDER BY created_at ASC
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => this.mapRowToAssessment(row));
  }

  update(id: string, data: Partial<StudentSelfAssessment>): StudentSelfAssessment {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.completionPercentage !== undefined) {
      updates.push('completionPercentage = ?');
      params.push(data.completionPercentage);
    }
    if (data.responseData !== undefined) {
      updates.push('responseData = ?');
      params.push(JSON.stringify(data.responseData));
    }
    if (data.submittedAt !== undefined) {
      updates.push('submittedAt = ?');
      params.push(data.submittedAt);
    }
    if (data.parentConsentGiven !== undefined) {
      updates.push('parentConsentGiven = ?');
      params.push(data.parentConsentGiven ? 1 : 0);
    }
    if (data.parentConsentDate !== undefined) {
      updates.push('parentConsentDate = ?');
      params.push(data.parentConsentDate);
    }
    if (data.parentConsentIp !== undefined) {
      updates.push('parentConsentIp = ?');
      params.push(data.parentConsentIp);
    }
    if (data.parentName !== undefined) {
      updates.push('parentName = ?');
      params.push(data.parentName);
    }
    if (data.reviewedBy !== undefined) {
      updates.push('reviewedBy = ?');
      params.push(data.reviewedBy);
    }
    if (data.reviewedAt !== undefined) {
      updates.push('reviewedAt = ?');
      params.push(data.reviewedAt);
    }
    if (data.reviewNotes !== undefined) {
      updates.push('reviewNotes = ?');
      params.push(data.reviewNotes);
    }
    if (data.aiProcessingStatus !== undefined) {
      updates.push('aiProcessingStatus = ?');
      params.push(data.aiProcessingStatus);
    }
    if (data.aiProcessingErrors !== undefined) {
      updates.push('aiProcessingErrors = ?');
      params.push(JSON.stringify(data.aiProcessingErrors));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE student_self_assessments
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.findById(id)!;
  }

  updateAIProcessingStatus(id: string, status: AIProcessingStatus, errors?: string[]): void {
    const stmt = this.db.prepare(`
      UPDATE student_self_assessments
      SET aiProcessingStatus = ?, aiProcessingErrors = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, errors ? JSON.stringify(errors) : null, id);
  }

  setParentConsent(id: string, consentData: { 
    parentConsentGiven: boolean;
    parentConsentDate: string;
    parentConsentIp: string;
    parentName: string;
  }): void {
    const stmt = this.db.prepare(`
      UPDATE student_self_assessments
      SET parentConsentGiven = ?, parentConsentDate = ?, 
          parentConsentIp = ?, parentName = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      consentData.parentConsentGiven ? 1 : 0,
      consentData.parentConsentDate,
      consentData.parentConsentIp,
      consentData.parentName,
      id
    );
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM student_self_assessments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToAssessment(row: any): StudentSelfAssessment {
    return {
      id: row.id,
      studentId: row.studentId,
      templateId: row.templateId,
      status: row.status,
      completionPercentage: row.completionPercentage,
      responseData: JSON.parse(row.responseData),
      submittedAt: row.submittedAt,
      parentConsentGiven: Boolean(row.parentConsentGiven),
      parentConsentDate: row.parentConsentDate,
      parentConsentIp: row.parentConsentIp,
      parentConsentToken: row.parentConsentToken,
      parentConsentTokenExpiry: row.parentConsentTokenExpiry,
      parentName: row.parentName,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewNotes: row.reviewNotes,
      aiProcessingStatus: row.aiProcessingStatus,
      aiProcessingErrors: row.aiProcessingErrors ? JSON.parse(row.aiProcessingErrors) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
