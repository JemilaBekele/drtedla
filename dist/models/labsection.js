"use strict";
const mongoose = require('mongoose');
const LabTest = require('./models/LabTest'); // Adjust the path if necessary
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
