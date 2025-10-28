import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as progressRoutes from './routes/progress.routes.js';

const router = Router();

router.get("/progress", simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getAllProgressHandler);
router.get("/progress/:studentId", simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getProgress);
router.post("/progress", simpleRateLimit(50, 15 * 60 * 1000), progressRoutes.saveProgressHandler);

router.get("/academic-goals/:studentId", simpleRateLimit(200, 15 * 60 * 1000), progressRoutes.getAcademicGoals);
router.post("/academic-goals", simpleRateLimit(50, 15 * 60 * 1000), progressRoutes.saveAcademicGoalsHandler);

export default router;
