import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';
import { encryptText, decryptText } from '../utils/crypto';
import {
  ShieldAlert, ShieldCheck, Plus, Trash2, ToggleLeft, ToggleRight,
  Package, TrendingUp, Clock, Loader2, AlertTriangle, X, Edit, Lock
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
  quantity_total: number;
  quantity_available: number;
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
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formCredentialsList, setFormCredentialsList] = useState<string[]>(['']);
  const [formBulkPaste, setFormBulkPaste] = useState<string>('');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);

  // Edit listing states
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [editingCredentials, setEditingCredentials] = useState<{ id: string | null; encrypted_credentials: string; isSold: boolean; buyer_email?: string; cleartext?: string }[]>([]);
  const [loadingEditCredentials, setLoadingEditCredentials] = useState<boolean>(false);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editBulkPaste, setEditBulkPaste] = useState<string>('');
  const [editBulkMode, setEditBulkMode] = useState<boolean>(false);
  const [deletedCredentialIds, setDeletedCredentialIds] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);


  const isAdmin = userProfile?.role === 'admin';

  // Fetch all products (admins can see all statuses via RLS policy)
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, platform, category, price, followers, status, created_at, quantity_total, quantity_available')
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

  const handleQuantityChange = (newVal: number) => {
    if (newVal < 1) newVal = 1;
    setFormQuantity(newVal);
    setFormCredentialsList((prev) => {
      const list = [...prev];
      if (newVal > list.length) {
        while (list.length < newVal) list.push('');
      } else if (newVal < list.length) {
        list.splice(newVal);
      }
      return list;
    });
  };

  const handleCredentialChange = (idx: number, value: string) => {
    setFormCredentialsList((prev) => {
      const list = [...prev];
      list[idx] = value;
      return list;
    });
  };

  const handleProcessBulkPaste = () => {
    const separator = formBulkPaste.includes('---') ? '---' : '\n\n';
    const parts = formBulkPaste
      .split(separator)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      setFormQuantity(parts.length);
      setFormCredentialsList(parts);
      showToast(`Processed bulk paste: parsed ${parts.length} credential blocks.`, 'success');
      setIsBulkMode(false);
    } else {
      showToast('Could not identify any valid credential blocks separated by "---" or double newlines.', 'error');
    }
  };

  const [editProductForm, setEditProductForm] = useState<any>({});

  const handleStartEdit = async (product: InventoryProduct) => {
    setEditingProduct(product);
    setLoadingEditCredentials(true);
    setDeletedCredentialIds([]);
    setEditBulkPaste('');
    setEditBulkMode(false);
    setEditQuantity(product.quantity_total);
    setEditProductForm({
      title: product.title,
      price: product.price,
      followers: product.followers,
      platform: product.platform,
      category: product.category,
      description: '',
      niche: '',
      tags: [],
      sample_data: {}
    });

    try {
      // Load full product details (description, niche, tags, sample_data)
      const { data: fullProd, error: prodErr } = await supabase
        .from('products')
        .select('description, niche, tags, sample_data')
        .eq('id', product.id)
        .single();
      
      if (prodErr) throw prodErr;
      if (fullProd) {
        setEditProductForm({
          ...product,
          description: fullProd.description || '',
          niche: fullProd.niche || '',
          tags: Array.isArray(fullProd.tags) ? fullProd.tags.join(', ') : '',
          sample_data: fullProd.sample_data || {}
        });
      }

      // Load product credentials
      const { data: credsData, error: credsErr } = await supabase.rpc('admin_get_product_credentials', {
        product_id_param: product.id
      });
      if (credsErr) throw credsErr;
      
      const decList = await Promise.all((credsData || []).map(async (item: any) => {
        const clear = await decryptText(item.encrypted_credentials);
        return {
          id: item.id,
          encrypted_credentials: item.encrypted_credentials,
          isSold: item.is_sold,
          buyer_email: item.buyer_email,
          cleartext: clear
        };
      }));
      setEditingCredentials(decList);
    } catch (err: any) {
      console.error('Error loading edit credentials:', err);
      showToast('Error loading credentials: ' + err.message, 'error');
    } finally {
      setLoadingEditCredentials(false);
    }
  };

  const handleEditQuantityChange = (newVal: number) => {
    const soldCount = editingCredentials.filter(c => c.isSold).length;
    if (newVal < soldCount) {
      showToast(`Cannot set quantity below the number of sold units (${soldCount}).`, 'error');
      return;
    }
    setEditQuantity(newVal);
    setEditingCredentials((prev) => {
      const list = [...prev];
      if (newVal > list.length) {
        while (list.length < newVal) {
          list.push({ id: null, encrypted_credentials: '', isSold: false, cleartext: '' });
        }
      } else if (newVal < list.length) {
        const sold = list.filter(c => c.isSold);
        const unsold = list.filter(c => !c.isSold);
        const diff = list.length - newVal;
        const toDeleteIds: string[] = [];
        let droppedCount = 0;
        const keptUnsold = [];
        
        for (let i = unsold.length - 1; i >= 0; i--) {
          if (droppedCount < diff) {
            if (unsold[i].id) {
              toDeleteIds.push(unsold[i].id as string);
            }
            droppedCount++;
          } else {
            keptUnsold.unshift(unsold[i]);
          }
        }
        
        if (toDeleteIds.length > 0) {
          setDeletedCredentialIds(prevDel => [...prevDel, ...toDeleteIds]);
        }
        return [...sold, ...keptUnsold];
      }
      return list;
    });
  };

  const handleEditCredentialChange = (idx: number, value: string) => {
    setEditingCredentials((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], cleartext: value };
      return list;
    });
  };

  const handleEditDeleteUnsold = (idx: number) => {
    const item = editingCredentials[idx];
    if (item.isSold) return;
    if (item.id) {
      setDeletedCredentialIds(prev => [...prev, item.id as string]);
    }
    setEditingCredentials(prev => prev.filter((_, i) => i !== idx));
    setEditQuantity(prev => prev - 1);
  };

  const handleEditProcessBulkPaste = () => {
    const separator = editBulkPaste.includes('---') ? '---' : '\n\n';
    const parts = editBulkPaste
      .split(separator)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      setEditingCredentials((prev) => {
        const list = [...prev];
        parts.forEach((pText) => {
          list.push({ id: null, encrypted_credentials: '', isSold: false, cleartext: pText });
        });
        setEditQuantity(list.length);
        return list;
      });
      showToast(`Added ${parts.length} units from bulk paste.`, 'success');
      setEditBulkPaste('');
      setEditBulkMode(false);
    } else {
      showToast('No valid credentials blocks found to paste.', 'error');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const emptyCreds = editingCredentials.filter(c => !c.cleartext?.trim());
    if (emptyCreds.length > 0) {
      showToast('Please fill in credentials for all units.', 'error');
      return;
    }

    setEditSubmitting(true);
    try {
      // 1. Delete credentials marked for deletion
      if (deletedCredentialIds.length > 0) {
        const { error: delErr } = await supabase
          .from('product_credentials')
          .delete()
          .in('id', deletedCredentialIds);
        if (delErr) throw delErr;
      }

      // 2. Insert new and update changed credentials
      for (const cred of editingCredentials) {
        if (cred.id === null) {
          const enc = await encryptText(cred.cleartext || '');
          const { error: insErr } = await supabase
            .from('product_credentials')
            .insert([{ product_id: editingProduct.id, encrypted_credentials: enc }]);
          if (insErr) throw insErr;
        } else if (!cred.isSold) {
          const enc = await encryptText(cred.cleartext || '');
          const { error: updErr } = await supabase
            .from('product_credentials')
            .update({ encrypted_credentials: enc })
            .eq('id', cred.id);
          if (updErr) throw updErr;
        }
      }

      // 3. Update product details
      const parsedTags = typeof editProductForm.tags === 'string'
        ? editProductForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : editProductForm.tags;

      // Extract sample data keys
      const sampleDataObj: Record<string, string> = {};
      if (editProductForm.sample_data) {
        Object.entries(editProductForm.sample_data).forEach(([k, v]) => {
          if (k.trim()) sampleDataObj[k.trim()] = v as string;
        });
      }

      const { error: prodUpdateErr } = await supabase
        .from('products')
        .update({
          title: editProductForm.title,
          description: editProductForm.description,
          platform: editProductForm.platform,
          category: editProductForm.category,
          followers: parseInt(editProductForm.followers) || 0,
          following: parseInt(editProductForm.following) || 0,
          engagement: parseFloat(editProductForm.engagement) || 0,
          account_age_days: parseInt(editProductForm.account_age_days) || 0,
          posts: parseInt(editProductForm.posts) || 0,
          verified: editProductForm.verified,
          price: parseFloat(editProductForm.price),
          niche: editProductForm.niche,
          tags: parsedTags,
          sample_data: sampleDataObj
        })
        .eq('id', editingProduct.id);

      if (prodUpdateErr) throw prodUpdateErr;

      showToast('Product listing and credentials updated successfully.', 'success');
      setEditingProduct(null);
      fetchInventory();
    } catch (err: any) {
      showToast('Update failed: ' + err.message, 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

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
    // Check credentials count matches quantity
    const nonOk = formCredentialsList.filter(c => !c.trim());
    if (nonOk.length > 0) {
      showToast(`Please fill in credentials for all ${formQuantity} units.`, 'error');
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

      // 1. Insert product
      const { data: newProduct, error: productErr } = await supabase
        .from('products')
        .insert([{
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
          encrypted_credentials: await encryptText(formCredentialsList[0]), // Legacy fallback
          status: 'draft'
        }])
        .select('id')
        .single();

      if (productErr) throw productErr;

      // 2. Encrypt and insert credentials
      const encryptedList = await Promise.all(
        formCredentialsList.map(async (text) => await encryptText(text))
      );

      const credentialInserts = encryptedList.map((enc) => ({
        product_id: newProduct.id,
        encrypted_credentials: enc
      }));

      const { error: credsErr } = await supabase
        .from('product_credentials')
        .insert(credentialInserts);

      if (credsErr) throw credsErr;

      showToast(`New account listing created as Draft with ${formQuantity} credential units.`, 'success');
      // Reset form
      setFormTitle(''); setFormDescription(''); setFormFollowers('');
      setFormFollowing(''); setFormEngagement(''); setFormAccountAgeDays('');
      setFormPosts(''); setFormVerified(false); setFormTags('');
      setFormPrice(''); setFormNiche('');
      setFormSampleData([
        { key: 'Platform', value: formPlatform },
        { key: 'Handle', value: '' }
      ]);
      setFormQuantity(1);
      setFormCredentialsList(['']);
      setFormBulkPaste('');
      setShowAddForm(false);
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
            {/* ── Row 1: Title, Price & Quantity ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Quantity *</label>
                <input
                  type="number" required min="1" value={formQuantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  placeholder="e.g. 1"
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

            {/* ── Credentials Batch Entry ── */}
            <div className="space-y-3 p-4 rounded-md bg-brand-bg border border-brand-border">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                <label className="text-[10px] text-brand-navy uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-brand-red" /> Unit Credentials ({formQuantity} total)
                </label>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(!isBulkMode)}
                  className="px-2 py-1 rounded border border-brand-border text-[9px] font-bold font-mono text-brand-muted hover:text-brand-navy hover:bg-brand-card transition cursor-pointer"
                >
                  {isBulkMode ? 'Show Individual Entries' : 'Use Bulk Paste'}
                </button>
              </div>

              {isBulkMode ? (
                <div className="space-y-2">
                  <p className="text-[9px] text-brand-muted font-mono leading-relaxed">
                    Paste credentials for multiple units. Separate each unit using <code>---</code> on a new line, or split with an empty double line.
                  </p>
                  <textarea
                    rows={8}
                    value={formBulkPaste}
                    onChange={(e) => setFormBulkPaste(e.target.value)}
                    placeholder="USERNAME : account1&#10;PASSWORD : pass1&#10;---&#10;USERNAME : account2&#10;PASSWORD : pass2"
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-card border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleProcessBulkPaste}
                    className="py-1 px-3 bg-brand-navy text-white dark:text-slate-800 text-[10px] font-mono font-bold rounded hover:bg-brand-navy-light transition cursor-pointer border-0"
                  >
                    Process Bulk Paste
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                  {formCredentialsList.map((cred, idx) => (
                    <div key={idx} className="space-y-1.5 text-left bg-brand-card p-3 rounded border border-brand-border/60 font-sans">
                      <span className="text-[9px] font-bold font-mono text-brand-muted block">UNIT {idx + 1} CREDENTIALS</span>
                      <textarea
                        rows={3}
                        required
                        value={cred}
                        onChange={(e) => handleCredentialChange(idx, e.target.value)}
                        placeholder={`USERNAME     : unit_${idx + 1}_user\nPASSWORD     : pass_${idx + 1}`}
                        className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
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
                    <th className="py-2.5 px-3 font-semibold text-center">Stock (Sold / Total)</th>
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
                      <td className="py-3 px-3 text-center text-brand-text font-mono">
                        {p.quantity_total - p.quantity_available} / {p.quantity_total} sold
                        {p.quantity_available > 0 ? (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold">
                            {p.quantity_available} left
                          </span>
                        ) : (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-brand-red text-[9px] font-bold">
                            OUT OF STOCK
                          </span>
                        )}
                      </td>
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
                              onClick={() => handleStartEdit(p)}
                              title="Edit listing & credentials"
                              className="p-1.5 rounded-md border border-brand-border text-brand-navy hover:bg-brand-navy/5 transition cursor-pointer"
                            >
                              <Edit size={14} />
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

      {/* ── Edit Listing Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingProduct(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-card border border-brand-border rounded-xl shadow-2xl scrollbar-thin">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-brand-card border-b border-brand-border rounded-t-xl">
              <div>
                <h3 className="text-sm font-bold font-mono text-brand-navy flex items-center gap-2">
                  <Edit size={14} /> Edit Listing
                </h3>
                <p className="text-[10px] text-brand-muted font-mono mt-0.5 truncate max-w-[360px]">{editingProduct.title}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-md border border-brand-border text-brand-muted hover:text-brand-red hover:border-brand-red transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-6 space-y-5">
              {/* Title, Price & Quantity */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Title</label>
                  <input
                    type="text" required value={editProductForm.title || ''}
                    onChange={(e) => setEditProductForm((f: any) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Price (₦)</label>
                  <input
                    type="number" required min="0" step="0.01" value={editProductForm.price || ''}
                    onChange={(e) => setEditProductForm((f: any) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Quantity</label>
                  <input
                    type="number" min={editingCredentials.filter(c => c.isSold).length || 1} value={editQuantity}
                    onChange={(e) => handleEditQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Description</label>
                <textarea
                  rows={2} value={editProductForm.description || ''}
                  onChange={(e) => setEditProductForm((f: any) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
                />
              </div>

              {/* Niche & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Niche</label>
                  <input
                    type="text" value={editProductForm.niche || ''}
                    onChange={(e) => setEditProductForm((f: any) => ({ ...f, niche: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-brand-muted uppercase tracking-widest font-mono block">Tags (comma-separated)</label>
                  <input
                    type="text" value={editProductForm.tags || ''}
                    onChange={(e) => setEditProductForm((f: any) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition"
                  />
                </div>
              </div>

              {/* ── Credentials Editor ── */}
              <div className="space-y-3 p-4 rounded-md bg-brand-bg border border-brand-border">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                  <label className="text-[10px] text-brand-navy uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-brand-red" />
                    Credentials — {editQuantity} unit{editQuantity !== 1 ? 's' : ''}
                    <span className="text-brand-muted font-normal">
                      ({editingCredentials.filter(c => c.isSold).length} sold, {editingCredentials.filter(c => !c.isSold).length} unsold)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditBulkMode(!editBulkMode)}
                    className="px-2 py-1 rounded border border-brand-border text-[9px] font-bold font-mono text-brand-muted hover:text-brand-navy hover:bg-brand-card transition cursor-pointer"
                  >
                    {editBulkMode ? 'Show Individual' : '+ Bulk Add'}
                  </button>
                </div>

                {loadingEditCredentials ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-brand-muted text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading credentials...
                  </div>
                ) : (
                  <>
                    {editBulkMode && (
                      <div className="space-y-2 p-3 rounded bg-brand-card border border-dashed border-brand-navy/40">
                        <p className="text-[9px] text-brand-muted font-mono">Paste additional credential blocks separated by <code>---</code> or double newlines. They will be appended to the list below.</p>
                        <textarea
                          rows={5} value={editBulkPaste}
                          onChange={(e) => setEditBulkPaste(e.target.value)}
                          placeholder={"USERNAME : account_new\nPASSWORD : pass123\n---\nUSERNAME : another\nPASSWORD : pass456"}
                          className="w-full px-3 py-2 text-xs rounded-md bg-brand-bg border border-brand-border text-brand-text font-mono focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30 transition resize-none"
                        />
                        <button
                          type="button" onClick={handleEditProcessBulkPaste}
                          className="py-1 px-3 bg-brand-navy text-white text-[10px] font-mono font-bold rounded hover:bg-brand-navy-light transition cursor-pointer border-0"
                        >
                          Append Units
                        </button>
                      </div>
                    )}

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                      {editingCredentials.map((cred, idx) => (
                        <div
                          key={idx}
                          className={`rounded border p-3 space-y-1.5 transition ${cred.isSold ? 'bg-rose-500/5 border-rose-500/20' : 'bg-brand-card border-brand-border/60'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold font-mono flex items-center gap-1.5">
                              {cred.isSold ? (
                                <span className="text-brand-red flex items-center gap-1">
                                  <Lock size={9} /> UNIT {idx + 1} — SOLD
                                  {cred.buyer_email && <span className="text-brand-muted font-normal ml-1">→ {cred.buyer_email}</span>}
                                </span>
                              ) : (
                                <span className="text-emerald-600">UNIT {idx + 1} — AVAILABLE</span>
                              )}
                            </span>
                            {!cred.isSold && (
                              <button
                                type="button"
                                onClick={() => handleEditDeleteUnsold(idx)}
                                className="p-1 rounded text-brand-red hover:bg-brand-red/10 transition cursor-pointer border-0"
                                title="Remove this credential unit"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={2}
                            value={cred.cleartext || ''}
                            disabled={cred.isSold}
                            onChange={(e) => handleEditCredentialChange(idx, e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-md border text-brand-text font-mono focus:outline-none transition resize-none ${
                              cred.isSold
                                ? 'bg-brand-bg/40 border-brand-border/30 opacity-60 cursor-not-allowed'
                                : 'bg-brand-bg border-brand-border focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/30'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Save / Cancel */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editSubmitting || loadingEditCredentials}
                  className="flex items-center gap-1.5 py-2.5 px-6 rounded-md bg-brand-navy text-white text-xs font-bold transition border-0 disabled:opacity-50 cursor-pointer hover:bg-brand-navy-light"
                >
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="py-2.5 px-6 rounded-md border border-brand-border text-brand-muted text-xs font-mono hover:bg-brand-bg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

