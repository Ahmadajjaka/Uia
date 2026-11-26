import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  ChevronDown,
  FlaskConical,
  Globe,
  HeartPulse,
  Microscope,
  Pill,
  Scan,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useApp, type MedicalModuleId } from '../../contexts/AppContext';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface LandingModuleItem {
  id: MedicalModuleId;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: typeof Brain;
  accent: string;
}

const LANDING_MODULES: LandingModuleItem[] = [
  {
    id: 'ai-doctor',
    titleEn: 'AI Doctor',
    titleAr: 'الطبيب الذكي',
    descEn: 'Multi-turn clinical reasoning with citations, uncertainty bounds, and visual scan routing.',
    descAr: 'محادثة طبية سريرية موثقة بالمراجع ودرجة عدم اليقين مع دعم الصور والملفات.',
    icon: Stethoscope,
    accent: 'text-[#22D3EE]'
  },
  {
    id: 'diagnosis',
    titleEn: 'Differential Diagnosis',
    titleAr: 'التشخيص التفريقي',
    descEn: 'Structured symptom, vitals, and lab intake producing ranked diagnostic hypotheses.',
    descAr: 'تحليل منظم للأعراض والعلامات الحيوية والمختبر مع عرض أسباب الترجيح.',
    icon: Brain,
    accent: 'text-[#38BDF8]'
  },
  {
    id: 'lab-analyzer',
    titleEn: 'Lab Analyzer',
    titleAr: 'محلل المختبرات',
    descEn: 'Biomarker parsing via Z.AI Vision, reference-range flags, and longitudinal trends.',
    descAr: 'قراءة صور وتقارير المختبر مع رسوم بيانية وتمييز القيم الخارجة عن المجال.',
    icon: FlaskConical,
    accent: 'text-[#22D3EE]'
  },
  {
    id: 'radiology',
    titleEn: 'Radiology PACS',
    titleAr: 'مكتبة الأشعة',
    descEn: 'Interactive CT, MRI, X-Ray, and Ultrasound viewer paired with structured reporting.',
    descAr: 'عارض تفاعلي للأشعة السينية والرنين والمقطعية مع شرح مبسط وتقارير مصنفة.',
    icon: Scan,
    accent: 'text-[#A78BFA]'
  },
  {
    id: 'pharma',
    titleEn: 'Pharma Database',
    titleAr: 'قاعدة الأدوية',
    descEn: 'Rapid drug lookup, contraindications, renal dosing, and multi-drug interaction checks.',
    descAr: 'بحث دوائي سريع مع التداخلات الدوائية والتحذيرات السريرية والتصنيفات.',
    icon: Pill,
    accent: 'text-[#38BDF8]'
  },
  {
    id: 'med-school',
    titleEn: 'Med School',
    titleAr: 'كلية الطب',
    descEn: 'Specialty MCQs, clinical case simulations, spaced flashcards, and mastery analytics.',
    descAr: 'اختبارات MCQ وحالات سريرية وبطاقات مراجعة وتتبع تقدم الطالب.',
    icon: BookOpen,
    accent: 'text-[#22D3EE]'
  },
  {
    id: 'clinic',
    titleEn: 'Clinic Operations',
    titleAr: 'إدارة العيادات',
    descEn: 'Patient registry, encounter scheduling, SOAP clinical notes, and formal reports.',
    descAr: 'إدارة المرضى والمواعيد والزيارات والتقارير والسجلات الطبية المنظمة.',
    icon: Building2,
    accent: 'text-[#38BDF8]'
  },
  {
    id: 'health',
    titleEn: 'Personal Health',
    titleAr: 'الصحة الشخصية',
    descEn: 'Daily vitals tracking, symptom diaries, medication schedules, and full data export.',
    descAr: 'متابعة المؤشرات الحيوية والأعراض والأدوية مع آلية تصدير وحذف البيانات.',
    icon: HeartPulse,
    accent: 'text-[#22D3EE]'
  },
  {
    id: 'clinical',
    titleEn: 'Clinical Search',
    titleAr: 'البحث السريري',
    descEn: 'Evidence-grounded guidelines, diagnostic trees, and acute care protocols.',
    descAr: 'محرك بحث سريري للبروتوكولات والإرشادات والمصادر العلمية المعتمدة.',
    icon: Microscope,
    accent: 'text-[#A78BFA]'
  }
];

const FAQ_ITEMS = [
  {
    qEn: 'How does MAMO MED AI route text and medical imaging requests?',
    qAr: 'كيف يوجّه MAMO MED AI طلبات النصوص والصور الطبية؟',
    aEn: 'Clinical text reasoning, differential synthesis, and medical writing route server-side to Grok by xAI. Uploaded radiology scans and lab report images route to Z.AI GLM Vision with capability validation.',
    aAr: 'يتم توجيه المحادثة والكتابة والتشخيص التفريقي عبر الخادم إلى نماذج Grok، بينما تُوجّه الصور والمرفقات المرئية إلى نماذج Z.AI GLM Vision بعد التحقق من دعم الرؤية.'
  },
  {
    qEn: 'Does AI analysis replace a licensed physician?',
    qAr: 'هل يغني الذكاء الاصطناعي عن الطبيب المختص؟',
    aEn: 'No. Every clinical output displays structured uncertainty bounds, reference context, and an explicit clinical decision-support notice confirming it supports rather than replaces medical professionals.',
    aAr: 'لا. جميع المخرجات الطبية هي أدوات مساعدة لدعم القرار السريري وتُظهر درجة عدم اليقين والمراجع العلمية ولا تغني عن استشارة الطبيب.'
  },
  {
    qEn: 'What can visitors explore in Guest Mode?',
    qAr: 'ما الذي يمكن تجربته في وضع الضيف؟',
    aEn: 'Guest Mode unlocks the 3D spatial interface, sample PACS Radiology viewer, Pharma reference database, Med School quizzes, and Clinical Guidelines without exposing any private patient records or Founder Admin controls.',
    aAr: 'يتيح وضع الضيف استكشاف الواجهة ثلاثية الأبعاد وعارض الأشعة التجريبي وقاعدة الأدوية واختبارات كلية الطب دون أي اطلاع على بيانات المستخدمين أو لوحة الإدارة.'
  },
  {
    qEn: 'How are medical records and Founder privileges protected?',
    qAr: 'كيف تتم حماية السجلات الطبية وصلاحيات المؤسس؟',
    aEn: 'Data is persisted in Cloud Firestore with owner-isolated security rules and Firebase Authentication. Super Admin governance is permanently bound to the verified Founder email and UID on both the server and database.',
    aAr: 'تُحفظ البيانات في Cloud Firestore مع قواعد أمان معزولة لكل مستخدم ومصادقة Firebase، وتُربط صلاحية المدير العام حصرياً ببريد المؤسس الموثق ومعرّفه الفعلي.'
  }
];

export function LandingPage() {
  const { language, toggleLanguage, t, reducedMotion, theme3d, setView, setActiveModule, enterGuestMode } =
    useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroExploded, setHeroExploded] = useState(0);

  const isAr = language === 'ar';

  const openModuleFromLanding = (modId: MedicalModuleId) => {
    setActiveModule(modId);
    enterGuestMode();
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-[#F4F7FB] overflow-x-hidden">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050B16]/88 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single wordmark */}
          <a
            href="#hero"
            className="font-display text-lg font-bold tracking-tight text-[#F4F7FB] whitespace-nowrap shrink-0"
          >
            MAMO MED AI
          </a>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]">
            <a
              href="#overview"
              className="hover:text-[#F4F7FB] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navOverview}
            </a>
            <a
              href="#modules"
              className="hover:text-[#F4F7FB] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navModules}
            </a>
            <a
              href="#ai-architecture"
              className="hover:text-[#F4F7FB] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navIntelligence}
            </a>
            <a
              href="#security"
              className="hover:text-[#F4F7FB] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navSecurity}
            </a>
            <a
              href="#faq"
              className="hover:text-[#F4F7FB] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navFaq}
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setView('auth')}
              className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-semibold text-white whitespace-nowrap shrink-0"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Centerpiece */}
      <section
        id="hero"
        className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-white/8"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 65% 35%, rgba(29, 111, 235, 0.16) 0%, rgba(34, 211, 238, 0.06) 40%, rgba(5, 11, 22, 1) 80%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
              <span>{t.tagline}</span>
              <span aria-hidden="true">·</span>
              <span>{t.founderCredit}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 text-[#22D3EE] hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t.languageLabel}</span>
              </button>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#F4F7FB]">
              {t.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={enterGuestMode}
                className="btn-3d-primary px-6 py-3.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>{t.exploreMamoMed}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('auth')}
                className="btn-3d-secondary px-6 py-3.5 rounded-xl text-sm font-semibold text-[#F4F7FB] whitespace-nowrap shrink-0"
              >
                {t.getStarted}
              </button>
              <PWAInstallButton variant="primary" />
              <button
                type="button"
                onClick={() => {
                  window.sessionStorage.removeItem('mamo_intro_seen');
                  setView('intro');
                }}
                className="text-xs font-medium text-[#94A3B8] hover:text-[#22D3EE] transition-colors px-2 py-2"
              >
                {t.replayIntro}
              </button>
            </div>
          </div>

          {/* 3D Interactive Viewport */}
          <div className="lg:col-span-6">
            <div className="glass-panel rounded-3xl p-4 sm:p-5">
              <div className="h-[340px] sm:h-[430px] rounded-2xl overflow-hidden bg-[#040914] border border-white/8">
                <MedicalSceneCanvas
                  mode="hero"
                  theme3d={theme3d}
                  exploded={heroExploded}
                  reducedMotion={reducedMotion}
                  interactive
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-2">
                <span className="text-xs text-[#94A3B8]">
                  {isAr
                    ? 'اسحب لتدوير المجسم الطبي ثلاثي الأبعاد'
                    : 'Drag to orbit 3D genomic & neural core'}
                </span>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-[#94A3B8]" htmlFor="hero-explode-range">
                    {isAr ? 'تفكيك الطبقات' : 'Explode Layers'}
                  </label>
                  <input
                    id="hero-explode-range"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={heroExploded}
                    onChange={(e) => setHeroExploded(Number(e.target.value))}
                    className="w-28 accent-[#22D3EE]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Platform Introduction */}
      <motion.section
        id="overview"
        initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55 }}
        className="max-w-7xl mx-auto px-6 py-20 border-b border-white/8"
      >
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-medium text-[#22D3EE] tracking-wide">
              {isAr ? '01. المنصة الطبية الشاملة' : '01. Architectural Overview'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
              {isAr
                ? 'بيئة طبية مترابطة تتجاوز القوالب التقليدية'
                : 'A Spatial Clinical Ecosystem Built Beyond Flat Dashboards'}
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-5 text-[#94A3B8] text-base leading-relaxed">
            <p>
              {isAr
                ? 'تجمع منصة MAMO MED AI التي أسسها أحمد نوار المامو بين التصور الطبي ثلاثي الأبعاد والذكاء الاصطناعي السريري ثنائي المزوّد وإدارة البيانات الطبية المحمية عبر Firebase في مساحة عمل واحدة هادئة ودقيقة.'
                : 'Founded by Ahmed Nawar Al-Mamo, MAMO MED AI unifies interactive 3D medical geometry, dual-provider clinical intelligence, and Firebase-secured clinical persistence inside a calm, high-contrast observatory.'}
            </p>
            <p>
              {isAr
                ? 'تم تصميم كل وحدة طبية بهوية بصرية ومهام سريرية مستقلة تخدم الطبيب في العيادة، والطالب في كلية الطب، والمريض في متابعة صحته اليومية.'
                : 'Every module carries dedicated clinical workflows tailored to physicians at point of care, medical students mastering diagnostics, and individuals tracking personal health metrics.'}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 2: 9 Medical Modules Interactive Cards */}
      <motion.section
        id="modules"
        initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55 }}
        className="max-w-7xl mx-auto px-6 py-20 border-b border-white/8"
      >
        <div className="max-w-2xl space-y-3 mb-12">
          <p className="text-xs font-medium text-[#22D3EE]">
            {isAr ? '02. الوحدات الطبية التسع' : '02. Nine Integrated Medical Modules'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            {isAr ? 'وحدات متخصصة بهوية بصرية متكاملة' : 'Specialized Clinical Workspaces'}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                type="button"
                whileHover={reducedMotion ? undefined : { y: -4 }}
                onClick={() => openModuleFromLanding(mod.id)}
                className="glass-panel-interactive rounded-2xl p-6 text-start flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${mod.accent}`} />
                    <span className="text-xs text-[#94A3B8] group-hover:text-[#22D3EE] transition-colors">
                      {isAr ? 'استكشاف ←' : 'Open ->'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#F4F7FB]">
                    {isAr ? mod.titleAr : mod.titleEn}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {isAr ? mod.descAr : mod.descEn}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Section 3: Medical AI Intelligence (Grok + Z.AI Vision) */}
      <section id="ai-architecture" className="max-w-7xl mx-auto px-6 py-20 border-b border-white/8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-medium text-[#22D3EE]">
              {isAr ? '03. نظام التوجيه الذكي ثنائي المزوّد' : '03. Dual-Provider AI Routing'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
              {isAr
                ? 'توجيه تلقائي بين Grok للنصوص و Z.AI GLM Vision للصور'
                : 'Grok Clinical Reasoning Paired With Z.AI GLM Vision'}
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'يعمل الموجّه الذكي على الخادم لتوجيه المحادثات السريرية والتشخيص التفريقي وتلخيص الأبحاث إلى نماذج Grok، بينما يوجّه صور الأشعة وتقارير المختبر إلى Z.AI Vision مع فحص دعم الرؤية قبل التنفيذ.'
                : 'Our server-side router automatically dispatches clinical dialogue, differential reasoning, and medical writing to Grok by xAI, while routing radiology scans and lab report images to Z.AI GLM Vision after verifying multimodal capability.'}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="glass-panel rounded-xl p-4 space-y-1.5">
                <p className="text-sm font-semibold text-[#F4F7FB]">Grok by xAI</p>
                <p className="text-xs text-[#94A3B8]">
                  {isAr
                    ? 'المحادثة الطبية · كتابة التقارير · التشخيص التفريقي'
                    : 'Medical chat · Differential reasoning · Research synthesis'}
                </p>
              </div>
              <div className="glass-panel rounded-xl p-4 space-y-1.5">
                <p className="text-sm font-semibold text-[#F4F7FB]">Z.AI GLM Vision</p>
                <p className="text-xs text-[#94A3B8]">
                  {isAr
                    ? 'قراءة صور التحاليل · وصف الأشعة · تحليل المرفقات'
                    : 'Lab image OCR · Radiology visual analysis · Document parsing'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-panel rounded-3xl p-4 h-[340px]">
              <MedicalSceneCanvas mode="brain" theme3d={theme3d} reducedMotion={reducedMotion} interactive />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 & 5 & 6: Lab/Radiology, Med School, Clinic */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-white/8 space-y-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs font-medium text-[#22D3EE]">
              {isAr ? '04. المختبرات والأشعة' : '04. Lab & Radiology'}
            </p>
            <h3 className="font-display text-xl font-bold text-[#F4F7FB]">
              {isAr ? 'تحليل القيم المخبرية وصور الأشعة' : 'Biomarker & Imaging Precision'}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'رفع ملفات وصور التحاليل بالسحب والإفلات مع تمييز النتائج الخارجة عن المجال المرجعي ومكتبة أشعة مصنفة حسب النوع والتاريخ.'
                : 'Drag-and-drop lab panel parsing with reference-range deviation flags alongside an organized CT, MRI, X-Ray, and Ultrasound viewer.'}
            </p>
            <button
              type="button"
              onClick={() => openModuleFromLanding('radiology')}
              className="text-xs font-semibold text-[#22D3EE] hover:underline"
            >
              {isAr ? 'معاينة عارض الأشعة ←' : 'Inspect Radiology Viewer ->'}
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs font-medium text-[#22D3EE]">
              {isAr ? '05. كلية الطب' : '05. Med School Academy'}
            </p>
            <h3 className="font-display text-xl font-bold text-[#F4F7FB]">
              {isAr ? 'تدريب سريري واختبارات ذكية' : 'Case Vignettes & Spaced Mastery'}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'بنك أسئلة MCQ مصنف حسب الاختصاص، وحالات سريرية تفاعلية، وبطاقات مراجعة مع تتبع التقدم المحفوظ في حساب الطالب.'
                : 'Specialty-tagged MCQs, branching clinical vignettes, and active-recall flashcards synced directly to each student profile.'}
            </p>
            <button
              type="button"
              onClick={() => openModuleFromLanding('med-school')}
              className="text-xs font-semibold text-[#22D3EE] hover:underline"
            >
              {isAr ? 'دخول كلية الطب ←' : 'Explore Med School ->'}
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <p className="text-xs font-medium text-[#22D3EE]">
              {isAr ? '06. إدارة العيادات' : '06. Clinic Operations'}
            </p>
            <h3 className="font-display text-xl font-bold text-[#F4F7FB]">
              {isAr ? 'سجلات المرضى والمواعيد والزيارات' : 'Structured Patient & Visit EHR'}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'إدارة ملفات المرضى وجدولة المواعيد وتوثيق ملاحظات الزيارات SOAP وتوليد التقارير الطبية ضمن صلاحيات معزولة.'
                : 'Clinician-scoped patient directories, encounter schedules, SOAP documentation, and formal report generation.'}
            </p>
            <button
              type="button"
              onClick={() => openModuleFromLanding('clinic')}
              className="text-xs font-semibold text-[#22D3EE] hover:underline"
            >
              {isAr ? 'معاينة إدارة العيادة ←' : 'Open Clinic Workspace ->'}
            </button>
          </div>
        </div>
      </section>

      {/* Section 7 & 8: Security & Verified Architecture Summary (Zero fabricated KPIs) */}
      <section id="security" className="max-w-7xl mx-auto px-6 py-20 border-b border-white/8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl p-4 h-[300px]">
              <MedicalSceneCanvas mode="scanner" theme3d={theme3d} reducedMotion={reducedMotion} interactive />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[#22D3EE]">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? '07. الأمان والخصوصية الطبية' : '07. Medical Privacy & Security'}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
              {isAr
                ? 'عزل كامل للبيانات وحماية حصرية لحساب المؤسس'
                : 'Owner-Isolated Persistence & Founder-Locked Governance'}
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'تخضع جميع المجموعات في Firestore لقواعد أمان صارمة تمنع الاطلاع على بيانات الآخرين أو ترقية الصلاحيات، مع إبقاء مفاتيح الذكاء الاصطناعي على الخادم فقط وتسجيل العمليات الحساسة في سجل التدقيق.'
                : 'Every clinical record in Cloud Firestore enforces strict user ownership rules and schema validation. API keys stay strictly on the server, sensitive actions write to an append-only audit log, and Super Admin privileges are exclusively bound to the verified Founder email and UID.'}
            </p>

            {/* Section 8: Honest Architecture Capacities (no fabricated user counts) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10">
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-[#F4F7FB]">9</div>
                <div className="text-xs text-[#94A3B8]">
                  {isAr ? 'وحدات طبية متكاملة' : 'Medical Modules'}
                </div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-[#22D3EE]">2</div>
                <div className="text-xs text-[#94A3B8]">
                  {isAr ? 'مزوّدا AI (Grok + Z.AI)' : 'AI Engines (Grok + Z.AI)'}
                </div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-[#F4F7FB]">20</div>
                <div className="text-xs text-[#94A3B8]">
                  {isAr ? 'مسارات بيانات محمية' : 'Secured Firestore Schemas'}
                </div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-[#F4F7FB]">EN / AR</div>
                <div className="text-xs text-[#94A3B8]">
                  {isAr ? 'دعم ثنائي اللغة RTL' : 'Bilingual RTL Support'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-b border-white/8">
        <div className="space-y-2 mb-10">
          <p className="text-xs font-medium text-[#22D3EE]">
            {isAr ? '08. الأسئلة الشائعة' : '08. Frequently Asked Questions'}
          </p>
          <h2 className="font-display text-3xl font-bold text-[#F4F7FB]">
            {isAr ? 'وضوح كامل حول البنية والأمان' : 'Architecture, AI Routing & Privacy'}
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-panel rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-start"
                >
                  <span className="font-medium text-sm sm:text-base text-[#F4F7FB]">
                    {isAr ? item.qAr : item.qEn}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#22D3EE]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#94A3B8] leading-relaxed border-t border-white/6 pt-3">
                    {isAr ? item.aAr : item.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 10: Institutional Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="font-display text-base font-bold text-[#F4F7FB]">MAMO MED AI</div>
            <div className="text-xs text-[#94A3B8]">
              {t.tagline} · {t.founderCredit}
            </div>
            <div className="text-xs text-[#94A3B8]/80 max-w-2xl">{t.medicalDisclaimer}</div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
            <button
              type="button"
              onClick={toggleLanguage}
              className="hover:text-[#F4F7FB] transition-colors"
            >
              {t.languageLabel}
            </button>
            <button
              type="button"
              onClick={enterGuestMode}
              className="hover:text-[#F4F7FB] transition-colors"
            >
              {t.enterGuest}
            </button>
            <button
              type="button"
              onClick={() => setView('auth')}
              className="text-[#22D3EE] font-semibold hover:underline"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
