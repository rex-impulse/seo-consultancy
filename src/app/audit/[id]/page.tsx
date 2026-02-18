'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

const STEPS = [
  'Connecting to website',
  'Crawling pages',
  'Checking robots.txt & sitemap',
  'Running PageSpeed analysis',
  'Analyzing AI search readiness',
  'Scoring & generating report',
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
  onpage_score: number | null;
  error_message: string | null;
};

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-400';
  if (grade.startsWith('B')) return 'text-blue-400';
  if (grade.startsWith('C')) return 'text-yellow-400';
  if (grade.startsWith('D')) return 'text-orange-400';
  return 'text-red-400';
}

function gradeBorder(grade: string): string {
  if (grade.startsWith('A')) return 'border-emerald-400';
  if (grade.startsWith('B')) return 'border-blue-400';
  if (grade.startsWith('C')) return 'border-yellow-400';
  if (grade.startsWith('D')) return 'border-orange-400';
  return 'border-red-400';
}

export default function AuditPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [simProgress, setSimProgress] = useState(0);
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
        if (data.status === 'error') {
          setError(data.error_message || 'An error occurred during analysis');
        }
      } catch {
        setError('Audit not found');
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Simulated progress
  useEffect(() => {
    if (showTeaser) return;
    const stepTimer = setInterval(() => {
      setSimStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 4000);
    const progressTimer = setInterval(() => {
      setSimProgress((p) => Math.min(p + 1, 92));
    }, 400);
    return () => { clearInterval(stepTimer); clearInterval(progressTimer); };
  }, [showTeaser]);

  // Transition to teaser
  useEffect(() => {
    if (audit && (audit.status === 'complete' || audit.status === 'teaser_ready' || audit.status === 'paid')) {
      setTimeout(() => {
        setSimProgress(100);
        setSimStep(STEPS.length - 1);
        setTimeout(() => setShowTeaser(true), 800);
      }, 1500);
    }
  }, [audit]);

  const handleUnlock = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else alert(data.error || 'Payment not available yet');
    } catch { alert('Error initiating payment'); }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-red-400 text-sm">{error}</p>
          <a href="/" className="text-neutral-500 text-xs mt-4 inline-block hover:text-white transition-colors">← Back</a>
        </div>
      </div>
    );
  }

  const teaser = audit?.teaser_data;
  const grade = teaser?.overallGrade || audit?.overall_grade || '?';
  const score = teaser?.overallScore ?? audit?.overall_score ?? 0;
  const topIssues = teaser?.topIssues || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="h-14 flex items-center px-6 border-b border-neutral-900">
        <a href="/" className="text-sm font-semibold tracking-tight">Impulse Studios</a>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {!showTeaser ? (
          /* === Progress === */
          <div className="pt-20 text-center">
            <p className="text-xs font-mono text-neutral-600 uppercase tracking-wider">Analyzing</p>
            <h1 className="text-lg font-semibold mt-2 truncate">{audit?.url || '...'}</h1>

            <div className="mt-10">
              <div className="flex justify-between text-[10px] text-neutral-600 font-mono mb-2">
                <span>progress</span>
                <span>{simProgress}%</span>
              </div>
              <div className="h-px bg-neutral-800 relative">
                <div className="h-px bg-white transition-all duration-300" style={{ width: `${simProgress}%` }} />
              </div>
            </div>

            <div className="mt-8 text-left space-y-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3 text-xs">
                  {i < simStep ? (
                    <span className="text-neutral-600">✓</span>
                  ) : i === simStep ? (
                    <span className="text-white animate-pulse">›</span>
                  ) : (
                    <span className="text-neutral-800">·</span>
                  )}
                  <span className={i < simStep ? 'text-neutral-600' : i === simStep ? 'text-white' : 'text-neutral-800'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* === Teaser Report === */
          <div className="pt-12">
            {/* PAGE 1: The Shock */}
            <div className="text-center mb-16">
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">AI Search Readiness Report</p>
              <p className="text-xs text-neutral-600 mt-1">{audit?.url}</p>

              {/* Grade */}
              <div className="mt-8">
                <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 ${gradeBorder(grade)}`}>
                  <span className={`text-4xl font-bold ${gradeColor(grade)}`}>{grade}</span>
                  <span className="text-[10px] text-neutral-600 font-mono">{score}/100</span>
                </div>
              </div>

              {/* Scary stat */}
              {topIssues[0] && (
                <div className="mt-8 max-w-md mx-auto">
                  <div className="border border-red-900/50 bg-red-950/20 rounded-md p-4 text-left">
                    <p className="text-xs text-red-400 font-mono uppercase tracking-wider">Critical Issue</p>
                    <p className="text-sm text-white mt-2 font-medium">{topIssues[0].title}</p>
                    <p className="text-xs text-neutral-500 mt-1">{topIssues[0].description}</p>
                  </div>
                </div>
              )}

              {/* Traffic loss estimate */}
              <div className="mt-6 text-xs text-neutral-600">
                Estimated potential improvement: <span className="text-white">{teaser?.stats?.estTrafficImpact || '+40%'} organic traffic</span>
              </div>
            </div>

            {/* PAGE 2: The Tease */}
            <div className="border-t border-neutral-900 pt-12">
              {/* Category scores */}
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-4">Category Scores</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                {[
                  { label: 'AI Readiness', score: teaser?.categories?.geo?.score ?? audit?.geo_score ?? 0, grade: teaser?.categories?.geo?.grade || '?' },
                  { label: 'Technical', score: teaser?.categories?.technical?.score ?? audit?.technical_score ?? 0, grade: teaser?.categories?.technical?.grade || '?' },
                  { label: 'Content', score: teaser?.categories?.content?.score ?? audit?.content_score ?? 0, grade: teaser?.categories?.content?.grade || '?' },
                  { label: 'Visibility', score: teaser?.categories?.visibility?.score ?? audit?.visibility_score ?? 0, grade: teaser?.categories?.visibility?.grade || '?' },
                ].map((cat) => (
                  <div key={cat.label} className="border border-neutral-900 rounded-md p-3 text-center">
                    <p className="text-[10px] text-neutral-600 font-mono">{cat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${gradeColor(cat.grade)}`}>{cat.grade}</p>
                    <p className="text-[10px] text-neutral-700 font-mono">{cat.score}/100</p>
                  </div>
                ))}
              </div>

              {/* Issues preview */}
              {topIssues.length > 1 && (
                <div className="space-y-2 mb-10">
                  <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Top Issues Found</p>
                  {topIssues.slice(0, 3).map((issue: any, i: number) => (
                    <div key={i} className="border border-neutral-900 rounded-md p-3 flex items-start gap-3">
                      <span className="text-xs">{issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡'}</span>
                      <div>
                        <p className="text-xs text-white font-medium">{issue.title}</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">{issue.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Locked sections */}
              <div className="space-y-2 mb-10">
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Full Report Contents</p>
                {[
                  { section: 'Quick Wins — fix this week', count: `${teaser?.stats?.quickWins || 5} items`, locked: false },
                  { section: 'AI Search: Why ChatGPT ignores you', count: 'Deep dive', locked: true },
                  { section: 'Technical: Speed & crawl issues', count: `${teaser?.stats?.totalIssues || 15}+ issues`, locked: true },
                  { section: 'Content: Thin & missing pages', count: 'Analysis', locked: true },
                  { section: 'Competitor comparison', count: 'Head-to-head', locked: true },
                  { section: 'Prioritized action plan', count: 'Full roadmap', locked: true },
                ].map((item) => (
                  <div key={item.section} className="flex justify-between items-center border border-neutral-900 rounded-md p-3">
                    <span className="text-xs text-neutral-400">{item.locked ? '🔒' : '✅'} {item.section}</span>
                    <span className="text-[10px] text-neutral-700 font-mono">{item.locked ? 'Locked' : item.count}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center border border-neutral-900 rounded-md p-8">
                <p className="text-sm font-semibold">This is just the preview.</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {teaser?.stats?.totalIssues || 15} issues found across 6 categories. Get specific fix instructions for each one.
                </p>
                <button
                  onClick={handleUnlock}
                  className="mt-6 w-full max-w-xs bg-white text-black text-sm font-medium py-3 rounded-md hover:bg-neutral-200 transition-colors"
                >
                  Unlock Full Report — $29
                </button>
                <p className="text-[10px] text-neutral-700 mt-2">100% money-back guarantee · Agency equivalent: $500+</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
