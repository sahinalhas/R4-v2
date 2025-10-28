/**
 * AI Assistant Feature Module
 * AI Rehber Öğretmen Asistan Modülü
 */

import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import aiAssistantRoutes from './routes/ai-assistant.routes.js';
import * as meetingPrepRoutes from './routes/meeting-prep.routes.js';
import * as recommendationsRoutes from './routes/recommendations.routes.js';

const router = Router();

// Main AI assistant routes
router.use('/', aiAssistantRoutes);

// Meeting preparation routes
router.post('/meeting-prep/parent', simpleRateLimit(20, 60 * 60 * 1000), meetingPrepRoutes.generateParentMeetingPrep);
router.post('/meeting-prep/intervention', simpleRateLimit(20, 60 * 60 * 1000), meetingPrepRoutes.generateInterventionPlan);
router.post('/meeting-prep/teacher', simpleRateLimit(20, 60 * 60 * 1000), meetingPrepRoutes.generateTeacherMeetingPrep);

// Smart recommendations routes
router.get('/recommendations/priority-students', simpleRateLimit(100, 15 * 60 * 1000), recommendationsRoutes.getPriorityStudents);
router.get('/recommendations/interventions', simpleRateLimit(100, 15 * 60 * 1000), recommendationsRoutes.getInterventionRecommendations);
router.get('/recommendations/resources', simpleRateLimit(100, 15 * 60 * 1000), recommendationsRoutes.getResourceRecommendations);

export default router;
