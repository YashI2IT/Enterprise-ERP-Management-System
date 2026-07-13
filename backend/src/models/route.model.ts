import mongoose, { Document, Schema } from 'mongoose';
import { IVehicle } from './vehicle.model';

export interface IRouteStop {
  _id?: mongoose.Types.ObjectId;
  stopName: string;
  pickupTime: string;
  dropTime: string;
  monthlyFee: number;
}

export interface IRoute extends Document {
  routeName: string;
  vehicle: mongoose.Types.ObjectId | IVehicle;
  stops: IRouteStop[];
}

const routeSchema = new Schema<IRoute>(
  {
    routeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    stops: [
      {
        stopName: {
          type: String,
          required: true,
        },
        pickupTime: {
          type: String,
          required: true,
        },
        dropTime: {
          type: String,
          required: true,
        },
        monthlyFee: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Route = mongoose.model<IRoute>('Route', routeSchema);
