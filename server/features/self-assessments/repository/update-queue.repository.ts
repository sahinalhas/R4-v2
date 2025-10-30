import type Database from 'better-sqlite3';
import type { ProfileUpdateQueue, UpdateStatus, UpdateType } from '../../../../shared/types/self-assessment.types';

export class UpdateQueueRepository {
  constructor(private db: Database.Database) {}

  create(update: Omit<ProfileUpdateQueue, 'created_at'>): ProfileUpdateQueue {
    const stmt = this.db.prepare(`
      INSERT INTO profile_update_queue (
        id, studentId, assessmentId, updateType, targetTable, targetField,
        currentValue, proposedValue, reasoning, confidence, dataSource,
        status, reviewedBy, reviewedAt, reviewNotes, autoApplyAfter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      update.id,
      update.studentId,
      update.assessmentId || null,
      update.updateType,
      update.targetTable,
      update.targetField,
      update.currentValue || null,
      update.proposedValue,
      update.reasoning || null,
      update.confidence || null,
      update.dataSource || null,
      update.status,
      update.reviewedBy || null,
      update.reviewedAt || null,
      update.reviewNotes || null,
      update.autoApplyAfter || null
    );

    return this.findById(update.id)!;
  }

  findById(id: string): ProfileUpdateQueue | null {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_update_queue WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRowToUpdate(row);
  }

  findByStudentId(studentId: string, params?: { status?: UpdateStatus }): ProfileUpdateQueue[] {
    let query = 'SELECT * FROM profile_update_queue WHERE studentId = ?';
    const queryParams: any[] = [studentId];

    if (params?.status) {
      query += ' AND status = ?';
      queryParams.push(params.status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return rows.map(row => this.mapRowToUpdate(row));
  }

  findByAssessmentId(assessmentId: string): ProfileUpdateQueue[] {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_update_queue
      WHERE assessmentId = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(assessmentId) as any[];
    return rows.map(row => this.mapRowToUpdate(row));
  }

  findPending(params?: { studentId?: string }): ProfileUpdateQueue[] {
    let query = 'SELECT * FROM profile_update_queue WHERE status = ?';
    const queryParams: any[] = ['PENDING'];

    if (params?.studentId) {
      query += ' AND studentId = ?';
      queryParams.push(params.studentId);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return rows.map(row => this.mapRowToUpdate(row));
  }

  findByStatus(status: UpdateStatus): ProfileUpdateQueue[] {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_update_queue
      WHERE status = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(status) as any[];
    return rows.map(row => this.mapRowToUpdate(row));
  }

  update(id: string, data: Partial<ProfileUpdateQueue>): ProfileUpdateQueue {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
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
    if (data.proposedValue !== undefined) {
      updates.push('proposedValue = ?');
      params.push(data.proposedValue);
    }
    if (data.reasoning !== undefined) {
      updates.push('reasoning = ?');
      params.push(data.reasoning);
    }
    if (data.confidence !== undefined) {
      updates.push('confidence = ?');
      params.push(data.confidence);
    }

    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE profile_update_queue
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.findById(id)!;
  }

  approve(id: string, reviewedBy: string, notes?: string): void {
    const stmt = this.db.prepare(`
      UPDATE profile_update_queue
      SET status = 'APPROVED', reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP, reviewNotes = ?
      WHERE id = ?
    `);

    stmt.run(reviewedBy, notes || null, id);
  }

  reject(id: string, reviewedBy: string, reason: string): void {
    const stmt = this.db.prepare(`
      UPDATE profile_update_queue
      SET status = 'REJECTED', reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP, reviewNotes = ?
      WHERE id = ?
    `);

    stmt.run(reviewedBy, reason, id);
  }

  bulkApprove(ids: string[], reviewedBy: string, notes?: string): number {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      UPDATE profile_update_queue
      SET status = 'APPROVED', reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP, reviewNotes = ?
      WHERE id IN (${placeholders})
    `);

    const result = stmt.run(reviewedBy, notes || null, ...ids);
    return result.changes;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM profile_update_queue WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToUpdate(row: any): ProfileUpdateQueue {
    return {
      id: row.id,
      studentId: row.studentId,
      assessmentId: row.assessmentId,
      updateType: row.updateType as UpdateType,
      targetTable: row.targetTable,
      targetField: row.targetField,
      currentValue: row.currentValue,
      proposedValue: row.proposedValue,
      reasoning: row.reasoning,
      confidence: row.confidence,
      dataSource: row.dataSource,
      status: row.status as UpdateStatus,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewNotes: row.reviewNotes,
      autoApplyAfter: row.autoApplyAfter,
      created_at: row.created_at
    };
  }
}
