import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'mobius-zero-trust-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: any): { accessToken: string; refreshToken: string; expiresIn: number } {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes
  };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  try {
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
}

export function calculateRiskScore(req: Request, user: any): number {
  let score = 0;
  
  // Check for new IP address
  if (user.lastKnownIp && req.ip !== user.lastKnownIp) {
    score += 30;
  }
  
  // Check for failed login attempts
  if (user.failedLoginAttempts > 0) {
    score += user.failedLoginAttempts * 10;
  }
  
  // Check for unusual user agent
  const userAgent = req.get('User-Agent') || '';
  if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

export function generateDeviceFingerprint(req: Request): string {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}:${req.ip}`;
  return Buffer.from(fingerprint).toString('base64');
}