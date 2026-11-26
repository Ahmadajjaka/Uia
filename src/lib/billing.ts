export type FeatureKey =
  | 'ai_doctor_consult'
  | 'diagnosis_workup'
  | 'lab_ai_interpret'
  | 'radiology_vision'
  | 'clinical_protocol_ai'
  | 'pharma_ai_consult'
  | 'clinic_suite'
  | 'themes_3d_premium';

export interface FeatureMeta {
  key: FeatureKey;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  defaultCost: number;
  defaultProOnly: boolean;
}

export const FEATURE_CATALOG_META: FeatureMeta[] = [
  {
    key: 'ai_doctor_consult',
    labelEn: 'AI Doctor Consultation',
    labelAr: 'استشارة الطبيب الذكي',
    descEn: 'Clinical dialogue & structured synthesis via Groq / xAI / Z.AI',
    descAr: 'محادثة سريرية وتحليل ذكي عبر نماذج الذكاء الاصطناعي',
    defaultCost: 5,
    defaultProOnly: false
  },
  {
    key: 'diagnosis_workup',
    labelEn: 'Differential Diagnosis',
    labelAr: 'التشخيص التفريقي الذكي',
    descEn: 'Ranked differential hypotheses with probability reasoning',
    descAr: 'توليد التشخيصات التفريقية المرتبة مع أسباب الترجيح',
    defaultCost: 8,
    defaultProOnly: false
  },
  {
    key: 'lab_ai_interpret',
    labelEn: 'Lab AI & Vision Extraction',
    labelAr: 'تحليل المختبرات والصور',
    descEn: 'Automated biomarker interpretation and lab sheet OCR',
    descAr: 'تفسير القيم المخبرية وقراءة صور تقارير المختبر',
    defaultCost: 6,
    defaultProOnly: false
  },
  {
    key: 'radiology_vision',
    labelEn: 'Radiology PACS Vision',
    labelAr: 'قراءة صور الأشعة بالذكاء الاصطناعي',
    descEn: 'Multimodal Z.AI GLM Vision analysis for X-Ray, CT, MRI & Echo',
    descAr: 'تحليل متقدم لصور الأشعة والرنين والموجات الصوتية',
    defaultCost: 12,
    defaultProOnly: true
  },
  {
    key: 'clinical_protocol_ai',
    labelEn: 'Clinical Protocol Synthesis',
    labelAr: 'تلخيص البروتوكولات السريرية',
    descEn: 'Live evidence-based clinical guideline synthesis',
    descAr: 'تلخيص الإرشادات والبروتوكولات العلمية المعتمدة',
    defaultCost: 5,
    defaultProOnly: false
  },
  {
    key: 'pharma_ai_consult',
    labelEn: 'AI Clinical Pharmacist',
    labelAr: 'المستشار الدوائي الذكي (20K)',
    descEn: 'Deep pharmacological dosing & multi-drug interaction consult',
    descAr: 'استشارة دوائية متعمقة للجرعات والتداخلات من قاعدة 20 ألف دواء',
    defaultCost: 3,
    defaultProOnly: false
  },
  {
    key: 'clinic_suite',
    labelEn: 'Pro Clinic EHR & Reports',
    labelAr: 'منظومة العيادات والتقارير (برو)',
    descEn: 'Patient registry, SOAP encounter tracking & formal reports',
    descAr: 'إدارة ملفات المرضى والزيارات والتقارير السريرية الكاملة',
    defaultCost: 4,
    defaultProOnly: true
  },
  {
    key: 'themes_3d_premium',
    labelEn: 'Premium 3D Spatial Themes',
    labelAr: 'ثيمات 3D المتقدمة (برو)',
    descEn: 'Unlocks Obsidian Gold, Cardiac Crimson & Arctic Sapphire 3D scenes',
    descAr: 'تفعيل الثيمات ثلاثية الأبعاد الفاخرة للمجسمات والواجهة',
    defaultCost: 0,
    defaultProOnly: true
  }
];

export type FeatureCostMap = Record<FeatureKey, number>;

export interface FeaturePricingConfig {
  costs: FeatureCostMap;
  proFeatures: FeatureKey[];
  starterApprovalPoints: number;
  proMonthlyPointsBonus: number;
}

export const DEFAULT_FEATURE_PRICING: FeaturePricingConfig = {
  costs: {
    ai_doctor_consult: 5,
    diagnosis_workup: 8,
    lab_ai_interpret: 6,
    radiology_vision: 12,
    clinical_protocol_ai: 5,
    pharma_ai_consult: 3,
    clinic_suite: 4,
    themes_3d_premium: 0
  },
  proFeatures: ['radiology_vision', 'clinic_suite', 'themes_3d_premium'],
  starterApprovalPoints: 50,
  proMonthlyPointsBonus: 500
};

export interface TopupPackageOption {
  id: string;
  requestType: 'points' | 'pro_upgrade';
  points: number;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  priceLabel: string;
}

export const TOPUP_PACKAGES: TopupPackageOption[] = [
  {
    id: 'pkg-100',
    requestType: 'points',
    points: 100,
    titleEn: '100 Clinical Points',
    titleAr: 'شحن 100 نقطة طبية',
    subtitleEn: 'Ideal for ~15-20 AI consults & lab interpretations',
    subtitleAr: 'مناسبة لحوالي 15-20 استشارة ذكية وتحليل مخبري',
    priceLabel: '$9'
  },
  {
    id: 'pkg-500',
    requestType: 'points',
    points: 500,
    titleEn: '500 Clinical Points',
    titleAr: 'شحن 500 نقطة طبية',
    subtitleEn: 'High-volume diagnostic, lab & pharmacology workflows',
    subtitleAr: 'باقة مكثفة للتشخيص والمختبرات والاستشارات الدوائية',
    priceLabel: '$35'
  },
  {
    id: 'pkg-1500',
    requestType: 'points',
    points: 1500,
    titleEn: '1,500 Institutional Points',
    titleAr: 'شحن 1,500 نقطة مؤسسية',
    subtitleEn: 'Departmental credit allocation for teams & clinics',
    subtitleAr: 'رصيد موسع للأقسام الطبية والعيادات المتخصصة',
    priceLabel: '$89'
  },
  {
    id: 'pkg-pro',
    requestType: 'pro_upgrade',
    points: 500,
    titleEn: 'MAMO MED PRO Membership (+500 pts)',
    titleAr: 'ترقية عضوية MAMO MED PRO (+500 نقطة)',
    subtitleEn: 'Unlocks Pro Radiology Vision, Pro Clinic EHR & Premium 3D Themes',
    subtitleAr: 'تفتح أشعة برو والعيادة الاحترافية وثيمات 3D المتقدمة مع 500 نقطة',
    priceLabel: '$49/mo'
  }
];
