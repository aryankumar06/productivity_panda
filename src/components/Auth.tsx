import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, KeyRound } from 'lucide-react';
import { ThemeToggle } from './ui/theme-toggle';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'otp-request' | 'otp-verify';

export default function Auth() {
  const { theme, toggleTheme } = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const { signIn, signUp } = useAuth();

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
      // If successful, the auth state will update automatically
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
      case 'signup': return 'Sign Up';
      case 'otp-request': return 'Forgot Password?';
      case 'otp-verify': return 'Enter Code';
      default: return 'Sign In';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 w-full max-w-md transition-all duration-300 ${isSignUp ? 'ring-1 ring-blue-100 dark:ring-neutral-700' : ''}`}>
        <div className="flex justify-end mb-2">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            {isOtpRequest || isOtpVerify ? (
              <Mail className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Productivity Hub</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isOtpRequest || isOtpVerify 
              ? "Sign in with a one-time code" 
              : "Organize tasks, track habits, manage your day"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Productivity hub a elitexsolution&apos;s product.</p>
        </div>

        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {getTitle()}
        </div>

        {/* OTP Request Form */}
        {isOtpRequest && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                We'll send you a 6-digit code to sign in without your password.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Login Code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetToSignIn}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium py-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* OTP Verify Form */}
        {isOtpVerify && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                6-Digit Code
              </label>
              <input
                id="otp-code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter the code sent to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Verify & Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="w-full border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>

            <button
              type="button"
              onClick={resetToSignIn}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium py-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Regular Sign In / Sign Up Form */}
        {!isOtpRequest && !isOtpVerify && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 transition-all duration-300">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </>
                )}
              </button>

              {isSignUp && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-700 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </form>

            {/* Forgot Password Link - Only show on Sign In */}
            {!isSignUp && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setAuthMode('otp-request');
                    setError('');
                    setMessage('');
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  Forgot password? Sign in with code
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setAuthMode(isSignUp ? 'signin' : 'signup');
                  setError('');
                  setMessage('');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
