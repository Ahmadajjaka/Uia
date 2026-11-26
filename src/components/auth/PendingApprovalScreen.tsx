import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Check, Clock, Coins, Copy, Gift, Globe, LogOut, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { WalletPro } from '../../services/WalletPro';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

interface AccessRequestDoc {
  userId: string;
  email: string;
  displayName: string;
  requestedRole: 'clinician' | 'student' | 'patient';
  institutionOrSpecialty: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByEmail?: string;
}

export function PendingApprovalScreen() {
  const {
    language,
    toggleLanguage,
    t,
    reducedMotion,
    theme3d,
    user,
    userProfile,
    walletId,
    pointsBalance,
    approvalStatus,
    pendingReferralCode,
    clearPendingReferralCode,
    signOutUser,
    enterGuestMode
  } = useApp();

  const isAr = language === 'ar';
  const [reqDoc, setReqDoc] = useState<AccessRequestDoc | null>(null);
  const [requestedRole, setRequestedRole] = useState<'clinician' | 'student' | 'patient'>('clinician');
  const [specialty, setSpecialty] = useState(userProfile?.specialty || 'General Medicine');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [claimingRef, setClaimingRef] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'access_requests', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as AccessRequestDoc;
          setReqDoc(data);
          setRequestedRole(data.requestedRole || 'clinician');
          setSpecialty(data.institutionOrSpecialty || 'General Medicine');
          setNote(data.note || '');
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `access_requests/${user.uid}`)
    );
    return () => unsub();
  }, [user]);

  const isRejected = approvalStatus === 'rejected' || reqDoc?.status === 'rejected';

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isRejected) return;
    setSaving(true);
    setSavedNotice(null);
    try {
      const ref = doc(db, 'access_requests', user.uid);
      if (!reqDoc) {
        await setDoc(ref, {
          userId: user.uid,
          email: user.email || '',
          displayName: userProfile?.displayName || user.displayName || 'Medical User',
          requestedRole,
          institutionOrSpecialty: specialty.trim().slice(0, 160),
          note: note.trim().slice(0, 500),
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(ref, {
          requestedRole,
          institutionOrSpecialty: specialty.trim().slice(0, 160),
          note: note.trim().slice(0, 500),
          updatedAt: serverTimestamp()
        });
      }
      setSavedNotice(
        isAr
          ? 'تم تحديث بيانات طلبك وإرسالها إلى لوحة المؤسس.'
          : 'Application details updated for Founder review.'
      );
    } catch (err) {
      setSavedNotice(err instanceof Error ? err.message : 'Unable to save details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-midnight)] text-[var(--pearl-white)] relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-45 pointer-events-none">
        <MedicalSceneCanvas mode="brain" theme3d={theme3d} reducedMotion={reducedMotion} interactive={false} />
      </div>

      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-display text-base font-bold tracking-tight">MAMO MED AI</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--electric-cyan)] hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.languageLabel}</span>
          </button>
          <button
            type="button"
            onClick={signOutUser}
            className="btn-3d-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <div className="glass-panel rounded-3xl max-w-2xl w-full p-7 sm:p-9 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {isRejected ? (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              ) : (
                <Clock className="w-6 h-6 text-[var(--electric-cyan)]" />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--electric-cyan)]">
                {isRejected
                  ? isAr
                    ? 'حالة طلب الدخول: مرفوض'
                    : 'Access Request Status: Declined'
                  : isAr
                    ? 'بانتظار موافقة المدير العام'
                    : 'Pending Founder Admin Approval'}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                {isRejected
                  ? isAr
                    ? 'لم تتم الموافقة على هذا الحساب'
                    : 'Account Access Was Not Approved'
                  : isAr
                    ? 'تم توجيه طلب انضمامك إلى لوحة المؤسس'
                    : 'Your Login Request Is Routed to Founder Admin'}
              </h1>
              <p className="text-sm text-[var(--titanium-silver)] leading-relaxed">
                {isRejected
                  ? isAr
                    ? 'قام مدير المنصة برفض طلب الدخول حالياً. يمكنك تسجيل الخروج أو استكشاف وضع الضيف.'
                    : 'The platform administrator declined access for this account. You may sign out or browse scoped Guest Mode.'
                  : isAr
                    ? 'حرصاً على أمان البيانات الطبية وتخصيص الرصيد، تتم مراجعة الحسابات الجديدة والموافقة عليها من قبل المؤسس أحمد نوار المامو. ستُفتح المنصة تلقائياً فور القبول.'
                    : 'To protect clinical integrity and allocate starter points, new accounts are reviewed by Founder Ahmed Nawar Al-Mamo. Your workspace will unlock automatically the moment your request is approved.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--titanium-silver)]">{isAr ? 'الاسم: ' : 'Account: '}</span>
              <span className="font-semibold">{userProfile?.displayName || user?.displayName}</span>
            </div>
            <div className="font-mono-tabular truncate">
              <span className="text-[var(--titanium-silver)]">{isAr ? 'البريد: ' : 'Email: '}</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 font-mono-tabular">
              <span className="text-[var(--titanium-silver)]">{isAr ? 'معرّف المحفظة ID: ' : 'Wallet ID: '}</span>
              <span className="text-[var(--electric-cyan)] font-semibold">{walletId || '—'}</span>
              {walletId && (
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(walletId).then(() => {
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 1600);
                    });
                  }}
                  aria-label="Copy Wallet ID"
                  className="p-1 rounded border border-white/10 hover:bg-white/10"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono-tabular">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[var(--titanium-silver)]">{isAr ? 'رصيد الترحيب: ' : 'Welcome Points: '}</span>
              <span className="text-emerald-300 font-bold">{pointsBalance} pts</span>
            </div>
          </div>

          {!isRejected && pendingReferralCode && !userProfile?.referredByUid && user && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/30 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-emerald-300 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-200">
                    {isAr
                      ? `دعوة زميل مفعّلة بالكود ${pendingReferralCode}`
                      : `Colleague Referral Detected: ${pendingReferralCode}`}
                  </div>
                  <div className="text-[11px] text-emerald-100/80">
                    {isAr
                      ? 'اضغط لتفعيل هديتك (+50 نقطة) ومكافأة زميلك (+100 نقطة) الآن.'
                      : 'Claim now to credit +50 pts to your wallet and +100 pts to your inviter.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={claimingRef}
                onClick={async () => {
                  setClaimingRef(true);
                  setSavedNotice(null);
                  try {
                    const res = await WalletPro.claimReferralCode({
                      inviteeUid: user.uid,
                      inviteeName: userProfile?.displayName || user.displayName || 'Medical Colleague',
                      rawCode: pendingReferralCode,
                      language
                    });
                    clearPendingReferralCode();
                    setSavedNotice(
                      isAr
                        ? `تم تفعيل دعوة ${res.inviterName} (+${res.inviteeBonus} نقطة)!`
                        : `Redeemed invite from ${res.inviterName} (+${res.inviteeBonus} pts)!`
                    );
                  } catch (err) {
                    setSavedNotice(err instanceof Error ? err.message : 'Unable to redeem invite.');
                  } finally {
                    setClaimingRef(false);
                  }
                }}
                className="btn-3d-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
              >
                {claimingRef
                  ? isAr
                    ? 'جاري التفعيل…'
                    : 'Claiming…'
                  : isAr
                    ? 'استلام +50 نقطة'
                    : 'Claim +50 pts'}
              </button>
            </div>
          )}

          {!isRejected && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-xs text-[var(--titanium-silver)]">
                  {isAr ? 'الدور المطلوب' : 'Requested Role'}
                  <select
                    value={requestedRole}
                    onChange={(e) =>
                      setRequestedRole(e.target.value as 'clinician' | 'student' | 'patient')
                    }
                    className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2.5 text-sm text-[#F4F7FB]"
                  >
                    <option value="clinician">{isAr ? 'طبيب / ممارس صحي' : 'Clinician / Physician'}</option>
                    <option value="student">{isAr ? 'طالب طب' : 'Medical Student'}</option>
                    <option value="patient">{isAr ? 'مستخدم / مريض' : 'Patient / Individual'}</option>
                  </select>
                </label>

                <label className="block text-xs text-[var(--titanium-silver)]">
                  {isAr ? 'التخصص أو المؤسسة الطبية' : 'Specialty or Institution'}
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder={isAr ? 'مثال: طب باطني / جامعة…' : 'e.g. Cardiology / University Hospital'}
                    className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2.5 text-sm text-[#F4F7FB]"
                  />
                </label>
              </div>

              <label className="block text-xs text-[var(--titanium-silver)]">
                {isAr ? 'ملاحظة للمؤسس (اختياري)' : 'Note to Founder Admin (Optional)'}
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اذكر الغرض من الاستخدام أو رقم الترخيص إن وجد…'
                      : 'Briefly describe your clinical or academic use case…'
                  }
                  className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
                />
              </label>

              {savedNotice && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3 text-xs text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{savedNotice}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {saving
                      ? isAr
                        ? 'جاري الحفظ…'
                        : 'Saving…'
                      : isAr
                        ? 'تحديث بيانات الطلب'
                        : 'Update Access Request'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={enterGuestMode}
                  className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  {isAr ? 'معاينة وضع الضيف مؤقتاً' : 'Browse Guest Preview Meanwhile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
