import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from '../storage';
import { hashPassword, verifyPassword, generateToken, calculateRiskScore, generateDeviceFingerprint } from '../auth';

const router = Router();

// Google OAuth Configuration (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await storage.getUserByUsername(profile.id);

      if (existingUser) {
        // Update existing user with fresh Google data
        const updatedUser = await storage.updateUser(existingUser.id, {
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          lastActivity: new Date()
        });
        return done(null, { user: updatedUser, isNewUser: false });
      }

      // Create new user from Google profile
      const newUser = await storage.createUser({
        username: profile.id,
        name: profile.displayName || profile.id,
        email: profile.emails?.[0]?.value || `${profile.id}@gmail.com`,
        passwordHash: '', // OAuth users don't need password
        role: 'user',
        companyName: profile.emails?.[0]?.value?.split('@')[1] || 'Unknown',
        permissions: ['read', 'write'],
        roles: ['user']
      });

      return done(null, { user: newUser, isNewUser: true });
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Passport session serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, name, companyName } = req.body;

    // Enhanced input validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: 'Username must be at least 3 characters long',
        code: 'VALIDATION_ERROR'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).*$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must contain at least one letter and one number',
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

    // Generate initials from name or username
    const displayName = name || username;
    const initials = displayName.length >= 2 ? displayName.substring(0, 2).toUpperCase() : displayName.toUpperCase().padEnd(2, 'X');

    // Create user
    const user = await storage.createUser({
      username,
      name: name || username,
      email: email || `${username}@example.com`,
      password: passwordHash, // Use password field to match database schema
      passwordHash: passwordHash, // Also include passwordHash for compatibility
      initials,
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
      isNewUser: true, // CRITICAL: This is what was missing!
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

    // Verify password
    let isPasswordValid = false;
    if (user.password) {
      // Check if it's a hashed password (starts with $2b$)
      if (user.password.startsWith('$2b$')) {
        isPasswordValid = await verifyPassword(password, user.password);
      } else {
        // Fallback to plain text comparison for demo accounts
        isPasswordValid = password === user.password;
      }
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

    // Check if user has completed onboarding
    // In a real implementation, you'd check the database for this
    // For now, we'll check if they have system connections set up
    let hasCompletedOnboarding = false;
    try {
      const connections = await storage.getSystemConnectionsByUserId(user.id);
      hasCompletedOnboarding = connections && connections.length > 0;
    } catch (error) {
      // If we can't check, assume they need onboarding
      hasCompletedOnboarding = false;
    }

    res.json({
      message: 'Login successful',
      isNewUser: !hasCompletedOnboarding, // If no system connections, treat as new user needing onboarding
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

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      error: 'Google OAuth is not configured',
      code: 'OAUTH_NOT_CONFIGURED',
      message: 'Administrator needs to configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: any, res) => {
    try {
      const { user, isNewUser } = req.user;

      // Calculate risk score for OAuth login
      const riskScore = calculateRiskScore(req, user);

      // Create audit log for OAuth login
      await storage.createAuditLog({
        userId: user.id,
        action: 'oauth_login_success',
        resource: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        riskScore,
        success: true,
        metadata: {
          provider: 'google',
          username: user.username,
          email: user.email,
          deviceFingerprint: generateDeviceFingerprint(req)
        }
      });

      // Generate JWT tokens for OAuth user
      const tokenData = generateToken(user);

      // Update user activity
      await storage.updateUser(user.id, {
        lastActivity: new Date(),
        lastKnownIp: req.ip,
        riskScore
      });

      // Create session for OAuth user
      await storage.createSession({
        sessionId: `oauth_${Date.now()}`,
        userId: user.id,
        deviceFingerprint: generateDeviceFingerprint(req),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        riskScore,
        mfaVerified: true, // OAuth is considered MFA
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Redirect to appropriate page based on user status
      const destination = isNewUser ? '/onboarding' : '/collections';
      const redirectUrl = `${destination}?token=${tokenData.accessToken}&refresh=${tokenData.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  }
);

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    req.logout(() => {
      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;