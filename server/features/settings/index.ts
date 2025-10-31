import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as settingsRoutes from './routes/settings.routes.js';

const router = Router();

router.get("/settings", simpleRateLimit(200, 15 * 60 * 1000), settingsRoutes.getSettings);
router.post("/settings", simpleRateLimit(30, 15 * 60 * 1000), settingsRoutes.saveSettingsHandler);
router.put("/settings", simpleRateLimit(30, 15 * 60 * 1000), settingsRoutes.saveSettingsHandler);

export default router;
