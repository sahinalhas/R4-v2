import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import enhancedRiskRoutes from './routes/enhanced-risk.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), enhancedRiskRoutes);

export default router;
