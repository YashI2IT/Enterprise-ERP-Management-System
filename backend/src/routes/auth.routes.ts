import { Router } from 'express';
import { login, register, refreshToken, logout } from '../controllers/auth.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Only Super Admins and HR can register new users
router.post('/register', protect, restrictTo(Role.SUPER_ADMIN, Role.HR), register);

export default router;
