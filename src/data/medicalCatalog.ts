import sampleChestImg from '../assets/images/sample_chest_radiograph_1795639844971.jpg';
import sampleBrainImg from '../assets/images/sample_brain_mri_1795639844636.jpg';
import sampleEchoImg from '../assets/images/sample_cardiac_echo_1795639845130.jpg';

export interface MedicationCatalogItem {
  id: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  indications: string;
  adultDosing: string;
  warnings: string;
  interactions: string[];
  renalAdjustment: string;
}

export interface McqQuestionItem {
  id: string;
  specialty: 'Cardiology' | 'Neurology' | 'Pulmonology' | 'Endocrinology' | 'Pharmacology';
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}

export interface ClinicalCaseVignette {
  id: string;
  title: string;
  specialty: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  vignette: string;
  vitals: string;
  keyFinding: string;
  managementPearl: string;
}

export interface FlashcardItem {
  id: string;
  specialty: string;
  front: string;
  back: string;
}

export interface ClinicalGuidelineItem {
  id: string;
  title: string;
  specialty: string;
  organization: string;
  year: string;
  summary: string;
  keyProtocol: string[];
  uncertaintyNote: string;
}

export interface SampleRadiologyStudy {
  id: string;
  title: string;
  modality: 'X-Ray' | 'MRI' | 'Ultrasound';
  studyDate: string;
  imageUrl: string;
  findings: string;
  impression: string;
}

export const SAMPLE_RADIOLOGY_STUDIES: SampleRadiologyStudy[] = [
  {
    id: 'rad-sample-cxr',
    title: 'PA Thoracic Radiograph — Cardiopulmonary Reference',
    modality: 'X-Ray',
    studyDate: '2026-11-18',
    imageUrl: sampleChestImg,
    findings:
      'Expanded symmetric lung fields without focal lobar consolidation or pleural effusion. Cardiothoracic ratio within normal limits; crisp costophrenic angles and intact osseous ribcage.',
    impression:
      'Normal baseline PA chest radiograph. Suitable for comparative Z.AI Vision inspection.'
  },
  {
    id: 'rad-sample-mri',
    title: 'Axial T2-Weighted Brain MRI — Parenchymal Reference',
    modality: 'MRI',
    studyDate: '2026-11-15',
    imageUrl: sampleBrainImg,
    findings:
      'Symmetric cerebral hemispheres with preserved gray-white differentiation. Midline structures unshifted; ventricular caliber and basal cisterns are normal.',
    impression:
      'Unremarkable axial T2-weighted neuro-imaging reference study.'
  },
  {
    id: 'rad-sample-echo',
    title: '2D Color Doppler Echocardiogram — Apical Four-Chamber',
    modality: 'Ultrasound',
    studyDate: '2026-11-12',
    imageUrl: sampleEchoImg,
    findings:
      'Four cardiac chambers clearly visualized with laminar color Doppler inflow across atrioventricular valves and preserved ventricular wall motion.',
    impression:
      'Demonstrates Doppler flow mapping for valvular and chamber evaluation.'
  }
];

export const MEDICATIONS_CATALOG: MedicationCatalogItem[] = [
  {
    id: 'med-apixaban',
    genericName: 'Apixaban',
    brandNames: ['Eliquis'],
    drugClass: 'Direct Factor Xa Inhibitor (DOAC)',
    indications:
      'Stroke prophylaxis in nonvalvular atrial fibrillation; DVT/PE treatment and secondary prevention.',
    adultDosing: '5 mg PO BID (2.5 mg BID if >=2 of: age >=80, weight <=60 kg, SCr >=1.5 mg/dL).',
    warnings:
      'Increased risk of major bleeding; avoid premature discontinuation without bridging due to thrombotic rebound.',
    interactions: ['Ketoconazole', 'Rifampin', 'Carbamazepine', 'Clopidogrel', 'Ibuprofen'],
    renalAdjustment: 'Avoid in ESRD on dialysis unless specific protocol; monitor CrCl.'
  },
  {
    id: 'med-empagliflozin',
    genericName: 'Empagliflozin',
    brandNames: ['Jardiance'],
    drugClass: 'SGLT2 Inhibitor',
    indications:
      'Type 2 diabetes mellitus, HFrEF/HFpEF hospitalization reduction, chronic kidney disease progression delay.',
    adultDosing: '10 mg PO once daily in morning; may increase to 25 mg daily for glycemic control.',
    warnings:
      'Risk of euglycemic diabetic ketoacidosis (hold before major surgery), genital mycotic infections, volume depletion.',
    interactions: ['Furosemide', 'Insulin Glargine', 'Glipizide', 'Hydrochlorothiazide'],
    renalAdjustment: 'Do not initiate for glycemic control if eGFR <30 mL/min/1.73m2; HF benefit persists down to eGFR 20.'
  },
  {
    id: 'med-amoxicillin-clav',
    genericName: 'Amoxicillin / Clavulanate',
    brandNames: ['Augmentin'],
    drugClass: 'Aminopenicillin / Beta-Lactamase Inhibitor',
    indications:
      'Community-acquired pneumonia, acute bacterial rhinosinusitis, complicated UTI, bite wound prophylaxis.',
    adultDosing: '875/125 mg PO q12h with food for 5-10 days depending on source.',
    warnings:
      'Contraindicated in severe penicillin hypersensitivity or prior cholestatic jaundice from amoxicillin-clavulanate.',
    interactions: ['Warfarin', 'Allopurinol', 'Methotrexate', 'Mycophenolate'],
    renalAdjustment: 'CrCl 10-30 mL/min: 500/125 mg q12h; CrCl <10: 500/125 mg q24h.'
  },
  {
    id: 'med-metformin',
    genericName: 'Metformin',
    brandNames: ['Glucophage'],
    drugClass: 'Biguanide Antihyperglycemic',
    indications: 'First-line therapy for Type 2 diabetes mellitus; PCOS insulin resistance.',
    adultDosing: 'Start 500 mg PO daily with evening meal; titrate up to 2000 mg/day divided or ER.',
    warnings:
      'Rare lactic acidosis risk in severe renal impairment, acute hypoxia, or sepsis; monitor vitamin B12 long-term.',
    interactions: ['Iodinated Contrast', 'Cimetidine', 'Dolutegravir', 'Alcohol'],
    renalAdjustment: 'Contraindicated if eGFR <30; avoid initiating if eGFR 30-45.'
  },
  {
    id: 'med-atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: ['Lipitor'],
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    indications: 'ASCVD primary and secondary prevention, hyperlipidemia.',
    adultDosing: '10-20 mg PO daily (moderate intensity) or 40-80 mg daily (high intensity).',
    warnings:
      'Monitor for unexplained myalgia or transaminase elevation; contraindicated in active liver failure or pregnancy.',
    interactions: ['Clarithromycin', 'Cyclosporine', 'Gemfibrozil', 'Itraconazole'],
    renalAdjustment: 'No renal dose adjustment required.'
  },
  {
    id: 'med-warfarin',
    genericName: 'Warfarin',
    brandNames: ['Coumadin'],
    drugClass: 'Vitamin K Antagonist',
    indications: 'Mechanical heart valves, antiphospholipid syndrome, VTE, atrial fibrillation.',
    adultDosing: 'Individualized 2-10 mg PO daily titrated to target INR (typically 2.0-3.0).',
    warnings:
      'Narrow therapeutic index; high bleeding risk; teratogenic; requires routine INR monitoring.',
    interactions: ['Amoxicillin / Clavulanate', 'Amiodarone', 'Fluconazole', 'Rifampin', 'Ibuprofen'],
    renalAdjustment: 'No direct renal clearance, but uremia increases bleeding risk; monitor INR closely.'
  }
];

export const MED_SCHOOL_MCQS: McqQuestionItem[] = [
  {
    id: 'mcq-cardio-1',
    specialty: 'Cardiology',
    difficulty: 'Intermediate',
    stem: 'A 68-year-old man with persistent atrial fibrillation, hypertension, and a history of ischemic stroke presents for anticoagulation review. His eGFR is 58 mL/min/1.73m2 and weight is 78 kg. Which strategy carries the strongest guideline evidence?',
    options: [
      'Aspirin 325 mg daily monotherapy',
      'Direct oral anticoagulant (Apixaban 5 mg BID)',
      'Dual antiplatelet therapy with Aspirin + Clopidogrel',
      'No antithrombotic therapy due to mild renal decline'
    ],
    correctIndex: 1,
    explanation:
      'With a CHA2DS2-VASc score >= 4 (hypertension, age 65-74, prior stroke), full-dose DOAC therapy such as Apixaban 5 mg BID is superior to antiplatelets for stroke prevention and carries lower intracranial hemorrhage risk than warfarin.',
    reference: 'ACC/AHA/ACCP/HRS Atrial Fibrillation Guideline'
  },
  {
    id: 'mcq-neuro-1',
    specialty: 'Neurology',
    difficulty: 'Advanced',
    stem: 'A 54-year-old woman arrives 70 minutes after sudden-onset right hemiplegia and expressive aphasia. Non-contrast head CT shows no hemorrhage or early hypodensity. BP is 172/94 mmHg. What is the immediate priority?',
    options: [
      'Order brain MRI before any therapeutic decision',
      'Administer IV Alteplase or Tenecteplase after excluding contraindications',
      'Rapidly lower systolic BP below 120 mmHg with IV nicardipine',
      'Initiate oral aspirin 300 mg and observe for 6 hours'
    ],
    correctIndex: 1,
    explanation:
      'Within the 4.5-hour window, once non-contrast CT rules out intracranial hemorrhage and BP is below 185/110 mmHg, immediate IV thrombolysis without delaying for MRI preserves ischemic penumbra.',
    reference: 'AHA/ASA Acute Ischemic Stroke Guidelines'
  },
  {
    id: 'mcq-pulm-1',
    specialty: 'Pulmonology',
    difficulty: 'Foundational',
    stem: 'A 31-year-old tall, thin man develops sudden left-sided pleuritic chest pain and dyspnea at rest. Exam shows absent breath sounds and hyperresonance over the left hemithorax. Trachea is midline and BP is 124/76 mmHg. Next diagnostic/therapeutic step?',
    options: [
      'Upright chest radiograph to quantify pneumothorax size',
      'Immediate needle thoracostomy in the 2nd intercostal space',
      'D-dimer assay before imaging',
      'High-resolution spirometry'
    ],
    correctIndex: 0,
    explanation:
      'Because he is hemodynamically stable with a midline trachea, this is a simple primary spontaneous pneumothorax rather than tension pneumothorax; upright CXR confirms and quantifies the rim size to guide observation vs. aspiration.',
    reference: 'BTS Pleural Disease Guideline'
  },
  {
    id: 'mcq-endo-1',
    specialty: 'Endocrinology',
    difficulty: 'Intermediate',
    stem: 'A 46-year-old man on Empagliflozin for Type 2 diabetes presents post-appendectomy with nausea, tachypnea, glucose 168 mg/dL, anion gap 22 mEq/L, and strongly positive serum ketones. What is the most accurate diagnosis?',
    options: [
      'Hyperosmolar hyperglycemic state (HHS)',
      'Euglycemic diabetic ketoacidosis secondary to SGLT2 inhibition',
      'Starvation ketosis without metabolic acidosis',
      'Metformin-induced respiratory alkalosis'
    ],
    correctIndex: 1,
    explanation:
      'SGLT2 inhibitors promote glucosuria, allowing ketoacidosis to develop even when serum glucose remains below 250 mg/dL during surgical stress or fasting.',
    reference: 'ADA Standards of Care in Diabetes'
  }
];

export const MED_SCHOOL_CASES: ClinicalCaseVignette[] = [
  {
    id: 'case-sepsis-1',
    title: 'Occult Urosepsis with Lactate Elevation',
    specialty: 'Critical Care / Internal Medicine',
    difficulty: 'Intermediate',
    vignette:
      '72-year-old woman with type 2 diabetes presents with acute confusion and rigors. Urine dipstick shows 3+ leukocyte esterase and nitrites.',
    vitals: 'BP 88/54 mmHg · HR 118 bpm · Temp 38.9°C · RR 24/min · SpO2 95%',
    keyFinding: 'Serum lactate 3.8 mmol/L with persistent hypotension after initial 500 mL bolus.',
    managementPearl:
      'Obtain blood/urine cultures before broad-spectrum IV antibiotics within 1 hour, complete 30 mL/kg balanced crystalloid resuscitation, and start norepinephrine if MAP remains <65 mmHg.'
  },
  {
    id: 'case-acs-1',
    title: 'Inferior Wall STEMI with Right Ventricular Involvement',
    specialty: 'Cardiology',
    difficulty: 'Advanced',
    vignette:
      '61-year-old man with diaphoresis and substernal pressure radiating to the jaw. ECG demonstrates ST elevations in leads II, III, and aVF with ST elevation in V4R.',
    vitals: 'BP 86/58 mmHg · HR 56 bpm · JVP elevated · Lungs clear bilaterally',
    keyFinding: 'Clear lung fields + hypotension + elevated JVP indicates preload-dependent RV infarction.',
    managementPearl:
      'Avoid nitroglycerin and morphine (preload reduction precipitates severe shock); administer cautious normal saline boluses and activate urgent PCI.'
  }
];

export const MED_SCHOOL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    specialty: 'Cardiology',
    front: 'What ECG pattern differentiates Wellens Syndrome Type A vs. Type B?',
    back: 'Type A shows biphasic T waves in V2-V3 (initially positive, then negative); Type B shows deep, symmetric T-wave inversions in V2-V3 indicating critical proximal LAD stenosis.'
  },
  {
    id: 'fc-2',
    specialty: 'Pharmacology',
    front: 'Which antihypertensive class is contraindicated in bilateral renal artery stenosis and why?',
    back: 'ACE inhibitors / ARBs — efferent arteriolar dilation drops glomerular filtration pressure, risking acute renal failure.'
  },
  {
    id: 'fc-3',
    specialty: 'Neurology',
    front: 'Classic triad of Normal Pressure Hydrocephalus (NPH)?',
    back: 'Gait apraxia ("magnetic gait"), urinary incontinence, and subcortical dementia ("wet, wobbly, and wacky").'
  }
];

export const CLINICAL_GUIDELINES: ClinicalGuidelineItem[] = [
  {
    id: 'guide-cap',
    title: 'Community-Acquired Pneumonia (CAP) Risk Stratification & Empiric Therapy',
    specialty: 'Pulmonology & Infectious Disease',
    organization: 'ATS / IDSA Guideline Consensus',
    year: '2025',
    summary:
      'Outpatient vs. inpatient triage anchored on clinical severity (CURB-65 / PSI), oxygenation, and local macrolide resistance.',
    keyProtocol: [
      'Outpatient healthy adult without comorbidities: Amoxicillin 1 g TID or Doxycycline 100 mg BID.',
      'Outpatient with cardiopulmonary comorbidities: Amoxicillin/Clavulanate + Macrolide (or Doxycycline), or respiratory fluoroquinolone.',
      'Non-severe inpatient: Beta-lactam (Ceftriaxone) + Macrolide (Azithromycin).'
    ],
    uncertaintyNote:
      'Always adjust for prior MRSA/Pseudomonas isolation, recent hospitalization, or renal clearance.'
  },
  {
    id: 'guide-chest-pain',
    title: 'Acute Chest Pain Triage & High-Sensitivity Troponin Pathway',
    specialty: 'Cardiology & Emergency Medicine',
    organization: 'AHA / ACC Chest Pain Guideline',
    year: '2025',
    summary:
      'Rapid 12-lead ECG within 10 minutes paired with serial 0h/1h or 0h/2h high-sensitivity cardiac troponin algorithms.',
    keyProtocol: [
      'Immediate ECG (<10 min) to rule in STEMI or high-risk equivalents (posterior MI, de Winter, Wellens).',
      'Apply HEART score alongside serial hs-cTn delta thresholds for safe early rule-out.',
      'Avoid routine stress testing in low-risk rule-out cohorts without recurrent ischemia.'
    ],
    uncertaintyNote:
      'Atypical presentations occur frequently in elderly, diabetic, and female patients; evaluate non-cardiac life threats (PE, aortic dissection) concurrently.'
  },
  {
    id: 'guide-hypertension',
    title: 'Elevated Blood Pressure & Hypertension Pharmacotherapy Initiation',
    specialty: 'Internal Medicine / Cardiology',
    organization: 'ESC / ACC Hypertension Consensus',
    year: '2025',
    summary:
      'Out-of-office ABPM/HBPM confirmation paired with early low-dose single-pill combination therapy for sustained Stage 2 hypertension.',
    keyProtocol: [
      'Confirm sustained elevation with home or 24h ambulatory BP monitoring.',
      'First-line classes: ACEi/ARB, dihydropyridine CCB, or thiazide-like diuretic.',
      'Screen for secondary causes in resistant hypertension or onset <30 years.'
    ],
    uncertaintyNote:
      'Target BP ranges must be individualized in frail elderly patients or severe orthostatic hypotension.'
  }
];
