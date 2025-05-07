import express from 'express';
import {  addTestConfig, updateTestConfig, getAllTestConfigs, deleteTestConfig  } from '../controllers/TestSchema/test';

const router = express.Router();

// Define routes for Bicycle
router.route('/').post(addTestConfig).get(getAllTestConfigs);                  // Get all bicycles
router.route('/:id').delete(deleteTestConfig).patch(updateTestConfig); 


import {upsertTestPricing, getAllTestPricing, updateTestPricing, deleteTestPricing } from '../controllers/TestPricing/TestPricing'



// Define routes for Bicycle
router.route('/price').post(upsertTestPricing).get(getAllTestPricing);                  // Get all bicycles
router.route('/price/:id').delete(deleteTestPricing).patch(updateTestPricing)


// Define routes for Bicycle


export default router;
