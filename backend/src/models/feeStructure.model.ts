import mongoose, { Document, Schema } from 'mongoose';

export interface IFeeStructure extends Document {
  name: string;
  description: string;
  amount: number;
  academicYear: string;
  applicableGrades: string[];
  dueDate: Date;
  isActive: boolean;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    applicableGrades: [
      {
        type: String,
        required: true,
      },
    ],
    dueDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', feeStructureSchema);
