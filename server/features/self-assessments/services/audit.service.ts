import getDatabase from '../../../lib/database.js';
import { randomUUID } from 'crypto';
import type {
  SelfAssessmentAuditLog,
  AuditAction,
  PerformedByRole
} from '../../../../shared/types/self-assessment.types.js';

export interface AuditLogData {
  assessmentId: string;
  studentId: string;
  action: AuditAction;
  performedBy?: string;
  performedByRole?: PerformedByRole;
  changeData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const db = getDatabase();
    
    const auditLog: Omit<SelfAssessmentAuditLog, 'created_at'> = {
      id: randomUUID(),
      assessmentId: data.assessmentId,
      studentId: data.studentId,
      action: data.action,
      performedBy: data.performedBy,
      performedByRole: data.performedByRole,
      changeData: data.changeData,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };

    const stmt = db.prepare(`
      INSERT INTO self_assessment_audit_log (
        id, assessmentId, studentId, action, 
        performedBy, performedByRole, changeData, 
        ipAddress, userAgent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      auditLog.id,
      auditLog.assessmentId,
      auditLog.studentId,
      auditLog.action,
      auditLog.performedBy || null,
      auditLog.performedByRole || null,
      auditLog.changeData ? JSON.stringify(auditLog.changeData) : null,
      auditLog.ipAddress || null,
      auditLog.userAgent || null
    );

    console.log(`📝 Audit log created: ${data.action} for assessment ${data.assessmentId}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

export function getAuditLogsByAssessment(assessmentId: string): SelfAssessmentAuditLog[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM self_assessment_audit_log
    WHERE assessmentId = ?
    ORDER BY created_at DESC
  `);

  const logs = stmt.all(assessmentId) as any[];
  
  return logs.map(log => ({
    ...log,
    changeData: log.changeData ? JSON.parse(log.changeData) : undefined
  }));
}

export function getAuditLogsByStudent(studentId: string): SelfAssessmentAuditLog[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM self_assessment_audit_log
    WHERE studentId = ?
    ORDER BY created_at DESC
  `);

  const logs = stmt.all(studentId) as any[];
  
  return logs.map(log => ({
    ...log,
    changeData: log.changeData ? JSON.parse(log.changeData) : undefined
  }));
}

export function getRecentAuditLogs(limit: number = 100): SelfAssessmentAuditLog[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM self_assessment_audit_log
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const logs = stmt.all(limit) as any[];
  
  return logs.map(log => ({
    ...log,
    changeData: log.changeData ? JSON.parse(log.changeData) : undefined
  }));
}
