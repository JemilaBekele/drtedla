import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import { UltraTest } from '../../models/ultrasound';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';
import multer from 'multer';


import { uploadImage } from '../../helpers/uploadImage';
import Payment from '../../models/payments';



interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}


interface RequestWithFiles extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
  user?: {
    userId: string;
    username: string;
  };
}

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: 'images', maxCount: 10 }, // Expecting one image per test update
]);

// Controller to update test result and image
const updateUltraTest = asyncWrapper(async (req: RequestWithFiles, res: Response): Promise<void> => {
  console.log('Received files:', req.files);
console.log('Received body:', req.body);

  const { ultraTestId, name, note, noteA, noteB, noteC, noteD, noteF,Recommendation,MedicalSummary } = req.body;

  if (!ultraTestId || !name ) {
    throw new BadRequestError('Please provide ultraTestId, name.');
  }

  if (!req.files || typeof req.files !== 'object' || !('images' in req.files)) {
    throw new BadRequestError('Please provide the test image.');
  }

  const imageFile = req?.files['images']?.[0];
  console.log(imageFile)

  const imagePath = await uploadImage(imageFile);

  // Find and update the specific test inside UltraTest
  const ultraTest = await UltraTest.findOneAndUpdate(
    { _id: ultraTestId, 'tests.name': name },
    {
      $set: {
        'tests.$.note': note,
        'tests.$.noteA': noteA,
        'tests.$.noteB': noteB,
        'tests.$.noteC': noteC,
        'tests.$.noteD': noteD,
        'tests.$.noteF': noteF,
        'tests.$.MedicalSummary': MedicalSummary,
        'tests.$.Recommendation': Recommendation,
        'tests.$.images': imagePath,
      },
    },
    { new: true }
  );

  if (!ultraTest) {
    throw new NotFoundError('UltraTest or Test not found.');
  }
  ultraTest.status = "Pending";

  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };
  ultraTest.changeHistory.push(changeHistory);
  await ultraTest.save();
  res.status(StatusCodes.OK).json({
    message: 'Test result and image updated successfully.',
    ultraTest,
  });
});

const updateUltraText = asyncWrapper(async (req: RequestWithFiles, res: Response): Promise<void> => { 
  console.log('Received body:', req.body);

  const { ultraTestId, name, note, noteA, noteB, noteC, noteD, noteF, Recommendation, MedicalSummary } = req.body;

  if (!ultraTestId || !name) {
    throw new BadRequestError('Please provide ultraTestId and name.');
  }

  // Find and update the specific test inside UltraTest
  const ultraTest = await UltraTest.findOneAndUpdate(
    { _id: ultraTestId, 'tests.name': name },
    {
      $set: {
        'tests.$.note': note,
        'tests.$.noteA': noteA,
        'tests.$.noteB': noteB,
        'tests.$.noteC': noteC,
        'tests.$.noteD': noteD,
        'tests.$.noteF': noteF,
        'tests.$.MedicalSummary': MedicalSummary,
        'tests.$.Recommendation': Recommendation,
      },
    },
    { new: true }
  );

  if (!ultraTest) {
    throw new NotFoundError('UltraTest or Test not found.');
  }

  ultraTest.status = "Pending";

  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };
  ultraTest.changeHistory.push(changeHistory);
  await ultraTest.save();

  res.status(StatusCodes.OK).json({
    message: 'Test result updated successfully.',
    ultraTest,
  });
});




interface AuthenticadRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}
const createUltraTest = asyncWrapper(async (req: AuthenticadRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { tests } = req.body; // Array of tests, not sections anymore
console.log(tests)
  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }
  if (!tests || !Array.isArray(tests)) {
    throw new BadRequestError('Tests array is required');
  }

  // Find the patient
  const patient = await Patient.findById(id).exec();
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Build createdBy object using authenticated user details
  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  // Format each test
  const formattedTests = tests.map((test: any) => ({
    name: test.name,
    note: test.note || null,
    noteA: test.noteA || null,
    noteB: test.noteB || null,
    noteC: test.noteC || null,
    noteD: test.noteD || null,
    noteF: test.noteF || null,
    MedicalSummary: test.MedicalSummary || null,
    Recommendation: test.Recommendation || null,
    unit: test.unit || null,
    referenceRange: test.referenceRange || null,
    Remark: test.Remark || null,
    price: test.price || 0,
  }));

  // Create a new UltraTest document with all tests
  const newUltraTest = new UltraTest({
    patient: patient._id,
    tests: formattedTests,
    createdBy,
    status: 'Order',
  });

  const savedUltraTest = await newUltraTest.save();

  // Link the UltraTest to the patient
  patient.UltraTest = patient.UltraTest || [];
  patient.UltraTest.push(savedUltraTest._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Lab Test created successfully',
    success: true,
    data: savedUltraTest,
  });
});



/**
 * ✅ Retrieve all Lab Tests for a given patient.
 */
const getUltraTestsByPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
  const { id } = req.params;
  const UltraTests = await UltraTest.find({ patient: id })
  .populate('patient')
  .sort({ createdAt: -1 }) // Sort by most recent
  .exec();

console.log(UltraTests)
  res.status(StatusCodes.OK).json({
    message: 'Lab tests retrieved successfully',
    success: true,
    data: UltraTests,
  });
} catch (error) {
  console.error('Error retrieving lab tests:', error);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
  });
}
});

const getUltraTestsByid = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
  const { id } = req.params;
  const ultraTest = await UltraTest.find({_id:id});
console.log(ultraTest)

  res.status(StatusCodes.OK).json({
    message: 'Lab tests retrieved successfully',
    success: true,
    data: ultraTest,
  });
} catch (error) {
  console.error('Error retrieving lab tests:', error);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
  });
}
});


const deleteultraTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const deletedultraTest = await UltraTest.findByIdAndDelete(id).exec();
  if (!deletedultraTest) {
    throw new NotFoundError('Lab Test not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Lab Test deleted successfully',
    success: true,
  });
});





const getultraTestsByforultra = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
   

    const ultraTests = await UltraTest.find({ 
      $or: [{ status: 'Pending' }, { status: 'Order' }]
    })
      .populate('patient', '_id cardno firstname age sex phoneNumber')
   

    res.status(StatusCodes.OK).json({
      message: 'ultra tests retrieved successfully',
      data: ultraTests,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving ultra tests',
    });
  }
});


const getultraTestsFinish = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
   

    // Retrieve all lab tests with status 'Pending' or 'Order'
    const ultraTests = await UltraTest.find({ 
        status: 'Finish'  // Filter by Pending or Order status
    })
      .populate('patient', '_id cardno firstname age sex phoneNumber')
     
    // Retrieve pricing configurations for test sections
   
   
  

    res.status(StatusCodes.OK).json({
      message: 'ultr tests  Finish retrieved successfully',
      data: ultraTests,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving ultra tests',
    });
  }
});


const finishultraTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Lab test ID

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const existingultraTest = await UltraTest.findById(id);
  if (!existingultraTest) {
    throw new NotFoundError('Lab Test not found');
  }

  if (existingultraTest.status === "Finish") {
    throw new BadRequestError('Lab Test is already marked as finished');
  }

  // Set the status to "Finish"
  existingultraTest.status = "Finish";
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };

  // Add the new change history entry
  existingultraTest.changeHistory.push(changeHistory);
  // Save the updated lab test with the "Finish" status
  await existingultraTest.save();

  res.status(200).json({ success: true, message: "Lab Test marked as finished", data: existingultraTest });
});


const getultraTestsByunconfirm = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const GLOBAL_DEFAULT_PRICE = 0; // Fallback price if no pricing rules match

    // Fetch unconfirmed UltraTests and populate patient details
    const unconfirmedUltraTests = await UltraTest.find({ confirm: false })
      .populate('patient', 'cardno firstname');

    // Map through the unconfirmed UltraTests to calculate individual and total prices
    const result = unconfirmedUltraTests.map((ultraTest) => {
      // Calculate the total price for all tests in this UltraTest
      const totalPrice = ultraTest.tests.reduce((sum, test) => {
        return sum + (test.price || GLOBAL_DEFAULT_PRICE); // Use fallback price if price is missing
      }, 0);

      // Return the UltraTest with additional price details
      return {
        ...ultraTest.toObject(), // Convert Mongoose document to a plain object
        tests: ultraTest.tests.map((test) => ({
          ...test.toObject(), // Convert Mongoose subdocument to a plain object
          price: test.price || GLOBAL_DEFAULT_PRICE, // Ensure fallback price is used
        })),
        totalPrice, // Add the total price for this UltraTest
      };
    });

    res.status(StatusCodes.OK).json({
      message: 'Ultra tests retrieved successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving lab tests',
    });
  }
});


const confirmultraTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amountPaid } = req.body; // Add amountPaid from the request body

  if (!id) throw new BadRequestError('Ultra Test ID is required');
  if (typeof amountPaid !== 'number' || amountPaid < 0) {
    throw new BadRequestError('Valid amount paid is required');
  }
  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };

  try {
    // Fetch the UltraTest from the database
    const existingUltraTest = await UltraTest.findById(id);
    if (!existingUltraTest) throw new NotFoundError('Ultra Test not found');
    if (existingUltraTest.confirm) throw new BadRequestError('Ultra Test already confirmed');

    // Calculate the total price for all tests in the UltraTest
    const totalAmount = existingUltraTest.tests.reduce((sum, test) => {
      return sum + (test.price || 0); // Use fallback price if price is missing
    }, 0);

    console.log(`Total Amount Calculated: ${totalAmount}`);

    // Ensure the total amount is valid
    if (totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }

    // Ensure that the amount paid is less than or equal to the total amount
    if (amountPaid > totalAmount) {
      throw new BadRequestError('Amount paid cannot exceed the total amount');
    }

    // Calculate amount due
    const amountDue = totalAmount - amountPaid;

    // Mark the UltraTest as confirmed
    existingUltraTest.confirm = true;

    // Save the updated UltraTest
    const updatedUltraTest = await existingUltraTest.save();

    // Create a payment record for the confirmed UltraTest
    const payment = new Payment({
      ultraTest: updatedUltraTest._id,
      customerName: updatedUltraTest.patient,
      OrderBy: updatedUltraTest.createdBy.id,
      totalAmount, // Total amount calculated from the tests
      amountPaid, // Amount paid from the request body
      amountDue, // Amount due calculated as totalAmount - amountPaid
      paymentHistory: [],
      createdBy, // Initialize payment history
    });

    console.log('Payment Total Amount:', totalAmount);

    // Save the payment record
    await payment.save();

    // Respond to client
    res.status(200).json({
      success: true,
      message: "Ultra Test confirmed and payment record created",
      data: {
        ultraTest: updatedUltraTest,
        payment: {
          totalAmount: payment.totalAmount,
          amountPaid: payment.amountPaid,
          amountDue: payment.amountDue,
          paymentId: payment._id,
        },
      },
    });
  } catch (error) {
    console.error('Error confirming Ultra Test:', error);
    res.status(400).json({
      success: false,
      message: 'Confirmation failed',
    });
  }
});

export {
  updateUltraText, createUltraTest,confirmultraTest,getUltraTestsByPatient,updateUltraTest,getUltraTestsByid,upload,deleteultraTest,getultraTestsByforultra,getultraTestsFinish,finishultraTest,getultraTestsByunconfirm
  };