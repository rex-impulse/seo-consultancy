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

  function handleUrlSubmit() {
    if (url && isValidUrl(url)) {
      setShowEmail(true);
      setError('');
    } else if (url) {
      setError('Enter a valid URL (e.g. yoursite.com)');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(url)) { setError('Enter a valid URL'); return; }
    if (!email || !email.includes('@')) { setError('Enter a valid email'); return; }

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
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlSubmit}
          placeholder="yourwebsite.com"
          className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-neutral-600 placeholder:text-neutral-600"
        />
        {!showEmail && (
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-white text-black text-sm font-medium px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            Audit My Site →
          </button>
        )}
      </div>

      {showEmail && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-neutral-600 placeholder:text-neutral-600"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black text-sm font-medium px-6 py-3 rounded-md hover:bg-neutral-200 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {loading ? 'Starting...' : 'Get Free Audit →'}
          </button>
        </div>
      )}

      {showEmail && (
        <p className="text-[10px] text-neutral-700 text-center">
          We&apos;ll send your report here. No spam.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </form>
  );
}
