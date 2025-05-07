
import express from 'express';
import { getInvoices,updateInvoiceWithHistory} from '../controllers/invoice/confirm';

const router = express.Router();

           // Create a new bicycle
router.route('/').get(getInvoices);    
router.route('/:id').patch(updateInvoiceWithHistory); 

export default router;
