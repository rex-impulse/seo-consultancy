'use client';

import { useState } from 'react';

export default function VisibilityCheck() {
  const [business, setBusiness] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ mentioned: boolean; message: string } | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!business.trim() || !city.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/visibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: business.trim(), city: city.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ mentioned: false, message: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleCheck} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Your business name"
            className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-neutral-600 placeholder:text-neutral-600"
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="sm:w-36 bg-neutral-900 border border-neutral-800 text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-neutral-600 placeholder:text-neutral-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !business.trim() || !city.trim()}
          className="w-full bg-white text-black text-sm font-medium py-3 rounded-md hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Check AI Visibility'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md border text-sm ${
          result.mentioned 
            ? 'border-emerald-800 bg-emerald-950/50 text-emerald-300' 
            : 'border-red-900 bg-red-950/50 text-red-300'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-lg mt-px">{result.mentioned ? '✓' : '✗'}</span>
            <p>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
