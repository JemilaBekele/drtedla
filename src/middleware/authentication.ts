import Patient from '../models/Patient';
import jwt from 'jsonwebtoken';
import UnauthenticatedError from '../errors/unauthenticated';
import { Request, Response, NextFunction } from 'express';

// Extend the Request type to include `patient`
interface AuthenticatedRequest extends Request {
  patient?: {
    patientId: string;
    email: string;
    firstname: string;
  };
}

/**
 * Patient authentication middleware.
 * Supports dual-mode token extraction:
 *   1. Authorization: Bearer <token>  (header — preferred)
 *   2. req.cookies.accessToken        (HTTP-only cookie — fallback)
 */
const authPatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Find patient by id and exclude password
    const patient = await Patient.findById(payload.userId).select('-password');
    if (!patient) {
      return next(new UnauthenticatedError('Authentication invalid'));
    }

    // Check if patient is locked/active
    if (patient.Locked === true) {
      return next(new UnauthenticatedError('Account is locked. Please contact support'));
    }

    req.patient = { 
      patientId: patient._id.toString(),
      email: patient.Email,
      firstname: patient.firstname
    };

    next();
  } catch (error) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

export default authPatient;