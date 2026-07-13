import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { generateTokens, setTokenCookies, clearTokenCookies } from '../utils/jwt.util';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account is inactive. Please contact support.', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = generateTokens(user);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // In a real ERP, only Admins/HR should register other users. 
    // This is simplified for setup, but normally restricted.
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError('No refresh token provided', 401));
    }

    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    const user = await User.findById(decoded.id).select('+isActive');

    if (!user || !user.isActive) {
      return next(new AppError('Invalid refresh token or user not active', 401));
    }

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

export const logout = (req: Request, res: Response) => {
  clearTokenCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
