import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IStaffProfile extends Document {
  user: mongoose.Types.ObjectId | IUser;
  employeeId: string;
  department: string;
  designation: string;
  dateOfJoining: Date;
  qualifications: string[];
  salaryBasic: number;
  contactNumber: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    qualifications: {
      type: [String],
      required: true,
    },
    salaryBasic: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const StaffProfile = mongoose.model<IStaffProfile>('StaffProfile', staffProfileSchema);
