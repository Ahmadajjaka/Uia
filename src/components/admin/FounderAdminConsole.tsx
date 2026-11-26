import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  Activity,
  Bell,
  BookOpen,
  CheckCircle2,
  Coins,
  Cpu,
  Crown,
  Database,
  KeyRound,
  LayoutDashboard,
  Lock,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  UserCheck,
  Users,
  XCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  fetchAdminAiSettings,
  fetchSystemHealth,
  saveAdminAiSettings,
  testAdminAiProvider
} from '../../lib/apiClient';
import {
  DEFAULT_FEATURE_PRICING,
  FEATURE_CATALOG_META,
  type FeatureKey,
  type FeaturePricingConfig
} from '../../lib/billing';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { WalletPro, type WalletUserSummary } from '../../services/WalletPro';

type AdminTab =
  | 'overview'
  | 'approvals'
  | 'billing-pricing'
  | 'users'
  | 'guest'
  | 'database'
  | 'content'
  | 'ai-usage'
  | 'api-settings'
  | 'health'
  | 'security-logs'
  | 'notifications'
  | 'app-settings';

export function FounderAdminConsole() {
  const {
    language,
    isFounder,
    user,
    founderActivated,
    setView,
    refreshCapabilities,
    featurePricing
  } = useApp();
  const isAr = language === 'ar';

  const [tab, setTab] = useState<AdminTab>('overview');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [sysHealth, setSysHealth] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [topupRequests, setTopupRequests] = useState<any[]>([]);
  const [guestEvents, setGuestEvents] = useState<any[]>([]);
  const [aiUsageLogs, setAiUsageLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});

  // Feature pricing draft state
  const [pricingDraft, setPricingDraft] = useState<FeaturePricingConfig>(DEFAULT_FEATURE_PRICING);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  // Direct / ID-based top-up & grant form
  const [chargeMode, setChargeMode] = useState<'id' | 'direct'>('id');
  const [directTargetUid, setDirectTargetUid] = useState('');
  const [directIdentifierInput, setDirectIdentifierInput] = useState('');
  const [lookupResult, setLookupResult] = useState<WalletUserSummary | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [directPoints, setDirectPoints] = useState(100);
  const [directGrantPro, setDirectGrantPro] = useState(false);
  const [directReason, setDirectReason] = useState('');

  // API Settings inputs
  const [grokKeyInput, setGrokKeyInput] = useState('');
  const [zaiKeyInput, setZaiKeyInput] = useState('');
  const [grokModel, setGrokModel] = useState('openai/gpt-oss-120b');
  const [zaiModel, setZaiModel] = useState('glm-4.5v');
  const [grokEnabled, setGrokEnabled] = useState(true);
  const [zaiEnabled, setZaiEnabled] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(500);
  const [guestModeEnabled, setGuestModeEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Medical content creation
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSpecialty, setArticleSpecialty] = useState('Cardiology');
  const [articleSource, setArticleSource] = useState('ESC / AHA');
  const [articleSummary, setArticleSummary] = useState('');

  // Notification broadcast
  const [notifTargetUid, setNotifTargetUid] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  useEffect(() => {
    setPricingDraft(featurePricing);
  }, [featurePricing]);

  useEffect(() => {
    if (!isFounder || !user) return;

    const unsubAccess = onSnapshot(
      query(collection(db, 'access_requests'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        setAccessRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'access_requests')
    );

    const unsubTopup = onSnapshot(
      query(collection(db, 'topup_requests'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        setTopupRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'topup_requests')
    );

    const unsubUsers = onSnapshot(
      query(collection(db, 'users'), limit(100)),
      (snap) => {
        const list: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsersList(list);
        if (!directTargetUid && list.length > 0) {
          const firstNonFounder = list.find((u) => u.uid !== user.uid);
          if (firstNonFounder) setDirectTargetUid(firstNonFounder.uid || firstNonFounder.id);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    async function loadAdminData() {
      try {
        const [aiCfg, health] = await Promise.all([fetchAdminAiSettings(), fetchSystemHealth()]);
        setAiStatus(aiCfg);
        setSysHealth(health);
        setGrokModel(aiCfg.grok.model);
        setZaiModel(aiCfg.zai.model);
        setGrokEnabled(aiCfg.grok.enabled);
        setZaiEnabled(aiCfg.zai.enabled);
        setDailyLimit(aiCfg.dailyRequestLimit);

        const [gSnap, usageSnap, auditSnap] = await Promise.all([
          getDocs(query(collection(db, 'guest_analytics'), orderBy('createdAt', 'desc'), limit(50))),
          getDocs(query(collection(db, 'ai_usage'), orderBy('createdAt', 'desc'), limit(50))),
          getDocs(query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(50)))
        ]);

        setGuestEvents(gSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setAiUsageLogs(usageSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setAuditLogs(auditSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const colNames = [
          'users',
          'access_requests',
          'topup_requests',
          'point_transactions',
          'conversations',
          'diagnosis_cases',
          'lab_results',
          'radiology_reports',
          'patient_records',
          'audit_logs'
        ];
        const countPairs = await Promise.all(
          colNames.map(async (c) => {
            const snap = await getCountFromServer(collection(db, c));
            return [c, snap.data().count] as const;
          })
        );
        setCollectionCounts(Object.fromEntries(countPairs));
      } catch (err) {
        console.error('Admin load warning:', err);
      }
    }

    void loadAdminData();

    return () => {
      unsubAccess();
      unsubTopup();
      unsubUsers();
    };
  }, [isFounder, user]);

  if (!isFounder || !user) {
    return (
      <div className="glass-panel rounded-2xl p-8 max-w-lg space-y-3">
        <h2 className="font-display text-xl font-bold text-rose-300">
          {isAr ? 'وصول محظور' : 'Restricted Founder Area'}
        </h2>
        <p className="text-sm text-[#94A3B8]">
          {isAr
            ? 'لوحة الإدارة متاحة حصرياً لحساب المؤسس أحمد نوار المامو.'
            : 'This console is restricted exclusively to Founder Ahmed Nawar Al-Mamo.'}
        </p>
      </div>
    );
  }

  const pendingApprovals = accessRequests.filter((r) => r.status === 'pending');
  const pendingTopups = topupRequests.filter((r) => r.status === 'pending');

  const handleReviewAccessRequest = async (
    reqItem: any,
    decision: 'approved' | 'rejected'
  ) => {
    setStatusMessage(null);
    setBusyActionId(reqItem.id);
    try {
      await WalletPro.reviewAccessRequest({
        actorUid: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        reqItem,
        decision,
        starterApprovalPoints: Number(featurePricing.starterApprovalPoints || 0)
      });

      setStatusMessage(
        isAr
          ? `تم ${decision === 'approved' ? 'قبول' : 'رفض'} طلب دخول ${reqItem.displayName} بنجاح.`
          : `Access request for ${reqItem.displayName} marked ${decision}.`
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to process access request.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleReviewTopupRequest = async (
    reqItem: any,
    decision: 'approved' | 'rejected'
  ) => {
    setStatusMessage(null);
    setBusyActionId(reqItem.id);
    try {
      await WalletPro.reviewTopupRequest({
        actorUid: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        reqItem,
        decision
      });

      setStatusMessage(
        isAr
          ? `تم ${decision === 'approved' ? 'اعتماد' : 'رفض'} طلب الشحن للمستخدم ${reqItem.userName}.`
          : `Top-up request for ${reqItem.userName} ${decision}.`
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to process top-up request.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleLookupById = async () => {
    setLookupError(null);
    setLookupResult(null);
    const idQuery = directIdentifierInput.trim();
    if (!idQuery) {
      setLookupError(isAr ? 'أدخل معرّف المستخدم (MAMO-... أو UID أو البريد).' : 'Enter Wallet ID (MAMO-...), UID, or email.');
      return;
    }
    setBusyActionId('id-lookup');
    try {
      const found = await WalletPro.findUserByIdOrWalletId(idQuery);
      if (!found) {
        setLookupError(
          isAr
            ? `لم يتم العثور على مستخدم بالمعرّف "${idQuery}".`
            : `No user found matching ID "${idQuery}".`
        );
      } else {
        setLookupResult(found);
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleDirectGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetIdentifier =
      chargeMode === 'id' ? directIdentifierInput.trim() : directTargetUid.trim();
    if (!targetIdentifier) return;

    setStatusMessage(null);
    setLookupError(null);
    setBusyActionId('direct-grant');
    try {
      const res = await WalletPro.creditUser({
        actorUid: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        targetIdentifier,
        pointsAmount: Number(directPoints || 0),
        grantPro: directGrantPro,
        reason: directReason
      });

      if (chargeMode === 'id') {
        setLookupResult({
          ...res.targetUser,
          points: res.newBalance,
          pointsBalance: res.newBalance,
          planTier: directGrantPro ? 'pro' : res.targetUser.planTier
        });
      }
      setDirectReason('');

      setStatusMessage(
        isAr
          ? `تم شحن +${res.pointsAdded} نقطة إلى ${res.targetUser.displayName} (${res.targetUser.walletId || res.targetUser.uid}). الرصيد الجديد: ${res.newBalance} نقطة.`
          : `Credited +${res.pointsAdded} pts to ${res.targetUser.displayName} (${res.targetUser.walletId || res.targetUser.uid}). New balance: ${res.newBalance} pts.`
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Direct / ID credit failed.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setBusyActionId('save-pricing');
    try {
      const cleanCosts = {
        ai_doctor_consult: Math.max(0, Math.round(Number(pricingDraft.costs.ai_doctor_consult || 0))),
        diagnosis_workup: Math.max(0, Math.round(Number(pricingDraft.costs.diagnosis_workup || 0))),
        lab_ai_interpret: Math.max(0, Math.round(Number(pricingDraft.costs.lab_ai_interpret || 0))),
        radiology_vision: Math.max(0, Math.round(Number(pricingDraft.costs.radiology_vision || 0))),
        clinical_protocol_ai: Math.max(0, Math.round(Number(pricingDraft.costs.clinical_protocol_ai || 0))),
        pharma_ai_consult: Math.max(0, Math.round(Number(pricingDraft.costs.pharma_ai_consult || 0))),
        clinic_suite: Math.max(0, Math.round(Number(pricingDraft.costs.clinic_suite || 0))),
        themes_3d_premium: Math.max(0, Math.round(Number(pricingDraft.costs.themes_3d_premium || 0)))
      };

      await setDoc(doc(db, 'feature_pricing', 'catalog'), {
        costs: cleanCosts,
        proFeatures: pricingDraft.proFeatures,
        starterApprovalPoints: Math.max(0, Math.round(Number(pricingDraft.starterApprovalPoints || 0))),
        proMonthlyPointsBonus: Math.max(0, Math.round(Number(pricingDraft.proMonthlyPointsBonus || 0))),
        updatedByUid: user.uid,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'audit_logs'), {
        userId: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        action: 'UPDATE_FEATURE_PRICING',
        target: 'feature_pricing/catalog',
        severity: 'warning',
        createdAt: serverTimestamp()
      }).catch(() => {});

      setStatusMessage(
        isAr
          ? 'تم حفظ تسعيرة النقاط وصلاحيات PRO لجميع الميزات وتطبيقها فوراً.'
          : 'Feature point costs & PRO tier gates saved and live across all users.'
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save pricing.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleToggleUserPro = async (u: any) => {
    if (u.uid === user.uid) return;
    const nextPlan = u.planTier === 'pro' ? 'free' : 'pro';
    await updateDoc(doc(db, 'users', u.id), {
      planTier: nextPlan,
      updatedAt: serverTimestamp()
    });
    setStatusMessage(`Updated ${u.displayName} plan tier to ${nextPlan.toUpperCase()}.`);
  };

  const handleQuickCreditUser = async (u: any, amount: number) => {
    setBusyActionId(`quick_${u.id}`);
    try {
      const res = await WalletPro.creditUser({
        actorUid: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        targetIdentifier: u.id,
        pointsAmount: amount,
        grantPro: false,
        featureKey: 'admin_quick_credit',
        reason: `Founder quick credit +${amount} points`
      });
      setStatusMessage(
        `Credited +${amount} pts to ${u.displayName} (${u.walletId || u.uid}). New balance: ${res.newBalance} pts.`
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Quick credit failed.');
    } finally {
      setBusyActionId(null);
    }
  };

  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const updated = await saveAdminAiSettings({
        grokEnabled,
        grokModel,
        zaiEnabled,
        zaiModel,
        dailyRequestLimit: Number(dailyLimit),
        ...(grokKeyInput.trim() ? { grokApiKey: grokKeyInput.trim() } : {}),
        ...(zaiKeyInput.trim() ? { zaiApiKey: zaiKeyInput.trim() } : {})
      });
      setAiStatus(updated);
      setGrokKeyInput('');
      setZaiKeyInput('');

      await setDoc(doc(db, 'app_settings', 'platform_public'), {
        grokEnabled,
        grokModel,
        zaiEnabled,
        zaiModel,
        guestModeEnabled,
        maintenanceMode,
        dailyRequestLimit: Number(dailyLimit),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'audit_logs'), {
        userId: user.uid,
        actorEmail: user.email || 'ghifaramamo@gmail.com',
        action: 'UPDATE_AI_ROUTER_SETTINGS',
        target: 'server/aiRouter + app_settings/platform_public',
        severity: 'warning',
        createdAt: serverTimestamp()
      });

      await refreshCapabilities();
      setStatusMessage(
        isAr
          ? 'تم تحديث إعدادات الذكاء الاصطناعي على الخادم وحفظ البيانات غير السرية بنجاح.'
          : 'AI provider settings updated on server and synced cleanly.'
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleTestProvider = async (provider: 'grok' | 'zai') => {
    setTestResult(null);
    try {
      const res = await testAdminAiProvider(provider);
      setTestResult(
        `${res.provider.toUpperCase()} (${res.model}) — ${res.ok ? 'CONNECTED' : 'FAILED'}: ${res.message} (${res.latencyMs}ms)`
      );
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Connectivity test failed');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim()) return;
    await addDoc(collection(db, 'clinical_articles'), {
      title: articleTitle.trim(),
      specialty: articleSpecialty,
      source: articleSource,
      summary: articleSummary.trim(),
      updatedAt: serverTimestamp()
    });
    setArticleTitle('');
    setArticleSummary('');
    setStatusMessage(isAr ? 'تم نشر المحتوى الطبي بنجاح.' : 'Clinical article published to Firestore.');
  };

  const handleRoleChange = async (targetUid: string, newRole: string) => {
    if (targetUid === user.uid) return;
    await updateDoc(doc(db, 'users', targetUid), {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    await addDoc(collection(db, 'audit_logs'), {
      userId: user.uid,
      actorEmail: user.email || 'ghifaramamo@gmail.com',
      action: `ROLE_UPDATED_${newRole}`,
      target: `users/${targetUid}`,
      severity: 'warning',
      createdAt: serverTimestamp()
    });
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = notifTargetUid.trim() || user.uid;
    await addDoc(collection(db, 'notifications'), {
      userId: targetId,
      title: notifTitle.trim(),
      body: notifBody.trim(),
      read: false,
      createdAt: serverTimestamp()
    });
    setNotifTitle('');
    setNotifBody('');
    setStatusMessage(isAr ? 'تم إرسال الإشعار.' : 'Notification dispatched.');
  };

  const TABS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }> = [
    { id: 'overview', label: isAr ? 'نظرة عامة' : 'Overview', icon: LayoutDashboard },
    {
      id: 'approvals',
      label: isAr ? 'طلبات القبول' : 'Access Approvals',
      icon: UserCheck,
      count: pendingApprovals.length
    },
    {
      id: 'billing-pricing',
      label: isAr ? 'النقاط وبرو والتسعير' : 'Points, Pro & Pricing',
      icon: SlidersHorizontal,
      count: pendingTopups.length
    },
    { id: 'users', label: isAr ? 'المستخدمون' : 'User Management', icon: Users },
    { id: 'guest', label: isAr ? 'تحليلات الضيوف' : 'Guest Analytics', icon: Activity },
    { id: 'database', label: isAr ? 'قاعدة البيانات' : 'Database', icon: Database },
    { id: 'content', label: isAr ? 'المحتوى الطبي' : 'Medical Content', icon: BookOpen },
    { id: 'ai-usage', label: isAr ? 'استخدام الذكاء' : 'AI Usage', icon: Cpu },
    { id: 'api-settings', label: isAr ? 'إعدادات API' : 'API Settings', icon: KeyRound },
    { id: 'health', label: isAr ? 'صحة الخادم' : 'System Health', icon: Activity },
    { id: 'security-logs', label: isAr ? 'سجلات الأمان' : 'Security Logs', icon: Lock },
    { id: 'notifications', label: isAr ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'app-settings', label: isAr ? 'إعدادات التطبيق' : 'App Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#22D3EE]" />
          <div>
            <h1 className="font-display text-xl font-bold text-[#F4F7FB]">
              {isAr
                ? 'لوحة تحكم المؤسس والمدير العام — أحمد نوار المامو'
                : 'Founder Super Admin Console — Ahmed Nawar Al-Mamo'}
            </h1>
            <p className="text-xs font-mono-tabular text-[#94A3B8]">
              Verified Email: {user.email} · UID: {user.uid}
            </p>
          </div>
        </div>
        {!founderActivated && (
          <button
            type="button"
            onClick={() => setView('founder-setup')}
            className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-semibold text-white"
          >
            {isAr ? 'إتمام ربط UID المؤسس' : 'Complete Founder UID Binding'}
          </button>
        )}
      </div>

      {/* Horizontal Tab Rail */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#070E1C] border border-white/10">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                tab === item.id ? 'bg-[#1D6FEB] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="ms-1 px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-mono-tabular text-[10px]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3 text-xs text-emerald-200">
          {statusMessage}
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-[#94A3B8]">{isAr ? 'طلبات القبول المعلقة' : 'Pending Access Approvals'}</div>
            <div className="font-mono-tabular text-2xl font-bold text-amber-300 mt-1">{pendingApprovals.length}</div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-[#94A3B8]">{isAr ? 'طلبات الشحن وبرو المعلقة' : 'Pending Top-Ups / PRO'}</div>
            <div className="font-mono-tabular text-2xl font-bold text-[#22D3EE] mt-1">{pendingTopups.length}</div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-[#94A3B8]">{isAr ? 'المستخدمون المسجلون' : 'Registered Users'}</div>
            <div className="font-mono-tabular text-2xl font-bold mt-1">{usersList.length}</div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-xs text-[#94A3B8]">Groq / Z.AI Status</div>
            <div className="text-xs font-mono-tabular mt-2 space-y-1">
              <div>Groq / xAI: {aiStatus?.grok?.configured ? 'Configured' : 'Missing Key'}</div>
              <div>Z.AI: {aiStatus?.zai?.configured ? 'Configured' : 'Missing Key'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Access Approvals Queue */}
      {tab === 'approvals' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold">
                {isAr ? 'بوابة موافقة المؤسس على طلبات تسجيل الدخول' : 'Founder Login Access Approval Queue'}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {isAr
                  ? `عند القبول يحصل المستخدم تلقائياً على رصيد ترحيبي (${featurePricing.starterApprovalPoints} نقطة).`
                  : `Approved clinicians/students receive ${featurePricing.starterApprovalPoints} starter points automatically.`}
              </p>
            </div>
            <span className="font-mono-tabular text-xs text-amber-300">
              {pendingApprovals.length} {isAr ? 'بانتظار المراجعة' : 'pending'}
            </span>
          </div>

          {accessRequests.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">
              {isAr ? 'لا توجد طلبات دخول مسجلة حتى الآن.' : 'No access requests recorded yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {accessRequests.map((reqItem) => (
                <div
                  key={reqItem.id}
                  className="rounded-xl bg-[#040914] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#F4F7FB]">{reqItem.displayName}</span>
                      <span className="font-mono-tabular text-xs text-[#22D3EE]">{reqItem.email}</span>
                      <span className="font-mono-tabular text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#CBD5E1]">
                        {reqItem.requestedRole}
                      </span>
                      <span
                        className={`font-mono-tabular text-[11px] px-2 py-0.5 rounded ${
                          reqItem.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : reqItem.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {reqItem.status}
                      </span>
                    </div>
                    {reqItem.institutionOrSpecialty && (
                      <div className="text-xs text-[#CBD5E1]">
                        {isAr ? 'التخصص / المؤسسة: ' : 'Specialty / Institution: '}
                        {reqItem.institutionOrSpecialty}
                      </div>
                    )}
                    {reqItem.note && <div className="text-xs text-[#94A3B8]">{reqItem.note}</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyActionId === reqItem.id || reqItem.status === 'approved'}
                      onClick={() => handleReviewAccessRequest(reqItem, 'approved')}
                      className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'قبول وتفعيل' : 'Approve'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyActionId === reqItem.id || reqItem.status === 'rejected'}
                      onClick={() => handleReviewAccessRequest(reqItem, 'rejected')}
                      className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-200 inline-flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رفض' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Points Top-Ups, Pro Membership & Dynamic Feature Pricing */}
      {tab === 'billing-pricing' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Top-Up & Pro Requests Queue */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">
                  {isAr ? 'طلبات شحن النقاط وترقية PRO' : 'Points Top-Up & PRO Upgrade Requests'}
                </h2>
                <span className="font-mono-tabular text-xs text-[#22D3EE]">
                  {pendingTopups.length} {isAr ? 'معلق' : 'pending'}
                </span>
              </div>

              {topupRequests.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">
                  {isAr ? 'لا توجد طلبات شحن مسجلة حتى الآن.' : 'No top-up or PRO requests submitted yet.'}
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {topupRequests.map((reqItem) => (
                    <div
                      key={reqItem.id}
                      className="rounded-xl bg-[#040914] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-[#F4F7FB]">{reqItem.userName}</span>
                          <span className="font-mono-tabular text-[11px] text-[#94A3B8]">{reqItem.userEmail}</span>
                          <span className="font-mono-tabular text-[11px] text-[#22D3EE]">
                            +{reqItem.requestedPoints} pts · {reqItem.requestType === 'pro_upgrade' ? 'PRO UPGRADE' : 'POINTS'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono-tabular text-[#94A3B8]">
                          Ref: {reqItem.paymentReference || 'N/A'} · Status: {reqItem.status}
                        </div>
                        {reqItem.note && <div className="text-xs text-[#CBD5E1]">{reqItem.note}</div>}
                      </div>

                      {reqItem.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busyActionId === reqItem.id}
                            onClick={() => handleReviewTopupRequest(reqItem, 'approved')}
                            className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                          >
                            {isAr ? 'شحن واعتماد' : 'Credit & Approve'}
                          </button>
                          <button
                            type="button"
                            disabled={busyActionId === reqItem.id}
                            onClick={() => handleReviewTopupRequest(reqItem, 'rejected')}
                            className="btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-200"
                          >
                            {isAr ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Founder Direct & By-ID Credit / PRO Grant */}
            <form onSubmit={handleDirectGrant} className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#22D3EE]" />
                  <h2 className="font-display text-base font-semibold">
                    {isAr ? 'شحن نقاط مباشر أو عبر ID المستخدم' : 'Charge Direct or by User ID'}
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-[#040914] p-1 rounded-lg border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setChargeMode('id')}
                    className={`px-2 py-1 rounded-md font-medium ${
                      chargeMode === 'id' ? 'bg-[#1D6FEB] text-white' : 'text-[#94A3B8]'
                    }`}
                  >
                    {isAr ? 'عبر ID' : 'By ID'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChargeMode('direct')}
                    className={`px-2 py-1 rounded-md font-medium ${
                      chargeMode === 'direct' ? 'bg-[#1D6FEB] text-white' : 'text-[#94A3B8]'
                    }`}
                  >
                    {isAr ? 'مباشر' : 'Direct List'}
                  </button>
                </div>
              </div>

              {chargeMode === 'id' ? (
                <div className="space-y-2.5">
                  <label className="block text-xs text-[#94A3B8]">
                    {isAr
                      ? 'معرّف المحفظة (MAMO-...) أو UID أو البريد الإلكتروني'
                      : 'Member Wallet ID (MAMO-...), Firebase UID, or Email'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={directIdentifierInput}
                      onChange={(e) => {
                        setDirectIdentifierInput(e.target.value);
                        setLookupError(null);
                      }}
                      placeholder="MAMO-XXXXXXXX or UID or email"
                      className="flex-1 rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
                    />
                    <button
                      type="button"
                      onClick={handleLookupById}
                      disabled={busyActionId === 'id-lookup'}
                      className="btn-3d-secondary px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5 text-[#22D3EE]" />
                      <span>{isAr ? 'تحقق' : 'Find'}</span>
                    </button>
                  </div>
                  {lookupError && <p className="text-[11px] text-rose-300">{lookupError}</p>}
                  {lookupResult && (
                    <div className="rounded-xl bg-[#040914] border border-[#22D3EE]/35 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-[#F4F7FB]">
                        <span>{lookupResult.displayName}</span>
                        <span className="font-mono-tabular text-[#22D3EE]">
                          {WalletPro.resolveUserPoints(lookupResult)} pts
                        </span>
                      </div>
                      <div className="font-mono-tabular text-[11px] text-[#94A3B8] truncate">
                        {lookupResult.walletId || 'No Wallet ID'} · {lookupResult.email}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="block text-xs text-[#94A3B8]">
                  {isAr ? 'اختر المستخدم مباشرة' : 'Select User Directly'}
                  <select
                    value={directTargetUid}
                    onChange={(e) => setDirectTargetUid(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.uid}>
                        {u.displayName} [{u.walletId || u.uid.slice(0, 8)}] — {WalletPro.resolveUserPoints(u)} pts ·{' '}
                        {u.planTier || 'free'}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-xs text-[#94A3B8]">
                {isAr ? 'عدد النقاط المضافة' : 'Points to Credit'}
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={directPoints}
                  onChange={(e) => setDirectPoints(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
                />
              </label>

              <input
                type="text"
                value={directReason}
                onChange={(e) => setDirectReason(e.target.value)}
                placeholder={isAr ? 'سبب الشحن / مرجع (اختياري)' : 'Optional note / reference'}
                className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              />

              <label className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                <input
                  type="checkbox"
                  checked={directGrantPro}
                  onChange={(e) => setDirectGrantPro(e.target.checked)}
                />
                <span>{isAr ? 'تفعيل عضوية MAMO MED PRO مع الشحن' : 'Also activate MAMO MED PRO tier'}</span>
              </label>

              <button
                type="submit"
                disabled={
                  busyActionId === 'direct-grant' ||
                  (chargeMode === 'id' ? !directIdentifierInput.trim() : !directTargetUid)
                }
                className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
              >
                {busyActionId === 'direct-grant'
                  ? isAr
                    ? 'جاري الشحن…'
                    : 'Crediting…'
                  : chargeMode === 'id'
                    ? isAr
                      ? 'شحن النقاط عبر المعرّف ID'
                      : 'Charge User by ID'
                    : isAr
                      ? 'تنفيذ الشحن المباشر'
                      : 'Apply Direct Grant'}
              </button>
            </form>
          </div>

          {/* Dynamic Feature Cost & PRO Access Control */}
          <form onSubmit={handleSavePricing} className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold">
                  {isAr ? 'تحديد تكلفة كل ميزة بالمنصة وصلاحيات PRO' : 'Feature Point Cost & PRO Gate Configuration'}
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  {isAr
                    ? 'حدد تكلفة النقاط بدقة لكل وحدة طبية وهل تتطلب اشتراك PRO.'
                    : 'Set exact point deduction per feature invocation and assign which modules require PRO.'}
                </p>
              </div>
              <button
                type="submit"
                disabled={busyActionId === 'save-pricing'}
                className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
              >
                {isAr ? 'حفظ جدول الأسعار' : 'Save Feature Pricing'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-xs text-[#94A3B8]">
                {isAr ? 'نقاط الترحيب عند قبول الحساب الجديد' : 'Starter Points on Account Approval'}
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={pricingDraft.starterApprovalPoints}
                  onChange={(e) =>
                    setPricingDraft((p) => ({ ...p, starterApprovalPoints: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
                />
              </label>

              <label className="block text-xs text-[#94A3B8]">
                {isAr ? 'نقاط المكافأة لترقية PRO' : 'Default Bonus Points for PRO Upgrade'}
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={pricingDraft.proMonthlyPointsBonus}
                  onChange={(e) =>
                    setPricingDraft((p) => ({ ...p, proMonthlyPointsBonus: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {FEATURE_CATALOG_META.map((feat) => {
                const isProOnly = pricingDraft.proFeatures.includes(feat.key);
                return (
                  <div
                    key={feat.key}
                    className="rounded-xl bg-[#040914] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 max-w-xs">
                      <div className="font-semibold text-xs text-[#F4F7FB]">
                        {isAr ? feat.labelAr : feat.labelEn}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {isAr ? feat.descAr : feat.descEn}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                        <span>{isAr ? 'التكلفة:' : 'Cost:'}</span>
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          value={pricingDraft.costs[feat.key] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPricingDraft((prev) => ({
                              ...prev,
                              costs: { ...prev.costs, [feat.key]: val }
                            }));
                          }}
                          className="w-20 rounded-lg bg-[#070E1C] border border-white/15 px-2 py-1 text-xs font-mono-tabular text-[#22D3EE]"
                        />
                      </label>

                      <label className="text-[11px] flex items-center gap-1.5 text-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isProOnly}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setPricingDraft((prev) => ({
                              ...prev,
                              proFeatures: checked
                                ? Array.from(new Set([...prev.proFeatures, feat.key as FeatureKey]))
                                : prev.proFeatures.filter((k) => k !== feat.key)
                            }));
                          }}
                        />
                        <span>PRO</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        </div>
      )}

      {tab === 'api-settings' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveAiSettings} className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold">
              Groq Cloud (GPT-OSS-120B) / xAI & Z.AI GLM Vision — Server Configuration
            </h2>
            <p className="text-xs text-[#94A3B8]">
              API keys are stored exclusively on the server and never returned to or exposed in client code.
            </p>

            <div className="rounded-xl bg-[#040914] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Groq Cloud / xAI (Text & Reasoning)</span>
                <label className="text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={grokEnabled}
                    onChange={(e) => setGrokEnabled(e.target.checked)}
                  />
                  <span>Enabled</span>
                </label>
              </div>
              <div className="text-xs font-mono-tabular text-[#94A3B8] space-y-0.5">
                <div>Current Key: {aiStatus?.grok?.configured ? aiStatus.grok.maskedKey : 'Not set'}</div>
                <div>Endpoint: {aiStatus?.grok?.endpoint || 'https://api.groq.com/openai/v1/chat/completions'}</div>
              </div>
              <input
                type="password"
                value={grokKeyInput}
                onChange={(e) => setGrokKeyInput(e.target.value)}
                placeholder="Enter GROQ_API_KEY (gsk_...) or GROK_API_KEY override (optional)"
                className="w-full rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              />
              <select
                value={grokModel}
                onChange={(e) => setGrokModel(e.target.value)}
                className="w-full rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                {(
                  aiStatus?.grok?.availableModels || [
                    'openai/gpt-oss-120b',
                    'openai/gpt-oss-20b',
                    'llama-3.3-70b-versatile',
                    'meta-llama/llama-4-scout-17b-16e-instruct',
                    'grok-4.7',
                    'grok-4.6',
                    'grok-420-reasoning'
                  ]
                ).map((m: string) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={grokModel}
                onChange={(e) => setGrokModel(e.target.value)}
                placeholder="Custom Groq / xAI model ID (e.g. openai/gpt-oss-120b)"
                className="w-full rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
              />
            </div>

            <div className="rounded-xl bg-[#040914] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Z.AI GLM Vision (Medical Imaging)</span>
                <label className="text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={zaiEnabled}
                    onChange={(e) => setZaiEnabled(e.target.checked)}
                  />
                  <span>Enabled</span>
                </label>
              </div>
              <div className="text-xs font-mono-tabular text-[#94A3B8]">
                Current Key: {aiStatus?.zai?.configured ? aiStatus.zai.maskedKey : 'Not set'}
              </div>
              <input
                type="password"
                value={zaiKeyInput}
                onChange={(e) => setZaiKeyInput(e.target.value)}
                placeholder="Enter ZAI_API_KEY override (optional)"
                className="w-full rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              />
              <select
                value={zaiModel}
                onChange={(e) => setZaiModel(e.target.value)}
                className="w-full rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                {(aiStatus?.zai?.availableModels || ['glm-4.5v', 'glm-4.6v', 'glm-4.6v-flash', 'glm-5v-turbo']).map(
                  (m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>
            </div>

            <label className="block text-xs text-[#94A3B8]">
              Daily Request Limit Per User
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white">
                Save Provider Settings
              </button>
              <button
                type="button"
                onClick={() => handleTestProvider('grok')}
                className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB]"
              >
                Test Groq / xAI Connection
              </button>
              <button
                type="button"
                onClick={() => handleTestProvider('zai')}
                className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F4F7FB]"
              >
                Test Z.AI Vision Connection
              </button>
            </div>

            {testResult && (
              <div className="rounded-xl bg-[#040914] border border-[#22D3EE]/30 p-3 text-xs font-mono-tabular text-[#22D3EE]">
                {testResult}
              </div>
            )}
          </form>

          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-sm font-semibold">Recent Server Request & Error Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto text-xs font-mono-tabular">
              {(aiStatus?.recentLogs || []).length === 0 ? (
                <p className="text-[#94A3B8]">No server AI calls recorded in this runtime yet.</p>
              ) : (
                aiStatus.recentLogs.map((log: any) => (
                  <div key={log.id} className="rounded-xl bg-[#040914] border border-white/10 p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#22D3EE]">{log.provider} · {log.model}</span>
                      <span>{log.status}</span>
                    </div>
                    <div className="text-[#94A3B8]">{log.module} · {log.latencyMs}ms</div>
                    {log.errorMessage && <div className="text-rose-300">{log.errorMessage}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-semibold">
            {isAr ? 'دليل المستخدمين والأرصدة والخطط' : 'Registered User Directory, Balances & Tiers'}
          </h2>
          <div className="divide-y divide-white/10">
            {usersList.map((u) => {
              const pts = WalletPro.resolveUserPoints(u);
              const wId = u.walletId || WalletPro.generateWalletId(u.uid || u.id);
              return (
                <div key={u.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-[#F4F7FB] flex items-center gap-2 flex-wrap">
                      <span>{u.displayName}</span>
                      <span className="font-mono-tabular text-[11px] text-[#22D3EE]">{pts} pts</span>
                      <span className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#CBD5E1]">
                        {wId}
                      </span>
                      <span
                        className={`font-mono-tabular text-[10px] px-1.5 py-0.5 rounded ${
                          u.planTier === 'pro'
                            ? 'bg-amber-400/15 text-amber-300'
                            : 'bg-white/5 text-[#94A3B8]'
                        }`}
                      >
                        {(u.planTier || 'free').toUpperCase()}
                      </span>
                      <span className="font-mono-tabular text-[10px] text-[#94A3B8]">
                        [{u.approvalStatus || 'approved'}]
                      </span>
                    </div>
                    <div className="font-mono-tabular text-[#94A3B8]">
                      {u.email} · UID: {u.uid}
                    </div>
                  </div>
                  {u.uid === user.uid ? (
                    <span className="font-mono-tabular text-[#22D3EE]">super_admin (Founder Locked)</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busyActionId === `quick_${u.id}`}
                        onClick={() => handleQuickCreditUser(u, 100)}
                        className="btn-3d-secondary px-2.5 py-1.5 rounded-lg text-[11px] font-mono-tabular text-[#22D3EE]"
                      >
                        +100 pts
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('billing-pricing');
                          setChargeMode('id');
                          setDirectIdentifierInput(wId);
                          setLookupResult(u);
                        }}
                        className="btn-3d-secondary px-2.5 py-1.5 rounded-lg text-[11px] text-[#CBD5E1]"
                      >
                        {isAr ? 'شحن مخصص' : 'Charge'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleUserPro(u)}
                        className="btn-3d-secondary px-2.5 py-1.5 rounded-lg text-[11px] inline-flex items-center gap-1 text-amber-200"
                      >
                        <Crown className="w-3 h-3" />
                        <span>{u.planTier === 'pro' ? 'Set Free' : 'Grant PRO'}</span>
                      </button>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg bg-[#040914] border border-white/15 px-2.5 py-1.5 text-xs text-[#F4F7FB]"
                      >
                        <option value="clinician">clinician</option>
                        <option value="student">student</option>
                        <option value="patient">patient</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'guest' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-semibold">Guest Exploration Telemetry</h2>
          <div className="space-y-2 text-xs font-mono-tabular">
            {guestEvents.length === 0 ? (
              <p className="text-[#94A3B8]">No guest telemetry events recorded yet.</p>
            ) : (
              guestEvents.map((ev) => (
                <div key={ev.id} className="rounded-lg bg-[#040914] p-3 flex justify-between">
                  <span>{ev.moduleVisited}</span>
                  <span className="text-[#94A3B8]">{ev.language} · {ev.sessionId}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'database' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-base font-semibold">Cloud Firestore Collection Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(collectionCounts).map(([col, cnt]) => (
              <div key={col} className="rounded-xl bg-[#040914] border border-white/10 p-4">
                <div className="text-xs font-mono-tabular text-[#94A3B8]">{col}</div>
                <div className="text-xl font-mono-tabular font-bold text-[#F4F7FB] mt-1">{cnt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'content' && (
        <form onSubmit={handleCreateArticle} className="glass-panel rounded-2xl p-6 max-w-2xl space-y-4">
          <h2 className="font-display text-base font-semibold">Publish Curated Clinical Article</h2>
          <input
            required
            type="text"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder="Article or Guideline Title"
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={articleSpecialty}
              onChange={(e) => setArticleSpecialty(e.target.value)}
              placeholder="Specialty"
              className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <input
              type="text"
              value={articleSource}
              onChange={(e) => setArticleSource(e.target.value)}
              placeholder="Scientific Source"
              className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
          </div>
          <textarea
            required
            rows={4}
            value={articleSummary}
            onChange={(e) => setArticleSummary(e.target.value)}
            placeholder="Clinical summary and recommendations"
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />
          <button type="submit" className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white">
            Publish to Firestore
          </button>
        </form>
      )}

      {tab === 'ai-usage' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-semibold">Firestore AI Usage Telemetry</h2>
          <div className="space-y-2 text-xs font-mono-tabular">
            {aiUsageLogs.length === 0 ? (
              <p className="text-[#94A3B8]">No AI usage logs persisted yet.</p>
            ) : (
              aiUsageLogs.map((u) => (
                <div key={u.id} className="rounded-lg bg-[#040914] p-3 flex flex-wrap justify-between gap-2">
                  <span>{u.module} · {u.provider} ({u.model})</span>
                  <span className="text-[#22D3EE]">{u.status} · {u.latencyMs}ms</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'health' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3 text-xs font-mono-tabular">
          <h2 className="font-display text-base font-semibold">Server & Runtime Health</h2>
          {sysHealth ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#040914] p-4">Uptime: {sysHealth.uptimeSeconds}s</div>
              <div className="rounded-xl bg-[#040914] p-4">Node: {sysHealth.nodeVersion}</div>
              <div className="rounded-xl bg-[#040914] p-4">RSS Memory: {sysHealth.memoryMb} MB</div>
              <div className="rounded-xl bg-[#040914] p-4">
                ADMIN_EMAIL Env: {sysHealth.adminEmailConfigured ? 'Configured' : 'Defaulted'}
              </div>
            </div>
          ) : (
            <p className="text-[#94A3B8]">Loading system health…</p>
          )}
        </div>
      )}

      {tab === 'security-logs' && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-base font-semibold">Immutable Security Audit Logs</h2>
          <div className="space-y-2 text-xs font-mono-tabular">
            {auditLogs.length === 0 ? (
              <p className="text-[#94A3B8]">No audit entries recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl bg-[#040914] border border-white/10 p-3 flex flex-wrap justify-between gap-2">
                  <span>{log.action} · {log.target}</span>
                  <span className="text-[#22D3EE]">{log.actorEmail} · {log.severity}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <form onSubmit={handleSendNotification} className="glass-panel rounded-2xl p-6 max-w-xl space-y-4">
          <h2 className="font-display text-base font-semibold">Dispatch Platform Notification</h2>
          <input
            type="text"
            value={notifTargetUid}
            onChange={(e) => setNotifTargetUid(e.target.value)}
            placeholder="Target User UID (leave blank for Founder test)"
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
          />
          <input
            required
            type="text"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            placeholder="Notification Title"
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />
          <textarea
            required
            rows={3}
            value={notifBody}
            onChange={(e) => setNotifBody(e.target.value)}
            placeholder="Message body"
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />
          <button type="submit" className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white">
            Send Notification
          </button>
        </form>
      )}

      {tab === 'app-settings' && (
        <form onSubmit={handleSaveAiSettings} className="glass-panel rounded-2xl p-6 max-w-xl space-y-4">
          <h2 className="font-display text-base font-semibold">Global Application Settings</h2>
          <label className="flex items-center justify-between text-sm">
            <span>Allow Guest Mode Exploration</span>
            <input
              type="checkbox"
              checked={guestModeEnabled}
              onChange={(e) => setGuestModeEnabled(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            <span>Maintenance Mode Notice</span>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
          </label>
          <button type="submit" className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white">
            Sync Platform Settings
          </button>
        </form>
      )}
    </div>
  );
}
