/**
 * AI Assistant Feature Module
 * AI Rehber Öğretmen Asistan Modülü
 */

import { Router } from 'express';
import { aiRateLimiter } from '../../middleware/rate-limit.middleware.js';
import aiAssistantRoutes from './routes/ai-assistant.routes.js';
import * as meetingPrepRoutes from './routes/meeting-prep.routes.js';
import * as recommendationsRoutes from './routes/recommendations.routes.js';

const router = Router();

// Apply AI rate limiter to all AI assistant routes (10 req/min)
router.use(aiRateLimiter);

// Main AI assistant routes
router.use('/', aiAssistantRoutes);

// Meeting preparation routes
router.post('/meeting-prep/parent', meetingPrepRoutes.generateParentMeetingPrep);
router.post('/meeting-prep/intervention', meetingPrepRoutes.generateInterventionPlan);
router.post('/meeting-prep/teacher', meetingPrepRoutes.generateTeacherMeetingPrep);

// Smart recommendations routes
router.get('/recommendations/priority-students', recommendationsRoutes.getPriorityStudents);
router.get('/recommendations/interventions', recommendationsRoutes.getInterventionRecommendations);
router.get('/recommendations/resources', recommendationsRoutes.getResourceRecommendations);

export default router;
