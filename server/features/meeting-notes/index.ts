import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as meetingNotesRoutes from './routes/meeting-notes.routes.js';

const router = Router();

router.get("/meeting-notes/:studentId", simpleRateLimit(200, 15 * 60 * 1000), meetingNotesRoutes.getMeetingNotes);
router.post("/meeting-notes", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.saveMeetingNoteHandler);
router.put("/meeting-notes/:id", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.updateMeetingNoteHandler);
router.delete("/meeting-notes/:id", simpleRateLimit(50, 15 * 60 * 1000), meetingNotesRoutes.deleteMeetingNoteHandler);

export default router;
