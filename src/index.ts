import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';

import appointRoutes from './routes/appointment'
import auth from './middleware/authentication';

import userRoutes from './routes/user';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

mongoose.connect(process.env.DATABASE_URL || "")
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(`MongoDB connection error: ${err}`));


  
  app.use(cors());
  app.use(express.json());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
  
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Node.js backend!');
});

app.use('/api', authRoutes);
app.use('/api/patient', patientRoutes);

app.use('/api/appointment', appointRoutes);
app.use('/api/user', userRoutes);
 










// Global Error-Handling Middleware
// Global Error-Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
