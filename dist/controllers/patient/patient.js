"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.changeMyPassword = exports.getMe = exports.searchPatients = exports.getAllpatient = exports.updatepatient = exports.getpatient = exports.createPatient = exports.logout = exports.verifyEmail = exports.resendVerificationCode = exports.refreshAccessToken = exports.login = exports.forgotPassword = exports.resetPassword = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const Users_1 = __importDefault(require("../../models/Users"));
const emailService_1 = require("../emailService");
const VerificationToken_1 = __importDefault(require("../../models/VerificationToken"));
// Ensure Image is imported as a Mongoose model
const emailValidator_1 = require("./emailValidator");
// Shared cookie configuration
const ACCESS_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
};
const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const createPatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, status, age, sex, phoneNumber, Town, KK, HNo, description, isbrace, disablity, HomePhone, Address, email, password, EmergencyContactPhone, FinancialResponsible, ParentGuardianInfo, DOB, Woreda, Region } = req.body;
    // Validate required fields
    if (!firstname) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'First name is required'
        });
        return;
    }
    if (!phoneNumber) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Phone number is required'
        });
        return;
    }
    if (!email) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }
    // Email validation including disposable email check
    const emailValidation = (0, emailValidator_1.validateEmail)(email);
    if (!emailValidation.valid) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: emailValidation.message
        });
        return;
    }
    if (!password) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password is required'
        });
        return;
    }
    // Validate password strength
    if (password.length < 6) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
        return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide a valid email address'
        });
        return;
    }
    // Check if email already exists
    const existingPatient = yield Patient_1.default.findOne({ Email: email.toLowerCase() });
    if (existingPatient) {
        res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
            success: false,
            message: 'Patient with this email already exists'
        });
        return;
    }
    // Generate verification code
    const verificationCode = (0, emailService_1.generateVerificationCode)();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Save verification token to database
    yield VerificationToken_1.default.create({
        email: email.toLowerCase(),
        code: verificationCode,
        expiresAt: verificationCodeExpiresAt
    });
    let createdBy;
    // Find users with role 'User' and not locked
    const availableUsers = yield Users_1.default.find({
        role: 'User',
        lock: false
    });
    if (availableUsers.length === 0) {
        const anyUser = yield Users_1.default.findOne({ lock: false });
        if (anyUser) {
            createdBy = {
                id: anyUser._id,
                username: anyUser.username,
            };
        }
        else {
            createdBy = {
                id: 'system',
                username: 'system',
            };
        }
    }
    else {
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const randomUser = availableUsers[randomIndex];
        createdBy = {
            id: randomUser._id,
            username: randomUser.username,
        };
    }
    // Automatically generate the next card number
    const lastPatient = yield Patient_1.default.findOne({})
        .sort({ cardno: -1 })
        .exec();
    let finalCardNo;
    if (lastPatient && lastPatient.cardno) {
        const lastCardNo = lastPatient.cardno;
        const numericPart = parseInt(lastCardNo.replace(/\D/g, ''));
        if (!isNaN(numericPart)) {
            const nextNumber = numericPart + 1;
            finalCardNo = nextNumber.toString();
        }
        else {
            finalCardNo = '1';
        }
    }
    else {
        finalCardNo = '1';
    }
    // Convert DOB to number (timestamp) if provided
    let convertedDOB = null;
    if (DOB) {
        if (typeof DOB === 'string') {
            const date = new Date(DOB);
            convertedDOB = date.getTime();
        }
        else if (typeof DOB === 'number') {
            convertedDOB = DOB;
        }
        else {
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
    const patient = yield Patient_1.default.create(patientData);
    // Send verification email
    try {
        yield (0, emailService_1.sendVerificationEmail)(email, verificationCode, firstname);
    }
    catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Delete the created patient if email fails
        yield Patient_1.default.findByIdAndDelete(patient._id);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to send verification email. Please try again.'
        });
        return;
    }
    // Don't generate access token until email is verified
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        success: true,
        message: 'Patient created successfully. Please verify your email address with the code sent to your email.',
        data: {
            patientId: patient._id,
            email: patient.Email,
            requiresVerification: true
        }
    });
}));
exports.createPatient = createPatient;
// Get a single bicycle by ID
const getpatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    // Pass the ObjectId directly to findById
    const patient = yield Patient_1.default.findById({ _id: PatientId }).select('-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm');
    if (!patient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ patient });
}));
exports.getpatient = getpatient;
// Get all bicycles
// Get all patients with pagination
const getAllpatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const patients = yield Patient_1.default.find({})
        .skip(skip)
        .limit(limit)
        .select('-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm')
        .sort({ createdAt: -1 }); // Sort by newest first
    const totalPatients = yield Patient_1.default.countDocuments({});
    const totalPages = Math.ceil(totalPatients / limit);
    console.log(`Fetching patients - Page: ${page}, Limit: ${limit}`);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        patients,
        count: patients.length,
        total: totalPatients,
        totalPages,
        currentPage: page,
        limit
    });
}));
exports.getAllpatient = getAllpatient;
// Update patient
const updatepatient = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: PatientId } = req.params;
    if (!PatientId) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const updatedpatient = yield Patient_1.default.findByIdAndUpdate(PatientId, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedpatient) {
        throw new not_found_1.default(`No Patient found with ID: ${PatientId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Patient updated successfully',
        Patient: updatedpatient
    });
}));
exports.updatepatient = updatepatient;
// Search patients with pagination
const searchPatients = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardno, name, phoneNumber } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(cardno);
    // Check if at least one search parameter is provided
    if (!cardno && !name && !phoneNumber) {
        throw new bad_request_1.default('Please provide at least one search parameter (cardno, name, or phoneNumber)');
    }
    // Build the search query dynamically based on provided parameters
    const query = {};
    if (cardno) {
        query.cardno = { $regex: cardno, $options: 'i' };
    }
    if (name) {
        query.$or = [
            { firstname: { $regex: name, $options: 'i' } },
            { lastname: { $regex: name, $options: 'i' } }
        ];
    }
    if (phoneNumber) {
        query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    const patients = yield Patient_1.default.find(query)
        .skip(skip)
        .limit(limit)
        .select('-createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm')
        .sort({ createdAt: -1 });
    const totalPatients = yield Patient_1.default.countDocuments(query);
    const totalPages = Math.ceil(totalPatients / limit);
    if (patients.length === 0) {
        throw new not_found_1.default('No patients found matching the search criteria');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        count: patients.length,
        total: totalPatients,
        totalPages,
        currentPage: page,
        limit,
        data: patients
    });
}));
exports.searchPatients = searchPatients;
const login = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate request body
    if (!email || !password) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide email and password'
        });
        return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Please provide a valid email address'
        });
        return;
    }
    // Find patient by email with sensitive fields
    const patient = yield Patient_1.default.findOne({ Email: email.toLowerCase() })
        .select('+refreshToken +refreshTokenExpiresAt +loginAttempts +lockUntil +isEmailVerified');
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid email or password'
        });
        return;
    }
    // CHECK IF EMAIL IS VERIFIED - THIS IS THE NEW CHECK
    if (!patient.isEmailVerified) {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
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
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: `Account is temporarily locked. Please try again in ${minutesLeft} minutes.`
        });
        return;
    }
    // Check if patient account is permanently locked
    if (patient.Locked === true) {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Your account has been locked. Please contact support.'
        });
        return;
    }
    // Check if patient has a password set
    if (!patient.password) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Account not set up for login. Please contact support.'
        });
        return;
    }
    // Compare password
    const isPasswordValid = yield patient.comparePassword(password);
    if (!isPasswordValid) {
        // Track failed login attempts
        patient.loginAttempts = (patient.loginAttempts || 0) + 1;
        // Lock account after 5 failed attempts
        if (patient.loginAttempts >= 5) {
            patient.lockUntil = new Date(Date.now() + 30 * 60000); // Lock for 30 minutes
            yield patient.save();
            res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Too many failed login attempts. Account locked for 30 minutes.'
            });
            return;
        }
        yield patient.save();
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
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
    yield patient.save();
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
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
        accessToken, // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
}));
exports.login = login;
const refreshAccessToken = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get refresh token from cookie or request body
    const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || req.body.refreshToken;
    if (!refreshToken) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Refresh token not provided'
        });
        return;
    }
    // Find patient with this refresh token
    const patient = yield Patient_1.default.findOne({
        refreshToken: refreshToken,
        refreshTokenExpiresAt: { $gt: new Date() } // Not expired
    });
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
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
    yield patient.save();
    // Set new cookies
    res.cookie('accessToken', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Return rotated token so Bearer-mode clients can refresh again
    });
}));
exports.refreshAccessToken = refreshAccessToken;
const logout = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Support both transports: cookie (web) and request body (Bearer-mode clients)
    const refreshToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.refreshToken);
    if (refreshToken) {
        // Clear refresh token from database
        yield Patient_1.default.findOneAndUpdate({ refreshToken: refreshToken }, {
            $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 }
        });
    }
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully'
    });
}));
exports.logout = logout;
const verifyEmail = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code, patientId } = req.body;
    if (!email || !code) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email and verification code are required'
        });
        return;
    }
    // Find verification token
    const verificationToken = yield VerificationToken_1.default.findOne({
        email: email.toLowerCase(),
        code: code,
        expiresAt: { $gt: new Date() }
    });
    if (!verificationToken) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid or expired verification code. Please request a new one.'
        });
        return;
    }
    // Find patient
    const patient = yield Patient_1.default.findOne({
        Email: email.toLowerCase(),
        isEmailVerified: false
    });
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
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
    yield patient.save();
    // Delete verification token
    yield VerificationToken_1.default.deleteOne({ _id: verificationToken._id });
    // Generate access token now that email is verified
    const accessToken = patient.createJWT();
    // Generate refresh token
    const refreshToken = patient.createRefreshToken();
    patient.refreshToken = refreshToken;
    patient.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    yield patient.save();
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    // Remove sensitive data
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    delete patientResponse.createdBy;
    delete patientResponse.verificationCode;
    delete patientResponse.verificationCodeExpiresAt;
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
        accessToken, // For Bearer-mode clients (also set as httpOnly cookie)
        refreshToken, // For Bearer-mode clients (also set as httpOnly cookie)
    });
}));
exports.verifyEmail = verifyEmail;
const resendVerificationCode = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }
    // Find patient
    const patient = yield Patient_1.default.findOne({
        Email: email.toLowerCase(),
        isEmailVerified: false
    });
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Patient not found or already verified'
        });
        return;
    }
    // Check if too many attempts
    const recentToken = yield VerificationToken_1.default.findOne({
        email: email.toLowerCase(),
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    });
    if (recentToken && recentToken.attempts >= 3) {
        res.status(http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: 'Too many verification requests. Please wait 5 minutes.'
        });
        return;
    }
    // Generate new verification code
    const newCode = (0, emailService_1.generateVerificationCode)();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // Update or create verification token
    yield VerificationToken_1.default.findOneAndUpdate({ email: email.toLowerCase() }, {
        code: newCode,
        expiresAt: newExpiry,
        $inc: { attempts: 1 },
        createdAt: new Date()
    }, { upsert: true, new: true });
    // Update patient with new code
    patient.verificationCode = newCode;
    patient.verificationCodeExpiresAt = newExpiry;
    yield patient.save();
    // Send new verification email
    yield (0, emailService_1.sendVerificationEmail)(email, newCode, patient.firstname);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'New verification code sent to your email'
    });
}));
exports.resendVerificationCode = resendVerificationCode;
// Step 1: Request password reset (send code to email)
const forgotPassword = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email is required'
        });
        return;
    }
    // Find patient
    const patient = yield Patient_1.default.findOne({ Email: email.toLowerCase() });
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'No account found with this email'
        });
        return;
    }
    // Generate verification code
    const verificationCode = (0, emailService_1.generateVerificationCode)();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // Save verification token (reuse existing model)
    yield VerificationToken_1.default.findOneAndUpdate({ email: email.toLowerCase() }, {
        code: verificationCode,
        expiresAt: expiresAt,
        attempts: 0
    }, { upsert: true, new: true });
    // Send email with code
    try {
        yield (0, emailService_1.sendVerificationEmail)(email, verificationCode, patient.firstname);
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to send reset code. Please try again.'
        });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Password reset code sent to your email'
    });
}));
exports.forgotPassword = forgotPassword;
// Step 2: Verify code and reset password
// Step 2: Verify code and reset password
const resetPassword = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email, verification code, and new password are required'
        });
        return;
    }
    // Validate password strength
    if (newPassword.length < 6) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
        return;
    }
    // Find verification token
    const verificationToken = yield VerificationToken_1.default.findOne({
        email: email.toLowerCase(),
        code: code,
        expiresAt: { $gt: new Date() }
    });
    if (!verificationToken) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid or expired verification code'
        });
        return;
    }
    // Find patient
    const patient = yield Patient_1.default.findOne({ Email: email.toLowerCase() });
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
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
    yield patient.save();
    // Delete the used verification token
    yield VerificationToken_1.default.deleteOne({ _id: verificationToken._id });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
    });
}));
exports.resetPassword = resetPassword;
// ─── /me endpoints (use authenticated patient's own ID from token) ───────────
// Get current authenticated patient's profile
const getMe = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield Patient_1.default.findById(req.patient.patientId)
        .select('-password -refreshToken -refreshTokenExpiresAt -verificationCode -verificationCodeExpiresAt -createdBy -Order -MedicalFinding -Healthinfo -Appointment -Image -Invoice -Card -Credit -Orgnazation -Prescription -TreatmentPlan -Consent -Orthodontics -ReferalCertificate -FNA -MedicalCertificate -Note -NoteConPat -DentalChart -SampleTwo -Perfo -DentalLabForm');
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
}));
exports.getMe = getMe;
// Change own password (authenticated patient)
const changeMyPassword = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new bad_request_1.default('Please provide current password and new password');
    }
    if (newPassword.length < 6) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'New password must be at least 6 characters long',
        });
        return;
    }
    const patient = yield Patient_1.default.findById(req.patient.patientId);
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }
    const isPasswordCorrect = yield patient.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Current password is incorrect',
        });
        return;
    }
    patient.password = newPassword;
    // Invalidate refresh tokens (force re-login)
    patient.refreshToken = undefined;
    patient.refreshTokenExpiresAt = undefined;
    yield patient.save();
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully. Please log in again.',
    });
}));
exports.changeMyPassword = changeMyPassword;
// Update own profile (non-sensitive fields only)
const updateMyProfile = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedFields = [
        'firstname', 'phoneNumber', 'Town', 'KK', 'HNo', 'Woreda', 'Region',
        'Address', 'HomePhone', 'EmergencyContactPhone', 'DOB',
        'FinancialResponsible', 'ParentGuardianInfo', 'description',
    ];
    const updateData = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    }
    if (Object.keys(updateData).length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'No valid fields provided to update',
        });
        return;
    }
    const patient = yield Patient_1.default.findByIdAndUpdate(req.patient.patientId, updateData, { new: true, runValidators: true }).select('-password -refreshToken -refreshTokenExpiresAt -verificationCode -verificationCodeExpiresAt');
    if (!patient) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ success: false, message: 'Patient not found' });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
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
}));
exports.updateMyProfile = updateMyProfile;
