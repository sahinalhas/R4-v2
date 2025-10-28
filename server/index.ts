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

  // Trust proxy - Replit uses reverse proxy
  app.set('trust proxy', 1);

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

  // Apply rate limiting to all /api routes
  app.use('/api', generalApiRateLimiter);

  // CSRF Protection - modern approach
  // 1. Safe methods (GET, HEAD, OPTIONS) don't need CSRF
  // 2. Public endpoints are exempt
  // 3. All other mutations require valid CSRF token
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // Safe HTTP methods don't need CSRF protection
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    // Public mutation endpoints that don't need CSRF
    const publicMutations = [
      '/api/users/login',
      '/api/auth/demo-user',
    ];
    
    if (publicMutations.includes(req.path)) {
      return next();
    }

    // All other mutations need CSRF protection
    ensureCsrfSession(req, res, (err) => {
      if (err) return next(err);
      doubleCsrfProtection(req, res, next);
    });
  });

  // ========================================================================
  // FEATURE REGISTRY - MODULAR ROUTES
  // ========================================================================
  // All API routes are handled through the feature registry.
  // Each feature follows: repository (data) → services (logic) → routes (handlers)
  app.use("/api", featureRegistry);

  return app;
}

// Start Express on port 3000 (Vite will proxy to this)
const PORT = 3000;
const app = createServer();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Express API server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Ready to receive proxied requests from Vite\n`);
});