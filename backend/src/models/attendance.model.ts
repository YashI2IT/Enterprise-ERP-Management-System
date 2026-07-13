import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  remarks?: string;
}

export interface IStudentAttendance extends Document {
  date: Date;
  grade: string;
  section: string;
  markedBy: mongoose.Types.ObjectId;
  records: IAttendanceRecord[];
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const studentAttendanceSchema = new Schema<IStudentAttendance>(
  {
    date: {
      type: Date,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Ensure only one attendance document per class per day
studentAttendanceSchema.index({ date: 1, grade: 1, section: 1 }, { unique: true });

export const StudentAttendance = mongoose.model<IStudentAttendance>('StudentAttendance', studentAttendanceSchema);
