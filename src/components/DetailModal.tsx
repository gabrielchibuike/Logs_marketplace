import React from 'react';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';
import { LogTerminal } from './LogTerminal';
import { X, Shield, ShoppingCart, Check, Sparkles, Users, Heart, Clock, FileText } from 'lucide-react';

interface DetailModalProps {
  product: Product;
  onClose: () => void;
}

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

export const DetailModal: React.FC<DetailModalProps> = ({ product, onClose }) => {
  const { cart, purchases, addToCart, checkout, walletBalance } = useApp();

  const isPurchased = purchases.includes(product.id);
  const isInCart = cart.includes(product.id);

  const accountAge = product.accountAgeDays >= 365
    ? `${Math.floor(product.accountAgeDays / 365)} year(s)`
    : `${Math.floor(product.accountAgeDays / 30)} months`;

  const handleInstantBuy = async () => {
    if (!isInCart && !isPurchased) {
      addToCart(product.id);
    }
    // Brief pause for cart update
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (walletBalance < product.price && !isPurchased) {
      alert(`Insufficient balance ($${walletBalance.toFixed(2)}) to purchase this account ($${product.price.toFixed(2)}). Please deposit funds first.`);
      return;
    }
    const res = await checkout();
    if (res.success) {
      alert(`Successfully purchased ${product.title}! Credentials are now in your Dashboard.`);
      onClose();
    } else if (res.error) {
      alert(`Checkout failed: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div
        className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden glass flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getPlatformIcon(product.platform)}</span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{product.title}</h2>
              <span className="text-[10px] uppercase font-mono text-slate-500">{product.platform} • {product.niche}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono block"><Users size={10} className="inline mb-0.5" /> Followers</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">{formatFollowers(product.followers)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono block"><Heart size={10} className="inline mb-0.5" /> Engagement</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">{product.engagement}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono block"><FileText size={10} className="inline mb-0.5" /> Posts</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">{product.posts.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono block"><Clock size={10} className="inline mb-0.5" /> Account Age</span>
              <span className="text-sm font-semibold text-amber-400 font-mono">{accountAge}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono block"><Shield size={10} className="inline mb-0.5" /> Status</span>
              <span className={`text-sm font-semibold font-mono ${product.verified ? 'text-blue-400' : 'text-slate-300'}`}>
                {product.verified ? '✓ Verified' : 'Unverified'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-slate-400">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="text-left space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Account Overview</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/40">
              {product.description}
            </p>
          </div>

          {/* Account Preview Terminal */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono text-left">
              {isPurchased ? 'Full Account Credentials' : 'Account Preview (Public Info Only)'}
            </h4>
            <LogTerminal
              title={isPurchased ? `${product.id}_credentials.txt` : `${product.id}_preview.txt`}
              content={isPurchased ? product.fullDataContent : product.sampleData}
              maxHeight="max-h-64"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">Price</span>
              <span className="text-xl font-bold text-slate-200 font-mono">${product.price.toFixed(2)}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-500 font-mono block">Your Balance</span>
              <span className="text-sm font-semibold text-purple-400 font-mono">${walletBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition duration-200 font-medium text-sm cursor-pointer"
            >
              Close
            </button>

            {isPurchased ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-400 font-semibold text-sm">
                <Check size={16} /> Owned — Credentials Unlocked
              </div>
            ) : isInCart ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 font-semibold text-sm">
                <ShoppingCart size={16} /> In Cart
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    addToCart(product.id);
                  }}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 transition duration-200 font-medium text-sm cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleInstantBuy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <Sparkles size={16} /> Buy Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
