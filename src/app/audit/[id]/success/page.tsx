'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/audit/${id}/status`)
      .then(r => r.json())
      .then(setAudit)
      .catch(() => {});
  }, [id]);

  const email = audit?.email || '';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto h-12 flex items-center justify-between px-6">
          <a href="/" className="text-sm font-semibold text-gray-900">Impulse Studios</a>
          <span className="text-[11px] text-gray-400">SEO Audit</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-16 pb-24">
        {/* Checkmark */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-5">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900">Your Full Report is On Its Way</h1>
          
          {email && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 inline-block">
              <p className="text-[13px] text-gray-500">We're sending it to</p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">{email}</p>
            </div>
          )}

          <p className="text-[14px] text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
            Your complete 20-page SEO audit report with step-by-step fixes, code examples, and your 90-day action plan will arrive as a PDF attachment within the next few minutes.
          </p>
          <p className="text-[12px] text-gray-400 mt-2">
            Check your spam folder if you don't see it shortly.
          </p>
        </div>

        {/* View online */}
        <div className="mt-8 text-center">
          <a
            href={`/audit/${id}`}
            className="inline-block bg-gray-900 text-white font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors"
          >
            View Your Report Online
          </a>
        </div>

        {/* Implementation help */}
        <div className="mt-10 border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-900">Need help implementing the fixes?</h2>
          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
            Our team can handle every recommendation in your report — from technical SEO fixes to content rewrites to schema markup. Implementation packages start at <strong className="text-gray-900">$199</strong>.
          </p>
          <p className="text-[13px] text-gray-900 font-medium mt-3">
            Just reply to the report email and we'll send you a free quote.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
