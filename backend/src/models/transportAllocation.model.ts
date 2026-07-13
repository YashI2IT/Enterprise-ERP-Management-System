import mongoose, { Document, Schema } from 'mongoose';
import { IStudentProfile } from './student.model';
import { IRoute } from './route.model';

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}

export interface ITransportAllocation extends Document {
  student: mongoose.Types.ObjectId | IStudentProfile;
  route: mongoose.Types.ObjectId | IRoute;
  stopId: mongoose.Types.ObjectId;
  status: AllocationStatus;
}

const transportAllocationSchema = new Schema<ITransportAllocation>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    stopId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AllocationStatus),
      default: AllocationStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// A student can only have one active allocation
transportAllocationSchema.index({ student: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'ACTIVE' } });

export const TransportAllocation = mongoose.model<ITransportAllocation>('TransportAllocation', transportAllocationSchema);
