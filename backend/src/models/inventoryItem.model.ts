import mongoose, { Document, Schema } from 'mongoose';

export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  STATIONARY = 'STATIONARY',
  LAB_EQUIPMENT = 'LAB_EQUIPMENT',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER',
}

export interface IInventoryItem extends Document {
  itemName: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  location: string;
  minThreshold: number;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    itemName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ItemCategory),
      default: ItemCategory.OTHER,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    minThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
