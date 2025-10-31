import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as attendanceRoutes from './routes/attendance.routes.js';

const router = Router();

router.get("/attendance", simpleRateLimit(200, 15 * 60 * 1000), attendanceRoutes.getAllAttendance);
router.get("/attendance/:studentId", simpleRateLimit(200, 15 * 60 * 1000), attendanceRoutes.getAttendanceByStudent);
router.post("/attendance", simpleRateLimit(50, 15 * 60 * 1000), attendanceRoutes.saveAttendance);

export default router;
