import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';
import {
  ShieldAlert, ShieldCheck, Plus, Trash2, ToggleLeft, ToggleRight,
  Package, TrendingUp, Clock, Loader2, AlertTriangle, X
} from 'lucide-react';

type InventoryTab = 'active' | 'draft' | 'sold';

interface InventoryProduct {
  id: string;
  title: string;
  platform: string;
  category: string;
  price: number;
  followers: number;
  status: string;
  created_at: string;
}

const PLATFORMS = ['Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'Facebook'];
const CATEGORIES = ['Aged Account', 'High Followers', 'Creator', 'Business Page', 'Verified'];

export const AdminView: React.FC = () => {
  const { user, userProfile, showToast } = useApp();

  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPlatform, setFormPlatform] = useState(PLATFORMS[0]);
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formFollowers, setFormFollowers] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formSampleData, setFormSampleData] = useState('');
  const [formCredentials, setFormCredentials] = useState('');

  const isAdmin = userProfile?.role === 'admin';

  // Fetch all products (admins can see all statuses via RLS policy)
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, platform, category, price, followers, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInventory(data || []);
    } catch (err: any) {
      console.error('Failed to fetch admin inventory:', err);
      showToast('Failed to load inventory: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchInventory();
    }
  }, [isAdmin]);

  const filteredInventory = inventory.filter((p) => p.status === activeInventoryTab);

  // Metrics
  const totalActive = inventory.filter((p) => p.status === 'active').length;
  const totalSold = inventory.filter((p) => p.status === 'sold').length;
  const totalDraft = inventory.filter((p) => p.status === 'draft').length;
  const totalInventoryValue = inventory
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.price), 0);

  const handleToggleStatus = async (product: InventoryProduct) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', product.id);
      if (error) throw error;
      showToast(`"${product.title}" moved to ${newStatus}.`, 'success');
      fetchInventory();
    } catch (err: any) {
      showToast('Status update failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (product: InventoryProduct) => {
    if (product.status === 'sold') {
      showToast('Cannot delete a sold product.', 'error');
      return;
    }
    if (!window.confirm(`⚠️ Permanently delete "${product.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      if (error) throw error;
      showToast(`"${product.title}" deleted permanently.`, 'success');
      fetchInventory();
    } catch (err: any) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice) {
      showToast('Title and Price are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('products').insert([{
        title: formTitle,
        description: formDescription,
        platform: formPlatform,
        category: formCategory,
        followers: parseInt(formFollowers) || 0,
        price: parseFloat(formPrice),
        niche: formNiche,
        sample_data: formSampleData,
        encrypted_credentials: formCredentials,
        status: 'draft'
      }]);
      if (error) throw error;
      showToast('New account listing created as Draft.', 'success');
      // Reset form
      setFormTitle(''); setFormDescription(''); setFormFollowers('');
      setFormPrice(''); setFormNiche(''); setFormSampleData('');
      setFormCredentials(''); setShowAddForm(false);
      fetchInventory();
    } catch (err: any) {
      showToast('Insert failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

  // ─── ACCESS DENIED GATE ───
  if (!user || !isAdmin) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl mx-auto"></div>
          <div className="relative w-20 h-20 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-100 uppercase font-mono tracking-tight">
            401 — <span className="text-rose-400">UNAUTHORIZED</span>
          </h1>
          <p className="text-sm text-slate-400 font-mono max-w-md mx-auto">
            ACCESS_DENIED: Your session does not have administrative privileges.
            This endpoint requires <span className="text-rose-400 font-semibold">role: 'admin'</span> on <code className="text-rose-400/70">public.profiles</code>.
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono">
          ERR_INSUFFICIENT_PRIVILEGES • session.role = '{userProfile?.role || 'null'}' • required = 'admin'
        </div>
      </div>
    );
  }

  // ─── ADMIN PANEL ───
  return (
    <div className="w-full py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-950/45 p-6 rounded-2xl border border-slate-900 glass text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 uppercase font-mono flex items-center gap-2">
            <ShieldCheck className="text-emerald-400 w-6 h-6" />
            ADMIN <span className="text-emerald-400">INVENTORY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage account listings, review drafts, and track sold inventory.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
            showAddForm
              ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          }`}
        >
          {showAddForm ? <><X size={14} /> Close Form</> : <><Plus size={14} /> Add Inventory</>}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">INVENTORY VALUE</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">₦{totalInventoryValue.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">ACTIVE LISTINGS</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">{totalActive}</span>
          </div>
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <Package size={18} />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">ACCOUNTS SOLD</span>
            <span className="text-xl font-bold text-purple-400 font-mono">{totalSold}</span>
          </div>
          <div className="p-3 bg-purple-950/30 border border-purple-500/20 text-purple-400 rounded-lg">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-mono block">PENDING DRAFTS</span>
            <span className="text-xl font-bold text-amber-400 font-mono">{totalDraft}</span>
          </div>
          <div className="p-3 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded-lg">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <div className="glass rounded-2xl p-6 border border-emerald-500/20 space-y-5">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 text-left">
            <Plus size={16} className="text-emerald-400" /> New Account Listing
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Title *</label>
                <input
                  type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Instagram Fitness Creator — 180K"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
              </div>
              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Price (₦) *</label>
                <input
                  type="number" required min="0" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 349.00"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
              </div>
              {/* Platform */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Platform</label>
                <select
                  value={formPlatform} onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Category</label>
                <select
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Followers */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Followers</label>
                <input
                  type="number" min="0" value={formFollowers} onChange={(e) => setFormFollowers(e.target.value)}
                  placeholder="e.g. 180000"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
              </div>
              {/* Niche */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Niche</label>
                <input
                  type="text" value={formNiche} onChange={(e) => setFormNiche(e.target.value)}
                  placeholder="e.g. Fitness & Wellness"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
              </div>
            </div>
            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Description</label>
              <textarea
                rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Public account description for the catalog listing..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
              />
            </div>
            {/* Sample Data */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Sample / Preview Data</label>
              <textarea
                rows={4} value={formSampleData} onChange={(e) => setFormSampleData(e.target.value)}
                placeholder="Public-facing account stats preview (shown before purchase)..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
              />
            </div>
            {/* Encrypted Credentials */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block flex items-center gap-1">
                <AlertTriangle size={10} className="text-amber-400" /> Raw Credentials (Secured via RLS)
              </label>
              <textarea
                rows={6} value={formCredentials} onChange={(e) => setFormCredentials(e.target.value)}
                placeholder="Full account credentials payload (username, password, recovery codes, etc.)..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-amber-500/20 text-slate-200 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition resize-none"
              />
              <p className="text-[9px] text-amber-500/60 font-mono">
                This data is stored in <code>encrypted_credentials</code> and is never visible to buyers until after purchase via the secure RPC.
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Plus size={14} /> Create as Draft</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Inventory Tabs */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          {([
            { key: 'active' as InventoryTab, label: 'Active Listings', count: totalActive, color: 'text-cyan-400 border-cyan-500' },
            { key: 'draft' as InventoryTab, label: 'Drafts / Pending', count: totalDraft, color: 'text-amber-400 border-amber-500' },
            { key: 'sold' as InventoryTab, label: 'Sold Items', count: totalSold, color: 'text-purple-400 border-purple-500' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveInventoryTab(tab.key)}
              className={`flex-1 py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer border-b-2 ${
                activeInventoryTab === tab.key
                  ? `${tab.color} bg-slate-900/40`
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/20'
              }`}
            >
              {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-600 font-mono">
              No {activeInventoryTab} items in inventory.
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 select-none">
                    <th className="py-2.5 px-3 font-semibold">Platform</th>
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Followers</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Price</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Created</th>
                    {activeInventoryTab !== 'sold' && (
                      <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((p) => (
                    <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-950/30 transition group">
                      <td className="py-3 px-3 text-slate-300">
                        <span className="mr-1">{getPlatformIcon(p.platform)}</span>
                        {p.platform}
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-semibold max-w-[200px] truncate">{p.title}</td>
                      <td className="py-3 px-3 text-slate-400">{p.category}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{formatFollowers(p.followers)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">₦{Number(p.price).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-500 text-[10px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      {activeInventoryTab !== 'sold' && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(p)}
                              title={p.status === 'active' ? 'Move to Draft' : 'Make Active'}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                p.status === 'active'
                                  ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                                  : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10'
                              }`}
                            >
                              {p.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              title="Delete permanently"
                              className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
