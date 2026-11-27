import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { readDatabase } from './store.ts';

// Clé de signature en mémoire par défaut si SESSION_SECRET n'est pas configuré
const SESSION_SECRET = process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
  ? process.env.SESSION_SECRET
  : crypto.randomBytes(32).toString('hex');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 heures

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derivedBuf.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, keyBuf);
}

export function verifyEnvPasscode(candidate: string, envPasscode: string): boolean {
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(envPasscode).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function getAuthStatus(): Promise<{
  configured: boolean;
  envOverride: boolean;
  needsSetup: boolean;
}> {
  const envPasscode = process.env.ADMIN_PASSCODE?.trim();
  if (envPasscode) {
    return { configured: true, envOverride: true, needsSetup: false };
  }
  const db = await readDatabase();
  const hasStoredHash = Boolean(db.adminPasswordHash);
  return {
    configured: hasStoredHash,
    envOverride: false,
    needsSetup: !hasStoredHash,
  };
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
      nonce: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    if (parsed.role !== 'admin') return false;
    if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentification administrateur requise.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Session expirée ou invalide.' });
    return;
  }
  next();
}
