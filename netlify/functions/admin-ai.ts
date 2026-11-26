import { verifyFirebaseBearer } from '../../server/authMiddleware';
import {
  getAdminAiStatus,
  testProviderConnectivity,
  updateAdminAiConfig,
  type AiProviderId
} from '../../server/aiRouter';

export async function handler(event: {
  httpMethod: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}) {
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  try {
    const { isFounder } = await verifyFirebaseBearer(authHeader.slice(7).trim());
    if (!isFounder) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAdminAiStatus())
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}') as Record<string, unknown>;
      if (event.path.endsWith('/test')) {
        const provider = body.provider as AiProviderId;
        const result = await testProviderConnectivity(provider);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        };
      }
      const updated = updateAdminAiConfig(body);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session token' }) };
  }
}
