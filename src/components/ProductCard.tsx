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
    case 'Instagram': return 'border-pink-500/20 text-pink-700 bg-pink-50';
    case 'Twitter/X': return 'border-sky-500/20 text-sky-700 bg-sky-50';
    case 'TikTok': return 'border-cyan-500/20 text-cyan-700 bg-cyan-50';
    case 'YouTube': return 'border-red-500/20 text-red-700 bg-red-50';
    case 'Facebook': return 'border-blue-500/20 text-blue-700 bg-blue-50';
    default: return 'border-slate-500/20 text-slate-700 bg-slate-50';
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { purchases, user, setAuthModalOpen, completePayment, showToast } = useApp();
  const navigate = useNavigate();

  const isPurchased = purchases.includes(product.id);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'High Followers': return 'bg-cyan-200 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300';
      case 'Creator': return 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300';
      case 'Aged Account': return 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300';
      case 'Business Page': return 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300';
      case 'Verified': return 'bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-300';
      default: return 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300';
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
      console.error('Paystack gateway load error:', err);
      showToast('Paystack gateway load failed.', 'error');
    }
  };

  return (
    <div className="bg-brand-card rounded-md p-5 border border-brand-border flex flex-col justify-between hover:border-brand-navy/25 transition">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border ${getPlatformColor(product.platform)} font-bold`}>
            {getPlatformIcon(product.platform)} {product.platform}
          </span>
          <div className="flex items-center gap-1">
            {product.verified && (
              <span className="flex items-center gap-0.5 text-[9px] text-blue-700 font-mono bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold" title="Verified Account">
                <Shield size={10} /> Verified
              </span>
            )}
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${getCategoryBadge(product.category)}`}>
              {product.category}
            </span>
          </div>
        </div>

        <h3 className="text-brand-navy font-extrabold text-base mb-1.5 hover:text-brand-red transition duration-200 text-left">
          {product.title}
        </h3>

        <p className="text-xs text-brand-muted line-clamp-2 mb-3 leading-relaxed text-left">
          {product.description}
        </p>

        {/* Niche Tag */}
        <div className="mb-4 text-left">
          <span className="text-[9px] text-brand-navy font-bold font-mono bg-brand-bg border border-brand-border rounded px-2.5 py-0.5">
            {product.niche}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 px-3 rounded bg-brand-bg border border-brand-border font-mono text-[9px] text-brand-muted mb-4">
          <div className="text-left">
            <span className="block text-slate-500"><Users size={9} className="inline mb-0.5" /> Followers</span>
            <span className="text-brand-navy font-bold">{formatFollowers(product.followers)}</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-500"><Heart size={9} className="inline mb-0.5" /> Engage</span>
            <span className="text-brand-navy font-bold">{product.engagement}%</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-500">Posts</span>
            <span className="text-brand-navy font-bold">{product.posts.toLocaleString()}</span>
          </div>
          <div className="text-left">
            <span className="block text-slate-500">Age</span>
            <span className="text-brand-navy font-bold">{accountAge}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-brand-border pt-4 mt-auto">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-brand-muted font-mono">PRICE</span>
          <span className="text-base font-bold text-brand-navy font-mono">
            ₦{product.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(product)}
            className="p-1.5 rounded bg-brand-bg border border-brand-border hover:border-brand-navy text-brand-navy hover:bg-brand-navy/5 transition duration-150 cursor-pointer"
            title="View Details"
          >
            <Eye size={15} />
          </button>

          {isPurchased ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 py-1.5 px-3 rounded bg-brand-navy/5 border border-brand-navy/20 text-brand-navy hover:bg-brand-navy/10 text-xs font-bold transition duration-200 cursor-pointer"
            >
              <Check size={13} /> Owned
            </button>
          ) : (
            <button
              onClick={handlePaystackCheckout}
              className="flex items-center gap-1 py-1.5 px-3 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition duration-200 cursor-pointer"
            >
              <CreditCard size={13} /> Pay via Paystack
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
