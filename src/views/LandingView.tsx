import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, TrendingUp, BadgeCheck, Users, Clock, ShoppingCart, Check, CreditCard, ChevronRight } from 'lucide-react';
import type { Product } from '../data/products';

export const LandingView: React.FC = () => {
  const { products, purchases, cart, addToCart } = useApp();
  const navigate = useNavigate();

  // Take first 3 active products for preview
  const featuredProducts = products.filter(p => !purchases.includes(p.id)).slice(0, 3);

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
    <div className="w-full space-y-20 py-8">
      {/* ── HERO SECTION ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left max-w-7xl mx-auto px-4">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy/5 border border-brand-border text-xs font-semibold text-brand-navy">
            <span className="flex h-2 w-2 rounded-full bg-brand-red animate-pulse"></span>
            Direct Seller-to-Buyer Digital Asset Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy tracking-tight leading-tight font-sans">
            Secure, Verified <br />
            <span className="text-brand-red">Social Media Assets</span> at Scale.
          </h1>
          <p className="text-base text-brand-muted leading-relaxed max-w-xl">
            Acquire pre-screened accounts, active creator channels, and business pages with automated checkout. Protected by our locked 72-hour escrow guarantee.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/marketplace')}
              className="py-3 px-6 rounded-md bg-brand-red hover:bg-brand-red-hover text-white text-sm font-bold transition duration-200 cursor-pointer flex items-center gap-2"
            >
              Explore Listings <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/generator')}
              className="py-3 px-6 rounded-md border border-brand-navy/20 hover:border-brand-navy bg-brand-card text-brand-navy text-sm font-bold transition duration-200 cursor-pointer"
            >
              Custom Requirements
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-brand-border pt-6 mt-4">
            <div>
              <span className="block text-2xl font-extrabold text-brand-navy">100%</span>
              <span className="text-xs text-brand-muted font-mono uppercase tracking-wider">Secured Handover</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-brand-navy">72 Hours</span>
              <span className="text-xs text-brand-muted font-mono uppercase tracking-wider">Buyer Protection</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-brand-navy">Instant</span>
              <span className="text-xs text-brand-muted font-mono uppercase tracking-wider">Credential Keys</span>
            </div>
          </div>
        </div>

        {/* CSS Dashboard Mockup */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-brand-navy/5 rounded-lg transform translate-x-3 translate-y-3 -z-10 border border-brand-navy/10"></div>
          <div className="bg-brand-navy text-slate-100 rounded-lg border border-brand-navy-light shadow-2xl p-5 font-mono text-[11px] overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-red"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-slate-400 text-[10px] ml-2">secure_asset_escrow_v3.2</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">PROTOCOL ACTIVE</span>
            </div>
            <div className="space-y-2 text-left leading-relaxed">
              <p className="text-slate-500">// INITIALIZING SECURE DECRYPTION LAYER...</p>
              <p className="text-emerald-400">✔ AUTHENTICATING OWNER AUTHENTICATION KEY</p>
              <p className="text-slate-800">ASSET ID      : ACC-TW-CRYPTOPULSEX-92K</p>
              <p className="text-slate-800">PLATFORM      : TWITTER / X</p>
              <p className="text-slate-800">HANDLE        : @CryptoPulseX</p>
              <p className="text-slate-800">METRICS       : 92,100 followers • 3.9% engagement</p>
              <p className="text-slate-500">// PROTECTED CREDENTIALS PAYLOAD:</p>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 my-1.5 text-slate-400 space-y-1">
                <p>USERNAME     : CryptoPulseX</p>
                <p>EMAIL        : cryptopulsex.acc@gmail.com</p>
                <p>PASSWORD     : *******************</p>
                <p className="text-emerald-500 text-[9px] mt-1.5">🔒 Service Role client signature matched. Access authorized.</p>
              </div>
              <p className="text-cyan-400">✔ BUYER ESCROW HOLD ACTIVE (71h 59m remaining)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION / FEATURES ── */}
      <section className="bg-brand-card border-y border-brand-border py-16">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-brand-red font-mono uppercase tracking-widest">Platform Parameters</h2>
            <p className="text-2xl font-bold text-brand-navy">Engineered for Absolute Transaction Safety</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border border-brand-border rounded-md text-left space-y-3 hover:border-brand-navy/20 transition">
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-md inline-block">
                <Shield size={20} />
              </div>
              <h3 className="text-sm font-bold text-brand-navy">72h Buyer Escrow</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                All payouts are locked for 72 hours. If credentials do not match parameters, raise a dispute to instantly freeze the transaction.
              </p>
            </div>

            <div className="p-6 border border-brand-border rounded-md text-left space-y-3 hover:border-brand-navy/20 transition">
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-md inline-block">
                <Key size={20} />
              </div>
              <h3 className="text-sm font-bold text-brand-navy">Instant Key Decryption</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                No waiting for manually transferred credentials. Secure RPC credentials decrypt immediately upon successful Paystack checkout.
              </p>
            </div>

            <div className="p-6 border border-brand-border rounded-md text-left space-y-3 hover:border-brand-navy/20 transition">
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-md inline-block">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-bold text-brand-navy">Vetted Asset Integrity</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                All platform assets are checked for metric authenticity. No bot networks, fake engagement, or invalid niche indexing.
              </p>
            </div>

            <div className="p-6 border border-brand-border rounded-md text-left space-y-3 hover:border-brand-navy/20 transition">
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-md inline-block">
                <BadgeCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-brand-navy">Hand-Vetted Sellers</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                We pre-screen account sellers with stringent KYC and background checks to avoid listing revoked or stolen digital property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE MARKETPLACE PREVIEW ── */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-xs font-bold text-brand-red font-mono uppercase tracking-widest">Live Inventory</h2>
            <p className="text-2xl font-bold text-brand-navy">Trending Accounts Available for Purchase</p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-xs font-bold text-brand-navy hover:text-brand-red flex items-center gap-1 transition font-mono border-b border-brand-navy/20 hover:border-brand-red cursor-pointer"
          >
            View Entire Inventory ({products.length} items) →
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="py-12 border border-brand-border rounded-lg bg-brand-card text-center text-xs text-brand-muted font-mono">
            No active listings available right now. Check back shortly!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const isInCart = cart.includes(product.id);
              return (
                <div key={product.id} className="bg-brand-card border border-brand-border rounded-md p-5 flex flex-col justify-between hover:border-brand-navy/25 transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded border border-brand-border text-brand-navy font-semibold bg-brand-bg">
                        {getPlatformIcon(product.platform)} {product.platform}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-brand-navy/5 text-brand-navy border border-brand-navy/10">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-brand-navy font-bold text-base mb-2 text-left hover:text-brand-red transition duration-200">
                      {product.title}
                    </h3>
                    <p className="text-xs text-brand-muted line-clamp-2 mb-4 leading-relaxed text-left">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded bg-brand-bg font-mono text-[9px] text-brand-muted mb-4 border border-brand-border/40">
                      <div className="text-left">
                        <span className="block text-slate-500">Followers</span>
                        <span className="text-brand-navy font-bold text-xs">{formatFollowers(product.followers)}</span>
                      </div>
                      <div className="text-left">
                        <span className="block text-slate-500">Engagement</span>
                        <span className="text-brand-navy font-bold text-xs">{product.engagement}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-brand-border pt-4 mt-4">
                    <div className="text-left">
                      <span className="text-[9px] text-brand-muted font-mono block">PRICE</span>
                      <span className="text-base font-bold text-brand-navy font-mono">₦{product.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="py-1.5 px-3.5 rounded border border-brand-navy/25 hover:border-brand-red text-brand-navy hover:text-brand-red text-xs font-bold transition duration-200 cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SOCIAL PROOF / STATS ── */}
      {/* <section className="bg-brand-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="block text-3xl md:text-4xl font-extrabold text-brand-red font-mono">99.8%</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Handover Success Rate</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl md:text-4xl font-extrabold text-white font-mono">15,400+</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Verified Accounts Delivered</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl md:text-4xl font-extrabold text-white font-mono">₦350M+</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Escrow Volume Protected</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl md:text-4xl font-extrabold text-white font-mono">&lt; 2 min</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Average Transfer Time</span>
          </div>
        </div>
      </section> */}
    </div>
  );
};
