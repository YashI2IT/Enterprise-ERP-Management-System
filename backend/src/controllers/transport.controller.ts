import { Request, Response, NextFunction } from 'express';
import { Vehicle } from '../models/vehicle.model';
import { Route } from '../models/route.model';
import { TransportAllocation, AllocationStatus } from '../models/transportAllocation.model';
import { AppError } from '../middlewares/error.middleware';

// ==========================
// VEHICLES
// ==========================

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

// ==========================
// ROUTES
// ==========================

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routes = await Route.find().populate('vehicle');
    res.status(200).json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

// ==========================
// ALLOCATIONS
// ==========================

export const allocateTransport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, routeId, stopId } = req.body;

    // Check if route exists
    const route = await Route.findById(routeId).populate('vehicle');
    if (!route) {
      return next(new AppError('Route not found', 404));
    }

    // Verify stop belongs to route
    const stopExists = route.stops.some(stop => stop._id?.toString() === stopId);
    if (!stopExists) {
      return next(new AppError('Stop does not exist on this route', 400));
    }

    // Check vehicle capacity
    const activeAllocations = await TransportAllocation.countDocuments({
      route: routeId,
      status: AllocationStatus.ACTIVE,
    });

    const vehicle = route.vehicle as any;
    if (activeAllocations >= vehicle.capacity) {
      return next(new AppError('Vehicle is at full capacity', 400));
    }

    // Upsert allocation (if student already has an active one, replace it or throw error)
    // Here we'll just check and throw to keep it safe.
    const existingActive = await TransportAllocation.findOne({
      student: studentId,
      status: AllocationStatus.ACTIVE,
    });

    if (existingActive) {
      return next(new AppError('Student already has an active transport allocation', 400));
    }

    const allocation = await TransportAllocation.create({
      student: studentId,
      route: routeId,
      stopId,
    });

    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

export const getAllocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routeId } = req.query;
    const filter: any = { status: AllocationStatus.ACTIVE };
    if (routeId) filter.route = routeId;

    const allocations = await TransportAllocation.find(filter)
      .populate({
        path: 'student',
        select: 'admissionNumber user',
        populate: {
          path: 'user',
          select: 'firstName lastName',
        },
      })
      .populate({
        path: 'route',
        populate: { path: 'vehicle', select: 'vehicleNumber' },
      });

    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    next(error);
  }
};
