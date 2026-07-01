import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Lock, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signIn, signUp, resetPasswordForEmail } = useApp();
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authTab === 'forgot_password') {
      if (!email) {
        setAuthError('Email address is required.');
        return;
      }
      setAuthLoading(true);
      try {
        const res = await resetPasswordForEmail(email);
        if (res.success) {
          setAuthSuccess('Password reset link sent! Check your inbox.');
          setEmail('');
        } else {
          setAuthError(res.error || 'Failed to request reset link.');
        }
      } catch (err: any) {
        setAuthError(err.message || 'An unexpected error occurred.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setAuthError('All fields are required.');
      return;
    }
    setAuthLoading(true);
    try {
      if (authTab === 'login') {
        const res = await signIn(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Authentication failed');
        } else {
          setAuthModalOpen(false);
          setEmail('');
          setPassword('');
          navigate('/');
        }
      } else {
        const res = await signUp(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Authentication failed');
        } else {
          if (res.emailConfirmationRequired) {
            setAuthSuccess('Registration successful! Please check your email inbox to confirm your account before signing in.');
          } else {
            setAuthSuccess('Registration successful! You can now log in.');
          }
          setAuthTab('login');
          setPassword('');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm"
      onClick={() => setAuthModalOpen(false)}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-sm rounded-md border border-brand-border bg-brand-card shadow-2xl overflow-hidden relative p-6 space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded border border-transparent hover:border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-bg transition duration-150 cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center">
            <Lock className="text-brand-navy w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-brand-navy uppercase">
            Paid<span className="text-brand-red">Log</span>Store Auth
          </h2>
          <p className="text-[11px] text-brand-muted">
            {authTab === 'forgot_password' 
              ? 'Request a secure verification code to reset your account password.' 
              : 'Authenticate to manage assets and access credentials.'}
          </p>
        </div>

        {/* Form Tabs */}
        {authTab !== 'forgot_password' ? (
          <div className="grid grid-cols-2 gap-1 p-1 rounded bg-brand-bg border border-brand-border">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-1.5 rounded text-xs font-bold transition cursor-pointer ${authTab === 'login'
                  ? 'bg-brand-card border border-brand-border/60 text-brand-navy shadow-sm'
                  : 'text-brand-muted hover:text-brand-navy'
                }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setAuthTab('signup');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-1.5 rounded text-xs font-bold transition cursor-pointer ${authTab === 'signup'
                  ? 'bg-brand-card border border-brand-border/60 text-brand-navy shadow-sm'
                  : 'text-brand-muted hover:text-brand-navy'
                }`}
            >
              REGISTER
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-navy transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </div>
        )}

        {/* Error Banner */}
        {authError && (
          <div className="flex items-start gap-2 p-3 rounded bg-red-50 border border-red-200 text-brand-red text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Success Banner */}
        {authSuccess && (
          <div className="flex items-start gap-2 p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono dark:bg-emerald-950/40 dark:text-emerald-400">
            <span>✓ {authSuccess}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                required
              />
            </div>
          </div>

          {authTab !== 'forgot_password' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block">Password</label>
                {authTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('forgot_password');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-[10px] text-brand-red hover:underline font-bold bg-transparent border-0 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {authLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <User size={14} />
                {authTab === 'login' 
                  ? 'Authenticate' 
                  : authTab === 'signup' 
                    ? 'Register Account' 
                    : 'Send Reset Link'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
