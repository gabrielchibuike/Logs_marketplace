import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Cpu, LayoutDashboard, ShoppingCart, Trash2, ShieldCheck, Menu, X, CreditCard, LogOut, User, Shield } from 'lucide-react';
import type { Product } from '../data/products';
import { Link, useNavigate, useLocation } from 'react-router-dom';

declare const PaystackPop: any;

export const Navbar: React.FC = () => {
  const { cart, removeFromCart, products, user, userProfile, signOut, setAuthModalOpen, completePayment, showToast } = useApp();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  const handlePaystackCheckout = (product: Product) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(product.price * 100), // in kobo
        callback: async (response: any) => {
          const res = await completePayment(product.id, response.reference);
          if (res.success) {
            setCartOpen(false);
            navigate('/dashboard');
          }
        },
        onClose: () => {
          showToast('Payment cancelled.', 'info');
        }
      });
      handler.openIframe();
    } catch (err: any) {
      console.error('Paystack initialization error:', err);
      showToast('Paystack gateway load failed.', 'error');
    }
  };

  const handleLogOut = () => {
    signOut();
    localStorage.removeItem('paidlogstore_user');
    localStorage.removeItem('paidlogstore_purchases');
    localStorage.removeItem('paidlogstore_cart');
    showToast('Signed out of session.', 'info');
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Marketplace', icon: <Database size={16} /> },
    { path: '/generator', label: 'Account Finder', icon: <Cpu size={16} /> },
    { path: '/dashboard', label: 'My Accounts', icon: <LayoutDashboard size={16} /> },
    ...(userProfile?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: <Shield size={16} /> }] : []),
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition duration-300">
          <ShieldCheck className="text-cyan-400 w-5 h-5 group-hover:rotate-6 transition-transform" />
        </div>
        <span className="font-mono font-bold text-lg tracking-wider text-slate-100 uppercase">
          Paid<span className="text-cyan-400">Log</span>Store
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition duration-200 cursor-pointer ${location.pathname === link.path
              ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
              }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-4 relative">
        {/* User Auth Badge */}
        {user ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 ">
            <User size={13} className="text-cyan-400" />
            <span className="max-w-[120px] truncate">{user.email}</span>
            <button
              onClick={() => handleLogOut()}
              title="Sign Out"
              className="ml-1 text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-mono font-semibold transition cursor-pointer"
          >
            <User size={13} /> Sign In
          </button>
        )}

        {/* Cart */}
        <div className="relative">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className={`p-2 rounded-lg border transition duration-300 relative cursor-pointer ${cart.length > 0
              ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-100'
              }`}
          >
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {cart.length}
              </span>
            )}
          </button>

          {cartOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl z-50 glass">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-sm font-semibold text-slate-200 font-mono">Shopping Cart</span>
                <span className="text-xs text-slate-400 font-mono">{cart.length} item(s)</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
                  Your cart is empty.
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800/50">
                        <div className="overflow-hidden text-left">
                          <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                          <p className="text-[10px] text-cyan-400 font-mono">₦{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePaystackCheckout(item)}
                            className="text-cyan-400 hover:text-cyan-300 p-1 hover:bg-slate-800 rounded transition cursor-pointer"
                            title="Pay via Paystack"
                          >
                            <CreditCard size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 hover:bg-slate-800 rounded transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-3 text-center">
                    <p className="text-[10px] text-slate-400 font-mono">
                      Pay for items individually using the checkout buttons above.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 mx-4 rounded-xl border border-slate-800 bg-slate-950/95 shadow-2xl md:hidden flex flex-col gap-2 z-50 glass">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition cursor-pointer ${location.pathname === link.path
                ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <User size={13} className="text-cyan-400" />
              <span className="max-w-[120px] truncate">{user.email}</span>
              <button
                onClick={() => handleLogOut()}
                title="Sign Out"
                className="ml-1 text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-mono font-semibold transition cursor-pointer"
            >
              <User size={13} /> Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
