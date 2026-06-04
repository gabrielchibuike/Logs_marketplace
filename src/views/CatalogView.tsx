import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../utils/supabase';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { DetailModal } from '../components/DetailModal';
import { Search, Users, ShieldCheck, ArrowUpDown, Star } from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { products, loading, dbError } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('followers');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const platforms = ['All', 'Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'Facebook'];

  const totalFollowers = products.reduce((sum, p) => sum + p.followers, 0);
  const totalAccounts = products.length;

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = selectedPlatform === 'All' || product.platform === selectedPlatform;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'engagement') return b.engagement - a.engagement;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return b.followers - a.followers;
    });

  return (
    <div className="w-full space-y-8 py-6">
      {/* Hero Header */}
      <div className="space-y-4 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/45 p-6 rounded-2xl border border-slate-900 glass">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 uppercase font-mono">
              SOCIAL MEDIA <span className="text-cyan-400">ACCOUNTS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Browse premium social media accounts across Instagram, TikTok, Twitter/X, YouTube, and Facebook. Every listing includes verified follower counts, engagement rates, and full credentials upon purchase.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-900 flex-1 min-w-[130px]">
              <Users className="text-cyan-400 w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">TOTAL REACH</span>
                <span className="text-sm font-semibold text-slate-200 font-mono">{(totalFollowers / 1_000_000).toFixed(1)}M+</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-900 flex-1 min-w-[130px]">
              <Star className="text-purple-400 w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">ACCOUNTS</span>
                <span className="text-sm font-semibold text-slate-200 font-mono">{totalAccounts} Listed</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-900 flex-1 min-w-[130px]">
              <ShieldCheck className="text-emerald-400 w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">GUARANTEE</span>
                <span className="text-sm font-semibold text-slate-200 font-mono">72hr Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DB Setup Warning Block */}
      {dbError && (
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-left space-y-3 font-mono">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldCheck size={18} className="rotate-180" />
            <span>SUPABASE DATABASE SYNC ERROR</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The frontend is connected to your Supabase project, but could not retrieve products. 
            This usually means the database tables do not exist yet or are not seeded.
          </p>
          <div className="bg-slate-950/65 p-3 rounded-lg border border-slate-900/60 text-[10px] text-rose-300">
            Error: {dbError}
          </div>
          <div className="text-xs text-slate-400 font-sans space-y-1">
            <p className="font-semibold text-slate-200">How to resolve this:</p>
            <p>1. Open your Supabase Dashboard and go to the SQL Editor.</p>
            <p>2. Paste and run the database structure script: <a href="file:///c:/Users/Gabby/Documents/logs_marketplace/supabase/schema.sql" className="text-cyan-400 underline hover:text-cyan-300">supabase/schema.sql</a></p>
            <p>3. Paste and run the mock accounts seed script: <a href="file:///c:/Users/Gabby/Documents/logs_marketplace/supabase/seed.sql" className="text-cyan-400 underline hover:text-cyan-300">supabase/seed.sql</a></p>
          </div>
        </div>
      )}

      {!dbError && isSupabaseConfigured() && products.length === 0 && !loading && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-left space-y-3 font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>DATABASE IS EMPTY</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Your Supabase products table is successfully connected, but contains zero accounts.
          </p>
          <div className="text-xs text-slate-400 font-sans space-y-1">
            <p className="font-semibold text-slate-200">How to seed inventory:</p>
            <p>Run the SQL statements from your local project seed file: <a href="file:///c:/Users/Gabby/Documents/logs_marketplace/supabase/seed.sql" className="text-cyan-400 underline hover:text-cyan-300">supabase/seed.sql</a> inside your Supabase dashboard SQL editor.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/30 border border-slate-900 glass">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts, platforms, niches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-thin">
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedPlatform === plat
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <ArrowUpDown size={14} className="text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="followers">Followers (Most)</option>
            <option value="engagement">Engagement (Highest)</option>
            <option value="name">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center rounded-2xl bg-slate-950/20 border border-slate-900 glass flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <span className="text-xs font-mono text-slate-500">Querying Supabase Ledger...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-950/20 border border-dashed border-slate-900 glass">
          <Users size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No Accounts Match Your Search</p>
          <p className="text-xs text-slate-600 mt-1">Try clearing filters or searching for different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <DetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
