import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Cpu, LayoutDashboard, Wallet, ShoppingCart, Trash2, ShieldCheck, Menu, X, ArrowRight, LogOut, User } from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabase';

export const Navbar: React.FC = () => {
  const { walletBalance, cart, removeFromCart, checkout, activeTab, setActiveTab, products, user, signOut } = useApp();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItems = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item?.price || 0), 0);

  const handleCheckout = async () => {
    const res = await checkout();
    if (res.success) {
      alert('Purchase successful! Account credentials are now available in your Dashboard.');
      setCartOpen(false);
      setActiveTab('dashboard');
    } else {
      alert(`Checkout failed: ${res.error}`);
    }
  };

  const navLinks = [
    { id: 'catalog', label: 'Marketplace', icon: <Database size={16} /> },
    { id: 'generator', label: 'Account Finder', icon: <Cpu size={16} /> },
    { id: 'dashboard', label: 'My Accounts', icon: <LayoutDashboard size={16} /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={16} /> },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer select-none group"
        onClick={() => setActiveTab('catalog')}
      >
        <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition duration-300">
          <ShieldCheck className="text-cyan-400 w-5 h-5 group-hover:rotate-6 transition-transform" />
        </div>
        <span className="font-mono font-bold text-lg tracking-wider text-slate-100 uppercase">
          Paid<span className="text-cyan-400">Log</span>Store
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition duration-200 ${
              activeTab === link.id
                ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
            }`}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-4 relative">
        {/* User Auth Badge */}
        {user ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <User size={13} className="text-cyan-400" />
            <span className="max-w-[80px] truncate">{user.email?.split('@')[0]}</span>
            <button
              onClick={signOut}
              title="Sign Out"
              className="ml-1 text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          isSupabaseConfigured() && (
            <button
              onClick={() => setActiveTab('wallet')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-mono font-semibold transition cursor-pointer"
            >
              <User size={13} /> Sign In
            </button>
          )
        )}

        {/* Wallet Balance */}
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition duration-300 group cursor-pointer"
        >
          <Wallet size={15} className="text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-slate-400 font-mono">Credits</span>
          <span className="text-sm font-semibold text-purple-300 font-mono">
            ${walletBalance.toFixed(2)}
          </span>
        </button>

        {/* Cart */}
        <div className="relative">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className={`p-2 rounded-lg border transition duration-300 relative cursor-pointer ${
              cart.length > 0
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
                <span className="text-sm font-semibold text-slate-200">Shopping Cart</span>
                <span className="text-xs text-slate-400">{cart.length} item(s)</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Your cart is empty.
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800/50">
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-200 truncate">{item?.title}</p>
                          <p className="text-[10px] text-cyan-400 font-mono">${item?.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => item && removeFromCart(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 hover:bg-slate-800 rounded transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Total:</span>
                      <span className="text-cyan-400 font-mono">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer"
                    >
                      Purchase Now <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
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
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                activeTab === link.id
                  ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
