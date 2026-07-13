import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { User, Role } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+isActive');
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or token has expired', 401));
  }
};

export const restrictTo = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
