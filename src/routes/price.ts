import express from 'express';
import { 
    upsertTestPricing, 
    getAllTestPricing, 
    getTestPricingBySection, 
    deleteTestPricing ,
} from '../controllers/TestPricing/TestPricing';

const router = express.Router();

// Get all test pricings
router.route('/').get(getAllTestPricing).post(upsertTestPricing);


// Get pricing by section
router.route('/section/:section').get(getTestPricingBySection);

// Delete pricing by ID
router.route('/:id').delete(deleteTestPricing);

;
import {   confirmLabTest
} from '../controllers/labratory/lab';




router.route('/reception/confirm/:id').patch(confirmLabTest)


export default router;
