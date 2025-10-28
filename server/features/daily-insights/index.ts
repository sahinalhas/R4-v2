import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as dailyInsightsRoutes from './routes/daily-insights.routes.js';

const router = Router();

// Daily insights endpoints
router.get('/today', simpleRateLimit(100, 15 * 60 * 1000), dailyInsightsRoutes.getTodayInsights);
router.post('/generate', simpleRateLimit(10, 60 * 60 * 1000), dailyInsightsRoutes.generateInsights);
router.get('/history', simpleRateLimit(100, 15 * 60 * 1000), dailyInsightsRoutes.getInsightsHistory);
router.get('/stats', simpleRateLimit(100, 15 * 60 * 1000), dailyInsightsRoutes.getDailyStats);

// Student status
router.get('/student/:studentId', simpleRateLimit(200, 15 * 60 * 1000), dailyInsightsRoutes.getStudentStatus);

// Alerts
router.get('/alerts', simpleRateLimit(200, 15 * 60 * 1000), dailyInsightsRoutes.getAlerts);
router.put('/alerts/:id/status', simpleRateLimit(50, 15 * 60 * 1000), dailyInsightsRoutes.updateAlertStatus);
router.put('/alerts/:id/assign', simpleRateLimit(50, 15 * 60 * 1000), dailyInsightsRoutes.assignAlert);

export default router;
