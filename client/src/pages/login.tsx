import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; isSignUp: boolean }) => {
      const endpoint = data.isSignUp ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Authentication failed');
      }

      return responseData;
    },
    onSuccess: (data) => {
      // Store authentication tokens
      if (data.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Clear logout flag and invalidate queries
      localStorage.removeItem('logout');
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Force a page reload to ensure app state is reset properly
      if (isSignUp) {
        setError(""); // Clear any previous errors
        setTimeout(() => {
          window.location.href = '/collections';
        }, 100);
      } else {
        window.location.href = '/collections';
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      await authMutation.mutateAsync({ username, password, isSignUp });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '16px',
        padding: '48px 32px',
        boxShadow: '0 4px 24px rgba(6, 26, 64, 0.08)',
        border: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <img 
              src="/logos/mobius-logo-light.png" 
              alt="Mobius Logo" 
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain'
              }}
            />
          </div>

          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '28px',
            color: '#061A40',
            margin: '0 0 8px 0'
          }}>
            MOBIUS ONE
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            fontSize: '16px',
            margin: 0
          }}>
            {getGreeting()}, welcome back to your AI Terminal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{marginBottom: '24px'}}>
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#061A40',
              fontSize: '14px',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #E2E8F0',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#4A5568',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#048BA8';
                e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#061A40',
              fontSize: '14px',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #E2E8F0',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#4A5568',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#048BA8';
                e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {isSignUp && (
            <div style={{marginBottom: '24px'}}>
              <label style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#061A40',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  color: '#4A5568',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              {error}
            </div>
          )}

          {authMutation.isSuccess && isSignUp && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#16A34A',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Account created successfully! Redirecting to dashboard...
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #048BA8 0%, #037A96 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1,
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 139, 168, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
            )}
          </button>
        </form>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          style={{
            width: '100%',
            padding: '16px',
            background: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#4A5568',
            marginBottom: '24px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#048BA8';
            e.currentTarget.style.backgroundColor = 'rgba(4, 139, 168, 0.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {/* Toggle Sign Up */}
        <div style={{
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#718096'
        }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#048BA8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}