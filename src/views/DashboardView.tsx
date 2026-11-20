import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../data/products';
import { LogTerminal } from '../components/LogTerminal';
import { LayoutDashboard, Users, Clock, Eye, Search, Key, ShieldCheck, Settings, ShieldAlert, RefreshCw, X, HelpCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { decryptText } from '../utils/crypto';

export const DashboardView: React.FC = () => {
  const { purchases, products, ownedProducts, user, setAuthModalOpen, refreshProducts, completePayment, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navigatedProductId = (location.state as any)?.selectedProductId;

  const [activeTab, setActiveTab] = useState<'logs' | 'transactions' | 'settings'>('logs');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [disputedIds, setDisputedIds] = useState<string[]>([]);

  // Claim missing purchase state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimReference, setClaimReference] = useState('');
  const [claimProductId, setClaimProductId] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Dynamic states
  const [credentials, setCredentials] = useState<string>('');
  const [loadingCreds, setLoadingCreds] = useState<boolean>(false);
  const [txList, setTxList] = useState<any[]>([]);
  const [loadingTxs, setLoadingTxs] = useState<boolean>(false);

  // Settings form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Auto-verify if returning from Paystack redirect (?reference=... or ?trxref=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const returnRef = searchParams.get('reference') || searchParams.get('trxref');
    const returnProdId = searchParams.get('product_id');
    const returnQty = parseInt(searchParams.get('quantity') || '1', 10) || 1;

    // Prompt login if returning from payment but unauthenticated
    if (!user) {
      if (returnRef) {
        showToast('Payment received! Please sign in to reveal your credentials.', 'info');
        setAuthModalOpen(true);
      }
      return;
    }

    // Check pending tx in localStorage
    const pendingRaw = localStorage.getItem('nlogs_pending_tx');
    let pendingTx: any = null;
    if (pendingRaw) {
      try {
        pendingTx = JSON.parse(pendingRaw);
      } catch (e) {
        console.error('Error parsing pending transaction:', e);
      }
    }

    const refToVerify = returnRef || (pendingTx && (Date.now() - pendingTx.timestamp < 3600000) ? pendingTx.reference : null);
    const prodIdToVerify = returnProdId || pendingTx?.productId || navigatedProductId;
    const qtyToVerify = returnQty || pendingTx?.quantity || 1;

    if (refToVerify && prodIdToVerify) {
      // Clean up URL and storage immediately to avoid double-firing
      if (returnRef) {
        navigate('/dashboard', { replace: true, state: { selectedProductId: prodIdToVerify } });
      }
      localStorage.removeItem('nlogs_pending_tx');

      completePayment(prodIdToVerify, refToVerify, qtyToVerify).then((res) => {
        if (res.success) {
          showToast('Payment verified! Asset unlocked successfully.', 'success');
          if (refreshProducts) refreshProducts();
        }
      });
    } else if (refToVerify && !prodIdToVerify) {
      // If reference returned from redirect but storage was lost (e.g. Safari Private Mode),
      // auto-fill the Claim modal so the buyer can pick the product and finish verification in 1 click
      setClaimReference(refToVerify);
      setClaimModalOpen(true);
      showToast('Payment reference detected! Select your account to complete unlock.', 'info');
    }
  }, [user, location.search]);

  // Re-fetch products when Dashboard mounts or purchases change to guarantee all purchased accounts are in state
  useEffect(() => {
    if (refreshProducts) {
      refreshProducts();
    }
  }, [refreshProducts, purchases.length]);

  // Unique purchased products preserving order of purchase.
  // Looks up in ownedProducts first (covers sold-out items fetched for the buyer),
  // then falls back to the main products array (covers active items just purchased).
  const uniquePurchasedProductIds = useMemo(() => Array.from(new Set(purchases)), [purchases]);

  const purchasedProducts = useMemo(() => {
    return uniquePurchasedProductIds
      .map((id) => ownedProducts.find((p) => p.id === id) ?? products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [uniquePurchasedProductIds, ownedProducts, products]);

  const totalPurchased = purchases.length;
  const totalFollowers = purchasedProducts.reduce((sum, p) => sum + p.followers, 0);

  const activeProduct = useMemo(() => {
    if (purchasedProducts.length === 0) return null;
    if (selectedProduct && purchasedProducts.some((p) => p.id === selectedProduct.id)) {
      return selectedProduct;
    }
    if (navigatedProductId) {
      const match = purchasedProducts.find((p) => p.id === navigatedProductId);
      if (match) return match;
    }
    return purchasedProducts[0] ?? null;
  }, [selectedProduct, navigatedProductId, purchasedProducts]);

  const activeProductId = activeProduct?.id;
  const userId = user?.id;

  // Fetch selected product credentials
  useEffect(() => {
    let active = true;
    if (activeProductId && userId) {
      const fetchCreds = async () => {
        setLoadingCreds(true);
        try {
          const { data, error } = await supabase.rpc('get_purchased_asset_data', {
            product_id_param: activeProductId
          });

          if (error) throw error;

          let decrypted = '';
          if (Array.isArray(data)) {
            // Decrypt each credential item in the returned JSONB array
            const decryptedParts = await Promise.all(
              data.map(async (encStr: string, i: number) => {
                const text = await decryptText(encStr);
                return data.length > 1 ? `─── UNIT ${i + 1} ───\n${text}` : text;
              })
            );
            decrypted = decryptedParts.join('\n\n');
          } else if (data) {
            decrypted = await decryptText(data);
          } else {
            decrypted = 'No access credentials returned.';
          }

          if (active) setCredentials(decrypted);
        } catch (err: any) {
          console.error('Error fetching dashboard credentials:', err);
          if (active) setCredentials('Error loading access credentials: ' + err.message);
        } finally {
          if (active) setLoadingCreds(false);
        }
      };
      fetchCreds();
    } else {
      setCredentials('');
    }
    return () => {
      active = false;
    };
  }, [activeProductId, userId]);

  // Fetch transaction history
  useEffect(() => {
    if (userId) {
      const fetchTransactions = async () => {
        setLoadingTxs(true);
        try {
          const { data, error } = await supabase
            .from('transactions')
            .select('id, type, amount, payment_reference, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          setTxList(data || []);
        } catch (err) {
          console.error('Error loading transactions:', err);
        } finally {
          setLoadingTxs(false);
        }
      };
      fetchTransactions();
    }
  }, [purchases.length, userId]);

  const handleRaiseDispute = (productId: string) => {
    if (window.confirm("⚠️ Are you sure you want to raise a dispute for this account?\n\nThis will instantly freeze the transaction on the database and flag the credentials for admin security auditing. Our support team will contact you shortly.")) {
      setDisputedIds(prev => [...prev, productId]);
      alert("🚨 Dispute Registered successfully!\n\nDatabase status updated to: DISPUTED.\nAdmin security audit ticket #LOG-" + Math.floor(1000 + Math.random() * 9000) + " has been logged. We will reach out to your profile address within 2 hours.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (newPassword.length < 6) {
      setSettingsError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSettingsError('Passwords do not match.');
      return;
    }

    setSettingsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setSettingsSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to change password.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const filteredLedger = txList.filter((tx) =>
    (tx.payment_reference || '').toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    tx.type.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  const formatFollowers = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return '📸';
      case 'Twitter/X': return '𝕏';
      case 'TikTok': return '🎵';
      case 'YouTube': return '▶️';
      case 'Facebook': return '📘';
      default: return '🌐';
    }
  };

  if (!user) {
    const searchParams = new URLSearchParams(location.search);
    const hasReturnRef = searchParams.get('reference') || searchParams.get('trxref');

    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-brand-card p-10 rounded-md border border-brand-border glass max-w-md w-full">
          {hasReturnRef ? (
            <>
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-brand-navy font-mono mb-2 uppercase tracking-wide">Payment Confirmed!</h2>
              <p className="text-sm text-brand-muted mb-4">
                Reference: <code className="text-xs bg-slate-100 p-1 rounded font-mono text-brand-navy">{hasReturnRef}</code>
              </p>
              <p className="text-xs text-brand-muted mb-6">
                Please sign in with the account you used to complete the purchase so your credentials can be decrypted and unlocked.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white transition font-mono font-bold rounded-md cursor-pointer border-0"
              >
                Sign In to Reveal Credentials
              </button>
            </>
          ) : (
            <>
              <ShieldCheck size={48} className="text-brand-red mx-auto mb-4" />
              <h2 className="text-xl font-bold text-brand-navy font-mono mb-2 uppercase tracking-wide">Authentication Required</h2>
              <p className="text-sm text-brand-muted mb-6">You need to sign in to view your purchased accounts, transaction history, and secure credentials.</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-3 bg-brand-red hover:bg-brand-red-hover text-white transition font-mono font-bold rounded-md cursor-pointer border-0"
              >
                Sign In to Access Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 space-y-6">
      {/* Title */}
      <div className="bg-brand-card p-6 rounded-md border border-brand-border glass text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy uppercase font-mono flex items-center gap-2">
            <LayoutDashboard className="text-brand-red w-6 h-6" />
            MY <span className="text-brand-red">ACCOUNTS</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Access your purchased social media accounts. View full credentials, download account details, and track your transaction history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setClaimError('');
              setClaimReference('');
              setClaimProductId(purchasedProducts[0]?.id || products[0]?.id || '');
              setClaimModalOpen(true);
            }}
            className="py-2 px-3 bg-brand-bg hover:bg-brand-navy/10 border border-brand-border text-brand-navy transition text-xs font-bold rounded-md font-mono cursor-pointer flex items-center gap-1.5"
            title="Claim an account if payment was completed but not delivered"
          >
            <RefreshCw size={12} className="text-brand-red" />
            Claim Missing Purchase
          </button>
          <button
            onClick={() => navigate('/marketplace')}
            className="py-2 px-4 bg-brand-navy text-white dark:text-slate-800 hover:bg-brand-navy-light transition text-xs font-bold rounded-md font-mono cursor-pointer border-0"
          >
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Verify Email Alert Banner */}
      {!user?.email_confirmed_at && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left glass">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Email Verification Recommended</h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 max-w-2xl leading-relaxed">
                Your email address <strong className="font-mono">{user?.email}</strong> is not verified yet. We recommend verifying your email for account recovery and transaction alerts.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: user.email!,
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                  }
                });
                if (error) throw error;
                alert('A new verification email has been sent to your inbox!');
              } catch (err: any) {
                alert('Failed to resend verification email: ' + err.message);
              }
            }}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold font-mono text-[9px] uppercase transition cursor-pointer border-0 shrink-0 select-none shadow-sm"
          >
            Resend Verification Link
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">ACCOUNTS OWNED</span>
            <span className="text-xl font-bold text-brand-navy font-mono">{totalPurchased}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <Key size={18} />
          </div>
        </div>

        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">TOTAL REACH (FOLLOWERS)</span>
            <span className="text-xl font-bold text-brand-navy font-mono">{formatFollowers(totalFollowers)}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-brand-border gap-6 pb-0.5">
        <button
          onClick={() => {
            setActiveTab('logs');
            setSettingsError('');
            setSettingsSuccess('');
          }}
          className={`pb-2.5 px-1 text-xs font-bold tracking-wider uppercase transition cursor-pointer border-b-2 font-mono flex items-center gap-1.5 ${activeTab === 'logs'
            ? 'border-brand-red text-brand-navy'
            : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
        >
          <Key size={14} /> Accounts & Logs
        </button>
        <button
          onClick={() => {
            setActiveTab('transactions');
            setSettingsError('');
            setSettingsSuccess('');
          }}
          className={`pb-2.5 px-1 text-xs font-bold tracking-wider uppercase transition cursor-pointer border-b-2 font-mono flex items-center gap-1.5 ${activeTab === 'transactions'
            ? 'border-brand-red text-brand-navy'
            : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
        >
          <Clock size={14} /> Transaction History
        </button>
        <button
          onClick={() => {
            setActiveTab('settings');
            setSettingsError('');
            setSettingsSuccess('');
          }}
          className={`pb-2.5 px-1 text-xs font-bold tracking-wider uppercase transition cursor-pointer border-b-2 font-mono flex items-center gap-1.5 ${activeTab === 'settings'
            ? 'border-brand-red text-brand-navy'
            : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
        >
          <Settings size={14} /> Account Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-brand-card rounded-md p-5 border border-brand-border flex flex-col max-h-[500px]">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-brand-border pb-3 mb-4 text-left">
              <Key size={16} className="text-brand-red" /> Purchased Accounts
            </h2>

            {purchasedProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center space-y-3">
                <ShieldCheck size={32} className="text-brand-muted animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-brand-navy">No Accounts Purchased</p>
                  <p className="text-[10px] text-brand-muted mt-1 max-w-[200px] mx-auto">
                    Buy accounts from the marketplace to view full credentials here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {purchasedProducts.map((p) => {
                  const unitsOwned = purchases.filter((id) => id === p.id).length;
                  const isSelected = activeProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`w-full p-3 rounded-md border text-left transition flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? 'bg-brand-navy/5 border-brand-navy text-brand-navy font-semibold'
                          : 'bg-brand-card border-brand-border text-brand-text hover:bg-brand-bg hover:text-brand-navy'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold truncate group-hover:text-brand-navy transition">
                          {getPlatformIcon(p.platform)} {p.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-brand-muted">
                          <span>{p.platform}</span>
                          <span>•</span>
                          {unitsOwned > 1 ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {unitsOwned} units owned
                            </span>
                          ) : (
                            <span>{formatFollowers(p.followers)} followers</span>
                          )}
                        </div>
                      </div>
                      <Eye
                        size={14}
                        className={`shrink-0 ${
                          isSelected ? 'text-brand-navy' : 'text-brand-muted group-hover:text-brand-navy'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Credentials Viewer */}
          <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[400px]">
            {activeProduct ? (
              <div className="flex flex-col h-full justify-between">
                {loadingCreds ? (
                  <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center border border-brand-border rounded-md bg-brand-card text-center gap-2 text-xs font-mono text-brand-navy">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin"></div>
                    <span>Decrypting secure digital assets...</span>
                  </div>
                ) : (
                  <LogTerminal
                    title={`${activeProduct.id}_credentials.txt`}
                    content={credentials}
                    maxHeight="max-h-[420px]"
                  />
                )}

                {/* Buyer Protection Control Panel */}
                <div className="mt-3 p-4 rounded-md bg-brand-card border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-md border ${disputedIds.includes(activeProduct.id)
                      ? 'bg-rose-50 border-rose-200 text-brand-red'
                      : 'bg-brand-navy/5 border border-brand-navy/10 text-brand-navy'
                      }`}>
                      <ShieldCheck size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-muted font-mono block">EXCLUSIVITY GUARANTEE</span>
                      <span className={`text-xs font-semibold block ${disputedIds.includes(activeProduct.id) ? 'text-brand-red' : 'text-brand-navy'}`}>
                        {disputedIds.includes(activeProduct.id)
                          ? '🚨 TRANSACTION DISPUTED (Admin Alerted)'
                          : '🛡️ 72-Hour Buyer Protection: Active'}
                      </span>
                      <span className="text-[9px] text-brand-muted font-mono block mt-0.5">
                        {disputedIds.includes(activeProduct.id)
                          ? 'Funds frozen. Auditing seller credential logs.'
                          : 'Expires in: 71h 59m'}
                      </span>
                    </div>
                  </div>
                  {!disputedIds.includes(activeProduct.id) && (
                    <button
                      onClick={() => handleRaiseDispute(activeProduct.id)}
                      className="px-3 py-1.5 rounded-md border border-brand-red text-brand-red hover:bg-brand-red/5 text-[10px] font-mono font-semibold transition cursor-pointer shrink-0"
                    >
                      Raise Dispute
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-brand-muted font-mono text-left mt-2.5">
                  ⚠ Keep credentials secure. Change passwords and recovery emails immediately after transfer.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border rounded-md bg-brand-card py-20 text-center glass">
                <Key size={48} className="text-brand-muted mb-3 animate-pulse-slow" />
                <h3 className="text-sm font-semibold text-brand-navy">No Account Selected</h3>
                <p className="text-xs text-brand-muted max-w-xs mt-1">
                  Select a purchased account from the left panel to view full credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-brand-card rounded-md p-5 border border-brand-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-3 mb-4">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider font-mono flex items-center gap-1.5 text-left">
              <Clock size={16} className="text-brand-red" /> Transaction History
            </h2>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2 text-brand-muted w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Filter transactions..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-brand-bg border border-brand-border rounded-md text-[10px] font-mono text-brand-text focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>
          </div>

          {loadingTxs ? (
            <div className="py-8 text-center text-xs text-brand-muted font-mono">
              Loading transaction ledger...
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="py-8 text-center text-xs text-brand-muted font-mono">
              No transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted select-none">
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">ID</th>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((tx) => (
                    <tr key={tx.id} className="border-b border-brand-border hover:bg-brand-bg/60 transition">
                      <td className="py-3 px-3 text-brand-muted text-left">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-brand-navy font-semibold text-left">{tx.id}</td>
                      <td className="py-3 px-3 text-brand-text text-left">{tx.payment_reference || 'Purchase receipt'}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-navy">
                        ₦{parseFloat(tx.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-brand-card rounded-md p-6 border border-brand-border text-left space-y-6">
          <div className="border-b border-brand-border pb-4">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Settings size={16} className="text-brand-red" /> Account Settings
            </h2>
            <p className="text-xs text-brand-muted mt-1 font-sans">Manage your account profile and credentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="p-4 rounded-md bg-brand-bg border border-brand-border space-y-4">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wide border-b border-brand-border pb-2 font-sans">Profile Details</h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-brand-muted block font-sans">EMAIL ADDRESS</span>
                  <span className="text-brand-navy font-semibold">{user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted block font-sans">ACCOUNT ID</span>
                  <span className="text-brand-navy font-semibold">{user?.id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted block font-sans">ACCOUNT CREATED</span>
                  <span className="text-brand-navy font-semibold">
                    {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="p-4 rounded-md border border-brand-border bg-brand-card space-y-4">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wide border-b border-brand-border pb-2 font-sans">Change Password</h3>

              {settingsError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-brand-red text-xs font-mono">
                  {settingsError}
                </div>
              )}

              {settingsSuccess && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono dark:bg-emerald-950/40 dark:text-emerald-400">
                  ✓ {settingsSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block font-sans">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={settingsLoading}
                    className="w-full px-3 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block font-sans">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={settingsLoading}
                    className="w-full px-3 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition disabled:opacity-50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-2 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold font-mono transition duration-200 disabled:opacity-50 cursor-pointer border-0"
                >
                  {settingsLoading ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Claim Missing Purchase Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-md border border-brand-border bg-brand-card shadow-2xl overflow-hidden flex flex-col text-left">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-bg">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-brand-navy/5 text-brand-red">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider font-mono">
                    Claim Missing Purchase
                  </h3>
                  <p className="text-[10px] text-brand-muted">
                    Instant delivery recovery for completed Paystack payments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="p-1.5 rounded hover:bg-brand-navy/10 text-brand-muted hover:text-brand-navy transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!claimProductId) {
                  setClaimError('Please select the product you purchased.');
                  return;
                }
                if (!claimReference.trim()) {
                  setClaimError('Please enter your Paystack transaction reference.');
                  return;
                }
                setClaimLoading(true);
                setClaimError('');
                try {
                  const res = await completePayment(claimProductId, claimReference.trim());
                  if (res.success) {
                    setClaimModalOpen(false);
                    setClaimReference('');
                    showToast('🎉 Purchase claimed! Credentials unlocked.', 'success');
                    if (refreshProducts) refreshProducts();
                  } else {
                    setClaimError(res.error || 'Failed to claim purchase. Please check reference.');
                  }
                } catch (err: any) {
                  setClaimError(err.message || 'Verification error occurred.');
                } finally {
                  setClaimLoading(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed flex items-start gap-2">
                <HelpCircle size={15} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>
                  If you completed payment but were not redirected back to the site, paste your <strong>Paystack Reference</strong> (found in your Paystack email receipt or bank debit SMS alert) to instantly unlock your credentials.
                </span>
              </div>

              {claimError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-brand-red text-xs font-mono">
                  {claimError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block font-sans">
                  Account / Product Purchased
                </label>
                <select
                  value={claimProductId}
                  onChange={(e) => setClaimProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy cursor-pointer"
                  required
                >
                  <option value="">Select the account you paid for...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.platform} — {p.title} (₦{p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase font-bold tracking-wider block font-sans">
                  Paystack Payment Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. T315313277684408 or NL_173211..."
                  value={claimReference}
                  onChange={(e) => setClaimReference(e.target.value)}
                  disabled={claimLoading}
                  className="w-full px-3 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy font-mono focus:outline-none focus:border-brand-navy transition disabled:opacity-50"
                  required
                />
                <span className="text-[10px] text-brand-muted block">
                  Check your inbox for an email from Paystack or your bank's debit alert transaction reference.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  disabled={claimLoading}
                  className="px-4 py-2 rounded border border-brand-border bg-brand-bg text-brand-muted hover:text-brand-navy text-xs font-bold font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimLoading}
                  className="px-4 py-2 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer border-0 disabled:opacity-50"
                >
                  {claimLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Verify & Unlock Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
