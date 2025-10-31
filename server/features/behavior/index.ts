import { Router } from 'express';
import behaviorRoutes from './routes/behavior.routes.js';

const router = Router();

router.use('/behavior', behaviorRoutes);

export default router;
