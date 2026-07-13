import { Router } from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
} from '../controllers/student.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';

const router = Router();

// Protect all routes
router.use(protect);

// Allow Teachers and Admins to view students
router.route('/')
  .get(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.HR), getAllStudents)
  .post(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.HR), createStudent);

router.route('/:id')
  .get(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.TEACHER, Role.HR), getStudentById)
  .put(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.HR), updateStudent)
  .delete(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL), deactivateStudent);

export default router;
