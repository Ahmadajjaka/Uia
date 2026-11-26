import fs from 'fs';
import path from 'path';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

interface FirebaseConfigFile {
  projectId: string;
}

function loadProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  const candidates = [
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '../firebase-applet-config.json')
  ];
  for (const configPath of candidates) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw) as FirebaseConfigFile;
      if (parsed.projectId) return parsed.projectId;
    } catch {
      // try next candidate path
    }
  }
  return 'ai-studio-applet-webapp-37be9';
}

export function getFirebaseAdminAuth() {
  const projectId = loadProjectId();
  const app = getApps().length
    ? getApp()
    : initializeApp(projectId ? { projectId } : undefined);
  return getAuth(app);
}

export function getFounderEmail(): string {
  return (process.env.ADMIN_EMAIL || 'ghifaramamo@gmail.com').trim().toLowerCase();
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
  isFounder?: boolean;
}

export async function verifyFirebaseBearer(token: string): Promise<{
  decoded: DecodedIdToken;
  isFounder: boolean;
}> {
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifyIdToken(token);
  const founderEmail = getFounderEmail();
  const tokenEmail = (decoded.email || '').trim().toLowerCase();
  const isFounder = decoded.email_verified === true && tokenEmail === founderEmail;
  return { decoded, isFounder };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in with Google.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return;
  }

  try {
    const { decoded, isFounder } = await verifyFirebaseBearer(token);
    req.user = decoded;
    req.isFounder = isFounder;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

export async function requireFounderAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (!req.isFounder) {
      res.status(403).json({
        error: 'Forbidden: Super Admin privileges belong exclusively to the verified Founder account.'
      });
      return;
    }
    next();
  });
}
