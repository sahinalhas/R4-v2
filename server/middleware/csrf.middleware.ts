/**
 * CSRF Protection Middleware
 * 
 * Modern CSRF protection using csrf-csrf package with Double Submit Cookie pattern.
 * This replaces the deprecated csurf package with a more secure, Express 5 compatible solution.
 * 
 * Security Features:
 * - Double Submit Cookie pattern with secure session identifier
 * - Server-managed session IDs (not client-controlled)
 * - __Host- cookie prefix (prevents subdomain attacks)
 * - Strict SameSite policy
 * - HttpOnly and Secure flags
 * - Header-based token transmission
 */

import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const CSRF_SECRET = process.env.CSRF_SECRET || 'rehber360-csrf-secret-change-in-production';
const SESSION_COOKIE_NAME = isDevelopment ? 'csrf-session' : '__Host-csrf-session';

if (isProduction && CSRF_SECRET === 'rehber360-csrf-secret-change-in-production') {
  console.warn('⚠️  WARNING: Using default CSRF secret in production! Please set CSRF_SECRET environment variable.');
  console.warn('⚠️  Generate a secure secret with: openssl rand -base64 32');
}

/**
 * Middleware to ensure each request has a secure, server-managed session identifier
 * This prevents attackers from forging session IDs
 */
function ensureCsrfSession(req: Request, res: Response, next: NextFunction): void {
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  
  if (!sessionId || !/^[a-f0-9]{64}$/.test(sessionId)) {
    sessionId = crypto.randomBytes(32).toString('hex');
    
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  
  (req as any).csrfSessionId = sessionId;
  next();
}

let csrfInstance: ReturnType<typeof doubleCsrf> | null = null;

function initializeCsrf() {
  if (!csrfInstance) {
    csrfInstance = doubleCsrf({
      getSecret: () => CSRF_SECRET,
      
      getSessionIdentifier: (req: Request) => {
        const sessionId = (req as any).csrfSessionId as string | undefined;
        
        if (!sessionId) {
          throw new Error('CSRF session ID not found. Ensure ensureCsrfSession middleware runs before CSRF protection.');
        }
        
        return sessionId;
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
  }
  return csrfInstance;
}

function generateCsrfToken(req: Request, res: Response, options?: any) {
  return initializeCsrf().generateCsrfToken(req, res, options);
}

function doubleCsrfProtection(req: Request, res: Response, next: NextFunction) {
  return initializeCsrf().doubleCsrfProtection(req, res, next);
}

function getInvalidCsrfTokenError() {
  return initializeCsrf().invalidCsrfTokenError;
}

export { generateCsrfToken, doubleCsrfProtection, getInvalidCsrfTokenError as invalidCsrfTokenError, ensureCsrfSession };

export function getCsrfToken(req: Request, res: Response): string {
  return generateCsrfToken(req, res, { 
    overwrite: false,
    validateOnReuse: true 
  });
}
