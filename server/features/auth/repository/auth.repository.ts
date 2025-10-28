import getDatabase from '../../../lib/database.js';
import type { UserSession } from '../types/index.js';

let statements: any = null;
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
  const session = statements.getUserSession.get(userId) as UserSession | null;
  return session;
}

export function upsertUserSession(userId: string, userData: string, demoNoticeSeen: boolean): void {
  ensureInitialized();
  statements.upsertUserSession.run(userId, userData, demoNoticeSeen ? 1 : 0);
}

export function updateUserSessionActivity(userId: string): void {
  ensureInitialized();
  statements.updateUserSessionActivity.run(userId);
}

export function deleteUserSession(userId: string): void {
  ensureInitialized();
  statements.deleteUserSession.run(userId);
}
