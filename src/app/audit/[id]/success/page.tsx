'use client';

import { useParams } from 'next/navigation';

export default function SuccessPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="h-16 flex items-center px-6">
        <a href="/" className="text-white font-semibold text-xl">
          Rank<span className="text-emerald-400">Sight</span>
        </a>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-16 pb-24 text-center">
        {/* Checkmark */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white">Payment Confirmed!</h1>
        <p className="text-gray-400 text-lg mt-3">
          Your full report is being prepared and will be delivered to your email shortly.
        </p>

        <div className="mt-10 bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-left">
          <h2 className="text-white font-semibold mb-4">What to do next:</h2>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">1.</span>
              Read the Executive Summary for the big picture
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">2.</span>
              Jump to the Action Plan for prioritized fixes
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">3.</span>
              Start with Quick Wins — they take less than 30 minutes each
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold">4.</span>
              Need help implementing? Reply to the report email for a free quote
            </li>
          </ol>
        </div>

        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-left">
          <h3 className="text-emerald-400 font-semibold">🚀 Want us to do it for you?</h3>
          <p className="text-gray-400 text-sm mt-2">
            Our team can implement every fix in your report. Quick Win packages start at $299.
            Reply to your report email for a free implementation quote.
          </p>
        </div>

        <a
          href="/"
          className="inline-block mt-8 text-emerald-400 text-sm hover:underline"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}
