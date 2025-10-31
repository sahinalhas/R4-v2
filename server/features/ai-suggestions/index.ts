/**
 * AI Suggestions Feature
 * AI öneri sistemi - Kullanıcı onayı gerektiren AI önerileri
 */

import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import aiSuggestionsRoutes from './routes/ai-suggestions.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), aiSuggestionsRoutes);

export default router;
