import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, TrendingUp, BadgeCheck, ChevronRight } from 'lucide-react';

export const LandingView: React.FC = () => {
  const { products, purchases } = useApp();
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

      {/* ── COMMUNITY & SUPPORT CTA ── */}
      <section className="bg-brand-card border-y border-brand-border py-14">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          {/* Pulse indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy/5 border border-brand-border text-xs font-semibold text-brand-navy">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Support Team Online
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">Join Our Community</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Stay updated and connect with us through our official channels. Our support team is always available to assist you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://t.me/+ifE4VByrdoE4Njlk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-md font-bold text-sm text-white transition duration-200 hover:opacity-90 active:scale-95 w-full sm:w-auto shadow-sm"
              style={{ backgroundColor: '#229ED9' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Join Telegram
            </a>
            <a
              href="https://chat.whatsapp.com/D61NcZ35srKKwGFVccqxbo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-md font-bold text-sm text-white transition duration-200 hover:opacity-90 active:scale-95 w-full sm:w-auto shadow-sm"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          <p className="text-[11px] text-brand-muted font-mono">
            Response time: typically under 5 minutes during business hours.
          </p>
        </div>
      </section>
    </div>
  );
};
