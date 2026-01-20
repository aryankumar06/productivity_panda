import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, KeyRound, AtSignIcon, AppleIcon, GithubIcon, Grid2X2, ChevronLeftIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FloatingPaths, GoogleIcon } from './ui/auth-helpers';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'otp-request' | 'otp-verify';

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const { signIn, signUp } = useAuth();

  // Force dark mode on Auth page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const isSignUp = authMode === 'signup';
  const isOtpRequest = authMode === 'otp-request';
  const isOtpVerify = authMode === 'otp-verify';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const { error: authError } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (authError) {
      setError(authError.message);
    } else if (isSignUp) {
      setMessage('Check your email to confirm your account, then return here to sign in.');
    }

    setLoading(false);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the login link or enter the 6-digit code below.');
        setAuthMode('otp-verify');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code from your email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Enter your email to resend confirmation');
      return;
    }
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setError(error.message);
      else setMessage('If an account exists, we sent a new confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) setError(error.message);
      else setMessage('A new code has been sent to your email.');
    } finally {
      setResending(false);
    }
  };

  const resetToSignIn = () => {
    setAuthMode('signin');
    setOtpCode('');
    setError('');
    setMessage('');
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return 'Create Account';
      case 'otp-request': return 'Forgot Password?';
      case 'otp-verify': return 'Enter Code';
      default: return 'Sign In or Join Now!';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup': return 'Create your asme account';
      case 'otp-request': return 'We\'ll send you a code to sign in';
      case 'otp-verify': return 'Enter the code sent to your email';
      default: return 'login or create your asme account.';
    }
  };

  return (
    <main className="relative min-h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-black">
      {/* Left Panel - Hidden on mobile, Animated paths */}
      <div className="bg-muted/60 relative hidden h-screen flex-col border-r border-gray-800 p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <Grid2X2 className="size-6 text-white" />
          <p className="text-xl font-semibold text-white">Productivity Hub</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl text-white">
              &ldquo;This platform has helped me to save time and organize my tasks better than ever before.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-gray-400">
              ~ Productivity Hub User
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="relative flex min-h-screen flex-col bg-black">
        {/* Home Button */}
        <div className="p-6">
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <a href="/">
              <ChevronLeftIcon className="size-4 me-2" />
              Home
            </a>
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden justify-center">
              <Grid2X2 className="size-6 text-white" />
              <p className="text-xl font-semibold text-white">Productivity Hub</p>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {getTitle()}
              </h1>
              <p className="text-gray-400 text-sm">
                {getSubtitle()}
              </p>
            </div>

            {/* Social Login Buttons - Only show on main sign in/signup */}
            {!isOtpRequest && !isOtpVerify && (
              <>
                <div className="space-y-3">
                  <Button 
                    type="button" 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  >
                    <GoogleIcon className="size-5 me-2" />
                    Continue with Google
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  >
                    <AppleIcon className="size-5 me-2" />
                    Continue with Apple
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  >
                    <GithubIcon className="size-5 me-2" />
                    Continue with GitHub
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-xs uppercase">OR</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
              </>
            )}

            {/* OTP Request Form */}
            {isOtpRequest && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Enter your email address to receive a sign-in code
                </p>
                <div className="relative">
                  <Input
                    placeholder="your.email@example.com"
                    className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pl-10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send Login Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetToSignIn}
                  className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeftIcon className="size-4 me-2" />
                  Back to Sign In
                </Button>
              </form>
            )}

            {/* OTP Verify Form */}
            {isOtpVerify && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full bg-gray-900 border-gray-700 text-white text-center text-2xl tracking-widest font-mono h-14"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 text-center">
                  Enter the code sent to <strong className="text-white">{email}</strong>
                </p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetToSignIn}
                  className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeftIcon className="size-4 me-2" />
                  Back to Sign In
                </Button>
              </form>
            )}

            {/* Regular Sign In / Sign Up Form */}
            {!isOtpRequest && !isOtpVerify && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Enter your email address to sign in or create an account
                </p>
                
                <div className="relative">
                  <Input
                    placeholder="your.email@example.com"
                    className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pl-10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                </div>

                {!isSignUp && (
                  <Input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Continue With Email')}
                </Button>

                {isSignUp && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    {resending ? 'Sending...' : 'Resend confirmation email'}
                  </Button>
                )}

                {/* Forgot Password Link - Only show on Sign In */}
                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('otp-request');
                        setError('');
                        setMessage('');
                      }}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Forgot password? Sign in with code
                    </button>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(isSignUp ? 'signin' : 'signup');
                      setError('');
                      setMessage('');
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>
            )}

            {/* Terms and Privacy */}
            <p className="text-gray-500 text-xs text-center">
              By clicking continue, you agree to our{' '}
              <a
                href="/terms-of-service"
                className="text-gray-400 hover:text-white underline underline-offset-2"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy-policy"
                className="text-gray-400 hover:text-white underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
