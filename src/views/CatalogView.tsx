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
    <div className="w-full space-y-8 py-4">
      {/* Hero Header */}
      <div className="space-y-4 text-center md:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-brand-card p-6 rounded-md border border-brand-border shadow-sm">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-brand-navy uppercase font-sans">
              Marketplace <span className="text-brand-red">Inventory</span>
            </h1>
            <p className="text-xs text-brand-muted mt-1 max-w-xl leading-relaxed">
              Acquire pre-screened social media accounts across Instagram, TikTok, Twitter/X, YouTube, and Facebook. Each asset features verified statistics and automated escrow verification.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded bg-brand-bg border border-brand-border flex-1 min-w-[130px]">
              <Users className="text-brand-navy w-4 h-4 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold block uppercase tracking-wider">Total Reach</span>
                <span className="text-xs font-bold text-brand-navy font-mono">{(totalFollowers / 1_000_000).toFixed(1)}M+</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded bg-brand-bg border border-brand-border flex-1 min-w-[130px]">
              <Star className="text-brand-red w-4 h-4 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold block uppercase tracking-wider">Active Assets</span>
                <span className="text-xs font-bold text-brand-navy font-mono">{totalAccounts} listed</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded bg-brand-bg border border-brand-border flex-1 min-w-[130px]">
              <ShieldCheck className="text-brand-navy w-4 h-4 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-muted font-bold block uppercase tracking-wider">Escrow Holds</span>
                <span className="text-xs font-bold text-brand-navy font-mono">72hr Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DB Setup Warning Block */}
      {dbError && (
        <div className="p-5 rounded bg-red-50 border border-red-200 text-left space-y-3 font-mono text-brand-red">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck size={18} className="rotate-180" />
            <span>DATABASE INTEGRATION ERROR</span>
          </div>
          <p className="text-xs text-brand-navy leading-relaxed font-sans">
            Connected to Supabase, but could not fetch product listings. Ensure schema tables are built and seeded in the database.
          </p>
          <div className="bg-brand-card p-3 rounded border border-red-200/60 text-[10px]">
            Error: {dbError}
          </div>
          <div className="text-xs text-brand-muted font-sans space-y-1.5">
            <p className="font-bold text-brand-navy">Resolution Steps:</p>
            <p>1. Open your Supabase Workspace SQL Editor.</p>
            <p>2. Load and execute the schema: <a href="file:///home/gabby/Documents/Logs_marketplace/supabase/schema.sql" className="text-brand-red underline hover:text-brand-red-hover">supabase/schema.sql</a></p>
            <p>3. Load and execute the seeds: <a href="file:///home/gabby/Documents/Logs_marketplace/supabase/seed.sql" className="text-brand-red underline hover:text-brand-red-hover">supabase/seed.sql</a></p>
          </div>
        </div>
      )}

      {/* Empty State Warning */}
      {!dbError && isSupabaseConfigured() && products.length === 0 && !loading && (
        <div className="p-5 rounded bg-amber-50 border border-amber-200 text-left space-y-3 font-mono text-amber-800">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>DATABASE INVENTORY EMPTY</span>
          </div>
          <p className="text-xs text-brand-navy leading-relaxed font-sans">
            Supabase is successfully synced, but the products table contains zero rows.
          </p>
          <div className="text-xs text-brand-muted font-sans space-y-1">
            <p className="font-bold text-brand-navy">How to seed inventory:</p>
            <p>Execute the SQL commands in <a href="file:///home/gabby/Documents/Logs_marketplace/supabase/seed.sql" className="text-brand-red underline hover:text-brand-red-hover">supabase/seed.sql</a> inside your database SQL editor.</p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded bg-brand-card border border-brand-border shadow-sm">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 text-brand-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts, niches, platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-bg border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 scrollbar-thin">
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition cursor-pointer border ${selectedPlatform === plat
                ? 'bg-brand-navy border-brand-navy text-brand-bg'
                : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
          <ArrowUpDown size={14} className="text-brand-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-brand-bg border border-brand-border text-brand-navy py-1.5 px-3 rounded text-xs font-bold focus:outline-none focus:border-brand-navy cursor-pointer"
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
        <div className="py-20 text-center rounded bg-brand-card border border-brand-border flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-navy/20 border-t-brand-red animate-spin"></div>
          <span className="text-xs font-mono text-brand-muted">Loading Marketplace Inventory...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded bg-brand-card border border-brand-border shadow-sm">
          <Users size={32} className="mx-auto text-brand-muted mb-3" />
          <p className="text-sm font-bold text-brand-navy">No Listings Match Filters</p>
          <p className="text-xs text-brand-muted mt-1">Try expanding search inputs or select another platform tab</p>
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
