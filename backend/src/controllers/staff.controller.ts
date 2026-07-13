import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { StaffProfile } from '../models/staff.model';
import { AppError } from '../middlewares/error.middleware';

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role, // Passed in by HR (e.g., TEACHER, LIBRARIAN, etc.)
      employeeId,
      department,
      designation,
      dateOfJoining,
      qualifications,
      salaryBasic,
      contactNumber,
      address,
      emergencyContact,
    } = req.body;

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return next(new AppError('Email already in use', 400));
    }

    const [user] = await User.create(
      [
        {
          firstName,
          lastName,
          email,
          password,
          role,
        },
      ],
      { session }
    );

    const existingStaff = await StaffProfile.findOne({ employeeId }).session(session);
    if (existingStaff) {
      await session.abortTransaction();
      return next(new AppError('Employee ID already in use', 400));
    }

    const [staffProfile] = await StaffProfile.create(
      [
        {
          user: user._id,
          employeeId,
          department,
          designation,
          dateOfJoining,
          qualifications,
          salaryBasic,
          contactNumber,
          address,
          emergencyContact,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: {
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        profile: staffProfile,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getAllStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const staff = await StaffProfile.find()
      .populate('user', 'firstName lastName email role isActive')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await StaffProfile.countDocuments();

    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await StaffProfile.findById(req.params.id).populate('user', 'firstName lastName email role isActive');
    
    if (!staff) {
      return next(new AppError('Staff not found', 404));
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await StaffProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return next(new AppError('Staff not found', 404));
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};
