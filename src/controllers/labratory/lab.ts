import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';

import { LabTest } from '../../models/LabTest';
import Patient from '../../models/Patient';
import BadRequestError from '../../errors/bad-request';
import NotFoundError from '../../errors/not-found';

import TestPricing from '../../models/Pricing';
import Payment from '../../models/payments';


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * ✅ Create a new Lab Test for a patient.
 * Expects patient ID in req.params and test details in req.body.
 */
const createLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Patient ID from URL params
  const { sections } = req.body; // Array of sections with tests
  console.log(sections); // This will now correctly show the input format [ { section: 'Chemistry', tests: [ 'SGOT/AST', 'ALKPHOSE' ] } ]

  if (!id) {
    throw new BadRequestError('Patient ID is required');
  }
  if (!sections || !Array.isArray(sections)) {
    throw new BadRequestError('Sections array is required');
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

  // Format each section and its tests
  const formattedSections = sections.map((section: any) => ({
    section: section.section,
    // FIX: Map the string directly to the 'name' property
    tests: section.tests.map((test: string) => ({ // Changed type hint to string for clarity
      name: test, // Use the string 'test' as the 'name'
      selectedForLab: true,
      isResult: false,
      result: null,
      unit: null,
      referenceRange: null,
      comments: null,
    })),
  }));

  // Create a single LabTest document with all sections
  const newLabTest = new LabTest({
    patient: patient._id,
    sections: formattedSections,
    createdBy,
    status: 'Order',
  });

  const savedLabTest = await newLabTest.save();

  // Link the lab test to the patient
  patient.LabTest = patient.LabTest || [];
  patient.LabTest.push(savedLabTest._id);
  await patient.save();

  res.status(StatusCodes.CREATED).json({
    message: 'Lab Test created successfully',
    success: true,
    data: savedLabTest,
  });
});
/**
 * ✅ Retrieve all Lab Tests for a given patient.
 */
const getLabTestsByPatient = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
  const { id } = req.params;
  const labTests = await LabTest.find({_id:id});

  res.status(StatusCodes.OK).json({
    message: 'Lab tests retrieved successfully',
    success: true,
    data: labTests,
  });
} catch (error) {
  console.error('Error retrieving lab tests:', error);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
  });
}
});

/**
 * ✅ Update an existing Lab Test.
 * Allows updating test results, status, and review.
 */
const testConfigurations: Record<string, { unit: string; referenceRange: string }> = {
 'SGOT/AST': { unit: 'U/L', referenceRange: '<45 U/L' },
  'SGPT/ALT': { unit: 'U/L', referenceRange: '<40 U/L' },
  'ALKPHOSE': { unit: 'U/L', referenceRange: '<90-300 U/L' },
  'T.Bilirubin': { unit: 'mg/dL', referenceRange: '0.2-1.0 mg/dL' },
  'D.Bilirubin': { unit: 'mg/dL', referenceRange: '0.0-0.2 mg/dL' },
  'BUN(UREA)': { unit: 'mg/dL', referenceRange: '10-40 mg/dL' },
  'CREATININE': { unit: 'mg/dL', referenceRange: '0.6-1.2 mg/dL' },
  'ALB': { unit: 'mg/dL', referenceRange: '70-104 mg/dL' },
  'TPRO': { unit: 'mg/dL', referenceRange: '6.6-9.6 mg/dL' },
  'URIC ACID': { unit: 'mg/dL', referenceRange: '3-7 mg/dL' },
  'T.CHOLESTROL': { unit: 'mg/dL', referenceRange: '<200 mg/dL' },
  'Triglycerides': { unit: 'mg/dL', referenceRange: '<190 mg/dL' },
  'LDL': { unit: 'mg/dL', referenceRange: '<100 mg/dL' },
  'HDL': { unit: 'mg/dL', referenceRange: '>60 mg/dL' },
  'T.Cholesterol to HDL': { unit: 'ratio', referenceRange: '<5:1' },
  'RBS': { unit: 'mg/dL', referenceRange: '60-126 mg/dL' },
  'FBS(RBS)': { unit: 'mg/dL', referenceRange: '60-200 mg/dL' },

  // Electrolyte Tests
  'Sodium(Na+)': { unit: 'mmol/L', referenceRange: '136-146 mmol/L' },
  'Calcium(Ca2+)': { unit: 'mmol/L', referenceRange: '1.08-1.3 mmol/L' },
  'Potassium': { unit: 'mmol/L', referenceRange: '3.5-5 mmol/L' },
  'Chloride(Cl-)': { unit: 'mmol/L', referenceRange: '96-106 mmol/L' },
  'Magnesium': { unit: 'mg/L', referenceRange: '1.7-22 mg/L' },

  // Hematology Tests
  'WBC': { unit: 'x10^9/L', referenceRange: '4-11' },
  'LYMP': { unit: 'x10^9/L', referenceRange: '0.6-4.1' },
  'MID#': { unit: 'x10^9/L', referenceRange: '0.1-0.9' },
  'GRAN#': { unit: 'x10^9/L', referenceRange: '2.7-8.5' },
  'LYMP%': { unit: '%', referenceRange: '20-50' },
  'MID%': { unit: '%', referenceRange: '3-10' },
  'GRAN%': { unit: '%', referenceRange: '40-70' },
  'RBC': { unit: 'x10^12/L', referenceRange: '3.8-5.8' },
  'HGB': { unit: 'g/dL', referenceRange: '11-18' },
  'MCHC': { unit: 'g/dL', referenceRange: '330-360' },
  'MCH': { unit: 'pg', referenceRange: '26.5-33.5' },
  'MCV': { unit: 'fL', referenceRange: '80-99' },
  'RDW-CV': { unit: '%', referenceRange: '10-15' },
  'RDW-SD': { unit: 'fL', referenceRange: '35-56' },
  'HCT': { unit: '%', referenceRange: '35-54' },
  'PLT': { unit: 'x10^9/L', referenceRange: '150-450' },
  'MPV': { unit: 'fL', referenceRange: '7-11' },
  'PDW': { unit: '%', referenceRange: '10-18' },
  'PCT': { unit: '%', referenceRange: '0.1-0.5' },
  'P-LCR': { unit: '%', referenceRange: '13-43' },
  'ESR': { unit: 'mm/hr', referenceRange: '0-20 mm/hr' },
  'Blood Film': { unit: '', referenceRange: 'none, homo, parasite' },
  'Blood Group': { unit: '', referenceRange: 'RH factor' },

  // Hormone Tests
  'TSH': { unit: 'nmmol/L', referenceRange: '0.3-4.2 nmmol/L' },
  'Total T3': { unit: 'nmmol/L', referenceRange: '1.23-3.07 nmmol/L' },
  'Total T4': { unit: 'nmmol/L', referenceRange: '66-181 nmmol/L' },
  'HgbAIC': { unit: '%', referenceRange: '4.0-6.0 %' },
  'Troponin': { unit: 'ng/mL', referenceRange: '0-0.3 ng/mL' },
  'PSA': { unit: 'ng/mL', referenceRange: '0-4 ng/mL' },
  'Vitamin D': { unit: 'ng/mL', referenceRange: '30-100 ng/mL' },
  'LH': { unit: 'mIU/mL', referenceRange: '2.95-13.65 mIU/mL' },
  'FSH': { unit: 'mIU/mL', referenceRange: '4.46-12.43 mIU/mL' },
  'Hgb A1C': { unit: '%', referenceRange: '0-6.5' },
  'Free T3': { unit: 'ng/dL', referenceRange: '0.23-0.6 ng/dL' },
  'Free T4': { unit: 'ng/dL', referenceRange: '0.7-1.53 ng/dL' },
  'Beta-HCG': { unit: 'mIU/mL', referenceRange: '<5 mIU/mL' },

  // Parasitology Tests
  'Stool Examination': { unit: '', referenceRange: '' },
  'color': { unit: '', referenceRange: 'Brown' },
  'Consistence': { unit: '', referenceRange: 'Formed' },
  'O/P': { unit: '', referenceRange: 'No o/p' },
  'Pus Cell': { unit: '', referenceRange: '' },
  'Red Blood cell': { unit: '', referenceRange: '' },
  'bacteria': { unit: '', referenceRange: '' },

  // Microbiology Tests
  'Acid fast stain': { unit: '', referenceRange: '' },
  'Wet smear': { unit: '', referenceRange: '' },
  'Gram stain': { unit: '', referenceRange: '' },
  'KOH': { unit: '', referenceRange: '' },

  // Serology Tests
  'Will felix OX 19': { unit: '', referenceRange: '' },
  'HBsAg': { unit: '', referenceRange: '' },
  'HCV Ab': { unit: '', referenceRange: '' },
  'VDRL': { unit: '', referenceRange: '' },
  'H.pylori Ab': { unit: '', referenceRange: '' },
  'H.pylori Ag': { unit: '', referenceRange: '' },
  'SO': { unit: '', referenceRange: '' },
  'SH': { unit: '', referenceRange: '' },
  'RF': { unit: '', referenceRange: '' },
  'ASO': { unit: '', referenceRange: '' },
  'HIV': { unit: '', referenceRange: '' },

  // Urinalysis Tests
  'Color': { unit: '', referenceRange: 'Yellow' },
  'Appearance': { unit: '', referenceRange: 'Clear' },
  'Specific Gravity': { unit: '', referenceRange: '1.005-1.030' },
  'PH': { unit: '', referenceRange: '5-8' },
  'Protein': { unit: '', referenceRange: '' },
  'Glucose': { unit: '', referenceRange: '' },
  'Bilirubin': { unit: '', referenceRange: '' },
  'Urobilinogen': { unit: '', referenceRange: 'Normal' },
  'Nitrite': { unit: '', referenceRange: '' },
  'Ketone': { unit: '', referenceRange: '' },
  'Blood': { unit: '', referenceRange: '' },
  'Leukocyte': { unit: '', referenceRange: '' },
  'HCG': { unit: '', referenceRange: '' },
  'wbc': { unit: '/HPF', referenceRange: '0-4/HPF' },
  'RBc': { unit: '/HPF', referenceRange: '1-3/HPF' },
  'Epithelial': { unit: '/LPF', referenceRange: '2-4 LPF' },
  'WBC cast': { unit: '', referenceRange: '' },
  'RBC cast': { unit: '', referenceRange: '' },
  'Granular cast': { unit: '', referenceRange: '' },
  'Hyaline cast': { unit: '', referenceRange: '' },
  'Cal-Oxalet': { unit: '', referenceRange: '' },
  'Cystal': { unit: '', referenceRange: '' },
  'Bacteria': { unit: '', referenceRange: '' },
  'Parasite': { unit: '', referenceRange: '' },
  // Add other tests here...
};


const updateLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { sections, status, confirm, reviewedBy } = req.body;

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const existingLabTest = await LabTest.findById(id);
  if (!existingLabTest) {
    throw new NotFoundError('Lab Test not found');
  }

  if (existingLabTest.status === "Finish") {
    throw new BadRequestError('Cannot update a completed lab test');
  }

  // Update the sections if provided
  if (sections && Array.isArray(sections)) {
    for (const updatedSection of sections) {
      // Ensure the section is valid and exists in predefined sections
      if (!existingLabTest.sections.some(s => s.section === updatedSection.section)) {
        throw new BadRequestError(`Invalid section: ${updatedSection.section}`);
      }

      const section = existingLabTest.sections.find(s => s.section === updatedSection.section);

      // Proceed to update the tests within the section
      if (section) {
        for (const updatedTest of updatedSection.tests) {
          const existingTest = section.tests.find(test => test.name === updatedTest.name);
          if (existingTest) {
            // Get the test's unit and reference range from testConfigurations
            const { unit, referenceRange } = testConfigurations[updatedTest.name] || {};

            let Remark = "Normal"; // Default Remark

            const result = updatedTest.result;

            if (result && referenceRange) {
              const resultValue = parseFloat(result);
              if (!isNaN(resultValue)) {
                const rangeMatch = referenceRange.match(/^([0-9.]+)-([0-9.]+)/);
                if (rangeMatch) {
                  const [_, low, high] = rangeMatch.map(Number);
                  if (resultValue < low) Remark = "Low";
                  else if (resultValue > high) Remark = "High";
                } else {
                  if (referenceRange.startsWith("<")) {
                    const threshold = parseFloat(referenceRange.substring(1));
                    if (resultValue >= threshold) Remark = "High";
                  } else if (referenceRange.startsWith(">")) {
                    const threshold = parseFloat(referenceRange.substring(1));
                    if (resultValue <= threshold) Remark = "Low";
                  }
                }
              } else {
                // In case of non-numeric values, check if result matches a known value
                const expectedValues = referenceRange.split(/,|\//).map(v => v.trim());
                Remark = expectedValues.includes(result) ? "Normal" : "Abnormal";
              }
            }

            // Update the test with the new result, unit, reference range, and Remark
            existingTest.result = result;
            existingTest.unit = unit || existingTest.unit;
            existingTest.referenceRange = referenceRange || existingTest.referenceRange;
            existingTest.Remark = Remark; // Set the Remark based on the result
          }
        }
      }
    }
  }

  // Update the lab test status and other details
  existingLabTest.status = "Pending";
  existingLabTest.confirm = confirm ?? existingLabTest.confirm;
  existingLabTest.reviewedBy = reviewedBy || existingLabTest.reviewedBy;
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };

  // Add the new change history entry
  existingLabTest.changeHistory.push(changeHistory);
  await existingLabTest.save();
  res.status(200).json({ success: true, message: "Lab Test updated successfully", data: existingLabTest });
});


const updateLabTestReferenceAndUnit = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Lab test ID
  const { sections } = req.body; // Sections containing tests to update

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const existingLabTest = await LabTest.findById(id);
  if (!existingLabTest) {
    throw new NotFoundError('Lab Test not found');
  }

  if (existingLabTest.status === "Finish") {
    throw new BadRequestError('Cannot update a completed lab test');
  }

  // Update the unit and reference range for tests within the sections
  if (sections && Array.isArray(sections)) {
    for (const updatedSection of sections) {
      const section = existingLabTest.sections.find(s => s.section === updatedSection.section);
      if (section) {
        for (const updatedTest of updatedSection.tests) {
          const existingTest = section.tests.find(test => test.name === updatedTest.name);
          if (existingTest) {
            // Retrieve the new unit and reference range
            const { unit, referenceRange } = updatedTest;

            // If both unit and reference range are provided, update them
            if (unit) existingTest.unit = unit;
            if (referenceRange) existingTest.referenceRange = referenceRange;

            // Calculate the Remark based on the result and reference range
            let Remark = "Normal"; // Default remark

            const result = updatedTest.result;

            if (result && referenceRange) {
              const resultValue = parseFloat(result);
              if (!isNaN(resultValue)) {
                const rangeMatch = referenceRange.match(/^([0-9.]+)-([0-9.]+)/);
                if (rangeMatch) {
                  const [_, low, high] = rangeMatch.map(Number);
                  if (resultValue < low) Remark = "Low";
                  else if (resultValue > high) Remark = "High";
                } else {
                  if (referenceRange.startsWith("<")) {
                    const threshold = parseFloat(referenceRange.substring(1));
                    if (resultValue >= threshold) Remark = "High";
                  } else if (referenceRange.startsWith(">")) {
                    const threshold = parseFloat(referenceRange.substring(1));
                    if (resultValue <= threshold) Remark = "Low";
                  }
                }
              } else {
                // If result is non-numeric, check for matching values in reference range
                const expectedValues = referenceRange.split(/,|\//).map((v: string) => v.trim());
                Remark = expectedValues.includes(result) ? "Normal" : "Abnormal";
              }
            }

            // Update the test's Remark
            existingTest.Remark = Remark;
          }
        }
      }
    }
  }
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };

  // Add the new change history entry
  existingLabTest.changeHistory.push(changeHistory);
  // Save the updated lab test
  await existingLabTest.save();

  res.status(200).json({ success: true, message: "Lab Test updated successfully", data: existingLabTest });
});



const finishLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params; // Lab test ID

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const existingLabTest = await LabTest.findById(id);
  if (!existingLabTest) {
    throw new NotFoundError('Lab Test not found');
  }

  if (existingLabTest.status === "Finish") {
    throw new BadRequestError('Lab Test is already marked as finished');
  }

  // Set the status to "Finish"
  existingLabTest.status = "Finish";
  const changeHistory = {
    updatedBy: {
      id: req.user?.userId || '',
      username: req.user?.username || '',
    },
    updateTime: new Date()
  };

  // Add the new change history entry
  existingLabTest.changeHistory.push(changeHistory);
  // Save the updated lab test with the "Finish" status
  await existingLabTest.save();

  res.status(200).json({ success: true, message: "Lab Test marked as finished", data: existingLabTest });
});





const deleteLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Lab Test ID is required');
  }

  const deletedLabTest = await LabTest.findByIdAndDelete(id).exec();
  if (!deletedLabTest) {
    throw new NotFoundError('Lab Test not found');
  }

  res.status(StatusCodes.OK).json({
    message: 'Lab Test deleted successfully',
    success: true,
  });
});

/**
 * ✅ Retrieve all Lab Tests in the database.
 */
const getAllLabTests = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    const { id } = _req.params;
    const labTests = await LabTest.find({patient:id});
  
    res.status(StatusCodes.OK).json({
      message: 'Lab tests retrieved successfully',
      success: true,
      data: labTests,
    });
  } catch (error) {
    console.error('Error retrieving lab tests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
});




export interface ILabTest {
  _id: string;
  sections: {
    section: string;
    tests: ITest[];
  }[];
  createdAt: Date;
  updatedAt: Date;
  // Add other necessary fields
}




interface ITestPricing {
  defaultSectionPrice: any;
  testPrices: any;
  testName: string;   // Matches the schema field
  price: number;
  // ... other properties
}

interface ITest {
  name: string;
  selectedForLab: boolean;
  isResult: boolean;
  result?: string;
  unit?: string;
  referenceRange?: string;
  Remark?: string;
  price?: number; // Added price to interface
  _id: string;
}

interface ITestPricing {
  testName: string;
  price: number;
  section: string; // Ensure TestPricing has a section field
  _id: string;
}

const getLabTestsByunconfirm = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const GLOBAL_DEFAULT_PRICE = 0; // Fallback price if no pricing rules match

    const unconfirmedLabTests = await LabTest.find({ confirm: false })
      .populate('patient', 'cardno firstname')
      .lean<ILabTest[]>();

    const testPricingDocs = await TestPricing.find().lean<ITestPricing[]>();

    const result = unconfirmedLabTests.map((labTest) => {
      labTest.sections.forEach((section) => {
        // 1. Find matching pricing configuration for this section
        const sectionPricing = testPricingDocs.find(
          (doc) => doc.section === section.section
        );

        section.tests.forEach((test) => {
          let price = GLOBAL_DEFAULT_PRICE;
          
          if (sectionPricing) {
            // 2. First try to find specific test price
            const specificTestPrice = sectionPricing.testPrices.find(
              (tp: { testName: string; }) => tp.testName === test.name
            );
            
            if (specificTestPrice) {
              price = specificTestPrice.price;
            } else {
              // 3. If no specific price, use section's default price if available
              price = typeof sectionPricing.defaultSectionPrice === 'number' 
                ? sectionPricing.defaultSectionPrice 
                : GLOBAL_DEFAULT_PRICE;
            }
          }

          test.price = price;
        });
      });
      return labTest;
    });

    res.status(StatusCodes.OK).json({
      message: 'Lab tests retrieved successfully',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving lab tests',
    });
  }
});


const confirmLabTest = asyncWrapper(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { sections, amountPaid } = req.body;  // Add amountPaid from the request body
  console.log("Request Body:", req.body);
  console.log("Received Sections:", sections);

  if (!id) throw new BadRequestError('Lab Test ID is required');
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    throw new BadRequestError('Pricing data is required');
  }

  // Check if the patient has provided the amount paid
  if (typeof amountPaid !== 'number' || amountPaid < 0) {
    throw new BadRequestError('Valid amount paid is required');
  }
  const createdBy = {
    id: req.user?.userId || '',
    username: req.user?.username || '',
  };
  try {
    // Fetch the lab test from the database
    const existingLabTest = await LabTest.findById(id);
    if (!existingLabTest) throw new NotFoundError('Lab Test not found');
    if (existingLabTest.confirm) throw new BadRequestError('Lab Test already confirmed');

    // Validate and update prices
    let totalAmount = 0;

    // Iterate through each section in the lab test
    existingLabTest.sections.forEach((dbSection, sectionIdx) => {
      const clientSection = sections.find(s => s.section === dbSection.section);

      if (!clientSection) {
        throw new Error(`Missing pricing data for section ${dbSection.section}`);
      }

      // Log section and test details
      console.log(`Processing Section: ${dbSection.section}`);

      dbSection.tests.forEach((dbTest, testIdx) => {
        const clientTest = clientSection.tests.find((t: { _id: string; }) => t._id === dbTest._id.toString());

        if (!clientTest) {
          throw new Error(`Missing price for test ${dbTest.name} in section ${dbSection.section}`);
        }

        // Log test details and price
        console.log(`Test: ${dbTest.name}, Price from Client: ${clientTest.price}`);

        // Validate and update the price
        if (typeof clientTest.price !== 'number' || clientTest.price < 0) {
          throw new Error(`Invalid price for test ${dbTest.name} in section ${dbSection.section}`);
        }

        // Update the test price and add to total amount
        dbTest.price = clientTest.price;
        totalAmount += clientTest.price;
      });
    });

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

    // Mark the lab test as confirmed
    existingLabTest.confirm = true;
    existingLabTest.changeHistory.push({
      updatedBy: {
        id: req.user?.userId,
        username: req.user?.username
      },
      updateTime: new Date()
    });

    // Save the updated lab test
    const updatedLabTest = await existingLabTest.save();

    // Create a payment record for the confirmed lab test
    const payment = new Payment({
      labTest: updatedLabTest._id,
      customerName: updatedLabTest.patient,
      OrderBy: updatedLabTest.createdBy.id,
      totalAmount,  // Ensure this value is set correctly
      amountPaid,   // Use the amount paid from the request body
      amountDue,    // Amount due should reflect the difference
      paymentHistory: [],
      createdBy,  // Ensure this is properly set
    });
    console.log('Payment Total Amount:', totalAmount);

    // Save the payment record without a session
    await payment.save();

    // Respond to client
    res.status(200).json({
      success: true,
      message: "Lab Test confirmed and payment record created",
      data: {
        labTest: updatedLabTest,
        payment: {
          totalAmount: payment.totalAmount,
          amountPaid: payment.amountPaid,
          amountDue: payment.amountDue,
          paymentId: payment._id
        }
      }
    });

  } catch (error) {
    console.error('Error confirming lab test:', error);
    res.status(400).json({
      success: false,
      message: 'Confirmation failed',
    });
  }
});


const getLabTestsByforlab = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
   

    // Retrieve all lab tests with status 'Pending' or 'Order'
    const labTests = await LabTest.find({ 
      $or: [{ status: 'Pending' }, { status: 'Order' }] // Filter by Pending or Order status
    })
      .populate('patient', '_id cardno firstname age sex phoneNumber')
      .lean<ILabTest[]>();

    // Retrieve pricing configurations for test sections
   
   
  

    res.status(StatusCodes.OK).json({
      message: 'Lab tests retrieved successfully',
      data: labTests,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving lab tests',
    });
  }
});

const getLabTestsFinishforlab = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
   

    // Retrieve all lab tests with status 'Pending' or 'Order'
    const labTests = await LabTest.find({ 
        status: 'Finish'  // Filter by Pending or Order status
    })
      .populate('patient', '_id cardno firstname age sex phoneNumber')
      .lean<ILabTest[]>();

    // Retrieve pricing configurations for test sections
   
   
  

    res.status(StatusCodes.OK).json({
      message: 'Lab tests  Finish retrieved successfully',
      data: labTests,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while retrieving lab tests',
    });
  }
});




export {
  createLabTest,
  getLabTestsByPatient,
  updateLabTest,
  deleteLabTest,
  getAllLabTests,
  updateLabTestReferenceAndUnit,
  finishLabTest,
  confirmLabTest,getLabTestsByunconfirm,getLabTestsByforlab,getLabTestsFinishforlab
};
