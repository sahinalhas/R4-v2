import { Router } from 'express';
import analyticsRouter from './routes/analytics.routes.js';
import bulkAIAnalysisRoutes from './routes/bulk-ai-analysis.routes.js';
import webVitalsRouter from './routes/web-vitals.routes.js';

const router = Router();

router.use('/', analyticsRouter);
router.use('/bulk-ai', bulkAIAnalysisRoutes);
router.use('/', webVitalsRouter);

export default router;
