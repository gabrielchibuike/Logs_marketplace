import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data/products';
import type { Product, Transaction } from '../data/products';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

interface AppContextType {
  walletBalance: number;
  cart: string[];
  purchases: string[];
  transactions: Transaction[];
  products: Product[];
  loading: boolean;
  dbError: string | null;
  user: any | null;
  userProfile: { role: string; email: string } | null;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  checkout: () => Promise<{ success: boolean; error?: string }>;
  deposit: (amount: number, method: string) => Promise<void>;
  hasPurchased: (id: string) => boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- OFFLINE STATE FALLBACKS ---
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('paidlogstore_balance');
    return saved !== null ? parseFloat(saved) : 500.00;
  });

  const [cart, setCart] = useState<string[]>(() => {
    const saved = localStorage.getItem('paidlogstore_cart');
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<string[]>(() => {
    const saved = localStorage.getItem('paidlogstore_purchases');
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('paidlogstore_transactions');
    return saved !== null ? JSON.parse(saved) : [
      {
        id: 'tx-init',
        type: 'deposit',
        amount: 500.00,
        description: 'Welcome bonus credits added',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      }
    ];
  });

  // --- NEW LIVE DATABASE DRIVEN STATES ---
  const [products, setProducts] = useState<Product[]>(() => {
    return isSupabaseConfigured() ? [] : mockProducts;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<{ role: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('paidlogstore_active_tab');
    return saved !== null ? saved : 'catalog';
  });

  // Keep local storage synced for offline safety
  useEffect(() => {
    localStorage.setItem('paidlogstore_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('paidlogstore_balance', walletBalance.toString());
    }
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('paidlogstore_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('paidlogstore_purchases', JSON.stringify(purchases));
    }
  }, [purchases]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      localStorage.setItem('paidlogstore_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);


  // --- LIVE SUPABASE LOGIC SYNC ---
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    setLoading(true);

    // 1. Fetch live products from PostgreSQL
    const fetchLiveProducts = async () => {
      try {
        setDbError(null);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          // Format DB products into matching types
          const formatted = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            price: parseFloat(item.price),
            platform: item.platform,
            category: item.category,
            followers: item.followers,
            following: item.following,
            engagement: parseFloat(item.engagement),
            accountAgeDays: item.account_age_days,
            posts: item.posts,
            verified: item.verified,
            niche: item.niche || '',
            tags: Array.isArray(item.tags) ? item.tags : [],
            sampleData: item.sample_data || '',
            fullDataContent: item.encrypted_credentials || ''
          }));
          setProducts(formatted);
        }
      } catch (err: any) {
        console.error('Error fetching live products from DB:', err);
        setDbError(err.message || 'Failed to sync with Supabase products table');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProducts();

    // 2. Setup auth state listeners
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        syncUserProfile(session.user.id, session.user.email || '');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        syncUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setUserProfile(null);
        // Reset to initial offline defaults
        setWalletBalance(500.00);
        setPurchases([]);
        setTransactions([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch / Sync profile balance, purchased items, and transaction logs
  const syncUserProfile = async (userId: string, email: string) => {
    try {
      // A. Fetch profile role and wallet balance
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role, wallet_balance')
        .eq('id', userId)
        .single();

      if (profileErr) throw profileErr;

      if (profile) {
        setUserProfile({
          role: profile.role,
          email: email
        });
        setWalletBalance(parseFloat(profile.wallet_balance));
      }

      // B. Fetch purchased accounts mapping
      const { data: bought, error: boughtErr } = await supabase
        .from('purchased_accounts')
        .select('product_id');

      if (boughtErr) throw boughtErr;
      if (bought) {
        setPurchases(bought.map((b: any) => b.product_id));
      }

      // C. Fetch transaction logs
      const { data: txs, error: txsErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txsErr) throw txsErr;
      if (txs) {
        const formattedTxs: Transaction[] = txs.map((t: any) => ({
          id: t.id,
          type: t.type as 'deposit' | 'purchase',
          amount: parseFloat(t.amount),
          description: t.payment_reference || `${t.type === 'deposit' ? 'Deposited' : 'Purchased'} credits`,
          timestamp: t.created_at
        }));
        setTransactions(formattedTxs);
      }
    } catch (err) {
      console.error('Error syncing profile meta:', err);
    }
  };

  // --- ACTIONS HANDLERS ---
  const addToCart = (id: string) => {
    if (!cart.includes(id) && !purchases.includes(id)) {
      setCart((prev) => [...prev, id]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    const activeProducts = products.filter((p) => cart.includes(p.id));
    const totalCost = activeProducts.reduce((sum, item) => sum + item.price, 0);

    if (totalCost === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    if (walletBalance < totalCost) {
      return { success: false, error: 'Insufficient funds — deposit more credits in the Wallet Center' };
    }

    if (isSupabaseConfigured() && user) {
      try {
        setLoading(true);
        // Call postgres stored RPC function in database to deduct and log everything atomically
        for (const prod of activeProducts) {
          const { error } = await supabase.rpc('checkout_product', {
            product_id_param: prod.id
          });
          if (error) throw error;
        }

        // Refresh live data
        await syncUserProfile(user.id, user.email || '');
        setCart([]);
        return { success: true };
      } catch (err: any) {
        console.error('Live checkout error:', err);
        return { success: false, error: err.message || 'Database checkout transaction failed' };
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback checkout
      setWalletBalance((prev) => prev - totalCost);
      setPurchases((prev) => [...prev, ...cart]);
      
      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substring(2, 9)}`,
        type: 'purchase',
        amount: totalCost,
        description: `Purchased ${activeProducts.length} account(s): ${activeProducts.map((i) => i.title).join(', ')}`,
        timestamp: new Date().toISOString(),
      };
      
      setTransactions((prev) => [newTx, ...prev]);
      setCart([]);
      return { success: true };
    }
  };

  const deposit = async (amount: number, method: string) => {
    if (isSupabaseConfigured() && user) {
      try {
        setLoading(true);
        // 1. Insert transaction log
        const { error: txErr } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'deposit',
            amount: amount,
            status: 'completed',
            payment_method: method.toLowerCase().includes('crypto') ? 'crypto' : 'card',
            payment_reference: `Deposited credits via ${method}`
          });
        if (txErr) throw txErr;

        // 2. Add profile wallet balance
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ wallet_balance: walletBalance + amount })
          .eq('id', user.id);
        if (profileErr) throw profileErr;

        // Refresh session profile sync
        await syncUserProfile(user.id, user.email || '');
      } catch (err) {
        console.error('Error depositing to database:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback deposit
      setWalletBalance((prev) => prev + amount);
      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substring(2, 9)}`,
        type: 'deposit',
        amount,
        description: `Deposited credits via ${method}`,
        timestamp: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const hasPurchased = (id: string) => {
    return purchases.includes(id);
  };


  // --- AUTH SERVICES (SUPABASE) ---
  const signUp = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection offline. Auth operations unavailable.' };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            role: 'buyer',
            wallet_balance: 500.00
          }
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection offline. Auth operations unavailable.' };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  };


  return (
    <AppContext.Provider value={{
      walletBalance,
      cart,
      purchases,
      transactions,
      products,
      loading,
      dbError,
      user,
      userProfile,
      addToCart,
      removeFromCart,
      clearCart,
      checkout,
      deposit,
      hasPurchased,
      activeTab,
      setActiveTab,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
