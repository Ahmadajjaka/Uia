import { getPublicAiCapabilities } from '../../server/aiRouter';

export async function handler() {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ok',
      platform: 'MAMO MED AI',
      runtime: 'netlify-functions',
      timestamp: new Date().toISOString(),
      capabilities: getPublicAiCapabilities()
    })
  };
}
