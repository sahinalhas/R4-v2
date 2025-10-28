import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import personalizedLearningRoutes from './routes/personalized-learning.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), personalizedLearningRoutes);

export default router;
