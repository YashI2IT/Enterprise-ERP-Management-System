import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  createVehicle,
  getVehicles,
  createRoute,
  getRoutes,
  allocateTransport,
  getAllocations
} from '../controllers/transport.controller';

const router = express.Router();

router.use(protect);

// Vehicles
router.post('/vehicles', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), createVehicle);
router.get('/vehicles', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), getVehicles);

// Routes
router.post('/routes', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), createRoute);
router.get('/routes', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), getRoutes);

// Allocations
router.post('/allocations', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), allocateTransport);
router.get('/allocations', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), getAllocations);

export default router;
