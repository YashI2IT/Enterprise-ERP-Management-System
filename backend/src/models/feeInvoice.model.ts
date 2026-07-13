import mongoose, { Document, Schema } from 'mongoose';
import { IStudentProfile } from './student.model';
import { IFeeStructure } from './feeStructure.model';

export enum FeeStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface IFeeInvoice extends Document {
  student: mongoose.Types.ObjectId | IStudentProfile;
  feeStructure: mongoose.Types.ObjectId | IFeeStructure;
  amountDue: number;
  amountPaid: number;
  status: FeeStatus;
  dueDate: Date;
}

const feeInvoiceSchema = new Schema<IFeeInvoice>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    feeStructure: {
      type: Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(FeeStatus),
      default: FeeStatus.PENDING,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FeeInvoice = mongoose.model<IFeeInvoice>('FeeInvoice', feeInvoiceSchema);
