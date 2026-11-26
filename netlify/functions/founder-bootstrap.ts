import { getFounderEmail, verifyFirebaseBearer } from '../../server/authMiddleware';

export async function handler(event: {
  httpMethod: string;
  headers: Record<string, string | undefined>;
}) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  try {
    const { decoded, isFounder } = await verifyFirebaseBearer(authHeader.slice(7).trim());
    if (!isFounder) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Founder verification failed' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified: true,
        uid: decoded.uid,
        email: decoded.email,
        founderName: 'Ahmed Nawar Al-Mamo',
        role: 'super_admin',
        configuredAdminEmail: getFounderEmail(),
        activatedAt: new Date().toISOString()
      })
    };
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session token' }) };
  }
}
