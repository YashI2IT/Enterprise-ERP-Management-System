import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../models/user.model';

export const generateTokens = (user: IUser) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearTokenCookies = (res: Response) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
