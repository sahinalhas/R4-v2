import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as templatesRoutes from './routes/templates.routes.js';
import * as assessmentsRoutes from './routes/assessments.routes.js';
import * as approvalRoutes from './routes/approval.routes.js';
import * as middleware from './middleware/self-assessments.middleware.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/templates',
  simpleRateLimit(200, 15 * 60 * 1000),
  templatesRoutes.getTemplates
);

router.get(
  '/templates/:id',
  simpleRateLimit(200, 15 * 60 * 1000),
  templatesRoutes.getTemplateById
);

router.get(
  '/templates/:id/with-questions',
  simpleRateLimit(200, 15 * 60 * 1000),
  templatesRoutes.getTemplateWithQuestions
);

router.get(
  '/templates/student/:studentId/active',
  simpleRateLimit(200, 15 * 60 * 1000),
  templatesRoutes.getActiveTemplatesForStudent
);

router.post(
  '/templates',
  middleware.ensureCounselorRole,
  simpleRateLimit(30, 15 * 60 * 1000),
  templatesRoutes.createTemplate
);

router.put(
  '/templates/:id',
  middleware.ensureCounselorRole,
  simpleRateLimit(30, 15 * 60 * 1000),
  templatesRoutes.updateTemplate
);

router.delete(
  '/templates/:id',
  middleware.ensureCounselorRole,
  simpleRateLimit(20, 15 * 60 * 1000),
  templatesRoutes.deleteTemplate
);

router.post(
  '/start',
  middleware.assessmentStartLimiter,
  middleware.ensureStudentRole,
  assessmentsRoutes.startAssessment
);

router.put(
  '/:assessmentId/save',
  middleware.ensureStudentOwnership,
  middleware.ensureAssessmentInDraftStatus,
  simpleRateLimit(100, 15 * 60 * 1000),
  assessmentsRoutes.saveDraft
);

router.post(
  '/:assessmentId/submit',
  middleware.ensureStudentOwnership,
  middleware.ensureAssessmentInDraftStatus,
  middleware.assessmentSubmitLimiter,
  assessmentsRoutes.submitAssessment
);

router.get(
  '/my-assessments',
  simpleRateLimit(200, 15 * 60 * 1000),
  assessmentsRoutes.getMyAssessments
);

router.get(
  '/profile-updates/pending',
  middleware.ensureCounselorRole,
  simpleRateLimit(200, 15 * 60 * 1000),
  approvalRoutes.getPendingUpdates
);

router.get(
  '/profile-updates/student/:studentId',
  middleware.ensureCounselorRole,
  simpleRateLimit(200, 15 * 60 * 1000),
  approvalRoutes.getSuggestionsByStudent
);

router.get(
  '/profile-updates/:updateId',
  middleware.ensureCounselorRole,
  simpleRateLimit(200, 15 * 60 * 1000),
  approvalRoutes.getUpdateById
);

router.post(
  '/profile-updates/approve',
  middleware.ensureCounselorRole,
  middleware.approvalLimiter,
  approvalRoutes.approveUpdate
);

router.post(
  '/profile-updates/reject',
  middleware.ensureCounselorRole,
  middleware.approvalLimiter,
  approvalRoutes.rejectUpdate
);

router.post(
  '/profile-updates/bulk-approve',
  middleware.ensureCounselorRole,
  middleware.approvalLimiter,
  approvalRoutes.bulkApproveUpdates
);

router.get(
  '/:assessmentId',
  middleware.ensureStudentOwnership,
  simpleRateLimit(200, 15 * 60 * 1000),
  assessmentsRoutes.getAssessmentById
);

router.delete(
  '/:assessmentId',
  middleware.ensureStudentOwnership,
  simpleRateLimit(30, 15 * 60 * 1000),
  assessmentsRoutes.deleteAssessment
);

export default router;
