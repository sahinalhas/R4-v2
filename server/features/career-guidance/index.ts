/**
 * Career Guidance Feature Entry Point
 * Kariyer Rehberliği Özellik Giriş Noktası
 */

import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { careerGuidanceRoutes } from './routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), careerGuidanceRoutes);

export default router;
