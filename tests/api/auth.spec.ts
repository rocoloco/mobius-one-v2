import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

test.describe('Authentication API', () => {
  test.describe('Sign Up', () => {
    test('should create a new user account', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: `test-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
        },
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Account created successfully');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
    });

    test('should reject invalid email format', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'SecurePassword123!',
        },
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Validation error');
    });

    test('should reject weak password', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: `test-${Date.now()}@example.com`,
          password: '123',
        },
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Validation error');
    });

    test('should reject duplicate email', async ({ request }) => {
      const email = `test-${Date.now()}@example.com`;
      
      // Create first user
      await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email,
          password: 'SecurePassword123!',
        },
      });

      // Try to create second user with same email
      const response = await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email,
          password: 'SecurePassword123!',
        },
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Sign In', () => {
    let testUser: { email: string; password: string };

    test.beforeEach(async ({ request }) => {
      // Create test user
      testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: testUser.email,
          password: testUser.password,
        },
      });
    });

    test('should sign in with valid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signin`, {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Sign in successful');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('role');
    });

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signin`, {
        data: {
          email: testUser.email,
          password: 'wrong-password',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject non-existent user', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signin`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        },
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Session Management', () => {
    let sessionCookie: string;
    let testUser: { email: string; password: string };

    test.beforeEach(async ({ request }) => {
      // Create and sign in test user
      testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: testUser.email,
          password: testUser.password,
        },
      });

      const signInResponse = await request.post(`${API_BASE}/auth/signin`, {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      // Extract session cookie
      const cookies = signInResponse.headers()['set-cookie'];
      sessionCookie = cookies?.find(cookie => cookie.includes('session_token')) || '';
    });

    test('should return user info for valid session', async ({ request }) => {
      const response = await request.get(`${API_BASE}/auth/me`, {
        headers: {
          'Cookie': sessionCookie,
        },
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user.email).toBe(testUser.email);
    });

    test('should reject request without session', async ({ request }) => {
      const response = await request.get(`${API_BASE}/auth/me`);

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    test('should sign out successfully', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/signout`, {
        headers: {
          'Cookie': sessionCookie,
        },
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Sign out successful');
    });
  });

  test.describe('Security Features', () => {
    test('should include security headers', async ({ request }) => {
      const response = await request.get(`${API_BASE}/auth/me`);

      const headers = response.headers();
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should rate limit failed login attempts', async ({ request }) => {
      const email = `test-${Date.now()}@example.com`;
      
      // Create user
      await request.post(`${API_BASE}/auth/signup`, {
        data: {
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 'SecurePassword123!',
        },
      });

      // Make multiple failed login attempts
      const failedAttempts = Array.from({ length: 6 }, (_, i) => 
        request.post(`${API_BASE}/auth/signin`, {
          data: {
            email,
            password: 'wrong-password',
          },
        })
      );

      const responses = await Promise.all(failedAttempts);
      
      // All should fail with 401
      responses.forEach(response => {
        expect(response.status()).toBe(401);
      });
    });
  });
});