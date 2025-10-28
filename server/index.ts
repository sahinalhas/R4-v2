
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import featureRegistry from "./features";
import { getCorsOptions } from "./middleware/cors-config";
import { securityHeaders } from "./middleware/security-headers";
import { sanitizeAllInputs } from "./middleware/validation";
import { ensureCsrfSession, doubleCsrfProtection, getCsrfToken } from "./middleware/csrf.middleware";
import { generalApiRateLimiter } from "./middleware/rate-limit.middleware";

/**
 * BACKEND MODULARIZATION - COMPLETE ✅
 * 
 * Migration Status: Stage 4 - Cleanup Complete
 * 
 * All features have been successfully migrated to a feature-based modular architecture.
 * See server/features/README.md for full documentation.
 * 
 * Migration Stages (5 Stages Total - ALL COMPLETE):
 * - Stage 0: ✅ Scaffolding complete
 * - Stage 1: ✅ Core domains - students, surveys, progress
 * - Stage 2: ✅ Adjacent domains - subjects, settings, attendance, study, meeting-notes, documents
 * - Stage 3: ✅ Peripheral features - coaching, exams, sessions, health, special-education, 
 *              risk-assessment, behavior, counseling-sessions, auth
 * - Stage 4: ✅ Cleanup - removed legacy imports and old route files
 * 
 * Architecture:
 * All API routes are now handled through the feature registry.
 * Each feature follows the modular structure: repository → services → routes
 */

export function createServer() {
  const app = express();

  app.use(securityHeaders);
  app.use(cors(getCorsOptions()));

  // Request size limits
  app.use(express.json({ 
    limit: '10mb'
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000 // Limit number of parameters
  }));

  // Cookie parser - required for CSRF protection
  app.use(cookieParser());

  // Global input sanitization - tüm endpoint'lerde otomatik sanitizasyon
  app.use(sanitizeAllInputs);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // CSRF Token endpoint - frontend will call this to get CSRF token
  app.get("/api/csrf-token", ensureCsrfSession, (req, res) => {
    try {
      const token = getCsrfToken(req, res);
      res.json({ csrfToken: token });
    } catch (error) {
      console.error('CSRF token generation failed:', error);
      res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
  });

  // CSRF Protection middleware - SADECE /api/* route'lara uygula
  const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Public endpoints that don't need CSRF protection
    const publicEndpoints = [
      '/api/users/login',
      '/api/auth/demo-user',
      '/api/csrf-token',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(path => req.path === path);
    const isSafeMethod = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
    
    // Skip CSRF for public endpoints or safe methods
    if (isPublicEndpoint || isSafeMethod) {
      return next();
    }
    
    // Apply CSRF protection
    doubleCsrfProtection(req, res, next);
  };

  // Apply CSRF and rate limiting ONLY to /api routes
  app.use('/api', ensureCsrfSession);
  app.use('/api', generalApiRateLimiter);
  app.use('/api', csrfProtectionMiddleware);

  // ========================================================================
  // FEATURE REGISTRY - MODULAR ROUTES
  // ========================================================================
  // All API routes are handled through the feature registry.
  // Each feature follows: repository (data) → services (logic) → routes (handlers)
  app.use("/api", featureRegistry);

  return app;
}
