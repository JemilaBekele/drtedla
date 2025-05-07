import express from 'express';

import { getUltranotesByUltra, createUltranote,
    
    updateUltranote,
    deleteUltranote,
    getUltranote,getUltranotesByname } from '../controllers/labratory/ultranote';
import { createOrganization,getAllOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization } from '../controllers/organization/org';


const router = express.Router();

// Order-related routes    name
router.route('/Ultranote/:ultraId').post(createUltranote).get(getUltranotesByUltra);  

router.route('/Ultranote/name/:testName').get(getUltranotesByname);  
router.route('/Ultranote/:ultraId').get(getUltranote).patch(updateUltranote).delete(deleteUltranote)  




// Order-related routes   
router.route('/organization').post(createOrganization).get(getAllOrganizations);  
router.route('/organization/:id').get(getOrganization).patch(updateOrganization).delete(deleteOrganization)  



export default router;
