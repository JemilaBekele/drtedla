import express from 'express';
import {createOrgnazation, getOrgnazations ,updateOrganization, deleteOrganization ,getOrgall} from '../controllers/Orgnazation/organ';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createOrgnazation);               // Create a new bicycle
router.route('/:id').get(getOrgnazations);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteOrganization);
router.route('/:id').patch(updateOrganization); 
router.route('/').get(getOrgall);           // Delete a bicycle by ID

export default router;
