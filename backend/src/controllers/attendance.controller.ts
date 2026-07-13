import { Request, Response, NextFunction } from 'express';
import { StudentAttendance } from '../models/attendance.model';
import { StudentProfile } from '../models/student.model';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date, grade, section, records } = req.body;
    const markedBy = req.user._id;

    // Normalize date to remove time portion for exact matching
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Upsert attendance document for this class & date
    const attendance = await StudentAttendance.findOneAndUpdate(
      { date: attendanceDate, grade, section },
      {
        date: attendanceDate,
        grade,
        section,
        markedBy,
        records,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByClassAndDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, grade, section } = req.query;

    if (!date || !grade || !section) {
      return next(new AppError('Please provide date, grade, and section', 400));
    }

    const attendanceDate = new Date(date as string);
    attendanceDate.setHours(0, 0, 0, 0);

    let attendance = await StudentAttendance.findOne({ date: attendanceDate, grade, section } as any)
      .populate('markedBy', 'firstName lastName')
      .populate('records.student', 'admissionNumber user')
      .populate({
        path: 'records.student',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        }
      });

    // If attendance not found for the date, return the list of students for that class so UI can render the form
    if (!attendance) {
      const students = await StudentProfile.find({ currentGrade: grade, section } as any)
        .populate('user', 'firstName lastName')
        .sort({ 'user.firstName': 1 });

      const blankRecords = students.map((s) => ({
        student: s,
        status: 'PRESENT', // default
        remarks: '',
      }));

      return res.status(200).json({
        success: true,
        isNew: true,
        data: {
          date: attendanceDate,
          grade,
          section,
          records: blankRecords,
        },
      });
    }

    res.status(200).json({
      success: true,
      isNew: false,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
