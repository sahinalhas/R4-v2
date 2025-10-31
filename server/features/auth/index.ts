import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as authRoutes from './routes/auth.routes.js';

const router = Router();

router.use(authRateLimiter);

router.get('/:userId', authRoutes.getSession);
router.post('/', authRoutes.saveSession);
router.put('/:userId/activity', authRoutes.updateSessionActivity);
router.delete('/:userId', authRoutes.deleteSession);

export default router;
