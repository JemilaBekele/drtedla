import express from 'express';
import {   
    createUltraTest,getUltraTestsByPatient,finishultraTest,updateUltraTest,getUltraTestsByid,upload, deleteultraTest,getultraTestsByforultra,getultraTestsFinish,
    confirmultraTest,getultraTestsByunconfirm,updateUltraText
} from '../controllers/labratory/ultra';

const router = express.Router();

// Define routes for Bicycle
router.route('/:id').post(createUltraTest).get(getUltraTestsByPatient)
router.route('/:id').patch(upload,updateUltraTest).delete(deleteultraTest)
router.route('/dietail/:id').get(getUltraTestsByid).patch(finishultraTest)

router.route('/UltraText/update/:id').patch(upload, updateUltraText)
router.route('/image/forlab').get(getultraTestsByforultra)

router.route('/finish/lab').get(getultraTestsFinish)
router.route('/confirm/lab/:id').patch(confirmultraTest)

router.route('/uncomfirm/lab').get(getultraTestsByunconfirm)
export default router;
