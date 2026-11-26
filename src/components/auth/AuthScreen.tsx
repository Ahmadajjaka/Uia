import { motion } from 'motion/react';
import { ArrowLeft, Globe, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

export function AuthScreen() {
  const {
    language,
    toggleLanguage,
    t,
    reducedMotion,
    theme3d,
    setView,
    signInWithGoogle,
    enterGuestMode,
    authLoading,
    authError
  } = useApp();

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-[#050B16] text-[#F4F7FB] relative overflow-hidden flex flex-col">
      {/* Ambient 3D medical background */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <MedicalSceneCanvas mode="molecule" theme3d={theme3d} reducedMotion={reducedMotion} interactive={false} />
      </div>

      {/* Top utility bar */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView('landing')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F4F7FB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAr ? 'العودة للرئيسية' : 'Back to Landing'}</span>
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22D3EE] hover:underline"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.languageLabel}</span>
        </button>
      </div>

      {/* Frosted glass Auth card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-3xl max-w-md w-full p-8 space-y-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#22D3EE]">MAMO MED AI</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FB]">
              {isAr ? 'الدخول إلى المنصة الطبية' : 'Access Your Medical Universe'}
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {isAr
                ? 'سجّل الدخول بحساب Google الموثق لحفظ ملفات العيادة ونتائج المختبر ومحادثات الذكاء الاصطناعي، أو استكشف المنصة في وضع الضيف.'
                : 'Sign in with verified Google Authentication to persist clinical records, lab analyses, and AI consultations, or explore the platform in Guest Mode.'}
            </p>
          </div>

          {authError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-400/30 px-4 py-3 text-xs text-rose-200">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={authLoading}
              onClick={signInWithGoogle}
              className="btn-3d-primary w-full py-3.5 px-5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <UserCheck className="w-4 h-4" />
              <span>{authLoading ? (isAr ? 'جاري التحقق…' : 'Verifying…') : t.signInGoogle}</span>
            </button>

            <button
              type="button"
              onClick={enterGuestMode}
              className="btn-3d-secondary w-full py-3.5 px-5 rounded-xl text-sm font-semibold text-[#F4F7FB]"
            >
              {t.enterGuest}
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-[#94A3B8]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'صلاحية المدير العام محفوظة ومحمية حصرياً للمؤسس أحمد نوار المامو عبر التحقق من البريد الرسمي ADMIN_EMAIL.'
                  : 'Super Admin governance is exclusively bound to Founder Ahmed Nawar Al-Mamo via server-verified ADMIN_EMAIL.'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
