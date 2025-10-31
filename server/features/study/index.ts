import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as studyRoutes from './routes/study.routes.js';

const router = Router();

router.get("/study-assignments/:studentId", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getStudyAssignments);
router.post("/study-assignments", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.saveStudyAssignmentHandler);
router.put("/study-assignments/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.updateStudyAssignmentHandler);
router.delete("/study-assignments/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.deleteStudyAssignmentHandler);

router.get("/weekly-slots", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getAllWeeklySlotsHandler);
router.get("/weekly-slots/:studentId", simpleRateLimit(200, 15 * 60 * 1000), studyRoutes.getWeeklySlots);
router.post("/weekly-slots", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.saveWeeklySlotHandler);
router.put("/weekly-slots/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.updateWeeklySlotHandler);
router.delete("/weekly-slots/:id", simpleRateLimit(50, 15 * 60 * 1000), studyRoutes.deleteWeeklySlotHandler);

export default router;
