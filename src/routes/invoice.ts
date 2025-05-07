import express from 'express';
import { createInvoice, getInvoices , deleteInvoice, updateInvoice} from '../controllers/invoice/invoice';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createInvoice);               // Create a new bicycle
router.route('/:id').get(getInvoices);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteInvoice);
router.route('/:id').patch(updateInvoice);           // Delete a bicycle by ID

export default router;
