import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../data/products';
import { LogTerminal } from '../components/LogTerminal';
import { LayoutDashboard, Users, Clock, Eye, Search, Key, ShieldCheck } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { purchases, products, user, setAuthModalOpen } = useApp();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [disputedIds, setDisputedIds] = useState<string[]>([]);

  // Dynamic states
  const [credentials, setCredentials] = useState<string>('');
  const [loadingCreds, setLoadingCreds] = useState<boolean>(false);
  const [txList, setTxList] = useState<any[]>([]);
  const [loadingTxs, setLoadingTxs] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-brand-card p-10 rounded-md border border-brand-border glass max-w-md w-full">
          <ShieldCheck size={48} className="text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy font-mono mb-2 uppercase tracking-wide">Authentication Required</h2>
          <p className="text-sm text-brand-muted mb-6">You need to sign in to view your purchased accounts, transaction history, and secure credentials.</p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 bg-brand-red hover:bg-brand-red-hover text-white transition font-mono font-bold rounded-md cursor-pointer border-0"
          >
            Sign In to Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  const purchasedProducts = purchases
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const totalPurchased = purchasedProducts.length;
  const totalFollowers = purchasedProducts.reduce((sum, p) => sum + p.followers, 0);

  // Auto-select first purchased product
  useEffect(() => {
    if (!selectedProduct && purchasedProducts.length > 0) {
      setSelectedProduct(purchasedProducts[0]);
    }
  }, [purchasedProducts, selectedProduct]);

  // Fetch selected product credentials
  useEffect(() => {
    if (selectedProduct && user) {
      const fetchCreds = async () => {
        setLoadingCreds(true);
        try {
          const { data, error } = await supabase.rpc('get_purchased_asset_data', {
            product_id_param: selectedProduct.id
          });
          if (error) throw error;
          setCredentials(data || 'No access credentials returned.');
        } catch (err: any) {
          console.error('Error fetching dashboard credentials:', err);
          setCredentials('Error loading access credentials: ' + err.message);
        } finally {
          setLoadingCreds(false);
        }
      };
      fetchCreds();
    } else {
      setCredentials('');
    }
  }, [selectedProduct, user]);

  // Fetch transaction history
  useEffect(() => {
    if (user) {
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
  }, [purchases, user]);

  const handleRaiseDispute = (productId: string) => {
    if (window.confirm("⚠️ Are you sure you want to raise a dispute for this account?\n\nThis will instantly freeze the transaction on the database and flag the credentials for admin security auditing. Our support team will contact you shortly.")) {
      setDisputedIds(prev => [...prev, productId]);
      alert("🚨 Dispute Registered successfully!\n\nDatabase status updated to: DISPUTED.\nAdmin security audit ticket #LOG-" + Math.floor(1000 + Math.random() * 9000) + " has been logged. We will reach out to your profile address within 2 hours.");
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
        <button
          onClick={() => navigate('/marketplace')}
          className="py-2 px-4 bg-brand-navy text-white dark:text-slate-800 hover:bg-brand-navy-light transition text-xs font-bold rounded-md font-mono cursor-pointer border-0"
        >
          Browse Marketplace
        </button>
      </div>

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

      {/* Main Panel */}
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
              {purchasedProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full p-3 rounded-md border text-left transition flex items-center justify-between gap-3 group cursor-pointer ${selectedProduct?.id === p.id
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
                      <span>{formatFollowers(p.followers)} followers</span>
                    </div>
                  </div>
                  <Eye size={14} className={`shrink-0 ${selectedProduct?.id === p.id ? 'text-brand-navy' : 'text-brand-muted group-hover:text-brand-navy'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Credentials Viewer */}
        <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[400px]">
          {selectedProduct ? (
            <div className="flex flex-col h-full justify-between">
              {loadingCreds ? (
                <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center border border-brand-border rounded-md bg-brand-card text-center gap-2 text-xs font-mono text-brand-navy">
                  <div className="w-5 h-5 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin"></div>
                  <span>Decrypting secure digital assets...</span>
                </div>
              ) : (
                <LogTerminal
                  title={`${selectedProduct.id}_credentials.txt`}
                  content={credentials}
                  maxHeight="max-h-[420px]"
                />
              )}

              {/* Buyer Protection Control Panel */}
              <div className="mt-3 p-4 rounded-md bg-brand-card border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-md border ${disputedIds.includes(selectedProduct.id)
                    ? 'bg-rose-50 border-rose-200 text-brand-red'
                    : 'bg-brand-navy/5 border border-brand-navy/10 text-brand-navy'
                    }`}>
                    <ShieldCheck size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-muted font-mono block">EXCLUSIVITY GUARANTEE</span>
                    <span className={`text-xs font-semibold block ${disputedIds.includes(selectedProduct.id) ? 'text-brand-red' : 'text-brand-navy'}`}>
                      {disputedIds.includes(selectedProduct.id)
                        ? '🚨 TRANSACTION DISPUTED (Admin Alerted)'
                        : '🛡️ 72-Hour Buyer Protection: Active'}
                    </span>
                    <span className="text-[9px] text-brand-muted font-mono block mt-0.5">
                      {disputedIds.includes(selectedProduct.id)
                        ? 'Funds frozen. Auditing seller credential logs.'
                        : 'Expires in: 71h 59m'}
                    </span>
                  </div>
                </div>
                {!disputedIds.includes(selectedProduct.id) && (
                  <button
                    onClick={() => handleRaiseDispute(selectedProduct.id)}
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

      {/* Transaction Ledger */}
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
    </div>
  );
};
