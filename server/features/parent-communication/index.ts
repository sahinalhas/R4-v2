import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import parentCommunicationRoutes from './routes/parent-communication.routes.js';

const router = Router();

router.use('/', simpleRateLimit(30, 15 * 60 * 1000), parentCommunicationRoutes);

export default router;
