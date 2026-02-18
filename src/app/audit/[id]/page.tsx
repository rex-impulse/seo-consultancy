'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

const STEPS = [
  'Connecting to your website...',
  'Analyzing technical health...',
  'Checking page speed & Core Web Vitals...',
  'Scanning AI search readiness...',
  'Evaluating content quality...',
  'Analyzing search visibility...',
  'Generating your report...',
];

const FUN_FACTS = [
  '💡 68% of all online experiences begin with a search engine.',
  '💡 53% of all website traffic comes from organic search.',
  '💡 75% of users never scroll past the first page of Google.',
  '💡 AI search engines are projected to handle 25% of queries by 2027.',
  '💡 Pages with Schema.org markup rank 4 positions higher on average.',
  '💡 40% of Gen Z uses AI over Google for search.',
  '💡 Mobile devices account for 60% of all Google searches.',
];

type AuditData = {
  id: string;
  url: string;
  email: string;
  status: string;
  progress: number;
  current_step: string;
  overall_score: number | null;
  overall_grade: string | null;
  teaser_data: any;
  paid: boolean;
  technical_score: number | null;
  visibility_score: number | null;
  geo_score: number | null;
  content_score: number | null;
};

function gradeColor(grade: string | null): string {
  if (!grade) return 'text-gray-400';
  if (grade.startsWith('A')) return 'text-emerald-500';
  if (grade.startsWith('B')) return 'text-blue-500';
  if (grade.startsWith('C')) return 'text-yellow-500';
  if (grade.startsWith('D')) return 'text-orange-500';
  return 'text-red-500';
}

function gradeBorder(grade: string | null): string {
  if (!grade) return 'border-gray-300';
  if (grade.startsWith('A')) return 'border-emerald-500';
  if (grade.startsWith('B')) return 'border-blue-500';
  if (grade.startsWith('C')) return 'border-yellow-500';
  if (grade.startsWith('D')) return 'border-orange-500';
  return 'border-red-500';
}

function scoreToGrade(score: number | null): string {
  if (score === null) return '?';
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

export default function AuditPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [simProgress, setSimProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [error, setError] = useState('');

  // Poll for status
  useEffect(() => {
    if (!id) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/${id}/status`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setAudit(data);
      } catch {
        setError('Audit not found');
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Simulated progress animation
  useEffect(() => {
    if (showTeaser) return;
    const stepTimer = setInterval(() => {
      setSimStep((s) => {
        if (s >= STEPS.length - 1) {
          clearInterval(stepTimer);
          return s;
        }
        return s + 1;
      });
    }, 3000);

    const progressTimer = setInterval(() => {
      setSimProgress((p) => Math.min(p + 2, 95));
    }, 600);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [showTeaser]);

  // Fun fact rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((i) => (i + 1) % FUN_FACTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Check if teaser is ready
  useEffect(() => {
    if (audit && (audit.status === 'teaser_ready' || audit.status === 'complete' || audit.status === 'paid')) {
      setTimeout(() => {
        setSimProgress(100);
        setSimStep(STEPS.length - 1);
        setTimeout(() => setShowTeaser(true), 1000);
      }, 2000);
    }
  }, [audit]);

  const handleUnlock = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || 'Payment not available yet');
      }
    } catch {
      alert('Error initiating payment');
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <a href="/" className="text-emerald-400 text-sm mt-4 inline-block hover:underline">← Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="h-16 flex items-center px-6">
        <a href="/" className="text-white font-semibold text-xl">
          Rank<span className="text-emerald-400">Sight</span>
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {!showTeaser ? (
          /* Progress View */
          <div className="pt-16 text-center">
            <h1 className="text-2xl font-bold text-white">
              Auditing: {audit?.url || '...'}
            </h1>

            {/* Progress bar */}
            <div className="mt-10">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span className="text-white font-bold">{simProgress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="mt-10 text-left space-y-3">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  {i < simStep ? (
                    <span className="text-emerald-500 text-sm">✓</span>
                  ) : i === simStep ? (
                    <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-gray-700 text-sm">○</span>
                  )}
                  <span
                    className={`text-sm ${
                      i < simStep
                        ? 'text-gray-500'
                        : i === simStep
                        ? 'text-emerald-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {step}
                  </span>
                  {i < simStep && <span className="text-xs text-gray-600 ml-auto">Complete</span>}
                  {i === simStep && <span className="text-xs text-emerald-400 ml-auto">In Progress</span>}
                </div>
              ))}
            </div>

            {/* Fun fact */}
            <div className="mt-12 text-sm text-gray-500 italic min-h-[2rem] transition-all">
              {FUN_FACTS[factIndex]}
            </div>

            {audit?.email && (
              <p className="mt-6 text-xs text-gray-600">
                📧 We&apos;ll also send results to your email
              </p>
            )}
          </div>
        ) : (
          /* Teaser View */
          <div className="pt-8">
            {/* Grade Badge */}
            <div className="text-center mb-10">
              <div
                className={`inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 ${gradeBorder(
                  audit?.overall_grade || scoreToGrade(audit?.overall_score ?? null)
                )}`}
              >
                <span className={`text-4xl font-bold ${gradeColor(audit?.overall_grade || scoreToGrade(audit?.overall_score ?? null))}`}>
                  {audit?.overall_grade || scoreToGrade(audit?.overall_score ?? null) || 'D+'}
                </span>
                <span className="text-gray-400 text-sm">{audit?.overall_score ?? 42}/100</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">Your SEO & GEO Score</h2>
              <p className="text-gray-400 text-sm mt-1">{audit?.url}</p>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Technical', score: audit?.technical_score ?? 65, grade: 'C' },
                { label: 'Visibility', score: audit?.visibility_score ?? 38, grade: 'D' },
                { label: 'AI Readiness', score: audit?.geo_score ?? 12, grade: 'F' },
                { label: 'Content', score: audit?.content_score ?? 55, grade: 'C-' },
              ].map((cat) => (
                <div key={cat.label} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500">{cat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${gradeColor(cat.grade)}`}>{cat.grade}</p>
                  <p className="text-xs text-gray-600 mt-1">{cat.score}/100</p>
                </div>
              ))}
            </div>

            {/* Top 3 Issues */}
            <div className="space-y-3 mb-10">
              <h3 className="text-lg font-semibold text-white">🏆 Top 3 Issues Found</h3>
              {[
                { severity: '🔴', label: 'Critical', title: 'Your robots.txt blocks AI crawlers', desc: 'ChatGPT, Perplexity, and Claude cannot access your site. You\'re invisible to 40M+ daily AI searches.' },
                { severity: '🟠', label: 'High', title: 'Page load time is too slow', desc: 'Your site takes over 5 seconds to load. Google recommends under 2.5 seconds.' },
                { severity: '🟡', label: 'Medium', title: 'Multiple pages missing meta descriptions', desc: 'Search engines are writing your page descriptions for you — often poorly.' },
              ].map((issue, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{issue.severity}</span>
                    <span className="text-xs text-gray-500">{issue.label}</span>
                  </div>
                  <p className="text-white font-medium text-sm">{issue.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{issue.desc}</p>
                </div>
              ))}
            </div>

            {/* Full Report TOC */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Full Report Contents</h3>
              <div className="space-y-2 text-sm">
                {[
                  { section: 'Executive Summary', status: '✅ Preview above' },
                  { section: 'Technical Health (14 issues)', status: '🔒 Locked' },
                  { section: 'Search Visibility Analysis', status: '🔒 Locked' },
                  { section: 'AI Search Readiness Deep-Dive', status: '🔒 Locked' },
                  { section: 'Content Quality Analysis', status: '🔒 Locked' },
                  { section: 'Competitor Comparison', status: '🔒 Locked' },
                  { section: 'Prioritized Action Plan', status: '🔒 Locked' },
                ].map((item) => (
                  <div key={item.section} className="flex justify-between">
                    <span className="text-gray-300">{item.section}</span>
                    <span className="text-gray-500 text-xs">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-white text-lg font-semibold mb-2">This is just the preview.</p>
              <p className="text-gray-400 text-sm mb-6">
                Your full report covers 47 issues across 6 categories with specific fix instructions.
              </p>
              <button
                onClick={handleUnlock}
                className="w-full max-w-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg py-4 rounded-lg transition-colors"
              >
                Unlock Full Report — $29
              </button>
              <p className="text-xs text-gray-500 mt-3">💰 100% money-back guarantee</p>
              <p className="text-xs text-gray-600 mt-1">Your results are saved for 14 days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
