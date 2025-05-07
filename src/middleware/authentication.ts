import jwt from 'jsonwebtoken';
import UnauthenticatedError from '../errors/unauthenticated';
import User from '../models/Users';
import { Request, Response, NextFunction } from 'express';

// Extend the Request type to include `user`
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or malformed Authorization header');
    return next(new UnauthenticatedError('Authentication invalid'));
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // Debugging

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not defined');
      res.status(500).json({ error: 'Server configuration error: JWT_SECRET is missing' });
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      console.error('User associated with token not found');
      return next(new UnauthenticatedError('Authentication invalid'));
    }

    req.user = { 
      userId: user._id.toString(),
      username: user.username,
      role: user.role 
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

export default auth;
