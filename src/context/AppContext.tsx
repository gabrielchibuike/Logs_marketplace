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
  completePayment: (productId: string, reference: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  hasPurchased: (id: string) => boolean;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Custom Toast Component ---
const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const typeStyles = {
          success: 'border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40',
          error: 'border-brand-red/30 text-brand-red bg-red-50 dark:bg-rose-950/40',
          info: 'border-brand-navy/20 text-brand-navy bg-brand-card dark:border-brand-border',
        };

        const icons = {
          success: <CheckCircle className="w-5 h-5 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 shrink-0" />,
          info: <Info className="w-5 h-5 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-md border backdrop-blur-md transition-all duration-300 transform translate-y-0 font-mono text-xs shadow-lg ${typeStyles[toast.type]}`}
          >
            <div className="flex gap-2.5 items-start">
              {icons[toast.type]}
              <span className="leading-relaxed font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-brand-muted hover:text-brand-navy transition cursor-pointer p-0.5 rounded hover:bg-brand-navy/5"
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

  // ─── Theme (Light / Dark) ───
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('paidlogstore_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Fallback: respect OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('paidlogstore_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
          .select('id, title, description, price, platform, category, followers, following, engagement, account_age_days, posts, verified, niche, tags, sample_data, quantity_total, quantity_available')
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
            sampleData: typeof item.sample_data === 'object' && item.sample_data !== null ? item.sample_data : {},
            quantityTotal: item.quantity_total !== undefined ? item.quantity_total : 1,
            quantityAvailable: item.quantity_available !== undefined ? item.quantity_available : 1,
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

  const completePayment = async (productId: string, reference: string, quantity: number = 1) => {
    if (!user) {
      showToast('You must be signed in to complete purchase.', 'error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        // Mock fallback for offline dev testing
        showToast('Payment verified (MOCK MODE)! Digital asset credentials unlocked.', 'success');
        setPurchases((prev) => [...prev, productId]);
        setCart((prev) => prev.filter((id) => id !== productId));
        return { success: true };
      }

      let success = false;
      let errorMsg = '';

      try {
        const { error } = await supabase.functions.invoke('verify-payment', {
          body: { productId, reference, quantity }
        });
        if (error) throw error;
        success = true;
      } catch (edgeErr: any) {
        console.warn(
          'Edge function verify-payment failed or not deployed. Falling back to client-side RPC verification (SECURITY WARNING: Client-side tampering is possible in this fallback route).',
          edgeErr
        );
        // Route: single unit → complete_checkout, multi → complete_checkout_multi
        const rpcName = quantity > 1 ? 'complete_checkout_multi' : 'complete_checkout';
        const rpcParams = quantity > 1
          ? { product_id_param: productId, reference_param: reference, quantity_param: quantity }
          : { product_id_param: productId, reference_param: reference };

        const { data, error } = await supabase.rpc(rpcName, rpcParams);
        if (error) {
          errorMsg = error.message;
          throw error;
        }
        success = data;
      }

      if (!success) {
        throw new Error(errorMsg || 'Checkout transaction registration failed.');
      }

      // Sync updated purchases mapping
      await syncUserProfile(user.id, user.email || '');

      // Remove product from cart if it was inside
      setCart((prev) => prev.filter((id) => id !== productId));

      showToast('Payment verified! Digital asset credentials unlocked.', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Failed to verify transaction on database ledger.', 'error');
      return { success: false, error: err.message || 'Checkout transaction failed' };
    } finally {
      setLoading(false);
    }
  };

  const hasPurchased = (id: string) => {
    return purchases.includes(id);
  };


  // --- AUTH SERVICES (SUPABASE) ---
  const signUp = async (email: string, pass: string): Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection offline. Auth operations unavailable.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: 'buyer'
          }
        }
      });
      if (error) throw error;

      const emailConfirmationRequired = data.user !== null && data.session === null;
      if (emailConfirmationRequired) {
        showToast('Account created successfully! Please check your email to confirm.', 'success');
        return { success: true, emailConfirmationRequired: true };
      }

      showToast('Account created successfully!', 'success');
      return { success: true, emailConfirmationRequired: false };
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

  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection offline. Auth operations unavailable.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      showToast('Password reset link sent to your email.', 'success');
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset link.', 'error');
      return { success: false, error: err.message };
    }
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
      signOut,
      resetPasswordForEmail,
      theme,
      toggleTheme
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
