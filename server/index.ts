import "dotenv/config";
import express from "express";
import cors from "cors";
import featureRegistry from "./features";
import { getCorsOptions } from "./middleware/cors-config";
import { securityHeaders } from "./middleware/security-headers";
import { sanitizeAllInputs } from "./middleware/validation";

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

  // Global input sanitization - tüm endpoint'lerde otomatik sanitizasyon
  app.use(sanitizeAllInputs);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // ========================================================================
  // FEATURE REGISTRY - MODULAR ROUTES
  // ========================================================================
  // All API routes are handled through the feature registry.
  // Each feature follows: repository (data) → services (logic) → routes (handlers)
  app.use("/api", featureRegistry);

  return app;
}
