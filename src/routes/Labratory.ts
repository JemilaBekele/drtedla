import express from 'express';
import {   createLabTest,
    updateLabTest,
    deleteLabTest,
    getAllLabTests,getLabTestsByPatient,updateLabTestReferenceAndUnit,finishLabTest,getLabTestsByunconfirm,getLabTestsByforlab,getLabTestsFinishforlab
} from '../controllers/labratory/lab';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createLabTest);               // Create a new bicycle
router.route('/:id').get(getAllLabTests); 
router.route('/dietail/:id').get(getLabTestsByPatient);                   // Get a single bicycle by ID                 // Get all bicycles
router.route('/:id').delete(deleteLabTest).patch(updateLabTest);  

router.route('/updateunit/:id').patch(updateLabTestReferenceAndUnit)
router.route('/finish/:id').patch(finishLabTest)

router.route('/unconfirmed/recep').get(getLabTestsByunconfirm)

router.route('/labratory/labtests/finish').get(getLabTestsFinishforlab)
router.route('/labratory/labtests/forlab').get(getLabTestsByforlab)
     // Delete a bicycle by ID

export default router;
