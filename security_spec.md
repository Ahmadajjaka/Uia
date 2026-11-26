# MAMO MED AI — Payload-First Security Specification

## 1. Data Invariants
1. **Founder Super Admin Exclusivity**: Only an authenticated user with `request.auth.token.email_verified == true` and `request.auth.token.email == 'ghifaramamo@gmail.com'` (Ahmed Nawar Al-Mamo) can create `/admins/{uid}` (strictly for their own `uid`) or exercise Founder Super Admin privileges. `/admins/{uid}` is immutable and non-deletable from client SDKs.
2. **No Self-Privilege Escalation**: Users creating `/users/{userId}` cannot assign `role: 'super_admin'` unless verified as the Founder email. Users updating `/users/{userId}` can only mutate `displayName`, `preferredLanguage`, `skipIntro`, `specialty`, and `updatedAt`.
3. **Strict Owner Scoping & Zero Blanket List Queries**: Every clinical, diagnostic, lab, radiology, health, conversation, and clinic record requires `userId == request.auth.uid` on both creation and list queries.
4. **Master Gate Subcollections**: Conversation messages at `/conversations/{conversationId}/messages/{messageId}` validate parent ownership via `get()` on `/conversations/{conversationId}`.
5. **Append-Only Audit Trail**: `/audit_logs/{logId}` cannot be updated or deleted by any client, including admins.
6. **Zero Secret Exposure**: Raw `GROQ_API_KEY`, `GROK_API_KEY`, and `ZAI_API_KEY` are never stored in Firestore; `app_settings` stores only provider toggle flags and model IDs.
7. **Approval Gate & 100-Point Login Bonus Integrity**: Non-founder users registering in `/users/{userId}` must start with `approvalStatus: 'pending'`, `planTier: 'free'`, a valid `walletId`, and exact `points: 100` (`pointsBalance: 100`, `welcomeBonusClaimed: true`), or receive that +100 bonus exactly once via deterministic ledger document `point_transactions/welcome_{uid}`. Only Founder Admin can transition `approvalStatus`, upgrade `planTier`, or credit additional points.
8. **WalletPro Points & Top-Up Ledger**: Users may only submit pending `/topup_requests/{requestId}` documents, claim the single deterministic `welcome_{uid}` (+100) bonus, or decrement their own `points` / `pointsBalance` strictly downward alongside a negative `'debit'` `/point_transactions/{txId}`. Only Founder Admin can approve top-ups, issue `'credit'` / `'pro_grant'` ledger entries directly or by User ID (`uid` / `walletId`), or modify `/feature_pricing/{docId}`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation on Signup**: `POST /users/attacker` with `{ role: "super_admin" }` from non-founder email -> **PERMISSION_DENIED**.
2. **Self-Approval / Self-Pro Bypass**: `POST /users/attacker` or `PATCH /users/uid1` setting `approvalStatus: "approved"`, `planTier: "pro"`, or increasing `pointsBalance` from a non-founder user -> **PERMISSION_DENIED**.
3. **Admin Collection Poisoning**: `POST /admins/attacker` from `attacker@example.com` -> **PERMISSION_DENIED**.
4. **Unverified Email Admin Spoof**: `POST /admins/uid` with `email: "ghifaramamo@gmail.com"` and `email_verified: false` -> **PERMISSION_DENIED**.
5. **Shadow Field Injection**: `POST /patient_records/p1` with extra ghost field `isVerified: true` -> **PERMISSION_DENIED**.
6. **Cross-Tenant PII Read**: User B executes `get /patient_records/userA_patient` or `get /access_requests/userA` -> **PERMISSION_DENIED**.
7. **Blanket List Scraping**: User B executes `list /lab_results` or `list /topup_requests` without `where("userId", "==", userB)` -> **PERMISSION_DENIED**.
8. **ID Poisoning (Denial of Wallet)**: `POST /health_logs/<200-char-invalid-id>` -> **PERMISSION_DENIED**.
9. **Parentless Orphan Visit**: `POST /patient_visits/v1` referencing non-existent `patientId: "fake"` -> **PERMISSION_DENIED**.
10. **Temporal Forgery**: `POST /conversations/c1` or `POST /topup_requests/t1` with backdated client `createdAt` instead of `request.time` -> **PERMISSION_DENIED**.
11. **Credit Ledger Forgery**: Non-founder creating `POST /point_transactions/tx1` with `txType: "credit"` or positive `pointsDelta` -> **PERMISSION_DENIED**.
12. **Feature Pricing Tampering**: Non-founder attempting `PATCH /feature_pricing/catalog` to set feature costs to `0` -> **PERMISSION_DENIED**.
