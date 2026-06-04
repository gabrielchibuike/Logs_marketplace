import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WalletModal } from '../components/WalletModal';
import { isSupabaseConfigured } from '../utils/supabase';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Sparkles, User, Lock, Mail, ShieldAlert } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { walletBalance, transactions, user, signIn, signUp } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // Authentication gateway state
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      } else if (authTab === 'signup') {
        alert('Account creation successful! You may now sign in.');
        setAuthTab('login');
        setPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected server error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  // Calculate statistics
  const deposits = transactions.filter((tx) => tx.type === 'deposit');
  const purchases = transactions.filter((tx) => tx.type === 'purchase');

  const totalDeposited = deposits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = purchases.reduce((sum, tx) => sum + tx.amount, 0);

  // If Supabase is connected but user is offline (not authenticated), show the auth gate!
  if (isSupabaseConfigured() && !user) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-950 p-8 shadow-2xl relative overflow-hidden glass text-left space-y-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Wallet className="text-cyan-400 w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase font-mono mt-3">
              PAID<span className="text-cyan-400">LOG</span>STORE AUTH
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Database authentication is active. Sign in to sync your balance.
            </p>
          </div>

          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-900">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
              }}
              className={`py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                authTab === 'login'
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
              className={`py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                authTab === 'signup'
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
  }

  return (
    <div className="w-full py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-950/45 p-6 rounded-2xl border border-slate-900 glass text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 uppercase font-mono flex items-center gap-2">
          <Wallet className="text-purple-400 w-6 h-6" />
          WALLET <span className="text-purple-400">CENTER</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your developer credentials. Top-up credit reserves, analyze account expenditures, and inspect your database transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Neon Card & Quick Deposit */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cyber Credit Card */}
          <div className="w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl glass-nav group">
            {/* Visual background details */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Top row */}
            <div className="flex items-start justify-between z-10">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">DEVELOPER CREDIT SYSTEM</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">PaidLogStore Console</p>
              </div>
              <Sparkles className="text-cyan-400 w-5 h-5 animate-pulse" />
            </div>

            {/* Card Chip & Details */}
            <div className="my-auto z-10 flex items-center gap-4">
              {/* Fake Microchip */}
              <div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex flex-col justify-between p-1.5 relative overflow-hidden">
                <div className="w-full h-[1px] bg-amber-500/30"></div>
                <div className="w-full h-[1px] bg-amber-500/30"></div>
                <div className="w-full h-[1px] bg-amber-500/30"></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">ACCOUNT OWNER</span>
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide font-mono truncate max-w-[150px] block">
                  {user ? user.email?.split('@')[0].toUpperCase() : 'GABBY DEVELOPER'}
                </span>
              </div>
            </div>

            {/* Bottom Row: Balance */}
            <div className="flex items-end justify-between z-10 mt-auto">
              <div>
                <span className="text-[9px] text-slate-500 font-mono block">AVAILABLE FUNDS</span>
                <span className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                  ${walletBalance.toFixed(2)}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono uppercase border border-slate-800 rounded px-1.5 py-0.5">
                SECURE CREDITS
              </span>
            </div>
          </div>

          {/* Quick Deposit Actions */}
          <div className="glass rounded-2xl p-5 border border-slate-800 text-left space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Fund Account
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit simulated fiat or cryptocurrency to top-up your wallet limits. Transactions are synchronized with your active Supabase session.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <Plus size={16} /> Deposit Credits
            </button>
          </div>
        </div>

        {/* Right Columns: Wallet Stats & Recent Activity Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 glass flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">TOTAL CREDITS INJECTED</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                  +${totalDeposited.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 glass flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">TOTAL CREDITS EXPENDED</span>
                <span className="text-base font-bold text-rose-400 font-mono mt-1 block">
                  -${totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 bg-rose-950/30 border border-rose-500/20 text-rose-400 rounded-lg">
                <ArrowDownLeft size={16} />
              </div>
            </div>
          </div>

          {/* Audit History Timeline Summary */}
          <div className="glass rounded-2xl p-5 border border-slate-800 text-left flex flex-col h-[300px]">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-850 pb-2.5 mb-4">
              Ledger Feed
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono text-center py-10">No activities registered.</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 font-mono">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg border mt-0.5 ${
                        tx.type === 'deposit' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-sans font-semibold leading-tight">{tx.description}</p>
                        <span className="text-[9px] text-slate-600 block mt-0.5">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={`text-xs font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render deposit modal */}
      {modalOpen && (
        <WalletModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};
