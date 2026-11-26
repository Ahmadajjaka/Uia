import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import {
  callFounderBootstrap,
  fetchPublicHealth,
  verifyServerSession,
  type PublicCapabilitiesResponse
} from '../lib/apiClient';
import { TRANSLATIONS, type Language } from '../lib/i18n';
import { getTheme3dConfig, type Theme3dId } from '../lib/themes3d';
import {
  DEFAULT_FEATURE_PRICING,
  FEATURE_CATALOG_META,
  type FeatureKey,
  type FeaturePricingConfig
} from '../lib/billing';
import { WalletPro, type WalletUserSummary } from '../services/WalletPro';

export type AppView = 'intro' | 'landing' | 'auth' | 'app' | 'founder-setup';
export type MedicalModuleId =
  | 'dashboard'
  | 'ai-doctor'
  | 'diagnosis'
  | 'lab-analyzer'
  | 'radiology'
  | 'echo-training'
  | 'medical-images'
  | 'pharma'
  | 'med-school'
  | 'clinic'
  | 'health'
  | 'clinical'
  | 'referrals'
  | 'wallet'
  | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PlanTier = 'free' | 'pro';

export interface UserProfileDoc {
  uid: string;
  walletId?: string;
  email: string;
  displayName: string;
  role: 'clinician' | 'student' | 'patient' | 'super_admin';
  preferredLanguage: Language;
  skipIntro: boolean;
  specialty?: string;
  approvalStatus?: ApprovalStatus;
  planTier?: PlanTier;
  points?: number;
  pointsBalance?: number;
  welcomeBonusClaimed?: boolean;
  referralCode?: string;
  referredByUid?: string;
  referralCount?: number;
  theme3d?: Theme3dId;
}

export interface FeatureConsumeResult {
  ok: boolean;
  cost: number;
  reason?: 'auth' | 'approval' | 'pro_required' | 'insufficient_points';
  message: string;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (typeof TRANSLATIONS)['en'] | (typeof TRANSLATIONS)['ar'];
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  theme3d: Theme3dId;
  selectTheme3d: (theme: Theme3dId) => { ok: boolean; reason?: 'pro_required'; message?: string };
  view: AppView;
  setView: (view: AppView) => void;
  activeModule: MedicalModuleId;
  setActiveModule: (module: MedicalModuleId) => void;
  user: User | null;
  userProfile: UserProfileDoc | null;
  walletId: string;
  approvalStatus: ApprovalStatus;
  planTier: PlanTier;
  pointsBalance: number;
  featurePricing: FeaturePricingConfig;
  isGuest: boolean;
  isFounder: boolean;
  founderActivated: boolean;
  pendingReferralCode: string;
  clearPendingReferralCode: () => void;
  authLoading: boolean;
  authError: string | null;
  capabilities: PublicCapabilitiesResponse['capabilities'] | null;
  refreshCapabilities: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  enterGuestMode: () => void;
  signOutUser: () => Promise<void>;
  updateSkipIntro: (skip: boolean) => Promise<void>;
  activateFounderAccount: () => Promise<void>;
  consumeFeature: (featureKey: FeatureKey) => Promise<FeatureConsumeResult>;
  getFeatureGateState: (featureKey: FeatureKey) => {
    cost: number;
    proRequired: boolean;
    lockedByPro: boolean;
    canAfford: boolean;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [theme3d, setTheme3dState] = useState<Theme3dId>(() => {
    if (typeof window === 'undefined') return 'midnight-cyan';
    const saved = window.localStorage.getItem('mamo_theme3d');
    return getTheme3dConfig(saved || undefined).id;
  });

  const [view, setView] = useState<AppView>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('mamo_intro_seen') === '1') {
      return 'landing';
    }
    return 'intro';
  });
  const [activeModule, setActiveModuleState] = useState<MedicalModuleId>('ai-doctor');
  const [pendingReferralCode, setPendingReferralCode] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        const norm = WalletPro.normalizeReferralCode(refParam);
        if (/^MAMO-[A-Z0-9]{6,12}$/.test(norm)) {
          window.sessionStorage.setItem('mamo_pending_ref', norm);
          return norm;
        }
      }
      return window.sessionStorage.getItem('mamo_pending_ref') || '';
    } catch {
      return '';
    }
  });

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isFounder, setIsFounder] = useState<boolean>(false);
  const [founderActivated, setFounderActivated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [featurePricing, setFeaturePricing] = useState<FeaturePricingConfig>(DEFAULT_FEATURE_PRICING);
  const [capabilities, setCapabilities] = useState<PublicCapabilitiesResponse['capabilities'] | null>(
    null
  );

  const profileUnsubRef = useRef<(() => void) | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (user && userProfile) {
      updateDoc(doc(db, 'users', user.uid), {
        preferredLanguage: lang,
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');

  const refreshCapabilities = async () => {
    try {
      const health = await fetchPublicHealth();
      setCapabilities(health.capabilities);
    } catch {
      // keep existing state
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme3d', theme3d);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mamo_theme3d', theme3d);
    }
  }, [theme3d]);

  useEffect(() => {
    void refreshCapabilities();
  }, []);

  // Subscribe to live Feature Pricing & Pro catalog when signed in
  useEffect(() => {
    if (!user) {
      setFeaturePricing(DEFAULT_FEATURE_PRICING);
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'feature_pricing', 'catalog'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<FeaturePricingConfig>;
          setFeaturePricing({
            costs: { ...DEFAULT_FEATURE_PRICING.costs, ...(data.costs || {}) },
            proFeatures: Array.isArray(data.proFeatures)
              ? data.proFeatures
              : DEFAULT_FEATURE_PRICING.proFeatures,
            starterApprovalPoints:
              typeof data.starterApprovalPoints === 'number'
                ? data.starterApprovalPoints
                : DEFAULT_FEATURE_PRICING.starterApprovalPoints,
            proMonthlyPointsBonus:
              typeof data.proMonthlyPointsBonus === 'number'
                ? data.proMonthlyPointsBonus
                : DEFAULT_FEATURE_PRICING.proMonthlyPointsBonus
          });
        } else {
          setFeaturePricing(DEFAULT_FEATURE_PRICING);
        }
      },
      () => {
        setFeaturePricing(DEFAULT_FEATURE_PRICING);
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      setAuthLoading(true);
      setAuthError(null);

      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setIsFounder(false);
        setFounderActivated(false);
        setAuthLoading(false);
        return;
      }

      setUser(firebaseUser);
      setIsGuest(false);

      try {
        const session = await verifyServerSession();
        setIsFounder(session.isFounder);
        if (session.isFounder) {
          setActiveModuleState((curr) => (curr === 'ai-doctor' ? 'dashboard' : curr));
        } else {
          setActiveModuleState((curr) => (curr === 'dashboard' || curr === 'admin' ? 'ai-doctor' : curr));
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let profileSnap;
        try {
          profileSnap = await getDoc(userDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        const existingProfile = profileSnap.exists()
          ? ({ id: profileSnap.id, ...profileSnap.data() } as WalletUserSummary)
          : null;

        await WalletPro.initializeUserWallet({
          firebaseUser,
          isFounder: session.isFounder,
          preferredLanguage: language,
          existingProfile
        });

        // Subscribe to real-time updates on user profile (live approval, top-up & pro grants)
        profileUnsubRef.current = onSnapshot(
          userDocRef,
          (snap) => {
            if (!snap.exists()) return;
            const data = snap.data() as UserProfileDoc;
            setUserProfile(data);
            if (data.preferredLanguage === 'ar' || data.preferredLanguage === 'en') {
              setLanguageState(data.preferredLanguage);
            }
            if (data.theme3d) {
              const cfg = getTheme3dConfig(data.theme3d);
              const userIsPro = session.isFounder || data.planTier === 'pro';
              if (!cfg.premium || userIsPro) {
                setTheme3dState(cfg.id);
              }
            }
            if (data.skipIntro && view === 'intro') {
              setView('app');
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          }
        );

        if (session.isFounder) {
          const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid)).catch(() => null);
          setFounderActivated(Boolean(adminSnap && adminSnap.exists()));
        } else {
          setFounderActivated(false);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setAuthError(err instanceof Error ? err.message : 'Unable to verify authentication session.');
      } finally {
        setAuthLoading(false);
      }
    });

    return () => {
      if (profileUnsubRef.current) profileUnsubRef.current();
      unsubscribe();
    };
  }, []);

  const approvalStatus: ApprovalStatus = isFounder
    ? 'approved'
    : userProfile?.approvalStatus || 'pending';

  const planTier: PlanTier = isFounder ? 'pro' : userProfile?.planTier === 'pro' ? 'pro' : 'free';
  const resolvedPoints = WalletPro.resolveUserPoints(userProfile);
  const pointsBalance: number = isFounder ? resolvedPoints || 99999 : resolvedPoints;
  const walletId: string = user ? userProfile?.walletId || WalletPro.generateWalletId(user.uid) : '';

  const selectTheme3d = (nextTheme: Theme3dId) => {
    const cfg = getTheme3dConfig(nextTheme);
    const proGateEnabled = featurePricing.proFeatures.includes('themes_3d_premium');
    if (cfg.premium && proGateEnabled && planTier !== 'pro' && !isFounder) {
      return {
        ok: false,
        reason: 'pro_required' as const,
        message:
          language === 'ar'
            ? 'هذا الثيم ثلاثي الأبعاد مخصص لمشتركي باقة برو (PRO). يمكنك طلب الترقية من صفحة المحفظة.'
            : 'This 3D spatial theme is exclusive to PRO members. Request an upgrade in Wallet & Pro.'
      };
    }

    setTheme3dState(cfg.id);
    if (user && userProfile) {
      updateDoc(doc(db, 'users', user.uid), {
        theme3d: cfg.id,
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }
    return { ok: true };
  };

  const getFeatureGateState = (featureKey: FeatureKey) => {
    const cost = featurePricing.costs[featureKey] ?? 0;
    const proRequired = featurePricing.proFeatures.includes(featureKey);
    const lockedByPro = proRequired && planTier !== 'pro' && !isFounder;
    const canAfford = isFounder || cost === 0 || pointsBalance >= cost;
    return { cost, proRequired, lockedByPro, canAfford };
  };

  const consumeFeature = async (featureKey: FeatureKey): Promise<FeatureConsumeResult> => {
    const meta = FEATURE_CATALOG_META.find((f) => f.key === featureKey);
    const featureTitle = language === 'ar' ? meta?.labelAr || featureKey : meta?.labelEn || featureKey;
    const cost = featurePricing.costs[featureKey] ?? 0;

    if (isGuest || !user) {
      return {
        ok: false,
        cost,
        reason: 'auth',
        message:
          language === 'ar'
            ? 'يرجى تسجيل الدخول بحساب Google الموثق واستلام الموافقة لاستخدام هذه الميزة.'
            : 'Sign in with verified Google Auth to use this clinical feature.'
      };
    }

    if (!isFounder && approvalStatus !== 'approved') {
      return {
        ok: false,
        cost,
        reason: 'approval',
        message:
          language === 'ar'
            ? 'حسابك بانتظار موافقة المؤسس قبل تفعيل الميزات.'
            : 'Your account is awaiting Founder approval before running this module.'
      };
    }

    if (isFounder) {
      return { ok: true, cost: 0, message: '' };
    }

    if (featurePricing.proFeatures.includes(featureKey) && planTier !== 'pro') {
      return {
        ok: false,
        cost,
        reason: 'pro_required',
        message:
          language === 'ar'
            ? `ميزة "${featureTitle}" مخصصة لعضوية برو (PRO). افتح "المحفظة وبرو" لطلب الترقية.`
            : `"${featureTitle}" requires a PRO membership. Open Wallet & Pro to request an upgrade.`
      };
    }

    if (cost <= 0) {
      return { ok: true, cost: 0, message: '' };
    }

    if (pointsBalance < cost) {
      return {
        ok: false,
        cost,
        reason: 'insufficient_points',
        message:
          language === 'ar'
            ? `رصيدك الحالي (${pointsBalance} نقطة) غير كافٍ لتشغيل "${featureTitle}" (التكلفة: ${cost} نقطة). اشحن نقاطك من المحفظة.`
            : `Insufficient balance (${pointsBalance} pts) for "${featureTitle}" (requires ${cost} pts). Top up in Wallet & Pro.`
      };
    }

    return WalletPro.debitFeaturePoints({
      uid: user.uid,
      featureKey,
      featureTitle,
      cost,
      language
    });
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsGuest(false);
        const session = await verifyServerSession();
        if (session.isFounder) {
          const adminSnap = await getDoc(doc(db, 'admins', result.user.uid)).catch(() => null);
          if (!adminSnap || !adminSnap.exists()) {
            setView('founder-setup');
            return;
          }
        }
        setView('app');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setAuthError(message);
    }
  };

  const setActiveModule = (nextModule: MedicalModuleId) => {
    if (!isFounder && (nextModule === 'dashboard' || nextModule === 'admin')) {
      setActiveModuleState('ai-doctor');
      return;
    }
    setActiveModuleState(nextModule);
  };

  const clearPendingReferralCode = () => {
    setPendingReferralCode('');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('mamo_pending_ref');
    }
  };

  const enterGuestMode = () => {
    setAuthError(null);
    setIsGuest(true);
    setIsFounder(false);
    setActiveModuleState('ai-doctor');
    setView('app');
  };

  const signOutUser = async () => {
    setIsGuest(false);
    setIsFounder(false);
    setFounderActivated(false);
    await signOut(auth);
    setActiveModuleState('ai-doctor');
    setView('landing');
  };

  const updateSkipIntro = async (skip: boolean) => {
    if (skip) {
      window.sessionStorage.setItem('mamo_intro_seen', '1');
    } else {
      window.sessionStorage.removeItem('mamo_intro_seen');
    }
    if (user && userProfile) {
      setUserProfile({ ...userProfile, skipIntro: skip });
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          skipIntro: skip,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const activateFounderAccount = async () => {
    if (!user) throw new Error('Sign in with Founder Google account first.');
    const bootstrap = await callFounderBootstrap();
    if (!bootstrap.verified) {
      throw new Error('Server Founder email verification failed.');
    }

    const adminRef = doc(db, 'admins', user.uid);
    const existingAdmin = await getDoc(adminRef);
    if (!existingAdmin.exists()) {
      try {
        await setDoc(adminRef, {
          uid: user.uid,
          email: bootstrap.email,
          ownerName: 'Ahmed Nawar Al-Mamo',
          title: 'Founder & CEO — MAMO MED AI',
          activatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `admins/${user.uid}`);
      }
    }

    await updateDoc(doc(db, 'users', user.uid), {
      role: 'super_admin',
      approvalStatus: 'approved',
      planTier: 'pro',
      points: 99999,
      pointsBalance: 99999,
      walletId: WalletPro.generateWalletId(user.uid),
      welcomeBonusClaimed: true,
      updatedAt: serverTimestamp()
    }).catch(() => {});

    try {
      await setDoc(doc(db, 'audit_logs', `founder_act_${Date.now()}`), {
        userId: user.uid,
        actorEmail: bootstrap.email,
        action: 'FOUNDER_BOOTSTRAP_ACTIVATED',
        target: `admins/${user.uid}`,
        severity: 'critical',
        createdAt: serverTimestamp()
      });
    } catch {
      // Audit best-effort
    }

    setFounderActivated(true);
    setIsFounder(true);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: TRANSLATIONS[language],
      reducedMotion,
      setReducedMotion,
      theme3d,
      selectTheme3d,
      view,
      setView,
      activeModule,
      setActiveModule,
      user,
      userProfile,
      walletId,
      approvalStatus,
      planTier,
      pointsBalance,
      featurePricing,
      isGuest,
      isFounder,
      founderActivated,
      pendingReferralCode,
      clearPendingReferralCode,
      authLoading,
      authError,
      capabilities,
      refreshCapabilities,
      signInWithGoogle,
      enterGuestMode,
      signOutUser,
      updateSkipIntro,
      activateFounderAccount,
      consumeFeature,
      getFeatureGateState
    }),
    [
      language,
      reducedMotion,
      theme3d,
      view,
      activeModule,
      user,
      userProfile,
      walletId,
      approvalStatus,
      planTier,
      pointsBalance,
      featurePricing,
      isGuest,
      isFounder,
      founderActivated,
      pendingReferralCode,
      authLoading,
      authError,
      capabilities
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
