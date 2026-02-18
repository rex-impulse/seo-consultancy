'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
        <a href="/" className="text-white font-semibold text-xl tracking-tight">
          Rank<span className="text-emerald-400">Sight</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a
            href="#hero"
            className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Get Free Audit
          </a>
        </nav>

        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4 space-y-3">
          <a href="#how-it-works" className="block text-gray-400 hover:text-white text-sm">How It Works</a>
          <a href="#pricing" className="block text-gray-400 hover:text-white text-sm">Pricing</a>
          <a href="#faq" className="block text-gray-400 hover:text-white text-sm">FAQ</a>
          <a
            href="#hero"
            className="block text-center border border-emerald-500 text-emerald-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            Get Free Audit
          </a>
        </div>
      )}
    </header>
  );
}
