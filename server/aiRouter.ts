export type AiProviderId = 'grok' | 'zai';
export type RoutingMode = 'auto' | 'grok' | 'zai';

export interface AiRuntimeConfig {
  grokEnabled: boolean;
  grokModel: string;
  zaiEnabled: boolean;
  zaiModel: string;
  dailyRequestLimit: number;
  // Optional runtime overrides set by Founder Admin (never returned in plaintext)
  grokApiKeyOverride?: string;
  zaiApiKeyOverride?: string;
}

export interface AiRequestLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  module: string;
  provider: AiProviderId;
  model: string;
  hasImage: boolean;
  status: 'success' | 'unconfigured' | 'error';
  latencyMs: number;
  errorMessage?: string;
}

const VISION_CAPABLE_MODELS = new Set([
  'glm-4.5v',
  'glm-4.6v',
  'glm-4.6v-flash',
  'glm-4v',
  'glm-4v-plus',
  'glm-5v-turbo',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'grok-4.7',
  'grok-4.6',
  'grok-4.5',
  'grok-2-vision-1212'
]);

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const XAI_API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const ZAI_API_ENDPOINT = 'https://api.z.ai/api/paas/v4/chat/completions';

export const GROK_AVAILABLE_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'grok-4.7',
  'grok-4.6',
  'grok-420-reasoning'
];

export const ZAI_AVAILABLE_MODELS = [
  'glm-4.5v',
  'glm-4.6v',
  'glm-4.6v-flash',
  'glm-5v-turbo',
  'glm-4.5-flash'
];

function normalizePrimaryModel(model: string): string {
  const trimmed = model.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'gpt-oss-120b' || lower === 'gpt oss 120' || lower === 'gpt-oss-120') {
    return 'openai/gpt-oss-120b';
  }
  if (lower === 'gpt-oss-20b' || lower === 'gpt oss 20' || lower === 'gpt-oss-20') {
    return 'openai/gpt-oss-20b';
  }
  return trimmed || 'openai/gpt-oss-120b';
}

const runtimeState: AiRuntimeConfig = {
  grokEnabled: true,
  grokModel: normalizePrimaryModel(
    process.env.GROQ_DEFAULT_MODEL || process.env.GROK_DEFAULT_MODEL || 'openai/gpt-oss-120b'
  ),
  zaiEnabled: true,
  zaiModel: process.env.ZAI_DEFAULT_MODEL || 'glm-4.5v',
  dailyRequestLimit: 500
};

const requestLogs: AiRequestLogEntry[] = [];
const dailyUsageByUser = new Map<string, { date: string; count: number }>();

function getEffectiveGrokKey(): string {
  return (
    runtimeState.grokApiKeyOverride ||
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    ''
  ).trim();
}

function getEffectiveZaiKey(): string {
  return (runtimeState.zaiApiKeyOverride || process.env.ZAI_API_KEY || '').trim();
}

function resolvePrimaryEndpoint(apiKey: string, model: string): string {
  const key = apiKey.trim();
  const normalizedModel = model.trim().toLowerCase();
  if (key.startsWith('gsk_')) return GROQ_API_ENDPOINT;
  if (key.startsWith('xai-')) return XAI_API_ENDPOINT;
  if (normalizedModel.startsWith('grok-') || normalizedModel === 'latest') {
    return XAI_API_ENDPOINT;
  }
  return GROQ_API_ENDPOINT;
}

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export function getAdminAiStatus() {
  const grokKey = getEffectiveGrokKey();
  const zaiKey = getEffectiveZaiKey();
  return {
    grok: {
      enabled: runtimeState.grokEnabled,
      configured: Boolean(grokKey),
      maskedKey: maskKey(grokKey),
      model: runtimeState.grokModel,
      availableModels: GROK_AVAILABLE_MODELS,
      endpoint: resolvePrimaryEndpoint(grokKey, runtimeState.grokModel)
    },
    zai: {
      enabled: runtimeState.zaiEnabled,
      configured: Boolean(zaiKey),
      maskedKey: maskKey(zaiKey),
      model: runtimeState.zaiModel,
      availableModels: ZAI_AVAILABLE_MODELS,
      endpoint: ZAI_API_ENDPOINT
    },
    dailyRequestLimit: runtimeState.dailyRequestLimit,
    recentLogs: requestLogs.slice(0, 50)
  };
}

export function getPublicAiCapabilities() {
  return {
    grokConfigured: Boolean(getEffectiveGrokKey()) && runtimeState.grokEnabled,
    zaiConfigured: Boolean(getEffectiveZaiKey()) && runtimeState.zaiEnabled,
    grokModel: runtimeState.grokModel,
    zaiModel: runtimeState.zaiModel,
    grokModels: GROK_AVAILABLE_MODELS,
    zaiModels: ZAI_AVAILABLE_MODELS
  };
}

export function updateAdminAiConfig(patch: {
  grokEnabled?: boolean;
  grokModel?: string;
  zaiEnabled?: boolean;
  zaiModel?: string;
  dailyRequestLimit?: number;
  grokApiKey?: string;
  zaiApiKey?: string;
}) {
  if (typeof patch.grokEnabled === 'boolean') runtimeState.grokEnabled = patch.grokEnabled;
  if (typeof patch.grokModel === 'string' && patch.grokModel.trim()) {
    runtimeState.grokModel = normalizePrimaryModel(patch.grokModel).slice(0, 120);
  }
  if (typeof patch.zaiEnabled === 'boolean') runtimeState.zaiEnabled = patch.zaiEnabled;
  if (typeof patch.zaiModel === 'string' && patch.zaiModel.trim()) {
    runtimeState.zaiModel = patch.zaiModel.trim().slice(0, 120);
  }
  if (typeof patch.dailyRequestLimit === 'number' && patch.dailyRequestLimit >= 1 && patch.dailyRequestLimit <= 100000) {
    runtimeState.dailyRequestLimit = Math.floor(patch.dailyRequestLimit);
  }
  if (typeof patch.grokApiKey === 'string' && patch.grokApiKey.trim()) {
    runtimeState.grokApiKeyOverride = patch.grokApiKey.trim();
  }
  if (typeof patch.zaiApiKey === 'string' && patch.zaiApiKey.trim()) {
    runtimeState.zaiApiKeyOverride = patch.zaiApiKey.trim();
  }
  return getAdminAiStatus();
}

export function isModelVisionCapable(model: string): boolean {
  const normalized = model.trim().toLowerCase();
  if (VISION_CAPABLE_MODELS.has(normalized)) return true;
  return (
    normalized.includes('vision') ||
    /^glm-[45].*v/.test(normalized) ||
    normalized.includes('llama-4-scout') ||
    normalized.includes('llama-4-maverick')
  );
}

function recordLog(entry: AiRequestLogEntry) {
  requestLogs.unshift(entry);
  if (requestLogs.length > 100) {
    requestLogs.length = 100;
  }
}

function checkRateLimit(userId: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const current = dailyUsageByUser.get(userId);
  if (!current || current.date !== today) {
    dailyUsageByUser.set(userId, { date: today, count: 1 });
    return true;
  }
  if (current.count >= runtimeState.dailyRequestLimit) {
    return false;
  }
  current.count += 1;
  return true;
}

export interface RouteAiInput {
  userId: string;
  userEmail: string;
  module: string;
  prompt: string;
  systemPrompt?: string;
  imageDataUrl?: string;
  preferredProvider?: RoutingMode;
  overrideModel?: string;
  language?: 'en' | 'ar';
}

export interface RouteAiOutput {
  status: 'success' | 'unconfigured' | 'error';
  provider: AiProviderId;
  model: string;
  content?: string;
  visionExtraction?: string;
  latencyMs: number;
  message?: string;
  missingKeyFor?: AiProviderId;
}

const MEDICAL_SYSTEM_GUARDRAIL_EN =
  'You are MAMO MED AI, a clinical decision-support intelligence system. Provide structured, evidence-oriented medical analysis, cite established clinical guidelines where relevant, explicitly state uncertainty and differential possibilities, and always note that outputs support—and never replace—a licensed physician.';

const MEDICAL_SYSTEM_GUARDRAIL_AR =
  'أنت MAMO MED AI، نظام ذكاء طبي لدعم القرار السريري. قدّم تحليلاً طبياً منظماً ومبنياً على الأدلة العلمية، مع ذكر المراجع والإرشادات السريرية المعتمدة، وتوضيح درجة عدم اليقين والاحتمالات التفريقية، والتأكيد دائماً على أن الذكاء الاصطناعي أداة مساعدة لا تغني عن الطبيب المختص.';

async function callOpenAiCompatibleChat(params: {
  endpoint: string;
  apiKey: string;
  model: string;
  messages: unknown[];
}): Promise<string> {
  const response = await fetch(params.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: 0.25
    })
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Provider HTTP ${response.status}: ${errBody.slice(0, 260)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Provider returned an empty completion payload.');
  }
  return content;
}

export async function routeAiRequest(input: RouteAiInput): Promise<RouteAiOutput> {
  const startedAt = Date.now();
  const hasImage = Boolean(input.imageDataUrl && input.imageDataUrl.startsWith('data:image/'));
  const langGuard =
    input.language === 'ar' ? MEDICAL_SYSTEM_GUARDRAIL_AR : MEDICAL_SYSTEM_GUARDRAIL_EN;
  const fullSystemPrompt = input.systemPrompt
    ? `${langGuard}\n\n${input.systemPrompt}`
    : langGuard;

  if (!checkRateLimit(input.userId)) {
    return {
      status: 'error',
      provider: hasImage ? 'zai' : 'grok',
      model: hasImage ? runtimeState.zaiModel : runtimeState.grokModel,
      latencyMs: Date.now() - startedAt,
      message: 'Daily AI request quota reached for your account.'
    };
  }

  // Determine target provider
  let targetProvider: AiProviderId = hasImage ? 'zai' : 'grok';
  if (input.preferredProvider === 'grok' || input.preferredProvider === 'zai') {
    targetProvider = input.preferredProvider;
  }

  let selectedModel =
    targetProvider === 'zai'
      ? input.overrideModel?.trim() || runtimeState.zaiModel
      : normalizePrimaryModel(input.overrideModel?.trim() || runtimeState.grokModel);

  // Verify vision support when image is attached
  if (hasImage && !isModelVisionCapable(selectedModel)) {
    targetProvider = 'zai';
    selectedModel = runtimeState.zaiModel;
  }

  // Combined text + image in auto mode: extract via Z.AI GLM Vision, optionally synthesize with Grok if available
  if (hasImage && (!input.preferredProvider || input.preferredProvider === 'auto')) {
    const zaiKey = getEffectiveZaiKey();
    if (!runtimeState.zaiEnabled || !zaiKey) {
      const latencyMs = Date.now() - startedAt;
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: runtimeState.zaiModel,
        hasImage: true,
        status: 'unconfigured',
        latencyMs,
        errorMessage: 'ZAI_API_KEY not configured on server'
      });
      return {
        status: 'unconfigured',
        provider: 'zai',
        model: runtimeState.zaiModel,
        missingKeyFor: 'zai',
        latencyMs,
        message:
          'Z.AI GLM Vision API key (ZAI_API_KEY) is not configured yet. Add it in Founder Admin -> API Settings or server environment variables to analyze medical images.'
      };
    }

    try {
      const visionText = await callOpenAiCompatibleChat({
        endpoint: ZAI_API_ENDPOINT,
        apiKey: zaiKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: input.prompt },
              { type: 'image_url', image_url: { url: input.imageDataUrl } }
            ]
          }
        ]
      });

      // If prompt also requests deep clinical synthesis and Groq/Grok is configured, enrich with it
      const grokKey = getEffectiveGrokKey();
      if (grokKey && runtimeState.grokEnabled && input.prompt.trim().length > 40) {
        try {
          const grokSynthesis = await callOpenAiCompatibleChat({
            endpoint: resolvePrimaryEndpoint(grokKey, runtimeState.grokModel),
            apiKey: grokKey,
            model: runtimeState.grokModel,
            messages: [
              { role: 'system', content: fullSystemPrompt },
              {
                role: 'user',
                content: `Visual findings extracted by Z.AI Vision (${selectedModel}):\n${visionText}\n\nClinician/User Request:\n${input.prompt}\n\nSynthesize a structured clinical interpretation with uncertainty notes and next-step considerations.`
              }
            ]
          });
          const latencyMs = Date.now() - startedAt;
          recordLog({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            userEmail: input.userEmail,
            module: input.module,
            provider: 'zai',
            model: `${selectedModel} + ${runtimeState.grokModel}`,
            hasImage: true,
            status: 'success',
            latencyMs
          });
          return {
            status: 'success',
            provider: 'zai',
            model: `${selectedModel} -> ${runtimeState.grokModel}`,
            visionExtraction: visionText,
            content: grokSynthesis,
            latencyMs
          };
        } catch {
          // Return pure Z.AI vision analysis cleanly if secondary synthesis fails
        }
      }

      const latencyMs = Date.now() - startedAt;
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: selectedModel,
        hasImage: true,
        status: 'success',
        latencyMs
      });
      return {
        status: 'success',
        provider: 'zai',
        model: selectedModel,
        content: visionText,
        latencyMs
      };
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const errMsg = error instanceof Error ? error.message : 'Z.AI request failed';
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: selectedModel,
        hasImage: true,
        status: 'error',
        latencyMs,
        errorMessage: errMsg
      });
      return {
        status: 'error',
        provider: 'zai',
        model: selectedModel,
        latencyMs,
        message: errMsg
      };
    }
  }

  // Single-provider execution (Grok or Z.AI)
  if (targetProvider === 'zai') {
    const zaiKey = getEffectiveZaiKey();
    if (!runtimeState.zaiEnabled || !zaiKey) {
      const latencyMs = Date.now() - startedAt;
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: selectedModel,
        hasImage,
        status: 'unconfigured',
        latencyMs,
        errorMessage: 'ZAI_API_KEY not configured'
      });
      return {
        status: 'unconfigured',
        provider: 'zai',
        model: selectedModel,
        missingKeyFor: 'zai',
        latencyMs,
        message:
          'Z.AI GLM Vision API key (ZAI_API_KEY) is not configured yet. Add it in Founder Admin -> API Settings or environment secrets.'
      };
    }

    try {
      const userContent = hasImage
        ? [
            { type: 'text', text: input.prompt },
            { type: 'image_url', image_url: { url: input.imageDataUrl } }
          ]
        : input.prompt;
      const content = await callOpenAiCompatibleChat({
        endpoint: ZAI_API_ENDPOINT,
        apiKey: zaiKey,
        model: selectedModel,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: userContent }
        ]
      });
      const latencyMs = Date.now() - startedAt;
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: selectedModel,
        hasImage,
        status: 'success',
        latencyMs
      });
      return { status: 'success', provider: 'zai', model: selectedModel, content, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const errMsg = error instanceof Error ? error.message : 'Z.AI request failed';
      recordLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        userEmail: input.userEmail,
        module: input.module,
        provider: 'zai',
        model: selectedModel,
        hasImage,
        status: 'error',
        latencyMs,
        errorMessage: errMsg
      });
      return { status: 'error', provider: 'zai', model: selectedModel, latencyMs, message: errMsg };
    }
  }

  // Groq Cloud / xAI Grok
  const grokKey = getEffectiveGrokKey();
  if (!runtimeState.grokEnabled || !grokKey) {
    const latencyMs = Date.now() - startedAt;
    recordLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      userEmail: input.userEmail,
      module: input.module,
      provider: 'grok',
      model: selectedModel,
      hasImage,
      status: 'unconfigured',
      latencyMs,
      errorMessage: 'GROQ_API_KEY / GROK_API_KEY not configured'
    });
    return {
      status: 'unconfigured',
      provider: 'grok',
      model: selectedModel,
      missingKeyFor: 'grok',
      latencyMs,
      message:
        'Groq / xAI API key (GROQ_API_KEY or GROK_API_KEY) is not configured yet. Configure it in Founder Admin -> API Settings or server environment variables.'
    };
  }

  try {
    const userContent = hasImage
      ? [
          { type: 'text', text: input.prompt },
          { type: 'image_url', image_url: { url: input.imageDataUrl } }
        ]
      : input.prompt;

    const content = await callOpenAiCompatibleChat({
      endpoint: resolvePrimaryEndpoint(grokKey, selectedModel),
      apiKey: grokKey,
      model: selectedModel,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: userContent }
      ]
    });
    const latencyMs = Date.now() - startedAt;
    recordLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      userEmail: input.userEmail,
      module: input.module,
      provider: 'grok',
      model: selectedModel,
      hasImage,
      status: 'success',
      latencyMs
    });
    return { status: 'success', provider: 'grok', model: selectedModel, content, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const errMsg = error instanceof Error ? error.message : 'Groq / Grok request failed';
    recordLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      userEmail: input.userEmail,
      module: input.module,
      provider: 'grok',
      model: selectedModel,
      hasImage,
      status: 'error',
      latencyMs,
      errorMessage: errMsg
    });
    return { status: 'error', provider: 'grok', model: selectedModel, latencyMs, message: errMsg };
  }
}

export async function testProviderConnectivity(provider: AiProviderId): Promise<{
  ok: boolean;
  provider: AiProviderId;
  model: string;
  latencyMs: number;
  message: string;
}> {
  const startedAt = Date.now();
  if (provider === 'grok') {
    const key = getEffectiveGrokKey();
    if (!key) {
      return {
        ok: false,
        provider: 'grok',
        model: runtimeState.grokModel,
        latencyMs: Date.now() - startedAt,
        message: 'GROQ_API_KEY / GROK_API_KEY is not configured.'
      };
    }
    try {
      const reply = await callOpenAiCompatibleChat({
        endpoint: resolvePrimaryEndpoint(key, runtimeState.grokModel),
        apiKey: key,
        model: runtimeState.grokModel,
        messages: [{ role: 'user', content: 'Respond with OK only.' }]
      });
      return {
        ok: true,
        provider: 'grok',
        model: runtimeState.grokModel,
        latencyMs: Date.now() - startedAt,
        message: `Connected (${reply.slice(0, 32)})`
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'grok',
        model: runtimeState.grokModel,
        latencyMs: Date.now() - startedAt,
        message: err instanceof Error ? err.message : 'Connection failed'
      };
    }
  } else {
    const key = getEffectiveZaiKey();
    if (!key) {
      return {
        ok: false,
        provider: 'zai',
        model: runtimeState.zaiModel,
        latencyMs: Date.now() - startedAt,
        message: 'ZAI_API_KEY is not configured.'
      };
    }
    try {
      const reply = await callOpenAiCompatibleChat({
        endpoint: ZAI_API_ENDPOINT,
        apiKey: key,
        model: runtimeState.zaiModel,
        messages: [{ role: 'user', content: 'Respond with OK only.' }]
      });
      return {
        ok: true,
        provider: 'zai',
        model: runtimeState.zaiModel,
        latencyMs: Date.now() - startedAt,
        message: `Connected (${reply.slice(0, 32)})`
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'zai',
        model: runtimeState.zaiModel,
        latencyMs: Date.now() - startedAt,
        message: err instanceof Error ? err.message : 'Connection failed'
      };
    }
  }
}
