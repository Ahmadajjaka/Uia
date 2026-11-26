import express from 'express';
import {
  requireAuth,
  requireFounderAdmin,
  getFounderEmail,
  type AuthenticatedRequest
} from './authMiddleware.js';
import {
  getAdminAiStatus,
  getPublicAiCapabilities,
  routeAiRequest,
  testProviderConnectivity,
  updateAdminAiConfig,
  type AiProviderId
} from './aiRouter.js';
import { searchMedicalReferences } from './medicalReference.js';
import {
  handleMedicalImageProxy,
  handleMedicalVideoProxy,
  searchRealEchoVideos,
  searchRealMedicalImages
} from './medicalImages.js';

export function createApiApp(): express.Express {
  const app = express();

  app.use(express.json({ limit: '12mb' }));

  // Health & public capabilities (never leaks secrets)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'MAMO MED AI',
      timestamp: new Date().toISOString(),
      capabilities: getPublicAiCapabilities()
    });
  });

  // Live in-app Medical Reference Search (Europe PMC / PubMed, NIH ICD-10, Encyclopedia)
  app.get('/api/medical-ref/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const lang = req.query.lang === 'ar' ? 'ar' : 'en';

    if (!q || q.length < 2) {
      res.status(400).json({ error: 'Search query (q) must be at least 2 characters.' });
      return;
    }

    const result = await searchMedicalReferences(q, lang);
    res.json(result);
  });

  // Real medical image search (Wikimedia Commons Medical Archive) & SSRF-safe raster proxy
  app.get('/api/medical-images/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 12;

    if (!q || q.length < 2) {
      res.status(400).json({ error: 'Search query (q) must be at least 2 characters.' });
      return;
    }

    const items = await searchRealMedicalImages(q, Number.isFinite(limit) ? limit : 12);
    res.json({ query: q, count: items.length, items });
  });

  app.get('/api/medical-images/proxy', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).json({ error: 'Missing url parameter.' });
      return;
    }
    await handleMedicalImageProxy(rawUrl, res);
  });

  // Real clinical echocardiography video search & byte-range proxy
  app.get('/api/medical-videos/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 8;
    if (!q || q.length < 2) {
      res.status(400).json({ error: 'Search query (q) must be at least 2 characters.' });
      return;
    }
    const items = await searchRealEchoVideos(q, Number.isFinite(limit) ? limit : 8);
    res.json({ query: q, count: items.length, items });
  });

  app.get('/api/medical-videos/proxy', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).json({ error: 'Missing url parameter.' });
      return;
    }
    await handleMedicalVideoProxy(rawUrl, req.headers.range, res);
  });

  // Verify session & Founder identity against server-side ADMIN_EMAIL
  app.get('/api/auth/session', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({
      uid: req.user?.uid,
      email: req.user?.email || null,
      emailVerified: req.user?.email_verified === true,
      isFounder: req.isFounder === true,
      founderName: req.isFounder ? 'Ahmed Nawar Al-Mamo' : null
    });
  });

  // Protected Founder bootstrap verification endpoint
  app.post('/api/admin/bootstrap', requireFounderAdmin, (req: AuthenticatedRequest, res) => {
    res.json({
      verified: true,
      uid: req.user?.uid,
      email: req.user?.email,
      founderName: 'Ahmed Nawar Al-Mamo',
      role: 'super_admin',
      configuredAdminEmail: getFounderEmail(),
      activatedAt: new Date().toISOString()
    });
  });

  // Smart AI Router endpoint (requires authenticated Firebase user)
  app.post('/api/ai/route', requireAuth, async (req: AuthenticatedRequest, res) => {
    const body = req.body as {
      module?: string;
      prompt?: string;
      systemPrompt?: string;
      imageDataUrl?: string;
      preferredProvider?: 'auto' | 'grok' | 'zai';
      overrideModel?: string;
      language?: 'en' | 'ar';
    };

    if (!body || typeof body.prompt !== 'string' || !body.prompt.trim()) {
      res.status(400).json({ error: 'Prompt text is required.' });
      return;
    }

    if (body.prompt.length > 20000) {
      res.status(400).json({ error: 'Prompt exceeds 20,000 character maximum.' });
      return;
    }

    const result = await routeAiRequest({
      userId: req.user!.uid,
      userEmail: req.user?.email || 'authenticated-user',
      module: typeof body.module === 'string' ? body.module.slice(0, 64) : 'general',
      prompt: body.prompt.trim(),
      systemPrompt: typeof body.systemPrompt === 'string' ? body.systemPrompt.slice(0, 4000) : undefined,
      imageDataUrl: typeof body.imageDataUrl === 'string' ? body.imageDataUrl : undefined,
      preferredProvider: body.preferredProvider,
      overrideModel: body.overrideModel,
      language: body.language === 'ar' ? 'ar' : 'en'
    });

    res.json(result);
  });

  // Founder-only AI configuration & monitoring endpoints
  app.get('/api/admin/ai/settings', requireFounderAdmin, (_req, res) => {
    res.json(getAdminAiStatus());
  });

  app.post('/api/admin/ai/settings', requireFounderAdmin, (req, res) => {
    const body = req.body as {
      grokEnabled?: boolean;
      grokModel?: string;
      zaiEnabled?: boolean;
      zaiModel?: string;
      dailyRequestLimit?: number;
      grokApiKey?: string;
      zaiApiKey?: string;
    };
    const updated = updateAdminAiConfig(body || {});
    res.json(updated);
  });

  app.post('/api/admin/ai/test', requireFounderAdmin, async (req, res) => {
    const provider = (req.body as { provider?: AiProviderId })?.provider;
    if (provider !== 'grok' && provider !== 'zai') {
      res.status(400).json({ error: 'Provider must be "grok" or "zai".' });
      return;
    }
    const result = await testProviderConnectivity(provider);
    res.json(result);
  });

  app.get('/api/admin/system-health', requireFounderAdmin, (_req, res) => {
    res.json({
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
      capabilities: getPublicAiCapabilities(),
      timestamp: new Date().toISOString()
    });
  });

  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  return app;
}
