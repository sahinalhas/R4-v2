import { Router } from 'express';
import analyticsRouter from './routes/analytics.routes.js';
import bulkAIAnalysisRoutes from './routes/bulk-ai-analysis.routes.js';

const router = Router();

router.use('/', analyticsRouter);
router.use('/bulk-ai', bulkAIAnalysisRoutes);

export default router;
