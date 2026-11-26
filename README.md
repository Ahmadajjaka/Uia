# MAMO MED AI — Global 3D Medical Intelligence Platform

**Your Intelligent Medical Universe**
Founder & CEO: **Ahmed Nawar Al-Mamo**

## Architecture
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Three.js (procedural WebGL medical geometry with `RoomEnvironment` PBR lighting & software-WebGL protection), GSAP.
- **Backend**: Integrated Express + Vite server (`server.ts`) for local/container execution plus export-ready Netlify Functions (`netlify/functions/*` & `netlify.toml`).
- **Database, Auth & Storage**: Firebase Authentication (Google Sign-In + scoped Guest Mode), Cloud Firestore with Eight-Pillars security rules (`firestore.rules`), and Firebase Storage.
- **Dual-Provider AI Router**:
  - **Grok by xAI** (`https://api.x.ai/v1/chat/completions`) for clinical reasoning, medical chat, differential diagnosis, and report synthesis.
  - **Z.AI GLM Vision** (`https://api.z.ai/api/paas/v4/chat/completions`) for medical imaging, radiology visual extraction, and laboratory report parsing.
  - Zero OpenAI models or mock AI outputs.

## Environment Variables
Set these in your server environment (never commit real secrets):
- `ADMIN_EMAIL` — Verified Founder Google email (`ghifaramamo@gmail.com`)
- `GROK_API_KEY` — xAI Grok API secret key
- `ZAI_API_KEY` — Z.AI GLM Vision API secret key
- `GROK_DEFAULT_MODEL` — e.g. `grok-4.7`
- `ZAI_DEFAULT_MODEL` — e.g. `glm-4.5v`
- `APP_URL` — Hosted application URL

## Development & Build
```bash
npm install
npm run dev
npm run build
```
