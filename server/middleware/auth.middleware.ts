/**
 * Authentication Middleware
 * Validates user session and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { getUserSession, deleteUserSession } from '../features/auth/repository/auth.repository.js';
import { safeJsonParseObject } from '../utils/json-helpers.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    institution: string;
  };
}

/**
 * Middleware to validate user session
 * Extracts userId from session cookie or header and validates it
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No user ID provided'
      });
    }

    const session = getUserSession(userId);
    
    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Session not found or expired'
      });
    }

    const userData = safeJsonParseObject(
      session.userData,
      { name: '', email: '', role: '', permissions: [], institution: '' },
      'user session'
    );
    
    if (!userData.name || !userData.email || !userData.role) {
      console.error('Corrupted session data detected, clearing session for user:', userId);
      deleteUserSession(userId);
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Session data corrupted, please log in again'
      });
    }
    
    (req as AuthenticatedRequest).user = {
      id: userId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions || [],
      institution: userData.institution
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid session data'
    });
  }
}

/**
 * Middleware to check if user has specific permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!authReq.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(allowedRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles.join(' or ')
      });
    }

    next();
  };
}
