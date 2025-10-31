/**
 * Advanced AI Analysis Feature Module
 * Gelişmiş AI Analiz Modülü
 */

import { Router } from 'express';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import * as analysisHandlers from './routes/advanced-ai-analysis.routes.js';
import streamingRouter from './routes/streaming.routes.js';

const router = Router();

// Apply AI rate limiter to ALL advanced AI analysis routes (10 req/min)
// Bu middleware tüm AI endpoint'lerini korur (streaming dahil)
router.use(aiRateLimiter);

// Standard AI analysis endpoints
router.post('/psychological/:studentId', analysisHandlers.generatePsychologicalAnalysis);
router.post('/predictive-timeline/:studentId', analysisHandlers.generatePredictiveTimeline);
router.post('/daily-action-plan', analysisHandlers.generateDailyActionPlan);
router.get('/action-plan/today', analysisHandlers.getTodayActionPlan);
router.post('/student-timeline/:studentId', analysisHandlers.generateStudentTimeline);
router.post('/comparative-class/:classId', analysisHandlers.generateClassComparison);
router.post('/comparative-students', analysisHandlers.generateMultiStudentComparison);
router.post('/comprehensive/:studentId', analysisHandlers.generateComprehensiveAnalysis);

// Progressive data loading (streaming) endpoints
// Bu endpoint'ler de aiRateLimiter koruması altında
router.use('/', streamingRouter);

export default router;
