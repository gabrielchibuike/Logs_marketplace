import React from 'react';
import { Info, Globe, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950/80 border-t border-slate-900 px-6 py-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 glass">
      <div className="flex flex-col items-center md:items-start gap-1">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
          Paid<span className="text-cyan-500">Log</span>Store // Marketplace v2.0
        </span>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} PaidLogStore. Premium social media accounts marketplace.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono select-none">
          <Activity size={12} className="text-emerald-500 animate-pulse-slow" />
          Response: <span className="text-emerald-400">12ms</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Status: <span className="text-emerald-400">Online</span>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-4">
        <a href="#" className="text-slate-500 hover:text-cyan-400 transition duration-200" title="Support">
          <Info size={16} />
        </a>
        <a href="#" className="text-slate-500 hover:text-cyan-400 transition duration-200" title="Status Page">
          <Globe size={16} />
        </a>
      </div>
    </footer>
  );
};
