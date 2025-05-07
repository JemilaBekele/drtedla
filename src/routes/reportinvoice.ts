import express from 'express';
import { updateInvoiceWithHistory} from '../controllers/invoice/confirm';
import {getFinancialSummary,getPatientsByAgeRange,getServiceDateRankings,getServiceRankings,getInvoicesCardsExpenses,getExpenses, getUnconfirmedInvoices , getbarchart, getPatientsByMonth, getPatientGenderCount} from '../controllers/invoice/report'


const router = express.Router();


router.route('/:id').patch(updateInvoiceWithHistory); 


router.route('/').post(getInvoicesCardsExpenses).get(getFinancialSummary)

router.route('/invoice').patch(getUnconfirmedInvoices); 
router.route('/report/chart').get(getbarchart).post(getExpenses) // Delete a bicycle by ID

router.route('/report/patient').get(getPatientsByMonth);

router.route('/range').get(getPatientGenderCount);
router.route('/range/age').get(getPatientsByAgeRange);


router.route('/get/ServiceRankings').get(getServiceRankings).post(getServiceDateRankings)





export default router;
