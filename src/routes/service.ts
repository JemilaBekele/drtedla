import express from 'express';
import {  createService, getAllServices, updateService, deleteService ,getAllcatultrasoun, getIdcatultrasoun,getAllservice} from '../controllers/invoice/Service';
import { createCategory, deleteCategory, getAllCategorys, updateCategory } from '../controllers/invoice/catagory';

const router = express.Router();

// Define routes for Bicycle getAllServices
router.route('/').post(createService);               // Create a new bicycle
router.route('/').get(getAllServices);                  // Get all bicycles
router.route('/delete').delete(deleteService);
router.route('/update').patch(updateService);           // Delete a bicycle by ID

router.route('/ultrasound').get(getAllcatultrasoun)
router.route('/ultrasound/fetch/by/:id').get(getIdcatultrasoun)


router.route('/ultrasound/:id').get(getAllservice) 


router.route('/categories').post(createCategory).get(getAllCategorys);                  // Get all bicycles
router.route('/categories/:id').delete(deleteCategory).patch(updateCategory);

export default router;
