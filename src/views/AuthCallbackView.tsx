import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export const AuthCallbackView: React.FC = () => {
  const { showToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const exchangeStarted = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      // Check if we are already logged in (maybe the session is handled by the hash / client automatically)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMsg('No authentication code was detected. Please check that you used the correct link from your email.');
        }
      });
      return;
    }

    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const exchangeCode = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        setStatus('success');
        showToast('Email verified successfully! Opening your dashboard...', 'success');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } catch (err: any) {
        console.error('Callback error exchanging authorization code:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Failed to verify authorization code. The link may have expired or already been used.');
        showToast(err.message || 'Email verification failed.', 'error');
      }
    };

    exchangeCode();
  }, [searchParams, navigate, showToast]);

  return (
    <div className="w-full max-w-md mx-auto py-16 px-4 text-left">
      <div className="bg-brand-card border border-brand-border rounded-md shadow-2xl p-8 space-y-6 glass">
        {status === 'loading' && (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-brand-navy font-mono uppercase tracking-wider">
                Verifying <span className="text-brand-red">Credentials</span>
              </h1>
              <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
                Exchanging secure authorization ticket with Supabase directory... Please do not close this window.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-brand-navy font-mono uppercase tracking-wider">
                Session <span className="text-emerald-500">Established</span>
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-mono">
                Verification complete! Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-brand-red" />
                </div>
              </div>
              <h1 className="text-lg font-bold text-brand-navy font-mono uppercase tracking-wider">
                Verification <span className="text-brand-red">Failed</span>
              </h1>
            </div>

            <div className="p-4 rounded bg-red-50 dark:bg-rose-950/20 border border-red-200/40 text-brand-red text-xs font-mono leading-relaxed">
              {errorMsg}
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-brand-navy hover:bg-brand-navy-light text-white dark:text-slate-800 text-xs font-bold font-mono transition duration-200 cursor-pointer border-0"
            >
              <ArrowLeft size={14} /> Back to Home Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
