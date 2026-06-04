import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../data/products';
import { LogTerminal } from '../components/LogTerminal';
import { LayoutDashboard, Wallet, Users, Clock, Eye, Search, Key, ShieldCheck } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { purchases, walletBalance, transactions, setActiveTab, products } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [disputedIds, setDisputedIds] = useState<string[]>([]);

  const handleRaiseDispute = (productId: string) => {
    if (window.confirm("⚠️ Are you sure you want to raise a dispute for this account?\n\nThis will instantly freeze the transaction on the database and flag the credentials for admin security auditing. Our support team will contact you shortly.")) {
      setDisputedIds(prev => [...prev, productId]);
      alert("🚨 Dispute Registered successfully!\n\nDatabase status updated to: DISPUTED.\nAdmin security audit ticket #LOG-" + Math.floor(1000 + Math.random()*9000) + " has been logged. We will reach out to your profile address within 2 hours.");
    }
  };

  const purchasedProducts = purchases
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const totalPurchased = purchasedProducts.length;
  const totalFollowers = purchasedProducts.reduce((sum, p) => sum + p.followers, 0);

  // Auto-select first purchased product
  if (!selectedProduct && purchasedProducts.length > 0) {
    setSelectedProduct(purchasedProducts[0]);
  }

  const filteredLedger = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
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
      <div className="bg-slate-950/45 p-6 rounded-2xl border border-slate-900 glass text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 uppercase font-mono flex items-center gap-2">
            <LayoutDashboard className="text-purple-400 w-6 h-6" />
            MY <span className="text-purple-400">ACCOUNTS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your purchased social media accounts. View full credentials, download account details, and track your transaction history.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('catalog')}
          className="py-2 px-4 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition text-xs font-bold rounded-lg font-mono cursor-pointer"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">ACCOUNTS OWNED</span>
            <span className="text-xl font-bold text-slate-200 font-mono">{totalPurchased}</span>
          </div>
          <div className="p-3 bg-purple-950/30 border border-purple-500/20 text-purple-400 rounded-lg">
            <Key size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">WALLET CREDITS</span>
            <span className="text-xl font-bold text-purple-300 font-mono">${walletBalance.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-purple-950/30 border border-purple-500/20 text-purple-400 rounded-lg">
            <Wallet size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">TOTAL FOLLOWERS</span>
            <span className="text-xl font-bold text-slate-200 font-mono">{formatFollowers(totalFollowers)}</span>
          </div>
          <div className="p-3 bg-purple-950/30 border border-purple-500/20 text-purple-400 rounded-lg">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 glass rounded-2xl p-5 border border-slate-800 flex flex-col max-h-[500px]">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4 text-left">
            <Key size={16} className="text-purple-400" /> Purchased Accounts
          </h2>

          {purchasedProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center space-y-3">
              <ShieldCheck size={32} className="text-slate-700 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-slate-500">No Accounts Purchased</p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] mx-auto">
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
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 group cursor-pointer ${
                    selectedProduct?.id === p.id
                      ? 'bg-purple-950/30 border-purple-500 text-slate-100'
                      : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate group-hover:text-purple-400 transition">
                      {getPlatformIcon(p.platform)} {p.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                      <span>{p.platform}</span>
                      <span>•</span>
                      <span>{formatFollowers(p.followers)} followers</span>
                    </div>
                  </div>
                  <Eye size={14} className={`shrink-0 ${selectedProduct?.id === p.id ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

      {/* Credentials Viewer */}
      <div className="lg:col-span-2 flex flex-col justify-between h-full min-h-[400px]">
        {selectedProduct ? (
          <div className="flex flex-col h-full justify-between">
            <LogTerminal
              title={`${selectedProduct.id}_credentials.txt`}
              content={selectedProduct.fullDataContent}
              maxHeight="max-h-[420px]"
            />
            
            {/* Buyer Protection Control Panel */}
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-lg border ${
                  disputedIds.includes(selectedProduct.id) 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                    : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400'
                }`}>
                  <ShieldCheck size={16} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">EXCLUSIVITY GUARANTEE</span>
                  <span className={`text-xs font-semibold block ${disputedIds.includes(selectedProduct.id) ? 'text-rose-400' : 'text-slate-200'}`}>
                    {disputedIds.includes(selectedProduct.id) 
                      ? '🚨 TRANSACTION DISPUTED (Admin Alerted)' 
                      : '🛡️ 72-Hour Buyer Protection: Active'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                    {disputedIds.includes(selectedProduct.id) 
                      ? 'Funds frozen. Auditing seller credential logs.' 
                      : 'Expires in: 71h 59m'}
                  </span>
                </div>
              </div>
              {!disputedIds.includes(selectedProduct.id) && (
                <button
                  onClick={() => handleRaiseDispute(selectedProduct.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 text-[10px] font-mono font-semibold transition cursor-pointer shrink-0"
                >
                  Raise Dispute
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-slate-500 font-mono text-left mt-2.5">
              ⚠ Keep credentials secure. Change passwords and recovery emails immediately after transfer.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 py-20 text-center glass">
            <Key size={48} className="text-slate-700 mb-3 animate-pulse-slow" />
            <h3 className="text-sm font-semibold text-slate-400">No Account Selected</h3>
            <p className="text-xs text-slate-600 max-w-xs mt-1">
              Select a purchased account from the left panel to view full credentials.
            </p>
          </div>
        )}
      </div>
      </div>

      {/* Transaction Ledger */}
      <div className="glass rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 text-left">
            <Clock size={16} className="text-purple-400" /> Transaction History
          </h2>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2 text-slate-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Filter transactions..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 font-mono">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 select-none">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">ID</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-900 hover:bg-slate-950/30 transition">
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-semibold">{tx.id}</td>
                    <td className="py-3 px-3 text-slate-300">{tx.description}</td>
                    <td className={`py-3 px-3 text-right font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
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
