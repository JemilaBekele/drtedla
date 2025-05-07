import express from 'express';
import {
  
  getDoctors,
  getpatients,
  getDoc,
  fetchPatient,
  getnurse,getcretore
} from '../controllers/order/order';


const router = express.Router(); 

router.route('/doc').get(getDoc);  
router.route('/doctor').get(getDoctors);  
router.route('/nurse').get(getnurse);   
router.route('/employee').get(getcretore);   

router.route('/').get(getpatients);   

// Patient-related routes
router.route('/').post(fetchPatient);


export default router;
