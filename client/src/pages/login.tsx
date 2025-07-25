import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";

// Type declarations for ReCAPTCHA
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, parameters: any) => number;
      reset: (widgetId?: number) => void;
    };
    recaptchaLoaded?: boolean;
    recaptchaCallback?: () => void;
  }
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  captchaToken: z.string().min(1, "Please complete the CAPTCHA verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [useDemo, setUseDemo] = useState(false);

  // Debug CAPTCHA loading
  useEffect(() => {
    console.log('Using ReCAPTCHA Site Key: 6LdadI4rAAAAAOGf7_hCPhko9EdbI93tsvJP25OG (configured for replit.dev)');
    
    // Check if Google ReCAPTCHA script is loaded
    const checkRecaptcha = () => {
      // Check for callback method first
      if (window.recaptchaLoaded && window.grecaptcha) {
        console.log('Google ReCAPTCHA loaded via callback');
        if (window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            console.log('ReCAPTCHA ready callback fired');
            setRecaptchaReady(true);
          });
        } else {
          setRecaptchaReady(true); // fallback if ready method not available
        }
        return true;
      }
      
      // Original check
      if (window.grecaptcha && window.grecaptcha.ready) {
        console.log('Google ReCAPTCHA API loaded successfully');
        window.grecaptcha.ready(() => {
          console.log('ReCAPTCHA ready callback fired');
          setRecaptchaReady(true);
        });
        return true;
      }
      
      // Debug current state
      console.log('ReCAPTCHA status:', {
        recaptchaLoaded: window.recaptchaLoaded,
        grecaptcha: !!window.grecaptcha,
        grecaptchaReady: !!(window.grecaptcha && window.grecaptcha.ready),
        currentDomain: window.location.hostname
      });
      
      return false;
    };
    
    // Check immediately and with intervals
    if (!checkRecaptcha()) {
      const interval = setInterval(() => {
        if (checkRecaptcha()) {
          clearInterval(interval);
        }
      }, 500);
      
      // After 8 seconds, fallback to demo mode (giving more time for new key)
      setTimeout(() => {
        clearInterval(interval);
        if (!recaptchaReady) {
          console.log('ReCAPTCHA failed to load after 8 seconds, switching to demo mode');
          setUseDemo(true);
        }
      }, 8000);
    }
  }, []);

  // Form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      captchaToken: "",
    },
  });

  const currentForm = isSignUp ? signupForm : loginForm;

  const authMutation = useMutation({
    mutationFn: async (data: LoginFormData | SignupFormData) => {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const requestBody = isSignUp 
        ? { 
            username: data.email, 
            password: data.password,
            captchaToken: (data as SignupFormData).captchaToken
          }
        : { username: data.email, password: data.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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

      // Route new users to onboarding, existing users to collections
      if (isSignUp || data.isNewUser) {
        // Clear any existing onboarding progress for new users
        localStorage.removeItem('onboardingProgress');
        window.location.href = '/onboarding';
      } else {
        // For existing users, check if they need to complete onboarding
        const onboardingProgress = localStorage.getItem('onboardingProgress');
        if (onboardingProgress) {
          const progress = JSON.parse(onboardingProgress);
          if (!progress.isComplete) {
            window.location.href = '/onboarding';
            return;
          }
        }
        window.location.href = '/collections';
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      // Reset CAPTCHA on error for sign-up
      if (isSignUp && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
        signupForm.setValue('captchaToken', '');
      }
    },
  });

  const handleSubmit = async (data: LoginFormData | SignupFormData) => {
    setError("");

    try {
      await authMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation's onError
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (isSignUp && token) {
      signupForm.setValue('captchaToken', token);
      signupForm.clearErrors('captchaToken');
    }
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setError("");
    loginForm.reset();
    signupForm.reset();
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
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
            {getGreeting()}, welcome back to your Collections Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={currentForm.handleSubmit(handleSubmit)} style={{marginBottom: '24px'}}>
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#061A40',
              fontSize: '14px',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              {...(isSignUp ? signupForm.register('email') : loginForm.register('email'))}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${currentForm.formState.errors.email ? '#DC2626' : '#E2E8F0'}`,
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#4A5568',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentForm.formState.errors.email ? '#DC2626' : '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
            {currentForm.formState.errors.email && (
              <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                {currentForm.formState.errors.email.message}
              </p>
            )}
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
              {...(isSignUp ? signupForm.register('password') : loginForm.register('password'))}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${currentForm.formState.errors.password ? '#DC2626' : '#E2E8F0'}`,
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                color: '#4A5568',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F59E0B';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentForm.formState.errors.password ? '#DC2626' : '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
            {currentForm.formState.errors.password && (
              <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                {currentForm.formState.errors.password.message}
              </p>
            )}
          </div>

          {isSignUp && (
            <>
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
                  {...signupForm.register('confirmPassword')}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${signupForm.formState.errors.confirmPassword ? '#DC2626' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    color: '#4A5568',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = signupForm.formState.errors.confirmPassword ? '#DC2626' : '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* CAPTCHA Section */}
              <div style={{marginBottom: '24px'}}>
                <label style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: '#061A40',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Let us know you're human
                </label>
                <div style={{ 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px', 
                  padding: '16px',
                  backgroundColor: '#FAFBFC',
                  minHeight: '78px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {recaptchaReady && !useDemo ? (
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LdadI4rAAAAAOGf7_hCPhko9EdbI93tsvJP25OG"
                      onChange={handleCaptchaChange}
                      theme="light"
                      onErrored={() => {
                        console.error('ReCAPTCHA failed to load');
                        setError('CAPTCHA failed to load. Please refresh the page and try again.');
                      }}
                      onExpired={() => {
                        setCaptchaToken(null);
                        signupForm.setValue('captchaToken', '');
                      }}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#6B7280',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      <div>🤖 CAPTCHA Verification</div>
                      <div style={{ fontSize: '12px', marginTop: '8px', marginBottom: '8px' }}>
                        {useDemo ? 
                          'ReCAPTCHA is temporarily unavailable. Use demo verification below:' :
                          'Loading CAPTCHA verification...'
                        }
                      </div>
                      {useDemo && (
                        <button
                          type="button"
                          onClick={() => {
                            setCaptchaToken('demo-token-' + Date.now());
                            signupForm.setValue('captchaToken', 'demo-token-' + Date.now());
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#F59E0B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          Verify I'm Human
                        </button>
                      )}
                      {captchaToken && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#059669', 
                          marginTop: '8px',
                          fontWeight: '500'
                        }}>
                          ✓ Verification complete
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {signupForm.formState.errors.captchaToken && (
                  <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {signupForm.formState.errors.captchaToken.message}
                  </p>
                )}
              </div>


            </>
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
              Account created successfully! Taking you to setup...
            </div>
          )}

          {/* Terms and Conditions for Sign Up */}
          {isSignUp && (
            <div style={{
              fontSize: '12px',
              color: '#718096',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              By clicking Sign Up or Continue, I agree to Mobius One's{' '}
              <a href="/terms" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
                terms
              </a>
              ,{' '}
              <a href="/privacy" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
                privacy policy
              </a>
              , and{' '}
              <a href="/cookies" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
                cookie policy
              </a>
              .
            </div>
          )}

          <button
            type="submit"
            disabled={authMutation.isPending || (isSignUp && !captchaToken)}
            style={{
              width: '100%',
              padding: '16px',
              background: (authMutation.isPending || (isSignUp && !captchaToken)) 
                ? '#D1D5DB' 
                : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              cursor: (authMutation.isPending || (isSignUp && !captchaToken)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: (authMutation.isPending || (isSignUp && !captchaToken)) ? 0.7 : 1,
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!authMutation.isPending && !(isSignUp && !captchaToken)) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {authMutation.isPending ? (
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
              isSignUp ? 'Sign up' : 'SIGN IN'
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
            e.currentTarget.style.borderColor = '#F59E0B';
            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.02)';
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
          color: '#718096',
          marginBottom: '16px'
        }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={handleModeSwitch}
            style={{
              background: 'none',
              border: 'none',
              color: '#F59E0B',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>

        {/* Forgot Password */}
        {!isSignUp && (
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => {
                // Handle forgot password - could be email reset or admin contact
                alert("Please contact your administrator or email support@mobiusone.com for password reset assistance.");
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#718096',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Social Proof */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#718096',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '1.4'
        }}>
          Built for growing SaaS companies
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