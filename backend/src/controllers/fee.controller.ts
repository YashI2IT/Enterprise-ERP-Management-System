import { Request, Response, NextFunction } from 'express';
import { FeeStructure } from '../models/feeStructure.model';
import { FeeInvoice, FeeStatus } from '../models/feeInvoice.model';
import { FeePayment } from '../models/feePayment.model';
import { StudentProfile } from '../models/student.model';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

// 1. Create Fee Structure
export const createFeeStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feeStructure = await FeeStructure.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: feeStructure,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Fee Structures
export const getFeeStructures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feeStructures = await FeeStructure.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: feeStructures,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Generate Invoices for Students
export const generateInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { feeStructureId, grade, section } = req.body;

    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return next(new AppError('Fee structure not found', 404));
    }

    // Find students matching the criteria
    const query: any = { currentGrade: grade };
    if (section) query.section = section;
    
    const students = await StudentProfile.find(query);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for the given criteria' });
    }

    // Create invoices for students who don't already have one for this fee structure
    const invoicesToCreate = [];
    for (const student of students) {
      const existingInvoice = await FeeInvoice.findOne({ student: student._id, feeStructure: feeStructure._id });
      if (!existingInvoice) {
        invoicesToCreate.push({
          student: student._id,
          feeStructure: feeStructure._id,
          amountDue: feeStructure.amount,
          amountPaid: 0,
          status: FeeStatus.PENDING,
          dueDate: feeStructure.dueDate,
        });
      }
    }

    if (invoicesToCreate.length === 0) {
      return res.status(200).json({ success: true, message: 'All matching students already have invoices for this fee' });
    }

    const createdInvoices = await FeeInvoice.insertMany(invoicesToCreate);

    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdInvoices.length} invoices`,
      data: createdInvoices,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Invoices (with filters)
export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, status } = req.query;
    const filter: any = {};
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;

    const invoices = await FeeInvoice.find(filter)
      .populate('feeStructure', 'name academicYear dueDate amount')
      .populate({
        path: 'student',
        select: 'admissionNumber currentGrade section user',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      })
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Record a Payment
export const recordPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceId } = req.params;
    const { amount, paymentMethod, referenceNumber, remarks } = req.body;
    const collectedBy = req.user._id;

    const invoice = await FeeInvoice.findById(invoiceId).session(session);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status === FeeStatus.PAID) {
      throw new AppError('Invoice is already fully paid', 400);
    }

    if (amount <= 0 || amount > (invoice.amountDue - invoice.amountPaid)) {
      throw new AppError('Invalid payment amount. It must be greater than 0 and less than or equal to the remaining balance.', 400);
    }

    // 1. Create Payment Record
    const payment = await FeePayment.create([{
      invoice: invoice._id,
      amount,
      paymentMethod,
      referenceNumber,
      collectedBy,
      remarks,
    }], { session });

    // 2. Update Invoice
    invoice.amountPaid += amount;
    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.status = FeeStatus.PAID;
    } else {
      invoice.status = FeeStatus.PARTIAL;
    }
    await invoice.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: payment[0],
        invoice,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
