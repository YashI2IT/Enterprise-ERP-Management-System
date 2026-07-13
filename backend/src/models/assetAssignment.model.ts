import mongoose, { Document, Schema } from 'mongoose';
import { IInventoryItem } from './inventoryItem.model';
import { IUser } from './user.model';

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  RETURNED = 'RETURNED',
}

export interface IAssetAssignment extends Document {
  item: mongoose.Types.ObjectId | IInventoryItem;
  assignedTo: mongoose.Types.ObjectId | IUser;
  quantityAssigned: number;
  assignedDate: Date;
  returnDate?: Date;
  status: AssignmentStatus;
}

const assetAssignmentSchema = new Schema<IAssetAssignment>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantityAssigned: {
      type: Number,
      required: true,
      min: 1,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(AssignmentStatus),
      default: AssignmentStatus.ASSIGNED,
    },
  },
  {
    timestamps: true,
  }
);

export const AssetAssignment = mongoose.model<IAssetAssignment>('AssetAssignment', assetAssignmentSchema);
