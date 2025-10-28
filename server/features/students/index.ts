import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as studentsRoutes from './routes/students.routes.js';
import * as unifiedProfileRoutes from './routes/unified-profile.routes.js';

const router = Router();

router.get("/", simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudents);
router.post("/", simpleRateLimit(50, 15 * 60 * 1000), studentsRoutes.saveStudentHandler);
router.post("/bulk", simpleRateLimit(10, 15 * 60 * 1000), studentsRoutes.saveStudentsHandler);
router.delete("/:id", simpleRateLimit(20, 15 * 60 * 1000), studentsRoutes.deleteStudentHandler);
router.get("/:id/academics", simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudentAcademics);
router.post("/academics", simpleRateLimit(50, 15 * 60 * 1000), studentsRoutes.addStudentAcademic);
router.get("/:id/progress", simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudentProgress);

// Unified Profile Routes - Birleşik Profil API
router.get("/:id/unified-profile", simpleRateLimit(100, 15 * 60 * 1000), unifiedProfileRoutes.getUnifiedProfile);
router.post("/:id/initialize-profiles", simpleRateLimit(20, 15 * 60 * 1000), unifiedProfileRoutes.initializeProfiles);
router.post("/:id/recalculate-scores", simpleRateLimit(50, 15 * 60 * 1000), unifiedProfileRoutes.recalculateScores);
router.get("/:id/quality-report", simpleRateLimit(100, 15 * 60 * 1000), unifiedProfileRoutes.getQualityReport);

export default router;
