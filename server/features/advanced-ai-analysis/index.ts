/**
 * Advanced AI Analysis Feature
 * Gelişmiş AI Analiz Özellikleri
 */

import { Router } from 'express';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as routes from './routes/advanced-ai-analysis.routes.js';

const router = Router();

// Apply AI rate limiter to all advanced AI analysis routes (10 req/min)
router.use(aiRateLimiter);

router.post('/psychological/:studentId', routes.generatePsychologicalAnalysis);

router.post('/predictive-timeline/:studentId', routes.generatePredictiveTimeline);

router.post('/daily-action-plan', routes.generateDailyActionPlan);
router.get('/action-plan/today', routes.getTodayActionPlan);

router.post('/student-timeline/:studentId', routes.generateStudentTimeline);

router.post('/comparative-class/:classId', routes.generateClassComparison);
router.post('/comparative-students', routes.generateMultiStudentComparison);

router.post('/comprehensive/:studentId', routes.generateComprehensiveAnalysis);

export default router;
