import React from 'react';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';
import { Shield, Eye, Check, Users, Heart, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

declare const PaystackPop: any;

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

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'Instagram': return 'border-pink-500/10 text-pink-400 bg-pink-950/20 hover:border-pink-400/50';
    case 'Twitter/X': return 'border-sky-500/10 text-sky-400 bg-sky-950/20 hover:border-sky-400/50';
    case 'TikTok': return 'border-cyan-500/10 text-cyan-400 bg-cyan-950/20 hover:border-cyan-400/50';
    case 'YouTube': return 'border-red-500/10 text-red-400 bg-red-950/20 hover:border-red-400/50';
    case 'Facebook': return 'border-blue-500/10 text-blue-400 bg-blue-950/20 hover:border-blue-400/50';
    default: return 'border-slate-500/10 text-slate-400 bg-slate-950/20';
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { purchases, user, setAuthModalOpen, completePayment, showToast } = useApp();
  const navigate = useNavigate();

  const isPurchased = purchases.includes(product.id);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'High Followers': return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20';
      case 'Creator': return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      case 'Aged Account': return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
      case 'Business Page': return 'bg-purple-500/10 text-purple-300 border border-purple-500/20';
      case 'Verified': return 'bg-pink-500/10 text-pink-300 border border-pink-500/20';
      default: return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
    }
  };

  const accountAge = product.accountAgeDays >= 365
    ? `${Math.floor(product.accountAgeDays / 365)}yr${product.accountAgeDays >= 730 ? 's' : ''}`
    : `${Math.floor(product.accountAgeDays / 30)}mo`;

  const handlePaystackCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(product.price * 100), // in kobo
        callback: (response: any) => {
          completePayment(product.id, response.reference).then((res) => {
            if (res.success) {
              navigate('/dashboard');
            }
          });
        },
        onClose: () => {
          showToast('Payment cancelled.', 'info');
        }
      });
      handler.openIframe();
    } catch (err: any) {
      console.error('Paystack initialization error:', err);
      showToast('Paystack gateway load failed.', 'error');
    }
  };

  return (
    <div className={`glass rounded-xl p-5 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group ${isPurchased ? 'glow-purple' : 'glow-cyan'}`}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent group-hover:via-cyan-400 transition duration-300"></div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getPlatformColor(product.platform)}`}>
            {getPlatformIcon(product.platform)} {product.platform}
          </span>
          <div className="flex items-center gap-1">
            {product.verified && (
              <span className="flex items-center gap-0.5 text-[10px] text-blue-400 font-mono bg-blue-950/20 border border-blue-500/20 px-1.5 py-0.5 rounded" title="Verified Account">
                <Shield size={10} /> Verified
              </span>
            )}
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getCategoryBadge(product.category)}`}>
              {product.category}
            </span>
          </div>
        </div>

        <h3 className="text-slate-100 font-semibold text-base mb-1.5 group-hover:text-cyan-300 transition duration-200 text-left">
          {product.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed text-left">
          {product.description}
        </p>

        {/* Niche Tag */}
        <div className="mb-4 text-left">
          <span className="text-[10px] text-slate-500 font-mono bg-slate-950/50 border border-slate-800 rounded px-2 py-0.5">
            {product.niche}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 px-3 rounded-lg bg-slate-950/40 border border-slate-900/60 font-mono text-[10px] text-slate-400 mb-4">
          <div className="text-left">
            <span className="block text-slate-600"><Users size={10} className="inline mb-0.5" /> Followers</span>
            <span className="text-slate-200 font-medium">{formatFollowers(product.followers)}</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-600"><Heart size={10} className="inline mb-0.5" /> Engage</span>
            <span className="text-emerald-400 font-medium">{product.engagement}%</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-600">Posts</span>
            <span className="text-slate-200 font-medium">{product.posts.toLocaleString()}</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-600">Age</span>
            <span className="text-amber-400 font-medium">{accountAge}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-900/80 pt-4 mt-auto">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-500 font-mono">Price</span>
          <span className="text-lg font-bold text-slate-200 font-mono">
            ₦{product.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(product)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition duration-200 cursor-pointer"
            title="View Account Details"
          >
            <Eye size={16} />
          </button>

          {isPurchased ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-400 hover:bg-purple-950/50 hover:text-purple-300 text-xs font-semibold transition duration-200 cursor-pointer"
            >
              <Check size={14} /> Owned
            </button>
          ) : (
            <button
              onClick={handlePaystackCheckout}
              className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              <CreditCard size={14} /> Pay via Paystack
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
