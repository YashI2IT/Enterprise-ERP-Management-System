import { Router } from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
} from '../controllers/staff.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';

const router = Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.HR), getAllStaff)
  .post(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.HR), createStaff);

router.route('/:id')
  .get(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.PRINCIPAL, Role.HR), getStaffById)
  .put(restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.HR), updateStaff);

export default router;
