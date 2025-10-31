import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import notificationsRoutes from './routes/notifications.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), notificationsRoutes);

export default router;
