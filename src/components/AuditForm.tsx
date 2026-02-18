'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function isValidUrl(str: string): boolean {
    try {
      let u = str;
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      const parsed = new URL(u);
      return !!parsed.hostname && parsed.hostname.includes('.');
    } catch {
      return false;
    }
  }

  function handleUrlBlur() {
    if (url && isValidUrl(url)) {
      setShowEmail(true);
      setError('');
    } else if (url) {
      setError('Please enter a valid website URL (e.g., www.yoursite.com)');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(url)) {
      setError('Please enter a valid website URL');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      router.push(`/audit/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-xl p-2 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="Enter your website URL..."
            className="flex-1 text-gray-900 text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
          />
          {!showEmail && (
            <button
              type="button"
              onClick={handleUrlBlur}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Get Free Audit →
            </button>
          )}
        </div>

        {showEmail && (
          <div className="mt-2 flex flex-col sm:flex-row gap-2 animate-[fadeIn_0.3s_ease-out]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 text-gray-900 text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Get Free Audit →'
              )}
            </button>
          </div>
        )}
      </div>

      {showEmail && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          🔒 No spam. We&apos;ll only send your report.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400 mt-3 text-center">{error}</p>
      )}
    </form>
  );
}
