import mongoose, { Document, Schema } from 'mongoose';

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface IVehicle extends Document {
  vehicleNumber: string;
  capacity: number;
  driverName: string;
  driverContact: string;
  status: VehicleStatus;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverContact: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
