import type Database from 'better-sqlite3';

export function createAuditLogsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      userId TEXT,
      targetType TEXT,
      targetId TEXT,
      changes TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(userId);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(targetType, targetId);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  `);
}
