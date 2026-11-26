import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Brain,
  Building2,
  FlaskConical,
  HeartPulse,
  Images,
  Microscope,
  Pill,
  Scan,
  Shield,
  Stethoscope,
  Wallet
} from 'lucide-react';
import { useApp, type MedicalModuleId } from '../../contexts/AppContext';
import { db } from '../../lib/firebase';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

interface RecordCounts {
  conversations: number;
  labs: number;
  radiology: number;
  patients: number;
  healthLogs: number;
}

const MODULE_CARDS: Array<{
  id: MedicalModuleId;
  icon: typeof Stethoscope;
  descEn: string;
  descAr: string;
}> = [
  {
    id: 'ai-doctor',
    icon: Stethoscope,
    descEn: 'Clinical dialogue, attachments & cited guidance',
    descAr: 'استشارة طبية ذكية مع دعم المرفقات والمراجع'
  },
  {
    id: 'diagnosis',
    icon: Brain,
    descEn: 'Ranked differential diagnosis & uncertainty',
    descAr: 'تشخيص تفريقي تفاعلي مع أسباب الترجيح'
  },
  {
    id: 'lab-analyzer',
    icon: FlaskConical,
    descEn: 'Biomarker parsing, charts & out-of-range flags',
    descAr: 'تحليل القيم المخبرية وتمييز النتائج غير الطبيعية'
  },
  {
    id: 'radiology',
    icon: Scan,
    descEn: 'PACS scan viewer & modality classification',
    descAr: 'عارض صور الأشعة وتصنيف التقارير'
  },
  {
    id: 'echo-training',
    icon: Activity,
    descEn: '10-minute intensive echo labs, signs, X-ray links, simulator & ASE sign-off',
    descAr: 'أكاديمية فحص الإيكو المكثفة (10 دقائق لكل جلسة): علامات، أشعة، وتدريبات حتى الختام'
  },
  {
    id: 'medical-images',
    icon: Images,
    descEn: '20,000 deduplicated diagnostic plates across 10 modalities with DICOM viewer',
    descAr: 'أطلس 20,000 صورة طبية تشخيصية دون تكرار عبر 10 تقنيات تصوير'
  },
  {
    id: 'pharma',
    icon: Pill,
    descEn: '20,000 unique EN/AR drug monographs & interaction checks',
    descAr: 'قاعدة 20 ألف دواء مترجم دون تكرار مع فحص التداخلات'
  },
  {
    id: 'med-school',
    icon: BookOpen,
    descEn: 'MCQs, case vignettes & spaced flashcards',
    descAr: 'اختبارات وحالات سريرية وبطاقات مراجعة'
  },
  {
    id: 'clinic',
    icon: Building2,
    descEn: 'Patients, visits, SOAP notes & reports',
    descAr: 'إدارة المرضى والزيارات والتقارير الطبية'
  },
  {
    id: 'health',
    icon: HeartPulse,
    descEn: 'Vitals, symptoms, meds & data export',
    descAr: 'متابعة المؤشرات الصحية وتصدير السجل'
  },
  {
    id: 'clinical',
    icon: Microscope,
    descEn: 'Live PubMed / Europe PMC abstracts, NIH ICD-10 & in-app medical reference search',
    descAr: 'بحث طبي مباشر في PubMed وNIH ICD-10 والموسوعة الطبية داخل التطبيق'
  },
  {
    id: 'wallet',
    icon: Wallet,
    descEn: 'Points top-up, PRO membership & 5 interactive 3D themes',
    descAr: 'شحن النقاط وميزات برو واستوديو الثيمات ثلاثية الأبعاد'
  }
];

export function DashboardHome() {
  const {
    language,
    t,
    user,
    userProfile,
    pointsBalance,
    planTier,
    theme3d,
    isGuest,
    isFounder,
    founderActivated,
    capabilities,
    setActiveModule,
    setView,
    reducedMotion
  } = useApp();

  const isAr = language === 'ar';
  const [counts, setCounts] = useState<RecordCounts>({
    conversations: 0,
    labs: 0,
    radiology: 0,
    patients: 0,
    healthLogs: 0
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    if (!user) {
      setCounts({ conversations: 0, labs: 0, radiology: 0, patients: 0, healthLogs: 0 });
      return;
    }

    let cancelled = false;
    setLoadingCounts(true);

    async function loadUserCounts() {
      try {
        const uid = user!.uid;
        const [cSnap, lSnap, rSnap, pSnap, hSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'conversations'), where('userId', '==', uid))),
          getCountFromServer(query(collection(db, 'lab_results'), where('userId', '==', uid))),
          getCountFromServer(query(collection(db, 'radiology_reports'), where('userId', '==', uid))),
          getCountFromServer(query(collection(db, 'patient_records'), where('userId', '==', uid))),
          getCountFromServer(query(collection(db, 'health_logs'), where('userId', '==', uid)))
        ]);
        if (!cancelled) {
          setCounts({
            conversations: cSnap.data().count,
            labs: lSnap.data().count,
            radiology: rSnap.data().count,
            patients: pSnap.data().count,
            healthLogs: hSnap.data().count
          });
        }
      } catch {
        // Ignore count errors if user hasn't created collections yet
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    }

    void loadUserCounts();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome 3D Hero Card */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-medium text-[#22D3EE]">
            {isFounder
              ? isAr
                ? 'مرحباً بالمؤسس والمدير العام · أحمد نوار المامو'
                : 'Founder & CEO Command · Ahmed Nawar Al-Mamo'
              : isGuest
                ? t.guestModeTitle
                : isAr
                  ? 'مرحباً بك في منظومة MAMO MED AI'
                  : 'MAMO MED AI Clinical Workspace'}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#F4F7FB]">
            {userProfile?.displayName
              ? isAr
                ? `أهلاً، ${userProfile.displayName}`
                : `Welcome, ${userProfile.displayName}`
              : isAr
                ? 'مركز القيادة الطبية ثلاثي الأبعاد'
                : '3D Medical Intelligence Observatory'}
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl leading-relaxed">
            {isAr
              ? 'اختر أي وحدة طبية لبدء التحليل السريري، فحص المختبرات والأشعة، إدارة العيادة، أو استعراض المراجع الدوائية والتعليمية.'
              : 'Launch any medical unit to run clinical synthesis, parse labs and radiology studies, manage clinic encounters, or explore pharmacology and medical education.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setActiveModule('ai-doctor')}
              className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
            >
              {isAr ? 'فتح الطبيب الذكي' : 'Open AI Doctor'}
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('echo-training')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB] inline-flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <span>{isAr ? 'تدريب الإيكو (10د)' : 'Echo Academy (10m)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('medical-images')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB] inline-flex items-center gap-2"
            >
              <Images className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <span>{isAr ? 'صور طبية (20 ألف)' : '20K Medical Images'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('clinical')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB] inline-flex items-center gap-2"
            >
              <Microscope className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <span>{isAr ? 'المرجع الطبي المباشر' : 'Medical Reference'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('wallet')}
              className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB] inline-flex items-center gap-2"
            >
              <Wallet className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <span>
                {isAr
                  ? `المحفظة (${isFounder ? '∞' : pointsBalance} نقطة · ${planTier === 'pro' ? 'PRO' : 'قياسي'})`
                  : `Wallet (${isFounder ? '∞' : pointsBalance} pts · ${planTier === 'pro' ? 'PRO' : 'Standard'})`}
              </span>
            </button>
            {isFounder && !founderActivated && (
              <button
                type="button"
                onClick={() => setView('founder-setup')}
                className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#22D3EE] inline-flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t.founderSetup}</span>
              </button>
            )}
            {isFounder && founderActivated && (
              <button
                type="button"
                onClick={() => setActiveModule('admin')}
                className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-[#22D3EE] inline-flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t.founderConsole}</span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 h-[240px] sm:h-[280px] rounded-2xl overflow-hidden bg-[#040914] border border-white/10">
          <MedicalSceneCanvas mode="hero" theme3d={theme3d} reducedMotion={reducedMotion} interactive />
        </div>
      </section>

      {/* Real Firestore Activity Metrics & AI Provider Readiness */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: isAr ? 'محادثات AI' : 'AI Consults', val: counts.conversations },
          { label: isAr ? 'تحاليل المختبر' : 'Lab Panels', val: counts.labs },
          { label: isAr ? 'تقارير الأشعة' : 'Radiology Scans', val: counts.radiology },
          { label: isAr ? 'ملفات المرضى' : 'Clinic Patients', val: counts.patients },
          { label: isAr ? 'سجلات الصحة' : 'Health Logs', val: counts.healthLogs }
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-4 space-y-1">
            <div className="text-xs text-[#94A3B8]">{stat.label}</div>
            <div className="font-mono-tabular text-2xl font-bold text-[#F4F7FB]">
              {isGuest ? '—' : loadingCounts ? '…' : stat.val}
            </div>
          </div>
        ))}

        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="text-xs text-[#94A3B8]">
            {isAr ? 'محركات AI' : 'AI Engines'}
          </div>
          <div className="text-xs font-mono-tabular text-[#F4F7FB] space-y-0.5 pt-0.5">
            <div>
              Groq / xAI:{' '}
              <span className={capabilities?.grokConfigured ? 'text-emerald-400' : 'text-amber-300'}>
                {capabilities?.grokConfigured
                  ? isAr
                    ? 'متصل'
                    : 'Ready'
                  : isAr
                    ? 'بانتظار المفتاح'
                    : 'Key Needed'}
              </span>
            </div>
            <div>
              Z.AI:{' '}
              <span className={capabilities?.zaiConfigured ? 'text-emerald-400' : 'text-amber-300'}>
                {capabilities?.zaiConfigured
                  ? isAr
                    ? 'متصل'
                    : 'Ready'
                  : isAr
                    ? 'بانتظار المفتاح'
                    : 'Key Needed'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 9-Module Grid */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#F4F7FB]">
          {isAr ? 'الوحدات الطبية' : 'Medical Modules'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={reducedMotion ? undefined : { y: -3 }}
                onClick={() => setActiveModule(card.id)}
                className="glass-panel-interactive rounded-2xl p-5 text-start flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#22D3EE]" />
                    <span className="font-display font-semibold text-sm text-[#F4F7FB]">
                      {t.workspaceModules[card.id]}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {isAr ? card.descAr : card.descEn}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
