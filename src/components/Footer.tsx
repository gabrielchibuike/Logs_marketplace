import React from 'react';
import { ShieldCheck, Mail, Info, Globe, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-card border-t border-brand-border text-left mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-brand-navy/5 border border-brand-border text-brand-navy">
              <ShieldCheck className="text-brand-red w-4 h-4" />
            </div>
            <span className="font-sans font-extrabold text-sm tracking-wider text-brand-navy uppercase">
              Paid<span className="text-brand-red">Log</span>Store
            </span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Premium social media account acquisition protocol. Verified metrics, escrow-backed checkout, and automated handover.
          </p>
          <div className="text-xs text-brand-muted font-mono pt-1">
            Marketplace v2.1.0
          </div>
        </div>

        {/* Column 2: Platform Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="text-brand-muted hover:text-brand-red transition">Home</Link>
            </li>
            <li>
              <Link to="/marketplace" className="text-brand-muted hover:text-brand-red transition">Marketplace</Link>
            </li>
            <li>
              <Link to="/generator" className="text-brand-muted hover:text-brand-red transition">Account Finder</Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-brand-muted hover:text-brand-red transition">My Accounts</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">Legal & Policies</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#" className="text-brand-muted hover:text-brand-red transition">Terms of Service</a>
            </li>
            <li>
              <a href="#" className="text-brand-muted hover:text-brand-red transition">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="text-brand-muted hover:text-brand-red transition">Buyer Escrow Rules</a>
            </li>
            <li>
              <a href="#" className="text-brand-muted hover:text-brand-red transition">Dispute Resolution</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Status & Help */}
        {/* <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">Platform Health</h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-brand-muted font-mono bg-brand-bg border border-brand-border p-2 rounded">
              <Activity size={12} className="text-emerald-500" />
              Verifying: <span className="text-emerald-600 font-bold">OK (12ms)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted font-mono bg-brand-bg border border-brand-border p-2 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Escrow Nodes: <span className="text-emerald-600 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-muted pt-1">
              <Mail size={12} className="text-brand-navy" />
              <span>support@paidlogstore.com</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-brand-border bg-brand-bg/50 py-4 px-6 text-center text-[10px] text-brand-muted">
        © {new Date().getFullYear()} PaidLogStore. All rights reserved. Escrow protection is active on all Paystack transactions.
      </div>
    </footer>
  );
};
