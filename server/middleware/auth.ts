import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import crypto from 'crypto';

// Zero Trust Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
const SALT_ROUNDS = 12;

// Session and security tracking
interface SecurityContext {
  userId: number;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  riskScore: number;
  lastActivity: Date;
  permissions: string[];
  mfaVerified: boolean;
  sessionExpiry: Date;
}

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent')}`;
  }
});

// Enhanced device fingerprinting
export function generateDeviceFingerprint(req: Request): string {
  const fingerprint = {
    userAgent: req.get('User-Agent') || '',
    acceptLanguage: req.get('Accept-Language') || '',
    acceptEncoding: req.get('Accept-Encoding') || '',
    connection: req.get('Connection') || '',
    ip: req.ip || req.connection.remoteAddress || '',
    xForwardedFor: req.get('X-Forwarded-For') || '',
    secChUa: req.get('Sec-Ch-Ua') || '',
    secChUaPlatform: req.get('Sec-Ch-Ua-Platform') || ''
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(fingerprint))
    .digest('hex');
}

// Risk scoring based on multiple factors
export function calculateRiskScore(req: Request, user: any): number {
  let riskScore = 0;
  
  // Time-based risk (unusual login hours)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) riskScore += 20;
  
  // Geographic risk (would need IP geolocation service)
  // For demo, we'll use a simple IP change detection
  const currentIp = req.ip;
  if (user.lastKnownIp && user.lastKnownIp !== currentIp) {
    riskScore += 30;
  }
  
  // Device fingerprint risk
  const deviceFingerprint = generateDeviceFingerprint(req);
  if (user.knownDevices && !user.knownDevices.includes(deviceFingerprint)) {
    riskScore += 25;
  }
  
  // Velocity risk (rapid successive requests)
  const now = new Date();
  const lastActivity = user.lastActivity ? new Date(user.lastActivity) : new Date(0);
  const timeDiff = now.getTime() - lastActivity.getTime();
  if (timeDiff < 1000) riskScore += 40; // Less than 1 second
  
  return Math.min(riskScore, 100); // Cap at 100
}

// Continuous authentication middleware
export async function continuousAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid authentication',
        code: 'INVALID_AUTH'
      });
    }
    
    // Calculate current risk score
    const riskScore = calculateRiskScore(req, user);
    
    // High risk requires additional verification
    if (riskScore > 60) {
      return res.status(403).json({
        error: 'High risk activity detected',
        code: 'HIGH_RISK',
        riskScore,
        requiresVerification: true
      });
    }
    
    // Update last activity and device fingerprint
    await storage.updateUser(user.id, {
      lastActivity: new Date(),
      lastKnownIp: req.ip,
      knownDevices: [
        ...(user.knownDevices || []),
        generateDeviceFingerprint(req)
      ].slice(-5) // Keep last 5 devices
    });
    
    // Add security context to request
    req.user = user;
    req.securityContext = {
      userId: user.id,
      sessionId: decoded.sessionId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      deviceFingerprint: generateDeviceFingerprint(req),
      riskScore,
      lastActivity: new Date(),
      permissions: user.permissions || ['read', 'write'],
      mfaVerified: decoded.mfaVerified || false,
      sessionExpiry: new Date(decoded.exp * 1000)
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Invalid authentication',
      code: 'INVALID_TOKEN'
    });
  }
}

// Permission-based authorization
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const context = req.securityContext;
    
    if (!context) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!context.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission,
        current: context.permissions
      });
    }
    
    next();
  };
}

// Data classification and access control
export function requireDataClassification(classification: 'public' | 'internal' | 'confidential' | 'restricted') {
  return (req: Request, res: Response, next: NextFunction) => {
    const context = req.securityContext;
    
    if (!context) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Define access matrix
    const accessMatrix: { [key: string]: string[] } = {
      public: ['read'],
      internal: ['read', 'write'],
      confidential: ['read', 'write', 'admin'],
      restricted: ['admin', 'owner']
    };
    
    const requiredPermissions = accessMatrix[classification];
    const hasAccess = requiredPermissions.some(perm => context.permissions.includes(perm));
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Insufficient data access level',
        code: 'INSUFFICIENT_DATA_ACCESS',
        required: classification,
        permissions: context.permissions
      });
    }
    
    next();
  };
}

// Session management
export function createSession(user: any, req: Request): { accessToken: string; refreshToken: string; expiresIn: number } {
  const sessionId = crypto.randomUUID();
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  const accessPayload = {
    userId: user.id,
    sessionId,
    deviceFingerprint,
    permissions: user.permissions || ['read', 'write'],
    mfaVerified: false,
    riskScore: calculateRiskScore(req, user)
  };
  
  const refreshPayload = {
    userId: user.id,
    sessionId,
    tokenType: 'refresh'
  };
  
  const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes
  };
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Zero Trust security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' wss: https:; " +
    "frame-ancestors 'none';"
  );
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  next();
}

// Input validation and sanitization
export function validateInput(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details: error
      });
    }
  };
}

// Audit logging
export function auditLog(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const context = req.securityContext;
    
    const auditEntry = {
      timestamp: new Date(),
      userId: context?.userId,
      sessionId: context?.sessionId,
      action,
      resource,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      riskScore: context?.riskScore,
      success: true // Will be updated in response
    };
    
    // Log audit entry (in production, this would go to a secure audit log)
    console.log('AUDIT:', auditEntry);
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log success/failure
    res.end = function(chunk?: any, encoding?: any) {
      auditEntry.success = res.statusCode < 400;
      console.log('AUDIT_COMPLETE:', auditEntry);
      
      // Call original end function
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

// Export types for TypeScript
declare global {
  namespace Express {
    interface Request {
      user?: any;
      securityContext?: SecurityContext;
    }
  }
}