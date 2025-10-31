import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import advancedAnalyticsRoutes from './routes/advanced-analytics.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), advancedAnalyticsRoutes);

export default router;
