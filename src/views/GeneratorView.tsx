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
    <div className="w-full py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-950/45 p-6 rounded-2xl border border-slate-900 glass text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 uppercase font-mono flex items-center gap-2">
          <Cpu className="text-cyan-400 w-6 h-6 animate-pulse-slow" />
          ACCOUNT <span className="text-cyan-400">FINDER</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Set your requirements below and find the perfect social media account. Filter by platform, follower count, engagement rate, price range, and account type.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 glass rounded-2xl p-5 border border-slate-800 space-y-6 text-left">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-850 pb-2.5">
            <SlidersHorizontal size={16} className="text-cyan-400" /> Search Filters
          </h2>

          {/* Platform */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Account Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 py-2 px-3 rounded-lg text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Min Followers */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <span><Users size={10} className="inline mb-0.5" /> Min Followers</span>
              <span className="text-cyan-400 font-bold">{formatFollowers(minFollowers)}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={minFollowers}
              onChange={(e) => setMinFollowers(parseInt(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 cursor-pointer"
            />
          </div>

          {/* Min Engagement */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <span><Heart size={10} className="inline mb-0.5" /> Min Engagement</span>
              <span className="text-emerald-400 font-bold">{minEngagement}%+</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minEngagement}
              onChange={(e) => setMinEngagement(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <span><Clock size={10} className="inline mb-0.5" /> Max Budget</span>
              <span className="text-purple-400 font-bold">${maxPrice.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              <Search size={14} /> Find Accounts
            </button>
            <button
              onClick={handleReset}
              className="py-3 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition duration-200 cursor-pointer"
              title="Reset filters"
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Found <span className="text-cyan-400 font-bold">{results.length}</span> matching account(s)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 py-20 text-center glass">
                <Users size={48} className="text-slate-700 mb-3" />
                <h3 className="text-sm font-semibold text-slate-400">No Accounts Found</h3>
                <p className="text-xs text-slate-600 max-w-sm mt-1">
                  No accounts match your current filters. Try adjusting your requirements or increasing your budget.
                </p>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 py-20 text-center glass">
              <Cpu size={48} className="text-slate-700 animate-pulse-slow mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">Configure Your Search</h3>
              <p className="text-xs text-slate-600 max-w-sm mt-1">
                Set your requirements using the filters on the left and click "Find Accounts" to discover matching listings.
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
