import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import authPatient from './middleware/authentication';
import authEmployee from './middleware/authEmployee';

// Routes
import patientAuthRoutes from './routes/rigisterpatient'; // Patient public auth (register, login, verify, etc.)
import patientRoutes from './routes/patient';             // Patient protected routes
import employeeRoutes from './routes/employee';           // Employee auth + protected routes
import appointRoutes from './routes/appointment';

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

mongoose.connect(process.env.DATABASE_URL || "")
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(`MongoDB connection error: ${err}`));

// ─── Global middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Node.js backend!');
});

// ─── Patient routes ──────────────────────────────────────────────────────────
app.use('/api/auth', patientAuthRoutes);                       // Public: register, login, verify, refresh, logout, forgot/reset
app.use('/api/patient', authPatient, patientRoutes);           // Protected: patient data (requires patient JWT)

// ─── Employee/Staff routes ───────────────────────────────────────────────────
app.use('/api/employee', employeeRoutes);                      // Public + protected (middleware applied per-route inside)
app.use('/api/appointment', authEmployee, appointRoutes);      // Protected: appointments (requires employee JWT)

// ─── Global Error-Handling Middleware ────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
