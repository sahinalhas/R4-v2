/**
 * Advanced Reports Feature
 * Gelişmiş Raporlama Modülü
 */

import { Router } from 'express';
import advancedReportsRouter from './routes/advanced-reports.routes.js';

const router = Router();

router.use('/', advancedReportsRouter);

export default router;
