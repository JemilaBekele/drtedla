import express from 'express';
import {
  createOrder,
  getOrderById,
 
  gerdocorder,
  updateOrder,
  
} from '../controllers/order/order';


const router = express.Router();

// Order-related routes
router.route('/').post(createOrder);               // Create a new bicycle
router.route('/:id').get(getOrderById);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').patch(updateOrder);  

router.route('/').get(gerdocorder);   






export default router;
