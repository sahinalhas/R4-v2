import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as authRoutes from './routes/auth.routes.js';

const router = Router();

router.get('/:userId', simpleRateLimit(200, 15 * 60 * 1000), authRoutes.getSession);
router.post('/', simpleRateLimit(100, 15 * 60 * 1000), authRoutes.saveSession);
router.put('/:userId/activity', simpleRateLimit(200, 15 * 60 * 1000), authRoutes.updateSessionActivity);
router.delete('/:userId', simpleRateLimit(50, 15 * 60 * 1000), authRoutes.deleteSession);

export default router;
