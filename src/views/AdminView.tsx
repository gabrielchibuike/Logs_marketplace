import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';
import { encryptText } from '../utils/crypto';
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
  const [formFollowing, setFormFollowing] = useState('');
  const [formEngagement, setFormEngagement] = useState('');
  const [formAccountAgeDays, setFormAccountAgeDays] = useState('');
  const [formPosts, setFormPosts] = useState('');
  const [formVerified, setFormVerified] = useState(false);
  const [formPrice, setFormPrice] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSampleData, setFormSampleData] = useState<{ key: string; value: string }[]>([
    { key: 'Platform', value: PLATFORMS[0] },
    { key: 'Handle', value: '' }
  ]);
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

  // Keep the Platform sample data value in sync with the select dropdown
  useEffect(() => {
    setFormSampleData((prev) => {
      const hasPlatform = prev.some((item) => item.key === 'Platform');
      if (hasPlatform) {
        return prev.map((item) =>
          item.key === 'Platform' ? { ...item, value: formPlatform } : item
        );
      }
      return [{ key: 'Platform', value: formPlatform }, ...prev];
    });
  }, [formPlatform]);

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
      const parsedTags = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const sampleDataObj: Record<string, string> = {};
      formSampleData.forEach((item) => {
        if (item.key.trim()) {
          sampleDataObj[item.key.trim()] = item.value;
        }
      });

      const encrypted = await encryptText(formCredentials);
      const { error } = await supabase.from('products').insert([{
        title: formTitle,
        description: formDescription,
        platform: formPlatform,
        category: formCategory,
        followers: parseInt(formFollowers) || 0,
        following: parseInt(formFollowing) || 0,
        engagement: parseFloat(formEngagement) || 0,
        account_age_days: parseInt(formAccountAgeDays) || 0,
        posts: parseInt(formPosts) || 0,
        verified: formVerified,
        price: parseFloat(formPrice),
        niche: formNiche,
        tags: parsedTags.length > 0 ? parsedTags : [],
        sample_data: sampleDataObj,
        encrypted_credentials: encrypted,

        status: 'draft'
      }]);
      if (error) throw error;
      showToast('New account listing created as Draft.', 'success');
      // Reset form
      setFormTitle(''); setFormDescription(''); setFormFollowers('');
      setFormFollowing(''); setFormEngagement(''); setFormAccountAgeDays('');
      setFormPosts(''); setFormVerified(false); setFormTags('');
      setFormPrice(''); setFormNiche('');
      setFormSampleData([
        { key: 'Platform', value: formPlatform },
        { key: 'Handle', value: '' }
      ]);
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
          <div className="relative w-20 h-20 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-10 h-10 text-brand-red animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-brand-navy uppercase font-mono tracking-tight">
            401 — <span className="text-brand-red">UNAUTHORIZED</span>
          </h1>
          <p className="text-sm text-brand-muted font-mono max-w-md mx-auto">
            ACCESS_DENIED: Your session does not have administrative privileges.
            This endpoint requires <span className="text-brand-red font-semibold">role: 'admin'</span> on <code className="text-brand-red/70">public.profiles</code>.
          </p>
        </div>
        <div className="px-4 py-2 rounded-md bg-rose-50 border border-rose-200 text-brand-red text-[10px] font-mono">
          ERR_INSUFFICIENT_PRIVILEGES • session.role = '{userProfile?.role || 'null'}' • required = 'admin'
        </div>
      </div>
    );
  }

  // ─── ADMIN PANEL ───
  return (
    <div className="w-full py-6 space-y-6">
      {/* Header */}
      <div className="bg-brand-card p-6 rounded-md border border-brand-border glass text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy uppercase font-mono flex items-center gap-2">
            <ShieldCheck className="text-brand-navy w-6 h-6" />
            ADMIN <span className="text-brand-red">INVENTORY</span>
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage account listings, review drafts, and track sold inventory.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-md text-xs font-bold font-mono transition cursor-pointer border-0 ${showAddForm
              ? 'bg-brand-navy text-white hover:bg-brand-navy-light'
              : 'bg-brand-red hover:bg-brand-red-hover text-white'
            }`}
        >
          {showAddForm ? <><X size={14} /> Close Form</> : <><Plus size={14} /> Add Inventory</>}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">INVENTORY VALUE</span>
            <span className="text-xl font-bold text-brand-navy font-mono">₦{totalInventoryValue.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">ACTIVE LISTINGS</span>
            <span className="text-xl font-bold text-brand-navy font-mono">{totalActive}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <Package size={18} />
          </div>
        </div>
        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">ACCOUNTS SOLD</span>
            <span className="text-xl font-bold text-brand-navy font-mono">{totalSold}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="p-4 rounded-md bg-brand-card border border-brand-border glass flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-brand-muted font-mono block">PENDING DRAFTS</span>
            <span className="text-xl font-bold text-brand-navy font-mono">{totalDraft}</span>
          </div>
          <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy rounded-md">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <div className="bg-brand-card rounded-md p-6 border border-brand-border space-y-5">
          <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider font-mono flex items-center gap-1.5 text-left">
            <Plus size={16} className="text-brand-red" /> New Account Listing
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            {/* ── Row 1: Title & Price ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Title *</label>
                <input
                  type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Twitter/X Crypto Account — 92K"
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Price (₦) *</label>
                <input
                  type="number" required min="0" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 279.00"
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                />
              </div>
            </div>

            {/* ── Row 2: Platform, Category, Niche ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Platform</label>
                <select
                  value={formPlatform} onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy cursor-pointer"
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Category</label>
                <select
                  value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Niche</label>
                <input
                  type="text" value={formNiche} onChange={(e) => setFormNiche(e.target.value)}
                  placeholder="e.g. Crypto & DeFi"
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                />
              </div>
            </div>

            {/* ── Row 3: Account Metrics ── */}
            <div className="p-4 rounded-md bg-brand-bg border border-brand-border space-y-3">
              <h3 className="text-[10px] text-brand-navy uppercase tracking-widest font-mono font-bold">Account Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Followers</label>
                  <input
                    type="number" min="0" value={formFollowers} onChange={(e) => setFormFollowers(e.target.value)}
                    placeholder="92000"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Following</label>
                  <input
                    type="number" min="0" value={formFollowing} onChange={(e) => setFormFollowing(e.target.value)}
                    placeholder="1430"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Engagement %</label>
                  <input
                    type="number" min="0" max="100" step="0.1" value={formEngagement} onChange={(e) => setFormEngagement(e.target.value)}
                    placeholder="3.9"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Account Age (Days)</label>
                  <input
                    type="number" min="0" value={formAccountAgeDays} onChange={(e) => setFormAccountAgeDays(e.target.value)}
                    placeholder="1095"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Posts / Tweets</label>
                  <input
                    type="number" min="0" value={formPosts} onChange={(e) => setFormPosts(e.target.value)}
                    placeholder="8450"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* ── Row 4: Verified Toggle & Tags ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Verified Account</label>
                <button
                  type="button"
                  onClick={() => setFormVerified(!formVerified)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md font-mono font-bold transition cursor-pointer border ${formVerified
                      ? 'bg-brand-navy border-brand-navy text-white'
                      : 'bg-brand-bg border-brand-border text-brand-muted'
                    }`}
                >
                  {formVerified ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {formVerified ? '✅ VERIFIED' : 'NOT VERIFIED'}
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Tags (comma-separated)</label>
                <input
                  type="text" value={formTags} onChange={(e) => setFormTags(e.target.value)}
                  placeholder='e.g. Crypto, DeFi, Finance, Threads, X Premium'
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                />
                {formTags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formTags.split(',').map((tag, i) => tag.trim() && (
                      <span key={i} className="px-2 py-0.5 text-[9px] rounded-full bg-brand-navy/5 border border-brand-navy/10 text-brand-navy font-mono">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Description</label>
              <textarea
                rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Public account description for the catalog listing..."
                className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
              />
            </div>

            {/* ── Sample / Preview Data (Dynamic Key-Value) ── */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Sample / Preview Data</label>
              <div className="space-y-2">
                {formSampleData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={item.key}
                      onChange={(e) => {
                        const newPairs = [...formSampleData];
                        newPairs[idx].key = e.target.value;
                        setFormSampleData(newPairs);
                      }}
                      placeholder="Key (e.g. Followers)"
                      className="w-1/3 px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const newPairs = [...formSampleData];
                        newPairs[idx].value = e.target.value;
                        setFormSampleData(newPairs);
                      }}
                      placeholder="Value (e.g. 92,100)"
                      className="flex-1 px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormSampleData(formSampleData.filter((_, i) => i !== idx));
                      }}
                      className="p-2 rounded-md border border-brand-border text-brand-red hover:bg-brand-red/5 hover:border-brand-red transition cursor-pointer"
                      disabled={formSampleData.length <= 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormSampleData([...formSampleData, { key: '', value: '' }])}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-md border border-brand-border bg-brand-bg hover:bg-brand-card hover:border-brand-navy text-brand-muted hover:text-brand-navy text-[10px] font-bold font-mono transition cursor-pointer"
              >
                <Plus size={10} /> Add Field
              </button>
            </div>

            {/* ── Encrypted Credentials ── */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block flex items-center gap-1">
                <AlertTriangle size={10} className="text-brand-red" /> Raw Credentials (Secured via RLS)
              </label>
              <textarea
                rows={8} value={formCredentials} onChange={(e) => setFormCredentials(e.target.value)}
                placeholder={'USERNAME     : CryptoPulseX\nEMAIL        : cryptopulsex.acc@gmail.com\nPASSWORD     : D3F!Market#Pulse22\nOG EMAIL     : cryptopulsex_og@outlook.com\nOG EMAIL PASS: 0riginal_Pulse#99\n\nRECOVERY\n  Phone        : Linked\n  Backup Email : cryptopulsex.backup@proton.me'}
                className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
              />
              <p className="text-[9px] text-brand-muted font-mono">
                This data is stored in <code>encrypted_credentials</code> and is never visible to buyers until after purchase via the secure RPC.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-6 rounded-md bg-brand-red hover:bg-brand-red-hover text-white text-xs font-bold transition duration-200 border-0 disabled:opacity-50 cursor-pointer"
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
      <div className="bg-brand-card rounded-md border border-brand-border overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-brand-border bg-brand-bg">
          {([
            { key: 'active' as InventoryTab, label: 'Active Listings', count: totalActive },
            { key: 'draft' as InventoryTab, label: 'Drafts / Pending', count: totalDraft },
            { key: 'sold' as InventoryTab, label: 'Sold Items', count: totalSold },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveInventoryTab(tab.key)}
              className={`flex-1 py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer border-b-2 ${activeInventoryTab === tab.key
                  ? 'text-brand-navy border-brand-navy bg-brand-card font-bold'
                  : 'text-brand-muted border-transparent hover:text-brand-navy hover:bg-brand-bg/50'
                }`}
            >
              {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-brand-muted font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-muted font-mono">
              No {activeInventoryTab} items in inventory.
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted select-none">
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
                    <tr key={p.id} className="border-b border-brand-border hover:bg-brand-bg/40 transition group">
                      <td className="py-3 px-3 text-brand-text">
                        <span className="mr-1">{getPlatformIcon(p.platform)}</span>
                        {p.platform}
                      </td>
                      <td className="py-3 px-3 text-brand-navy font-semibold max-w-[200px] truncate">{p.title}</td>
                      <td className="py-3 px-3 text-brand-muted">{p.category}</td>
                      <td className="py-3 px-3 text-right text-brand-text">{formatFollowers(p.followers)}</td>
                      <td className="py-3 px-3 text-right text-brand-navy font-bold">₦{Number(p.price).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-brand-muted text-[10px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      {activeInventoryTab !== 'sold' && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(p)}
                              title={p.status === 'active' ? 'Move to Draft' : 'Make Active'}
                              className={`p-1.5 rounded-md border border-brand-border transition cursor-pointer ${p.status === 'active'
                                  ? 'text-brand-muted hover:bg-brand-navy/5'
                                  : 'text-brand-navy hover:bg-brand-navy/5'
                                }`}
                            >
                              {p.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              title="Delete permanently"
                              className="p-1.5 rounded-md border border-brand-border text-brand-red hover:bg-brand-red/5 hover:border-brand-red transition cursor-pointer"
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

