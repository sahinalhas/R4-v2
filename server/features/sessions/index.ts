import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as sessionsRoutes from './routes/sessions.routes.js';

const router = Router();

router.get('/:studentId', simpleRateLimit(200, 15 * 60 * 1000), sessionsRoutes.getStudySessions);
router.post('/', simpleRateLimit(50, 15 * 60 * 1000), sessionsRoutes.saveStudySession);

export default router;
