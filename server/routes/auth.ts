import { Router } from 'express';
import { storage } from '../storage';
import { hashPassword, verifyPassword, generateToken, calculateRiskScore, generateDeviceFingerprint } from '../auth';

const router = Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name, companyName } = req.body;

    // Validate input
    if (!username || !password || username.length < 3 || password.length < 8) {
      return res.status(400).json({
        error: 'Username must be at least 3 characters and password at least 8 characters',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        error: 'Username already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await storage.createUser({
      username,
      name: name || username,
      email: email || `${username}@example.com`,
      passwordHash,
      role: 'user',
      companyName: companyName || 'Unknown Company',
      permissions: ['read', 'write'],
      roles: ['user']
    });

    // Generate tokens
    const tokenData = generateToken(user);

    // Create audit log
    await storage.createAuditLog({
      userId: user.id,
      action: 'user_registration',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      riskScore: 0,
      success: true,
      metadata: {
        username: user.username,
        email: user.email || ''
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role
      },
      ...tokenData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.accountLocked && user.lockoutUntil && new Date() < user.lockoutUntil) {
      const remainingTime = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
      return res.status(423).json({
        error: 'Account temporarily locked',
        code: 'ACCOUNT_LOCKED',
        remainingTime
      });
    }

    // Verify password - check both new and old password fields
    let isPasswordValid = false;
    if (user.passwordHash) {
      isPasswordValid = await verifyPassword(password, user.passwordHash);
    } else if (user.password) {
      // Fallback to plain text comparison for demo
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      // Increment failed attempts
      await storage.incrementFailedLoginAttempts(user.id);
      
      // Lock account after 5 failed attempts
      if ((user.failedLoginAttempts || 0) >= 4) {
        await storage.lockAccount(user.id, 30); // 30 minute lockout
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(req, user);

    // Reset failed attempts on successful login
    await storage.resetFailedLoginAttempts(user.id);

    // Update last activity
    await storage.updateUser(user.id, {
      lastActivity: new Date(),
      lastKnownIp: req.ip,
      riskScore
    });

    // Generate tokens
    const tokenData = generateToken(user);

    // Create audit log
    await storage.createAuditLog({
      userId: user.id,
      action: 'login_success',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      riskScore,
      success: true,
      metadata: {
        username: user.username,
        deviceFingerprint: generateDeviceFingerprint(req)
      }
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
        permissions: user.permissions,
        roles: user.roles
      },
      ...tokenData,
      riskScore
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;