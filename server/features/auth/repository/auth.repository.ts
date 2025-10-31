import type Database from 'better-sqlite3';
import getDatabase from '../../../lib/database.js';
import type { UserSession } from '../types/auth.types.js';

interface AuthStatements {
  getUserSession: Database.Statement;
  upsertUserSession: Database.Statement;
  updateUserSessionActivity: Database.Statement;
  deleteUserSession: Database.Statement;
}

let statements: AuthStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getUserSession: db.prepare('SELECT * FROM user_sessions WHERE userId = ?'),
    upsertUserSession: db.prepare(`
      INSERT INTO user_sessions (userId, userData, demoNoticeSeen, lastActive)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(userId) DO UPDATE SET
        userData = excluded.userData,
        demoNoticeSeen = excluded.demoNoticeSeen,
        lastActive = CURRENT_TIMESTAMP
    `),
    updateUserSessionActivity: db.prepare(`
      UPDATE user_sessions SET lastActive = CURRENT_TIMESTAMP
      WHERE userId = ?
    `),
    deleteUserSession: db.prepare('DELETE FROM user_sessions WHERE userId = ?')
  };
  
  isInitialized = true;
}

export function getUserSession(userId: string): UserSession | null {
  ensureInitialized();
  if (!statements) throw new Error('Statements not initialized');
  const session = statements.getUserSession.get(userId) as UserSession | null;
  return session;
}

export function upsertUserSession(userId: string, userData: string, demoNoticeSeen: boolean): void {
  ensureInitialized();
  if (!statements) throw new Error('Statements not initialized');
  statements.upsertUserSession.run(userId, userData, demoNoticeSeen ? 1 : 0);
}

export function updateUserSessionActivity(userId: string): void {
  ensureInitialized();
  if (!statements) throw new Error('Statements not initialized');
  statements.updateUserSessionActivity.run(userId);
}

export function deleteUserSession(userId: string): void {
  ensureInitialized();
  if (!statements) throw new Error('Statements not initialized');
  statements.deleteUserSession.run(userId);
}
