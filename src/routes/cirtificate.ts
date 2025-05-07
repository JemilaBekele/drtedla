
  

  import express from 'express';
  
 
import { createReferLabTest,
  getReferLabTests,
  updateReferLabTest,
  deleteReferLabTest } from '../controllers/labratory/referelab';
  
  
  const router = express.Router();
  
  // Order-related routes    name
  router.route('/:id').post(createReferLabTest).get(getReferLabTests);   
  router.route('/:id').patch(updateReferLabTest).delete(deleteReferLabTest)  
  
  
export default router;
