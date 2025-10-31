import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import interventionTrackingRoutes from './routes/intervention-tracking.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), interventionTrackingRoutes);

export default router;
