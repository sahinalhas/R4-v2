import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import socialNetworkRoutes from './routes/social-network.routes.js';

const router = Router();

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), socialNetworkRoutes);

export default router;
