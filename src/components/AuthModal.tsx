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
      setAuthError('All credentials fields are mandatory.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = authTab === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (!res.success) {
        setAuthError(res.error || 'Authentication action failed');
      } else {
        if (authTab === 'signup') {
          setAuthTab('login');
          setPassword('');
        } else {
          // Logged in successfully
          setAuthModalOpen(false);
          setEmail('');
          setPassword('');
          navigate('/');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected server error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={() => setAuthModalOpen(false)}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden glass relative p-8 space-y-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>

        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition duration-200 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Lock className="text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase font-mono mt-3">
            PAID<span className="text-cyan-400">LOG</span>STORE AUTH
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            Authenticate to buy digital assets and access credentials.
          </p>
        </div>

        {/* Form Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-900">
          <button
            onClick={() => {
              setAuthTab('login');
              setAuthError('');
            }}
            className={`py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${authTab === 'login'
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => {
              setAuthTab('signup');
              setAuthError('');
            }}
            className={`py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${authTab === 'signup'
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest block">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest block">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition disabled:opacity-50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {authLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-950/20 border-t-slate-950 animate-spin"></div>
            ) : (
              <>
                <User size={14} />
                {authTab === 'login' ? 'Authenticate' : 'Establish Profile'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
