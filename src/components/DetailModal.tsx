import React, { useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';
import { LogTerminal } from './LogTerminal';
import { X, Shield, ShoppingCart, Check, Sparkles, Users, Heart, Clock, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface DetailModalProps {
  product: Product;
  onClose: () => void;
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

export const DetailModal: React.FC<DetailModalProps> = ({ product, onClose }) => {
  const { cart, purchases, addToCart, user, setAuthModalOpen, completePayment, showToast } = useApp();
  const navigate = useNavigate();
  const [decryptedCredentials, setDecryptedCredentials] = useState<string>('');
  const [loadingCredentials, setLoadingCredentials] = useState<boolean>(false);

  const isPurchased = purchases.includes(product.id);
  const isInCart = cart.includes(product.id);

  const accountAge = product.accountAgeDays >= 365
    ? `${Math.floor(product.accountAgeDays / 365)} year(s)`
    : `${Math.floor(product.accountAgeDays / 30)} months`;

  // Fetch credentials dynamically via RPC only if the asset is purchased
  useEffect(() => {
    if (isPurchased && user) {
      const fetchCredentials = async () => {
        setLoadingCredentials(true);
        try {
          const { data, error } = await supabase.rpc('get_purchased_asset_data', {
            product_id_param: product.id
          });
          if (error) throw error;
          setDecryptedCredentials(data || 'No access credentials returned.');
        } catch (err: any) {
          console.error('Error fetching purchased credentials:', err);
          setDecryptedCredentials('Error loading access credentials: ' + err.message);
        } finally {
          setLoadingCredentials(false);
        }
      };
      fetchCredentials();
    }
  }, [isPurchased, product.id, user]);

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
        callback: async (response: any) => {
          const res = await completePayment(product.id, response.reference);
          if (res.success) {
            onClose();
            navigate('/dashboard');
          }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div
        className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden glass flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getPlatformIcon(product.platform)}</span>
            <div className="text-left">
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
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left">
              <span className="text-[10px] text-slate-500 font-mono block"><Users size={10} className="inline mb-0.5" /> Followers</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">{formatFollowers(product.followers)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left">
              <span className="text-[10px] text-slate-500 font-mono block"><Heart size={10} className="inline mb-0.5" /> Engagement</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">{product.engagement}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left">
              <span className="text-[10px] text-slate-500 font-mono block"><FileText size={10} className="inline mb-0.5" /> Posts</span>
              <span className="text-sm font-semibold text-slate-200 font-mono">{product.posts.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left">
              <span className="text-[10px] text-slate-500 font-mono block"><Clock size={10} className="inline mb-0.5" /> Account Age</span>
              <span className="text-sm font-semibold text-amber-400 font-mono">{accountAge}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left">
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
            {loadingCredentials ? (
              <div className="py-8 text-center bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-mono text-cyan-400">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <span>Decrypting Secure Assets...</span>
              </div>
            ) : (
              <LogTerminal
                title={isPurchased ? `${product.id}_credentials.txt` : `${product.id}_preview.txt`}
                content={isPurchased ? decryptedCredentials : product.sampleData}
                maxHeight="max-h-64"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">Price</span>
              <span className="text-xl font-bold text-slate-200 font-mono">₦{product.price.toLocaleString()}</span>
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
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <div className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 font-semibold text-sm">
                  <ShoppingCart size={16} /> In Cart
                </div>
                <button
                  onClick={handlePaystackCheckout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <CreditCard size={16} /> Pay via Paystack
                </button>
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
                  onClick={handlePaystackCheckout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <Sparkles size={16} /> Pay via Paystack
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
