import sampleChestImg from '../assets/images/sample_chest_radiograph_1795639844971.jpg';
import sampleEchoImg from '../assets/images/sample_cardiac_echo_1795639845130.jpg';

export type EchoLevelId = 'level-1' | 'level-2' | 'level-3' | 'level-4';

export type EchoSceneId =
  | 'KNOBOLOGY'
  | 'PLAX'
  | 'PSAX_AV'
  | 'PSAX_PM'
  | 'A4C'
  | 'A5C_A2C_A3C'
  | 'SUBCOSTAL_IVC'
  | 'SUPRASTERNAL'
  | 'DOPPLER_AS'
  | 'TAMPONADE'
  | 'MCCONNELL';

export interface EchoSessionChapter {
  id: string;
  startSec: number;
  endSec: number;
  titleEn: string;
  titleAr: string;
  narrationEn: string;
  narrationAr: string;
  probeCueEn: string;
  probeCueAr: string;
  keyTakeawayEn: string;
  keyTakeawayAr: string;
}

export interface EchoCutoffMetric {
  parameterEn: string;
  parameterAr: string;
  normalRange: string;
  abnormalThreshold: string;
}

export interface EchoSessionItem {
  id: string;
  number: number;
  level: EchoLevelId;
  durationSeconds: 600;
  scene: EchoSceneId;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  probeWindowEn: string;
  probeWindowAr: string;
  markerClockEn: string;
  markerClockAr: string;
  patientPositionEn: string;
  patientPositionAr: string;
  clinicalSummaryEn: string;
  clinicalSummaryAr: string;
  chapters: EchoSessionChapter[];
  cutoffs: EchoCutoffMetric[];
  pitfallsEn: string[];
  pitfallsAr: string[];
  sources: string[];
  echoImageUrl: string;
  echoFallbackUrl: string;
  radiographImageUrl: string;
  radiographFallbackUrl: string;
  searchQuery: string;
}

export interface EchoSignItem {
  id: string;
  level: EchoLevelId;
  nameEn: string;
  nameAr: string;
  windowTag: string;
  severity: 'Critical' | 'Diagnostic' | 'Quantitative';
  echoFindingEn: string;
  echoFindingAr: string;
  radiographCorrelationEn: string;
  radiographCorrelationAr: string;
  thresholdsEn: string;
  thresholdsAr: string;
  caseExampleEn: string;
  caseExampleAr: string;
  echoImageUrl: string;
  echoFallbackUrl: string;
  radiographImageUrl: string;
  radiographFallbackUrl: string;
  searchQuery: string;
  scene: EchoSceneId;
}

export interface EchoDrillQuestion {
  id: string;
  level: EchoLevelId;
  topicTagEn: string;
  topicTagAr: string;
  stemEn: string;
  stemAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
  reference: string;
}

export interface EchoChecklistStep {
  id: string;
  stepNumber: number;
  categoryEn: string;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
}

export const ECHO_LEVEL_META: Array<{
  id: EchoLevelId;
  badge: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}> = [
  {
    id: 'level-1',
    badge: 'LEVEL 01',
    titleEn: 'Foundations, Physics & Acoustic Windows',
    titleAr: 'المستوى 1: الفيزياء وضبط الجهاز والنوافذ الصوتية',
    descEn: 'Phased-array knobology, ECG gating, probe degrees of freedom, and ergonomic preparation.',
    descAr: 'فيزياء الموجات، ضبط العمق والكسب، التزامن مع تخطيط القلب، وحركات المجس الأساسية.'
  },
  {
    id: 'level-2',
    badge: 'LEVEL 02',
    titleEn: 'Core 2D Transthoracic Views & Chambers',
    titleAr: 'المستوى 2: المقاطع المعيارية 2D وقياس الحجرات',
    descEn: 'Systematic PLAX, PSAX sweeps, A4C/A5C/A2C/A3C, Subcostal IVC, and Suprasternal views.',
    descAr: 'إتقان PLAX وPSAX والمقاطع القمية وتحت الضلعي والوريد الأجوف وفوق القص بدقة.'
  },
  {
    id: 'level-3',
    badge: 'LEVEL 03',
    titleEn: 'Hemodynamics, Spectral Doppler & Valvulopathy',
    titleAr: 'المستوى 3: الدوبلر الطيفي والانبساطية وأمراض الصمامات',
    descEn: 'PW/CW/Color/TDI physics, Bernoulli & Continuity equations, diastology, and stenosis/regurgitation.',
    descAr: 'معادلة برنولي والاستمرارية، تقييم الوظيفة الانبساطية، وتحديد شدة تضيق وارتجاع الصمامات.'
  },
  {
    id: 'level-4',
    badge: 'LEVEL 04',
    titleEn: 'Emergency Echo (RUSH/FATE), CXR Correlation & Closing',
    titleAr: 'المستوى 4: إيكو الطوارئ والربط الشعاعي واختتام التقرير',
    descEn: 'Tamponade, massive PE, aortic dissection, chest X-ray/CT correlation, and 12-point ASE sign-off.',
    descAr: 'الاندحاس القلبي والصمة الرئوية وتسلخ الأبهر والربط مع الأشعة وختام الفحص الاحترافي.'
  }
];

const IMG_ECHO_4CH = 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Echocardiogram_4chambers.jpg';
const IMG_ECHO_TEE = 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Transesophageal_Echocardiogram.png';
const IMG_ECHO_US1 = 'https://upload.wikimedia.org/wikipedia/commons/9/98/Ultrasound_Scan_ND_0110161102_1613260.png';
const IMG_ECHO_US2 = 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Ultrasound_Scan_ND_0110161102_1615580.png';
const IMG_ECHO_US3 = 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Ultrasound_Scan_ND_0110161102_1616110.png';
const IMG_ECHO_US4 = 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ultrasound_Scan_ND_0124110626_1113090.png';
const IMG_ECHO_DOPPLER = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Doppler_ultrasound_in_long-axis_view_of_axillary_and_subclavian_vein_thrombosis_-_annotated.jpg';

const IMG_CXR_PA = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Chest_Xray_PA_3-8-2010.png';
const IMG_CXR_NORMAL = 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Normal_PA_chest_x-ray_%285414485536%29.jpg';
const IMG_CXR_CVC = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Human_chest_x-ray%2C_adult_male%2C_with_central_venous_catheter.jpg';
const IMG_CXR_PNEUMO = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Bilateral_pneumothorax_pneumomediastinum.jpg';

export const ECHO_SESSIONS: EchoSessionItem[] = [
  {
    id: 'echo_s01_knobology',
    number: 1,
    level: 'level-1',
    durationSeconds: 600,
    scene: 'KNOBOLOGY',
    titleEn: 'Session 01: Ultrasound Physics, Phased Array & Knobology',
    titleAr: 'الجلسة 01: فيزياء الإيكو، المجس الطوري، وضبط أزرار الجهاز (Knobology)',
    subtitleEn: '10-Minute Intensive Foundation — Mastering Image Optimization Before Scanning',
    subtitleAr: 'جلسة مكثفة (10 دقائق) — إتقان تحسين الصورة الصوتية قبل وضع المجس على الصدر',
    probeWindowEn: '2–5 MHz Phased-Array Sector Transducer (Small Footprint)',
    probeWindowAr: 'مجس قطاعي طوري (Phased-Array 2–5 MHz) برأس صغير للمسافات الوربية',
    markerClockEn: 'Orient Index Dot to Left of Screen (Standard Cardiology Orientation)',
    markerClockAr: 'توجيه نقطة المؤشر على الشاشة نحو اليمين أو اليسار حسب البروتوكول (معيارياً يسار/يمين القلب في ASE)',
    patientPositionEn: 'Calibration Bench + Left Lateral Decubitus Readiness',
    patientPositionAr: 'تجهيز السرير بوضعية الاستلقاء الجانبي الأيسر مع جهاز تخطيط ثلاثي الأقطاب',
    clinicalSummaryEn:
      'Diagnostic echocardiography begins with physics and machine ergonomics. You will master piezoelectric beam steering, the four probe motions (Slide, Rock/Fan, Sweep/Tilt, Rotate), depth control (2–3 cm past posterior structure), overall gain vs TGC balance, dynamic range (50–65 dB), and ALARA safety indices (MI < 1.9, TI < 1.0).',
    clinicalSummaryAr:
      'يبدأ التشخيص الدقيق بالإيكو من فهم الفيزياء وضبط أزرار الجهاز. في هذه الجلسة المكثفة (10 دقائق) ستتقن خصائص المجس الطوري ذي البصمة الصغيرة لاختراق الأضلاع، الحركات الأربع الدقيقة للمجس (الانزلاق، الإمالة، التأرجح، التدوير)، ضبط العمق بحيث يظهر القلب في ثلثي الشاشة، موازنة الكسب الكلي والتدريجي TGC، ومعايير السلامة الحيوية ALARA.',
    chapters: [
      {
        id: 's01_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Phased-Array Physics & Acoustic Impedance',
        titleAr: 'فيزياء المجس الطوري والممانعة الصوتية',
        narrationEn:
          'Select the low-frequency phased-array probe (2.0–3.5 MHz fundamental; tissue harmonic imaging 1.7/3.4 MHz). Small footprint fits cleanly between ribs. Apply generous warmed ultrasound gel to eliminate air-skin acoustic impedance mismatch (99% reflection at air interfaces).',
        narrationAr:
          'اختر المجس القلبي الطوري بتردد منخفض (2 إلى 5 ميجاهرتز) وتفعيل التصوير التوافقي النسيجي (Harmonic Imaging) لتقليل الضوضاء الجدارية. ضع كمية وافرة من الجل الدافئ لطرد الهواء لأن الهواء يعكس 99% من الموجات الصوتية.',
        probeCueEn: 'Grasp transducer low like a pencil; rest ulnar edge of hand on chest wall for micro-stability.',
        probeCueAr: 'امسك المجس من أسفله كالقلم وثبّت حافة اليد الزندية على جدار الصدر لمنع الاهتزاز.',
        keyTakeawayEn: 'Tissue Harmonic Imaging sharpens endocardial borders & reduces near-field rib reverberation.',
        keyTakeawayAr: 'التصوير التوافقي NTHI يوضح حدود الشغاف ويقلل انعكاسات الأضلاع القريبة.'
      },
      {
        id: 's01_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'The 4 Essential Probe Manipulations',
        titleAr: 'الحركات الأربع الأساسية لتحريك المجس',
        narrationEn:
          'Never move two axes simultaneously. (1) SLIDE changes chest contact point across intercostal spaces. (2) TILT/SWEEP fans the beam perpendicular to the long axis (like windshield wiper). (3) ROCK pivots in the plane of the marker to center structures horizontally. (4) ROTATE twists clockwise/counter-clockwise around the Z-axis (e.g., 90° PLAX → PSAX).',
        narrationAr:
          'القاعدة الذهبية: حرّك محوراً واحداً فقط في كل لحظة! (1) الانزلاق Slide لتغيير المسافة الوربية، (2) الإمالة Sweep/Tilt للمسح عمودياً، (3) التأرجح Rock في مستوى المؤشر لتوسيط الصمام أفقياً، (4) التدوير Rotate بمقدار 60–90 درجة للتحول بين المقاطع.',
        probeCueEn: 'Keep eyes on screen, not your hand; make 1–2 mm micro-adjustments.',
        probeCueAr: 'ركّز عينيك على الشاشة وليس على يدك، واجعل التعديلات مجهرية (1–2 ملم).',
        keyTakeawayEn: 'One axis at a time prevents losing the acoustic window during sweeps.',
        keyTakeawayAr: 'تعديل محور واحد فقط يحافظ على ثبات النافذة الصوتية دون ضياع الصورة.'
      },
      {
        id: 's01_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Depth, Overall Gain, TGC & Focal Zone',
        titleAr: 'ضبط العمق والكسب الكلي ومناطق التركيز',
        narrationEn:
          'Start with deep depth (20–24 cm) in PLAX to spot hidden pleural or pericardial effusions and the descending aorta, then reduce to 14–16 cm so the heart occupies 75% of the sector. Set Focus arrow directly at the valve or structure of interest. Keep TGC sliders near midline; drop near-field sliders slightly to avoid chest wall clutter. Blood chambers must appear jet-black (anechoic), not smoky gray.',
        narrationAr:
          'ابدأ بعمق واسع (20–24 سم) لاكتشاف أي انصباب تاموري أو جنبي عميق، ثم خفّض العمق إلى 14–16 سم لتملأ حجرات القلب 75% من القطاع. ضع سهم التركيز Focus بمستوى الصمام المدروس، واضبط الكسب Gain بحيث يكون الدم داخل الحجرات أسود صافياً دون نقاط رمادية كاذبة.',
        probeCueEn: 'Depth knob FIRST → Sector Width (narrow to boost frame rate >40 fps) → Gain LAST.',
        probeCueAr: 'الترتيب القياسي: العمق أولاً ← تضييق عرض القطاع لرفع الإطارات ← ضبط الكسب أخيراً.',
        keyTakeawayEn: 'Narrowing sector width increases temporal resolution (Frame Rate > 45 Hz) for fast leaflets.',
        keyTakeawayAr: 'تضييق عرض القطاع يرفع سرعة الإطارات (Frame Rate) لرؤية حركة الصمامات السريعة بدقة.'
      },
      {
        id: 's01_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Dynamic Range, Color Gain & Nyquist Limit',
        titleAr: 'المدى الديناميكي وحد نيكويست في الدوبلر الملون',
        narrationEn:
          'Dynamic Range (compression) controls grayscale contrast: 50–60 dB gives crisp wall/valve contrast; too high washes out borders, too low creates harsh black-and-white speckle. For Color Doppler, adjust Color Gain just below random tissue speckle threshold and keep Nyquist velocity scale between 50 and 70 cm/s (default ~60 cm/s) — never lower Nyquist to artificially exaggerate regurgitation.',
        narrationAr:
          'المدى الديناميكي (50–60 ديسيبل) يحدد تباين الرمادي لوضوح الشغاف. في الدوبلر الملون، ارفع Color Gain حتى تظهر نقاط الضجيج خارج الأوعية ثم أنقصه درجة واحدة، واضبط مقياس السرعة (Nyquist Limit) بين 50–70 سم/ث لتجنب تضخيم القلس كاذباً.',
        probeCueEn: 'Remember BART: Blue Away, Red Towards the transducer face.',
        probeCueAr: 'تذكر قاعدة BART: الأزرق مبتعد عن المجس (Blue Away)، والأحمر مقترب نحو المجس (Red Towards).',
        keyTakeawayEn: 'Color box should tightly hug the valve; oversized boxes halve frame rate.',
        keyTakeawayAr: 'اجعل صندوق اللون صغيراً ومحدوداً فوق الصمام فقط حتى لا تنخفض سرعة الإطارات للنصف.'
      },
      {
        id: 's01_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'ECG Gating, Frame Rate & ALARA Safety Check',
        titleAr: 'التزامن القلبي ECG ومعايير السلامة الحرارية ALARA',
        narrationEn:
          'Always attach 3-lead ECG before recording. End-diastole is defined by the frame immediately after mitral valve closure or onset of QRS (R-wave peak); End-systole is the smallest LV cavity or T-wave end. Check Mechanical Index (MI < 1.9, typically 0.8–1.2) and Thermal Index (TI < 1.0). Press Freeze → Cine loop scroll to verify exact cardiac phase before measuring.',
        narrationAr:
          'ثبّت أقطاب تخطيط القلب دائماً قبل أي قياس: نهاية الانبساط توافق بداية موجة QRS أو لحظة انغلاق التاجي، ونهاية الانقباض توافق أصغر قطر للبطين أو نهاية موجة T. راقب مؤشر الأمان الميكانيكي (MI < 1.9) والحراري (TI < 1.0) واستخدم التمرير البطئ Cine-Loop لاختيار الإطار الدقيق.',
        probeCueEn: 'Verify R-wave trigger and store 3-beat loops in atrial fibrillation (never single beat).',
        probeCueAr: 'في الرجفان الأذيني سجّل حلقات من 3–5 نبضات وأخذ المتوسط الحسابي دائماً.',
        keyTakeawayEn: 'Without ECG gating, timing M-mode and LVEF measurements becomes inaccurate.',
        keyTakeawayAr: 'بدون تخطيط ECG يتعذر تحديد لحظة الانقباض والانبساط بدقة لقياسات الكسر القذفي.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Phased Array Frequency',
        parameterAr: 'تردد المجس الطوري',
        normalRange: '2.0 – 5.0 MHz (Harmonic 1.7/3.4)',
        abnormalThreshold: '>7 MHz fails in adult chest depth'
      },
      {
        parameterEn: '2D Frame Rate (Temporal Res)',
        parameterAr: 'معدل الإطارات الزمني',
        normalRange: '40 – 80 frames/sec (≥30 min)',
        abnormalThreshold: '<25 fps misses diastolic fluttering/SAM'
      },
      {
        parameterEn: 'Color Nyquist Scale',
        parameterAr: 'مقياس سرعة الدوبلر الملون',
        normalRange: '50 – 70 cm/sec',
        abnormalThreshold: '<40 cm/s overestimates MR/TR jet area'
      },
      {
        parameterEn: 'ALARA Thermal / Mechanical',
        parameterAr: 'مؤشر السلامة الحراري والميكانيكي',
        normalRange: 'MI < 1.9 · TIS/TIB < 1.0',
        abnormalThreshold: 'Exceeding limits risks cavitation/heating'
      }
    ],
    pitfallsEn: [
      'Excessive overall gain turns anechoic blood bright gray and creates false thrombi ("smoke" artifact).',
      'Scanning at too shallow depth in PLAX misses retrocardiac descending aorta and posterior pericardial fluid.',
      'Lowering Nyquist scale below 40 cm/s artificially inflates color jet area in mild valvular regurgitation.'
    ],
    pitfallsAr: [
      'رفع الكسب الكلي الزائد يحول الدم الأسود إلى رمادي ويوحي بوجود خثرة كاذبة.',
      'العمق القليل في مقطع PLAX يخفي الأبهر النازل والانصباب التاموري الخلفي.',
      'خفض حد نيكويست لأقل من 40 سم/ث يضخم القلس البسيط فيظهر وكأنه قلس شديد.'
    ],
    sources: [
      'Mitchell C, et al. ASE Guidelines for Performing a Comprehensive Transthoracic Echocardiogram (JASE 2019)',
      'Lang RM, et al. ASE/EACVI Recommendations for Cardiac Chamber Quantification (2015)'
    ],
    echoImageUrl: IMG_ECHO_US1,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_NORMAL,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'echocardiogram ultrasound phased array'
  },
  {
    id: 'echo_s02_windows',
    number: 2,
    level: 'level-1',
    durationSeconds: 600,
    scene: 'PLAX',
    titleEn: 'Session 02: Patient Positioning, Ergonomics & 4 Acoustic Windows',
    titleAr: 'الجلسة 02: وضعية المريض والمنافذ الصوتية الأربع القياسية',
    subtitleEn: '10-Minute Roadmap — Navigating Ribs & Lungs to Unlock Every Cardiac Window',
    subtitleAr: 'خريطة طريق (10 دقائق) — تجاوز الأضلاع والرئة لفتح كل نافذة قلبية بوضوح',
    probeWindowEn: 'Parasternal · Apical · Subcostal · Suprasternal Notch',
    probeWindowAr: 'المنافذ: جوار القص · القمي · تحت الضلعي · الثلمة فوق القص',
    markerClockEn: 'Cardiology Convention: Screen Index Mark on Top-Right vs Radiologic Top-Left',
    markerClockAr: 'اصطلاح القلبية: مؤشر الشاشة في أعلى اليمين (عكس سونار البطن الذي يكون في أعلى اليسار)',
    patientPositionEn: 'Steep Left Lateral Decubitus (45–60°), Left Arm Elevated Under Head',
    patientPositionAr: 'استلقاء جانبي أيسر بزاوية 45–60 درجة مع رفع الذراع اليسرى فوق الرأس لتوسيع المسافات الوربية',
    clinicalSummaryEn:
      'Air-filled lung parenchyma is the primary barrier to cardiac ultrasound. Positioning the patient in steep left lateral decubitus shifts the heart leftward against the chest wall, displacing the left lung. We map exact anatomical landmarks for all four transthoracic windows plus respiratory breath-hold maneuvers.',
    clinicalSummaryAr:
      'أكبر عائق في الإيكو هو هواء الرئة الملاصق للقلب. وضعية الاستلقاء الجانبي الأيسر مع وضع اليد اليسرى تحت الرأس تزيح الرئة اليسرى وتُقرب البطين الأيسر من جدار الصدر. تشمل الجلسة خريطة دقيقة للمنافذ الأربعة مع مناورات التنفس لالتقاط أوضح نافذة صوتية.',
    chapters: [
      {
        id: 's02_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Left Lateral Decubitus (LLD) Physics & Ergonomics',
        titleAr: 'ميكانيكية الاستلقاء الجانبي الأيسر وتوسيع الأضلاع',
        narrationEn:
          'Rotate patient 45–60° onto left side; tuck left arm behind head to widen intercostal spaces and drop the left lung laterally. Use a wedge cushion behind shoulder blades. For subcostal and suprasternal views, return patient supine with knees slightly bent to relax the rectus abdominis.',
        narrationAr:
          'أمل المريض 45–60 درجة على جانبه الأيسر واجعل ذراعه اليسرى تحت رأسه؛ هذا يفتح المسافات بين الأضلاع ويلصق القلب بجدار الصدر. للمقطع تحت الضلعي وفوق القص أعد المريض مستلقياً على ظهره مع ثني الركبتين لإرخاء عضلات البطن.',
        probeCueEn: 'Ask patient to hold gentle end-expiration to clear lung overlap over parasternal & apical windows.',
        probeCueAr: 'اطلب من المريض زفيراً هادئاً مع حبس النفس لثوانٍ لإبعاد حافة الرئة عن الحقل الصوتي.',
        keyTakeawayEn: 'End-expiration optimizes Parasternal/Apical; Mid-inspiration drops heart for Subcostal.',
        keyTakeawayAr: 'نهاية الزفير مثالية لجوار القص والقمة؛ بينما الشهيق المتوسط ينزل الحجاب الحاجز في المقطع تحت الضلعي.'
      },
      {
        id: 's02_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Window 1: Parasternal Corridor (3rd–4th LICS)',
        titleAr: 'النافذة 1: الممر جوار القص الأيسر (المسافة الوربية 3–4)',
        narrationEn:
          'Place probe immediately left of the sternum in the 3rd or 4th intercostal space. Avoid rib shadows (anechoic dark vertical bands). If lung obscures the border, slide one space inferiorly or medially toward the sternal edge. Here we acquire PLAX, RV inflow, and all 4 PSAX levels.',
        narrationAr:
          'ضع المجس بمحاذاة الحافة اليسرى لعظم القص في المسافة الوربية الثالثة أو الرابعة. إذا ظهر ظل ضلع أسود عمودي أمل المجس قليلاً أو انزلق مسافة وربية للأسفل. من هذه النافذة نأخذ PLAX وRV inflow ومستويات PSAX الأربعة.',
        probeCueEn: 'Probe marker at 10–11 o’clock (right shoulder) for PLAX; rotate CW to 1–2 o’clock for PSAX.',
        probeCueAr: 'المؤشر باتجاه الساعة 10–11 (الكتف الأيمن) لـ PLAX ثم دوّر 90 درجة مع العقارب نحو الكتف الأيسر لـ PSAX.',
        keyTakeawayEn: 'Right-shoulder alignment mirrors true anatomical LV long axis.',
        keyTakeawayAr: 'توجيه المؤشر نحو الكتف الأيمن يطابق المحور الطولي الحقيقي للبطين الأيسر.'
      },
      {
        id: 's02_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Window 2: Apical Impulse (5th LICS, Mid-to-Anterior Axillary)',
        titleAr: 'النافذة 2: القمة القلبية (المسافة الخامسة، الخط الإبطي الأمامي)',
        narrationEn:
          'Palpate the Point of Maximal Impulse (PMI) first in the 5th ICS along the anterior axillary line (often more lateral and inferior than expected in dilated hearts). Aim probe beam upward and rightward toward the patient’s right scapula to visualize true LV apex without foreshortening.',
        narrationAr:
          'تحسس صدمة القمة PMI أولاً في المسافة الوربية الخامسة عند الخط منتصف الترقوة أو الإبطي الأمامي (تكون أوسع وأسفل في ضخامة القلب). وجّه الحزمة الصوتية للأعلى واليمين نحو لوح الكتف الأيمن لتجنب تقصير القمة (Foreshortening).',
        probeCueEn: 'Marker at 3 o’clock pointing down toward the bed / patient left flank.',
        probeCueAr: 'المؤشر نحو الساعة 3 (باتجاه سرير المريض/الخاصرة اليسرى) للحصول على A4C بالوضعية التشريحية.',
        keyTakeawayEn: 'True apex must remain stationary and bullet-shaped, never rounded or hyper-contractile artificially.',
        keyTakeawayAr: 'القمة الحقيقية لا تتأرجح وتبدو مدببة كالرصاصة؛ التدوير الكروي للقمة يعني قطعاً مائلاً خاطئاً.'
      },
      {
        id: 's02_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Windows 3 & 4: Subcostal & Suprasternal Notch',
        titleAr: 'النافذتان 3 و4: تحت الضلعي والثلمة فوق القص',
        narrationEn:
          'Window 3 (Subcostal): Below xiphoid process, flatten probe angle (<15° to abdomen) using left lobe of the liver as an acoustic bridge; indispensable in COPD/emphysema where hyperinflated lungs block chest windows. Window 4 (Suprasternal): Patient neck hyperextended with towel under shoulders; probe tucked in jugular notch aiming inferiorly for aortic arch.',
        narrationAr:
          'النافذة 3 (تحت الضلعي): تحت الناتئ الرهابي بزاوية مسطحة جداً (<15 درجة) باستخدام الفص الأيسر للكبد كجسر صوتي؛ وهي المنقذ الأساسي لدى مرضى COPD. النافذة 4 (فوق القص): مع بسط الرقبة قليلاً للخلف ومراقبة قوس الأبهر وتفرعاته.',
        probeCueEn: 'Press gently under xiphoid during patient quiet inspiration or bent knees.',
        probeCueAr: 'اطلب ثني الركبتين لإرخاء جدار البطن قبل الضغط اللطيف تحت القص.',
        keyTakeawayEn: 'Always check all 4 windows; difficult parasternal patients often yield crisp subcostal views.',
        keyTakeawayAr: 'لا تُسقط أي نافذة أبداً؛ فغالباً ما تكون النافذة تحت الضلعية مثالية عند فشل الصدرية.'
      },
      {
        id: 's02_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Complete Acquisition Sequence & Radiographic Synergy',
        titleAr: 'التسلسل القياسي الكامل والربط التشريحي مع صورة الصدر',
        narrationEn:
          'Sequence recommended by ASE 2019: (1) PLAX + Color MV/AV + RV inflow/outflow → (2) PSAX AV, MV, Papillary, Apex → (3) Apical 4C/5C/2C/3C + PW/CW/TDI → (4) Subcostal 4C + IVC → (5) Suprasternal Arch. Correlate cardiac silhouette on Chest X-ray (cardiothoracic ratio >0.50) with window shifts.',
        narrationAr:
          'التسلسل المعياري لجمعية الإيكو الأمريكية ASE 2019: (1) PLAX مع الدوبلر ← (2) PSAX المستويات الأربعة ← (3) القمي A4C/5C/2C/3C مع الدوبلر الطيفي والنسيجي ← (4) تحت الضلعي والوريد الأجوف ← (5) فوق القص. اربط دائماً موضع القمة بمظهر القلب على صورة الصدر الشعاعية.',
        probeCueEn: 'Verify screen anatomy matches ASE standard display before archiving loops.',
        probeCueAr: 'تحقق من مطابقة الشاشة لتوجيه ASE القياسي قبل حفظ كل حلقة تشخيصية.',
        keyTakeawayEn: 'Systematic 20-view sequence avoids missed posterior or right-sided pathology.',
        keyTakeawayAr: 'اتباع تسلسل المقاطع العشرين يضمن عدم إغفال أي آفة خلفية أو في القلب الأيمن.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Cardiothoracic Ratio (PA CXR)',
        parameterAr: 'النسبة القلبية الصدرية (CXR)',
        normalRange: '< 0.50 (PA upright)',
        abnormalThreshold: '≥ 0.50 predicts chamber dilation or effusion'
      },
      {
        parameterEn: 'Standard LLD Angle',
        parameterAr: 'زاوية الاستلقاء الجانبي الأيسر',
        normalRange: '45° – 60°',
        abnormalThreshold: 'Supine worsens lung interference over PMI'
      },
      {
        parameterEn: 'Depth Rule of Thumb',
        parameterAr: 'قاعدة العمق القياسية',
        normalRange: '14–16 cm (Heart fills 75%)',
        abnormalThreshold: '<12 cm crops descending aorta & pericardium'
      }
    ],
    pitfallsEn: [
      'Scanning supine when patient can roll left lateral — shrinks apical window by >40%.',
      'Confusing abdominal radiology preset (marker top-left) with cardiac preset (marker top-right), flipping A4C LV/RV!',
      'Pressing perpendicularly straight down at the subcostal xiphoid instead of aiming shallowly toward the left shoulder.'
    ],
    pitfallsAr: [
      'الفحص والمريض مستلقٍ على ظهره رغم قدرته على الميل الجانبي الأيسر مما يضيع النوافذ القمية.',
      'الخطأ في إعداد الجهاز (اختيار Abdominal Preset بدل Cardiac Preset) مما يعكس اليسار باليمين على الشاشة!',
      'الضغط عمودياً للأسفل تحت القص بدل توجيه المجس بشكل مسطح نحو الكتف الأيسر.'
    ],
    sources: [
      'ASE Guidelines for Comprehensive TTE 2019 (Section 2: Exam Ergonomics & Windows)',
      'Otto CM. Textbook of Clinical Echocardiography, 7th Ed.'
    ],
    echoImageUrl: IMG_ECHO_US2,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'transthoracic echocardiography acoustic window'
  },
  {
    id: 'echo_s03_plax',
    number: 3,
    level: 'level-2',
    durationSeconds: 600,
    scene: 'PLAX',
    titleEn: 'Session 03: Parasternal Long-Axis (PLAX) — Anatomy & Measurements',
    titleAr: 'الجلسة 03: المقطع الطولي جوار القص PLAX — التشريح والقياسات المعيارية',
    subtitleEn: '10-Minute Deep Dive — RVOT, Aortic Root, LA, LV Wall Thickness, EPSS & Desc Ao',
    subtitleAr: 'غوص عميق (10 دقائق) — جذر الأبهر، الأذين الأيسر، السماكات الجدارية، EPSS والأبهر النازل',
    probeWindowEn: '3rd–4th Left Intercostal Space, Sternum Border',
    probeWindowAr: 'المسافة الوربية اليسرى الثالثة أو الرابعة ملاصقاً للقص',
    markerClockEn: '10–11 O’Clock (Pointing Directly Toward Patient Right Shoulder)',
    markerClockAr: 'الساعة 10–11 (باتجاه الكتف الأيمن للمريض مباشرة)',
    patientPositionEn: 'Left Lateral Decubitus · Gentle End-Expiration',
    patientPositionAr: 'الاستلقاء الجانبي الأيسر مع حبس الزفير اللطيف',
    clinicalSummaryEn:
      'PLAX is the foundational view of every echo exam. You must display the RVOT anteriorly, ascending aorta/LVOT/MV/LA centrally, true perpendicular interventricular septum and posterior wall, and the circular descending thoracic aorta posteriorly — the anatomical landmark separating pericardial from pleural effusions.',
    clinicalSummaryAr:
      'يُعد مقطع PLAX حجر الأساس لكل فحص إيكو. سنستعرض كيف تضبط المقطع ليُظهر مخرج البطين الأيمن أمامياً، الصمامين الأبهري والتاجي بدقة في المنتصف، الحجاب بين البطينين والجدار الخلفي بشكل عمودي تماماً على الحزمة، والأبهر النازل في الخلف كعلامة فاصلة بين الانصباب التاموري والجنبي.',
    chapters: [
      {
        id: 's03_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Ideal PLAX Checklist: Alignment & Structures',
        titleAr: 'قائمة التحقق لمقطع PLAX المثالي الخالي من التشوه',
        narrationEn:
          'Verify all 6 landmarks: (1) RVOT at top (anterior); (2) Aortic valve cusps (Right coronary cusp anterior, Non-coronary cusp posterior) opening cleanly to walls; (3) Mitral valve AML/PML opening; (4) Interventricular septum horizontal and non-foreshortened (no apex visible!); (5) Left atrium inferior-posterior; (6) Circular descending aorta behind the AV groove.',
        narrationAr:
          'تحقق من المعالم الستة: (1) مخرج البطين الأيمن بالأعلى، (2) الصمام الأبهري (الوريقة الإكليلية اليمنى أماماً واللاإكليلية خلفاً)، (3) الصمام التاجي بوريقتيه، (4) الحجاب والبطين بشكل أفقي مستوٍ دون ظهور القمة، (5) الأذين الأيسر، (6) الأبهر النازل الدائري خلف الثلم الأذيني البطيني.',
        probeCueEn: 'If apex enters left side of screen, you are too inferior — slide probe UP one rib space.',
        probeCueAr: 'إذا ظهرت القمة على يسار الشاشة فأنت منخفض جداً؛ اصعد بالمجس مسافة وربية للأعلى.',
        keyTakeawayEn: 'True LV apex should NEVER appear in a diagnostic PLAX measurement plane.',
        keyTakeawayAr: 'القمة الحقيقية للبطين لا يجب أن تظهر إطلاقاً في مقطع PLAX القياسي.'
      },
      {
        id: 's03_c2',
        startSec: 120,
        endSec: 270,
        titleEn: '2D Linear Measurements (End-Diastole vs End-Systole)',
        titleAr: 'القياسات الخطية 2D عند نهاية الانبساط والانقباض',
        narrationEn:
          'Per ASE 2015/2019, prefer direct 2D calipers perpendicular to the LV long axis just below the mitral leaflet tips (over M-mode if off-axis). At End-Diastole (R-peak / MV closure): IVSd (0.6–1.0 cm), LVIDd (4.2–5.8 cm M / 3.8–5.2 cm F), LVPWd (0.6–1.0 cm). At End-Systole (T-wave end / smallest cavity): LVIDs (2.5–4.0 cm) and LA anteroposterior diameter (≤4.0 cm M / ≤3.8 cm F).',
        narrationAr:
          'حسب إرشادات ASE 2019، يُفضّل القياس ثنائي الأبعاد 2D عمودياً على محور البطين تحت ذروة وريقات التاجي: في نهاية الانبساط نقيس IVSd (0.6–1.0 سم) وLVIDd (أقل من 5.8 ذكور / 5.2 إناث) وLVPWd (0.6–1.0 سم). وفي نهاية الانقباض نقيس LVIDs وقطر الأذين الأيسر (≤4.0 سم).',
        probeCueEn: 'Do not include RV septal trabeculations or moderator bands when placing septal caliper.',
        probeCueAr: 'انتبه لعدم إدخال تربيقات البطين الأيمن ضمن سماكة الحجاب بين البطينين أثناء القياس.',
        keyTakeawayEn: 'ASE 2015 replaces single LA AP dimension with LA Volume Index, though PLAX AP remains fast screen.',
        keyTakeawayAr: 'القطر الأمامي الخلفي للأذين الأيسر فحص سريع، لكن القياس المعتمد للحجم هو LAVI القمي.'
      },
      {
        id: 's03_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Aortic Root Inner-to-Inner & Sinus Evaluation',
        titleAr: 'قياس جذر الأبهر وحلقة الأبهري بمحاذاة الأبعاد',
        narrationEn:
          'Zoom PLAX onto the LVOT and aortic root. Measure Aortic Annulus in mid-systole (inner-edge to inner-edge at hinge points: normal 1.8–2.5 cm) for Continuity Equation AVA. Measure Sinuses of Valsalva (leading-edge to leading-edge at end-diastole: normal ≤4.0 cm in men, ≤3.6 cm in women), Sinotubular Junction (STJ), and Proximal Ascending Aorta (1 cm above STJ).',
        narrationAr:
          'كبّر صورة جذر الأبهر (Zoom): قِس الحلقة الأبهرية (Annulus) في منتصف الانقباض من الحافة الداخلية للداخلية (1.8–2.5 سم) لأنها أساسية لحساب مساحة الصمام الأبهري AVA. وقِس جيوب فالسالفا والوصل الجيبي الأنبوبي والأبهر الصاعد عند نهاية الانبساط (طبيعي ≤4.0 سم).',
        probeCueEn: 'Toggle Zoom Box over AV root for exact systolic annulus hinge-point accuracy.',
        probeCueAr: 'استخدم ميزة Zoom التكبير الموضعي على جذر الأبهر لدقة قياس الحلقة بالملليمتر.',
        keyTakeawayEn: '1 mm error in LVOT diameter squares the error in AVA Continuity calculation!',
        keyTakeawayAr: 'خطأ بمقدار 1 ملم في قياس قطر مخرج البطين يضاعف الخطأ تربيعياً في حساب مساحة الصمام!'
      },
      {
        id: 's03_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'M-Mode EPSS & Descending Aorta Effusion Rule',
        titleAr: 'مؤشر EPSS وقاعدة الأبهر النازل للتفريق بين الانصباب التاموري والجنبي',
        narrationEn:
          'Place M-mode cursor through mitral leaflet tips: measure E-Point Septal Separation (EPSS), the minimum distance between anterior mitral leaflet peak E-wave and the interventricular septum. Normal EPSS < 7 mm; EPSS > 10 mm strongly correlates with severe LV systolic dysfunction (EF < 35%). Finally, inspect the descending thoracic aorta behind the LA: fluid ANTERIOR to descending aorta tracking along the AV groove is PERICARDIAL; fluid POSTERIOR to descending aorta is PLEURAL.',
        narrationAr:
          'ضع خط M-Mode عند حافة الوريقة الأمامية للتاجي: المسافة الدنيا بين قمة الموجة E والحجاب تُسمى EPSS (الطبيعي < 7 ملم؛ وأكبر من 10 ملم يدل على ضعف شديد بانقباض البطين الأيسر). وللتفريق بين الانصباب: السائل أمام الأبهر النازل تاموري (Pericardial)، وخلف الأبهر النازل جنبي (Pleural).',
        probeCueEn: 'Check posterior pericardial space at 20 cm depth before zooming in.',
        probeCueAr: 'افحص المسافة خلف الجدار الخلفي على عمق 20 سم قبل التقريب حتى لا يفوتك انصباب خلفي.',
        keyTakeawayEn: 'Anterior to Desc Ao = Pericardial Effusion; Posterior to Desc Ao = Pleural Effusion.',
        keyTakeawayAr: 'أمام الأبهر النازل = انصباب تاموري؛ خلف الأبهر النازل = انصباب جنبي.'
      },
      {
        id: 's03_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Color Doppler AV/MV & RV Inflow Tilts from PLAX',
        titleAr: 'الدوبلر الملون في PLAX وإمالة مدخل البطين الأيمن',
        narrationEn:
          'Turn on Color Doppler over MV and AV simultaneously (check for eccentric AR jet hitting AML or MR jet hugging posterior LA wall). Then tilt probe inferiorly and medially toward right hip while keeping marker at 10 o’clock to obtain the RV Inflow View showing Tricuspid Valve anterior/posterior leaflets and Coronary Sinus entry — ideal for subtle TR alignment.',
        narrationAr:
          'فعّل الدوبلر الملون فوق الصمامين الأبهري والتاجي لرصد أي قلس. ثم أمل المجس للأسفل والأنسي نحو الورك الأيمن للحصول على مقطع مدخل البطين الأيمن (RV Inflow) لقياس قلس مثلث الشرف وتقييم الجيب الإكليلي.',
        probeCueEn: 'Tilt tail of probe toward left shoulder (beam points right hip) for RV Inflow.',
        probeCueAr: 'أمل ذيل المجس نحو الكتف الأيسر (لتتجه الحزمة للورك الأيمن) لإظهار الصمام مثلث الشرف.',
        keyTakeawayEn: 'Never forget RV inflow tilt — it frequently catches posterior TR jets missed in A4C.',
        keyTakeawayAr: 'إمالة RV Inflow تكشف قلس مثلث الشرف الخلفي الذي قد لا يظهر بوضوح في القمة.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'IVSd / LVPWd Wall Thickness',
        parameterAr: 'سماكة الحجاب والجدار الخلفي',
        normalRange: '0.6 – 1.0 cm (Women ≤0.9)',
        abnormalThreshold: '≥1.1 cm Mild · ≥1.5 cm Asymmetric/HCM'
      },
      {
        parameterEn: 'EPSS (E-Point Septal Separation)',
        parameterAr: 'بعد قمة التاجي عن الحجاب EPSS',
        normalRange: '< 7 mm',
        abnormalThreshold: '> 7 mm Reduced EF · > 10 mm Severe EF <35%'
      },
      {
        parameterEn: 'LA Anteroposterior Diameter',
        parameterAr: 'قطر الأذين الأيسر الأمامي الخلفي',
        normalRange: '2.7 – 4.0 cm (M) / 3.8 cm (F)',
        abnormalThreshold: '> 4.0 cm Dilatation; confirm LAVI'
      },
      {
        parameterEn: 'Sinuses of Valsalva',
        parameterAr: 'جيوب فالسالفا الأبهرية',
        normalRange: '2.9 – 4.0 cm (M) / 3.6 cm (F)',
        abnormalThreshold: '> 4.5 cm Aneurysm · ≥5.5 cm Surgical threshold'
      }
    ],
    pitfallsEn: [
      'Oblique cut makes septum look spuriously thick (>1.2 cm) — correct by moving one rib space higher or lower.',
      'Mistaking the Coronary Sinus (posterior AV groove) or enlarged Descending Aorta for localized pericardial effusion.',
      'Including mitral chordae or RV papillary tissue inside LVIDd caliper measurement.'
    ],
    pitfallsAr: [
      'القطع المائل يوهم بوجود ضخامة كاذبة في الحجاب بين البطينين (>1.2 سم).',
      'الخلط بين الجيب الإكليلي المتوسع والأبهر النازل أو الانصباب التاموري.',
      'إدخال أوتار التاجي أو حليمات البطين الأيمن ضمن قياس قطر البطين الأيسر.'
    ],
    sources: [
      'ASE 2019 TTE Guidelines (Parasternal Long-Axis Standard Acquisitions)',
      'Lang RM, et al. ASE/EACVI Quantitation Update (JASE 2015)'
    ],
    echoImageUrl: IMG_ECHO_US3,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'parasternal long axis echocardiogram LVOT'
  },
  {
    id: 'echo_s04_psax',
    number: 4,
    level: 'level-2',
    durationSeconds: 600,
    scene: 'PSAX_AV',
    titleEn: 'Session 04: Parasternal Short-Axis (PSAX) 4-Level Sweep',
    titleAr: 'الجلسة 04: المقطع القصير جوار القص PSAX — المسح من القاعدة للقمة',
    subtitleEn: '10-Minute Mastery — Mercedes-Benz AV, Mitral Fish-Mouth, Papillary D-Sign & Apex',
    subtitleAr: 'إتقان (10 دقائق) — علامة مرسيدس، فم السمكة، علامة حرف D، وحركية الـ 17 قطعة',
    probeWindowEn: 'Same 3rd–4th LICS Footprint as PLAX',
    probeWindowAr: 'نفس النافذة الوربية لمقطع PLAX دون تحريك الموضع أولاً',
    markerClockEn: '1–2 O’Clock (Clockwise 90° Rotation Toward Patient Left Shoulder)',
    markerClockAr: 'الساعة 1–2 (تدوير 90 درجة مع عقارب الساعة نحو الكتف الأيسر)',
    patientPositionEn: 'Left Lateral Decubitus · Gentle End-Expiration',
    patientPositionAr: 'الاستلقاء الجانبي الأيسر مع حبس الزفير عند الحاجة',
    clinicalSummaryEn:
      'From a centered PLAX, hold position and rotate the transducer 90° clockwise until the marker points to 1–2 o’clock. You will sweep across 4 cross-sectional planes from base to apex: Aortic Valve ("Mercedes-Benz"), Mitral Valve ("Fish-Mouth"), Mid-Ventricular Papillary Muscles (D-sign & WMA), and Apical Cap.',
    clinicalSummaryAr:
      'من موضع PLAX الثابت، دوّر المجس 90 درجة مع عقارب الساعة باتجاه الكتف الأيسر (الساعة 1–2) لتحصل على المقاطع العرضية الأربعة: مستوى الصمام الأبهري (مرسيدس)، مستوى الصمام التاجي (فم السمكة)، مستوى العضلات الحليمية (الحرف D وحركة الجدران)، ومستوى القمة.',
    chapters: [
      {
        id: 's04_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Level A: Aortic Valve & RVOT Sweep ("Mercedes-Benz")',
        titleAr: 'المستوى الأول: الصمام الأبهري ومرسيدس بنز ومخرج البطين الأيمن',
        narrationEn:
          'Tilt superiorly/medially toward the right shoulder. In the center sits the trileaflet Aortic Valve: Right coronary cusp at 12 o’clock, Left coronary cusp at 4 o’clock, Non-coronary cusp at 8 o’clock (diastolic inverted "Mercedes-Benz" Y). Check carefully in systole (not just diastole!) to detect bicuspid aortic valve (football/fish-mouth opening + raphe). Clockwise around AV lie LA, IAS, RA, TV, RVOT, and Main Pulmonary Artery bifurcation.',
        narrationAr:
          'أمل المجس للأعلى والأنسي نحو الكتف الأيمن: يظهر الصمام الأبهري ثلاثي الشرف في المنتصف على شكل شارة مرسيدس في الانبساط (الوريقة اليمنى في الأعلى، اليسرى عند الساعة 4، واللاإكليلية عند 8). تفقّده في الانقباض لنفي الصمام ثنائي الشرف (Bicuspid). يلتف حوله الأذينان والمثلث الشرف ومخرج البطين الأيمن والشريان الرئوي.',
        probeCueEn: 'Do not mistake diastolic pseudo-raphe for bicuspid AV — evaluate cusp separation in peak systole!',
        probeCueAr: 'قِيم عدد الشرف في أقصى الانقباض دائماً وليس الانبساط حتى لا يختلط الرتق برباعي/ثنائي الشرف.',
        keyTakeawayEn: 'PSAX AV is the prime view for Tricuspid Regurgitation jet, Pulmonic Valve, and Bicuspid AV.',
        keyTakeawayAr: 'هذا المقطع مثالي لتشخيص تضيق/ثنائي شرف الأبهري وقلس مثلث الشرف والشريان الرئوي.'
      },
      {
        id: 's04_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Level B: Mitral Valve Level ("Fish-Mouth") & Planimetry',
        titleAr: 'المستوى الثاني: مستوى الصمام التاجي (فم السمكة) وقياس المساحة',
        narrationEn:
          'Sweep beam slightly inferior/lateral from AV. Visualize both mitral leaflets opening symmetrically like a fish mouth (AML anterior, PML posterior). In Mitral Stenosis, use 2D planimetry at the leaflet TIPS in mid-diastole on the smallest orifice frame (Normal MVA 4.0–6.0 cm²; Severe MS ≤ 1.5 cm²).',
        narrationAr:
          'أمل المجس قليلاً للأسفل والأيسر حتى يظهر الصمام التاجي منفتحاً كفم السمكة (الوريقة الأمامية بالأعلى والخلفية بالأسفل). في تضيق التاجي، قِس مساحة الفوهة مباشرة (Planimetry) عند حافة الوريقات في الانبساط (الطبيعي 4–6 سم²؛ الشديد ≤ 1.5 سم²).',
        probeCueEn: 'Ensure true perpendicular cross-section of mitral orifice so LV looks circular, not oval.',
        probeCueAr: 'احرص أن يكون البطين دائرياً تماماً لا بيضوياً قبل تخطيط مساحة التاجي بالمساحة المباشرة.',
        keyTakeawayEn: 'Mid-diastolic fish-mouth planimetry provides direct anatomic MVA independent of flow state.',
        keyTakeawayAr: 'قياس المساحة التخطيطي Planimetry للمحور القصير يعطي المساحة التشريحية مباشرة دون تأثر بالضغط.'
      },
      {
        id: 's04_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Level C: Mid-LV Papillary Level, Regional Wall Motion & D-Sign',
        titleAr: 'المستوى الثالث: العضلات الحليمية، حركية الجدران، وعلامة حرف D',
        narrationEn:
          'Tilt slightly lower to see the Anterolateral (3 o’clock) and Posteromedial (7–8 o’clock) papillary muscles inside a symmetric doughnut-shaped LV. Assess all 6 mid-segments (Anterior, Anteroseptal, Inferoseptal, Inferior, Inferolateral, Anterolateral) for hypokinesia, akinesia, or dyskinesia. Watch septal curvature: flattening in systole = RV pressure overload (PE/PH); flattening in diastole = RV volume overload (ASD/severe TR) forming the "D-Sign".',
        narrationAr:
          'أمل أكثر للأسفل لتظهر العضلتان الحليميتان (الأمامية الوحشية عند الساعة 3 والخلفية الأنسية عند 7–8) داخل بطين دائري متناظر. راقب الجدران الستة لنقص الحركة أو انعدامها. كما يكشف هذا المقطع علامة حرف D: تسطح الحجاب في الانقباض (فرط حمل ضغطي كالصمة الرئوية) أو في الانبساط (فرط حمل حجمي كالفتحة الأذينية).',
        probeCueEn: 'Both papillary muscles should appear symmetric; avoid tilting obliquely which turns circle into egg.',
        probeCueAr: 'يجب أن تظهر العضلتان الحليميتان متناظرتين؛ الشكل البيضوي يعني قطعاً مائلاً.',
        keyTakeawayEn: 'Systolic D-sign = RV Pressure Overload; Diastolic D-sign = RV Volume Overload.',
        keyTakeawayAr: 'علامة D الانقباضية = فرط ضغط البطين الأيمن؛ علامة D الانبساطية = فرط حجم البطين الأيمن.'
      },
      {
        id: 's04_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Level D: Apical Sweep & Apical Thrombus Check',
        titleAr: 'المستوى الرابع: مسح القمة والبحث عن الخثرات القمية',
        narrationEn:
          'Sweep beam further infero-laterally (or slide probe down 1 rib space if needed) toward the LV apex (4 segments: Anterior, Septal, Inferior, Lateral). Crucial after anterior STEMI to rule out laminated apical thrombus, LV non-compaction trabeculations, or true vs pseudo-aneurysm.',
        narrationAr:
          'امسح حتى نهاية القمة القلبية (4 قطع: أمامية، حاجزية، سفلية، جانبية). هذا المستوى حاسم بعد احتشاء الجدار الأمامي للبحث عن خثرة قمة البطين (Apical Thrombus) أو أم الدم البطينية الكاذبة.',
        probeCueEn: 'Toggle higher frequency or focus arrow shallowly onto the apex to resolve thrombus vs trabecula.',
        probeCueAr: 'ضع سهم التركيز Focus عند القمة لتمييز الخثرة الحديثة عن التربيقات الطبيعية.',
        keyTakeawayEn: 'Every coronary territory (LAD, LCx, RCA) appears simultaneously in the PSAX mid-papillary ring.',
        keyTakeawayAr: 'تظهر تروية الشرايين الإكليلية الثلاثة (LAD وLCx وRCA) مجتمعة في حلقة واحدة عند العضلات الحليمية.'
      },
      {
        id: 's04_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Color Doppler Over MPA & Bifurcation (PDA Screen)',
        titleAr: 'تقييم الشريان الرئوي وتفرعه والبحث عن القناة الشريانية السالكة',
        narrationEn:
          'Return to PSAX-AV base and tilt slightly superior/left to lengthen the Main Pulmonary Artery (MPA) into Left & Right Pulmonary Arteries ("Trousers sign"). Drop Color Doppler into the MPA to look for high-velocity retrograde systolic-diastolic mosaic flow from PDA or pulmonic regurgitation.',
        narrationAr:
          'عد لمستوى قاعدة الأبهر وأمل المجس قليلاً للأعلى واليسار لتتبع جذع الشريان الرئوي وتفرعه الأيمن والأيسر، وضع الدوبلر الملون لنفي بقاء القناة الشريانية المفتوحة (PDA) أو تضيق/قلس الرئوي.',
        probeCueEn: 'Look for diastolic red flame entering MPA from lateral bifurcation (classic PDA jet).',
        probeCueAr: 'ابحث عن شرارة حمراء راجعة داخل الشريان الرئوي تدل على قناة شريانية سالكة.',
        keyTakeawayEn: 'Smooth base-to-apex PSAX sweeping separates true regional WMA from global cardiomyopathy.',
        keyTakeawayAr: 'المسح السلس من القاعدة للقمة يفرق بين نقص الحركة الموضعي الاحتشائي والاعتلال العضلي الشامل.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Normal Mitral Valve Area',
        parameterAr: 'مساحة الصمام التاجي الطبيعية',
        normalRange: '4.0 – 6.0 cm²',
        abnormalThreshold: '≤ 1.5 cm² Severe Mitral Stenosis'
      },
      {
        parameterEn: 'Eccentricity Index (D-Sign)',
        parameterAr: 'مؤشر الانحراف الحجابي (حرف D)',
        normalRange: 'LV D2/D1 Ratio ~ 1.0',
        abnormalThreshold: '> 1.1 confirms RV Pressure/Volume overload'
      },
      {
        parameterEn: 'PA Acceleration Time (PW in RVOT)',
        parameterAr: 'زمن تسارع الشريان الرئوي PAAT',
        normalRange: '> 130 ms',
        abnormalThreshold: '< 105 ms PH suspected · < 60 ms + Notch = Severe Acute PE'
      }
    ],
    pitfallsEn: [
      'Calling a calcified trileaflet AV "bicuspid" on diastole alone — ALWAYS confirm systolic opening geometry.',
      'Measuring eccentric oval cross-section as increased wall thickness or reduced eccentricity.',
      'Missing apical thrombi by stopping the sweep at mid-papillary level.'
    ],
    pitfallsAr: [
      'تشخيص الصمام الأبهري المتكلس على أنه ثنائي الشرف اعتماداً على صورة الانبساط فقط.',
      'القطع البيضوي المائل يوهم بوجود سماكة كاذبة أو تسطح كاذب في الحجاب.',
      'التوقف عند مستوى العضلات الحليمية وإهمال مسح قمة البطين مما يُضيع الخثرات القمية.'
    ],
    sources: [
      'ASE 2019 TTE Comprehensive Examination (Parasternal Short-Axis Sweeps)',
      'Cerqueira MD, et al. AHA 17-Segment Myocardial Segmentation Model'
    ],
    echoImageUrl: IMG_ECHO_US4,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'parasternal short axis mitral papillary echocardiogram'
  },
  {
    id: 'echo_s05_a4c',
    number: 5,
    level: 'level-2',
    durationSeconds: 600,
    scene: 'A4C',
    titleEn: 'Session 05: Apical Four-Chamber (A4C) — Biplane LVEF & Right Heart',
    titleAr: 'الجلسة 05: المقطع القمي رباعي الحجرات A4C — الكسر القذفي والقلب الأيمن',
    subtitleEn: '10-Minute Core Lab — True Apex, Simpson Biplane EF, GLS, TAPSE & RV Basal Index',
    subtitleAr: 'مختبر (10 دقائق) — تجنب التقصير، حساب LVEF سيمبسون، وحركية البطين الأيمن TAPSE',
    probeWindowEn: '5th Intercostal Space, Apical Impulse (PMI)',
    probeWindowAr: 'المسافة الوربية الخامسة عند صدمة القمة (PMI)',
    markerClockEn: '3 O’Clock (Pointing Toward Patient Left Flank / Bed)',
    markerClockAr: 'الساعة 3 (باتجاه خاصرة المريض اليسرى / السرير)',
    patientPositionEn: 'Steep Left Lateral Decubitus · Gentle End-Expiration',
    patientPositionAr: 'استلقاء جانبي أيسر عميق مع حبس الزفير اللطيف',
    clinicalSummaryEn:
      'A4C displays all four chambers vertically with the LV and LA on the right of the display and RV and RA on the left. You will learn to eliminate foreshortening, trace Biplane Simpson’s endocardial borders accurately, and capture dedicated RV-focused A4C measurements (TAPSE, FAC, RV S’).',
    clinicalSummaryAr:
      'يُظهر المقطع القمي رباعي الحجرات A4C البطين والأذين الأيسرين على يمين الشاشة والأيمنين على يسارها. ستتعلم كشف وتصحيح تقصير القمة (Foreshortening)، رسم حدود الشغاف لحساب الكسر القذفي بطريقة سيمبسون ثنائية المستوى، وتوجيه التركيز نحو البطين الأيمن لقياس TAPSE وS\'.',
    chapters: [
      {
        id: 's05_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Acquiring True Non-Foreshortened A4C',
        titleAr: 'الحصول على مقطع قمي حقيقي خالٍ من التقصير',
        narrationEn:
          'Place probe directly over palpable PMI, marker at 3 o’clock, pointing beam toward the right shoulder blade. Check alignment: Interatrial & Interventricular septa should stand vertically down the center. If the LV apex is rounded and hyper-contractile moving across the screen, you are too medial/high — slide one space LOWER and LATERAL.',
        narrationAr:
          'ضع المجس على صدمة القمة PMI والمؤشر عند الساعة 3، ووجّه الحزمة نحو الكتف الأيمن. يجب أن يقف الحجاب بين البطينين والأذينين عمودياً في المنتصف. إذا بدت القمة مدورة وتتحرك بشدة للأمام فأنت مرتفع/أنسي جداً؛ انزل بالمجس مسافة وربية واحدة وللأطراف (أكثر إبطياً).',
        probeCueEn: 'Make LV long-axis longest possible dimension; pulmonary veins should enter posterior LA cleanly.',
        probeCueAr: 'ابحث عن أطول محور طولي للبطين الأيسر مع ظهور مصب الأوردة الرئوية خلف الأذين الأيسر.',
        keyTakeawayEn: 'Foreshortening falsely exaggerates LVEF and misses apical akinesis or thrombi.',
        keyTakeawayAr: 'تقصير القمة يعطي رقماً كاذباً مرتفعاً للكسر القذفي ويُخفي تموّت القمة والخثرات.'
      },
      {
        id: 's05_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'LVEF by Modified Simpson’s Biplane & Wall Segments',
        titleAr: 'حساب الكسر القذفي (LVEF) بطريقة سيمبسون وتقييم القطع',
        narrationEn:
          'ASE mandates Biplane Method of Disks (combining A4C + A2C). Trace the black-white endocardial interface starting at lateral mitral annulus → apex → septal annulus, cutting STRAIGHT across papillary muscles and trabeculations (do not trace around them). Repeat at End-Diastole (EDV) and End-Systole (ESV). Normal LVEF: ≥52% Men, ≥54% Women. Also assess Inferoseptum (RCA) & Anterolateral wall (LCx/LAD).',
        narrationAr:
          'توصي جمعية ASE بحساب LVEF عبر قرص سيمبسون ثنائي المستوى (جمع A4C وA2C): ارسم خط الشغاف الداخلي مع استثناء العضلات الحليمية (قطعها بخط مستقيم) في نهاية الانبساط EDV ونهاية الانقباض ESV. الطبيعي ≥52% للرجال و≥54% للنساء.',
        probeCueEn: 'Never use visual "eyeball" EF alone when borders allow Simpson tracing.',
        probeCueAr: 'لا تكتفِ بالتقدير البصري للـ EF عندما تكون الحدود واضحة؛ ارسم حدود سيمبسون في المقطعين.',
        keyTakeawayEn: 'Always exclude papillary muscles and trabeculations from traced LV cavity borders.',
        keyTakeawayAr: 'تُستثنى العضلات الحليمية والتربيقات من الرسم داخل تجويف البطين عند حساب الحجم.'
      },
      {
        id: 's05_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Left Atrial Volume Index (LAVI) & Atrial Septal Motion',
        titleAr: 'مؤشر حجم الأذين الأيسر LAVI وفحص الحجاب الأذيني',
        narrationEn:
          'Do NOT measure LA volume on the LV-foreshortened plane — tilt/depth-optimize on LA in ventricular END-SYSTOLE (one frame before mitral opening) when LA is at largest volume! Trace LA excluding pulmonary veins and LA appendage, divide biplane volume by BSA: Normal LAVI ≤ 34 mL/m². Severely dilated > 48 mL/m² indicates chronic elevated filling pressure.',
        narrationAr:
          'احسب حجم الأذين الأيسر LAVI عند نهاية انقباض البطين (قبل انفتاح التاجي بإطار واحد حيث يكون الأذين بأكبر حجم)، مع استبعاد الأوردة الرئوية والزائدة الأذينية، وقسمته على مساحة سطح الجسم BSA. الطبيعي ≤ 34 مل/م²؛ وأعلى من 34 يدل على ارتفاع مزمن بضغوط الامتلاء.',
        probeCueEn: 'Remember: LVEF uses LV end-diastole & end-systole; LAVI uses max LA size at LV END-SYSTOLE!',
        probeCueAr: 'انتبه: مؤشر حجم الأذين LAVI يُقاس بأقصى امتلاء للأذين أي في نهاية انقباض البطين.',
        keyTakeawayEn: 'LAVI > 34 mL/m² is the "HbA1c of diastolic dysfunction" reflecting chronic LA pressure.',
        keyTakeawayAr: 'ارتفاع LAVI > 34 مل/م² هو بمثابة السكر التراكمي للوظيفة الانبساطية ويعكس ارتفاع الضغط المزمن.'
      },
      {
        id: 's05_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'RV-Focused A4C: TAPSE, RV S’ & RV Basal Diameter',
        titleAr: 'المقطع الموجه للبطين الأيمن: قياس TAPSE وسرعة S\' وقطر القاعدة',
        narrationEn:
          'Slide/rotate probe slightly laterally until RV base, free wall, and apex are completely open without cutting off the RV lateral wall. (1) M-mode cursor through lateral tricuspid annulus → TAPSE (Normal ≥ 17 mm; < 17 mm = RV systolic dysfunction). (2) Tissue Doppler at lateral annulus → S’ velocity (Normal ≥ 9.5 cm/s). (3) RV basal width ≤ 41 mm at end-diastole (RV should be ≤ 2/3 LV width).',
        narrationAr:
          'امسح قليلاً نحو اليسار لتوسيط البطين الأيمن تماماً (RV-focused A4C). ضع خط M-Mode عبر الحلقة الجانبية لصمام مثلث الشرف لقياس TAPSE (الطبيعي ≥ 17 ملم)، واستخدم الدوبلر النسيجي لقياس سرعة S\' (الطبيعي ≥ 9.5 سم/ث). قطر قاعدة البطين الأيمن الطبيعي ≤ 41 ملم (أصغر من ثلثي البطين الأيسر).',
        probeCueEn: 'Ensure M-mode ultrasound beam aligns parallel to RV lateral free wall excursion.',
        probeCueAr: 'يجب أن يوازي خط M-Mode حركة الجدار الحر للبطين الأيمن تماماً كي لا يقل قياس TAPSE كاذباً.',
        keyTakeawayEn: 'RV > LV width in A4C (Ratio > 1.0) is immediate red flag for acute/chronic cor pulmonale.',
        keyTakeawayAr: 'تجاوز قطر البطين الأيمن لقطر الأيسر (نسبة > 1.0) علامة إنذار لفرط الحمل الرئوي أو الصمة.'
      },
      {
        id: 's05_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'GLS Concept & Color Doppler Across Tricuspid/Mitral Valves',
        titleAr: 'فحص الإجهاد الطولي الكلي GLS والدوبلر الملون في القمة',
        narrationEn:
          'Before exiting A4C, apply Color Doppler separately across the Mitral Valve (for MR/MS) and Tricuspid Valve (for TR Vmax). Finally, when speckle tracking is enabled, ensure frame rate is 50–80 fps across A4C/A2C/A3C for Global Longitudinal Strain (Normal GLS more negative than -18% to -22%; catches subclinical cardiotoxicity before EF drops!).',
        narrationAr:
          'اختم المقطع بتفعيل الدوبلر الملون على التاجي أولاً ثم مثلث الشرف ثانياً لتسجيل أقصى سرعة لارتجاع مثلث الشرف. وفي حال توفر تتبع البقع GLS، تأكد من وضوح الشغاف ومعدل إطارات 50–80 في المقاطع الثلاثة (الطبيعي أكثر سلبية من -18%).',
        probeCueEn: 'Capture 3-chamber apical GLS views at identical heart rate (<10% RR difference).',
        probeCueAr: 'احرص أن يكون نبض القلب متقارباً بين المقاطع القمية الثلاثة قبل حساب GLS.',
        keyTakeawayEn: 'GLS detects chemotherapy cardiotoxicity & infiltrative amyloidosis ("apical sparing") early.',
        keyTakeawayAr: 'يكشف GLS أذية العضلة بالكيماوي مبكراً كما يرسم نمط حفظ القمة "Cherry-on-top" في الداء النشواني.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'LVEF (Simpson Biplane)',
        parameterAr: 'الكسر القذفي سيمبسون ثنائي المستوى',
        normalRange: '≥ 52% (Men) · ≥ 54% (Women)',
        abnormalThreshold: '41–49% Mild · 30–40% Mod · <30% Severe'
      },
      {
        parameterEn: 'TAPSE (M-Mode Lateral TV)',
        parameterAr: 'انزياح حلقة مثلث الشرف TAPSE',
        normalRange: '≥ 17 mm',
        abnormalThreshold: '< 17 mm Indicates RV systolic dysfunction'
      },
      {
        parameterEn: 'RV Lateral TDI S’',
        parameterAr: 'سرعة التقلص النسيجية للبطين الأيمن S\'',
        normalRange: '≥ 9.5 cm/s',
        abnormalThreshold: '< 9.5 cm/s Reduced longitudinal RV function'
      },
      {
        parameterEn: 'LAVI (LA Volume Index)',
        parameterAr: 'مؤشر حجم الأذين الأيسر LAVI',
        normalRange: '≤ 34 mL/m²',
        abnormalThreshold: '> 34 mL/m² Chronic LAP elevation; >48 Severe'
      }
    ],
    pitfallsEn: [
      'Measuring TAPSE on a standard LV view where RV lateral annulus is clipped or oblique (< angle alignment).',
      'Foreshortening the apex makes an EF of 35% look like 50% and obscures apical aneurysms.',
      'Measuring LA volume on an axis tailored to LV rather than dedicated non-foreshortened LA plane.'
    ],
    pitfallsAr: [
      'قياس TAPSE بميلان كبير مما يقلل القيمة عن الواقع ويوحي بضعف كاذب في البطين الأيمن.',
      'تقصير القمة القلبي يجعل كسراً قذفياً 35% يبدو وكأنه 50%!',
      'قياس حجم الأذين الأيسر على محور مقصوص غير مخصص للأذين مما يقلل من قيمته الحقيقية.'
    ],
    sources: [
      'Lang RM, et al. ASE/EACVI Recommendations for Chamber Quantification (2015)',
      'ASE 2019 Guidelines (Apical 4-Chamber & RV-Focused Protocols)'
    ],
    echoImageUrl: IMG_ECHO_4CH,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'echocardiogram apical four chamber view'
  },
  {
    id: 'echo_s06_apical_rotations',
    number: 6,
    level: 'level-2',
    durationSeconds: 600,
    scene: 'A5C_A2C_A3C',
    titleEn: 'Session 06: Apical 5C, 2C, 3C (APLAX) & 17-Segment Territories',
    titleAr: 'الجلسة 06: المقاطع القمية A5C وA2C وA3C وتوزيع التروية الإكليلية',
    subtitleEn: '10-Minute Precision — Smooth 60° Counter-Clockwise Pivots & Wall Motion Scoring',
    subtitleAr: 'دقة (10 دقائق) — التدوير عكس العقارب 60 درجة وربط الـ 17 قطعة بالشرايين الإكليلية',
    probeWindowEn: 'Apical PMI Footprint (Anchor Apex Firmly)',
    probeWindowAr: 'نفس الموضع القمي الثابت دون انزلاق',
    markerClockEn: 'A4C (3 o’clock) → Tilt Anterior (A5C) → Rotate CCW 60° (1 o’clock A2C) → CCW 60° (11 o’clock A3C)',
    markerClockAr: 'من A4C (الساعة 3): إمالة للأمام = A5C ← تدوير عكس العقارب 60° = A2C ← تدوير إضافي 60° = A3C',
    patientPositionEn: 'Left Lateral Decubitus · Gentle Breath Control',
    patientPositionAr: 'استلقاء جانبي أيسر مع ثبات الحجاب الحاجز',
    clinicalSummaryEn:
      'Without removing the probe from the apex, two gentle counter-clockwise rotations unlock the complete 3D geometry of the Left Ventricle. A5C opens the LVOT/AV for Doppler; A2C isolates Anterior and Inferior walls; A3C mimics PLAX from the apex for Anteroseptal and Inferolateral walls.',
    clinicalSummaryAr:
      'من نفس نقطة التماس عند القمة وبحركتي تدوير سلسلتين عكس عقارب الساعة ستكشف كامل الهندسة ثلاثية الأبعاد للبطين الأيسر: المقطع الخماسي A5C لقياس مخرج الأبهر، المقطع ثنائي الحجرات A2C للجدار الأمامي والسفلي، والمقطع ثلاثي الحجرات A3C للجدار الحاجزي الأمامي والخلفي الوحشي.',
    chapters: [
      {
        id: 's06_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Apical 5-Chamber (A5C): Tilting Shallow for LVOT & AV',
        titleAr: 'المقطع الخماسي A5C: إمالة أمامية لقياس تدفق الأبهر ومخرجه',
        narrationEn:
          'Starting from A4C, slightly flatten the probe tail toward the bed so the ultrasound beam tilts anteriorly. The Left Ventricular Outflow Tract (LVOT) and Aortic Valve appear centrally between mitral leaflet and septum. This gives near-0° parallel Doppler alignment with LVOT and aortic outflow (critical for Cardiac Output & Continuity Equation!).',
        narrationAr:
          'من A4C اخفض ذيل المجس قليلاً نحو السرير لتميل الحزمة للأمام فتظهر حجرة مخرج البطين الأيمن والأيسر LVOT والصمام الأبهري بالمنتصف (المقطع الخماسي). هذا المقطع يضع حزمة الدوبلر بموازاة تدفق الدم (زاوية قريبة من 0°) لحساب الـ VTI والنتاج القلبي.',
        probeCueEn: 'Just tilt handle down slightly (tail drops 10–15°); do NOT slide or rotate yet.',
        probeCueAr: 'أمل ذيل المجس للأسفل قليلاً دون تدوير أو انزلاق ليظهر جذر الأبهر.',
        keyTakeawayEn: 'A5C provides primary parallel angle for LVOT VTI and peak Aortic Stenosis velocity.',
        keyTakeawayAr: 'A5C هو المقطع الأساسي لقياس سرعة الأبهري ومخرجه بأقل خطأ زاوية (<20°).'
      },
      {
        id: 's06_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Apical 2-Chamber (A2C): True Orthogonal Wall Check',
        titleAr: 'المقطع القمي ثنائي الحجرات A2C: الجدار الأمامي والسفلي',
        narrationEn:
          'Return to A4C and rotate 60° counter-clockwise (marker ~12–1 o’clock). Verify RV and AV vanish cleanly! Left wall on screen = INFERIOR wall (RCA territory); Right wall on screen = ANTERIOR wall (LAD territory), with LA appendage visible superiorly. Capture A2C loop for the second plane of Biplane Simpson LVEF & LAVI.',
        narrationAr:
          'عد إلى A4C ثم دوّر المجس 60 درجة عكس عقارب الساعة (نحو الساعة 12–1): يختفي البطين الأيمن والأبهر تماماً ويبقى الأذين والبطين الأيسران فقط. الجدار الأيسر في الشاشة هو الجدار السفلي (RCA) والأيمن هو الجدار الأمامي (LAD). هذا هو المستوى الثاني الإلزامي لحساب سيمبسون ثنائي المستوى.',
        probeCueEn: 'If aortic valve or RV edge lingers in A2C, you over-rotated or under-rotated — adjust ±10°.',
        probeCueAr: 'إذا بقي الصمام الأبهري ظاهراً فأنت بالغت بالتدوير ودخلت إلى A3C؛ أعد التدوير قليلاً للخلف.',
        keyTakeawayEn: 'A2C isolates the Inferior wall (often invisible in poor subcostal) and Anterior wall (LAD).',
        keyTakeawayAr: 'A2C هو أفضل مقطع لتقييم احتشاء الجدار السفلي والجدار الأمامي بالوقت نفسه.'
      },
      {
        id: 's06_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Apical 3-Chamber / Long-Axis (A3C / APLAX)',
        titleAr: 'المقطع القمي ثلاثي الحجرات A3C / المحور الطولي القمي',
        narrationEn:
          'Continue rotating counter-clockwise another 60° (total 120° from A4C; marker pointing toward patient right shoulder, ~11 o’clock). You see the exact anatomy of PLAX turned upright! Right wall = ANTEROSEPTAL (LAD); Left wall = INFEROLATERAL/Posterior (LCx/RCA); plus Mitral Valve and LVOT/Aortic Valve aligned vertically for Doppler.',
        narrationAr:
          'أكمل التدوير 60 درجة إضافية عكس العقارب (المجموع 120°؛ المؤشر باتجاه الكتف الأيمن ~11). سترى نفس تشريح PLAX لكن بزاوية قمة القلب عمودياً: الجدار الأيمن هو الحاجزي الأمامي (LAD) والأيسر هو الخلفي الوحشي (LCx/RCA) مع محاذاة ممتازة لصمامي التاجي والأبهري.',
        probeCueEn: 'A3C offers the best acoustic angle for eccentrically directed AR and LVOT SAM jets.',
        probeCueAr: 'يمنح A3C زاوية مثالية لدوبلر القلس الأبهري وضخامة الحاجز الانسدادية HOCM.',
        keyTakeawayEn: 'A3C complements A5C whenever A5C underestimates Aortic Stenosis jet angle.',
        keyTakeawayAr: 'يُعد A3C مكملاً إلزامياً لـ A5C؛ خُذ دائماً أعلى سرعة أبهرية من المقطعين!'
      },
      {
        id: 's06_c4',
        startSec: 420,
        endSec: 540,
        titleEn: '17-Segment Coronary Perfusion Mapping',
        titleAr: 'خريطة التروية الإكليلية للـ 17 قطعة عضلية',
        narrationEn:
          'Memorize the clinical coronary map: LAD feeds Anterior wall (A2C right), Anteroseptal (A3C right), Apical septum, and true Apical Cap (Segment 17). RCA feeds Inferior wall (A2C left), Basal/Mid Inferoseptum (A4C left), and RV free wall. LCx feeds Anterolateral (A4C right) and Inferolateral (A3C left). Score each segment: 1=Normal, 2=Hypokinetic, 3=Akinetic, 4=Dyskinetic.',
        narrationAr:
          'الربط السريري للـ 17 قطعة: يغذي الشريان النازل الأمامي LAD الجدار الأمامي والحاجزي الأمامي والقمة. ويغذي الشريان التاجي الأيمن RCA الجدار السفلي والحجاب السفلي والبطين الأيمن. ويغذي المنعطف LCx الجدارين الجانبي الأمامي والجانبي الخلفي. التقييم: 1 طبيعي، 2 ناقص حركة، 3 عديم حركة، 4 متمدد انقباضياً.',
        probeCueEn: 'Confirm regional wall motion abnormalities in at least two orthogonal echo views.',
        probeCueAr: 'لا تُثبت وجود نقص حركة احتشائي إلا بتأكيده في مقطعين متعامدين على الأقل.',
        keyTakeawayEn: 'Wall Motion Score Index (WMSI = Sum/17) > 1.7 strongly predicts heart failure risk post-MI.',
        keyTakeawayAr: 'ارتفاع مشعر حركية الجدران WMSI لأكثر من 1.7 بعد الجلطة ينذر بارتفاع خطورة قصور القلب.'
      },
      {
        id: 's06_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Contrast Enhancement (UEA) Criteria',
        titleAr: 'معايير استخدام الصبغة الصوتية (Ultrasound Enhancing Agents)',
        narrationEn:
          'Per ASE Contrast Guidelines, administer microbubble Ultrasound Enhancing Agent (e.g., Definity/Lumason) whenever ≥ 2 contiguous myocardial segments are poorly visualized on unenhanced 2D echo, or to definitively rule in/out LV apical thrombus and apical HCM.',
        narrationAr:
          'حسب إرشادات ASE، يُنصح بحقن الفقاعات الدقيقة المحسنة للصدى (UEA) إذا تعذّر رؤية قطعتين متجاورتين أو أكثر بوضوح، أو لتأكيد نفي الخثرة القمية والضخامة القمية.',
        probeCueEn: 'Lower Mechanical Index (MI ~0.15–0.3) during contrast perfusion to prevent bubble destruction.',
        probeCueAr: 'اخفض المؤشر الميكانيكي MI إلى (0.15–0.3) أثناء فحص الصبغة الصوتية لمنع تحطم الفقاعات.',
        keyTakeawayEn: 'Low-MI contrast turns unreadable lungs into razor-sharp endocardial borders.',
        keyTakeawayAr: 'الصبغة الصوتية بمنخفض MI تحوّل الفحص المبهم إلى حدود شغافية فائقة الوضوح.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Normal Apical 2C / 3C Angles',
        parameterAr: 'زوايا التدوير القمية المعيارية',
        normalRange: 'A4C 0° → A2C 60° CCW → A3C 120° CCW',
        abnormalThreshold: 'Mixed RV/AV in A2C = wrong rotation plane'
      },
      {
        parameterEn: 'Wall Motion Score Index (WMSI)',
        parameterAr: 'مؤشر حركية الجدران WMSI',
        normalRange: '1.00 (All 17 segments = 1)',
        abnormalThreshold: '> 1.00 Regional WMA; > 1.7 Severe Infarct Burden'
      },
      {
        parameterEn: 'LVOT VTI (A5C / A3C)',
        parameterAr: 'تكامل السرعة الزمني LVOT VTI',
        normalRange: '18 – 22 cm',
        abnormalThreshold: '< 15 cm Low-Flow State; Stroke Vol < 35 mL/m²'
      }
    ],
    pitfallsEn: [
      'Rotating probe clockwise instead of counter-clockwise when going from A4C to A2C.',
      'Sliding away from apex during rotation, changing LV center axis.',
      'Recording LVOT Doppler from A5C while angle exceeds 20° — underestimates true velocity.'
    ],
    pitfallsAr: [
      'تدوير المجس مع عقارب الساعة بالخطأ بدل عكس عقارب الساعة عند الانتقال من A4C إلى A2C.',
      'انزلاق المجس عن موضع القمة أثناء التدوير مما يشوه المحور الحقيقي.',
      'أخذ سرعة الدوبلر بزاوية ميل أكبر من 20 درجة مما ينقص السرعة المقاسة عن الحقيقة.'
    ],
    sources: [
      'ASE 2019 Comprehensive TTE Guidelines (Apical Rotation Sequence)',
      'Porter TR, et al. ASE Guidelines for Ultrasonic Enhancing Agents (2018)'
    ],
    echoImageUrl: IMG_ECHO_TEE,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_NORMAL,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'apical two chamber three chamber echocardiogram'
  },
  {
    id: 'echo_s07_subcostal_suprasternal',
    number: 7,
    level: 'level-2',
    durationSeconds: 600,
    scene: 'SUBCOSTAL_IVC',
    titleEn: 'Session 07: Subcostal 4C, IVC RAP Rules & Suprasternal Notch',
    titleAr: 'الجلسة 07: المقطع تحت الضلعي، تقدير ضغط الأذين بالـ IVC، وفوق القص',
    subtitleEn: '10-Minute Hemodynamic Map — Hepatic Acoustic Window, Volume Status & Aortic Arch',
    subtitleAr: 'خريطة (10 دقائق) — نافذة الكبد، تقييم السوائل والـ RAP، وقوس الأبهر وتسلخه',
    probeWindowEn: 'Subxiphoid Epigastrium & Jugular Suprasternal Notch',
    probeWindowAr: 'أسفل الناتئ الرهابي (فوق الكبد) والثلمة الوداجية فوق القص',
    markerClockEn: 'Subcostal 4C: 3 o’clock (Left) → Rotate 90° CCW to 12 o’clock for IVC',
    markerClockAr: 'تحت الضلعي 4C: الساعة 3 ← تدوير 90° عكس العقارب إلى الساعة 12 (باتجاه الرأس) للوريد الأجوف IVC',
    patientPositionEn: 'Supine with Knees Flexed (Relax Abdominal Wall)',
    patientPositionAr: 'استلقاء على الظهر مع ثني الركبتين لإرخاء عضلات البطن',
    clinicalSummaryEn:
      'Master the two forgotten views that rescue critical patients. Subcostal 4C uses the liver to interrogate the atrial septum perpendicularly (for ASD/PFO), RV free wall thickness (<5 mm normal), and pericardial fluid. Rotating 90° displays the longitudinal IVC for exact Right Atrial Pressure (RAP: 3, 8, or 15 mmHg), followed by Suprasternal Aortic Arch imaging.',
    clinicalSummaryAr:
      'إتقان المقطعين المنقذين للحالات الحرجة: المقطع تحت الضلعي الذي يستخدم الكبد كعدسة لفحص الحجاب الأذيني عمودياً ونفي التامور، ثم تدويره 90 درجة لعرض الوريد الأجوف السفلي IVC وتقدير ضغط الأذين الأيمن (3 أو 8 أو 15 ملم زئبق)، ثم مقطع فوق القص لقوس الأبهر.',
    chapters: [
      {
        id: 's07_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'Subcostal 4-Chamber & Interatrial Septum Perpendicularity',
        titleAr: 'المقطع تحت الضلعي رباعي الحجرات وفحص الحجاب الأذيني',
        narrationEn:
          'Lay probe almost flat (<15° above skin) 2 cm below xiphoid, marker at 3 o’clock, pointing beam under ribcage toward the left shoulder. Because the Interatrial Septum lies perpendicular to this beam, subcostal 4C eliminates "fossa ovalis dropout" seen in A4C and is the gold standard to spot Secundum ASD or PFO.',
        narrationAr:
          'اجعل المجس مسطحاً تقريباً (<15 درجة) تحت الناتئ الرهابي بـ 2 سم والمؤشر عند الساعة 3 متجهاً للكتف الأيسر. هنا يقف الحجاب بين الأذينين متعامداً مع الحزمة، مما يمنع "ثقوب التلاشي الكاذبة" ويعد المعيار الذهبي لكشف الفتحة بين الأذينين ASD.',
        probeCueEn: 'Have patient bend knees and take a gentle sniff-hold (mid-inspiration lowers heart to liver window).',
        probeCueAr: 'اطلب ثني الركبتين وشهيقاً لطيفاً لإنزال القلب نحو عدسة الكبد.',
        keyTakeawayEn: 'Subcostal 4C is the ONLY view where thin fossa ovalis doesn’t cause false echo dropout.',
        keyTakeawayAr: 'المقطع تحت الضلعي يمنع خطأ التلاشي الصوتي الكاذب في الحفرة البيضوية للحجاب الأذيني.'
      },
      {
        id: 's07_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Subcostal Short-Axis & RV Wall Thickness',
        titleAr: 'المقطع القصير تحت الضلعي وسماكة جدار البطين الأيمن',
        narrationEn:
          'Rotate slightly clockwise or tilt inferiorly/leftward from Subcostal 4C to examine RV free wall thickness in end-diastole (Normal < 5 mm; > 5 mm = RV hypertrophy from chronic pulmonary hypertension vs acute PE where wall remains < 5 mm!). Also serves as fallback LV PSAX in post-sternotomy or severe COPD patients.',
        narrationAr:
          'من المقطع تحت الضلعي يمكنك قياس سماكة الجدار الحر للبطين الأيمن في نهاية الانبساط: الطبيعي أقل من 5 ملم؛ أكثر من 5 ملم يدل على ضخامة مزمنة (مثل فرط التوتر الرئوي المزمن) بينما يبقى < 5 ملم في الصمة الرئوية الحادة.',
        probeCueEn: 'Measure RV free wall cleanly avoiding pericardial fat pad and epicardial borders.',
        probeCueAr: 'احذر من إدخال الدهون التامورية ضمن قياس سماكة البطين الأيمن.',
        keyTakeawayEn: 'RV wall > 5 mm distinguishes chronic pulmonary hypertension from acute massive PE.',
        keyTakeawayAr: 'سماكة البطين الأيمن > 5 ملم تفرق فرط الضغط الرئوي المزمن عن الصمة الرئوية الحادة.'
      },
      {
        id: 's07_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'IVC Long-Axis, Sniff Test & ASE RAP Estimation Rules',
        titleAr: 'تقييم الوريد الأجوف السفلي IVC وقواعد ASE لتقدير ضغط الأذين الأيمن RAP',
        narrationEn:
          'Center RA, rotate 90° CCW (marker 12 o’clock, toward head). Confirm IVC draining straight into RA with hepatic vein junction visible (do not confuse with pulsatile aorta lying left of spine!). Measure IVC diameter 1–2 cm proximal to RA junction at end-expiration and during sharp inspiratory "sniff". ASE Rules: (1) ≤ 2.1 cm & > 50% collapse = RAP 3 mmHg; (2) > 2.1 cm & < 50% collapse = RAP 15 mmHg; (3) Discordant intermediate = RAP 8 mmHg.',
        narrationAr:
          'ثبّت الأذين الأيمن ودوّر 90° عكس العقارب (المؤشر باتجاه الرأس، الساعة 12) لإظهار التقاء IVC والوريد الكبدي بالأذين الأيمن. قِس القطر على بعد 1–2 سم قبل المصب في نهاية الزفير ثم أثناء الشفط المفاجئ (Sniff). القواعد: ≤2.1 سم وانخماص >50% = 3 ملم ز؛ >2.1 سم وانخماص <50% = 15 ملم ز؛ القيم المختلطة = 8 ملم ز.',
        probeCueEn: 'In mechanically ventilated positive-pressure patients, IVC > 2.1 cm stays non-collapsible (cannot rely on sniff).',
        probeCueAr: 'لدى مرضى المنفسة ذات الضغط الإيجابي لا يعتمد على انخماص IVC لتقدير الـ RAP بل يلاحظ ثبات التمدد.',
        keyTakeawayEn: 'Always verify hepatic vein entry into IVC so you never measure the abdominal aorta by mistake!',
        keyTakeawayAr: 'تحقق دائماً من دخول الوريد الكبدي للـ IVC ومصبه بالأذين لتجنب قياس الأبهر البطني خطأً!'
      },
      {
        id: 's07_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Suprasternal Notch (SSN): Aortic Arch & Great Vessels',
        titleAr: 'نافذة الثلمة فوق القص: قوس الأبهر والفروع الكبرى وتضيق البرزخ',
        narrationEn:
          'Place pillow beneath patient’s shoulders, tilt chin slightly up/left. Tuck probe in suprasternal notch with marker pointing 1–2 o’clock (left shoulder/jawline). Trace Ascending Aorta → Transverse Arch (Brachiocephalic, Left Common Carotid, Left Subclavian branches) → Descending Thoracic Aorta ("Candy Cane" view), with circular Right Pulmonary Artery tucked directly underneath the arch.',
        narrationAr:
          'ضع وسادة تحت الكتفين ومدد الرقبة بلطف، ثم ضع المجس في الثلمة فوق القص والمؤشر عند الساعة 1–2. يظهر الأبهر على شكل عصا حلوى: الصاعد، القوس مع تفرعاته الثلاثة (العضدي الرأسي، السباتي الأيسر، تحت الترقوة الأيسر)، والأبهر النازل، وتحت القوس يظهر الشريان الرئوي الأيمن كدائرة.',
        probeCueEn: 'Drop Color & CW Doppler down the descending aorta inside SSN to screen for Coarctation or AR reversal.',
        probeCueAr: 'وجّه الدوبلر نحو الأبهر النازل من هذه النافذة لكشف تضيق برزخ الأبهر أو ارتداد القلس الأبهري الشديد.',
        keyTakeawayEn: 'Holodiastolic flow reversal > 20 cm/s in SSN descending aorta = Severe Aortic Regurgitation.',
        keyTakeawayAr: 'ارتداد الجريان طوال الانبساط (>20 سم/ث) في الأبهر النازل يؤكد شدة القلس الأبهري.'
      },
      {
        id: 's07_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Acute Type A / Type B Aortic Flap Screen',
        titleAr: 'فحص تسلخ الأبهر الحاد (Type A / B) عبر النافذتين',
        narrationEn:
          'Combine PLAX (proximal flap & acute AR), Suprasternal Notch (arch flap extending into head vessels), and Subcostal Abdominal Aorta short/long axis (descending extension) whenever tearing chest-to-back pain presents with widened mediastinum on CXR (>8 cm). Use M-mode through the flap to confirm independent high-frequency chaotic motion vs stationary linear reverberation artifact.',
        narrationAr:
          'في آلام الصدر الممزقة المصحوبة بتوسع المنصف على الأشعة (>8 سم)، اجمع بين PLAX وفوق القص والأبهر البطني تحت الضلعي لرصد السديلة الباطنية المتحركة (Intimal Flap) واضبط M-Mode فوقها للتفريق بينها وبين الخطوط الكاذبة الثابتة.',
        probeCueEn: 'True dissection flap undulates asynchronously with the aortic wall; artifacts stay parallel.',
        probeCueAr: 'سديلة التسلخ الحقيقية ترفرف باستقلالية عن جدار الأبهر بينما تبقى الخيالات الكاذبة موازية تماماً للجدار.',
        keyTakeawayEn: 'Rapid 3-window aorta sweep (PLAX + SSN + Subcostal) diagnoses ascending dissection in < 90 seconds.',
        keyTakeawayAr: 'مسح الأبهر بالثلاثي (PLAX وفوق القص وتحت الضلعي) يكشف تسلخ الأبهر الصاعد خلال أقل من 90 ثانية.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'IVC Normal / Low RAP (3 mmHg)',
        parameterAr: 'ضغط أذين أيمن منخفض/طبيعي (3 mmHg)',
        normalRange: '≤ 2.1 cm & collapses > 50% with sniff',
        abnormalThreshold: 'RAP 3 mmHg (Normal volume status)'
      },
      {
        parameterEn: 'IVC High RAP (15 mmHg)',
        parameterAr: 'ضغط أذين أيمن مرتفع (15 mmHg)',
        normalRange: '> 2.1 cm & collapses < 50% with sniff',
        abnormalThreshold: 'Indicates overload, tamponade, RHF, or PE'
      },
      {
        parameterEn: 'RV Free Wall End-Diastole',
        parameterAr: 'سماكة جدار البطين الأيمن',
        normalRange: '< 5 mm (0.5 cm)',
        abnormalThreshold: '≥ 5 mm RV Hypertrophy (Chronic PH)'
      },
      {
        parameterEn: 'Coarctation CW Gradient (SSN)',
        parameterAr: 'تدرج تضيق برزخ الأبهر',
        normalRange: 'Peak velocity < 1.5 m/s',
        abnormalThreshold: 'Vmax > 2.5–3 m/s + Diastolic Run-off Tail'
      }
    ],
    pitfallsEn: [
      'Measuring the pulsatile Abdominal Aorta instead of IVC (Ao sits left of spine with thick wall & celiac trunk; IVC drains directly into RA).',
      'Mistaking "IVC lateral wall sliding out of plane" during sniff for true lumen collapse — track M-mode + 2D simultaneously.',
      'Skipping Suprasternal Notch in young hypertensive patients, missing Aortic Coarctation.'
    ],
    pitfallsAr: [
      'قياس الأبهر البطني النابض بالخطأ بدلاً من IVC (تأكد من وجود الوريد الكبدي ومصب الأذين الأيمن).',
      'انزياح الـ IVC خارج الحزمة أثناء الشفط العميق مما يوحي بانخماص كاذب؛ راقبه ثنائياً.',
      'إهمال نافذة فوق القص عند الشباب المصابين بارتفاع ضغط الدم مما يفوّت تضيق برزخ الأبهر.'
    ],
    sources: [
      'ASE 2019 Guidelines (Subcostal & Suprasternal Notch Views + IVC RAP Table)',
      'Rudski LG, et al. ASE Guidelines for Echocardiographic Assessment of the Right Heart'
    ],
    echoImageUrl: IMG_ECHO_DOPPLER,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'inferior vena cava subcostal echocardiogram'
  },
  {
    id: 'echo_s08_doppler_diastology',
    number: 8,
    level: 'level-3',
    durationSeconds: 600,
    scene: 'DOPPLER_AS',
    titleEn: 'Session 08: Spectral Doppler, Bernoulli Hemodynamics & Diastology',
    titleAr: 'الجلسة 08: الدوبلر الطيفي، معادلة برنولي، وتقييم الوظيفة الانبساطية',
    subtitleEn: '10-Minute Hemodynamic Core — PW/CW/TDI, PASP Calculation & Nagueh Diastolic Grading',
    subtitleAr: 'المختبر الديناميكي (10 دقائق) — PW وCW وTDI، حساب ضغط الشريان الرئوي وتصنيف الانبساطية',
    probeWindowEn: 'Apical 4-Chamber (MV / TDI) · A5C/A3C (LVOT / AV) · RV Inflow / A4C (TR)',
    probeWindowAr: 'المقطع القمي A4C (التاجي/النسيجي)، A5C (مخرج الأبهر)، ومدخل البطين الأيمن',
    markerClockEn: 'Cursor Parallel to Blood Jet (< 20° Angle Cosine Error < 6%)',
    markerClockAr: 'يجب أن يوازي خط الدوبلر اتجاه جريان الدم بزاوية أقل من 20 درجة دائماً',
    patientPositionEn: 'Left Lateral Decubitus · Quiet End-Expiration for Stable Doppler Baseline',
    patientPositionAr: 'استلقاء جانبي أيسر مع ثبات التنفس لتفادي تذبذب خط الأساس في الدوبلر',
    clinicalSummaryEn:
      'Turn 2D echo into non-invasive cardiac catheterization. Learn exact sample-volume placement for Pulsed-Wave (PW) Doppler, high-velocity Continuous-Wave (CW) interrogation using Simplified Bernoulli (ΔP = 4V²), right-heart systolic pressure (PASP = 4V_TR² + RAP), and the Nagueh 2016 Diastolic Dysfunction grading algorithm (E/A, septal/lateral e’, E/e’, TR Vmax, LAVI).',
    clinicalSummaryAr:
      'هنا يتحول الإيكو إلى قسطرة قلبية غير باضعة: ستتقن وضع بوابة PW بدقة دون التباس السرعات، استخدام CW للسرعات العالية عبر معادلة برنولي المبسطة (ΔP = 4V²)، حساب الضغط الانقباضي للشريان الرئوي PASP، وتطبيق خوارزمية Nagueh الكاملة لتشخيص وتصنيف قصور الانبساط (Grade I, II, III).',
    chapters: [
      {
        id: 's08_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'PW vs CW Doppler Physics & Range Ambiguity',
        titleAr: 'الفرق الفيزيائي بين الدوبلر النبضي PW والمستمر CW والالتباس',
        narrationEn:
          'PW uses a single crystal alternating transmit/receive: gives EXACT anatomic depth localization (e.g., MV leaflet tips or 0.5–1.0 cm proximal to AV in LVOT), but aliases whenever velocity > Nyquist (~1.5–1.8 m/s). CW uses two crystals (continuous Tx + Rx): measures unlimited velocities (e.g., 5 m/s AS jet or TR) without aliasing, but loses depth resolution (records maximum velocity anywhere along the entire line).',
        narrationAr:
          'يستخدم النبضي PW بلورة واحدة بإرسال واستقبال متناوب: يحدد المكان بدقة (حافة التاجي أو داخل LVOT قبل الأبهر بـ 0.5 سم) لكنه ينكسر (Aliasing) فوق ~1.6 م/ث. بينما يستخدم المستمر CW بلورتين لقياس أقصى سرعة مهما ارتفعت (5 م/ث مثلاً) دون انكسار، لكنه يسجل أعلى سرعة على كامل طول الخط.',
        probeCueEn: 'Angle θ MUST stay < 20°; at 60° cosine is 0.50 (massive 50% underestimation!).',
        probeCueAr: 'حافظ على زاوية <20° دائماً؛ الزاوية 60° تفقدك نصف السرعة الحقيقية!',
        keyTakeawayEn: 'PW = Exact Location, Low Velocity (<1.5 m/s). CW = Any Velocity, Entire Line.',
        keyTakeawayAr: 'PW = دقة مكانية للسرعات المنخفضة؛ CW = سرعات عالية غير محدودة على طول الشعاع.'
      },
      {
        id: 's08_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Bernoulli Equation & Non-Invasive PASP Calculation',
        titleAr: 'معادلة برنولي وحساب الضغط الانقباضي للشريان الرئوي PASP',
        narrationEn:
          'Simplified Bernoulli converts peak velocity (V, in m/s) directly into pressure gradient: ΔP = 4V². Example: If Tricuspid Regurgitation CW jet peaks at 3.2 m/s, RV-to-RA systolic gradient = 4 × (3.2)² = 41 mmHg. Add Right Atrial Pressure from IVC (e.g., 8 mmHg) → PASP = 41 + 8 = 49 mmHg (pulmonary hypertension!). Normal TR Vmax ≤ 2.8 m/s.',
        narrationAr:
          'تحوّل معادلة برنولي السرعة (م/ث) إلى تدرج ضغطي (ملم زئبق): ΔP = 4V². مثال عملي: إذا كانت ذروة سرعة قلس مثلث الشرف 3.2 م/ث، فإن التدرج = 4 × (3.2)² = 41 ملم ز، ونضيف ضغط الأذين الأيمن من IVC (مثلاً 8 ملم ز) فيكون PASP = 49 ملم ز. الطبيعي لـ TR Vmax هو ≤ 2.8 م/ث.',
        probeCueEn: 'Do not trace fuzzy "feathery" noise tails ("beard") on CW — trace the dense modal envelope!',
        probeCueAr: 'لا تقس الخيوط الضبابية المتناثرة فوق موجة CW بل ارسم الحافة الكثيفة الواضحة فقط.',
        keyTakeawayEn: 'Always interrogate TR CW jet across A4C, RV Inflow, AND PSAX-AV — report highest clean Vmax.',
        keyTakeawayAr: 'ابحث عن قلس مثلث الشرف في A4C وRV Inflow وPSAX واعتمد أعلى سرعة واضحة الحواف.'
      },
      {
        id: 's08_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Mitral Inflow (E, A, DT) & Tissue Doppler (TDI e’)',
        titleAr: 'تدفق الصمام التاجي (E وA وDT) والدوبلر النسيجي للحلقات (TDI e\')',
        narrationEn:
          'Place 1–3 mm PW sample volume at Mitral Leaflet TIPS in A4C: measure early filling E wave, atrial contraction A wave, E/A ratio (Normal 0.8–2.0), and E-wave Deceleration Time (DT 150–240 ms). Next activate TDI at SEPTAL (Normal e’ ≥ 7 cm/s) and LATERAL (Normal e’ ≥ 10 cm/s) mitral annulus. Calculate Average E/e’ ratio: < 8 normal LAP; > 14 elevated Left Atrial Pressure!',
        narrationAr:
          'ضع بوابة PW (1–3 ملم) عند ذروة وريقات التاجي: قِس الموجة المبكرة E والانقباضية الأذينية A وزمن التباطؤ DT (طبيعي 150–240 مل ث). ثم فعّل الدوبلر النسيجي TDI عند الحلقة الحاجزية (طبيعي e\' ≥ 7 سم/ث) والوحشية (≥ 10 سم/ث). نسبة E/e\' الطبيعية < 8، و> 14 تدل على ارتفاع ضغط الأذين الأيسر.',
        probeCueEn: 'Set sweep speed to 100 mm/s for accurate Deceleration Time slope tracing.',
        probeCueAr: 'اجعل سرعة التمرير 100 ملم/ث عند قياس زمن تباطؤ الموجة E.',
        keyTakeawayEn: 'E/e’ > 14 + TR Vmax > 2.8 m/s + LAVI > 34 mL/m² + reduced e’ = Definitive Diastolic Dysfunction.',
        keyTakeawayAr: 'المعايير الأربعة لتشخيص خلل الانبساط: e\' منخفض، E/e\' > 14، TR > 2.8 م/ث، وLAVI > 34 مل/م².'
      },
      {
        id: 's08_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Nagueh 2016 Grading: Grade I, II & III Diastolic Dysfunction',
        titleAr: 'خوارزمية تصنيف القصور الانبساطي (الدرجة I وII وIII)',
        narrationEn:
          'In patients with reduced EF or >2 positive diastolic criteria: Grade I (Impaired Relaxation, normal LAP): E/A ≤ 0.8 + E ≤ 50 cm/s. Grade II (Pseudonormal, elevated LAP): E/A 0.8–2.0 AND ≥2 of (Avg E/e’ >14, TR Vmax >2.8 m/s, LAVI >34 mL/m²). Grade III (Restrictive, high LAP): E/A ≥ 2.0 + DT < 150 ms. Valsalva lowers E/A in pseudonormal Grade II unmasking underlying stiffness!',
        narrationAr:
          'في حال وجود اعتلال قلبي أو ≥2 معايير: الدرجة I (تأخر ارتخاء بضغط أذيني طبيعي): E/A ≤ 0.8 وE ≤ 50 سم/ث. الدرجة II (طبيعي كاذب بضغط مرتفع): E/A بين 0.8 و2.0 مع ≥2 معايير إيجابية (E/e\' > 14 أو TR > 2.8 أو LAVI > 34). الدرجة III (حاصر شديد): E/A ≥ 2.0 وزمن DT < 150 مل ث.',
        probeCueEn: 'In Grade II vs Normal, E/e’ and LAVI settle the distinction cleanly even without Valsalva.',
        probeCueAr: 'تمييز النمط الطبيعي الحقيقي عن الطبيعي الكاذب (Grade II) يتم فوراً عبر e\' وE/e\' وLAVI.',
        keyTakeawayEn: 'Grade III Restrictive filling (E/A ≥ 2, DT < 150 ms) carries high short-term mortality if irreversible.',
        keyTakeawayAr: 'النمط الحاصر (Grade III) مع زمن تباطؤ <150 مل ث يعني ارتفاعاً حاداً جداً بضغط الامتلاء البطيني.'
      },
      {
        id: 's08_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Pulmonary Vein Flow & Constrictive vs Restrictive Clue',
        titleAr: 'تدفق الأوردة الرئوية وعلامة التهاب التامور العاصر',
        narrationEn:
          'Sample right upper pulmonary vein in A4C: normally Systolic (S) ≥ Diastolic (D) wave. When LAP rises, S blunts (S < D) and Atrial Reversal (Ar) velocity exceeds 35 cm/s. Crucially, if Septal e’ > Lateral e’ ("Annulus Reversus") with >25% respiratory E-wave variation and hepatic vein expiratory diastolic reversal, diagnose Constrictive Pericarditis rather than Restrictive Cardiomyopathy!',
        narrationAr:
          'في الأوردة الرئوية: ارتفاع الضغط الأذيني يُخفض الموجة الانقباضية S عن الانبساطية D (S < D). ونقطة فارقة ذهبية: إذا كان e\' الحاجزي أكبر من e\' الوحشي (Annulus Reversus) مع تباين تنفسي >25% في موجة E فالتشخيص التهاب تامور عاصر وليس اعتلالاً حاصراً!',
        probeCueEn: 'Toggle respirometer trace whenever suspecting Constrictive Pericarditis or Tamponade.',
        probeCueAr: 'فعّل مخطط التنفس في الجهاز عند الشك بالتهاب التامور العاصر أو الاندحاس القلبي.',
        keyTakeawayEn: 'Annulus Reversus (Septal e’ > Lateral e’) + Respiratory Interdependence = Constrictive Pericarditis.',
        keyTakeawayAr: 'علامة انعكاس الحلقة (Septal e\' > Lateral e\') مُميزة لالتهاب التامور العاصر.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'E/e’ Average Ratio (LAP)',
        parameterAr: 'نسبة E/e\' لقياس ضغط الأذين الأيسر',
        normalRange: '< 8 (Septal e’ ≥7, Lateral e’ ≥10 cm/s)',
        abnormalThreshold: '> 14 Elevated Left Atrial Pressure'
      },
      {
        parameterEn: 'TR Vmax & PASP Estimate',
        parameterAr: 'سرعة قلس مثلث الشرف وPASP',
        normalRange: 'TR Vmax ≤ 2.8 m/s (PASP < 36 mmHg)',
        abnormalThreshold: '> 2.8 m/s Pulmonary Hypertension Likelihood'
      },
      {
        parameterEn: 'Restrictive Mitral Inflow',
        parameterAr: 'النمط الانبساطي الحاصر (Grade III)',
        normalRange: 'E/A 0.8–2.0 · DT 150–240 ms',
        abnormalThreshold: 'E/A ≥ 2.0 + DT < 150 ms Severe High LAP'
      }
    ],
    pitfallsEn: [
      'Placing TDI sample volume inside LV blood pool instead of solid mitral annulus myocardium.',
      'Measuring E/e’ in Severe Mitral Annular Calcification (MAC) or prosthetic MV (use alternative indices).',
      'Misidentifying Pulmonary Hypertension absent when severe free-flow TR equalizes RA/RV pressures quickly.'
    ],
    pitfallsAr: [
      'وضع بوابة الدوبلر النسيجي TDI في الدم بدل وضعها في نسيج الحلقة التاجية العضلي.',
      'اعتماد E/e\' لدى مرضى تكلس الحلقة التاجية الشديد أو الصمام التاجي الصناعي.',
      'أخطاء تقليل سرعة قلس مثلث الشرف عند عدم فحص المقطع من الزوايا الثلاث.'
    ],
    sources: [
      'Nagueh SF, et al. ASE/EACVI Recommendations for LV Diastolic Function (JASE 2016)',
      'ASE 2019 Comprehensive TTE Spectral Doppler Acquisition Standards'
    ],
    echoImageUrl: IMG_ECHO_4CH,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'doppler echocardiography spectral mitral'
  },
  {
    id: 'echo_s09_valvular',
    number: 9,
    level: 'level-3',
    durationSeconds: 600,
    scene: 'DOPPLER_AS',
    titleEn: 'Session 09: Valvular Heart Disease Quantification (AS, AR, MR, MS)',
    titleAr: 'الجلسة 09: التقييم الكمي لأمراض الصمامات (AS وAR وMR وMS)',
    subtitleEn: '10-Minute Valve Board — Continuity Equation, PISA, Vena Contracta & PHT',
    subtitleAr: 'مجلس الصمامات (10 دقائق) — معادلة الاستمرارية AVA، PISA، Vena Contracta وزمن نصف الضغط',
    probeWindowEn: 'Multi-Window Interrogation (PLAX Zoom · A5C · A3C · Right Sternal Border)',
    probeWindowAr: 'استجواب متعدد النوافذ (PLAX Zoom، القمي A5C/A3C، وحافة القص اليمنى)',
    markerClockEn: 'Always Seek Parallel Highest-Velocity Jet Across A5C, A3C, RUSB & SSN',
    markerClockAr: 'ابحث عن أعلى سرعة ممكنة على مستوى A5C وA3C وحافة القص اليمنى وفوق القص',
    patientPositionEn: 'LLD + Right Lateral Decubitus (for Right Upper Sternal Border AS Pedoff Probe)',
    patientPositionAr: 'الاستلقاء الأيسر + الأيمن عند فحص حافة القص اليمنى لمجس بيدوف في التضيق الأبهري',
    clinicalSummaryEn:
      'Learn rigorous multi-parametric grading for all four left-sided valve lesions following ASE/EACVI Valvular Guidelines. Calculate exact Aortic Valve Area via the Continuity Equation, grade AR by Pressure Half-Time and descending aortic reversal, quantify MR by Vena Contracta & EROA (PISA), and grade MS by PHT (`220/PHT`).',
    clinicalSummaryAr:
      'تعلّم التقييم الكمي المتكامل لأمراض الصمامات حسب إرشادات ASE/EACVI: حساب مساحة الصمام الأبهري بمعادلة الاستمرارية Continuity Equation، قياس شدة قلس الأبهري عبر زمن نصف الضغط PHT، تقدير قلس التاجي عبر Vena Contracta وPISA EROA، وتحديد شدة تضيق التاجي بمعادلة 220/PHT.',
    chapters: [
      {
        id: 's09_c1',
        startSec: 0,
        endSec: 150,
        titleEn: 'Aortic Stenosis (AS): Continuity Equation & Low-Flow Paradox',
        titleAr: 'تضيق الصمام الأبهري: معادلة الاستمرارية ومطب التدفق المنخفض',
        narrationEn:
          'Never grade AS by 2D opening alone. Measure: (1) LVOT diameter in Zoomed PLAX mid-systole (e.g., 2.0 cm → Area = π×1² = 3.14 cm²); (2) PW LVOT VTI (18–22 cm, smooth non-turbulent envelope without closing click); (3) CW Aortic Peak Velocity from A5C, A3C, AND Right Sternal Border (take highest Vmax!). Severe AS: Vmax ≥ 4.0 m/s, Mean ΔP ≥ 40 mmHg, AVA ≤ 1.0 cm² (or Dimensionless Index LVOT_VTI / AV_VTI < 0.25).',
        narrationAr:
          'احسب مساحة الصمام الأبهري بمعادلة الاستمرارية: مساحة LVOT × LVOT VTI ÷ AV VTI. قِس قطر LVOT في PLAX المكبر، ثم النبضي PW-VTI داخل LVOT، ثم المستمر CW-VTI من A5C وA3C وحافة القص اليمنى بأعلى سرعة. التضيق الشديد: Vmax ≥ 4.0 م/ث، التدرج الوسطي ≥ 40 ملم ز، المساحة AVA ≤ 1.0 سم²، والمؤشر اللاأبعادي < 0.25.',
        probeCueEn: 'If patient has low LVEF (<50%) and low gradient (<40) with AVA < 1.0, check Dobutamine Stress or CT Calcium Score.',
        probeCueAr: 'في حال كان الكسر القذفي منخفضاً والتدرج <40 مع AVA < 1.0، استعمل الدوبوتامين أو مقياس كالسيوم الصمام بـ CT.',
        keyTakeawayEn: 'Dimensionless Index (LVOT VTI / AV VTI) < 0.25 diagnoses Severe AS immune to LVOT diameter errors.',
        keyTakeawayAr: 'المؤشر اللاأبعادي (VTI_LVOT / VTI_AV < 0.25) يشخص التضيق الشديد دون أخطاء قياس قطر المخرج.'
      },
      {
        id: 's09_c2',
        startSec: 150,
        endSec: 270,
        titleEn: 'Aortic Regurgitation (AR): Jet Width, PHT & Aortic Reversal',
        titleAr: 'قلس الصمام الأبهري: عرض النفثة وزمن نصف الضغط وارتداد الأبهر',
        narrationEn:
          'Use Zoomed PLAX with Color Doppler (Nyquist 50–60 cm/s) and CW Doppler in A5C/A3C. Mild vs Severe AR: (1) Jet Width / LVOT Width ratio < 25% Mild vs ≥ 65% Severe; (2) Vena Contracta (narrowest neck) < 0.3 cm Mild vs > 0.6 cm Severe; (3) CW Pressure Half-Time (PHT) > 500 ms Mild vs < 200 ms Severe (rapid LV-Aortic pressure equalization!); (4) Holodiastolic Flow Reversal in Descending Thoracic/Abdominal Aorta.',
        narrationAr:
          'قارن عرض نفثة القلس بعرض مخرج البطين في PLAX: أقل من 25% بسيط، وأكبر أو يساوي 65% قلس شديد. عنق النفثة Vena Contracta > 0.6 سم، وزمن نصف الضغط PHT < 200 مل ث يعني تساوي الضغط سريعاً (قلس أبهري شديد أو حاد). تزامنه مع ارتداد دموي طوال الانبساط في الأبهر النازل يؤكد الشدة.',
        probeCueEn: 'In acute severe AR (e.g., endocarditis/dissection), LV isn’t dilated yet, so watch short PHT < 200 ms!',
        probeCueAr: 'في القلس الأبهري الحاد (التهاب شغاف أو تسلخ) لا يتوسع البطين بعد، لذا انتبه لقصر PHT أقل من 200 مل ث.',
        keyTakeawayEn: 'PHT < 200 ms + Holodiastolic Reversal in Descending Ao = Hemodynamically Severe AR.',
        keyTakeawayAr: 'زمن نصف ضغط PHT < 200 مل ث + ارتداد الأبهر النازل = قلس أبهري شديد.'
      },
      {
        id: 's09_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Mitral Regurgitation (MR): Primary vs Secondary & PISA',
        titleAr: 'قلس الصمام التاجي: الأولي مقابل الثانوي وقياس Vena Contracta وPISA',
        narrationEn:
          'First classify Carpentier mechanism (I=Annular dilatation, II=Prolapse/Flail, III=Restricted leaflets in ischemic/DCM). Zoom Color Doppler in PLAX or A4C: Vena Contracta < 0.3 cm (Mild) vs ≥ 0.7 cm (Severe). Use PISA method (shift color baseline DOWN toward the flow to 30–40 cm/s to make a clear hemisphere of radius r): Severe MR = EROA ≥ 0.40 cm², Regurgitant Volume ≥ 60 mL, plus Systolic Pulmonary Vein Reversal.',
        narrationAr:
          'حدد أولاً آلية القلس (تمدد حلقة، تدلٍ/تمزق أوتار، أو تقييد احتشائي). قِس Vena Contracta في PLAX أو A4C: ≥ 0.7 سم يدل على قلس شديد. في طريقة PISA أنزل خط الأساس الملون (30–40 سم/ث) لتشكيل نصف كرة: القلس الشديد يعني EROA ≥ 0.40 سم² وحجم قلس ≥ 60 مل، مع انعكاس الجريان الانقباضي في الأوردة الرئوية.',
        probeCueEn: 'Beware eccentric wall-hugging jets (Coanda effect) — they look tiny on color area despite being severe!',
        probeCueAr: 'احذر من النفثة الجانبية الملتصقة بالجدار (ظاهرة كواندا)؛ تبدو صغيرة باللون لكنها شديدة سريرياً!',
        keyTakeawayEn: 'Flail mitral leaflet OR EROA ≥ 0.40 cm² OR VC ≥ 0.7 cm = Severe Mitral Regurgitation.',
        keyTakeawayAr: 'ارتخاء وريقة سائب (Flail) أو EROA ≥ 0.40 سم² أو VC ≥ 0.7 سم يؤكد قلس تاجي شديد.'
      },
      {
        id: 's09_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Mitral Stenosis (MS): "Hockey-Stick" & 220 / PHT Formula',
        titleAr: 'تضيق الصمام التاجي: عصا الهوكي ومعادلة المساحة 220 ÷ PHT',
        narrationEn:
          'Classic Rheumatic MS shows commissural fusion, posterior leaflet immobility, and diastolic doming of the Anterior Mitral Leaflet ("Hockey-Stick" sign in PLAX). Grade severity using 3 complementary tools: (1) Direct PSAX Planimetry; (2) Mean Transvalvular Gradient by CW (Mild <5, Mod 5–10, Severe >10 mmHg); (3) MVA by Pressure Half-Time = 220 / PHT (Severe MS ≤ 1.5 cm², Very Severe ≤ 1.0 cm²).',
        narrationAr:
          'في تضيق التاجي الرثوي تظهر الوريقة الأمامية مقببة كعصا الهوكي ("Hockey-Stick") مع تكلس وتضيق الفوهة. نُقيّم الشدة بـ: (1) التخطيط المباشر في PSAX، (2) التدرج الوسطي (شديد ≥ 10 ملم ز)، (3) معادلة زمن نصف الضغط: المساحة MVA = 220 ÷ PHT (الشديد ≤ 1.5 سم² والحرج ≤ 1.0 سم²).',
        probeCueEn: 'In tachycardia/AF, heart rate alters mean gradient; rely primarily on Planimetry & 220/PHT.',
        probeCueAr: 'في تسرع القلب يتضخم التدرج الضغطي؛ اعتمد على المساحة بالـ Planimetry ومعادلة 220/PHT.',
        keyTakeawayEn: 'Always check LA/LAA for spontaneous echo contrast ("smoke") & thrombus + PASP in severe MS.',
        keyTakeawayAr: 'تحقق دائماً من وجود "الدخان" والخثرات في الأذين الأيسر وحساب ضغط الشريان الرئوي مع كل تضيق تاجي.'
      },
      {
        id: 's09_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'Prosthetic Valves & Radiographic Double-Density Link',
        titleAr: 'فحص الصمامات الصناعية والربط مع علامات الأشعة الصدرية',
        narrationEn:
          'For mechanical or bioprosthetic valves, acoustic shadowing masks posterior structures in TTE (especially mechanical MV from apex — inspect from PLAX/subcostal or order TEE if endocarditis/thrombosis suspected). Check rock/dehiscence (>15° rocking motion) and effective orifice velocity vs baseline post-op study. On Chest X-ray, chronic MS/MR produces LA enlargement: double right heart border, splayed carina > 90°, and upper lobe venous diversion.',
        narrationAr:
          'تُحدث الصمامات الميكانيكية ظلاً صوتياً يخفي ما خلفها؛ تأكد من عدم تخلخل الحلقة (>15 درجة اهتزاز) وقارن التدرج بدراسة ما بعد الجراحة. على صورة الصدر CXR، يُظهر تضيق/قلس التاجي المزمن علامة الكثافة المزدوجة في الحافة اليمنى وانفراج الرغامى > 90 درجة واحتقان الأوردة العلوية.',
        probeCueEn: 'Record Patient-Prosthesis baseline gradients early after surgery for lifelong comparison.',
        probeCueAr: 'المقارنة المرجعية لتدرج الصمام الصناعي مع الفحص الأول بعد الجراحة ضرورية لكشف الخثرة أو تدهور الصمام.',
        keyTakeawayEn: 'Acoustic shadowing behind mechanical MV warrants TEE when paravalvular leak is suspected.',
        keyTakeawayAr: 'إذا وُجد ظل صوتي يخفي تسرباً حول الصمام الصناعي، فإن الإيكو عبر المريء TEE إلزامي.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Severe Aortic Stenosis (AS)',
        parameterAr: 'تضيق الأبهري الشديد',
        normalRange: 'Vmax <2.0 · Mean <10 · AVA >2.0 cm²',
        abnormalThreshold: 'Vmax ≥ 4.0 m/s · Mean ΔP ≥ 40 · AVA ≤ 1.0 cm²'
      },
      {
        parameterEn: 'Severe Aortic Regurgitation (AR)',
        parameterAr: 'قلس الأبهري الشديد',
        normalRange: 'No jet · PHT > 500 ms',
        abnormalThreshold: 'VC > 0.6 cm · PHT < 200 ms · Jet ≥ 65% LVOT'
      },
      {
        parameterEn: 'Severe Mitral Regurgitation (MR)',
        parameterAr: 'قلس التاجي الشديد',
        normalRange: 'VC < 0.3 cm · EROA < 0.20 cm²',
        abnormalThreshold: 'VC ≥ 0.7 cm · EROA ≥ 0.40 cm² · Vol ≥ 60 mL'
      },
      {
        parameterEn: 'Severe Mitral Stenosis (MS)',
        parameterAr: 'تضيق التاجي الشديد',
        normalRange: 'MVA 4.0–6.0 cm² · Mean ΔP < 2 mmHg',
        abnormalThreshold: 'MVA ≤ 1.5 cm² (220/PHT) · Mean ΔP ≥ 10 mmHg'
      }
    ],
    pitfallsEn: [
      'Measuring Continuity AVA only from A5C without trying Right Upper Sternal Border Pedoff/2D — misses 20% of severe AS!',
      'Using MR color jet area to grade an eccentric Coanda jet — always measure Vena Contracta and PISA.',
      'Applying 220/PHT in severe concomitant Aortic Regurgitation (which alters LV compliance and shortens PHT artificially).'
    ],
    pitfallsAr: [
      'عدم البحث عن أقصى سرعة للتضيق الأبهري من حافة القص اليمنى وفوق القص مما يقلل من شدة التضيق لـ 20% من الحالات.',
      'تقدير قلس التاجي بمساحة اللون عندما تكون النفثة جانبية ملتصقة بالجدار (ظاهرة كواندا).',
      'اعتماد معادلة 220/PHT بدقة مطلقة عند وجود قلس أبهري شديد مرافق يؤثر على سرعة امتلاء البطين.'
    ],
    sources: [
      'Baumgartner H, et al. EACVI/ASE Recommendations on Valve Stenosis (JASE 2017)',
      'Zoghbi WA, et al. ASE Recommendations for Noninvasive Evaluation of Native Valvular Regurgitation (JASE 2017)'
    ],
    echoImageUrl: IMG_ECHO_US1,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'mitral aortic stenosis doppler echocardiogram'
  },
  {
    id: 'echo_s10_rush_fate_closing',
    number: 10,
    level: 'level-4',
    durationSeconds: 600,
    scene: 'TAMPONADE',
    titleEn: 'Session 10: Emergency RUSH/FATE, CXR Integration & Final Exam Closing',
    titleAr: 'الجلسة 10: إيكو الطوارئ RUSH وFATE، الربط الشعاعي، واختتام الفحص الشامل',
    subtitleEn: '10-Minute Capstone — Tamponade, Massive PE, Lung B-Lines & 12-Step Sign-Off Protocol',
    subtitleAr: 'جلسة الختام (10 دقائق) — الاندحاس القلبي والصمة الرئوية وخطوط الرئة وختم التقرير النهائي',
    probeWindowEn: 'Focused FATE / RUSH Protocol (Subcostal → A4C → PLAX → IVC → Lung)',
    probeWindowAr: 'بروتوكول الطوارئ السريع FATE / RUSH (تحت الضلعي ← القمي ← جوار القص ← الأجوف ← الرئة)',
    markerClockEn: 'Rapid Multi-Window Emergency Triage + Structured ASE Reporting',
    markerClockAr: 'فرز إسعافي متعدد النوافذ خلال 3 دقائق + التوثيق المنهجي النهائي',
    patientPositionEn: 'Supine Shock Position (Never Delay Resuscitation for Steep LLD)',
    patientPositionAr: 'وضعية الصدمة المستلقية مباشرة دون تأخير الإنعاش أو تحريك المريض بقسوة',
    clinicalSummaryEn:
      'Conclude your intensive mastery by integrating rapid bedside resuscitation echo (RUSH "Pump-Tank-Pipes" and Jensen’s FATE protocol), life-threatening physiology (Cardiac Tamponade vs Massive PE McConnell/60-60 signs), pulmonary edema B-lines vs pneumothorax barcode sign, chest X-ray correlation, and the mandatory 12-Point ASE Final Echo Closing Checklist.',
    clinicalSummaryAr:
      'نختتم المنهج بربط كل المهارات في حالة الطوارئ (بروتوكولي RUSH وFATE)، التفريق الإسعافي بين الاندحاس القلبي والصمة الرئوية الكبرى (علامتا McConnell و60/60)، فحص خطوط B للوذمة الرئوية مقابل غياب انزلاق الجنب، مطابقة صورة الصدر، واستيفاء قائمة الاختتام النهائية المكونة من 12 خطوة لاعتماد التقرير.',
    chapters: [
      {
        id: 's10_c1',
        startSec: 0,
        endSec: 120,
        titleEn: 'RUSH ("Pump – Tank – Pipes") & FATE Shock Triage',
        titleAr: 'بروتوكول RUSH (المضخة – الخزان – الأنابيب) وبروتوكول FATE',
        narrationEn:
          'In undifferentiated hypotension (< 3 minutes): PUMP checks (1) Pericardial Effusion/Tamponade, (2) Global LV contractility (hyperdynamic = distributive/hypovolemic; poor = cardiogenic), (3) Acute RV dilation (> LV = massive PE). TANK checks IVC plethoric vs flat + Lung Ultrasound (≥3 bilateral B-lines = pulmonary edema; absent lung sliding + barcode M-mode = pneumothorax). PIPES checks Thoracic/Abdominal Aorta & DVT compression.',
        narrationAr:
          'في الصدمة غير المفسرة (< 3 دقائق): المضخة PUMP (انصباب/اندحاس، قوة البطين الأيسر، توسع البطين الأيمن للصمة)؛ الخزان TANK (امتلاء IVC وسونار الرئة: ≥3 خطوط B للوذمة الرئوية، غياب الانزلاق وعلامة الباركود للاسترواح الصدري)؛ الأنابيب PIPES (فحص الأبهر من التسلخ والأوردة العميقة من DVT).',
        probeCueEn: 'Start Subcostal FIRST in trauma/arrest — saves chest compression pause time!',
        probeCueAr: 'في الإنعاش القلبي ابدأ تحت الضلعي أو القمي لعدم قطع الضغطات الصدرية لأكثر من 10 ثوانٍ.',
        keyTakeawayEn: 'Hyperdynamic "kissing" LV + flat collapsing IVC (<1.5 cm) = Severe Hypovolemic/Sepsis Tank.',
        keyTakeawayAr: 'بطين متقارب الجدران بقوة (Kissing walls) مع IVC منخمص = نقص حجم أو صدمة إنتانية واضحة.'
      },
      {
        id: 's10_c2',
        startSec: 120,
        endSec: 270,
        titleEn: 'Cardiac Tamponade Physiology & Chamber Collapse',
        titleAr: 'فيزيولوجيا الاندحاس القلبي (Tamponade) وانخماص الحجرات',
        narrationEn:
          'Tamponade is a CLINICAL + ECHO hemodynamic diagnosis, not merely fluid size. Sequence of sensitivity/specificity: (1) Plethoric non-collapsing IVC (>2.1 cm, <50% collapse — ~97% sensitive); (2) Right Atrial Systolic Collapse > 1/3 of cardiac cycle; (3) Right Ventricular Diastolic Collapse (spearheading early diastole — ~90% specific); (4) Mitral inflow respiratory drop > 25% & Tricuspid rise > 40%; (5) "Swinging Heart" electrical alternans.',
        narrationAr:
          'الاندحاس القلبي تشخيص ديناميكي وليس مجرد حجم سائل: (1) تمدد ثابت بالـ IVC (>2.1 سم) دون انخماص (حساسية 97%)؛ (2) انخماص الأذين الأيمن في الانقباض (> ثلث الدورة)؛ (3) انخماص جدار البطين الأيمن في الانبساط المبكر (علامة نوعية جداً)؛ (4) تباين تنفسي في تدفق التاجي >25%؛ (5) قلب متأرجح ("Swinging heart").',
        probeCueEn: 'Place M-mode across RV free wall + LV in PLAX/Subcostal to time RV collapse in early diastole!',
        probeCueAr: 'مرر خط M-Mode عبر جدار البطين الأيمن والوريقة التاجية لتثبت أن انخماص البطين الأيمن يقع في الانبساط!',
        keyTakeawayEn: 'Check CXR "Water-bottle" cardiomegaly, but remember rapid acute hemorrhage (150 mL) causes tamponade with NORMAL CXR!',
        keyTakeawayAr: 'النزف السريع (150 مل فقط) يحدث اندحاساً مميتاً مع صورة صدر طبيعية تماماً دون علامة قنينة الماء!'
      },
      {
        id: 's10_c3',
        startSec: 270,
        endSec: 420,
        titleEn: 'Massive Pulmonary Embolism: McConnell & 60/60 Signs',
        titleAr: 'الصمة الرئوية الحادة: علامة McConnell وعلامة 60/60',
        narrationEn:
          'Look for acute RV strain in A4C & PSAX: (1) RV/LV basal ratio > 1.0 + D-Sign; (2) McConnell’s Sign: Akinesis of the RV mid-free wall with preserved hypercontractile apical contraction (tethered by LV apex); (3) 60/60 Sign: Pulmonary Acceleration Time (PAAT) < 60 ms WITH TR Peak Gradient < 60 mmHg (an unhypertrophied acute RV cannot generate >60 mmHg acutely!). Check RV wall < 5 mm.',
        narrationAr:
          'ثلاثية الصمة الرئوية الحادة بالإيكو: (1) توسع البطين الأيمن (> من الأيسر) مع علامة D، (2) علامة McConnell: انعدام حركة الجدار الحر الأوسط للبطين الأيمن مع احتفاظ القمة بالانقباض، (3) علامة 60/60: زمن تسارع الشريان الرئوي < 60 مل ث مع تدرج TR < 60 ملم زئبق (لأن البطين الأيمن الحاد لم يتضخم بعد ليولد ضغطاً أعلى).',
        probeCueEn: 'Do not confuse McConnell’s with RV Infarction — in PE, apex spares while PASP rises moderately.',
        probeCueAr: 'علامة McConnell تقرن مع علامة 60/60 لرفع نوعية تشخيص الصمة الرئوية إلى > 94%.',
        keyTakeawayEn: 'McConnell’s Sign + 60/60 Sign + Mobile RA "Thrombus-in-transit" = Urgent Thrombolysis Alert.',
        keyTakeawayAr: 'اجتماع علامة McConnell + 60/60 + خثرة عابرة في الأذين الأيمن يوجب التداخل الإنعاشي العاجل.'
      },
      {
        id: 's10_c4',
        startSec: 420,
        endSec: 540,
        titleEn: 'Radiographic Integration (CXR / CT) Checklist',
        titleAr: 'الربط التشخيصي مع صورة الصدر CXR والتصوير المقطعي CT',
        narrationEn:
          'Always cross-verify Echo findings with Radiology before signing off: (1) Pleural vs Pericardial effusion — CXR meniscus blunting costophrenic angle matches fluid POSTERIOR to descending aorta on PLAX; (2) Pulmonary Edema — CXR Kerley B lines & bat-wing infiltrates match ≥3 bilateral lung B-lines + E/e’ >14; (3) Massive PE — CXR Westermark oligemia or Hampton hump with McConnell sign; (4) Type A Dissection — Widened mediastinum (>8 cm) with intimal flap.',
        narrationAr:
          'طابق نتائج الإيكو دائماً مع الأشعة: (1) انصباب تاموري (أمام الأبهر النازل + ظل قنينة الماء) مقابل جنبي (خلف الأبهر النازل + هلال الزاوية الضلعية)، (2) وذمة رئوية (خطوط كيرلي B على CXR + خطوط B بالسونار + E/e\' > 14)، (3) صمة (علامة ويسترمارك/هامبتون + McConnell)، (4) تسلخ أبهر (توسع منصف > 8 سم + سديلة باطنية).',
        probeCueEn: 'Bilateral diffuse B-lines + depressed LVEF confirms cardiogenic vs asymmetric consolidation (pneumonia).',
        probeCueAr: 'خطوط B ثنائية الجانب مع انخفاض الكسر القذفي تؤكد الوذمة القلبية وتفرقها عن ذات الرئة الموضعية.',
        keyTakeawayEn: 'Bedside Echo + CXR correlation cuts diagnostic ambiguity by > 85% in acute dyspnea.',
        keyTakeawayAr: 'دمج الإيكو مع الأشعة الصدرية يحسم أكثر من 85% من أسباب الزلة التنفسية الحادة خلال دقائق.'
      },
      {
        id: 's10_c5',
        startSec: 540,
        endSec: 600,
        titleEn: 'The 12-Point ASE Final Echo Closing & Sign-Off Protocol',
        titleAr: 'بروتوكول الختام النهائي (12 خطوة) قبل توقيع تقرير الإيكو',
        narrationEn:
          'Before lifting the transducer and finalizing the clinical report, audit all 12 closing pillars: (1) Image Quality & Rhythm/HR documented; (2) LV Size & Mass; (3) Biplane LVEF % + Wall Motion Score; (4) Diastolic Grade & E/e’; (5) LA Volume Index (mL/m²); (6) RV Size & TAPSE/S’; (7) RA Size & IVC RAP (3/8/15); (8) Aortic Valve & Gradient/AVA; (9) Mitral Valve; (10) Tricuspid/Pulmonic + PASP; (11) Pericardium & Aortic Root/Arch; (12) Critical Stat Alert Communicated if Tamponade/Dissection/Severe PE/Thrombus found!',
        narrationAr:
          'قبل إنهاء الفحص ورفع المجس وتوقيع التقرير النهائي، راجع النقاط الـ 12 الإلزامية: (1) جودة الصورة ونظم القلب، (2) أبعاد وسماكة البطين الأيسر، (3) الكسر القذفي سيمبسون وحركة الجدران، (4) درجة الانبساطية وE/e\'، (5) مؤشر حجم الأذين الأيسر LAVI، (6) أبعاد البطين الأيمن وTAPSE، (7) الأذين الأيمن وضغط RAP عبر IVC، (8) الصمام الأبهري وجذره، (9) الصمام التاجي، (10) مثلث الشرف والرئوي مع PASP، (11) التامور والأبهر الصاعد والنازل، (12) الإبلاغ الإسعافي الفوري لأي حالة مهددة للحياة!',
        probeCueEn: 'Wipe gel off chest, hand towel to patient, confirm all loops stored, and complete 12-point audit.',
        probeCueAr: 'نظّف الجل برفق، تأكد من حفظ كل المقاطع والفيديوهات، وأتمّ مراجعة القائمة الـ 12 قبل التوقيع.',
        keyTakeawayEn: 'Every signed report must reconcile Left Ventricle, Right Ventricle, 4 Valves, Great Vessels, and Pericardium.',
        keyTakeawayAr: 'كل تقرير احترافي معتمد يغطي بدقة البطينين والأذينين والصمامات الأربعة والأوعية الكبرى والتامور.'
      }
    ],
    cutoffs: [
      {
        parameterEn: 'Tamponade Mitral Resp Variation',
        parameterAr: 'التباين التنفسي للتاجي في الاندحاس',
        normalRange: '< 15% inspiratory drop',
        abnormalThreshold: '> 25% MV drop · > 40% TV rise = Tamponade'
      },
      {
        parameterEn: '60/60 Sign (Acute PE)',
        parameterAr: 'علامة 60/60 للصمة الرئوية الحادة',
        normalRange: 'PAAT > 130 ms',
        abnormalThreshold: 'PAAT < 60 ms + TR Gradient < 60 mmHg'
      },
      {
        parameterEn: 'Lung Ultrasound B-Lines',
        parameterAr: 'خطوط B في سونار الرئة',
        normalRange: 'A-Lines + Lung Sliding present',
        abnormalThreshold: '≥ 3 B-lines per space in ≥2 bilateral zones'
      }
    ],
    pitfallsEn: [
      'Ruling out Tamponade solely because effusion appears "small" — rapid bleeding causes acute tamponade with only 150 mL.',
      'Diagnosing Massive PE in a patient with chronic RV hypertrophy (wall > 5 mm & TR ΔP > 70 mmHg) without checking chronicity.',
      'Forgetting to store Suprasternal or Subcostal loops before wiping gel off the patient.'
    ],
    pitfallsAr: [
      'استبعاد الاندحاس القلبي لأن كمية السائل صغيرة؛ التجمع السريع يحاصر القلب بكمية 150 مل فقط.',
      'تشخيص صمة حادة على مريض فرط ضغط رئوي مزمن (جدار البطين الأيمن > 5 ملم وتدرج > 70) دون الانتباه للسجل المزمن.',
      'إزالة الجل ومسح صدر المريض قبل التأكد من حفظ كل المقاطع وقياسات الدوبلر في الجهاز.'
    ],
    sources: [
      'Perera P, et al. The RUSH Exam: Rapid Ultrasound in SHock (Emerg Med Clin North Am 2010)',
      'Jensen MB, et al. Focus Assessed Transthoracic Echocardiography (FATE Protocol)',
      'ASE 2019 Guidelines for Performing a Comprehensive TTE & Critical Value Reporting'
    ],
    echoImageUrl: IMG_ECHO_US2,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PNEUMO,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'pericardial effusion cardiac tamponade echocardiogram'
  }
];

export const ECHO_SIGNS_CATALOG: EchoSignItem[] = [
  {
    id: 'sign_mercedes_benz',
    level: 'level-2',
    nameEn: 'Mercedes-Benz Sign (Normal Trileaflet Aortic Valve)',
    nameAr: 'علامة مرسيدس بنز (الصمام الأبهري ثلاثي الشرف الطبيعي)',
    windowTag: 'PSAX · Base (AV)',
    severity: 'Diagnostic',
    echoFindingEn:
      'In PSAX at the aortic root during diastole, coaptation of the Right, Left, and Non-coronary cusps forms an inverted Y resembling a Mercedes-Benz emblem. Systolic opening forms a wide triangle. Absence of one commissure with systolic oval/"fish-mouth" opening indicates Bicuspid Aortic Valve (1–2% population, associated with coarctation and ascending aortopathy).',
    echoFindingAr:
      'في المقطع القصير PSAX عند القاعدة أثناء الانبساط، يشكّل التقاء الشرفات الثلاث (اليمنى، اليسرى، واللاإكليلية) حرف Y مقلوب يشبه شارة مرسيدس. أما في الانقباض فينفتح بشكل مثلث واسع؛ وإذا فُقد أحد الملتقيات مع فتحة بيضوية في الانقباض دلّ ذلك على صمام أبهري ثنائي الشرف.',
    radiographCorrelationEn:
      'PA Chest X-ray in bicuspid AS shows post-stenotic dilatation of the ascending aorta convexing along the right upper mediastinal border plus concentric LV contour without severe cardiomegaly.',
    radiographCorrelationAr:
      'تُظهر صورة الصدر PA في التضيق الأبهري المرافق لثنائي الشرف توسعاً ما بعد التضيق في الأبهر الصاعد على الحافة اليمنى العليا للمنصف مع تكور قمة البطين الأيسر.',
    thresholdsEn: 'Normal systolic AV opening > 1.5 cm · AVA > 2.0 cm² · Bicuspid prevalence ~1.3%.',
    thresholdsAr: 'الانفتاح الانقباضي الطبيعي > 1.5 سم · مساحة الصمام > 2.0 سم² · يجب فحص الأبهر الصاعد دوماً.',
    caseExampleEn:
      'Case: 34-year-old athlete with systolic ejection murmur at RUSB. PLAX shows systolic doming; PSAX systole reveals horizontal fish-mouth opening (Bicuspid AV, fusion of R-L cusps) + Ascending Aorta 4.3 cm.',
    caseExampleAr:
      'حالة سريرية: شاب رياضي 34 عاماً لديه نفخة انقباضية بؤرتها الأبهري. أظهر PLAX تقبباً انقباضياً، وكشف PSAX في الانقباض فتحة بيضوية ثنائية الشرف مع توسع الأبهر الصاعد (4.3 سم).',
    echoImageUrl: IMG_ECHO_US4,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'bicuspid aortic valve echocardiogram' ,
    scene: 'PSAX_AV'
  },
  {
    id: 'sign_hockey_stick',
    level: 'level-3',
    nameEn: 'Hockey-Stick Sign (Rheumatic Mitral Stenosis)',
    nameAr: 'علامة عصا الهوكي (تضيق الصمام التاجي الرثوي)',
    windowTag: 'PLAX & PSAX MV',
    severity: 'Diagnostic',
    echoFindingEn:
      'Commissural fusion restricts tip opening while the flexible body of the Anterior Mitral Leaflet (AML) bows sharply forward into the LVOT in diastole, creating a bent "Hockey-Stick" or elbow contour in PLAX. Paired with tethered Posterior Mitral Leaflet and left atrial spontaneous echo contrast.',
    echoFindingAr:
      'التصاق الملتقيات الرثوي يقيد حركة حافة الوريقة الأمامية للتاجي بينما يندفع جسمها المرن للأمام نحو مخرج البطين في الانبساط متخذاً شكل "عصا الهوكي"، مع ثبات الوريقة الخلفية وتوسع الأذين الأيسر.',
    radiographCorrelationEn:
      'PA Chest X-ray demonstrates "Double-Density" sign (enlarged LA overlapping right atrial border), elevation of the left main bronchus (carinal angle > 90°), straightened left heart border (prominent LA appendage), and Kerley B lines.',
    radiographCorrelationAr:
      'تُظهر صورة الصدر PA علامة "الكثافة المزدوجة" خلف الحافة القلبية اليمنى، وارتفاع القصبة اليسرى (انفراج الكارينا > 90°)، واستقامة الحافة القلبية اليسرى، وخطوط كيرلي B في القاعدتين.',
    thresholdsEn: 'MVA = 220 / PHT · Severe MS ≤ 1.5 cm² · Mean Gradient ≥ 10 mmHg · PASP > 35 mmHg.',
    thresholdsAr: 'مساحة التاجي = 220 ÷ PHT · الشديد ≤ 1.5 سم² · التدرج الوسطي ≥ 10 ملم ز.',
    caseExampleEn:
      'Case: 42-year-old woman with orthopnea and atrial fibrillation. PLAX displays classic Hockey-Stick AML doming; PHT = 210 ms (MVA = 1.05 cm²); Mean ΔP = 13 mmHg; CXR shows double right border & cephalization.',
    caseExampleAr:
      'حالة سريرية: مريضة 42 عاماً تعاني من ضيق نفس اضطجاعي ورجفان أذيني. أظهر PLAX علامة عصا الهوكي بوضوح، وبلغ PHT = 210 مل ث (مساحة 1.05 سم²) وتدرج وسطي 13 ملم ز مع علامة الكثافة المزدوجة على CXR.',
    echoImageUrl: IMG_ECHO_US3,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'mitral stenosis hockey stick echocardiogram',
    scene: 'PLAX'
  },
  {
    id: 'sign_d_shape',
    level: 'level-2',
    nameEn: 'D-Shaped Left Ventricle (Systolic vs Diastolic Septal Flattening)',
    nameAr: 'علامة البطين على شكل حرف D (فرط الضغط مقابل فرط الحجم الأيمن)',
    windowTag: 'PSAX · Mid-LV',
    severity: 'Diagnostic',
    echoFindingEn:
      'The circular LV short-axis doughnut flattens into a "D" as elevated RV pressure or volume pushes the interventricular septum leftward. Timing solves the etiology: Systolic D-sign = RV Pressure Overload (Acute PE, Severe PAH); Diastolic D-sign = RV Volume Overload (Large ASD, Severe TR).',
    echoFindingAr:
      'يتسطح الحجاب بين البطينين دافعاً البطين الأيسر الدائري ليتخذ شكل حرف D. التوقيت يكشف السبب: التسطح الانقباضي = فرط ضغط أيمن (صمة رئوية/ارتفاع ضغط رئوي)؛ والتسطح الانبساطي = فرط حجم أيمن (ASD أو قلس مثلث شرف شديد).',
    radiographCorrelationEn:
      'Chest X-ray correlates with prominent central pulmonary arteries (Fleischner sign), abrupt vessel cutoff ("pruning"), or enlarged right heart border filling the retrosternal clear space on Lateral CXR.',
    radiographCorrelationAr:
      'يترافق في الأشعة مع ضخامة الشريانين الرئويين المركزيين مع انقطاع التفرعات المحيطية ("تقليم الشجرة")، وامتلاء المسافة خلف القص في الصورة الجانبية.',
    thresholdsEn: 'Eccentricity Index (D2/D1) > 1.1 confirms abnormal septal flattening.',
    thresholdsAr: 'مؤشر الانحراف H/W > 1.1 يؤكد التسطح المرضي للحجاب بين البطينين.',
    caseExampleEn:
      'Case: 58-year-old post-orthopedic surgery develops tachycardia and SpO2 87%. PSAX shows prominent systolic + diastolic D-sign with RV/LV > 1.2.',
    caseExampleAr:
      'حالة سريرية: مريض 58 عاماً بعد جراحة عظمية أُصيب بتسرع قلب وهبوط أكسجة 87%. أظهر PSAX علامة حرف D انقباضية قوية مع تضخم البطين الأيمن.',
    echoImageUrl: IMG_ECHO_US2,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'pulmonary hypertension right ventricle echocardiogram D sign',
    scene: 'PSAX_PM'
  },
  {
    id: 'sign_mcconnell_6060',
    level: 'level-4',
    nameEn: 'McConnell’s Sign & 60/60 Sign (Acute Massive Pulmonary Embolism)',
    nameAr: 'علامة McConnell وعلامة 60/60 (الصمة الرئوية الحادة الكبرى)',
    windowTag: 'A4C & PSAX RVOT',
    severity: 'Critical',
    echoFindingEn:
      'McConnell’s Sign shows distinct akinesia of the RV mid-free wall with paradoxical hypercontractile sparing of the RV apex (pulled by adjacent LV). Combined with the 60/60 Sign (PA Acceleration Time < 60 ms with mid-systolic notch + TR Gradient < 60 mmHg), specificity for acute pulmonary embolism exceeds 94%.',
    echoFindingAr:
      'تتجلى علامة McConnell بانعدام حركة الجدار الحر الأوسط للبطين الأيمن مع بقاء قمة البطين الأيمن متحركة بنشاط. وعند اجتماعها مع علامة 60/60 (زمن تسارع الشريان الرئوي PAAT < 60 مل ث مع تدرج قلس مثلث الشرف < 60 ملم ز) تتجاوز نوعية تشخيص الصمة الرئوية الحادة 94%.',
    radiographCorrelationEn:
      'Chest X-ray frequently normal; classic signs include Hampton’s Hump (wedge pleural-based infarct opacity), Westermark’s Sign (focal peripheral oligemia), or Fleischner enlargement of central PA. Confirmed rapidly via CT Pulmonary Angiography (CTPA).',
    radiographCorrelationAr:
      'قد تبدو صورة الصدر طبيعية أو تُظهر سنام هامبتون (كثافة إسفينية محيطية) أو علامة ويسترمارك (نقص تروية بؤري)، ويُحسم التشخيص عبر القسطرة الشعاعية CTPA.',
    thresholdsEn: 'RV/LV > 1.0 · TAPSE < 17 mm · PAAT < 60 ms · TR ΔP < 60 mmHg · RV free wall < 5 mm.',
    thresholdsAr: 'نسبة RV/LV > 1.0 · TAPSE < 17 ملم · PAAT < 60 مل ث · تدرج TR < 60 ملم ز · الجدار < 5 ملم.',
    caseExampleEn:
      'Case: 66-year-old with syncope, BP 84/52, D-dimer >4000. A4C reveals dilated RV (RV/LV 1.3), akinetic mid-free wall with moving apex (McConnell’s), PAAT 48 ms, and TR peak gradient 44 mmHg (60/60+). Systemic thrombolysis initiated.',
    caseExampleAr:
      'حالة إسعافية: مريض 66 عاماً أتى بغشي وضغط 84/52. كشف A4C توسع البطين الأيمن مع علامة McConnell الصريحة وزمن PAAT 48 مل ث وتدرج 44 ملم ز (علامة 60/60 إيجابية)، وتم تفعيل بروتوكول حالّات الخثرة فوراً.',
    echoImageUrl: IMG_ECHO_4CH,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'pulmonary embolism McConnell sign echocardiogram',
    scene: 'MCCONNELL'
  },
  {
    id: 'sign_tamponade_swing',
    level: 'level-4',
    nameEn: 'Swinging Heart, RA/RV Collapse & Plethoric IVC (Tamponade)',
    nameAr: 'القلب المتأرجح وانخماص البطين الأيمن (الاندحاس القلبي الحاد)',
    windowTag: 'Subcostal · PLAX · A4C',
    severity: 'Critical',
    echoFindingEn:
      'Large circumferential pericardial effusion causes the heart to oscillate pendulum-like ("Swinging Heart"). High intrapericardial pressure collapses the RA during systole (>1/3 cycle) and pushes the RV free wall inward during early diastole (when RV pressure is lowest), paired with fixed plethoric IVC (>2.1 cm) and >25% respiratory drop in mitral E velocity.',
    echoFindingAr:
      'انصباب تاموري محيطي يسبب تأرجح القلب كالبندول داخل الكيس السائلي. ارتفاع الضغط يسبب انخماص الأذين الأيمن انقباضياً والبطين الأيمن في الانبساط المبكر، مع وريد أجوف ممتلئ ثابت (>2.1 سم) وتباين تنفسي في تدفق التاجي >25%.',
    radiographCorrelationEn:
      'PA Chest X-ray in subacute/chronic effusion exhibits a symmetric globular "Water-Bottle" cardiomegaly with clear pulmonary vascular markings (unless acute traumatic hemopericardium, where CXR heart size stays normal!).',
    radiographCorrelationAr:
      'تُظهر صورة الصدر في التجمع التاموري المزمن قلباً كروياً متناظراً كـ "قنينة الماء" مع رئتين صافيتين؛ بينما في النزف الحاد قد يبدو ظل القلب طبيعياً تماماً.',
    thresholdsEn: 'Mitral E variation > 25% · Tricuspid > 40% · IVC > 2.1 cm (<50% collapse) · Diastolic RV collapse.',
    thresholdsAr: 'تباين التاجي > 25% · مثلث الشرف > 40% · IVC > 2.1 سم ثابت · انخماص انبساطي للبطين الأيمن.',
    caseExampleEn:
      'Case: Uremic chest pain, BP 78/50, JVD to jaw, muffled heart sounds (Beck’s Triad). Subcostal 4C reveals 2.8 cm pericardial effusion, diastolic RV collapse, and 2.5 cm fixed IVC. Urgent echo-guided pericardiocentesis drained 550 mL.',
    caseExampleAr:
      'حالة إسعافية: مريض قصور كلوي بضغط 78/50 واحتقان وداجي (ثلاثي بيك). كشف المقطع تحت الضلعي انصباباً 2.8 سم مع انخماص البطين الأيمن انبساطياً وIVC ثابت 2.5 سم؛ تم بزل 550 مل بتوجيه الإيكو فارتفع الضغط فوراً.',
    echoImageUrl: IMG_ECHO_US1,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'pericardial effusion cardiac tamponade echocardiogram',
    scene: 'TAMPONADE'
  },
  {
    id: 'sign_desc_ao_rule',
    level: 'level-2',
    nameEn: 'Descending Aorta Rule (Pericardial vs Pleural Effusion)',
    nameAr: 'قاعدة الأبهر النازل (التمييز القاطع بين الانصباب التاموري والجنبي)',
    windowTag: 'PLAX · Deep Depth (20 cm)',
    severity: 'Diagnostic',
    echoFindingEn:
      'The circular descending thoracic aorta in PLAX serves as the anatomical divider. Because the fibrous pericardial reflection attaches anterior to the descending aorta along the posterior AV groove, fluid tracking ANTERIOR to the descending aorta is PERICARDIAL, whereas large anechoic fluid tracking POSTERIOR to it is a LEFT PLEURAL EFFUSION.',
    echoFindingAr:
      'يعمل الأبهر الصدري النازل كعلامة فاصلة قطعية في مقطع PLAX: السائل الممتد أمام الأبهر النازل (بينه وبين الأذين الأيسر) هو انصباب تاموري Pericardial، بينما السائل المتجمع خلف الأبهر النازل هو انصباب جنبي أيسر Pleural.',
    radiographCorrelationEn:
      'Erect CXR shows blunting of the costophrenic sulcus with a classic upward-concave "Meniscus Sign" in pleural effusion vs sharp costophrenic angles with enlarged globular heart in isolated pericardial effusion.',
    radiographCorrelationAr:
      'على صورة الصدر الواقفة، يظهر الانصباب الجنبي كانغلاق في الزاوية الضلعية الحجابية مع هلال السائل المقعر للأعلى؛ بينما تبقى الزاويتان حادتين في الانصباب التاموري المعزول.',
    thresholdsEn: 'Small pericardial < 10 mm · Moderate 10–20 mm · Large > 20 mm (sum anterior + posterior).',
    thresholdsAr: 'انصباب تاموري بسيط < 10 ملم · متوسط 10–20 ملم · كبير > 20 ملم.',
    caseExampleEn:
      'Case: Dyspneic heart failure patient with large retrocardiac echo-free space on PLAX. Setting depth to 22 cm reveals fluid lies strictly POSTERIOR to the circular descending aorta — confirming left pleural effusion rather than pericardial.',
    caseExampleAr:
      'حالة سريرية: مريض قصور قلب مع فراغ أسود خلف القلب. بعد زيادة العمق إلى 22 سم تبيّن أن السائل يقع خلف الأبهر النازل تماماً — ما أكد أنه انصباب جنبي أيسر ومنع بزل تامور خاطئ!',
    echoImageUrl: IMG_ECHO_US3,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'pleural effusion pericardial effusion echocardiogram descending aorta',
    scene: 'PLAX'
  },
  {
    id: 'sign_epss_bbump',
    level: 'level-3',
    nameEn: 'Increased EPSS (>7 mm) & Mitral B-Bump (Severe LV Failure)',
    nameAr: 'زيادة مسافة EPSS (>7 ملم) وحدبة B التاجية (قصور القلب الأيسر الشديد)',
    windowTag: 'PLAX · M-Mode MV',
    severity: 'Quantitative',
    echoFindingEn:
      'On M-mode through the mitral valve tips in PLAX, the Anterior Mitral Leaflet (AML) normally leaps forward to almost kiss the interventricular septum (EPSS < 7 mm). When LV stroke volume drops and LV dilates, EPSS widens (> 10 mm = EF < 35%). When LVEDP spikes above 20 mmHg, a secondary closure notch called the "B-bump" appears on the A-C closure slope.',
    echoFindingAr:
      'في M-Mode على ذروة التاجي، تقترب الوريقة الأمامية من الحجاب بمسافة أقل من 7 ملم (EPSS). عند توسع البطين وضعف انقباضه تتسع المسافة لأكثر من 10 ملم (EF < 35%). وعند ارتفاع ضغط نهاية الانبساط البطيني LVEDP > 20 تظهر حدبة صغيرة "B-Bump" قبل انغلاق الصمام.',
    radiographCorrelationEn:
      'Chest X-ray correlates with cardiomegaly (CTR > 0.55), cephalization of pulmonary vessels, peribronchial cuffing, Kerley B lines, and bilateral alveolar "Bat-Wing" pulmonary edema.',
    radiographCorrelationAr:
      'تترافق على صورة الصدر مع ضخامة قلبية > 0.55، احتقان قمي وعائي، خطوط كيرلي B، ووذمة سنخية بشكل جناحي الخفاش.',
    thresholdsEn: 'EPSS < 7 mm Normal · 7–10 mm Mild/Mod · > 10 mm Severe LV dysfunction · B-bump = LVEDP > 20 mmHg.',
    thresholdsAr: 'EPSS < 7 ملم طبيعي · > 10 ملم خلل انقباضي شديد · حدبة B تدل على LVEDP > 20 ملم ز.',
    caseExampleEn:
      'Case: 62-year-old dilated cardiomyopathy patient in acute decompensation. PLAX M-mode measures EPSS = 19 mm with clear mitral B-bump; Biplane LVEF = 22%.',
    caseExampleAr:
      'حالة سريرية: مريض اعتلال عضلة قلبية توسعي في معاوضة حادة؛ أظهر M-Mode مسافة EPSS = 19 ملم مع حدبة B صريحة، وكسر قذفي سيمبسون 22%.',
    echoImageUrl: IMG_ECHO_US2,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PA,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'mitral valve M mode echocardiogram EPSS',
    scene: 'PLAX'
  },
  {
    id: 'sign_sam_dagger',
    level: 'level-3',
    nameEn: 'SAM & "Dagger-Shaped" CW Jet (Hypertrophic Obstructive Cardiomyopathy)',
    nameAr: 'الحركة الأمامية الانقباضية SAM وموجة "الخنجر" في التضخم الانسدادي HOCM',
    windowTag: 'PLAX M-Mode & A5C CW',
    severity: 'Diagnostic',
    echoFindingEn:
      'Asymmetric basal septal hypertrophy (IVSd ≥ 15 mm, IVS/PW > 1.3) accelerates LVOT blood flow, creating Venturi/drag forces that suck the Anterior Mitral Leaflet into the septum during mid-systole (Systolic Anterior Motion — SAM), causing LVOT obstruction + posterior eccentric MR. CW Doppler shows a classic late-peaking, concave "Dagger-Shaped" profile.',
    echoFindingAr:
      'يُسرّع تضخم الحجاب القاعدي غير المتناظر (≥15 ملم) الجريان في مخرج البطين مسبباً سحب الوريقة التاجية الأمامية باتجاه الحجاب أثناء الانقباض (SAM) مع قلس تاجي خلفي مرافق. ويرسم الدوبلر المستمر CW موجة مقعرة متأخرة الذروة تشبه "نصل الخنجر".',
    radiographCorrelationEn:
      'Chest X-ray is paradoxically near-normal in cardiothoracic ratio (concentric/septal hypertrophy grows inward), occasionally showing left ventricular apex rounding or mild LA enlargement.',
    radiographCorrelationAr:
      'تبدو صورة الصدر غالباً ذات حجم قلب طبيعي لأن التضخم يتجه لداخل التجويف مع استدارة خفيفة في الحافة اليسرى.',
    thresholdsEn: 'IVSd ≥ 15 mm (≥13 mm family history) · Resting or Valsalva LVOT ΔP ≥ 30 mmHg (Severe ≥ 50 mmHg).',
    thresholdsAr: 'سماكة الحجاب ≥ 15 ملم · تدرج مخرج البطين المنسد ≥ 30 ملم ز راحة أو بمناورة فالسالفا (≥50 شديد).',
    caseExampleEn:
      'Case: 27-year-old with exertional presyncope and harsh crescendo murmur louder with standing/Valsalva. PLAX shows IVSd 21 mm + leaflet-septal contact SAM; A5C CW captures 64 mmHg Dagger jet.',
    caseExampleAr:
      'حالة سريرية: شاب 27 عاماً يعاني من ما قبل الغشي الجهدي ونفخة تشتد بفالسالفا. أظهر PLAX سماكة حجاب 21 ملم مع تماس SAM، وسجل CW موجة خنجرية بتدرج 64 ملم زئبق.',
    echoImageUrl: IMG_ECHO_DOPPLER,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_NORMAL,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'hypertrophic cardiomyopathy SAM dagger doppler echocardiogram',
    scene: 'DOPPLER_AS'
  },
  {
    id: 'sign_plethoric_ivc',
    level: 'level-2',
    nameEn: 'Plethoric Non-Collapsing IVC (>2.1 cm, <50% Collapse)',
    nameAr: 'تمدد الوريد الأجوف السفلي الثابت (>2.1 سم دون انخماص)',
    windowTag: 'Subcostal · Long Axis IVC',
    severity: 'Quantitative',
    echoFindingEn:
      'Measured 1–2 cm from RA junction in subcostal long axis: an IVC > 2.1 cm that collapses < 50% during rapid sniff signifies elevated central venous / Right Atrial Pressure (RAP = 15 mmHg), seen in congestive heart failure, severe TR, constrictive pericarditis, tamponade, and massive PE.',
    echoFindingAr:
      'يُقاس على بعد 1–2 سم من المصب الأذيني في المقطع تحت الضلعي الطولي: تجاوز القطر 2.1 سم مع انخماص < 50% أثناء الشفط يدل على ضغط أذين أيمن مرتفع (RAP = 15 ملم ز) كما في احتقان القلب، التضيق التاموري، الاندحاس، والصمة الرئوية.',
    radiographCorrelationEn:
      'Correlates on PA CXR with widened vascular pedicle width (>58 mm), dilated azygos vein arch (>10 mm upright), and pulmonary venous congestion or bilateral pleural effusions.',
    radiographCorrelationAr:
      'يترافق على صورة الصدر مع توسع السويقة الوعائية العليا (>58 ملم) وتضخم قوس الوريد الفردي (>10 ملم) واحتقان الرئتين.',
    thresholdsEn: 'IVC ≤ 2.1 + >50% collapse = 3 mmHg · Mixed = 8 mmHg · IVC > 2.1 + <50% collapse = 15 mmHg.',
    thresholdsAr: '≤ 2.1 سم مع >50% انخماص = 3 ملم ز · مختلط = 8 ملم ز · > 2.1 مع <50% انخماص = 15 ملم ز.',
    caseExampleEn:
      'Case: Refractory peripheral edema and elevated BNP. Subcostal longitudinal scan shows 2.6 cm IVC with 10% sniff collapse → RAP = 15 mmHg; diuretic infusion escalated.',
    caseExampleAr:
      'حالة سريرية: وذمات محيطية معندة وارتفاع BNP. أظهر السونار تحت الضلعي وريد أجوف 2.6 سم مع انخماص 10% فقط ← تقدير RAP = 15 ملم ز، فتم تكثيف المدر الوريدي.',
    echoImageUrl: IMG_ECHO_US4,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_CVC,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'inferior vena cava ultrasound subcostal',
    scene: 'SUBCOSTAL_IVC'
  },
  {
    id: 'sign_aortic_flap',
    level: 'level-4',
    nameEn: 'Stanford Type A Aortic Intimal Flap & Widened Mediastinum',
    nameAr: 'سديلة تسلخ الأبهر الحاد (Stanford A) وتوسع المنصف',
    windowTag: 'PLAX · Suprasternal · Subcostal',
    severity: 'Critical',
    echoFindingEn:
      'A thin, mobile, echogenic linear flap divides the ascending aorta or arch into a smaller True Lumen (systolic expansion) and larger False Lumen (slow swirl/thrombus). Look immediately in PLAX for acute Aortic Regurgitation (root distortion) and hemopericardium/tamponade — NEVER perform pericardiocentesis aggressively without surgical standby in Type A dissection!',
    echoFindingAr:
      'غشاء خطي رفيع متحرك (Intimal Flap) يقسم لمعة الأبهر الصاعد أو القوس إلى لمعة حقيقية تتوسع انقباضياً ولمعة كاذبة أوسع بطيئة الجريان. ابحث فوراً في PLAX عن قلس أبهري حاد أو انصباب تاموري مدمى، وجّه المريض للجراحة القلبية الإسعافية فوراً.',
    radiographCorrelationEn:
      'AP/PA Chest X-ray classic clues: Widened mediastinum (> 8 cm at aortic knob), blurred aortic knob contour, apical pleural cap (left hemothorax), calcium sign (intimal calcification displaced > 1 cm inward from outer aortic wall), and rightward tracheal/NG tube deviation.',
    radiographCorrelationAr:
      'على صورة الصدر الشعاعية: توسع المنصف العلوي (> 8 سم)، طمس قوس الأبهر، انصباب جنبي أيسر قمي، علامة انزياح الكالسيوم للداخل (>1 سم)، وانزياح الرغامى لليمين.',
    thresholdsEn: 'Ascending Ao > 4.0 cm + Mobile undulating flap independent of wall motion · Surgical emergency.',
    thresholdsAr: 'توسع الأبهر > 4.0 سم مع سديلة متحركة مستقلة عن جدار الأبهر = طارئ جراحي من الدرجة الأولى.',
    caseExampleEn:
      'Case: 68-year-old hypertensive male with sudden tearing chest pain radiating to scapula and unequal radial pulses. CXR shows 9.4 cm mediastinum; PLAX + Suprasternal confirm mobile ascending flap + moderate AR.',
    caseExampleAr:
      'حالة إسعافية: رجل 68 عاماً بألم صدري ممزق مفاجئ للظهر واختلاف النبض بين الذراعين. أظهرت الأشعة منصفاً بـ 9.4 سم، وكشف PLAX وفوق القص سديلة تسلخ أبهر صاعد.',
    echoImageUrl: IMG_ECHO_TEE,
    echoFallbackUrl: sampleEchoImg,
    radiographImageUrl: IMG_CXR_PNEUMO,
    radiographFallbackUrl: sampleChestImg,
    searchQuery: 'aortic dissection echocardiogram intimal flap',
    scene: 'SUPRASTERNAL'
  }
];

export const ECHO_DRILLS: EchoDrillQuestion[] = [
  {
    id: 'echo_d01_l1_knob',
    level: 'level-1',
    topicTagEn: 'L1 · Knobology',
    topicTagAr: 'المستوى 1 · ضبط الجهاز',
    stemEn:
      'During your initial PLAX view at 14 cm depth, blood appears smooth black and chambers look large, but the patient has sudden hypotension. Which knob adjustment MUST you perform before leaving PLAX?',
    stemAr:
      'أثناء فحص PLAX على عمق 14 سم، تظهر الحجرات كبيرة وواضحة لكن المريض هبط ضغطه فجأة. ما الضبط الفوري الواجب فعله قبل مغادرة PLAX؟',
    optionsEn: [
      'Increase Overall Gain to 90% to make walls brighter',
      'Temporarily increase Depth to 20–24 cm to look behind the heart for pericardial/pleural effusion',
      'Lower Color Nyquist Scale to 15 cm/s',
      'Switch to high-frequency linear vascular probe (12 MHz)'
    ],
    optionsAr: [
      'رفع الكسب الكلي Overall Gain إلى 90% لتبييض الجدران',
      'زيادة العمق مؤقتاً إلى 20–24 سم للبحث خلف القلب عن انصباب تاموري أو جنبي',
      'خفض مقياس نيكويست للملون إلى 15 سم/ث',
      'التبديل لمجس الأوعية الخطي عالي التردد (12 MHz)'
    ],
    correctIndex: 1,
    explanationEn:
      'ASE guidelines advise scanning initially at deep depth (20–24 cm) in PLAX so retrocardiac descending aorta, pericardial effusions, and pleural effusions are never cropped off the bottom of the screen.',
    explanationAr:
      'تنص إرشادات ASE على البدء بعمق 20–24 سم في مقطع PLAX لضمان رؤية الأبهر النازل والمسافة التامورية والجنبية الخلفية وعدم قص الانصبابات أسفل الشاشة.',
    reference: 'ASE 2019 Comprehensive TTE (Section 3: Image Acquisition)'
  },
  {
    id: 'echo_d02_l1_motion',
    level: 'level-1',
    topicTagEn: 'L1 · Probe Motion',
    topicTagAr: 'المستوى 1 · حركات المجس',
    stemEn:
      'You have obtained a centered Parasternal Long-Axis (PLAX) view with marker at 10 o’clock. To transition directly into Parasternal Short-Axis (PSAX), which precise movement should you execute?',
    stemAr:
      'حصلت على مقطع PLAX متمركز ومؤشر المجس عند الساعة 10. للانتقال مباشرة إلى المقطع القصير PSAX، ما الحركة الدقيقة الصحيحة؟',
    optionsEn: [
      'Slide two rib spaces down to the 5th ICS',
      'Keep footprint anchored and rotate 90° clockwise until marker points to 1–2 o’clock (left shoulder)',
      'Rotate 90° counter-clockwise to 7 o’clock',
      'Fan probe tail rightward toward the sternum without rotating'
    ],
    optionsAr: [
      'انزلاق مسافتين وربيتين للأسفل إلى المسافة الخامسة',
      'تثبيت موضع المجس وتدويره 90 درجة مع عقارب الساعة نحو الساعة 1–2 (الكتف الأيسر)',
      'تدوير 90 درجة عكس عقارب الساعة نحو الساعة 7',
      'إمالة ذيل المجس لليمين دون تدوير'
    ],
    correctIndex: 1,
    explanationEn:
      'Transitioning from PLAX (10–11 o’clock) to PSAX (1–2 o’clock) requires holding your optimal chest contact footprint steady and rotating 90° clockwise.',
    explanationAr:
      'للانتقال من PLAX (الساعة 10–11) إلى PSAX (الساعة 1–2) يُثبت المجس مكانه ويُدار 90 درجة مع عقارب الساعة باتجاه الكتف الأيسر.',
    reference: 'ASE 2019 TTE Protocol'
  },
  {
    id: 'echo_d03_l1_ecg',
    level: 'level-1',
    topicTagEn: 'L1 · ECG Timing',
    topicTagAr: 'المستوى 1 · التزامن القلبي',
    stemEn:
      'When measuring Left Atrial Volume Index (LAVI) by Biplane Simpson’s in A4C/A2C, which cardiac cycle phase must you freeze on?',
    stemAr:
      'عند قياس مؤشر حجم الأذين الأيسر (LAVI) في A4C/A2C، ما اللحظة الدقيقة من الدورة القلبية التي يجب التجميد عندها؟',
    optionsEn: [
      'LV End-Diastole (peak of QRS R-wave)',
      'Mid-diastolic diastasis',
      'LV End-Systole (just before Mitral Valve opening, when LA volume is maximal)',
      'During atrial kick (P-wave end)'
    ],
    optionsAr: [
      'نهاية انبساط البطين (ذروة موجة R)',
      'منتصف مرحلة ارتخاء الانبساط',
      'نهاية انقباض البطين (الإطار الذي يسبق انفتاح التاجي مباشرة حيث يكون الأذين بأقصى امتلاء)',
      'أثناء الانقباض الأذيني (نهاية موجة P)'
    ],
    correctIndex: 2,
    explanationEn:
      'LAVI measures maximum LA reservoir size, which occurs at ventricular END-SYSTOLE immediately before the mitral leaflets open.',
    explanationAr:
      'يُقاس حجم الأذين الأيسر في أقصى امتلاء له، وذلك في نهاية انقباض البطين (قمة موجة T) قبل انفتاح وريقات التاجي بإطار واحد.',
    reference: 'Lang RM, et al. ASE Chamber Quantification 2015'
  },
  {
    id: 'echo_d04_l2_plax',
    level: 'level-2',
    topicTagEn: 'L2 · PLAX Effusion Rule',
    topicTagAr: 'المستوى 2 · قاعدة الأبهر النازل',
    stemEn:
      'On a deep PLAX scan, a large anechoic fluid collection extends ANTERIOR to the circular descending thoracic aorta and tracks around the LV posterior wall. What does this confirm?',
    stemAr:
      'في مقطع PLAX عميق، يظهر تجمع سائل أسود يمتد أمام الدائرة المقطعية للأبهر الصدري النازل وحول الجدار الخلفي للبطين. ماذا يؤكد ذلك؟',
    optionsEn: [
      'Left Pleural Effusion',
      'Pericardial Effusion',
      'Left Upper Lobe Consolidation',
      'Coronary Sinus Dilation'
    ],
    optionsAr: [
      'انصباب جنبي أيسر (Pleural Effusion)',
      'انصباب تاموري (Pericardial Effusion)',
      'تصلد في الفص الرئوي العلوي الأيسر',
      'توسع في الجيب الإكليلي'
    ],
    correctIndex: 1,
    explanationEn:
      'The pericardial reflection terminates anterior to the descending aorta. Fluid anterior to the descending aorta is Pericardial; fluid tracking posterior to the descending aorta is Pleural.',
    explanationAr:
      'ينعكس كيس التامور أمام الأبهر النازل، لذا فكل سائل يقع أمام الأبهر النازل (بينه وبين الأذين الأيسر) هو انصباب تاموري، وخلفه انصباب جنبي.',
    reference: 'Otto CM. Clinical Echocardiography 7th Ed.'
  },
  {
    id: 'echo_d05_l2_psax',
    level: 'level-2',
    topicTagEn: 'L2 · PSAX D-Sign',
    topicTagAr: 'المستوى 2 · علامة حرف D',
    stemEn:
      'In PSAX at the mid-papillary level, the interventricular septum flattens prominently during SYSTOLE, distorting the circular LV into a "D" shape. What is the primary hemodynamic cause?',
    stemAr:
      'في المقطع القصير عند مستوى العضلات الحليمية، يتسطح الحجاب بين البطينين بشكل واضح أثناء الانقباض مشكلاً حرف D. ما التفسير الديناميكي الدقيق؟',
    optionsEn: [
      'Left Ventricular Hypertrophy',
      'RV Pressure Overload (e.g., Pulmonary Hypertension or Acute PE)',
      'Isolated RV Volume Overload (e.g., Uncomplicated ASD)',
      'Severe Mitral Stenosis without PH'
    ],
    optionsAr: [
      'ضخامة البطين الأيسر المركزية',
      'فرط حمل ضغطي على البطين الأيمن (مثل ارتفاع الضغط الرئوي أو الصمة الرئوية)',
      'فرط حمل حجمي معزول في الانبساط فقط (مثل ASD غير مختلطة)',
      'تضيق تاجي معزول دون ارتفاع ضغط رئوي'
    ],
    correctIndex: 1,
    explanationEn:
      'Systolic septal flattening (D-sign) indicates elevated RV systolic pressure overcoming LV systolic pressure (Pressure Overload), whereas isolated diastolic flattening points to Volume Overload.',
    explanationAr:
      'تسطح الحجاب في الانقباض يدل على فرط حمل ضغطي (Pressure Overload) يرفع ضغط البطين الأيمن في الانقباض، بينما التسطح الانبساطي المحض يشير لفرط الحمل الحجمي.',
    reference: 'ASE Right Heart Guidelines (Rudski et al.)'
  },
  {
    id: 'echo_d06_l2_rv',
    level: 'level-2',
    topicTagEn: 'L2 · A4C RV Indices',
    topicTagAr: 'المستوى 2 · مؤشرات البطين الأيمن',
    stemEn:
      'In an RV-focused A4C view, M-mode of the lateral tricuspid annulus shows TAPSE = 11 mm and TDI S’ = 6.8 cm/s. Which clinical interpretation is accurate?',
    stemAr:
      'في المقطع القمي الموجه للبطين الأيمن، أظهر M-Mode قيمة TAPSE = 11 ملم والدوبلر النسيجي S\' = 6.8 سم/ث. ما التقييم الصحيح؟',
    optionsEn: [
      'Normal RV longitudinal systolic function',
      'Hyperdynamic RV function',
      'Significant RV longitudinal systolic dysfunction (normal TAPSE ≥ 17 mm, S’ ≥ 9.5 cm/s)',
      'Purely isolated diastolic abnormality'
    ],
    optionsAr: [
      'وظيفة انقباضية طبيعية للبطين الأيمن',
      'فرط ديناميكية البطين الأيمن',
      'قصور انقباضي واضح في البطين الأيمن (الطبيعي TAPSE ≥ 17 ملم وS\' ≥ 9.5 سم/ث)',
      'خلل انبساطي معزول فقط'
    ],
    correctIndex: 2,
    explanationEn:
      'Per ASE chamber guidelines, TAPSE < 17 mm and lateral tricuspid TDI S’ < 9.5 cm/s objectively define Right Ventricular longitudinal systolic dysfunction.',
    explanationAr:
      'وفق إرشادات ASE، فإن انخفاض TAPSE عن 17 ملم وانخفاض S\' عن 9.5 سم/ث يؤكدان وجود ضعف انقباضي طولي في البطين الأيمن.',
    reference: 'Lang RM, et al. ASE/EACVI Right Heart Quantification'
  },
  {
    id: 'echo_d07_l3_bernoulli',
    level: 'level-3',
    topicTagEn: 'L3 · Hemodynamic Math',
    topicTagAr: 'المستوى 3 · حساب برنولي وPASP',
    stemEn:
      'CW Doppler of a clean Tricuspid Regurgitation jet reads Peak Velocity = 3.5 m/s. The subcostal IVC measures 2.4 cm with only 15% collapse on sniff. What is the estimated PASP?',
    stemAr:
      'سجل الدوبلر المستمر لقلس مثلث الشرف سرعة ذروة 3.5 م/ث، وقياس الـ IVC هو 2.4 سم مع انخماص 15% فقط أثناء الشفط. كم يساوي الضغط الانقباضي للشريان الرئوي PASP؟',
    optionsEn: [
      '39 mmHg',
      '52 mmHg',
      '64 mmHg',
      '75 mmHg'
    ],
    optionsAr: [
      '39 ملم زئبق',
      '52 ملم زئبق',
      '64 ملم زئبق',
      '75 ملم زئبق'
    ],
    correctIndex: 2,
    explanationEn:
      'RV-RA Gradient = 4 × V² = 4 × (3.5)² = 4 × 12.25 = 49 mmHg. Because IVC > 2.1 cm AND collapses < 50%, RAP = 15 mmHg. Total PASP = 49 + 15 = 64 mmHg.',
    explanationAr:
      'تدرج الضغط = 4 × (3.5)² = 4 × 12.25 = 49 ملم ز. وبما أن IVC > 2.1 سم وانخماصه < 50% فإن RAP = 15 ملم ز. إذن PASP = 49 + 15 = 64 ملم ز.',
    reference: 'ASE 2019 Doppler Hemodynamics'
  },
  {
    id: 'echo_d08_l3_diastology',
    level: 'level-3',
    topicTagEn: 'L3 · Diastolic Grading',
    topicTagAr: 'المستوى 3 · تصنيف الانبساطية',
    stemEn:
      'A 67-year-old with HFrEF (EF 38%) exhibits Mitral E/A = 1.4, Septal e’ = 5 cm/s, Lateral e’ = 7 cm/s, Avg E/e’ = 17, TR Vmax = 3.1 m/s, and LAVI = 42 mL/m². How do you grade diastolic function?',
    stemAr:
      'مريض 67 عاماً بقصور قلب (EF 38%) لديه E/A = 1.4، وe\' حاجزي 5، ووحشي 7، ومعدل E/e\' = 17، وTR Vmax = 3.1 م/ث، وLAVI = 42 مل/م². ما درجة خلل الانبساطية؟',
    optionsEn: [
      'Normal Diastolic Function',
      'Grade I (Impaired Relaxation — Normal LAP)',
      'Grade II (Pseudonormal — Elevated LAP)',
      'Grade III (Restrictive Filling)'
    ],
    optionsAr: [
      'وظيفة انبساطية طبيعية',
      'الدرجة الأولى (تأخر ارتخاء بضغط أذيني طبيعي)',
      'الدرجة الثانية (طبيعي كاذب مع ارتفاع ضغط الأذين الأيسر)',
      'الدرجة الثالثة (نمط حاصر شديد)'
    ],
    correctIndex: 2,
    explanationEn:
      'With E/A between 0.8 and 2.0 in HFrEF, three of three LAP criteria are positive (Avg E/e’ > 14, TR Vmax > 2.8 m/s, LAVI > 34 mL/m²), classifying this definitively as Grade II (Pseudonormal) with elevated LAP.',
    explanationAr:
      'بما أن نسبة E/A بين 0.8 و2.0، وتوفرت جميع معايير ارتفاع الضغط (E/e\' > 14 وTR > 2.8 وLAVI > 34)، فهي الدرجة الثانية (الطبيعي الكاذب) مع ارتفاع ضغط الأذين الأيسر.',
    reference: 'Nagueh SF, et al. ASE/EACVI Diastolic Guidelines 2016'
  },
  {
    id: 'echo_d09_l3_ava',
    level: 'level-3',
    topicTagEn: 'L3 · Continuity Equation',
    topicTagAr: 'المستوى 3 · معادلة الاستمرارية AVA',
    stemEn:
      'Calculate Aortic Valve Area (AVA): LVOT Diameter = 2.0 cm (Area ≈ 3.14 cm²), LVOT PW VTI = 20 cm, and highest CW Aortic Jet VTI = 80 cm.',
    stemAr:
      'احسب مساحة الصمام الأبهري AVA: قطر مخرج البطين LVOT = 2.0 سم (المساحة ≈ 3.14 سم²)، تكامل سرعة المخرج LVOT VTI = 20 سم، وتكامل سرعة الأبهر الأعلى AV VTI = 80 سم:',
    optionsEn: [
      '1.57 cm² (Mild AS)',
      '1.18 cm² (Moderate AS)',
      '0.79 cm² (Severe AS — Dimensionless Index 0.25)',
      '0.45 cm² (Critical AS)'
    ],
    optionsAr: [
      '1.57 سم² (تضيق بسيط)',
      '1.18 سم² (تضيق متوسط)',
      '0.79 سم² (تضيق شديد — والمؤشر اللاأبعادي 0.25)',
      '0.45 سم² (تضيق حرج)'
    ],
    correctIndex: 2,
    explanationEn:
      'Continuity Equation: AVA = (Area_LVOT × VTI_LVOT) / VTI_AV = (3.14 × 20) / 80 = 62.8 / 80 = 0.785 cm² ≈ 0.79 cm² (Severe AS ≤ 1.0 cm²).',
    explanationAr:
      'بمعادلة الاستمرارية: AVA = (3.14 × 20) ÷ 80 = 62.8 ÷ 80 = 0.785 سم² (أقل من 1.0 سم² = تضيق أبهري شديد).',
    reference: 'Baumgartner H, et al. Valve Stenosis Guidelines'
  },
  {
    id: 'echo_d10_l4_pe',
    level: 'level-4',
    topicTagEn: 'L4 · Emergency PE',
    topicTagAr: 'المستوى 4 · الصمة الرئوية',
    stemEn:
      'An acutely dyspneic patient has RV/LV = 1.25, hyperdynamic RV apex with akinetic mid-free wall, PAAT = 52 ms with mid-systolic notch, and TR peak gradient = 42 mmHg. What classic echo pair is present?',
    stemAr:
      'مريض بضيق نفس حاد لديه RV/LV = 1.25، حركة قمة بطين أيمن نشطة مع جمود الجدار الوسطي، وPAAT = 52 مل ث مع تدرج قلس مثلث شرف = 42 ملم ز. ما العلامتان الموصوفتان؟',
    optionsEn: [
      'Water-Bottle Heart + B-Bump',
      'McConnell’s Sign + 60/60 Sign (Acute Massive Pulmonary Embolism)',
      'Hockey-Stick AML + Kerley B Lines',
      'Annulus Reversus + SAM Dagger'
    ],
    optionsAr: [
      'قلب قنينة الماء + حدبة B',
      'علامة McConnell + علامة 60/60 (صمة رئوية حادة)',
      'عصا الهوكي + خطوط كيرلي B',
      'انعكاس الحلقة + موجة الخنجر SAM'
    ],
    correctIndex: 1,
    explanationEn:
      'Apical sparing with mid-free wall akinesis is McConnell’s Sign; PAAT < 60 ms paired with TR gradient < 60 mmHg is the 60/60 Sign — highly specific for acute PE.',
    explanationAr:
      'احتفاظ القمة بالانقباض مع سكون الجدار الوسطي هو علامة McConnell؛ وPAAT < 60 مل ث مع تدرج TR < 60 ملم ز هي علامة 60/60 النوعية جداً للصمة الرئوية الحادة.',
    reference: 'ESC / ASE Acute Pulmonary Embolism Echocardiography'
  },
  {
    id: 'echo_d11_l4_tamponade',
    level: 'level-4',
    topicTagEn: 'L4 · Tamponade Physiology',
    topicTagAr: 'المستوى 4 · الاندحاس القلبي',
    stemEn:
      'Which combination represents the EARLIEST and MOST SPECIFIC 2D/Doppler markers for Cardiac Tamponade rather than benign chronic effusion?',
    stemAr:
      'ما التركيبة التي تمثل المؤشر الأبكر والأكثر نوعيةً للاندحاس القلبي الحاد مقارنةً بالانصباب التاموري المزمن السليم؟',
    optionsEn: [
      'Plethoric IVC (>2.1 cm, <50% collapse) + Early Diastolic RV Free Wall Collapse + >25% Mitral Inflow Variation',
      'Small IVC (1.2 cm, 80% collapse) + Normal E/e’',
      'Aortic root 3.9 cm + LVEF 65%',
      'Isolated mitral annular calcification'
    ],
    optionsAr: [
      'وريد أجوف ممتلئ ثابت (>2.1 سم، <50% انخماص) + انخماص انبساطي مبكر لجدار البطين الأيمن + تباين >25% في التاجي',
      'وريد أجوف صغير (1.2 سم، 80% انخماص) مع نسبة E/e\' طبيعية',
      'جذر أبهر 3.9 سم مع كسر قذفي 65%',
      'تكلس معزول في الحلقة التاجية'
    ],
    correctIndex: 0,
    explanationEn:
      'IVC plethora has ~97% sensitivity; RV early diastolic collapse + respiratory inflow variation (>25% MV / >40% TV) confirm hemodynamic tamponade physiology requiring urgent drainage.',
    explanationAr:
      'امتلاء الـ IVC الثابت حساسيته ~97%، بينما يؤكد الانخماص الانبساطي للبطين الأيمن وتباين التدفق التنفسي (>25% تاجي) حدوث الاندحاس القلبي الحقيقي.',
    reference: 'RUSH & ASE Pericardial Disease Consensus'
  },
  {
    id: 'echo_d12_l4_closing',
    level: 'level-4',
    topicTagEn: 'L4 · Final Sign-Off',
    topicTagAr: 'المستوى 4 · ختام التقرير النهائي',
    stemEn:
      'Before completing an exam with suspected Aortic Stenosis where A5C gave Vmax 3.4 m/s but PLAX showed severely immobile calcified leaflets, what mandatory step completes ASE acquisition before signing off?',
    stemAr:
      'قبل ختام فحص لمريض يشتبه بإصابته بتضيق أبهري أظهر فيه A5C سرعة 3.4 م/ث بينما بدا الصمام شديد التكلس وقليل الانفتاح في PLAX، ما الخطوة الإلزامية قبل توقيع التقرير؟',
    optionsEn: [
      'Sign the report as Moderate AS immediately',
      'Interrogate the Aortic Valve from A3C, Right Upper Sternal Border (RLD), and Suprasternal Notch to find true parallel peak Vmax',
      'Decrease Color Doppler Nyquist to 20 cm/s',
      'Report only EPSS'
    ],
    optionsAr: [
      'توقيع التقرير فوراً على أنه تضيق أبهري متوسط',
      'إعادة فحص سرعة الصمام الأبهري عبر A3C وحافة القص اليمنى (باستلقاء أيمن) وفوق القص للوصول لأقصى سرعة حقيقية',
      'خفض حد نيكويست في الدوبلر الملون إلى 20 سم/ث',
      'الاعتماد على EPSS فقط'
    ],
    correctIndex: 1,
    explanationEn:
      'Multi-window CW Doppler (A5C + A3C + Right Sternal Border + Suprasternal) is mandatory because eccentric AS jets are missed in A5C in ~20% of patients, shifting Moderate (3.4 m/s) to Severe (≥4.0 m/s)!',
    explanationAr:
      'إلزامية الفحص متعدد النوافذ لأن نفثة التضيق الأبهري المائلة قد تُسجل 3.4 م/ث في القمي وتظهر 4.3 م/ث (تضيق شديد!) عند فحصها من حافة القص اليمنى أو A3C.',
    reference: 'Baumgartner H, et al. ASE/EACVI Valve Stenosis Guidelines'
  }
];

export const ECHO_FINAL_CHECKLIST: EchoChecklistStep[] = [
  {
    id: 'chk_01',
    stepNumber: 1,
    categoryEn: 'Calibration & Identity',
    categoryAr: 'الهوية والمعايرة',
    titleEn: 'Verify Patient ID, Rhythm, Heart Rate & BP + Quality Score',
    titleAr: 'التحقق من بيانات المريض، النظم والنبض، ضغط الدم، وجودة الصورة',
    detailEn: 'Ensure 3-lead ECG gating is visible on all cine clips and systolic BP is recorded (crucial for AS & MR interpretation).',
    detailAr: 'التأكد من ثبات موجة تخطيط القلب وتسجيل ضغط الدم وقت الفحص لأنه يؤثر على تفسير تدرجات الصمامات.'
  },
  {
    id: 'chk_02',
    stepNumber: 2,
    categoryEn: 'Left Ventricle Dimensions',
    categoryAr: 'أبعاد وسماكة البطين الأيسر',
    titleEn: 'Document IVSd, LVIDd, LVIDs, LVPWd & LV Mass Index',
    titleAr: 'توثيق سماكة الحجاب والجدار الخلفي وقطري البطين الانبساطي والانقباضي',
    detailEn: 'Taken perpendicular to LV long axis in 2D PLAX at mitral leaflet tips level without trabeculation overlap.',
    detailAr: 'مقاسة عمودياً في PLAX عند ذروة وريقات التاجي مع نفي الشذوذات الكاذبة.'
  },
  {
    id: 'chk_03',
    stepNumber: 3,
    categoryEn: 'LV Systolic Function',
    categoryAr: 'الوظيفة الانقباضية للبطين الأيسر',
    titleEn: 'Calculate Biplane Simpson LVEF (%) + 17-Segment Wall Motion + GLS',
    titleAr: 'حساب الكسر القذفي سيمبسون ثنائي المستوى (A4C+A2C) وحركية القطع الـ 17',
    detailEn: 'Report quantitative LVEF% (normal M ≥52%, F ≥54%), any regional hypokinesia/akinesia by coronary territory, and EPSS.',
    detailAr: 'إثبات نسبة EF الدقيقة، وتحديد أي ضعف موضعي وربطه بالشريان الإكليلي المغذي، وتسجيل EPSS.'
  },
  {
    id: 'chk_04',
    stepNumber: 4,
    categoryEn: 'LV Diastolic Function',
    categoryAr: 'الوظيفة الانبساطية للبطين الأيسر',
    titleEn: 'Synthesize E, A, E/A, DT, Septal/Lateral e’, Avg E/e’ & Grade (I–III)',
    titleAr: 'دمج موجات E/A وزمن التباطؤ DT والنسيجي e\' ونسبة E/e\' وتحديد الدرجة',
    detailEn: 'Apply Nagueh 2016 algorithm cleanly separating Normal, Grade I (Normal LAP), Grade II (Pseudonormal), and Grade III (Restrictive).',
    detailAr: 'تطبيق خوارزمية Nagueh 2016 للتمييز الدقيق بين الطبيعي والدرجات الثلاث للخلل الانبساطي.'
  },
  {
    id: 'chk_05',
    stepNumber: 5,
    categoryEn: 'Left Atrium',
    categoryAr: 'الأذين الأيسر',
    titleEn: 'Measure LA Volume Index (LAVI mL/m²) at Ventricular End-Systole',
    titleAr: 'حساب مؤشر حجم الأذين الأيسر LAVI (مل/م²) في نهاية انقباض البطين',
    detailEn: 'Biplane A4C + A2C non-foreshortened LA tracing divided by BSA (Normal ≤ 34 mL/m²). Note IAS mobility or ASD/PFO.',
    detailAr: 'الطبيعي ≤ 34 مل/م²، مع توثيق سلامة الحجاب بين الأذينين.'
  },
  {
    id: 'chk_06',
    stepNumber: 6,
    categoryEn: 'Right Ventricle',
    categoryAr: 'البطين الأيمن',
    titleEn: 'Report RV Basal Size, Free Wall Thickness, TAPSE, TDI S’ & D-Sign',
    titleAr: 'تقييم قطر قاعدة البطين الأيمن وسماكة الجدار وTAPSE وS\' وعلامة حرف D',
    detailEn: 'Use RV-focused A4C: TAPSE ≥ 17 mm, S’ ≥ 9.5 cm/s, RV basal ≤ 41 mm, and check PSAX for systolic vs diastolic septal flattening.',
    detailAr: 'التحقق من TAPSE ≥ 17 ملم وS\' ≥ 9.5 سم/ث وسماكة الجدار الحر < 5 ملم.'
  },
  {
    id: 'chk_07',
    stepNumber: 7,
    categoryEn: 'Right Atrium & IVC (RAP)',
    categoryAr: 'الأذين الأيمن والوريد الأجوف',
    titleEn: 'Record RA Area/Volume & Subcostal IVC Diameter + Sniff Collapse (RAP)',
    titleAr: 'تقدير ضغط الأذين الأيمن RAP عبر قطر الوريد الأجوف السفلي وانخماصه',
    detailEn: 'Assign 3, 8, or 15 mmHg explicitly per ASE IVC criteria (2.1 cm & 50% collapse cutoffs).',
    detailAr: 'تحديد القيمة 3 أو 8 أو 15 ملم زئبق وفق عتبة 2.1 سم ونسبة 50% انخماص.'
  },
  {
    id: 'chk_08',
    stepNumber: 8,
    categoryEn: 'Aortic Valve & Root',
    categoryAr: 'الصمام الأبهري وجذر الأبهر',
    titleEn: 'Document Cusp Number, Root Dimensions, LVOT VTI, AV Vmax, Mean ΔP & AVA',
    titleAr: 'توثيق عدد الشرفات وأبعاد جذر الأبهر وسرعة الأبهري العليا ومساحة الصمام AVA',
    detailEn: 'Confirm multi-window interrogation (A5C/A3C/RUSB) if stenosis present; check AR PHT & descending Ao flow reversal.',
    detailAr: 'التأكد من قياس السرعة من عدة نوافذ في التضيق وفحص ارتداد الأبهر في القلس.'
  },
  {
    id: 'chk_09',
    stepNumber: 9,
    categoryEn: 'Mitral Valve',
    categoryAr: 'الصمام التاجي',
    titleEn: 'Assess Leaflet Morphology, Stenosis (Planimetry/PHT) & MR (VC / EROA)',
    titleAr: 'وصف بنية الوريقات التاجية وتحديد شدة التضيق أو القلس بـ VC وPISA',
    detailEn: 'Differentiate primary prolapse/flail vs secondary functional tethering; check systolic pulmonary vein reversal.',
    detailAr: 'التمييز بين التدلّي الأولي والقلس الوظيفي الثانوي مع توثيق EROA.'
  },
  {
    id: 'chk_10',
    stepNumber: 10,
    categoryEn: 'Tricuspid, Pulmonic & PASP',
    categoryAr: 'مثلث الشرف والرئوي وضغط الشريان',
    titleEn: 'Calculate PASP = 4(TR Vmax)² + RAP & Pulmonic Acceleration Time',
    titleAr: 'حساب الضغط الانقباضي للشريان الرئوي PASP وزمن التسارع PAAT',
    detailEn: 'Evaluate TR Vmax across A4C, RV Inflow, and PSAX; screen PAAT (< 60 ms suggests acute PE strain).',
    detailAr: 'رصد أعلى سرعة قلس مثلث الشرف وتقدير احتمالية فرط التوتر الرئوي.'
  },
  {
    id: 'chk_11',
    stepNumber: 11,
    categoryEn: 'Pericardium, Great Vessels & Pleura',
    categoryAr: 'التامور والأبهر والجنب',
    titleEn: 'Screen Pericardial Space, Suprasternal Arch & Posterior Pleural Space',
    titleAr: 'فحص التامور وقوس الأبهر فوق القص والفضاء الجنبي الخلفي',
    detailEn: 'Verify Descending Aorta anterior/posterior rule, check arch coarctation or dissection flap, and document effusion size.',
    detailAr: 'التأكد من خلو التامور والأبهر من الانصباب أو السديلة التسلخية والتمييز عن الانصباب الجنبي.'
  },
  {
    id: 'chk_12',
    stepNumber: 12,
    categoryEn: 'Radiology Link & Critical Sign-Off',
    categoryAr: 'الربط الشعاعي والإغلاق النهائي',
    titleEn: 'Cross-Check CXR/CT Findings, Complete Practical Audit & Issue Urgent Alerts',
    titleAr: 'مطابقة الأشعة الصدرية، حفظ كل المقاطع، وإبلاغ التنبيهات الحرجة فوراً',
    detailEn: 'Immediately telephone primary team if Tamponade, Aortic Dissection, Massive PE, LV Thrombus, or Severe Symptomatic AS is present.',
    detailAr: 'التواصل الفوري مع الفريق المعالج عند رصد اندحاس قلبي، تسلخ أبهر، صمة رئوية كبرى، أو خثرة بطينية قبل تسليم التقرير.'
  }
];

export interface EchoProbeClockMeta {
  deg: number;
  clock: string;
  siteEn: string;
  siteAr: string;
}

export const ECHO_PROBE_CLOCK_POSITIONS: Record<EchoSceneId, EchoProbeClockMeta> = {
  KNOBOLOGY: { deg: 315, clock: '10:30', siteEn: '3rd–4th LICS Calibration', siteAr: 'المسافة الوربية 3–4 (ضبط الجهاز)' },
  PLAX: { deg: 315, clock: '10:30', siteEn: '3rd–4th LICS Left Sternal Border', siteAr: 'جوار القص الأيسر 3–4' },
  PSAX_AV: { deg: 45, clock: '1:30', siteEn: '3rd–4th LICS (Rotate 90° CW)', siteAr: 'جوار القص (تدوير 90° مع العقارب)' },
  PSAX_PM: { deg: 45, clock: '1:30', siteEn: '3rd–4th LICS (Inferior LV Tilt)', siteAr: 'جوار القص (إمالة نحو القمة)' },
  A4C: { deg: 90, clock: '3:00', siteEn: '5th LICS Apical Impulse (PMI)', siteAr: 'القمة القلبية 5th LICS' },
  A5C_A2C_A3C: { deg: 15, clock: '12:30', siteEn: '5th LICS (CCW 60°–120° Rotation)', siteAr: 'القمة (تدوير عكس العقارب)' },
  SUBCOSTAL_IVC: { deg: 0, clock: '12:00', siteEn: 'Subxiphoid Epigastric Window', siteAr: 'تحت الناتئ الرهابي (الشراسيفي)' },
  SUPRASTERNAL: { deg: 30, clock: '1:00', siteEn: 'Suprasternal Jugular Notch', siteAr: 'الثلمة الوداجية فوق القص' },
  DOPPLER_AS: { deg: 90, clock: '3:00', siteEn: 'A5C / Right Upper Sternal Border', siteAr: 'القمي الخماسي / حافة القص اليمنى' },
  TAMPONADE: { deg: 0, clock: '12:00', siteEn: 'Subcostal Emergency Window', siteAr: 'النافذة تحت الضلعية الإسعافية' },
  MCCONNELL: { deg: 90, clock: '3:00', siteEn: 'RV-Focused Apical 4-Chamber', siteAr: 'قمي رباعي موجه للبطين الأيمن' }
};

export interface EchoRealVideoClip {
  id: string;
  titleEn: string;
  titleAr: string;
  videoUrl: string;
  sourceLabel: string;
  sourcePageUrl: string;
  searchQuery: string;
}

export const ECHO_REAL_VIDEO_MAP: Record<EchoSceneId, EchoRealVideoClip[]> = {
  KNOBOLOGY: [
    {
      id: 'vid_knob_plax_real',
      titleEn: 'Real 2D TTE Sector — PLAX Gain, Depth & Pericardial Fat Differentiation',
      titleAr: 'فيديو إيكو سريري حقيقي (PLAX) — ضبط العمق والكسب والتمييز التاموري',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a0/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound Journal (Peer-Reviewed Open Cine)',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv',
      searchQuery: 'echocardiogram parasternal long axis'
    },
    {
      id: 'vid_knob_resp_s1',
      titleEn: 'Real Clinical Apical Acquisition & Respirophasic Calibration',
      titleAr: 'مقطع فحص سريري حقيقي لمعايرة القمة القلبية مع التنفس',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ad/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S1.ogv/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S1.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Respiratory Maneuvers Atlas',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S1.ogv',
      searchQuery: 'echocardiogram calibration'
    }
  ],
  PLAX: [
    {
      id: 'vid_plax_1',
      titleEn: 'Real Parasternal Long Axis (PLAX) Clinical Cine Loop',
      titleAr: 'فيديو إيكو سريري حقيقي لمحور القص الطولي (PLAX)',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a0/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound (2009) · PLAX Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S1.ogv',
      searchQuery: 'parasternal long axis echocardiogram'
    },
    {
      id: 'vid_plax_hocm_sam',
      titleEn: 'Real PLAX Pathologic Cine — Asymmetric Septal Hypertrophy & SAM (HOCM)',
      titleAr: 'فيديو إيكو مرضي حقيقي (PLAX) — ضخامة الحجاب وحركة SAM في HOCM',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/19/Hypertrophic_Cardiomyopathy_-_Echocardiogram_-_Sam.ogv/Hypertrophic_Cardiomyopathy_-_Echocardiogram_-_Sam.ogv.240p.vp9.webm',
      sourceLabel: 'Wikimedia Clinical Echocardiography Archive · HOCM SAM',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Hypertrophic_Cardiomyopathy_-_Echocardiogram_-_Sam.ogv',
      searchQuery: 'hypertrophic cardiomyopathy echocardiogram'
    }
  ],
  PSAX_AV: [
    {
      id: 'vid_psax_av_1',
      titleEn: 'Real PSAX Clinical Cine — Aortic Valve / Bicuspid & Root Assessment',
      titleAr: 'فيديو إيكو سريري حقيقي (PSAX) — تقييم الصمام الأبهري وجذر الأبهر',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3b/Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv/Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Bicuspid Aortic Valve Case Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv',
      searchQuery: 'parasternal short axis aortic valve echocardiogram'
    },
    {
      id: 'vid_psax_av_2',
      titleEn: 'Real PSAX Pericardial & Right-Sided Interface Cine',
      titleAr: 'فيديو إيكو سريري حقيقي لمستوى قاعدة القلب والمحور القصير',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0d/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Short-Axis Clinical Loop',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv',
      searchQuery: 'echocardiogram short axis'
    }
  ],
  PSAX_PM: [
    {
      id: 'vid_psax_pm_1',
      titleEn: 'Real PSAX Mid-LV Clinical Cine — Wall Motion & Septal Curvature',
      titleAr: 'فيديو إيكو حقيقي لمستوى العضلات الحليمية (PSAX Mid-LV) — انقباض الجدران والحجاب',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0d/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv/Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Mid-Ventricular Short Axis',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Pseudo-cardiac-tamponade-in-the-setting-of-excess-pericardial-fat-1476-7120-7-3-S2.ogv',
      searchQuery: 'echocardiogram left ventricle short axis'
    },
    {
      id: 'vid_psax_pm_ami',
      titleEn: 'Real Clinical Cine — Acute Myocardial Infarction Regional Wall Motion Defect',
      titleAr: 'فيديو سريري حقيقي لنقص الحركية الموضع في احتشاء عضلة القلب الحاد',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5c/The-Drop-That-Spilled-the-Cup-Acute-Myocardial-Infarction-in-a-Young-Woman-with-Underlying-249715.f1.ogv/The-Drop-That-Spilled-the-Cup-Acute-Myocardial-Infarction-in-a-Young-Woman-with-Underlying-249715.f1.ogv.240p.vp9.webm',
      sourceLabel: 'Case Reports in Cardiology · Acute MI Echocardiogram',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:The-Drop-That-Spilled-the-Cup-Acute-Myocardial-Infarction-in-a-Young-Woman-with-Underlying-249715.f1.ogv',
      searchQuery: 'myocardial infarction echocardiogram'
    }
  ],
  A4C: [
    {
      id: 'vid_a4c_1',
      titleEn: 'Real Apical 4-Chamber (A4C) — Chamber Function & Respiratory Physiology',
      titleAr: 'فيديو إيكو سريري حقيقي للمقطع القمي رباعي الحجرات (A4C)',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3e/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S3.ogv/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S3.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Apical 4-Chamber Clinical Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S3.ogv',
      searchQuery: 'apical four chamber echocardiogram'
    },
    {
      id: 'vid_a4c_cardiomyopathy',
      titleEn: 'Real Clinical A4C Cine — Severe Acute Cardiomyopathy Hypokinesia',
      titleAr: 'فيديو سريري حقيقي (A4C) — ضعف انقباض شمولي في اعتلال العضلة القلبية',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6d/Influenza-Induced-Cardiomyopathy-An-Unusual-Cause-of-Hypoxemia-738146.f1.ogv/Influenza-Induced-Cardiomyopathy-An-Unusual-Cause-of-Hypoxemia-738146.f1.ogv.240p.vp9.webm',
      sourceLabel: 'Case Reports in Critical Care · Cardiomyopathy Echo',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Influenza-Induced-Cardiomyopathy-An-Unusual-Cause-of-Hypoxemia-738146.f1.ogv',
      searchQuery: 'cardiomyopathy echocardiogram'
    }
  ],
  A5C_A2C_A3C: [
    {
      id: 'vid_a5c_a3c_1',
      titleEn: 'Real Apical Long-Axis / Mitral Annular & LVOT Clinical Cine',
      titleAr: 'فيديو إيكو سريري حقيقي للمقاطع القمية المدارة والصمام التاجي والأبهري',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/33/Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv/Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Mitral Valve & Apical Long-Axis Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv',
      searchQuery: 'mitral valve prolapse echocardiogram'
    },
    {
      id: 'vid_a2c_stress',
      titleEn: 'Real Apical 2-Chamber / Stress Echocardiography Clinical Cine',
      titleAr: 'فيديو إيكو سريري حقيقي للمقطع القمي ثنائي الحجرات وإيكو الجهد',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b8/Exercise_echocardiography_in_diabetic_patients_-_1476-7120-7-24-S1.wmv.ogv/Exercise_echocardiography_in_diabetic_patients_-_1476-7120-7-24-S1.wmv.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Exercise Echo Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Exercise_echocardiography_in_diabetic_patients_-_1476-7120-7-24-S1.wmv.ogv',
      searchQuery: 'stress echocardiography'
    }
  ],
  SUBCOSTAL_IVC: [
    {
      id: 'vid_subcostal_1',
      titleEn: 'Real Clinical Cine — Respiratory IVC / Venous Return Assessment',
      titleAr: 'فيديو إيكو سريري حقيقي لتقييم الوريد الأجوف السفلي والتغيرات التنفسية',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/18/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S6.ogv/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S6.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Respiratory IVC & Right Heart Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S6.ogv',
      searchQuery: 'inferior vena cava ultrasound echocardiogram'
    }
  ],
  SUPRASTERNAL: [
    {
      id: 'vid_supra_1',
      titleEn: 'Real Clinical Cine — Great Vessels & Dynamic Flow Maneuver Loop',
      titleAr: 'فيديو إيكو سريري حقيقي للأوعية الكبرى وتغيرات الجريان السريرية',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S8.ogv/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S8.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Thoracic Vascular Flow Loop',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S8.ogv',
      searchQuery: 'aortic arch echocardiography'
    }
  ],
  DOPPLER_AS: [
    {
      id: 'vid_doppler_as_1',
      titleEn: 'Real Color & Structural Aortic Valve Cine — Severe Bicuspid Disease',
      titleAr: 'فيديو إيكو سريري حقيقي (دوبلر ملون) — آفة صمام أبهري شديدة',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3b/Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv/Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Color Doppler Valve Loop',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Uncommon-acquired-Gerbode-defect-following-extensive-bicuspid-aortic-valve-endocarditis-1476-7120-10-7-S9.ogv',
      searchQuery: 'aortic stenosis doppler echocardiogram'
    },
    {
      id: 'vid_doppler_mr_1',
      titleEn: 'Real Clinical Cine — Mitral Leaflet Coaptation & Regurgitation Mechanics',
      titleAr: 'فيديو إيكو سريري حقيقي لآلية انطباق وقلس الصمام التاجي',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/33/Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv/Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Myxomatous Mitral Valve Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Mitral-annular-disjunction-in-myxomatous-mitral-valve-disease-a-relevant-abnormality-recognizable-1476-7120-8-53-S1.ogv',
      searchQuery: 'mitral regurgitation color doppler echocardiogram'
    }
  ],
  TAMPONADE: [
    {
      id: 'vid_tamponade_1',
      titleEn: 'Real Emergency Echo Cine — Cardiac Tamponade & Chamber Compression',
      titleAr: 'فيديو إيكو إسعافي حقيقي — الاندحاس القلبي وانضغاط الحجرات التاموري',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e8/Echocardiography-of-isolated-subacute-left-heart-tamponade-in-a-patient-with-cor-pulmonale-and-1476-7120-8-27-S4.ogv/Echocardiography-of-isolated-subacute-left-heart-tamponade-in-a-patient-with-cor-pulmonale-and-1476-7120-8-27-S4.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Clinical Cardiac Tamponade Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Echocardiography-of-isolated-subacute-left-heart-tamponade-in-a-patient-with-cor-pulmonale-and-1476-7120-8-27-S4.ogv',
      searchQuery: 'cardiac tamponade pericardial effusion echocardiogram'
    }
  ],
  MCCONNELL: [
    {
      id: 'vid_mcconnell_1',
      titleEn: 'Real Emergency Echo Cine — Acute Pulmonary Embolism & Right Heart Embolus',
      titleAr: 'فيديو إيكو إسعافي حقيقي — صمة رئوية حادة وإجهاد البطين الأيمن',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ec/Echocardiographic-diagnosis-management-and-monitoring-of-pulmonary-embolism-with-right-heart-1476-7120-8-18-S2.ogv/Echocardiographic-diagnosis-management-and-monitoring-of-pulmonary-embolism-with-right-heart-1476-7120-8-18-S2.ogv.240p.vp9.webm',
      sourceLabel: 'Cardiovascular Ultrasound · Acute PE Right Heart Cine',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Echocardiographic-diagnosis-management-and-monitoring-of-pulmonary-embolism-with-right-heart-1476-7120-8-18-S2.ogv',
      searchQuery: 'pulmonary embolism right ventricle echocardiogram'
    },
    {
      id: 'vid_mcconnell_2',
      titleEn: 'Real Emergency Echo Cine — High-Risk PE Transvalvular Thrombus-in-Transit',
      titleAr: 'فيديو إيكو إسعافي حقيقي — خثرة عابرة عبر الصمام في صمة رئوية عالية الخطورة',
      videoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a5/Right-Heart-Transvalvular-Embolus-with-High-Risk-Pulmonary-Embolism-in-a-Recently-Hospitalized-481357.f1.ogv/Right-Heart-Transvalvular-Embolus-with-High-Risk-Pulmonary-Embolism-in-a-Recently-Hospitalized-481357.f1.ogv.240p.vp9.webm',
      sourceLabel: 'Case Reports in Cardiology · Massive PE Embolus-in-Transit',
      sourcePageUrl:
        'https://commons.wikimedia.org/wiki/File:Right-Heart-Transvalvular-Embolus-with-High-Risk-Pulmonary-Embolism-in-a-Recently-Hospitalized-481357.f1.ogv',
      searchQuery: 'pulmonary embolism echocardiogram'
    }
  ]
};

