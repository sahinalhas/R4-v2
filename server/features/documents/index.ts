import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as documentsRoutes from './routes/documents.routes.js';

const router = Router();

router.get("/documents/:studentId", simpleRateLimit(200, 15 * 60 * 1000), documentsRoutes.getDocuments);
router.post("/documents", simpleRateLimit(50, 15 * 60 * 1000), documentsRoutes.saveDocumentHandler);
router.delete("/documents/:id", simpleRateLimit(20, 15 * 60 * 1000), documentsRoutes.deleteDocumentHandler);

export default router;
