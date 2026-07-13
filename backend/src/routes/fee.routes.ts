import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';
import {
  createFeeStructure,
  getFeeStructures,
  generateInvoices,
  getInvoices,
  recordPayment,
} from '../controllers/fee.controller';

const router = express.Router();

// All fee routes require authentication
router.use(protect);

// Fee Structures
router.post('/structures', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), createFeeStructure);
router.get('/structures', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL), getFeeStructures);

// Invoices
router.post('/invoices/generate', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), generateInvoices);
router.get('/invoices', getInvoices); // Accessible to parents/students if filtering by self, but we leave it open for now and handle logic in UI

// Payments
router.post('/payments/:invoiceId', restrictTo(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT), recordPayment);

export default router;
