import React, { useState, useEffect } from 'react';
import { Search, Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, subtitle, lastUpdated, sections }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  // Handle click on sidebar links to smooth scroll
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  // Setup intersection observer to highlight active section on scroll
  useEffect(() => {
    const observers = sections.map((sec) => {
      const el = document.getElementById(sec.id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sec.id);
          }
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );

      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [sections]);

  // Helper function to check if query matches content recursively
  const contentMatchesQuery = (node: React.ReactNode, query: string): boolean => {
    if (!node) return false;
    if (typeof node === 'string' || typeof node === 'number') {
      return node.toString().toLowerCase().includes(query);
    }
    if (Array.isArray(node)) {
      return node.some(child => contentMatchesQuery(child, query));
    }
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
      return contentMatchesQuery(element.props.children, query);
    }
    return false;
  };

  // Filter sections by search query
  const query = searchQuery.toLowerCase().trim();
  const filteredSections = sections.filter((sec) => {
    if (!query) return true;
    return (
      sec.title.toLowerCase().includes(query) ||
      contentMatchesQuery(sec.content, query)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-8 animate-fade-in text-left">
      {/* Back Button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-red transition mb-3">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-navy uppercase font-sans">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-brand-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-[10px] font-mono bg-brand-navy/5 text-brand-muted px-2.5 py-1 rounded border border-brand-border">
            Last Updated: {lastUpdated}
          </span>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-brand-card hover:bg-brand-navy/5 text-brand-navy border border-brand-border px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search bar inside sidebar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-brand-muted w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded bg-brand-card border border-brand-border text-brand-navy focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition"
            />
          </div>

          <div className="sticky top-24 hidden lg:block bg-brand-card border border-brand-border rounded p-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted font-sans border-b border-brand-border pb-2">Table of Contents</h4>
            <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto scrollbar-thin">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollTo(sec.id)}
                  className={`text-left text-xs py-2 px-3 rounded font-bold transition duration-200 border-l-2 ${
                    activeSection === sec.id
                      ? 'bg-brand-navy/5 text-brand-red border-brand-red'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5 border-transparent'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-brand-card border border-brand-border rounded-md p-6 md:p-8 space-y-12">
          {filteredSections.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-brand-navy">No matching sections found</p>
              <p className="text-xs text-brand-muted mt-1">Try searching for a different term.</p>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-28 space-y-4">
                <h2 className="text-base font-extrabold tracking-tight text-brand-navy font-sans uppercase border-b border-brand-border pb-2">
                  {sec.title}
                </h2>
                <div className="text-xs text-brand-muted leading-relaxed space-y-4 font-sans text-justify">
                  {sec.content}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
