import User from '../models/Users';
import jwt from 'jsonwebtoken';
import UnauthenticatedError from '../errors/unauthenticated';
import { Request, Response, NextFunction } from 'express';

// Extend the Request type to include `user` (employee/staff)
interface AuthenticatedEmployeeRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

/**
 * Employee/Staff authentication middleware.
 * Supports dual-mode token extraction:
 *   1. Authorization: Bearer <token>  (header — preferred)
 *   2. req.cookies.accessToken        (HTTP-only cookie — fallback)
 */
const authEmployee = async (req: AuthenticatedEmployeeRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // 1. Try Bearer header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fall back to HTTP-only cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ error: 'Server configuration error: JWT_SECRET is missing' });
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Find user by id and exclude password
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return next(new UnauthenticatedError('Authentication invalid'));
    }

    // Check if account is locked
    if (user.lock === true) {
      return next(new UnauthenticatedError('Account is locked. Please contact an administrator'));
    }

    req.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

export default authEmployee;
