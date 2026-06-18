import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-card border-t border-brand-border text-left mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="N_Logs"
              className="h-20 w-auto object-contain rounded"
            />
          </Link>
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

        {/* Column 4: Contact Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy font-sans">Contact Support</h4>
          <p className="text-xs text-brand-muted leading-relaxed">
            Having an issue? Reach our team directly on any of our official channels.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <a
              href="https://t.me/+ifE4VByrdoE4Njlk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-3 rounded font-bold text-xs text-white transition duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#229ED9' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Join Telegram
            </a>
            <a
              href="https://chat.whatsapp.com/D61NcZ35srKKwGFVccqxbo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-3 rounded font-bold text-xs text-white transition duration-200 hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-brand-border bg-brand-bg/50 py-4 px-6 text-center text-[10px] text-brand-muted">
        © {new Date().getFullYear()} N_Logs. All rights reserved. Escrow protection is active on all Paystack transactions.
      </div>
    </footer>
  );
};
