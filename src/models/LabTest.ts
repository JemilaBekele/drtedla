import mongoose, { Schema } from 'mongoose';
import userReferenceSchema from "../helpers/userReferenceSchema"; // Import userReferenceSchema

// Enum for valid section names
const SectionTypes = [
  "Chemistry", "Hematology", "Electrolyte", "Hormone",
  "Rarasitology", "Microbiology", "Serology", "Urinalysis", "Recommendation"
];

// Predefined sections with test names
const sections = {
  Chemistry: [
    'SGOT', 'SGPT', 'ALKPHOSE', 'T.Bilirubin', 'D.Bilirubin', 
    'BUN(UREA)', 'CREATININE', 'FBS(RBS)', 'URIC ACID', 
    'T.CHOLESTROL', 'Triglycerides', 'LDL', 'HDL', 'T.Cholesterol to HDL'
  ],
  Hematology: [
    'WBC', 'LYMP', 'MID#', 'GRAN#', 'LYMP%', 'MID%', 'GRAN%', 'RBC',
    'HGB', 'MCHC', 'MCH', 'MCV', 'RDW-CV', 'RDW-SD', 'HCT', 'PLT',
    'MPV', 'PDW', 'PCT', 'P-LCR', 
    'ESR', 'Blood Film', 'Blood Group'
  ],
  Electrolyte: ['Sodium(Na+)', 'Calcium(Ca2+)', 'Potassium', 'Chloride(Cl-)'],
  Hormone: [
    'TSH', 'Total T3', 'Total T4', 'HgbAIC', 'Troponin', 'PSA', 'Vitamin D', 'LH', 'FSH'
  ],
  Rarasitology: [
    'Stool Examination', 'color', 'Consistence', 'O/P', 'Pus Cell', 'Red Blood cell', 'Bacteria'
  ],
  Microbiology: [
    'Acid fast stain', 'Wet smear', 'Gram stain', 'KOH'
  ],
  Serology: [
    'SO', 'SH', 'RF', 'ASO',
    'Will felix OX 19', 'HBsAg', 'HCV Ab', 'VDRL', 'H.pylori Ab', 'H.pylori Ag'
  ],
  Urinalysis: [
    'Color', 'Appearance', 'Specific Gravity', 'PH',
    'Protein', 'Glucose', 'Bilirubin',
    'Urobilinogen', 'Nitrite', 'Ketone', 'Blood', 'Leukocyte', 'HCG',
    'WBC', 'RBC', 'Epithelial',
    'WBC cast', 'RBC cast', 'Granular cast', 
    'Hyaline cast', 'Cal-Oxalet', 'Cystal', 'Bacteria', 'Parasite'
  ],
  Recommendation: ['Recommendation']
};

// Schema for each test in a section
const TestSchema = new Schema({
  name: { type: String, required: true },  // Test name
  selectedForLab: { type: Boolean, default: false }, // Indicates if the doctor ordered this test
  isResult: { type: Boolean, default: false }, // Differentiates between ordered and completed tests
  result: { type: String, default: null }, // Stores test result if available
  unit: { type: String, default: null }, // Unit of measurement (e.g., mg/dL, mmol/L)
  referenceRange: { type: String, default: null }, // Expected reference range for the test
  Remark: { type: String, default: null } ,// Additional remarks (optional)
  price: { type: Number, required: false },
});

const LabTestSchema = new Schema({
  sections: [
    {
      section: { type: String, enum: SectionTypes, required: true }, // Enforce section type
      tests: [TestSchema], // Array of tests belonging to the section
    },
  ],
  patient: {
    type: mongoose.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please provide Patient ID'],
  },
  status: {
    type: String,
    required: [true, 'Please provide a status'],
    enum: ['Pending', 'Cancel', 'Finish', 'Order'

    ],
  },
  comments: { type: String, default: null },
  confirm: { type: Boolean, default: false }, // Confirmation flag
  reviewedBy: { type: mongoose.Types.ObjectId, ref: 'User' }, // Tracks lab technician who reviewed the test
  // Tracking fields
  createdBy: { type: userReferenceSchema, required: true }, // Tracks the user who created the record
  changeHistory: [
    {
      updatedBy: userReferenceSchema, // Tracks the user who updated the record
      updateTime: { type: Date, default: Date.now }, // Captures update timestamps
    },
  ],
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically
// Create Mongoose Model
const LabTest = mongoose.model('LabTest', LabTestSchema);

export { LabTest, sections };
