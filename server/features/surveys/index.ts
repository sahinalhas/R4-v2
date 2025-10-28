import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as templatesRoutes from './routes/modules/templates.routes.js';
import * as questionsRoutes from './routes/modules/questions.routes.js';
import * as distributionsRoutes from './routes/modules/distributions.routes.js';
import * as responsesRoutes from './routes/modules/responses.routes.js';
import * as analyticsRoutes from './routes/modules/analytics.routes.js';
import aiAnalysisRoutes from './routes/ai-analysis.routes.js';

const router = Router();

// ============= TEMPLATES ROUTES =============
router.get("/survey-templates", simpleRateLimit(200, 15 * 60 * 1000), templatesRoutes.getSurveyTemplates);
router.get("/survey-templates/:id", simpleRateLimit(200, 15 * 60 * 1000), templatesRoutes.getSurveyTemplateById);
router.post("/survey-templates", simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.createSurveyTemplate);
router.put("/survey-templates/:id", simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.updateSurveyTemplateHandler);
router.delete("/survey-templates/:id", simpleRateLimit(20, 15 * 60 * 1000), templatesRoutes.deleteSurveyTemplateHandler);

// ============= QUESTIONS ROUTES =============
router.get("/survey-questions/:templateId", simpleRateLimit(200, 15 * 60 * 1000), questionsRoutes.getQuestionsByTemplateId);
router.post("/survey-questions", simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.createSurveyQuestion);
router.put("/survey-questions/:id", simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.updateSurveyQuestionHandler);
router.delete("/survey-questions/:id", simpleRateLimit(30, 15 * 60 * 1000), questionsRoutes.deleteSurveyQuestionHandler);
router.delete("/survey-questions/template/:templateId", simpleRateLimit(20, 15 * 60 * 1000), questionsRoutes.deleteQuestionsByTemplateHandler);

// ============= DISTRIBUTIONS ROUTES =============
router.get("/survey-distributions", simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributions);
router.get("/survey-distributions/:id", simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionById);
router.get("/survey-distributions/link/:publicLink", simpleRateLimit(300, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionByPublicLink);
router.post("/survey-distributions", simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.createSurveyDistribution);
router.put("/survey-distributions/:id", simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.updateSurveyDistributionHandler);
router.delete("/survey-distributions/:id", simpleRateLimit(20, 15 * 60 * 1000), distributionsRoutes.deleteSurveyDistributionHandler);

// ============= RESPONSES ROUTES =============
router.get("/survey-responses", simpleRateLimit(200, 15 * 60 * 1000), responsesRoutes.getSurveyResponses);
router.post("/survey-responses", simpleRateLimit(100, 15 * 60 * 1000), responsesRoutes.createSurveyResponse);
router.put("/survey-responses/:id", simpleRateLimit(50, 15 * 60 * 1000), responsesRoutes.updateSurveyResponseHandler);
router.delete("/survey-responses/:id", simpleRateLimit(30, 15 * 60 * 1000), responsesRoutes.deleteSurveyResponseHandler);
router.post("/survey-responses/import/:distributionId", simpleRateLimit(20, 15 * 60 * 1000), responsesRoutes.uploadMiddleware, responsesRoutes.importExcelResponsesHandler);

// ============= ANALYTICS ROUTES =============
router.get("/survey-analytics/:distributionId", simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyAnalytics);
router.get("/survey-analytics/:distributionId/question/:questionId", simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyQuestionAnalytics);
router.get("/survey-statistics/:distributionId", simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getDistributionStatistics);

// ============= AI ANALYSIS ROUTES =============
router.use("/ai-analysis", simpleRateLimit(50, 15 * 60 * 1000), aiAnalysisRoutes);

export default router;
