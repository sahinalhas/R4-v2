import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as subjectsRoutes from './routes/subjects.routes.js';

const router = Router();

router.get("/subjects", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getSubjects);
router.post("/subjects", simpleRateLimit(50, 15 * 60 * 1000), subjectsRoutes.saveSubjectsHandler);
router.get("/topics", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getTopics);
router.get("/subjects/:id/topics", simpleRateLimit(200, 15 * 60 * 1000), subjectsRoutes.getTopicsBySubjectId);
router.post("/topics", simpleRateLimit(50, 15 * 60 * 1000), subjectsRoutes.saveTopicsHandler);

export default router;
