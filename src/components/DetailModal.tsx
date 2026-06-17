import React, { useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';
import { LogTerminal } from './LogTerminal';
import { X, Shield, ShoppingCart, Check, Sparkles, Users, Clock, FileText, CreditCard } from 'lucide-react';
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

const formatSampleData = (data: Record<string, string> | null | undefined): string => {
  if (!data) return '';
  const entries = Object.entries(data);
  if (entries.length === 0) return '';
  const maxKeyLen = Math.max(...entries.map(([k]) => k.length));
  return entries
    .map(([key, value]) => `${key.padEnd(maxKeyLen + 1)}: ${value}`)
    .join('\n');
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
          console.error('Error fetching credentials:', err);
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
      console.error('Paystack gateway load error:', err);
      showToast('Paystack gateway load failed.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl rounded-md border border-brand-border bg-brand-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-bg">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getPlatformIcon(product.platform)}</span>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-brand-navy leading-tight">{product.title}</h2>
              <span className="text-[10px] uppercase font-mono font-bold text-brand-muted">{product.platform} • {product.niche}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded border border-transparent hover:border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-bg transition duration-150 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider"><Users size={9} className="inline mb-0.5" /> Followers</span>
              <span className="text-sm font-extrabold text-brand-navy font-mono">{formatFollowers(product.followers)}</span>
            </div>
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider"><Sparkles size={9} className="inline mb-0.5" /> Engagement</span>
              <span className="text-sm font-extrabold text-brand-red font-mono">{product.engagement}%</span>
            </div>
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider"><FileText size={9} className="inline mb-0.5" /> Posts</span>
              <span className="text-sm font-extrabold text-brand-navy font-mono">{product.posts.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider"><Clock size={9} className="inline mb-0.5" /> Age</span>
              <span className="text-sm font-extrabold text-brand-navy font-mono">{accountAge}</span>
            </div>
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider"><Shield size={9} className="inline mb-0.5" /> Verification</span>
              <span className={`text-sm font-extrabold font-mono ${product.verified ? 'text-blue-700' : 'text-brand-navy'}`}>
                {product.verified ? '✓ Verified' : 'Standard'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-bold font-mono px-2.5 py-1 rounded bg-brand-bg border border-brand-border text-brand-muted">
                #{tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="text-left space-y-2">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-sans">Account Overview</h4>
            <p className="text-xs text-brand-muted leading-relaxed bg-brand-bg p-4 rounded border border-brand-border/60">
              {product.description}
            </p>
          </div>

          {/* Account Preview Terminal */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-sans text-left">
              {isPurchased ? '🔒 Full Account Credentials' : '🛡️ Account Preview (Public Details)'}
            </h4>
            {loadingCredentials ? (
              <div className="py-8 text-center bg-brand-bg border border-brand-border rounded flex items-center justify-center gap-2 text-xs font-mono text-brand-navy font-bold">
                <div className="w-4 h-4 rounded-full border-2 border-brand-navy/20 border-t-brand-navy animate-spin"></div>
                <span>Decrypting Secure Cryptographic Keys...</span>
              </div>
            ) : (
              <LogTerminal
                title={isPurchased ? `${product.id}_credentials.txt` : `${product.id}_preview.txt`}
                content={isPurchased ? decryptedCredentials : formatSampleData(product.sampleData)}
                maxHeight="max-h-64"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-brand-bg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-brand-muted font-mono block">PRICE</span>
              <span className="text-base font-extrabold text-brand-navy font-mono">₦{product.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2 px-4 rounded border border-brand-navy/25 hover:border-brand-navy text-brand-navy hover:bg-brand-card transition duration-150 font-bold text-xs cursor-pointer bg-transparent"
            >
              Close Window
            </button>

            {isPurchased ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-emerald-550 border border-emerald-600/30 text-white font-bold text-xs">
                <Check size={14} /> Owned — Unlocked
              </div>
            ) : isInCart ? (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <div className="flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-brand-navy/10 border border-brand-border text-brand-navy font-bold text-xs">
                  <ShoppingCart size={14} /> In Cart
                </div>
                <button
                  onClick={handlePaystackCheckout}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white font-bold text-xs transition duration-200 cursor-pointer"
                >
                  <CreditCard size={14} /> Pay via Paystack
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    addToCart(product.id);
                  }}
                  className="w-full sm:w-auto py-2 px-4 rounded border border-brand-navy/20 hover:border-brand-navy text-brand-navy hover:bg-brand-card transition duration-200 font-bold text-xs cursor-pointer bg-transparent"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handlePaystackCheckout}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white font-bold text-xs transition duration-200 cursor-pointer"
                >
                  <CreditCard size={14} /> Pay via Paystack
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
