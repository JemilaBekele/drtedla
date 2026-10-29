import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import User from '../../models/Users';
import { generateVerificationCode, sendVerificationEmail } from '../emailService';
import VerificationToken from '../../models/VerificationToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
 // Ensure Image is imported as a Mongoose model
import { validateEmail } from './emailValidator';

// Shared cookie configuration
const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};




const createPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const {
        firstname,
        status,
        age,
        sex,
        phoneNumber,
        Town,
        KK,
        HNo,
        description,
        isbrace,
        disablity,
        HomePhone,
        Address,
        email,
        password,
        EmergencyContactPhone,
        FinancialResponsible,
        ParentGuardianInfo,
        DOB,
        Woreda,
        Region
    } = req.body;

    // Validate required fields
    if (!firstname) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'First name is required'
        });
        return;
    }

    if (age === undefined || age === null || age === '') {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Age is required'
        });
        return;
    }

    if (!sex) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Sex is required'
        });
        return;
    }

    if (!phoneNumber) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Phone number is required'
        });
        return;
    }

    if (!email) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }
        // Email validation including disposable email check
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: emailValidation.message
        });
        return;
    }

    if (!password) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password is required'
        });
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide a valid email address'
        });
        return;
    }

    // Check if email already exists
    const existingPatient = await Patient.findOne({ Email: email.toLowerCase() });
    if (existingPatient) {
        res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: 'Patient with this email already exists'
        });
        return;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let createdBy;

    // Find users with role 'User' and not locked
    const availableUsers = await User.find({
        role: 'User',
        lock: false
    });

    if (availableUsers.length === 0) {
        const anyUser = await User.findOne({ lock: false });
        if (anyUser) {
            createdBy = {
                id: anyUser._id,
                username: anyUser.username,
            };
        } else {
            createdBy = {
                id: 'system',
                username: 'system',
            };
        }
    } else {
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const randomUser = availableUsers[randomIndex];
        createdBy = {
            id: randomUser._id,
            username: randomUser.username,
        };
    }

    // Automatically generate the next card number
    const lastPatient = await Patient.findOne({})
        .sort({ cardno: -1 })
        .exec();

    let finalCardNo;
    if (lastPatient && lastPatient.cardno) {
        const lastCardNo = lastPatient.cardno;
        const numericPart = parseInt(lastCardNo.replace(/\D/g, ''));
        if (!isNaN(numericPart)) {
            const nextNumber = numericPart + 1;
            finalCardNo = nextNumber.toString();
        } else {
            finalCardNo = '1';
        }
    } else {
        finalCardNo = '1';
    }

    // Convert DOB to number (timestamp) if provided
    let convertedDOB = null;
    if (DOB) {
        if (typeof DOB === 'string') {
            const date = new Date(DOB);
            convertedDOB = date.getTime();
        } else if (typeof DOB === 'number') {
            convertedDOB = DOB;
        } else {
            convertedDOB = null;
        }
    }

    // Prepare patient data (but don't save yet - wait for verification)
    const patientData = {
        cardno: finalCardNo,
        firstname,
        age: age ? parseInt(age) : age,
        sex,
        status: 'pending_verification', // Special status until email verified
        phoneNumber,
        Town,
        KK,
        HNo,
        description,
        createdBy,
        isbrace: isbrace || false,
        disablity: disablity || false,
        HomePhone: HomePhone || '',
        Address: Address || '',
        Email: email.toLowerCase(),
        password: password,
        EmergencyContactPhone: EmergencyContactPhone || '',
        FinancialResponsible: FinancialResponsible || 'Self',
        ParentGuardianInfo: ParentGuardianInfo || {},
        DOB: convertedDOB,
        Woreda: Woreda || '',
        Region: Region || '',
        isEmailVerified: false,
        verificationCode: verificationCode,
        verificationCodeExpiresAt: verificationCodeExpiresAt
    };

    // Store patient data temporarily (or save as pending)
    // Option 1: Save as pending verification
    const patient = await Patient.create(patientData);

    // Save verification token only after the patient passed validation and was saved
    const verificationToken = await VerificationToken.create({
        email: email.toLowerCase(),
        code: verificationCode,
        expiresAt: verificationCodeExpiresAt
    });

    // Send verification email
    try {
        await sendVerificationEmail(email, verificationCode, firstname);
    } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Delete the created patient and token if email fails
        await Patient.findByIdAndDelete(patient._id);
        await VerificationToken.deleteOne({ _id: verificationToken._id });
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to send verification email. Please try again.'
        });
        return;
    }

    // Don't generate access token until email is verified
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Patient created successfully. Please verify your email address with the code sent to your email.',
        data: {
            patientId: patient._id,
            email: patient.Email,
            requiresVerification: true
        }
    });
});

// Get a single bicycle by ID
const getpatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id :PatientId} = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  // Pass the ObjectId directly to findById
  const patient = await Patient.findById({_id: PatientId}).select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    );
  if (!patient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ patient });
});

// Get all bicycles
// Get all patients with pagination
const getAllpatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const patients = await Patient.find({})
    .skip(skip)
    .limit(limit)
.select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    )
    .sort({ createdAt: -1 }); // Sort by newest first

  const totalPatients = await Patient.countDocuments({});
  const totalPages = Math.ceil(totalPatients / limit);

  console.log(`Fetching patients - Page: ${page}, Limit: ${limit}`);
  
  res.status(StatusCodes.OK).json({ 
    patients, 
    count: patients.length,
    total: totalPatients,
    totalPages,
    currentPage: page,
    limit
  });
});

// Update patient
const updatepatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { id: PatientId } = req.params;

  if (!PatientId) {
    throw new BadRequestError('Patient ID is required');
  }

  const updatedpatient = await Patient.findByIdAndUpdate(
    PatientId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedpatient) {
    throw new NotFoundError(`No Patient found with ID: ${PatientId}`);
  }

  res.status(StatusCodes.OK).json({ 
    message: 'Patient updated successfully', 
    Patient: updatedpatient 
  });
});

// Search patients with pagination
const searchPatients = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { cardno, name, phoneNumber } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  console.log(cardno);

  // Check if at least one search parameter is provided
  if (!cardno && !name && !phoneNumber) {
    throw new BadRequestError('Please provide at least one search parameter (cardno, name, or phoneNumber)');
  }

  // Build the search query dynamically based on provided parameters
  const query: any = {};

  if (cardno) {
    query.cardno = { $regex: cardno as string, $options: 'i' };
  }

  if (name) {
    query.$or = [
      { firstname: { $regex: name as string, $options: 'i' } },
      { lastname: { $regex: name as string, $options: 'i' } }
    ];
  }

  if (phoneNumber) {
    query.phoneNumber = { $regex: phoneNumber as string, $options: 'i' };
  }

  const patients = await Patient.find(query)
    .skip(skip)
    .limit(limit)
.select(
      '-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm'
    )
    .sort({ createdAt: -1 });

  const totalPatients = await Patient.countDocuments(query);
  const totalPages = Math.ceil(totalPatients / limit);

  if (patients.length === 0) {
    throw new NotFoundError('No patients found matching the search criteria');
  }

  res.status(StatusCodes.OK).json({ 
    success: true,
    count: patients.length,
    total: totalPatients,
    totalPages,
    currentPage: page,
    limit,
    data: patients 
  });
});








const login = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    
    // Validate request body
    if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide email and password'
        });
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide a valid email address'
        });
        return;
    }

    // Find patient by email with sensitive fields
    const patient = await Patient.findOne({ Email: email.toLowerCase() })
        .select('+refreshToken +refreshTokenExpiresAt +loginAttempts +lockUntil +isEmailVerified');
    
    if (!patient) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid email or password'
        });
        return;
    }

    // CHECK IF EMAIL IS VERIFIED - THIS IS THE NEW CHECK
    if (!patient.isEmailVerified) {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Please verify your email address before logging in. Check your email for the verification code.',
            requiresVerification: true,
            email: patient.Email,
            patientId: patient._id
        });
        return;
    }

    // Check if account is temporarily locked
    if (patient.lockUntil && patient.lockUntil > new Date()) {
        const minutesLeft = Math.ceil((patient.lockUntil.getTime() - new Date().getTime()) / 60000);
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: `Account is temporarily locked. Please try again in ${minutesLeft} minutes.`
        });
        return;
    }

    // Check if patient account is permanently locked
    if (patient.Locked === true) {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Your account has been locked. Please contact support.'
        });
        return;
    }

    // Check if patient has a password set
    if (!patient.password) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Account not set up for login. Please contact support.'
        });
        return;
    }

    // Compare password
    const isPasswordValid = await patient.comparePassword(password);
    
    if (!isPasswordValid) {
        // Track failed login attempts
        patient.loginAttempts = (patient.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts
        if (patient.loginAttempts >= 5) {
            patient.lockUntil = new Date(Date.now() + 30 * 60000); // Lock for 30 minutes
            await patient.save();
            res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Too many failed login attempts. Account locked for 30 minutes.'
            });
            return;
        }
        
        await patient.save();
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid email or password'
        });
        return;
    }

    // Reset login attempts on successful login
    patient.loginAttempts = 0;
    patient.lockUntil = undefined;

    // Generate access token (short-lived)
    const accessToken = patient.createJWT();
    
    // Generate refresh token (long-lived)
    const refreshToken = patient.createRefreshToken();
    
    // Store refresh token in database (7 days expiry)
    patient.refreshToken = refreshToken;
    patient.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await patient.save();

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Remove sensitive data from response
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    delete patientResponse.createdBy;
    delete patientResponse.__v;
    delete patientResponse.refreshToken;
    delete patientResponse.refreshTokenExpiresAt;
    delete patientResponse.loginAttempts;
    delete patientResponse.lockUntil;
    delete patientResponse.verificationCode;
    delete patientResponse.verificationCodeExpiresAt;

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Login successful',
        user: {
            id: patient._id,
            cardno: patient.cardno,
            firstname: patient.firstname,
            email: patient.Email,
            age: patient.age,
            sex: patient.sex,
            phoneNumber: patient.phoneNumber,
            status: patient.status || 'active',
            isbrace: patient.isbrace,
            disablity: patient.disablity,
            isEmailVerified: patient.isEmailVerified
        },
        accessToken,  // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
});

const refreshAccessToken = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Refresh token not provided'
        });
        return;
    }
    
    // Find patient with this refresh token
    const patient = await Patient.findOne({ 
        refreshToken: refreshToken,
        refreshTokenExpiresAt: { $gt: new Date() } // Not expired
    });
    
    if (!patient) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
        return;
    }
    
    // Generate new access token
    const newAccessToken = patient.createJWT();
    
    // Optional: Rotate refresh token (generate new one)
    const newRefreshToken = patient.createRefreshToken();
    patient.refreshToken = newRefreshToken;
    patient.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await patient.save();
    
    // Set new cookies
    res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    
    res.status(StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return rotated token so Bearer-mode clients can refresh again
    });
});
const logout = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    // Support both transports: cookie (web) and request body (Bearer-mode clients)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (refreshToken) {
        // Clear refresh token from database
        await Patient.findOneAndUpdate(
            { refreshToken: refreshToken },
            { 
                $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 }
            }
        );
    }
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully'
    });
});
const verifyEmail = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email, code, patientId } = req.body;

    if (!email || !code) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email and verification code are required'
        });
        return;
    }

    // Find verification token
    const verificationToken = await VerificationToken.findOne({
        email: email.toLowerCase(),
        code: code,
        expiresAt: { $gt: new Date() }
    });

    if (!verificationToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid or expired verification code. Please request a new one.'
        });
        return;
    }

    // Find patient
    const patient = await Patient.findOne({ 
        Email: email.toLowerCase(),
        isEmailVerified: false 
    });

    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Patient not found or already verified'
        });
        return;
    }

    // Update patient as verified
    patient.isEmailVerified = true;
    patient.emailVerifiedAt = new Date();
    patient.status = 'active'; // Change from 'pending_verification' to 'active'
    patient.verificationCode = undefined;
    patient.verificationCodeExpiresAt = undefined;
    await patient.save();

    // Delete verification token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Generate access token now that email is verified
    const accessToken = patient.createJWT();

    // Generate refresh token
    const refreshToken = patient.createRefreshToken();
    patient.refreshToken = refreshToken;
    patient.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await patient.save();

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Remove sensitive data
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    delete patientResponse.createdBy;
    delete patientResponse.verificationCode;
    delete patientResponse.verificationCodeExpiresAt;

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Email verified successfully',
        user: {
            id: patient._id,
            cardno: patient.cardno,
            firstname: patient.firstname,
            email: patient.Email,
            age: patient.age,
            sex: patient.sex,
            phoneNumber: patient.phoneNumber,
            role: 'patient',
            status: patient.status,
            isbrace: patient.isbrace,
            disablity: patient.disablity
        },
        accessToken,  // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
});
const resendVerificationCode = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }

    // Find patient
    const patient = await Patient.findOne({ 
        Email: email.toLowerCase(),
        isEmailVerified: false 
    });

    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Patient not found or already verified'
        });
        return;
    }

    // Check if too many attempts
    const recentToken = await VerificationToken.findOne({
        email: email.toLowerCase(),
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });

    if (recentToken && recentToken.attempts >= 3) {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many verification requests. Please wait 5 minutes.'
        });
        return;
    }

    // Generate new verification code
    const newCode = generateVerificationCode();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create verification token
    await VerificationToken.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
            code: newCode,
            expiresAt: newExpiry,
            $inc: { attempts: 1 },
            createdAt: new Date()
        },
        { upsert: true, new: true }
    );

    // Update patient with new code
    patient.verificationCode = newCode;
    patient.verificationCodeExpiresAt = newExpiry;
    await patient.save();

    // Send new verification email
    await sendVerificationEmail(email, newCode, patient.firstname);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'New verification code sent to your email'
    });
});

// Step 1: Request password reset (send code to email)
 const forgotPassword = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }

    // Find patient
    const patient = await Patient.findOne({ Email: email.toLowerCase() });
    
    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'No account found with this email'
        });
        return;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save verification token (reuse existing model)
    await VerificationToken.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
            code: verificationCode,
            expiresAt: expiresAt,
            attempts: 0
        },
        { upsert: true, new: true }
    );

    // Send email with code
    try {
        await sendVerificationEmail(email, verificationCode, patient.firstname);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to send reset code. Please try again.'
        });
        return;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password reset code sent to your email'
    });
});

// Step 2: Verify code and reset password
// Step 2: Verify code and reset password
const resetPassword = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email, verification code, and new password are required'
        });
        return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
        return;
    }

    // Find verification token
    const verificationToken = await VerificationToken.findOne({
        email: email.toLowerCase(),
        code: code,
        expiresAt: { $gt: new Date() }
    });

    if (!verificationToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid or expired verification code'
        });
        return;
    }

    // Find patient
    const patient = await Patient.findOne({ Email: email.toLowerCase() });
    
    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Patient not found'
        });
        return;
    }

    // IMPORTANT: Set password directly WITHOUT hashing
    // The pre-save middleware will hash it automatically
    patient.password = newPassword;
    
    // Clear refresh tokens (force re-login)
    patient.refreshToken = undefined;
    patient.refreshTokenExpiresAt = undefined;
    
    // Save patient - pre-save hook will hash the password
    await patient.save();

    // Delete the used verification token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
    });
});

// ─── /me endpoints (use authenticated patient's own ID from token) ───────────

// Get current authenticated patient's profile
const getMe = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const patient = await Patient.findById(req.patient.patientId)
        .select('-password -refreshToken -refreshTokenExpiresAt -verificationCode -verificationCodeExpiresAt -createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm');

    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user: {
            _id: patient._id,
            cardno: patient.cardno,
            firstname: patient.firstname,
            email: patient.Email,
            age: patient.age,
            sex: patient.sex,
            phoneNumber: patient.phoneNumber,
            Town: patient.Town,
            KK: patient.KK,
            HNo: patient.HNo,
            Woreda: patient.Woreda,
            Region: patient.Region,
            Address: patient.Address,
            HomePhone: patient.HomePhone,
            EmergencyContactPhone: patient.EmergencyContactPhone,
            DOB: patient.DOB,
            isbrace: patient.isbrace,
            disablity: patient.disablity,
            isEmailVerified: patient.isEmailVerified,
            color: patient.color,
            FinancialResponsible: patient.FinancialResponsible,
            ParentGuardianInfo: patient.ParentGuardianInfo,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
        },
    });
});

// Change own password (authenticated patient)
const changeMyPassword = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Please provide current password and new password');
    }

    if (newPassword.length < 6) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'New password must be at least 6 characters long',
        });
        return;
    }

    const patient = await Patient.findById(req.patient.patientId);
    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }

    const isPasswordCorrect = await patient.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Current password is incorrect',
        });
        return;
    }

    patient.password = newPassword;

    // Invalidate refresh tokens (force re-login)
    patient.refreshToken = undefined;
    patient.refreshTokenExpiresAt = undefined;
    await patient.save();

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully. Please log in again.',
    });
});

// Update own profile (non-sensitive fields only)
const updateMyProfile = asyncWrapper(async (req: any, res: Response): Promise<void> => {
    const allowedFields = [
        'firstname', 'phoneNumber', 'Town', 'KK', 'HNo', 'Woreda', 'Region',
        'Address', 'HomePhone', 'EmergencyContactPhone', 'DOB',
        'FinancialResponsible', 'ParentGuardianInfo', 'description',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    }

    if (Object.keys(updateData).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No valid fields provided to update',
        });
        return;
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient.patientId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password -refreshToken -refreshTokenExpiresAt -verificationCode -verificationCodeExpiresAt');

    if (!patient) {
        res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: patient._id,
            cardno: patient.cardno,
            firstname: patient.firstname,
            email: patient.Email,
            phoneNumber: patient.phoneNumber,
            Town: patient.Town,
            Address: patient.Address,
        },
    });
});

export { resetPassword, forgotPassword, login, refreshAccessToken, resendVerificationCode, verifyEmail, logout, createPatient, getpatient, updatepatient, getAllpatient, searchPatients, getMe, changeMyPassword, updateMyProfile };

