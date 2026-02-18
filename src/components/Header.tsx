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
      className={`fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-200 ${
        scrolled ? 'bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-900' : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-6">
        <a href="/" className="text-sm font-semibold text-white tracking-tight">
          Impulse Studios
        </a>

        <nav className="hidden md:flex items-center gap-6 text-xs text-neutral-500">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a
            href="#hero"
            className="border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Get Audit
          </a>
        </nav>

        <button
          className="md:hidden text-neutral-500 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-900 px-6 py-4 space-y-3">
          <a href="#how-it-works" className="block text-neutral-500 hover:text-white text-xs">How It Works</a>
          <a href="#pricing" className="block text-neutral-500 hover:text-white text-xs">Pricing</a>
          <a href="#faq" className="block text-neutral-500 hover:text-white text-xs">FAQ</a>
        </div>
      )}
    </header>
  );
}
