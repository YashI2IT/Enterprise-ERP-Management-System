import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  createItem,
  getItems,
  restockItem,
  assignAsset,
  returnAsset,
  getAssignments
} from '../controllers/inventory.controller';

const router = express.Router();

router.use(protect);

// Items
router.post('/items', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), createItem);
router.get('/items', getItems);
router.put('/items/:id/restock', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), restockItem);

// Assignments
router.post('/assign', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), assignAsset);
router.post('/return', restrictTo(Role.SUPER_ADMIN, Role.ADMIN), returnAsset);
router.get('/assignments', getAssignments);

export default router;
