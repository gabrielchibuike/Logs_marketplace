import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { DetailModal } from '../components/DetailModal';
import { Cpu, Search, SlidersHorizontal, Users, Heart, Clock, RefreshCw } from 'lucide-react';

export const GeneratorView: React.FC = () => {
  const { products } = useApp();
  const [platform, setPlatform] = useState<string>('Any');
  const [minFollowers, setMinFollowers] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [category, setCategory] = useState<string>('Any');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const platforms = ['Any', 'Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'Facebook'];
  const categories = ['Any', 'High Followers', 'Creator', 'Aged Account', 'Business Page', 'Verified'];

  const handleSearch = () => {
    const filtered = products.filter((p) => {
      if (platform !== 'Any' && p.platform !== platform) return false;
      if (p.followers < minFollowers) return false;
      if (p.price > maxPrice) return false;
      if (p.engagement < minEngagement) return false;
      if (category !== 'Any' && p.category !== category) return false;
      return true;
    });
    setResults(filtered);
    setHasSearched(true);
  };

  const handleReset = () => {
    setPlatform('Any');
    setMinFollowers(0);
    setMaxPrice(1500);
    setMinEngagement(0);
    setCategory('Any');
    setResults([]);
    setHasSearched(false);
  };

  const formatFollowers = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

  return (
    <div className="w-full py-4 space-y-6">
      {/* Title */}
      <div className="bg-brand-card p-6 rounded-md border border-brand-border shadow-sm text-left">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-brand-navy uppercase font-sans flex items-center gap-2">
          <Cpu className="text-brand-red w-5 h-5" />
          Account <span className="text-brand-red">Finder</span>
        </h1>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">
          Configure search constraints below to discover matching listings. Filter by platform, followers count, target budget, and asset parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 bg-brand-card rounded-md p-5 border border-brand-border shadow-sm space-y-6 text-left">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-sans flex items-center gap-1.5 border-b border-brand-border pb-2.5">
            <SlidersHorizontal size={15} className="text-brand-red" /> Search Parameters
          </h2>

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider font-sans">
              Platform Tab
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border text-brand-navy py-2 px-3 rounded text-xs font-bold focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider font-sans">
              Account Niche Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border text-brand-navy py-2 px-3 rounded text-xs font-bold focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Min Followers */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-brand-muted uppercase tracking-wider font-sans">
              <span><Users size={10} className="inline mb-0.5" /> Min Followers</span>
              <span className="text-brand-navy font-bold">{formatFollowers(minFollowers)}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={minFollowers}
              onChange={(e) => setMinFollowers(parseInt(e.target.value))}
              className="w-full accent-brand-navy bg-brand-border h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Min Engagement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-brand-muted uppercase tracking-wider font-sans">
              <span><Heart size={10} className="inline mb-0.5" /> Min Engagement</span>
              <span className="text-brand-navy font-bold">{minEngagement}%+</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minEngagement}
              onChange={(e) => setMinEngagement(parseFloat(e.target.value))}
              className="w-full accent-brand-red bg-brand-border h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-brand-muted uppercase tracking-wider font-sans">
              <span><Clock size={10} className="inline mb-0.5" /> Max Budget</span>
              <span className="text-brand-red font-bold">₦{maxPrice.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-brand-red bg-brand-border h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition duration-200 cursor-pointer"
            >
              <Search size={14} /> Find Listings
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 px-3 rounded bg-brand-bg border border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5 transition duration-200 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[400px]">
          {hasSearched ? (
            results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-left">
                  <span className="text-xs text-brand-muted font-mono">
                    Found <span className="text-brand-red font-bold">{results.length}</span> matching item(s)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border rounded bg-brand-card py-20 text-center">
                <Users size={32} className="text-brand-muted mb-3" />
                <h3 className="text-sm font-bold text-brand-navy">No Matches Found</h3>
                <p className="text-xs text-brand-muted max-w-xs mt-1">
                  Adjust parameter sliders or explore other platforms to load more results.
                </p>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border rounded bg-brand-card py-20 text-center">
              <Cpu size={32} className="text-brand-muted mb-3" />
              <h3 className="text-sm font-bold text-brand-navy">Configure Requirements</h3>
              <p className="text-xs text-brand-muted max-w-xs mt-1">
                Use the settings panel on the left to set custom metrics targets and discover assets.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <DetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
