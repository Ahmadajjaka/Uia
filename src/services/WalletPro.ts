import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { Language } from '../lib/i18n';
import type { Theme3dId } from '../lib/themes3d';

export const LOGIN_WELCOME_BONUS_POINTS = 100;
export const REFERRAL_INVITER_BONUS = 100;
export const REFERRAL_INVITEE_BONUS = 50;

export interface WalletTransaction {
  id: string;
  userId: string;
  actorUid: string;
  txType: 'credit' | 'debit' | 'pro_grant';
  featureKey: string;
  pointsDelta: number;
  balanceAfter: number;
  description: string;
  createdAt?: unknown;
}

export interface WalletTopupRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestType: 'points' | 'pro_upgrade';
  requestedPoints: number;
  paymentReference: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WalletUserSummary {
  id: string;
  uid: string;
  walletId?: string;
  email: string;
  displayName: string;
  role: 'clinician' | 'student' | 'patient' | 'super_admin';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  planTier?: 'free' | 'pro';
  points?: number;
  pointsBalance?: number;
  welcomeBonusClaimed?: boolean;
  referralCode?: string;
  referredByUid?: string;
  referralCount?: number;
  specialty?: string;
  preferredLanguage?: Language;
  skipIntro?: boolean;
  theme3d?: Theme3dId;
}

export interface ReferralCodeDoc {
  id: string;
  code: string;
  ownerUid: string;
  ownerName: string;
  createdAt?: unknown;
}

export interface ReferralInviteRecord {
  id: string;
  inviterUid: string;
  inviterName: string;
  referralCode: string;
  colleagueName: string;
  colleagueEmail: string;
  specialty: string;
  channel: 'link' | 'email' | 'whatsapp';
  status: 'pending' | 'joined';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ReferralClaimRecord {
  id: string;
  inviteeUid: string;
  inviteeName: string;
  inviterUid: string;
  referralCode: string;
  inviterBonus: number;
  inviteeBonus: number;
  createdAt?: unknown;
}

export interface WalletDebitResult {
  ok: boolean;
  cost: number;
  newBalance?: number;
  reason?: 'insufficient_points';
  message: string;
}

const WALLET_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a deterministic, memorable Member Wallet ID (`MAMO-XXXXXXXX`)
 * matching `^MAMO-[A-Z0-9]{6,12}$` from a Firebase UID.
 */
export function generateWalletId(uid: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < uid.length; i++) {
    const code = uid.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= (code + i * 17) & 0xff;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }

  let code = '';
  let mix = h1;
  for (let i = 0; i < 8; i++) {
    if (i === 4) mix = h2;
    code += WALLET_ALPHABET[mix % WALLET_ALPHABET.length];
    mix = ((mix >>> 4) ^ (h1 >>> i)) >>> 0;
  }
  return `MAMO-${code}`;
}

export function resolveUserPoints(
  profile?: { points?: number; pointsBalance?: number } | null
): number {
  if (!profile) return 0;
  if (typeof profile.points === 'number') return profile.points;
  if (typeof profile.pointsBalance === 'number') return profile.pointsBalance;
  return 0;
}

export function normalizeReferralCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!cleaned) return '';
  return cleaned.startsWith('MAMO-') ? cleaned : `MAMO-${cleaned}`;
}

export const WalletPro = {
  LOGIN_WELCOME_BONUS_POINTS,
  REFERRAL_INVITER_BONUS,
  REFERRAL_INVITEE_BONUS,
  generateWalletId,
  normalizeReferralCode,
  resolveUserPoints,

  /**
   * Ensures a signed-in user has:
   * - A unique `walletId` (`MAMO-XXXXXXXX`)
   * - An initialized `points` & `pointsBalance` field
   * - A one-time 100-point login welcome bonus (`welcomeBonusClaimed: true`)
   *   recorded atomically in `point_transactions/welcome_{uid}`.
   */
  async initializeUserWallet(params: {
    firebaseUser: User;
    isFounder: boolean;
    preferredLanguage: Language;
    existingProfile: WalletUserSummary | null;
  }): Promise<void> {
    const { firebaseUser, isFounder, preferredLanguage, existingProfile } = params;
    const uid = firebaseUser.uid;
    const userRef = doc(db, 'users', uid);
    const derivedWalletId = existingProfile?.walletId || generateWalletId(uid);

    if (!existingProfile) {
      const starterPoints = isFounder ? 99999 : LOGIN_WELCOME_BONUS_POINTS;
      const displayName =
        firebaseUser.displayName || (isFounder ? 'Ahmed Nawar Al-Mamo' : 'Medical User');
      const email = firebaseUser.email || '';

      const batch = writeBatch(db);
      batch.set(userRef, {
        uid,
        walletId: derivedWalletId,
        referralCode: derivedWalletId,
        referralCount: 0,
        email,
        displayName,
        role: isFounder ? 'super_admin' : 'clinician',
        preferredLanguage,
        skipIntro: false,
        specialty: isFounder ? 'Platform Founder & CEO' : 'General Medicine',
        approvalStatus: isFounder ? 'approved' : 'pending',
        planTier: isFounder ? 'pro' : 'free',
        points: starterPoints,
        pointsBalance: starterPoints,
        welcomeBonusClaimed: true,
        theme3d: 'midnight-cyan' as Theme3dId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const codeRef = doc(db, 'referral_codes', derivedWalletId);
      batch.set(codeRef, {
        code: derivedWalletId,
        ownerUid: uid,
        ownerName: displayName.slice(0, 120),
        createdAt: serverTimestamp()
      });

      if (!isFounder) {
        const welcomeTxRef = doc(db, 'point_transactions', `welcome_${uid}`);
        batch.set(welcomeTxRef, {
          userId: uid,
          actorUid: uid,
          txType: 'credit',
          featureKey: 'welcome_login_bonus',
          pointsDelta: LOGIN_WELCOME_BONUS_POINTS,
          balanceAfter: starterPoints,
          description: `Welcome login bonus (+${LOGIN_WELCOME_BONUS_POINTS} points · ID ${derivedWalletId})`,
          createdAt: serverTimestamp()
        });

        const reqRef = doc(db, 'access_requests', uid);
        batch.set(reqRef, {
          userId: uid,
          email,
          displayName,
          requestedRole: 'clinician',
          institutionOrSpecialty: 'General Medicine',
          note: '',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
      return;
    }

    // Existing account backfill: ensure welcomeBonusClaimed, points, and walletId are initialized
    if (!isFounder && existingProfile.welcomeBonusClaimed !== true) {
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(userRef);
          if (!snap.exists()) return;
          const data = snap.data();
          if (data.welcomeBonusClaimed === true) return;

          const currentPts = Number(data.points ?? data.pointsBalance ?? 0);
          const nextPts = currentPts + LOGIN_WELCOME_BONUS_POINTS;
          const walletId = (data.walletId as string | undefined) || derivedWalletId;

          tx.update(userRef, {
            points: nextPts,
            pointsBalance: nextPts,
            walletId,
            welcomeBonusClaimed: true,
            updatedAt: serverTimestamp()
          });

          const welcomeTxRef = doc(db, 'point_transactions', `welcome_${uid}`);
          tx.set(welcomeTxRef, {
            userId: uid,
            actorUid: uid,
            txType: 'credit',
            featureKey: 'welcome_login_bonus',
            pointsDelta: LOGIN_WELCOME_BONUS_POINTS,
            balanceAfter: nextPts,
            description: `Welcome login bonus (+${LOGIN_WELCOME_BONUS_POINTS} points · ID ${walletId})`,
            createdAt: serverTimestamp()
          });
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    } else if (
      isFounder &&
      (!existingProfile.walletId ||
        typeof existingProfile.points !== 'number' ||
        existingProfile.welcomeBonusClaimed !== true)
    ) {
      const pts = resolveUserPoints(existingProfile) || 99999;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) return;
        tx.update(userRef, {
          walletId: snap.data().walletId || derivedWalletId,
          points: pts,
          pointsBalance: pts,
          welcomeBonusClaimed: true,
          updatedAt: serverTimestamp()
        });
      }).catch(() => {});
    }

    // Backfill referralCode on legacy user profiles + publish non-PII referral_codes lookup doc
    const activeCode = existingProfile.referralCode || derivedWalletId;
    if (!existingProfile.referralCode && existingProfile.walletId) {
      await updateDoc(userRef, {
        referralCode: activeCode,
        referralCount: existingProfile.referralCount ?? 0,
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }

    const codeRef = doc(db, 'referral_codes', activeCode);
    const codeSnap = await getDoc(codeRef).catch(() => null);
    if (!codeSnap || !codeSnap.exists()) {
      const displayName =
        existingProfile.displayName || firebaseUser.displayName || 'Medical Colleague';
      await setDoc(codeRef, {
        code: activeCode,
        ownerUid: uid,
        ownerName: displayName.slice(0, 120),
        createdAt: serverTimestamp()
      }).catch(() => {});
    }

    // Legacy safety: ensure access_requests exists for non-founder without approvalStatus
    if (!isFounder && !existingProfile.approvalStatus) {
      const reqRef = doc(db, 'access_requests', uid);
      const reqSnap = await getDoc(reqRef).catch(() => null);
      if (!reqSnap || !reqSnap.exists()) {
        await writeBatch(db)
          .set(reqRef, {
            userId: uid,
            email: existingProfile.email || firebaseUser.email || '',
            displayName: existingProfile.displayName || firebaseUser.displayName || 'Medical User',
            requestedRole:
              existingProfile.role === 'super_admin'
                ? 'clinician'
                : existingProfile.role || 'clinician',
            institutionOrSpecialty: existingProfile.specialty || 'General Medicine',
            note: '',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          .commit()
          .catch(() => {});
      }
    }
  },

  /**
   * Atomically debits points from `users/{uid}` (syncing both `points` & `pointsBalance`)
   * and writes an immutable `debit` entry to `point_transactions`.
   */
  async debitFeaturePoints(params: {
    uid: string;
    featureKey: string;
    featureTitle: string;
    cost: number;
    language: Language;
  }): Promise<WalletDebitResult> {
    const { uid, featureKey, featureTitle, cost, language } = params;
    const userRef = doc(db, 'users', uid);
    const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const txRef = doc(db, 'point_transactions', txId);

    try {
      let updatedBalance = 0;
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('Profile missing');
        const currentPts = Number(snap.data().points ?? snap.data().pointsBalance ?? 0);
        if (currentPts < cost) {
          throw new Error('INSUFFICIENT_POINTS');
        }
        const nextPts = currentPts - cost;
        updatedBalance = nextPts;

        tx.update(userRef, {
          points: nextPts,
          pointsBalance: nextPts,
          updatedAt: serverTimestamp()
        });

        tx.set(txRef, {
          userId: uid,
          actorUid: uid,
          txType: 'debit',
          featureKey,
          pointsDelta: -cost,
          balanceAfter: nextPts,
          description: `${featureTitle} (-${cost} pts)`,
          createdAt: serverTimestamp()
        });
      });

      return { ok: true, cost, newBalance: updatedBalance, message: '' };
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_POINTS') {
        return {
          ok: false,
          cost,
          reason: 'insufficient_points',
          message:
            language === 'ar'
              ? `رصيد النقاط غير كافٍ (${cost} نقطة مطلوبة).`
              : `Insufficient points balance (${cost} pts required).`
        };
      }
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  },

  /**
   * Looks up a user by exact Firebase UID, Member Wallet ID (`MAMO-XXXXXXXX`), or email.
   */
  async findUserByIdOrWalletId(identifier: string): Promise<WalletUserSummary | null> {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    // 1. Direct UID lookup when valid Firestore document ID
    if (/^[a-zA-Z0-9_-]{4,128}$/.test(trimmed) && !trimmed.toUpperCase().startsWith('MAMO-')) {
      try {
        const directSnap = await getDoc(doc(db, 'users', trimmed));
        if (directSnap.exists()) {
          return { id: directSnap.id, ...(directSnap.data() as Omit<WalletUserSummary, 'id'>) };
        }
      } catch (err) {
        // Ignore non-permission lookup errors; surface permission errors cleanly
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        if (msg.includes('permission') || msg.includes('insufficient')) {
          handleFirestoreError(err, OperationType.GET, `users/${trimmed}`);
        }
      }
    }

    // 2. Member Wallet ID lookup (`MAMO-XXXXXXXX` or bare 8-char suffix)
    const normalizedWallet = trimmed.toUpperCase().startsWith('MAMO-')
      ? trimmed.toUpperCase()
      : `MAMO-${trimmed.toUpperCase()}`;

    try {
      const walletSnap = await getDocs(
        query(collection(db, 'users'), where('walletId', '==', normalizedWallet), limit(1))
      );
      if (!walletSnap.empty) {
        const d = walletSnap.docs[0];
        return { id: d.id, ...(d.data() as Omit<WalletUserSummary, 'id'>) };
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }

    // 3. Email fallback lookup
    if (trimmed.includes('@')) {
      try {
        const emailSnap = await getDocs(
          query(collection(db, 'users'), where('email', '==', trimmed.toLowerCase()), limit(1))
        );
        if (!emailSnap.empty) {
          const d = emailSnap.docs[0];
          return { id: d.id, ...(d.data() as Omit<WalletUserSummary, 'id'>) };
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    }

    return null;
  },

  /**
   * Credits points (and optionally grants PRO tier) to a user identified directly
   * by UID, Wallet ID (`MAMO-...`), or email via an atomic Firestore transaction.
   */
  async creditUser(params: {
    actorUid: string;
    actorEmail: string;
    targetIdentifier: string;
    pointsAmount: number;
    grantPro: boolean;
    reason?: string;
    featureKey?: string;
  }): Promise<{ targetUser: WalletUserSummary; newBalance: number; pointsAdded: number }> {
    const {
      actorUid,
      actorEmail,
      targetIdentifier,
      pointsAmount,
      grantPro,
      reason,
      featureKey = grantPro ? 'founder_pro_grant' : 'founder_direct_credit'
    } = params;

    const target = await WalletPro.findUserByIdOrWalletId(targetIdentifier);
    if (!target) {
      throw new Error(`No user matched ID or email "${targetIdentifier}".`);
    }

    const cleanPoints = Math.max(0, Math.round(Number(pointsAmount || 0)));
    if (cleanPoints === 0 && !grantPro) {
      throw new Error('Specify a positive point amount or enable PRO activation.');
    }

    const userRef = doc(db, 'users', target.id);
    let newBalance = 0;

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('Target user profile missing.');
        const uData = userSnap.data();
        const currentPts = Number(uData.points ?? uData.pointsBalance ?? 0);
        newBalance = currentPts + cleanPoints;
        const walletId = (uData.walletId as string | undefined) || generateWalletId(target.id);

        tx.update(userRef, {
          points: newBalance,
          pointsBalance: newBalance,
          walletId,
          planTier: grantPro ? 'pro' : uData.planTier || 'free',
          updatedAt: serverTimestamp()
        });

        const ledgerRef = doc(collection(db, 'point_transactions'));
        tx.set(ledgerRef, {
          userId: target.id,
          actorUid,
          txType: grantPro ? 'pro_grant' : 'credit',
          featureKey,
          pointsDelta: cleanPoints,
          balanceAfter: newBalance,
          description:
            reason?.trim() ||
            `Admin direct top-up (${walletId}): +${cleanPoints} pts${grantPro ? ' + PRO tier' : ''}`,
          createdAt: serverTimestamp()
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${target.id}`);
    }

    await addDoc(collection(db, 'notifications'), {
      userId: target.id,
      title: grantPro ? 'Wallet Credited & PRO Activated' : 'Points Credited to Wallet',
      body: `Founder Admin added +${cleanPoints} points${grantPro ? ' and upgraded your account to PRO' : ''}. New balance: ${newBalance} pts.`,
      read: false,
      createdAt: serverTimestamp()
    }).catch(() => {});

    await addDoc(collection(db, 'audit_logs'), {
      userId: actorUid,
      actorEmail,
      action: grantPro ? 'WALLET_CREDIT_AND_PRO' : 'WALLET_DIRECT_CREDIT',
      target: `users/${target.id} (${target.walletId || target.id}) +${cleanPoints} pts`,
      severity: 'info',
      createdAt: serverTimestamp()
    }).catch(() => {});

    return { targetUser: target, newBalance, pointsAdded: cleanPoints };
  },

  /**
   * Approves or rejects a user's pending access request while preserving
   * their 100-point login bonus and adding optional starter approval points.
   */
  async reviewAccessRequest(params: {
    actorUid: string;
    actorEmail: string;
    reqItem: { id: string; userId?: string; requestedRole?: string };
    decision: 'approved' | 'rejected';
    starterApprovalPoints: number;
  }): Promise<{ starterPointsAwarded: number }> {
    const { actorUid, actorEmail, reqItem, decision, starterApprovalPoints } = params;
    const targetUid = reqItem.userId || reqItem.id;
    const starterPoints =
      decision === 'approved' ? Math.max(0, Math.round(Number(starterApprovalPoints || 0))) : 0;

    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', targetUid);
        const reqRef = doc(db, 'access_requests', targetUid);
        const userSnap = await tx.get(userRef);

        tx.update(reqRef, {
          status: decision,
          reviewedByEmail: actorEmail,
          updatedAt: serverTimestamp()
        });

        if (userSnap.exists()) {
          const uData = userSnap.data();
          const currentBalance = Number(uData.points ?? uData.pointsBalance ?? 0);
          const nextBalance = decision === 'approved' ? currentBalance + starterPoints : currentBalance;
          const walletId = (uData.walletId as string | undefined) || generateWalletId(targetUid);

          tx.update(userRef, {
            approvalStatus: decision,
            role: reqItem.requestedRole || uData.role || 'clinician',
            planTier: uData.planTier || 'free',
            points: nextBalance,
            pointsBalance: nextBalance,
            walletId,
            updatedAt: serverTimestamp()
          });

          if (decision === 'approved' && starterPoints > 0) {
            const ledgerRef = doc(collection(db, 'point_transactions'));
            tx.set(ledgerRef, {
              userId: targetUid,
              actorUid,
              txType: 'credit',
              featureKey: 'starter_approval_bonus',
              pointsDelta: starterPoints,
              balanceAfter: nextBalance,
              description: `Account approved by Founder Admin (+${starterPoints} starter points)`,
              createdAt: serverTimestamp()
            });
          }
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `access_requests/${targetUid}`);
    }

    await addDoc(collection(db, 'notifications'), {
      userId: targetUid,
      title:
        decision === 'approved'
          ? 'MAMO MED AI Access Approved'
          : 'MAMO MED AI Access Request Update',
      body:
        decision === 'approved'
          ? `Your clinical workspace is now active (+${starterPoints} approval bonus points).`
          : 'Your access request was declined by the Founder Administrator.',
      read: false,
      createdAt: serverTimestamp()
    }).catch(() => {});

    await addDoc(collection(db, 'audit_logs'), {
      userId: actorUid,
      actorEmail,
      action: `ACCESS_REQUEST_${decision.toUpperCase()}`,
      target: `access_requests/${targetUid}`,
      severity: 'warning',
      createdAt: serverTimestamp()
    }).catch(() => {});

    return { starterPointsAwarded: starterPoints };
  },

  /**
   * Approves or rejects a pending `topup_requests` submission and credits points atomically.
   */
  async reviewTopupRequest(params: {
    actorUid: string;
    actorEmail: string;
    reqItem: WalletTopupRequest;
    decision: 'approved' | 'rejected';
  }): Promise<{ pointsCredited: number; grantedPro: boolean }> {
    const { actorUid, actorEmail, reqItem, decision } = params;
    const targetUid = reqItem.userId;
    const ptsToAdd = decision === 'approved' ? Math.max(0, Number(reqItem.requestedPoints || 0)) : 0;
    const grantsPro = decision === 'approved' && reqItem.requestType === 'pro_upgrade';

    try {
      await runTransaction(db, async (tx) => {
        const topupRef = doc(db, 'topup_requests', reqItem.id);
        const userRef = doc(db, 'users', targetUid);
        const topupSnap = await tx.get(topupRef);
        const userSnap = await tx.get(userRef);

        if (!topupSnap.exists() || topupSnap.data().status !== 'pending') {
          throw new Error('Request already processed.');
        }

        tx.update(topupRef, {
          status: decision,
          adminNote:
            decision === 'approved'
              ? `Approved by Founder Admin (${actorEmail})`
              : 'Rejected by Founder Admin',
          updatedAt: serverTimestamp()
        });

        if (decision === 'approved' && userSnap.exists()) {
          const uData = userSnap.data();
          const currentBalance = Number(uData.points ?? uData.pointsBalance ?? 0);
          const nextBalance = currentBalance + ptsToAdd;
          const walletId = (uData.walletId as string | undefined) || generateWalletId(targetUid);

          tx.update(userRef, {
            points: nextBalance,
            pointsBalance: nextBalance,
            walletId,
            planTier: grantsPro ? 'pro' : uData.planTier || 'free',
            updatedAt: serverTimestamp()
          });

          const ledgerRef = doc(collection(db, 'point_transactions'));
          tx.set(ledgerRef, {
            userId: targetUid,
            actorUid,
            txType: grantsPro ? 'pro_grant' : 'credit',
            featureKey: grantsPro ? 'pro_membership_upgrade' : 'wallet_topup',
            pointsDelta: ptsToAdd,
            balanceAfter: nextBalance,
            description: grantsPro
              ? `PRO tier activated + ${ptsToAdd} points (${reqItem.paymentReference || 'Approved'})`
              : `Points top-up approved: +${ptsToAdd} pts (${reqItem.paymentReference || 'Approved'})`,
            createdAt: serverTimestamp()
          });
        }
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Request already processed.') {
        throw err;
      }
      handleFirestoreError(err, OperationType.WRITE, `topup_requests/${reqItem.id}`);
    }

    await addDoc(collection(db, 'notifications'), {
      userId: targetUid,
      title:
        decision === 'approved'
          ? grantsPro
            ? 'MAMO MED PRO Activated'
            : 'Points Top-Up Credited'
          : 'Top-Up Request Declined',
      body:
        decision === 'approved'
          ? `Credited +${ptsToAdd} points${grantsPro ? ' and unlocked PRO Membership' : ''}.`
          : 'Your recent wallet top-up request was declined. Contact administrator for verification.',
      read: false,
      createdAt: serverTimestamp()
    }).catch(() => {});

    return { pointsCredited: ptsToAdd, grantedPro: grantsPro };
  },

  /**
   * Submits a top-up or PRO upgrade request to Firestore for Founder approval.
   */
  async submitTopupRequest(params: {
    userId: string;
    userEmail: string;
    userName: string;
    requestType: 'points' | 'pro_upgrade';
    requestedPoints: number;
    paymentReference: string;
    note: string;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'topup_requests'), {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        requestType: params.requestType,
        requestedPoints: params.requestedPoints,
        paymentReference: params.paymentReference.trim().slice(0, 160),
        note: params.note.trim().slice(0, 500),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'topup_requests');
    }
  },

  subscribeUserTopupRequests(
    uid: string,
    onData: (rows: WalletTopupRequest[]) => void
  ): Unsubscribe {
    return onSnapshot(
      query(collection(db, 'topup_requests'), where('userId', '==', uid), orderBy('createdAt', 'desc')),
      (snap) => {
        onData(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WalletTopupRequest, 'id'>)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'topup_requests')
    );
  },

  subscribeUserTransactions(
    uid: string,
    onData: (rows: WalletTransaction[]) => void
  ): Unsubscribe {
    return onSnapshot(
      query(
        collection(db, 'point_transactions'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        onData(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WalletTransaction, 'id'>)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'point_transactions')
    );
  },

  /**
   * Looks up a referral code in the non-PII `referral_codes` directory.
   */
  async lookupReferralCode(rawCode: string): Promise<ReferralCodeDoc | null> {
    const code = normalizeReferralCode(rawCode);
    if (!/^MAMO-[A-Z0-9]{6,12}$/.test(code)) return null;
    try {
      const snap = await getDoc(doc(db, 'referral_codes', code));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<ReferralCodeDoc, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `referral_codes/${code}`);
    }
  },

  /**
   * Logs a colleague invitation sent by a clinician in `referral_invites`.
   */
  async createReferralInvite(params: {
    inviterUid: string;
    inviterName: string;
    referralCode: string;
    colleagueName: string;
    colleagueEmail: string;
    specialty: string;
    channel: 'link' | 'email' | 'whatsapp';
  }): Promise<string> {
    const cleanName = params.colleagueName.trim().slice(0, 120);
    if (!cleanName) {
      throw new Error('Colleague name is required.');
    }
    try {
      const docRef = await addDoc(collection(db, 'referral_invites'), {
        inviterUid: params.inviterUid,
        inviterName: params.inviterName.trim().slice(0, 120) || 'Medical Colleague',
        referralCode: normalizeReferralCode(params.referralCode),
        colleagueName: cleanName,
        colleagueEmail: params.colleagueEmail.trim().toLowerCase().slice(0, 254),
        specialty: params.specialty.trim().slice(0, 120) || 'General Medicine',
        channel: params.channel,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'referral_invites');
    }
  },

  async deleteReferralInvite(inviteId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'referral_invites', inviteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `referral_invites/${inviteId}`);
    }
  },

  /**
   * Atomically redeems a colleague's referral code via Firestore transaction:
   * - Creates immutable `referral_claims/{inviteeUid}`
   * - Credits invitee +50 points & binds `referredByUid`
   * - Increments inviter +100 points & `referralCount` via `increment()` without exposing PII
   * - Writes both immutable `point_transactions` audit entries (`ref_invitee_*` & `ref_inviter_*`)
   */
  async claimReferralCode(params: {
    inviteeUid: string;
    inviteeName: string;
    rawCode: string;
    language: Language;
  }): Promise<{
    inviterName: string;
    inviteeBonus: number;
    inviterBonus: number;
    newBalance: number;
  }> {
    const { inviteeUid, inviteeName, rawCode, language } = params;
    const isAr = language === 'ar';
    const normalized = normalizeReferralCode(rawCode);

    if (!/^MAMO-[A-Z0-9]{6,12}$/.test(normalized)) {
      throw new Error(
        isAr
          ? 'صيغة كود الدعوة غير صحيحة (مثال: MAMO-XXXXXXXX).'
          : 'Invalid referral code format (expected MAMO-XXXXXXXX).'
      );
    }

    const codeDoc = await WalletPro.lookupReferralCode(normalized);
    if (!codeDoc) {
      throw new Error(
        isAr
          ? 'لم يتم العثور على كود الدعوة هذا. تحقق من الكود مع زميلك.'
          : 'Referral code not found. Please verify the code with your colleague.'
      );
    }

    if (codeDoc.ownerUid === inviteeUid) {
      throw new Error(
        isAr
          ? 'لا يمكنك استخدام كود الدعوة الخاص بك.'
          : 'You cannot redeem your own referral code.'
      );
    }

    const claimRef = doc(db, 'referral_claims', inviteeUid);
    const inviteeRef = doc(db, 'users', inviteeUid);
    const inviterRef = doc(db, 'users', codeDoc.ownerUid);
    const inviteeTxRef = doc(db, 'point_transactions', `ref_invitee_${inviteeUid}`);
    const inviterTxRef = doc(db, 'point_transactions', `ref_inviter_${inviteeUid}`);
    const cleanInviteeName = inviteeName.trim().slice(0, 120) || 'Medical Colleague';

    let updatedBalance = 0;

    try {
      await runTransaction(db, async (tx) => {
        const existingClaim = await tx.get(claimRef);
        const inviteeSnap = await tx.get(inviteeRef);

        if (existingClaim.exists()) {
          throw new Error('ALREADY_CLAIMED');
        }
        if (!inviteeSnap.exists()) {
          throw new Error('PROFILE_MISSING');
        }

        const uData = inviteeSnap.data();
        if (uData.referredByUid) {
          throw new Error('ALREADY_CLAIMED');
        }

        const currentPts = Number(uData.points ?? uData.pointsBalance ?? 0);
        updatedBalance = currentPts + REFERRAL_INVITEE_BONUS;

        tx.set(claimRef, {
          inviteeUid,
          inviteeName: cleanInviteeName,
          inviterUid: codeDoc.ownerUid,
          referralCode: normalized,
          inviterBonus: REFERRAL_INVITER_BONUS,
          inviteeBonus: REFERRAL_INVITEE_BONUS,
          createdAt: serverTimestamp()
        });

        tx.update(inviteeRef, {
          points: updatedBalance,
          pointsBalance: updatedBalance,
          referredByUid: codeDoc.ownerUid,
          updatedAt: serverTimestamp()
        });

        tx.update(inviterRef, {
          points: increment(REFERRAL_INVITER_BONUS),
          pointsBalance: increment(REFERRAL_INVITER_BONUS),
          referralCount: increment(1),
          updatedAt: serverTimestamp()
        });

        tx.set(inviteeTxRef, {
          userId: inviteeUid,
          actorUid: inviteeUid,
          txType: 'credit',
          featureKey: 'referral_join_bonus',
          pointsDelta: REFERRAL_INVITEE_BONUS,
          balanceAfter: updatedBalance,
          description: `Referral welcome bonus via ${codeDoc.ownerName} (${normalized}): +${REFERRAL_INVITEE_BONUS} pts`,
          createdAt: serverTimestamp()
        });

        tx.set(inviterTxRef, {
          userId: codeDoc.ownerUid,
          actorUid: inviteeUid,
          txType: 'credit',
          featureKey: 'referral_inviter_bonus',
          pointsDelta: REFERRAL_INVITER_BONUS,
          balanceAfter: 0,
          description: `Colleague joined via your invite (${cleanInviteeName}): +${REFERRAL_INVITER_BONUS} pts`,
          createdAt: serverTimestamp()
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_CLAIMED') {
        throw new Error(
          isAr
            ? 'لقد قمت مسبقاً بتفعيل مكافأة الدعوة لهذا الحساب.'
            : 'A referral invitation bonus has already been claimed on this account.'
        );
      }
      if (err instanceof Error && err.message === 'PROFILE_MISSING') {
        throw new Error(isAr ? 'ملف المستخدم غير جاهز بعد.' : 'User profile is not ready yet.');
      }
      handleFirestoreError(err, OperationType.WRITE, `referral_claims/${inviteeUid}`);
    }

    return {
      inviterName: codeDoc.ownerName,
      inviteeBonus: REFERRAL_INVITEE_BONUS,
      inviterBonus: REFERRAL_INVITER_BONUS,
      newBalance: updatedBalance
    };
  },

  subscribeReferralInvites(
    uid: string,
    onData: (rows: ReferralInviteRecord[]) => void
  ): Unsubscribe {
    return onSnapshot(
      query(
        collection(db, 'referral_invites'),
        where('inviterUid', '==', uid),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        onData(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ReferralInviteRecord, 'id'>)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'referral_invites')
    );
  },

  subscribeInviterClaims(
    uid: string,
    onData: (rows: ReferralClaimRecord[]) => void
  ): Unsubscribe {
    return onSnapshot(
      query(
        collection(db, 'referral_claims'),
        where('inviterUid', '==', uid),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        onData(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ReferralClaimRecord, 'id'>)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'referral_claims')
    );
  },

  subscribeMyReferralClaim(
    uid: string,
    onData: (row: ReferralClaimRecord | null) => void
  ): Unsubscribe {
    return onSnapshot(
      doc(db, 'referral_claims', uid),
      (snap) => {
        if (!snap.exists()) {
          onData(null);
          return;
        }
        onData({ id: snap.id, ...(snap.data() as Omit<ReferralClaimRecord, 'id'>) });
      },
      (err) => handleFirestoreError(err, OperationType.GET, `referral_claims/${uid}`)
    );
  }
};
