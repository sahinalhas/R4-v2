import getDatabase from '../../../lib/database.js';
import type { User } from '../types/users.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1'),
    getUserById: db.prepare('SELECT * FROM users WHERE id = ? AND isActive = 1'),
    getAllUsers: db.prepare('SELECT * FROM users WHERE isActive = 1 ORDER BY name'),
    insertUser: db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, institution, isActive)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `),
    updateUser: db.prepare(`
      UPDATE users SET name = ?, email = ?, role = ?, institution = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updateUserPassword: db.prepare(`
      UPDATE users SET passwordHash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    deactivateUser: db.prepare(`
      UPDATE users SET isActive = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    countUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE isActive = 1')
  };
  
  isInitialized = true;
}

export function getUserByEmail(email: string): User | null {
  ensureInitialized();
  const user = statements.getUserByEmail.get(email) as User | null;
  return user;
}

export function getUserById(id: string): User | null {
  ensureInitialized();
  const user = statements.getUserById.get(id) as User | null;
  return user;
}

export function getAllUsers(): User[] {
  ensureInitialized();
  const users = statements.getAllUsers.all() as User[];
  return users;
}

export function insertUser(id: string, name: string, email: string, passwordHash: string, role: string, institution: string): void {
  ensureInitialized();
  statements.insertUser.run(id, name, email, passwordHash, role, institution);
}

export function updateUser(id: string, name: string, email: string, role: string, institution: string): void {
  ensureInitialized();
  statements.updateUser.run(name, email, role, institution, id);
}

export function updateUserPassword(id: string, passwordHash: string): void {
  ensureInitialized();
  statements.updateUserPassword.run(passwordHash, id);
}

export function deactivateUser(id: string): void {
  ensureInitialized();
  statements.deactivateUser.run(id);
}

export function countUsers(): number {
  ensureInitialized();
  const result = statements.countUsers.get() as { count: number };
  return result.count;
}
