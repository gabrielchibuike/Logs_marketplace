import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ResetPasswordView: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      showToast('Your password has been reset successfully!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 text-left">
      <div className="bg-brand-card border border-brand-border rounded-md shadow-lg p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded bg-brand-navy/5 border border-brand-navy/10 flex items-center justify-center">
            <Lock className="text-brand-navy w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand-navy uppercase font-sans">
            Set New <span className="text-brand-red">Password</span>
          </h1>
          <p className="text-xs text-brand-muted">
            Enter your new secure password below to complete the account recovery process.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded bg-red-50 border border-red-200 text-brand-red text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success ? (
          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-200 rounded text-center space-y-3 dark:bg-emerald-950/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Password Reset Completed</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1 font-sans">
                You will be redirected to the home page shortly...
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
