import { Request, Response, NextFunction } from 'express';
import { InventoryItem } from '../models/inventoryItem.model';
import { AssetAssignment, AssignmentStatus } from '../models/assetAssignment.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// ==========================
// ITEMS
// ==========================

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await InventoryItem.find().sort({ itemName: 1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const restockItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantityToAdd } = req.body;

    if (!quantityToAdd || quantityToAdd <= 0) {
      return next(new AppError('Quantity to add must be greater than zero', 400));
    }

    const item = await InventoryItem.findById(id);
    if (!item) return next(new AppError('Item not found', 404));

    item.quantity += quantityToAdd;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ==========================
// ASSIGNMENTS
// ==========================

export const assignAsset = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, assignedTo, quantityAssigned } = req.body;

    if (!quantityAssigned || quantityAssigned <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    const item = await InventoryItem.findById(itemId).session(session);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (item.quantity < quantityAssigned) {
      throw new AppError('Insufficient stock available', 400);
    }

    // Deduct stock
    item.quantity -= quantityAssigned;
    await item.save({ session });

    // Create assignment
    const assignment = await AssetAssignment.create([{
      item: itemId,
      assignedTo,
      quantityAssigned,
      status: AssignmentStatus.ASSIGNED,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({ 
      success: true, 
      message: 'Asset assigned successfully',
      data: assignment[0] 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const returnAsset = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.body;

    const assignment = await AssetAssignment.findById(assignmentId).session(session);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    if (assignment.status === AssignmentStatus.RETURNED) {
      throw new AppError('Asset is already marked as returned', 400);
    }

    // Add stock back
    const item = await InventoryItem.findById(assignment.item).session(session);
    if (!item) {
      throw new AppError('Original item not found in database', 404);
    }

    item.quantity += assignment.quantityAssigned;
    await item.save({ session });

    // Mark as returned
    assignment.status = AssignmentStatus.RETURNED;
    assignment.returnDate = new Date();
    await assignment.save({ session });

    await session.commitTransaction();

    res.status(200).json({ 
      success: true, 
      message: 'Asset returned and stock updated',
      data: assignment 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await AssetAssignment.find()
      .populate('item', 'itemName category unit')
      .populate('assignedTo', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};
