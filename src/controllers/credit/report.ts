import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Credit from '../../models/creadit'; // Adjust path as needed
import Patient from '../../models/Patient'; // Import Patient model
import Organization from '../../models/Orgnazation'; // Import Organization model
import BadRequestError from '../../errors/bad-request';
// Fetch Credits based on filters
const fetchCredits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const { createdBy, creditDate, organization, status } = req.body;

    // Initialize query object with the required condition
    const query: any = { 'currentPayment.confirm': false }; // Filter for unconfirmed credits

    // Add optional filters to the query
    if (createdBy) {
      query['createdBy.id'] = createdBy;
    }

    if (creditDate?.start && creditDate?.end) {
      query.creditDate = {
        $gte: new Date(creditDate.start), // Apply date range
        $lte: new Date(creditDate.end),
      };
    }

    if (organization) {
      console.log(`Searching for organization by name: ${organization}`);
      // Find organization by name
      const org = await Organization.findOne({ organization }).select('_id');
      if (org) {
        console.log(`Organization found with ID: ${org._id}`);
        // Find patients based on organization ID
        const patients = await Patient.find({ Organization: org._id }).select('_id');
        if (patients.length > 0) {
          const patientIds = patients.map(patient => patient._id);
          console.log(`Patients found with IDs: ${patientIds}`);
          query['customerName.id'] = { $in: patientIds }; // Filter credits by patient IDs in the specified organization
        } else {
          console.log('No patients found for the given organization.');
          res.status(StatusCodes.OK).json([]); // Return empty result set if no patients found
          return;
        }
      } else {
        console.log('No organization found with the given name.');
        res.status(StatusCodes.OK).json([]); // Return empty result set if no organization found
        return;
      }
    }

    if (status) {
      query.status = status; // Filter by credit status (Paid, Pending, etc.)
    }

    // Execute query
    const credits = await Credit.find(query)
      .populate({ path: 'customerName.id', model: 'Patient', select: 'firstname' })
      .populate({
        path: 'createdBy.id',
        model: 'User',
        select: 'username', // Populate only specific fields like username
      })
      .exec();

    console.log(`Credits found: ${credits.length}`);
    res.status(StatusCodes.OK).json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
});


const getUnconfirmedCredits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all Credit records where currentPayment.confirm is false and populate Patient data based on customer ID
    const unconfirmedCredits = await Credit.find({
      'currentPayment.confirm': false,
    }).populate({ path: 'customerName.id', model: 'Patient' }).exec();

    if (unconfirmedCredits.length === 0) {
      res.status(StatusCodes.OK).json({
        message: 'No unconfirmed Credit records available',
        data: [],
      });
      return;
    }

    // Create a Map to store unique patients based on their ID
    const uniquePatients = new Map();
    unconfirmedCredits.forEach((credit) => {
      if (credit.customerName && credit.customerName.id && !uniquePatients.has(credit.customerName.id._id)) {
        uniquePatients.set(credit.customerName.id._id, credit.customerName);
      }
    });

    // Convert the Map values to an array of unique patient data
    const uniquePatientData = Array.from(uniquePatients.values());

    res.status(StatusCodes.OK).json({
      message: 'Unconfirmed Credit records retrieved successfully',
      success: true,
      data: uniquePatientData,
    });
  } catch (error) {
    console.error('Error retrieving unconfirmed Credit records:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
});



const updateCredits = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { creditIds, status, currentPayment } = req.body;

  // Validate required fields
  if (!creditIds || !Array.isArray(creditIds) || creditIds.length === 0) {
    throw new BadRequestError('Credit IDs are required');
  }

  // Update multiple credits with the new status and payment confirmation
  const result = await Credit.updateMany(
    { _id: { $in: creditIds } },
    {
      $set: {
        status: status || 'Paid',
        'currentPayment.confirm': currentPayment?.confirm ?? true,
      },
    }
  );

  if (result.modifiedCount === 0) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'No credits were updated',
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    message: 'Credits updated successfully',
    success: true,
    modifiedCount: result.modifiedCount,
  });
});




export { fetchCredits,getUnconfirmedCredits,updateCredits };
