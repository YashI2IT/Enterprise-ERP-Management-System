import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId | IUser;
  admissionNumber: string;
  enrollmentDate: Date;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  address: string;
  guardianDetails: {
    name: string;
    relation: string;
    phone: string;
    email?: string;
  };
  currentGrade: string;
  section: string;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    guardianDetails: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    currentGrade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
