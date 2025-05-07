import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import cardRoutes from './routes/card';
import orderRoutes from './routes/order';
import orderpatRoutes from './routes/orderpatient'
import MedicalRoutes from './routes/MedicalFinding'
import appointRoutes from './routes/appointment'
import healthRoutes from './routes/healthinfo'
import patcountRoutes from './routes/countpatient'
import servicesRoutes from './routes/service'
import invoiceRoutes from './routes/invoice'
import RepoinvoiceRoutes from './routes/reportinvoice'
import expenseRoutes from './routes/expense'
import CreditRoutes from './routes/credit'
import organRoutes from './routes/Organization'
import auth from './middleware/authentication';
import appoiRoutes from './routes/reportapp'
import MedicalCertificateRoutes from './routes/MedicalCertificate'
import PrescriptionRoutes from './routes/Prescription'
import listpatientRoutes from './routes/listpatient'
import DiseaseRoutes from './routes/Disease'
import ReportInv from './routes/invreport'
import labratoryRoutes from './routes/Labratory'
import TestSchemaRotes from './routes/TestSchema'
import PriceRoutes from './routes/price'
import nurseRoutes from './routes/nurse'
import ultraRoutes from './routes/ultralab'
import PaymentRoutes from './routes/payment';
import path from 'path';
import UltranoteRoutes from './routes/orgultranote';
import CeriteficateRoute from './routes/cirtificate'
import imageRoutes from './routes/image'
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
app.use('/api/patient', auth, patientRoutes);
app.use('/api/list', auth, listpatientRoutes);
app.use('/api/patcount', patcountRoutes);
app.use('/api/card', auth, cardRoutes);
app.use('/api/order', auth, orderRoutes);
app.use('/api/orderpatient', auth, orderpatRoutes);
app.use('/api/Medical', auth, MedicalRoutes);
app.use('/api/appointment', auth, appointRoutes);
app.use('/api/appointoday', auth, appoiRoutes);
app.use('/api/image', auth, imageRoutes);

app.use('/api/ReferLabTest',auth,CeriteficateRoute)
app.use('/api/org', auth, UltranoteRoutes)
app.use('/api/ReportInv', auth, ReportInv)
app.use('/api/Prescription', auth, PrescriptionRoutes);
app.use('/api/MedicalCertificate', auth, MedicalCertificateRoutes);
app.use('/api/Disease', auth, DiseaseRoutes);
app.use('/api/labratory', auth, labratoryRoutes); 
app.use('/api/ultra', auth, ultraRoutes); 


app.use('/api/payment',auth,PaymentRoutes)
app.use('/api/price', auth, PriceRoutes)
app.use('/api/nurse', auth, nurseRoutes)


app.use('/api/TestSchema', auth, TestSchemaRotes)
app.use('/api/healthinfo', auth, healthRoutes);
app.use('/api/services', auth, servicesRoutes);
app.use('/api/invoice', auth, invoiceRoutes);
app.use('/api/reportinvoice', auth, RepoinvoiceRoutes);
app.use('/api/expense', auth, expenseRoutes)
app.use('/api/Credit', auth, CreditRoutes)




app.use('/api/organization', auth, organRoutes)

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
