import React, { useEffect, useState } from 'react';
import {
  Check,
  Coins,
  Copy,
  Crown,
  Fingerprint,
  Lock,
  Palette,
  Send,
  Sparkles,
  UserPlus,
  Wallet
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { FEATURE_CATALOG_META, TOPUP_PACKAGES, type TopupPackageOption } from '../../lib/billing';
import { THEME_3D_LIST, type Theme3dId } from '../../lib/themes3d';
import {
  WalletPro,
  type WalletTopupRequest,
  type WalletTransaction
} from '../../services/WalletPro';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

export function WalletProModule() {
  const {
    language,
    user,
    userProfile,
    walletId,
    isGuest,
    isFounder,
    planTier,
    pointsBalance,
    featurePricing,
    theme3d,
    selectTheme3d,
    reducedMotion,
    setView,
    setActiveModule,
    t
  } = useApp();

  const isAr = language === 'ar';

  const [selectedPkg, setSelectedPkg] = useState<TopupPackageOption>(TOPUP_PACKAGES[0]);
  const [customPoints, setCustomPoints] = useState('250');
  const [useCustomPoints, setUseCustomPoints] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const [requests, setRequests] = useState<WalletTopupRequest[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [previewTheme, setPreviewTheme] = useState<Theme3dId>(theme3d);

  useEffect(() => {
    setPreviewTheme(theme3d);
  }, [theme3d]);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setTransactions([]);
      return;
    }

    const rUnsub = WalletPro.subscribeUserTopupRequests(user.uid, setRequests);
    const tUnsub = WalletPro.subscribeUserTransactions(user.uid, setTransactions);

    return () => {
      rUnsub();
      tUnsub();
    };
  }, [user]);

  const handleCopyWalletId = async () => {
    if (!walletId) return;
    try {
      await navigator.clipboard.writeText(walletId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'سجّل الدخول بحساب Google لإرسال طلب شحن نقاط أو ترقية برو.'
          : 'Sign in with Google to submit a points top-up or PRO upgrade request.'
      );
      return;
    }

    const pts = useCustomPoints
      ? Math.min(100000, Math.max(10, Number(customPoints) || 100))
      : selectedPkg.points;
    const reqType = useCustomPoints ? 'points' : selectedPkg.requestType;

    setSubmitting(true);
    try {
      await WalletPro.submitTopupRequest({
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.displayName || user.displayName || 'Medical User',
        requestType: reqType,
        requestedPoints: pts,
        paymentReference: paymentRef,
        note: requestNote
      });
      setPaymentRef('');
      setRequestNote('');
      setNotice(
        isAr
          ? 'تم إرسال طلب الشحن / الترقية إلى إدارة المؤسس للموافقة.'
          : 'Top-up / PRO upgrade request submitted to Founder Admin for approval.'
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyTheme = (id: Theme3dId) => {
    setPreviewTheme(id);
    const res = selectTheme3d(id);
    if (!res.ok && res.message) {
      setNotice(res.message);
    } else {
      setNotice(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Wallet Balance, Member Wallet ID & Plan Overview */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--titanium-silver)]">
            <span>{isAr ? 'رصيد النقاط الحالي' : 'Available Clinical Points'}</span>
            <Coins className="w-4 h-4 text-[var(--electric-cyan)]" />
          </div>
          <div className="font-mono-tabular text-3xl font-bold text-[var(--pearl-white)]">
            {isGuest ? '—' : isFounder ? '∞' : pointsBalance}
          </div>
          <div className="text-[11px] text-[var(--titanium-silver)]">
            {isFounder
              ? isAr
                ? 'حساب المؤسس — وصول غير محدود'
                : 'Founder Super Admin — Unlimited'
              : isAr
                ? 'يشمل 100 نقطة مكافأة تسجيل الدخول'
                : 'Includes 100-pt login welcome bonus'}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--titanium-silver)]">
            <span>{isAr ? 'معرّف المستخدم للشحن' : 'Member Wallet ID'}</span>
            <Fingerprint className="w-4 h-4 text-[var(--electric-cyan)]" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tabular text-lg font-bold text-[var(--electric-cyan)] truncate">
              {isGuest ? 'GUEST' : walletId || '—'}
            </span>
            {!isGuest && walletId && (
              <button
                type="button"
                onClick={handleCopyWalletId}
                title={isAr ? 'نسخ المعرّف' : 'Copy Member ID'}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-[var(--pearl-white)] shrink-0"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="text-[11px] font-mono-tabular text-[var(--titanium-silver)] truncate">
            {user ? `UID: ${user.uid}` : isAr ? 'سجّل الدخول للحصول على ID' : 'Sign in to get your Wallet ID'}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--titanium-silver)]">
            <span>{isAr ? 'مستوى العضوية' : 'Membership Plan'}</span>
            <Crown className={`w-4 h-4 ${planTier === 'pro' ? 'text-amber-300' : 'text-[var(--titanium-silver)]'}`} />
          </div>
          <div className="font-display text-2xl font-bold">
            {planTier === 'pro' ? (isAr ? 'عضوية برو (PRO)' : 'MAMO MED PRO') : isAr ? 'الباقة القياسية' : 'Standard Tier'}
          </div>
          <div className="text-[11px] text-[var(--titanium-silver)]">
            {planTier === 'pro'
              ? isAr
                ? 'جميع ميزات برو وثيمات 3D الفاخرة مفعّلة'
                : 'Pro Radiology Vision, Clinic EHR & Premium 3D Themes active'
              : isAr
                ? 'قم بالترقية لفتح ميزات برو وثيمات 3D المتقدمة'
                : 'Upgrade to unlock Pro Radiology, Clinic EHR & Premium 3D Themes'}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--titanium-silver)]">
            <span>{isAr ? 'الثيم ثلاثي الأبعاد النشط' : 'Active 3D Spatial Theme'}</span>
            <Palette className="w-4 h-4 text-[var(--electric-cyan)]" />
          </div>
          <div className="font-display text-lg font-bold truncate">
            {isAr
              ? THEME_3D_LIST.find((x) => x.id === theme3d)?.nameAr
              : THEME_3D_LIST.find((x) => x.id === theme3d)?.nameEn}
          </div>
          <div className="text-[11px] text-[var(--titanium-silver)]">
            {isAr ? 'يتزامن مع مجسمات WebGL والواجهات الزجاجية' : 'Synced across 3D WebGL shaders & glass UI'}
          </div>
        </div>
      </section>

      {/* Referral Program Quick Callout */}
      <section className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-[var(--pearl-white)]">
              {isAr ? 'ادعُ زملاءك واكسب +100 نقطة لكل زميل' : 'Invite Colleagues & Earn +100 Points Each'}
            </div>
            <div className="text-xs text-[var(--titanium-silver)]">
              {isAr
                ? 'شارك كودك الشخصي في WalletPro ليحصل زميلك على +50 نقطة وتحصل أنت على +100 نقطة فور التفعيل.'
                : 'Share your personal referral link so your colleague gets +50 pts and you earn +100 pts atomically.'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveModule('referrals')}
          className="btn-3d-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white shrink-0"
        >
          {isAr ? 'فتح مركز الدعوات والإحالة' : 'Open Invitation Hub'}
        </button>
      </section>

      {notice && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span>{notice}</span>
          {isGuest && (
            <button
              type="button"
              onClick={() => setView('auth')}
              className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            >
              {t.signInGoogle}
            </button>
          )}
        </div>
      )}

      {/* Multi-Theme 3D Studio */}
      <section className="glass-panel rounded-3xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              {isAr ? 'استوديو الثيمات ثلاثية الأبعاد (5 ثيمات)' : '3D Spatial Themes Studio (5 Themes)'}
            </h2>
            <p className="text-xs text-[var(--titanium-silver)]">
              {isAr
                ? 'اختر الثيم لتغيير إضاءة ومواد المجسمات ثلاثية الأبعاد وألوان المنصة بالكامل.'
                : 'Select a theme to transform WebGL PBR metallurgy, volumetric fog, lighting, and UI surfaces.'}
            </p>
          </div>
          {featurePricing.proFeatures.includes('themes_3d_premium') && planTier !== 'pro' && (
            <span className="text-xs text-amber-300 font-medium inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>{isAr ? 'الثيمات المتقدمة لعضوية PRO' : 'Premium themes require PRO'}</span>
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 h-64 rounded-2xl overflow-hidden bg-[#040914] border border-white/10">
            <MedicalSceneCanvas
              mode="hero"
              theme3d={previewTheme}
              reducedMotion={reducedMotion}
              interactive
            />
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
            {THEME_3D_LIST.map((item) => {
              const active = theme3d === item.id;
              const proLocked =
                item.premium &&
                featurePricing.proFeatures.includes('themes_3d_premium') &&
                planTier !== 'pro' &&
                !isFounder;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleApplyTheme(item.id)}
                  className={`rounded-2xl p-4 text-start border transition-all flex flex-col justify-between gap-3 ${
                    active
                      ? 'border-[var(--electric-cyan)] bg-white/8'
                      : 'border-white/10 bg-black/25 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-display text-sm font-semibold">
                        {isAr ? item.nameAr : item.nameEn}
                      </div>
                      <p className="text-[11px] text-[var(--titanium-silver)] leading-relaxed">
                        {isAr ? item.descAr : item.descEn}
                      </p>
                    </div>
                    {active ? (
                      <Check className="w-4 h-4 text-[var(--electric-cyan)] shrink-0" />
                    ) : proLocked ? (
                      <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {item.swatches.map((hex) => (
                        <span
                          key={hex}
                          className="w-4 h-4 rounded border border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono-tabular text-[var(--titanium-silver)]">
                      {item.premium ? 'PRO' : isAr ? 'متاح' : 'Standard'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top-up Points & Pro Request + Feature Pricing Schedule */}
      <section className="grid lg:grid-cols-12 gap-6">
        <form onSubmit={handleSubmitRequest} className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[var(--electric-cyan)]" />
            <h2 className="font-display text-base font-semibold">
              {isAr ? 'شحن نقاط أو طلب ترقية برو (PRO)' : 'Request Points Top-Up or PRO Upgrade'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {TOPUP_PACKAGES.map((pkg) => {
              const selected = !useCustomPoints && selectedPkg.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    setUseCustomPoints(false);
                    setSelectedPkg(pkg);
                  }}
                  className={`rounded-xl p-3.5 text-start border transition-colors space-y-1 ${
                    selected
                      ? 'border-[var(--electric-cyan)] bg-white/8'
                      : 'border-white/10 bg-black/25 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-semibold">
                      {isAr ? pkg.titleAr : pkg.titleEn}
                    </span>
                    <span className="font-mono-tabular text-xs text-[var(--electric-cyan)]">
                      {pkg.priceLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--titanium-silver)]">
                    {isAr ? pkg.subtitleAr : pkg.subtitleEn}
                  </p>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-xs text-[var(--titanium-silver)] cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomPoints}
              onChange={(e) => setUseCustomPoints(e.target.checked)}
            />
            <span>{isAr ? 'إدخال عدد نقاط مخصص' : 'Enter custom points amount'}</span>
          </label>

          {useCustomPoints && (
            <input
              type="number"
              min={10}
              max={100000}
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm font-mono-tabular text-[#F4F7FB]"
            />
          )}

          <input
            type="text"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder={
              isAr
                ? 'مرجع الدفع / رقم الحوالة (اختياري)'
                : 'Payment / Invoice Reference (Optional)'
            }
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
          />

          <textarea
            rows={2}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            placeholder={
              isAr ? 'ملاحظات إضافية لإدارة المنصة…' : 'Notes for Founder Admin approval…'
            }
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-3d-primary w-full py-3 rounded-xl text-xs font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting
                ? isAr
                  ? 'جاري الإرسال…'
                  : 'Submitting…'
                : isAr
                  ? 'إرسال طلب الشحن / الترقية للأدمن'
                  : 'Submit Top-Up / Upgrade Request'}
            </span>
          </button>
        </form>

        {/* Live Feature Pricing Schedule */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--electric-cyan)]" />
            <h2 className="font-display text-base font-semibold">
              {isAr ? 'جدول تكلفة الميزات ومتطلبات برو' : 'Live Feature Point Cost & PRO Schedule'}
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {FEATURE_CATALOG_META.map((feat) => {
              const cost = featurePricing.costs[feat.key] ?? 0;
              const isPro = featurePricing.proFeatures.includes(feat.key);
              return (
                <div key={feat.key} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold">
                      {isAr ? feat.labelAr : feat.labelEn}
                    </div>
                    <div className="text-[11px] text-[var(--titanium-silver)]">
                      {isAr ? feat.descAr : feat.descEn}
                    </div>
                  </div>
                  <div className="text-end shrink-0 font-mono-tabular">
                    <div className="text-xs font-bold text-[var(--electric-cyan)]">
                      {cost === 0 ? (isAr ? 'مجاني' : '0 pts') : `${cost} ${isAr ? 'نقطة' : 'pts'}`}
                    </div>
                    {isPro && (
                      <div className="text-[10px] font-semibold text-amber-300">
                        {isAr ? 'يتطلب PRO' : 'PRO ONLY'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requests & Points Ledger */}
      {user && (
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-sm font-semibold">
              {isAr ? 'طلبات الشحن والترقية الخاصة بك' : 'Your Top-Up & Upgrade Requests'}
            </h3>
            {requests.length === 0 ? (
              <p className="text-xs text-[var(--titanium-silver)]">
                {isAr ? 'لا توجد طلبات شحن مرسلة بعد.' : 'No top-up or PRO requests submitted yet.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-xl bg-black/30 border border-white/10 p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {r.requestType === 'pro_upgrade'
                          ? isAr
                            ? 'ترقية PRO'
                            : 'PRO Upgrade'
                          : isAr
                            ? 'شحن نقاط'
                            : 'Points Top-Up'}{' '}
                        · <span className="font-mono-tabular">+{r.requestedPoints} pts</span>
                      </div>
                      {r.adminNote && <div className="text-[var(--titanium-silver)]">{r.adminNote}</div>}
                    </div>
                    <span
                      className={`font-mono-tabular font-semibold ${
                        r.status === 'approved'
                          ? 'text-emerald-400'
                          : r.status === 'rejected'
                            ? 'text-rose-400'
                            : 'text-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-sm font-semibold">
              {isAr ? 'سجل حركات النقاط' : 'Points Transaction Ledger'}
            </h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-[var(--titanium-silver)]">
                {isAr ? 'لا توجد حركات نقاط مسجلة حتى الآن.' : 'No point transactions recorded yet.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto text-xs font-mono-tabular">
                {transactions.map((tx) => (
                  <div key={tx.id} className="rounded-xl bg-black/30 border border-white/10 p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[var(--pearl-white)]">{tx.description}</div>
                      <div className="text-[11px] text-[var(--titanium-silver)]">
                        Balance after: {tx.balanceAfter} pts
                      </div>
                    </div>
                    <span className={tx.pointsDelta >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                      {tx.pointsDelta >= 0 ? `+${tx.pointsDelta}` : tx.pointsDelta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
