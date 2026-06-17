import React, { useState } from 'react';
import { Terminal, Copy, Check, Download } from 'lucide-react';

interface LogTerminalProps {
  title: string;
  content: string;
  maxHeight?: string;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ title, content, maxHeight = 'max-h-96' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.log';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper to highlight log entries
  const highlightLine = (line: string, index: number) => {
    if (!line.trim()) return <div key={index} className="h-4"></div>;

    // Detect status codes / errors
    const isError = /ERROR|FATAL| 5\d{2} | 4\d{2} |" 40[0-9]|" 50[0-9]|Forbidden|Unauthorized|Failure/.test(line);
    const isWarning = /WARN| 3\d{2} |" 30[0-9]/.test(line);
    const isSuccess = /INFO|SUCCESS| 2\d{2} |" 20[0-9]|Success/.test(line);

    let textColor = 'text-slate-200 dark:text-slate-800';
    if (isError) {
      textColor = 'text-rose-400 dark:text-rose-700 font-semibold bg-rose-950/20 dark:bg-rose-50 px-1 rounded';
    } else if (isWarning) {
      textColor = 'text-amber-400 dark:text-amber-700 bg-amber-950/10 dark:bg-amber-50 px-1 rounded';
    } else if (isSuccess) {
      textColor = 'text-emerald-400 dark:text-emerald-600';
    }

    // Try to style brackets or timestamps if JSON
    if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
      try {
        // Highlight JSON keywords simply
        return (
          <div key={index} className={`${textColor} font-mono text-sm leading-relaxed whitespace-pre-wrap break-all hover:bg-brand-navy-light/40 py-0.5`}>
            {line}
          </div>
        );
      } catch (e) {
        // Fallback
      }
    }

    return (
      <div key={index} className={`${textColor} font-mono text-xs leading-relaxed whitespace-pre-wrap break-all hover:bg-brand-navy-light/40 py-0.5`}>
        {line}
      </div>
    );
  };

  const lines = content.split('\n');

  return (
    <div className="w-full rounded-md border border-brand-navy-light bg-brand-navy shadow-sm overflow-hidden flex flex-col font-mono">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-navy-light border-b border-brand-navy">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-slate-300 dark:text-gray-800 ml-2 flex items-center gap-1.5 select-none">
            <Terminal size={12} className="text-brand-red" />
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-800 hover:bg-brand-navy rounded transition duration-200 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400 dark:text-emerald-600" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDownload}
            title="Download log file"
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-800 hover:bg-brand-navy rounded transition duration-200 cursor-pointer"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Console Output */}
      <div className={`p-4 overflow-y-auto ${maxHeight} text-left flex flex-col scrollbar-thin scrollbar-thumb-brand-navy-light scrollbar-track-transparent bg-brand-navy`}>
        {lines.map((line, idx) => highlightLine(line, idx))}
      </div>
    </div>
  );
};
