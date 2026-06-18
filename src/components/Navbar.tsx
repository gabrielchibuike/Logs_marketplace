import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Database, Cpu, LayoutDashboard, ShoppingCart, Trash2, Menu, X, CreditCard, LogOut, User, Shield, Sun, Moon } from 'lucide-react';
import type { Product } from '../data/products';
import { Link, useNavigate, useLocation } from 'react-router-dom';

declare const PaystackPop: any;

export const Navbar: React.FC = () => {
  const { cart, removeFromCart, products, user, userProfile, signOut, setAuthModalOpen, completePayment, showToast, theme, toggleTheme } = useApp();
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
      console.error('Paystack gateway load error:', err);
      showToast('Paystack gateway load failed.', 'error');
    }
  };

  const handleLogOut = () => {
    signOut();
    localStorage.removeItem('n_logs_user');
    localStorage.removeItem('n_logs_purchases');
    localStorage.removeItem('n_logs_cart');
    showToast('Signed out of session.', 'info');
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={15} /> },
    { path: '/marketplace', label: 'Marketplace', icon: <Database size={15} /> },
    { path: '/generator', label: 'Account Finder', icon: <Cpu size={15} /> },
    { path: '/dashboard', label: 'My Accounts', icon: <LayoutDashboard size={15} /> },
    ...(userProfile?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: <Shield size={15} /> }] : []),
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-3.5 flex items-center justify-between border-b border-brand-border">
      {/* Brand Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <img
          src="/logo.png"
          alt="N_Logs"
          className="h-16 w-auto object-contain rounded transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-bold transition duration-150 cursor-pointer ${location.pathname === link.path
              ? 'bg-brand-navy/5 text-brand-navy border border-brand-border/80'
              : 'text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5'
              }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-3 relative">
        {/* User Auth Badge */}
        {user ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-brand-border text-xs font-mono text-brand-navy bg-brand-card">
            <User size={13} className="text-brand-red" />
            <span className="max-w-[120px] truncate">{user.email}</span>
            <button
              onClick={() => handleLogOut()}
              title="Sign Out"
              className="ml-1 text-brand-muted hover:text-brand-red transition cursor-pointer p-0.5"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-navy/10 hover:border-brand-navy text-brand-navy hover:bg-brand-navy/5 text-xs font-sans font-bold transition duration-200 cursor-pointer bg-brand-card"
          >
            <User size={13} /> Sign In
          </button>
        )}

        {/* Cart */}
        <div className="relative">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className={`p-2 rounded border transition duration-200 relative cursor-pointer ${cart.length > 0
              ? 'bg-brand-red text-white border-brand-red hover:bg-brand-red-hover'
              : 'bg-brand-card border-brand-border text-brand-navy hover:bg-brand-navy/5'
              }`}
          >
            <ShoppingCart size={16} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-navy text-[9px] font-bold text-white shadow-md">
                {cart.length}
              </span>
            )}
          </button>

          {cartOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-md border border-brand-border bg-brand-card p-4 shadow-xl z-50 glass">
              <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                <span className="text-xs font-bold text-brand-navy font-sans uppercase tracking-wider">Shopping Cart</span>
                <span className="text-xs text-brand-muted font-mono">{cart.length} item(s)</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-brand-muted font-mono">
                  Your cart is empty.
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded bg-brand-bg border border-brand-border">
                        <div className="overflow-hidden text-left">
                          <p className="text-xs font-bold text-brand-navy truncate">{item.title}</p>
                          <p className="text-[10px] text-brand-red font-bold font-mono">₦{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePaystackCheckout(item)}
                            className="text-brand-navy hover:text-brand-red p-1 hover:bg-brand-navy/5 rounded transition cursor-pointer"
                            title="Pay via Paystack"
                          >
                            <CreditCard size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-brand-muted hover:text-brand-red p-1 hover:bg-brand-navy/5 rounded transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-brand-border pt-3 text-center">
                    <p className="text-[10px] text-brand-muted font-mono leading-relaxed">
                      Complete purchase individually using checkout icons above.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded border border-brand-border bg-brand-card text-brand-navy hover:bg-brand-navy/5 transition duration-200 cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden rounded border border-brand-border bg-brand-card text-brand-navy hover:bg-brand-navy/5 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 mx-4 rounded-md border border-brand-border bg-brand-card shadow-xl md:hidden flex flex-col gap-2.5 z-50 glass">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold transition cursor-pointer ${location.pathname === link.path
                ? 'bg-brand-navy/5 text-brand-navy border border-brand-border'
                : 'text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5'
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded border border-brand-border text-xs font-mono text-brand-navy bg-brand-bg mt-1">
              <User size={13} className="text-brand-red" />
              <span className="max-w-[120px] truncate">{user.email}</span>
              <button
                onClick={() => handleLogOut()}
                title="Sign Out"
                className="ml-1 text-brand-muted hover:text-brand-red transition cursor-pointer p-0.5"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 text-xs font-sans font-bold transition cursor-pointer bg-brand-card mt-1"
            >
              <User size={13} /> Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
