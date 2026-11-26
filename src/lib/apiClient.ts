import type { User } from 'firebase/auth';
import { auth } from './firebase';

export interface AiRouteRequest {
  module: string;
  prompt: string;
  systemPrompt?: string;
  imageDataUrl?: string;
  preferredProvider?: 'auto' | 'grok' | 'zai';
  overrideModel?: string;
  language: 'en' | 'ar';
}

export interface AiRouteResponse {
  status: 'success' | 'unconfigured' | 'error';
  provider: 'grok' | 'zai';
  model: string;
  content?: string;
  visionExtraction?: string;
  latencyMs: number;
  message?: string;
  missingKeyFor?: 'grok' | 'zai';
}

export interface SessionVerificationResponse {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isFounder: boolean;
  founderName: string | null;
}

export interface PublicCapabilitiesResponse {
  status: string;
  platform: string;
  timestamp: string;
  capabilities: {
    grokConfigured: boolean;
    zaiConfigured: boolean;
    grokModel: string;
    zaiModel: string;
    grokModels: string[];
    zaiModels: string[];
  };
}

async function getBearerHeaders(
  user: User | null = auth.currentUser
): Promise<Record<string, string>> {
  if (!user) {
    throw new Error('Authentication required');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export interface MedicalLiteratureItem {
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authors: string;
  journal: string;
  pubYear: string;
  citedByCount: number;
  isOpenAccess: boolean;
  abstractText: string;
  source: 'Europe PMC / PubMed';
  externalUrl: string;
}

export interface MedicalConditionItem {
  id: string;
  name: string;
  consumerName: string;
  icd10Codes: string[];
  synonyms: string[];
  infoUrl: string;
  source: 'NIH NLM Clinical Tables';
}

export interface MedicalEncyclopediaItem {
  title: string;
  language: 'en' | 'ar';
  extract: string;
  pageUrl: string;
  source: 'Medical Encyclopedia';
}

export interface MedicalRefSearchResponse {
  query: string;
  language: 'en' | 'ar';
  fetchedAt: string;
  literature: MedicalLiteratureItem[];
  conditions: MedicalConditionItem[];
  encyclopedia: MedicalEncyclopediaItem[];
  sourcesStatus: {
    europePmc: 'ok' | 'unavailable';
    nihConditions: 'ok' | 'unavailable';
    encyclopedia: 'ok' | 'unavailable';
  };
}

export async function searchMedicalReferencesClient(
  query: string,
  language: 'en' | 'ar'
): Promise<MedicalRefSearchResponse> {
  const url = `/api/medical-ref/search?q=${encodeURIComponent(query.trim())}&lang=${language}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Medical reference lookup failed');
  }
  return data as MedicalRefSearchResponse;
}

export interface RealMedicalImageResult {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbUrl: string;
  sourceUrl: string;
  author: string;
  license: string;
  source: 'Wikimedia Commons Medical Archive';
}

export function getProxiedMedicalImageUrl(upstreamUrl: string): string {
  if (!upstreamUrl) return '';
  if (upstreamUrl.startsWith('/api/medical-images/proxy')) return upstreamUrl;
  return `/api/medical-images/proxy?url=${encodeURIComponent(upstreamUrl)}`;
}

export async function searchRealMedicalImagesClient(
  query: string,
  limit = 10
): Promise<RealMedicalImageResult[]> {
  const url = `/api/medical-images/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Real medical image lookup failed');
  }
  return (data.items || []) as RealMedicalImageResult[];
}

export interface RealMedicalVideoResult {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  sourceUrl: string;
  mimeType: string;
  source: 'Wikimedia Commons Clinical Video Archive';
}

export function getProxiedMedicalVideoUrl(upstreamUrl: string): string {
  if (!upstreamUrl) return '';
  if (upstreamUrl.startsWith('/api/medical-videos/proxy')) return upstreamUrl;
  return `/api/medical-videos/proxy?url=${encodeURIComponent(upstreamUrl)}`;
}

export async function searchRealEchoVideosClient(
  query: string,
  limit = 8
): Promise<RealMedicalVideoResult[]> {
  const url = `/api/medical-videos/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Real echo video lookup failed');
  }
  return (data.items || []) as RealMedicalVideoResult[];
}

export async function fetchPublicHealth(): Promise<PublicCapabilitiesResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Unable to reach server health endpoint');
  return (await res.json()) as PublicCapabilitiesResponse;
}

export async function verifyServerSession(
  user: User | null = auth.currentUser
): Promise<SessionVerificationResponse> {
  const headers = await getBearerHeaders(user);
  const res = await fetch('/api/auth/session', { headers });
  const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
  if (!res.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Session verification failed';
    throw new Error(`${message} (HTTP ${res.status})`);
  }
  return data as SessionVerificationResponse;
}

export async function callFounderBootstrap() {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/admin/bootstrap', { method: 'POST', headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Founder bootstrap denied');
  return data as {
    verified: boolean;
    uid: string;
    email: string;
    founderName: string;
    role: string;
    activatedAt: string;
  };
}

export async function callAiRouter(payload: AiRouteRequest): Promise<AiRouteResponse> {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/ai/route', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'AI router request failed');
  }
  return data as AiRouteResponse;
}

export async function fetchAdminAiSettings() {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/admin/ai/settings', { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to load admin AI settings');
  return data;
}

export async function saveAdminAiSettings(patch: Record<string, unknown>) {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/admin/ai/settings', {
    method: 'POST',
    headers,
    body: JSON.stringify(patch)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to save admin AI settings');
  return data;
}

export async function testAdminAiProvider(provider: 'grok' | 'zai') {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/admin/ai/test', {
    method: 'POST',
    headers,
    body: JSON.stringify({ provider })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Provider connectivity test failed');
  return data as {
    ok: boolean;
    provider: 'grok' | 'zai';
    model: string;
    latencyMs: number;
    message: string;
  };
}

export async function fetchSystemHealth() {
  const headers = await getBearerHeaders();
  const res = await fetch('/api/admin/system-health', { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to load system health');
  return data as {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryMb: number;
    adminEmailConfigured: boolean;
    timestamp: string;
  };
}
