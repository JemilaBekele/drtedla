import express from 'express';



import { getPaymentsByCustomerId, updatePaymentAmount ,getultraCustomerId} from '../controllers/labratory/payment';

const router = express.Router();


router.route('/ultra/:id').get(getultraCustomerId)
router.route('/:id').get(getPaymentsByCustomerId).patch(updatePaymentAmount);

export default router;