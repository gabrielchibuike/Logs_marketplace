import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signIn, signUp } = useApp();
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('All fields are required.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = authTab === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (!res.success) {
        setAuthError(res.error || 'Authentication failed');
      } else {
        if (authTab === 'signup') {
          setAuthTab('login');
          setPassword('');
        } else {
          setAuthModalOpen(false);
          setEmail('');
          setPassword('');
          navigate('/');
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
            Authenticate to manage assets and access credentials.
          </p>
        </div>

        {/* Form Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded bg-brand-bg border border-brand-border">
          <button
            onClick={() => {
              setAuthTab('login');
              setAuthError('');
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
            }}
            className={`py-1.5 rounded text-xs font-bold transition cursor-pointer ${authTab === 'signup'
                ? 'bg-brand-card border border-brand-border/60 text-brand-navy shadow-sm'
                : 'text-brand-muted hover:text-brand-navy'
              }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="flex items-start gap-2 p-3 rounded bg-red-50 border border-red-200 text-brand-red text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
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

          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block">Password</label>
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
                {authTab === 'login' ? 'Authenticate' : 'Register Account'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
