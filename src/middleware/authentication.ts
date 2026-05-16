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

const authPatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Find patient by id and exclude password
    const patient = await Patient.findById(payload.userId).select('-password');
    if (!patient) {
      console.error('Patient associated with token not found');
      return next(new UnauthenticatedError('Authentication invalid'));
    }

    // Check if patient is locked/active
    if (patient.Locked === true) {
      console.error('Patient account is locked');
      return next(new UnauthenticatedError('Account is locked. Please contact support'));
    }

    req.patient = { 
      patientId: patient._id.toString(),
      email: patient.Email,
      firstname: patient.firstname
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

export default authPatient;