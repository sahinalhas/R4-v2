import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as examsRoutes from './routes/exams.routes.js';

const router = Router();

router.get('/:studentId', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamResultsByStudent);
router.get('/:studentId/type/:examType', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamResultsByType);
router.get('/:studentId/latest', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getLatestExamResult);
router.get('/:studentId/progress/:examType', simpleRateLimit(200, 15 * 60 * 1000), examsRoutes.getExamProgressAnalysis);
router.post('/', simpleRateLimit(50, 15 * 60 * 1000), examsRoutes.createExamResult);
router.put('/:id', simpleRateLimit(50, 15 * 60 * 1000), examsRoutes.updateExamResult);
router.delete('/:id', simpleRateLimit(20, 15 * 60 * 1000), examsRoutes.deleteExamResult);

export default router;
