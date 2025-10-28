/**
 * Advanced AI Analysis Feature
 * Gelişmiş AI Analiz Özellikleri
 */

import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as routes from './routes/advanced-ai-analysis.routes.js';

const router = Router();

router.post('/psychological/:studentId', simpleRateLimit(30, 15 * 60 * 1000), routes.generatePsychologicalAnalysis);

router.post('/predictive-timeline/:studentId', simpleRateLimit(30, 15 * 60 * 1000), routes.generatePredictiveTimeline);

router.post('/daily-action-plan', simpleRateLimit(50, 15 * 60 * 1000), routes.generateDailyActionPlan);
router.get('/action-plan/today', simpleRateLimit(100, 15 * 60 * 1000), routes.getTodayActionPlan);

router.post('/student-timeline/:studentId', simpleRateLimit(30, 15 * 60 * 1000), routes.generateStudentTimeline);

router.post('/comparative-class/:classId', simpleRateLimit(20, 15 * 60 * 1000), routes.generateClassComparison);
router.post('/comparative-students', simpleRateLimit(20, 15 * 60 * 1000), routes.generateMultiStudentComparison);

router.post('/comprehensive/:studentId', simpleRateLimit(10, 15 * 60 * 1000), routes.generateComprehensiveAnalysis);

export default router;
