import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AtSignIcon, ChevronLeftIcon, KeyRound, Grid2X2, Apple, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FloatingPaths, GoogleIcon } from './ui/auth-helpers';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'magic-link' | 'forgot-password' | 'reset-password';
type UserType = 'student' | 'creator' | 'professional';

export default function Auth() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [userType, setUserType] = useState<UserType>('professional');
  const { signIn, signUp } = useAuth();

  // Check for password reset token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setAuthMode('reset-password');
    }
  }, []);

  // Force dark mode on Auth page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const isSignUp = authMode === 'signup';
  const isMagicLink = authMode === 'magic-link';
  const isForgotPassword = authMode === 'forgot-password';
  const isResetPassword = authMode === 'reset-password';

  // Handle regular sign in/signup with password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isSignUp) {
      const { data, error: authError } = await signUp(email, password);
      
      if (authError) {
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });
          
          if (resendError) {
            setError('Account exists. Please sign in or check your email for verification link.');
          } else {
            setMessage('A new verification link has been sent to your email!');
          }
        } else {
          setError(authError.message);
        }
      } else if (data?.user) {
        localStorage.setItem('productivity-hub-style', userType);
        
        // Create user profile
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          user_type: userType,
        });
        
        setMessage('Check your email to confirm your account, then return here to sign in.');
      }
    } else {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Email not confirmed. Check your inbox or click "Resend confirmation email".');
        } else {
          setError(authError.message);
        }
      }
    }

    setLoading(false);
  };

  // Handle magic link request
  const handleMagicLink = async (e: React.FormEvent) => {
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
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the magic link to sign in!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password - send reset email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the password reset link!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset (when user clicks link from email)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! You can now sign in with your new password.');
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => {
          setAuthMode('signin');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend confirmation email
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

  const resetToSignIn = () => {
    setAuthMode('signin');
    setError('');
    setMessage('');
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return 'Create Account';
      case 'magic-link': return 'Magic Link Sign In';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      default: return 'Sign In or Join Now!';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup': return 'Create your productivity hub account';
      case 'magic-link': return 'We\'ll send you a magic link to sign in';
      case 'forgot-password': return 'Enter your email to receive a password reset link';
      case 'reset-password': return 'Enter your new password below';
      default: return 'Sign in to your productivity hub account';
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
            {!isMagicLink && !isForgotPassword && !isResetPassword && (
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
                    <Apple className="size-5 me-2" />
                    Continue with Apple
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  >
                    <Github className="size-5 me-2" />
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

            {/* Magic Link Form */}
            {isMagicLink && (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Enter your email address to receive a magic link
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
                  {loading ? 'Sending...' : 'Send Magic Link'}
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

            {/* Forgot Password Form */}
            {isForgotPassword && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Enter your email and we'll send you a link to reset your password
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
                  <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
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

            {/* Reset Password Form (after clicking email link) */}
            {isResetPassword && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="New password"
                    className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pl-10"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                </div>

                <div className="relative">
                  <Input
                    placeholder="Confirm new password"
                    className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pl-10"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium h-12 rounded-lg"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}

            {/* Regular Sign In / Sign Up Form */}
            {!isMagicLink && !isForgotPassword && !isResetPassword && (
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

                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {isSignUp && (
                  <div className="space-y-2">
                     <p className="text-xs text-gray-500">I am a...</p>
                     <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setUserType('student')}
                          className={`p-3 border rounded-lg text-xs font-medium transition-all ${
                            userType === 'student'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'hover:bg-white/5 border-gray-700 text-gray-300'
                          }`}
                        >
                           🎓 Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType('professional')}
                          className={`p-3 border rounded-lg text-xs font-medium transition-all ${
                            userType === 'professional'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'hover:bg-white/5 border-gray-700 text-gray-300'
                          }`}
                        >
                           💼 Professional
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType('creator')}
                          className={`p-3 border rounded-lg text-xs font-medium transition-all ${
                            userType === 'creator'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'hover:bg-white/5 border-gray-700 text-gray-300'
                          }`}
                        >
                           🎨 Creator
                        </button>
                     </div>
                     {userType === 'professional' && (
                        <p className="text-xs text-blue-400 bg-blue-500/10 p-2 rounded-lg">
                           ✨ Professionals get access to Workspace & Team management features!
                        </p>
                     )}
                  </div>
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

                {/* Forgot Password & Magic Link - Only show on Sign In */}
                {!isSignUp && (
                  <div className="flex flex-col gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setError('');
                        setMessage('');
                      }}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('magic-link');
                        setError('');
                        setMessage('');
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Sign in with magic link instead
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
