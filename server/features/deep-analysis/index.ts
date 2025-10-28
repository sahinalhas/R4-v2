import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as deepAnalysisRoutes from './routes/deep-analysis.routes.js';

const router = Router();

// Deep analysis endpoints
router.post('/:studentId', simpleRateLimit(20, 60 * 60 * 1000), deepAnalysisRoutes.generateAnalysis);
router.post('/batch', simpleRateLimit(5, 60 * 60 * 1000), deepAnalysisRoutes.generateBatchAnalysis);

export default router;
