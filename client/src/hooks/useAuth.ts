import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  companyName: string;
  permissions: string[];
  roles: string[];
  riskScore: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = window.location.search.includes('demo=true');
    
    if (isDemoMode) {
      // Provide mock user for demo mode
      setAuthState({
        user: {
          id: 999,
          username: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          companyName: 'Demo Company',
          permissions: ['read', 'write'],
          roles: ['user'],
          riskScore: 0
        },
        isLoading: false,
        isAuthenticated: true,
        error: null
      });
      return;
    }
    
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
        return;
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Session expired'
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Authentication failed'
      });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
        
        return { success: true, user: data.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed'
        }));
        
        return { 
          success: false, 
          error: data.error, 
          code: data.code,
          remainingTime: data.remainingTime,
          riskScore: data.riskScore
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error'
      }));
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (username: string, password: string, email: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
        
        return { success: true, user: data.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Registration failed'
        }));
        
        return { success: false, error: data.error, code: data.code };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error'
      }));
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    // Check if we're in demo mode
    const isDemoMode = window.location.search.includes('demo=true');
    
    if (isDemoMode) {
      // In demo mode, just redirect to landing page
      window.location.href = '/';
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.setItem('logout', 'true');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
      // Force navigation to landing page
      window.location.href = '/';
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refreshAuth: checkAuthStatus
  };
}