/**
 * CSRF Protection Middleware
 * 
 * Modern CSRF protection using csrf-csrf package with Double Submit Cookie pattern.
 * This replaces the deprecated csurf package with a more secure, Express 5 compatible solution.
 * 
 * Security Features:
 * - Double Submit Cookie pattern
 * - __Host- cookie prefix (prevents subdomain attacks)
 * - Strict SameSite policy
 * - HttpOnly and Secure flags
 * - Header-based token transmission
 */

import { doubleCsrf } from 'csrf-csrf';
import { Request, Response } from 'express';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const CSRF_SECRET = process.env.CSRF_SECRET || 'rehber360-csrf-secret-change-in-production';

if (isProduction && CSRF_SECRET === 'rehber360-csrf-secret-change-in-production') {
  console.warn('⚠️  WARNING: Using default CSRF secret in production! Please set CSRF_SECRET environment variable.');
}

const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  
  getSessionIdentifier: (req: Request) => {
    const userId = req.headers['x-user-id'] as string;
    return userId || 'anonymous';
  },
  
  cookieName: isDevelopment ? 'csrf-token' : '__Host-csrf',
  
  cookieOptions: {
    sameSite: 'strict',
    secure: isProduction,
    httpOnly: true,
    path: '/',
    maxAge: 3600000,
  },
  
  getCsrfTokenFromRequest: (req: Request) => {
    const token = req.headers['x-csrf-token'] as string | undefined;
    return token || null;
  },
  
  size: 64,
  
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError };

export function getCsrfToken(req: Request, res: Response): string {
  return generateCsrfToken(req, res);
}
