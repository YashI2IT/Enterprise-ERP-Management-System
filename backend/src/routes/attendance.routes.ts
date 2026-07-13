import { Router } from 'express';
import {
  markAttendance,
  getAttendanceByClassAndDate,
} from '../controllers/attendance.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';

const router = Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.HR), getAttendanceByClassAndDate)
  .post(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.TEACHER), markAttendance);

export default router;
