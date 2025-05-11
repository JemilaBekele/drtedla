"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sections = exports.LabTest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userReferenceSchema_1 = __importDefault(require("../helpers/userReferenceSchema")); // Import userReferenceSchema
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
exports.sections = sections;
// Schema for each test in a section
const TestSchema = new mongoose_1.Schema({
    name: { type: String, required: true }, // Test name
    selectedForLab: { type: Boolean, default: false }, // Indicates if the doctor ordered this test
    isResult: { type: Boolean, default: false }, // Differentiates between ordered and completed tests
    result: { type: String, default: null }, // Stores test result if available
    unit: { type: String, default: null }, // Unit of measurement (e.g., mg/dL, mmol/L)
    referenceRange: { type: String, default: null }, // Expected reference range for the test
    Remark: { type: String, default: null }, // Additional remarks (optional)
    price: { type: Number, required: false },
});
const LabTestSchema = new mongoose_1.Schema({
    sections: [
        {
            section: { type: String, enum: SectionTypes, required: true }, // Enforce section type
            tests: [TestSchema], // Array of tests belonging to the section
        },
    ],
    patient: {
        type: mongoose_1.default.Types.ObjectId,
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
    reviewedBy: { type: mongoose_1.default.Types.ObjectId, ref: 'User' }, // Tracks lab technician who reviewed the test
    // Tracking fields
    createdBy: { type: userReferenceSchema_1.default, required: true }, // Tracks the user who created the record
    changeHistory: [
        {
            updatedBy: userReferenceSchema_1.default, // Tracks the user who updated the record
            updateTime: { type: Date, default: Date.now }, // Captures update timestamps
        },
    ],
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically
// Create Mongoose Model
const LabTest = mongoose_1.default.model('LabTest', LabTestSchema);
exports.LabTest = LabTest;
