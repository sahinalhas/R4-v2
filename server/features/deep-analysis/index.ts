import { Router } from 'express';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as deepAnalysisRoutes from './routes/deep-analysis.routes.js';

const router = Router();

// Apply AI rate limiter to all deep analysis routes (10 req/min)
router.use(aiRateLimiter);

// Deep analysis endpoints
router.post('/:studentId', deepAnalysisRoutes.generateAnalysis);
router.post('/batch', deepAnalysisRoutes.generateBatchAnalysis);

export default router;
