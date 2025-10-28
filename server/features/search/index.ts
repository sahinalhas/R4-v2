import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as searchRoutes from './routes/search.routes.js';

const router = Router();

router.get('/global', simpleRateLimit(100, 15 * 60 * 1000), searchRoutes.globalSearch);

export default router;
