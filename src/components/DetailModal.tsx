import React, { useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';
import { LogTerminal } from './LogTerminal';
import { X, Shield, ShoppingCart, Check, Sparkles, Users, Clock, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { decryptText } from '../utils/crypto';

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
  const [buyQty, setBuyQty] = useState<number>(1);

  const isPurchased = purchases.includes(product.id);
  const isInCart = cart.includes(product.id);
  const isOutOfStock = product.quantityAvailable === 0 && !isPurchased;
  const maxQty = product.quantityAvailable;
  const isMultiUnit = maxQty > 1;

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
          if (Array.isArray(data)) {
            // New format: JSONB array of encrypted strings
            const decryptedParts = await Promise.all(
              data.map(async (encStr: string, i: number) => {
                const text = await decryptText(encStr);
                return data.length > 1 ? `─── UNIT ${i + 1} ───\n${text}` : text;
              })
            );
            setDecryptedCredentials(decryptedParts.join('\n\n'));
          } else if (data) {
            // Legacy single string fallback
            const decrypted = await decryptText(data);
            setDecryptedCredentials(decrypted);
          } else {
            setDecryptedCredentials('No access credentials returned.');
          }
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
    if (isOutOfStock) {
      showToast('This listing is sold out.', 'error');
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(product.price * buyQty * 100), // in kobo, scaled by qty
        callback: async (response: any) => {
          const res = await completePayment(product.id, response.reference, buyQty);
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
            <div className="p-3 rounded bg-brand-bg border border-brand-border text-left col-span-2 md:col-span-1">
              <span className="text-[10px] text-brand-muted font-bold font-sans block uppercase tracking-wider">Stock</span>
              {isOutOfStock ? (
                <span className="text-sm font-extrabold font-mono text-brand-red">Sold Out</span>
              ) : (
                <span className="text-sm font-extrabold font-mono text-emerald-600">
                  {product.quantityAvailable} / {product.quantityTotal}
                </span>
              )}
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
          {/* Support / Community Section */}
          <div className="rounded border border-brand-border bg-brand-bg px-5 py-4 text-center space-y-3">
            <div>
              <p className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Need Help? Contact Support</p>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Reach our support team directly through any of our official channels below.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href="https://t.me/+ifE4VByrdoE4Njlk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-5 rounded font-bold text-xs text-white transition duration-200 hover:opacity-90 active:scale-95 cursor-pointer w-full sm:w-auto"
                style={{ backgroundColor: '#229ED9' }}
              >
                {/* Telegram icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Join Telegram
              </a>
              <a
                href="https://chat.whatsapp.com/D61NcZ35srKKwGFVccqxbo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-5 rounded font-bold text-xs text-white transition duration-200 hover:opacity-90 active:scale-95 cursor-pointer w-full sm:w-auto"
                style={{ backgroundColor: '#25D366' }}
              >
                {/* WhatsApp icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-brand-bg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-brand-muted font-mono block">
                {buyQty > 1 ? `PRICE × ${buyQty} UNITS` : 'PRICE'}
              </span>
              <span className="text-base font-extrabold text-brand-navy font-mono">
                ₦{(product.price * buyQty).toLocaleString()}
              </span>
              {buyQty > 1 && (
                <span className="text-[9px] text-brand-muted font-mono block">
                  ₦{product.price.toLocaleString()} each
                </span>
              )}
            </div>

            {/* Quantity stepper — only shown for multi-unit available listings */}
            {isMultiUnit && !isPurchased && !isOutOfStock && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-brand-muted font-mono uppercase tracking-widest">Qty</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setBuyQty(q => Math.max(1, q - 1))}
                    disabled={buyQty <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-brand-border text-brand-navy font-bold text-sm hover:bg-brand-card disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >−</button>
                  <span className="w-8 text-center text-sm font-bold font-mono text-brand-navy">{buyQty}</span>
                  <button
                    type="button"
                    onClick={() => setBuyQty(q => Math.min(maxQty, q + 1))}
                    disabled={buyQty >= maxQty}
                    className="w-7 h-7 flex items-center justify-center rounded border border-brand-border text-brand-navy font-bold text-sm hover:bg-brand-card disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >+</button>
                </div>
                <span className="text-[9px] text-brand-muted font-mono">{maxQty} available</span>
              </div>
            )}
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
            ) : isOutOfStock ? (
              <button
                disabled
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-brand-border border border-brand-border text-brand-muted font-bold text-xs cursor-not-allowed opacity-60"
              >
                <CreditCard size={14} /> Sold Out
              </button>
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
                  onClick={() => { addToCart(product.id); }}
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
