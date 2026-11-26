# MAMO MED AI — Global 3D Medical Intelligence Platform

**MAMO MED AI** (*Your Intelligent Medical Universe*), founded by **Ahmed Nawar Al-Mamo**, is a bilingual (English default with instant Arabic RTL switching), 3D-first medical intelligence ecosystem built for physicians, medical students, clinics, and patients. It unifies interactive Three.js medical geometry, clinical workspaces across nine specialized medical modules, Firebase-backed persistence and authentication, a dedicated Founder Super Admin console, and a dual-provider server-side AI router powered by **Grok by xAI** (clinical reasoning and text) and **Z.AI GLM Vision** (medical imaging and lab document analysis).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The choices confirmed during discovery establish the baseline architecture below. Before execution begins, Firebase will be provisioned via the interactive setup flow so Firestore, Google Sign-In, and project configuration are live before application code is wired.

- **Confirmed Decision 1 — Default Language & Bilingual RTL**: Launches in **English (LTR)** by default with an instant one-click header/workspace switch to **Arabic (RTL)**, updating layout direction, typography, and localized clinical labels without reloading.
- **Confirmed Decision 2 — Full 9-Module Scope & 3D Depth**: All **nine medical modules** (`AI Doctor`, `Diagnosis`, `Lab Analyzer`, `Radiology`, `Pharma`, `Med School`, `Clinic`, `Health`, `Clinical`) launch complete with bespoke interactive 3D Three.js medical scenes, distinct clinical layouts, and persistent Firestore data flows.
- **Confirmed Decision 3 — Authentication & Exclusive Founder Access**: Uses **Firebase Google Sign-In** alongside a scoped **Guest Mode** sandbox for exploration. Super Admin access is locked exclusively to **Ahmed Nawar Al-Mamo** via the server-verified `ADMIN_EMAIL` (`ghifaramamo@gmail.com`) and permanently bound to his verified Firebase `uid` upon first-run Founder Activation.
- **Confirmed Decision 4 — Hybrid Server Architecture**: Runs an integrated **Express + Vite server** for immediate full-stack operation in AI Studio while shipping matching **Netlify Functions** handlers and deployment configuration (`netlify.toml`, `.env.example`, `README.md`) for portable Netlify hosting.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a multi-layered medical intelligence platform featuring a skippable 3D cinematic intro, a 10-section interactive landing experience, an authenticated 3D clinical workspace spanning 9 medical specialties, and an isolated Founder Command Console for AI provider management, system health, and security auditing.
- **Target Audience**:
  - **Physicians & Clinicians**: Differential diagnosis support, clinical guidelines search, radiology report breakdown, and clinic patient/visit management.
  - **Medical Students**: Interactive MCQ assessments, clinical case simulations, flashcard spaced review, and specialty mastery tracking.
  - **Patients & Individuals**: Personal vital logs, symptom journals, medication schedules, and plain-language lab/imaging explanations with clear clinical disclaimers.
  - **Founder & Super Admin (Ahmed Nawar Al-Mamo)**: Centralized governance over Grok and Z.AI API credentials, model selection, usage telemetry, user roles, guest analytics, and immutable audit logs.
- **Key Value**: Replaces flat, fragmented medical forms with a calm, high-contrast spatial cockpit where 3D anatomical and molecular geometry coexists with disciplined clinical typography, real Firestore persistence, and multimodal AI routing that enforces clinical uncertainty and source transparency.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Cinematic Intro -> Landing Page**:
   - First-time visitors enter a 3-scene WebGL sequence: deep midnight space with drifting bioluminescent particles and a rotating 3D neural-helix/DNA composite sculpture -> metallic 3D reveal of **MAMO MED AI** and *"Your Intelligent Medical Universe"* -> smooth volumetric crossfade into the Hero section.
   - A subtle `"Skip Intro"` action is available immediately, and user preference (`skipIntro`) is respected on return visits.
2. **World-Class Landing Experience (10 Structured Sections)**:
   - Clean 3-zone top bar (`MAMO MED AI` wordmark · 5 concise nav links · `Get Started` primary CTA, plus language toggle inside the hero/workspace bar) leading into a full-viewport Hero with an interactive 3D anatomical/molecular centerpiece (`"The Future of Medical Intelligence"`, *"Explore MAMO MED"*, *"Get Started"*).
   - Scroll-revealed sections (with `prefers-reduced-motion` fallback): Platform Overview -> 3D Interactive Module Showcase -> Medical AI Intelligence -> Lab & Radiology Vision -> Med School Simulation -> Clinic Operations -> Medical Privacy & Security -> Verified Platform Scope & Architecture Metrics (zero fabricated vanity numbers) -> FAQ Accordion -> Institutional Footer.
3. **Authentication & Guest Mode**:
   - Frosted-glass authentication stage backed by subtle ambient 3D medical geometry. Supports **Google Sign-In**, **Guest Mode** (scoped read/explore sandbox with zero access to other users' clinical records or Admin routes), and **Founder Activation** status when signed in with the verified `ADMIN_EMAIL`.
4. **Internal 3D Workspace & Nine Medical Modules**:
   - Collapsible navigation rail (`260px` desktop, thumb-friendly bottom bar/drawer on mobile) + contextual breadcrumb header + 3D spatial welcome centerpiece + dedicated module views:
     - **AI Doctor**: Multi-turn clinical dialogue with animated thinking wave, structured clinical citations, uncertainty notices, image/lab attachment upload (routed to Z.AI Vision), conversation history in Firestore, and case summary sidebar.
     - **Diagnosis**: Structured intake for symptoms, vital signs, physical exam findings, and lab markers, generating interactive differential diagnosis cards showing reasoning, probability weights, and clinical uncertainty bounds.
     - **Lab Analyzer**: Drag-and-drop report/image intake (Z.AI Vision extraction + Grok clinical interpretation), reference-range deviation highlights, SVG trend charts, and persisted lab history.
     - **Radiology**: Modality-indexed scan/report archive (`CT`, `MRI`, `X-Ray`, `Ultrasound`), interactive image viewer with zoom/contrast controls, plain-language and clinician report breakdowns, and chronological filtering.
     - **Pharma**: Searchable medication registry, structured pharmacology cards, drug-drug interaction checker, contraindications, and therapeutic class filters.
     - **Med School**: Specialty-filtered interactive MCQ bank, branching clinical cases, flip-card study deck, and persisted student mastery progression.
     - **Clinic**: Patient directory, appointment calendar/queue, structured visit SOAP notes, generated medical reports, and Longitudinal EHR timeline.
     - **Health**: Personal vitals tracker (BP, HR, SpO2, glucose, weight), symptom log, active medication schedule, and personal health record export/delete controls.
     - **Clinical**: Evidence-based clinical search engine across protocols, differential trees, guidelines, and peer-reviewed reference summaries.
5. **Founder Super Admin Console (Exclusive to Ahmed Nawar Al-Mamo)**:
   - Accessible only when authenticated user matches verified `ADMIN_EMAIL` and registered `admins/{uid}` record: `Overview`, `User Management`, `Guest Analytics`, `Database Management`, `Medical Content`, `AI Usage`, `API Settings` (Grok & Z.AI keys/models/connectivity test/enable toggles/usage limits/error logs), `System Health`, `Security Logs`, `Notifications`, and `App Settings`, plus a dedicated **Founder Setup Verification** view confirming initial Super Admin binding.

### Visual Identity & Theme

- **Aesthetic Direction**: Calm, precision-calibrated biometric observatory—layered Midnight Navy depth with crisp hairline geometry, subtle volumetric lighting, and zero visual clutter.
- **Color Palette (60-30-10 Budget)**:
  - `--bg-canvas` (**60% Midnight Navy**): `#050B16` / `#081122` deep dark slate-navy atmospheric field.
  - `--surface-panel` (**30% Structural Glass & Titanium**): `#0D192E` / `rgba(15, 28, 52, 0.72)` with `1px` hairline borders (`rgba(148, 163, 184, 0.16)`), `--text-primary` **Pearl White** (`#F4F7FB`), and `--text-muted` **Titanium Silver** (`#94A3B8`).
  - `--accent-primary` (**10% Medical Blue & Electric Cyan**): Medical Blue (`#1D6FEB`) for primary CTAs and Electric Cyan (`#22D3EE`) strictly for active telemetry focus, chart highlights, and Subtle Violet (`#7C3AED` / `#A78BFA` at low opacity) reserved solely for multimodal AI vision states.
- **Typography & Hierarchy**:
  - *Display / Headings*: `Plus Jakarta Sans` (600–700 weight, `text-wrap: balance`, tight tracking; Arabic fallback `IBM Plex Sans Arabic`).
  - *Body Prose*: `DM Sans` (400–500 weight, `1.55` line-height, optical dark-mode spacing).
  - *Clinical Numerals & Telemetry*: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for vitals, lab ranges, timestamps, and AI token counters.
- **Anti-Slop Discipline**: Zero pill-badge clutter on cards or metadata (uses unboxed typographic separators `·`), zero thick left accent borders, zero decorative pulsing dots, zero fabricated KPI scores, and single-elevation surfaces.

### Interactive Feedback & Motion

- **Motion Design System**: Motion (`motion/react`) for page transitions, scroll reveals, and tactile 3D button press feedback (`<= 200ms` compositor-only `transform`/`opacity` curves); Three.js (`THREE.WebGLRenderer` with `RoomEnvironment` PMREM lighting, multi-part procedural `THREE.Group` models, exponential damping, `isSoftwareGl` pacing, and `webglcontextlost` recovery).
- **Accessibility**: Honors `prefers-reduced-motion` across both Motion transitions and 3D WebGL loops (pauses continuous orbit/particles and offers static high-clarity rendering).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Dual-Provider AI Router (Grok by xAI + Z.AI GLM Vision) Without OpenAI**:
  - *Chosen Approach*: Server-side `/api/ai/route` inspects request payload (text-only vs. image/multimodal attachment vs. explicit manual override), checks provider availability and model vision capability, routes text/clinical reasoning to **Grok** (`https://api.x.ai/v1/chat/completions`, configurable model e.g. `grok-4.7` / `grok-420-reasoning`) and image/scan/lab-photo analysis to **Z.AI GLM Vision** (`https://api.z.ai/api/paas/v4/chat/completions`, configurable model e.g. `glm-4.5v` / `glm-4.6v`), and returns a clear configuration prompt (never simulated medical outputs) if keys are not yet configured.
  - *Why*: Matches exact provider separation requested by the user, enforces capability verification before sending images, and keeps `GROK_API_KEY` and `ZAI_API_KEY` strictly on the server.
  - *Alternatives Considered*: Calling APIs from the browser (rejected—exposes secrets) or mocking AI responses when keys are absent (explicitly rejected per integrity requirements).
- **Decision 2 — Firebase Ecosystem (Auth + Firestore + Storage) Replacing Supabase**:
  - *Chosen Approach*: Full client-to-Firestore persistence via `firebase-applet-config.json` with hardened `firestore.rules`, Firebase Authentication (`GoogleAuthProvider` via `signInWithPopup` + scoped Guest exploration state), Firebase Storage integration when `storageBucket` is configured, and server-side Firebase ID token verification (`verifyIdToken`) on `/api/*` endpoints.
  - *Why*: Aligns with the user's explicit switch to Firebase and guarantees zero IAM blockers while protecting clinical data per-user and Super Admin operations on both Firestore and the Express/Netlify backend.
  - *Alternatives Considered*: `localStorage` persistence or server-side Admin SDK Firestore writes (rejected—breaks multi-device sync or requires external GCP billing IAM).
- **Decision 3 — Integrated Express Server + Exportable Netlify Functions**:
  - *Chosen Approach*: Run Express + Vite middleware on port 3000 for immediate live preview, while sharing the AI Router, token verifier, and Founder bootstrap handlers with clean Netlify Function wrappers and `netlify.toml`.
  - *Why*: Ensures the app works immediately in AI Studio and deploys seamlessly to Netlify without duplicating business logic.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        MAMO MED AI Client (React + TS)                       │
│  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────────────┐  │
│  │ Cinematic Intro│  │ 10-Section      │  │ Authenticated 3D App Shell    │  │
│  │ (Three.js DNA/ │─▶│ 3D Landing Page │─▶│ ┌───────────┐ ┌─────────────┐ │  │
│  │  Neural Scene) │  │ + Auth / Guest  │  │ │ 9 Medical │ │ Founder     │ │  │
│  └────────────────┘  └─────────────────┘  │ │ Modules   │ │ Super Admin │ │  │
│                                           │ └─────┬─────┘ └──────┬──────┘ │  │
│                                           └───────┼──────────────┼────────┘  │
└───────────────────────────────────────────────────┼──────────────┼───────────┘
                                                    │              │
         ┌──────────────────────────────────────────┘              │
         ▼                                                         ▼
┌─────────────────────────────────────────┐   ┌────────────────────────────────┐
│       Firebase Platform (Client SDK)    │   │  Backend Proxy (/api/* &       │
│  ┌─────────────┐  ┌──────────────────┐  │   │  Netlify Functions)            │
│  │ Firebase    │  │ Cloud Firestore  │  │   │  ┌──────────────────────────┐  │
│  │ Auth        │  │ (Hardened Rules) │  │   │  │ Firebase ID Token Guard  │  │
│  │ (Google)    │  │ + Storage        │  │   │  │ + ADMIN_EMAIL Verifier   │  │
│  └─────────────┘  └──────────────────┘  │   │  └────────────┬─────────────┘  │
└─────────────────────────────────────────┘   │               ▼                │
                                              │  ┌──────────────────────────┐  │
                                              │  │ Smart AI Router          │  │
                                              │  │ • Text ─▶ Grok (xAI)     │  │
                                              │  │ • Image ─▶ Z.AI Vision   │  │
                                              │  │ • Logs ─▶ Audit / Usage  │  │
                                              │  └──────────────────────────┘  │
                                              └────────────────────────────────┘
```

### Data Model & State (Firestore + `firebase-blueprint.json`)

- **Identity & Governance**: `users` (profile, display preferences, immutable `createdAt`), `roles` / `admins` (UID-bound Super Admin registry protected against client self-escalation), `app_settings` (platform & AI model config metadata—never raw secrets), `notifications`, `audit_logs` (immutable administrative and sensitive-access audit entries).
- **Clinical & Operational Collections** (strictly owner-scoped by `userId` / `ownerId` with PII isolation): `patient_records`, `patient_visits`, `medical_reports`, `lab_results`, `radiology_reports`, `conversations` (and message subcollections), `personal_health_logs`, `ai_usage`, and `guest_sessions` (anonymous/aggregate guest telemetry).
- **Curated Reference & Education Collections** (public/authenticated read, Founder-only write): `medications`, `drug_interactions`, `clinical_cases`, `medical_articles`.

### Security Safeguards

- **Server-Side Secret Isolation**: `GROK_API_KEY`, `ZAI_API_KEY`, and `ADMIN_EMAIL` reside exclusively in server-side `process.env` and are never exposed to browser bundles or Firestore documents; optional Founder key overrides entered in Admin AI Settings are validated and held securely in server memory/env configuration without ever echoing secrets back to the client.
- **Zero-Trust Auth & Role Binding**: Every `/api/*` endpoint verifies the caller's `Authorization: Bearer <Firebase ID Token>`, and Admin endpoints strictly verify `email_verified === true` and `email === process.env.ADMIN_EMAIL`. Firestore security rules enforce strict schema validation (`isValid[Entity]`), owner-only list queries (`resource.data.userId == request.auth.uid`), and block any non-founder writes to `admins`, `roles`, `audit_logs`, or `app_settings`.
- **Medical Safety Guardrails**: All AI Doctor, Diagnosis, Lab Analyzer, and Radiology outputs render explicit clinical decision-support disclaimers, uncertainty indicators, and reference provenance.

### Interactive Component & State Mapping

- **Cinematic Intro -> App Router**: Controls WebGL scene lifecycle, `"Skip Intro"` action, and persisted user preference (`skipIntro`) so return visits enter directly into the Landing Page or Workspace.
- **3D Scene Controller**: Encapsulates Three.js `WebGLRenderer`, `RoomEnvironment` PMREM reflections, multi-part procedural anatomical/DNA/organ/molecular `THREE.Group` meshes, pointer parallax/orbit damping, software-WebGL pacing (`isSoftwareGl`), and context-loss recovery without re-mounting on React state changes.
- **AI Router & Multimodal Dispatch**: Accepts prompt, clinical context, optional uploaded file/image (stored in Firebase Storage or base64-encoded for vision inspection), and optional manual model selector; validates vision capability before routing to Z.AI GLM Vision or Grok, records `ai_usage` metrics, and surfaces clear unconfigured-key setup notices if keys are absent.
- **Founder Bootstrap Flow**: Dedicated `/founder-setup` view detects `ghifaramamo@gmail.com` sign-in, calls server-side `/api/admin/bootstrap` to verify the Firebase ID token against `ADMIN_EMAIL`, writes the locked `admins/{uid}` document, logs the activation event in `audit_logs`, and displays Founder verification confirmation.
