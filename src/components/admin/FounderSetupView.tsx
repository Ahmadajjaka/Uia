import { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

export function FounderSetupView() {
  const {
    language,
    user,
    founderActivated,
    activateFounderAccount,
    setView,
    setActiveModule,
    reducedMotion
  } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAr = language === 'ar';

  const handleActivate = async () => {
    setBusy(true);
    setError(null);
    try {
      await activateFounderAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Founder activation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-[#F4F7FB] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-45 pointer-events-none">
        <MedicalSceneCanvas mode="intro" reducedMotion={reducedMotion} interactive={false} />
      </div>

      <div className="relative z-10 max-w-xl w-full glass-panel rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-[#22D3EE]">
          <ShieldCheck className="w-6 h-6" />
          <span className="text-xs font-semibold tracking-wider">
            {isAr ? 'إعداد المؤسس والمدير العام الحصري' : 'EXCLUSIVE FOUNDER ACTIVATION'}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {isAr ? 'أحمد نوار المامو — تفعيل صلاحية Super Admin' : 'Ahmed Nawar Al-Mamo — Super Admin Binding'}
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            {isAr
              ? 'تم التحقق من البريد الرسمي للمؤسس على الخادم. سيؤدي التفعيل إلى ربط صلاحية Super Admin بشكل دائم بمعرّف المستخدم الفعلي (UID) في Firebase.'
              : 'Your verified Google email matched the server-configured ADMIN_EMAIL. Activation permanently binds Super Admin authority to your Firebase UID.'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#040914] border border-white/10 p-4 space-y-2 text-xs font-mono-tabular">
          <div className="flex justify-between gap-4">
            <span className="text-[#94A3B8]">Founder:</span>
            <span className="text-[#F4F7FB]">Ahmed Nawar Al-Mamo</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#94A3B8]">Verified Email:</span>
            <span className="text-[#22D3EE]">{user?.email || '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#94A3B8]">Firebase UID:</span>
            <span className="text-[#F4F7FB] truncate max-w-[240px]">{user?.uid || '—'}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-400/30 p-3 text-xs text-rose-200">
            {error}
          </div>
        )}

        {founderActivated ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-4 flex items-center gap-3 text-sm text-emerald-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                {isAr
                  ? 'تم تفعيل حساب المؤسس بنجاح وحفظه في سجل الأمان.'
                  : 'Founder Super Admin account successfully activated and bound to UID.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModule('admin');
                setView('app');
              }}
              className="btn-3d-primary w-full py-3.5 rounded-xl text-sm font-semibold text-white"
            >
              {isAr ? 'الدخول إلى لوحة المدير العام' : 'Enter Founder Admin Console'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={handleActivate}
              className="btn-3d-primary flex-1 py-3.5 px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy
                ? isAr
                  ? 'جاري ربط الصلاحية…'
                  : 'Binding Founder UID…'
                : isAr
                  ? 'تأكيد وتفعيل حساب المؤسس'
                  : 'Confirm & Activate Founder Account'}
            </button>
            <button
              type="button"
              onClick={() => setView('app')}
              className="btn-3d-secondary py-3.5 px-5 rounded-xl text-sm font-semibold text-[#F4F7FB]"
            >
              {isAr ? 'الانتقال للتطبيق' : 'Go to Workspace'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
