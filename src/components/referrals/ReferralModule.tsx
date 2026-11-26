import React, { useEffect, useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Copy,
  Gift,
  Link2,
  Send,
  Share2,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  REFERRAL_INVITEE_BONUS,
  REFERRAL_INVITER_BONUS,
  WalletPro,
  type ReferralClaimRecord,
  type ReferralInviteRecord
} from '../../services/WalletPro';

export function ReferralModule() {
  const {
    language,
    user,
    userProfile,
    walletId,
    pointsBalance,
    isGuest,
    isFounder,
    pendingReferralCode,
    clearPendingReferralCode,
    setView,
    setActiveModule
  } = useApp();

  const isAr = language === 'ar';
  const myCode = userProfile?.referralCode || walletId || '';
  const inviteLink =
    typeof window !== 'undefined' && myCode
      ? `${window.location.origin}/?ref=${encodeURIComponent(myCode)}`
      : '';

  const [invites, setInvites] = useState<ReferralInviteRecord[]>([]);
  const [joinedClaims, setJoinedClaims] = useState<ReferralClaimRecord[]>([]);
  const [myClaim, setMyClaim] = useState<ReferralClaimRecord | null>(null);

  const [colleagueName, setColleagueName] = useState('');
  const [colleagueEmail, setColleagueEmail] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [channel, setChannel] = useState<'link' | 'email' | 'whatsapp'>('link');
  const [sendingInvite, setSendingInvite] = useState(false);

  const [claimCodeInput, setClaimCodeInput] = useState(pendingReferralCode || '');
  const [claiming, setClaiming] = useState(false);

  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (pendingReferralCode && !claimCodeInput) {
      setClaimCodeInput(pendingReferralCode);
    }
  }, [pendingReferralCode, claimCodeInput]);

  useEffect(() => {
    if (!user || isGuest) {
      setInvites([]);
      setJoinedClaims([]);
      setMyClaim(null);
      return;
    }

    const unsubInvites = WalletPro.subscribeReferralInvites(user.uid, setInvites);
    const unsubClaims = WalletPro.subscribeInviterClaims(user.uid, setJoinedClaims);
    const unsubMyClaim = WalletPro.subscribeMyReferralClaim(user.uid, setMyClaim);

    return () => {
      unsubInvites();
      unsubClaims();
      unsubMyClaim();
    };
  }, [user, isGuest]);

  const handleCopy = async (text: string, type: 'code' | 'link') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch {
      setNotice({
        kind: 'err',
        text: isAr ? 'تعذر النسخ التلقائي، يرجى النسخ يدوياً.' : 'Unable to access clipboard.'
      });
    }
  };

  const handleNativeShare = async () => {
    if (!inviteLink) return;
    const shareText = isAr
      ? `انضم معي إلى منصة MAMO MED AI الطبية الذكية باستخدام كود الدعوة ${myCode} واحصل على +${REFERRAL_INVITEE_BONUS} نقطة إضافية فور التفعيل.`
      : `Join me on MAMO MED AI Clinical Intelligence using referral code ${myCode} to receive +${REFERRAL_INVITEE_BONUS} bonus points.`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'MAMO MED AI — Colleague Invitation',
          text: shareText,
          url: inviteLink
        });
        return;
      } catch {
        // Fallback to clipboard if share cancelled or unsupported
      }
    }
    await handleCopy(`${shareText}\n${inviteLink}`, 'link');
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest || !myCode) return;
    setNotice(null);
    setSendingInvite(true);
    try {
      await WalletPro.createReferralInvite({
        inviterUid: user.uid,
        inviterName: userProfile?.displayName || user.displayName || 'Medical Colleague',
        referralCode: myCode,
        colleagueName,
        colleagueEmail,
        specialty,
        channel
      });
      setColleagueName('');
      setColleagueEmail('');
      setNotice({
        kind: 'ok',
        text: isAr
          ? 'تم تسجيل الدعوة بنجاح! شارك الرابط مع زميلك ليكسب كلاكما النقاط.'
          : 'Colleague invitation logged! Share your referral link so both of you earn bonus points.'
      });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Failed to save invitation.'
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest) return;
    setNotice(null);
    setClaiming(true);
    try {
      const res = await WalletPro.claimReferralCode({
        inviteeUid: user.uid,
        inviteeName: userProfile?.displayName || user.displayName || 'Medical Colleague',
        rawCode: claimCodeInput,
        language
      });
      clearPendingReferralCode();
      setClaimCodeInput('');
      setNotice({
        kind: 'ok',
        text: isAr
          ? `تم تفعيل دعوة ${res.inviterName}! أضيف +${res.inviteeBonus} نقطة إلى رصيدك (الرصيد الجديد: ${res.newBalance} نقطة).`
          : `Referral from ${res.inviterName} redeemed! +${res.inviteeBonus} points added (new balance: ${res.newBalance} pts).`
      });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Unable to redeem referral code.'
      });
    } finally {
      setClaiming(false);
    }
  };

  if (isGuest || !user) {
    return (
      <div className="glass-panel rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <UserPlus className="w-6 h-6 text-[var(--electric-cyan)]" />
        </div>
        <h2 className="font-display text-lg font-bold text-[var(--pearl-white)]">
          {isAr ? 'برنامج دعوة الزملاء وكسب النقاط' : 'Colleague Invitation & Referral Program'}
        </h2>
        <p className="text-sm text-[var(--titanium-silver)] max-w-lg mx-auto leading-relaxed">
          {isAr
            ? `سجّل الدخول بحساب Google للحصول على كود دعوتك الشخصي وكسب ${REFERRAL_INVITER_BONUS} نقطة في محفظة WalletPro عن كل زميل طبي ينضم عبر رابطك.`
            : `Sign in with Google to unlock your unique referral link and earn ${REFERRAL_INVITER_BONUS} WalletPro points for every colleague who joins.`}
        </p>
        <button
          type="button"
          onClick={() => setView('auth')}
          className="btn-3d-primary min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-semibold text-white"
        >
          {isAr ? 'الدخول بحساب Google' : 'Continue with Google'}
        </button>
      </div>
    );
  }

  const totalEarnedPoints = joinedClaims.length * REFERRAL_INVITER_BONUS;
  const alreadyClaimed = Boolean(myClaim || userProfile?.referredByUid);

  const shareMessage = encodeURIComponent(
    isAr
      ? `مرحباً زميلي العزيز، أدعوك للانضمام إلى منصة MAMO MED AI الطبية الذكية.\nاستخدم رابط الدعوة: ${inviteLink}\nأو أدخل الكود: ${myCode} للحصول على +${REFERRAL_INVITEE_BONUS} نقطة ترحيب إضافية.`
      : `Join me on MAMO MED AI Medical Intelligence.\nSign up using my referral link: ${inviteLink}\nor enter code ${myCode} to receive +${REFERRAL_INVITEE_BONUS} bonus points.`
  );

  return (
    <div className="space-y-6">
      {/* Header & Referral Metrics */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-[var(--electric-cyan)]" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--pearl-white)]">
                {isAr
                  ? 'دعوة الزملاء ومكافآت WalletPro'
                  : 'Colleague Invitations & Referral Rewards'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--titanium-silver)] mt-0.5 leading-relaxed">
                {isAr
                  ? `اكسب +${REFERRAL_INVITER_BONUS} نقطة عن كل طبيب أو طالب طب يسجل عبر كودك، ويحصل زميلك على +${REFERRAL_INVITEE_BONUS} نقطة إضافية فوراً في محفظته.`
                  : `Earn +${REFERRAL_INVITER_BONUS} points for every colleague who redeems your invite code; your colleague receives +${REFERRAL_INVITEE_BONUS} bonus points immediately.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModule('wallet')}
            className="btn-3d-secondary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shrink-0"
          >
            <Coins className="w-4 h-4 text-[var(--electric-cyan)]" />
            <span>
              {isAr
                ? `رصيد المحفظة: ${isFounder ? '∞' : pointsBalance} نقطة`
                : `Wallet: ${isFounder ? '∞' : pointsBalance} pts`}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1">
            <div className="text-[11px] text-[var(--titanium-silver)]">
              {isAr ? 'مكافأتك لكل دعوة' : 'Your Inviter Reward'}
            </div>
            <div className="font-mono-tabular text-xl font-bold text-[var(--electric-cyan)]">
              +{REFERRAL_INVITER_BONUS} pts
            </div>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1">
            <div className="text-[11px] text-[var(--titanium-silver)]">
              {isAr ? 'مكافأة الزميل المدعو' : 'Colleague Welcome Gift'}
            </div>
            <div className="font-mono-tabular text-xl font-bold text-emerald-400">
              +{REFERRAL_INVITEE_BONUS} pts
            </div>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1">
            <div className="text-[11px] text-[var(--titanium-silver)]">
              {isAr ? 'الزملاء المنضمون' : 'Joined Colleagues'}
            </div>
            <div className="font-mono-tabular text-xl font-bold text-[var(--pearl-white)]">
              {Math.max(joinedClaims.length, userProfile?.referralCount || 0)}
            </div>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1">
            <div className="text-[11px] text-[var(--titanium-silver)]">
              {isAr ? 'إجمالي نقاط الإحالة' : 'Referral Points Earned'}
            </div>
            <div className="font-mono-tabular text-xl font-bold text-amber-300">
              +{totalEarnedPoints} pts
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div
          className={`rounded-2xl p-4 text-xs border flex items-center gap-2 ${
            notice.kind === 'ok'
              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
          }`}
        >
          <span>{notice.text}</span>
        </div>
      )}

      {/* Share Personal Invite Link + Redeem Colleague Code */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[var(--electric-cyan)]" />
            <h2 className="font-display text-base font-bold text-[var(--pearl-white)]">
              {isAr ? 'كود ورابط الدعوة الشخصي الخاص بك' : 'Your Personal Invite Code & Link'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#040914] border border-white/15 p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] text-[var(--titanium-silver)]">
                  {isAr ? 'كود الدعوة (ID)' : 'Referral Code'}
                </div>
                <div className="font-mono-tabular text-base font-bold text-[var(--electric-cyan)] truncate">
                  {myCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(myCode, 'code')}
                className="btn-3d-secondary min-h-[44px] min-w-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                {copiedType === 'code' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedType === 'code' ? (isAr ? 'نُسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNativeShare}
              className="btn-3d-primary min-h-[44px] px-4 py-3 rounded-xl text-xs font-semibold text-white inline-flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{isAr ? 'مشاركة الدعوة عبر الهاتف / التطبيقات' : 'Share Invite Link Directly'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-[#040914] border border-white/15 p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <span className="font-mono-tabular text-xs text-[#CBD5E1] truncate">{inviteLink}</span>
            <button
              type="button"
              onClick={() => handleCopy(inviteLink, 'link')}
              className="btn-3d-secondary min-h-[44px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
            >
              {copiedType === 'link' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedType === 'link' ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy URL'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={`https://wa.me/?text=${shareMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-secondary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('MAMO MED AI Invitation')}&body=${shareMessage}`}
              className="btn-3d-secondary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <span>{isAr ? 'إرسال عبر البريد' : 'Send via Email'}</span>
            </a>
          </div>
        </section>

        {/* Redeem Colleague Code */}
        <section className="lg:col-span-5 glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display text-base font-bold text-[var(--pearl-white)]">
              {isAr ? 'هل تمت دعوتك من زميل؟' : 'Invited by a Colleague?'}
            </h2>
          </div>

          {alreadyClaimed ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>
                  {isAr
                    ? 'تم تفعيل مكافأة الانضمام عبر الدعوة بنجاح!'
                    : 'Referral Invitation Bonus Redeemed'}
                </span>
              </div>
              <p className="text-[#CBD5E1]">
                {myClaim
                  ? isAr
                    ? `الكود المستخدم: ${myClaim.referralCode} · تم إضافة +${myClaim.inviteeBonus} نقطة إلى WalletPro.`
                    : `Code used: ${myClaim.referralCode} · +${myClaim.inviteeBonus} pts credited to WalletPro.`
                  : isAr
                    ? 'حسابك مرتبط بالفعل بدعوة زميل.'
                    : 'Your account is already linked to a referring colleague.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleClaimCode} className="space-y-3">
              <p className="text-xs text-[var(--titanium-silver)] leading-relaxed">
                {isAr
                  ? `أدخل كود الدعوة الخاص بزميلك (مثل MAMO-XXXXXXXX) لتحصل فوراً على +${REFERRAL_INVITEE_BONUS} نقطة ويحصل هو على +${REFERRAL_INVITER_BONUS} نقطة.`
                  : `Enter your colleague's referral code (e.g. MAMO-XXXXXXXX) to unlock +${REFERRAL_INVITEE_BONUS} pts for yourself and +${REFERRAL_INVITER_BONUS} pts for them.`}
              </p>
              <input
                type="text"
                required
                value={claimCodeInput}
                onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
                placeholder="MAMO-XXXXXXXX"
                className="w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3.5 py-2.5 text-sm font-mono-tabular text-[#F4F7FB]"
              />
              <button
                type="submit"
                disabled={claiming || !claimCodeInput.trim()}
                className="btn-3d-primary w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Award className="w-4 h-4" />
                <span>
                  {claiming
                    ? isAr
                      ? 'جاري التحقق والشحن في WalletPro…'
                      : 'Verifying & Crediting WalletPro…'
                    : isAr
                      ? `تفعيل الكود (+${REFERRAL_INVITEE_BONUS} نقطة)`
                      : `Redeem Code (+${REFERRAL_INVITEE_BONUS} pts)`}
                </span>
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Send Tracked Invitation + History */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[var(--electric-cyan)]" />
            <h2 className="font-display text-base font-bold text-[var(--pearl-white)]">
              {isAr ? 'تسجيل دعوة جديدة لزميل' : 'Log a Colleague Invitation'}
            </h2>
          </div>

          <form onSubmit={handleCreateInvite} className="space-y-3">
            <label className="block text-xs text-[var(--titanium-silver)]">
              {isAr ? 'اسم الطبيب / الزميل' : 'Colleague Full Name'}
              <input
                type="text"
                required
                value={colleagueName}
                onChange={(e) => setColleagueName(e.target.value)}
                placeholder={isAr ? 'د. سارة العلي' : 'Dr. Sara Al-Ali'}
                className="mt-1 w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              />
            </label>

            <label className="block text-xs text-[var(--titanium-silver)]">
              {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
              <input
                type="email"
                value={colleagueEmail}
                onChange={(e) => setColleagueEmail(e.target.value)}
                placeholder="colleague@hospital.org"
                className="mt-1 w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-[var(--titanium-silver)]">
                {isAr ? 'التخصص' : 'Specialty'}
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
                />
              </label>
              <label className="block text-xs text-[var(--titanium-silver)]">
                {isAr ? 'قناة الإرسال' : 'Channel'}
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'link' | 'email' | 'whatsapp')}
                  className="mt-1 w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
                >
                  <option value="link">{isAr ? 'رابط مباشر' : 'Direct Link'}</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="btn-3d-primary w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
            >
              {sendingInvite
                ? isAr
                  ? 'جاري الحفظ…'
                  : 'Recording Invite…'
                : isAr
                  ? 'حفظ الدعوة في سجل الزملاء'
                  : 'Save Invitation to Tracker'}
            </button>
          </form>
        </section>

        {/* Joined Colleagues & Pending Invites */}
        <section className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display text-sm font-bold text-[var(--pearl-white)]">
                  {isAr ? 'الزملاء المنضمون والمكافآت المؤكدة' : 'Confirmed Colleague Joins'}
                </h3>
              </div>
              <span className="font-mono-tabular text-xs text-emerald-400">
                {joinedClaims.length} {isAr ? 'زميل' : 'joined'}
              </span>
            </div>

            {joinedClaims.length === 0 ? (
              <p className="text-xs text-[var(--titanium-silver)] rounded-xl bg-black/25 border border-white/10 p-3.5">
                {isAr
                  ? 'عندما يقوم أي زميل بتفعيل كودك بعد تسجيل الدخول، سيظهر اسمه ومكافأة +100 نقطة هنا فوراً.'
                  : 'As soon as a colleague redeems your referral code, their verified join and +100 pt bonus appear here.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {joinedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="rounded-xl bg-black/30 border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--pearl-white)] truncate">
                        {claim.inviteeName}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[var(--titanium-silver)]">
                        {claim.referralCode}
                      </div>
                    </div>
                    <span className="font-mono-tabular font-bold text-emerald-400 shrink-0">
                      +{claim.inviterBonus} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-[var(--pearl-white)]">
                {isAr ? 'الدعوات المرسلة المسجلة' : 'Sent Colleague Invitations'}
              </h3>
              <span className="font-mono-tabular text-xs text-[var(--titanium-silver)]">
                {invites.length}
              </span>
            </div>

            {invites.length === 0 ? (
              <p className="text-xs text-[var(--titanium-silver)]">
                {isAr ? 'لم تسجل دعوات مرسلة بعد.' : 'No sent invitations logged yet.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl bg-black/25 border border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--pearl-white)] truncate">
                        {inv.colleagueName}
                      </div>
                      <div className="text-[11px] text-[var(--titanium-silver)] truncate">
                        {inv.specialty} · {inv.channel}
                        {inv.colleagueEmail ? ` · ${inv.colleagueEmail}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove invite entry"
                      onClick={() => WalletPro.deleteReferralInvite(inv.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--titanium-silver)] hover:text-rose-300 hover:bg-white/5 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
