import mongoose, { Document, Schema } from 'mongoose';
import { IFeeInvoice } from './feeInvoice.model';
import { IUser } from './user.model';

export enum PaymentMethod {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
  TRANSFER = 'TRANSFER',
}

export interface IFeePayment extends Document {
  invoice: mongoose.Types.ObjectId | IFeeInvoice;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  collectedBy: mongoose.Types.ObjectId | IUser;
  remarks: string;
}

const feePaymentSchema = new Schema<IFeePayment>(
  {
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const FeePayment = mongoose.model<IFeePayment>('FeePayment', feePaymentSchema);
