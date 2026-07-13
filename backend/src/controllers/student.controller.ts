import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, Role } from '../models/user.model';
import { StudentProfile } from '../models/student.model';
import { AppError } from '../middlewares/error.middleware';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      admissionNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      guardianDetails,
      currentGrade,
      section,
    } = req.body;

    // 1. Create Base User
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
          role: Role.STUDENT,
        },
      ],
      { session }
    );

    // 2. Create Student Profile
    const existingStudent = await StudentProfile.findOne({ admissionNumber }).session(session);
    if (existingStudent) {
      await session.abortTransaction();
      return next(new AppError('Admission Number already in use', 400));
    }

    const [studentProfile] = await StudentProfile.create(
      [
        {
          user: user._id,
          admissionNumber,
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          guardianDetails,
          currentGrade,
          section,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        profile: studentProfile,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pagination & Search logic can be added here
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const students = await StudentProfile.find()
      .populate('user', 'firstName lastName email isActive')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await StudentProfile.countDocuments();

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await StudentProfile.findById(req.params.id).populate('user', 'firstName lastName email isActive');
    
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await StudentProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// Instead of deleting, deactivate the linked user
export const deactivateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    const user = await User.findByIdAndUpdate(student.user, { isActive: false });
    
    if (!user) {
      return next(new AppError('Linked user not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
