import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  cart: string[];
  purchases: string[];
  products: Product[];
  loading: boolean;
  dbError: string | null;
  user: any | null;
  userProfile: { role: string; email: string } | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  completePayment: (productId: string, reference: string) => Promise<{ success: boolean; error?: string }>;
  hasPurchased: (id: string) => boolean;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Custom Toast Component ---
const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const typeStyles = {
          success: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          error: 'border-rose-500/30 text-rose-400 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
          info: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
        };

        const icons = {
          success: <CheckCircle className="w-5 h-5 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 shrink-0" />,
          info: <Info className="w-5 h-5 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-slide-in font-mono text-xs ${typeStyles[toast.type]}`}
          >
            <div className="flex gap-2.5 items-start">
              {icons[toast.type]}
              <span className="leading-relaxed font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-slate-500 hover:text-slate-200 transition cursor-pointer p-0.5 rounded-lg hover:bg-slate-900/40"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<string[]>(() => {
    const saved = localStorage.getItem('paidlogstore_cart');
    return saved !== null ? JSON.parse(saved) : [];
  });


  const [purchases, setPurchases] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<{ role: string; email: string } | null>(null);

  // Global Auth Modal state & Custom Toasts
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    localStorage.setItem('paidlogstore_cart', JSON.stringify(cart));
  }, [cart]);


  // --- LIVE SUPABASE LOGIC SYNC ---
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDbError('Supabase environment variables are missing.');
      return;
    }

    setLoading(true);

    // 1. Fetch live products from PostgreSQL (excluding sensitive credentials column)
    const fetchLiveProducts = async () => {
      try {
        setDbError(null);
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, platform, category, followers, following, engagement, account_age_days, posts, verified, niche, tags, sample_data')
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
            fullDataContent: '' // Protected credentials column not loaded on catalog fetch
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
        setPurchases([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch / Sync profile purchases and details
  const syncUserProfile = async (userId: string, email: string) => {
    try {
      // A. Fetch profile role
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileErr) throw profileErr;

      if (profile) {
        setUserProfile({
          role: profile.role,
          email: email
        });
      }

      // B. Fetch purchased accounts mapping
      const { data: bought, error: boughtErr } = await supabase
        .from('purchased_accounts')
        .select('product_id');

      if (boughtErr) throw boughtErr;
      if (bought) {
        setPurchases(bought.map((b: any) => b.product_id));
      }
    } catch (err) {
      console.error('Error syncing profile meta:', err);
    }
  };

  // --- ACTIONS HANDLERS ---
  const addToCart = (id: string) => {
    if (!cart.includes(id) && !purchases.includes(id)) {
      setCart((prev) => [...prev, id]);
      showToast('Account added to shopping cart.', 'info');
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item !== id));
    showToast('Account removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const completePayment = async (productId: string, reference: string) => {
    if (!user) {
      showToast('You must be signed in to complete purchase.', 'error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('complete_checkout', {
        product_id_param: productId,
        reference_param: reference
      });

      if (error) {
        console.error('Failed to verify checkout on database:', error);
        throw error;
      }

      // Sync updated purchases mapping
      await syncUserProfile(user.id, user.email || '');

      // Remove product from cart if it was inside
      setCart((prev) => prev.filter((id) => id !== productId));

      showToast('Payment verified! Digital asset credentials unlocked.', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Database checkout error:', err);
      showToast(err.message || 'Failed to verify transaction on database ledger.', 'error');
      return { success: false, error: err.message || 'Database checkout transaction failed' };
    } finally {
      setLoading(false);
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
            role: 'buyer'
          }
        }
      });
      if (error) throw error;
      showToast('Account created successfully! Verify your email to sign in.', 'success');
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Failed to register account.', 'error');
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
      showToast('Successfully authenticated session.', 'success');
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password.', 'error');
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
    showToast('Signed out of session.', 'info');
    // navigate('/');
  };


  return (
    <AppContext.Provider value={{
      cart,
      purchases,
      products,
      loading,
      dbError,
      user,
      userProfile,
      authModalOpen,
      setAuthModalOpen,
      toasts,
      showToast,
      addToCart,
      removeFromCart,
      clearCart,
      completePayment,
      hasPurchased,
      signUp,
      signIn,
      signOut
    }}>
      {children}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
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
