import { verifyFirebaseBearer } from '../../server/authMiddleware';
import { routeAiRequest } from '../../server/aiRouter';

export async function handler(event: {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  try {
    const { decoded } = await verifyFirebaseBearer(authHeader.slice(7).trim());
    const body = JSON.parse(event.body || '{}') as {
      module?: string;
      prompt?: string;
      systemPrompt?: string;
      imageDataUrl?: string;
      preferredProvider?: 'auto' | 'grok' | 'zai';
      overrideModel?: string;
      language?: 'en' | 'ar';
    };

    if (!body.prompt || typeof body.prompt !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt text is required' }) };
    }

    const result = await routeAiRequest({
      userId: decoded.uid,
      userEmail: decoded.email || 'authenticated-user',
      module: body.module || 'general',
      prompt: body.prompt.trim(),
      systemPrompt: body.systemPrompt,
      imageDataUrl: body.imageDataUrl,
      preferredProvider: body.preferredProvider,
      overrideModel: body.overrideModel,
      language: body.language === 'ar' ? 'ar' : 'en'
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session token' }) };
  }
}
