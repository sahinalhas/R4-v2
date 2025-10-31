import { Router } from 'express';
import holisticProfileRoutes from './routes/holistic-profile.routes.js';

const router = Router();

router.use('/', holisticProfileRoutes);

export default router;
