import * as repository from '../repository/auth.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { UserSessionResponse, SaveSessionRequest } from '../types/index.js';

export function getSession(userId: string): UserSessionResponse | null {
  const sanitizedUserId = sanitizeString(userId);
  const session = repository.getUserSession(sanitizedUserId);
  
  if (!session) return null;
  
  return {
    userData: JSON.parse(session.userData),
    demoNoticeSeen: Boolean(session.demoNoticeSeen)
  };
}

export function saveSession(data: SaveSessionRequest): { success: boolean } {
  const sanitizedUserId = sanitizeString(data.userId);
  const userDataString = JSON.stringify(data.userData);
  
  repository.upsertUserSession(
    sanitizedUserId,
    userDataString,
    Boolean(data.demoNoticeSeen)
  );
  
  return { success: true };
}

export function updateSessionActivity(userId: string): { success: boolean } {
  const sanitizedUserId = sanitizeString(userId);
  repository.updateUserSessionActivity(sanitizedUserId);
  return { success: true };
}

export function deleteSession(userId: string): { success: boolean } {
  const sanitizedUserId = sanitizeString(userId);
  repository.deleteUserSession(sanitizedUserId);
  return { success: true };
}
