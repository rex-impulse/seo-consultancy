'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function severityColor(sev: string): string {
  if (sev === 'critical') return 'bg-red-50 text-red-700 border border-red-200';
  if (sev === 'high') return 'bg-orange-50 text-orange-700 border border-orange-200';
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

export default function AuditPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [simProgress, setSimProgress] = useState(0);
  const [showTeaser, setShowTeaser] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!id) return;
    let triggered = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/${id}/status`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setAudit(data);
        if (data.status === 'error') {
          setError(data.error_message || 'An error occurred during analysis');
        }
        // If already complete on first load, skip animation
        if (firstLoad.current && (data.status === 'complete' || data.status === 'teaser_ready' || data.status === 'paid')) {
          setShowTeaser(true);
          setSimProgress(100);
          setSimStep(STEPS.length - 1);
        }
        firstLoad.current = false;
        if (data.status === 'queued' && !triggered) {
          triggered = true;
          fetch(`/api/audit/${id}/run`, { method: 'POST' }).catch(() => {});
        }
      } catch {
        setError('Audit not found');
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [id]);

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

  useEffect(() => {
    if (firstLoad.current) return; // Don't animate if already handled
    if (audit && (audit.status === 'complete' || audit.status === 'teaser_ready' || audit.status === 'paid')) {
      setTimeout(() => {
        setSimProgress(100);
        setSimStep(STEPS.length - 1);
        setTimeout(() => setShowTeaser(true), 800);
      }, 1500);
    }
  }, [audit]);

  const handleSaveEmail = useCallback(async () => {
    if (!email || !email.includes('@')) return;
    try {
      await fetch(`/api/audit/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEmailSaved(true);
    } catch {}
  }, [id, email]);

  const handleUnlock = useCallback(async () => {
    if (email && email.includes('@') && !emailSaved) {
      await handleSaveEmail();
    }
    try {
      const res = await fetch(`/api/audit/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else alert(data.error || 'Payment not available yet');
    } catch { alert('Error initiating payment'); }
  }, [id, email, emailSaved, handleSaveEmail]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-red-600 text-sm">{error}</p>
          <a href="/" className="text-gray-400 text-xs mt-4 inline-block hover:text-gray-900 transition-colors">Back</a>
        </div>
      </div>
    );
  }

  const teaser = audit?.teaser_data;
  const grade = teaser?.overallGrade || audit?.overall_grade || '?';
  const score = teaser?.overallScore ?? audit?.overall_score ?? 0;
  const topIssues = teaser?.topIssues || [];
  
  const categories = [
    { label: 'AI Readiness', score: teaser?.categories?.geo?.score ?? audit?.geo_score ?? 0 },
    { label: 'Technical', score: teaser?.categories?.technical?.score ?? audit?.technical_score ?? 0 },
    { label: 'Content', score: teaser?.categories?.content?.score ?? audit?.content_score ?? 0 },
    { label: 'Visibility', score: teaser?.categories?.visibility?.score ?? audit?.visibility_score ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto h-12 flex items-center justify-between px-6">
          <a href="/" className="text-sm font-semibold text-gray-900">Impulse Studios</a>
          <span className="text-[11px] text-gray-400">SEO Audit</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {!showTeaser ? (
          /* === Progress === */
          <div className="pt-20 text-center">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Analyzing</p>
            <h1 className="text-base font-semibold mt-1.5 text-gray-900 truncate">{audit?.url || '...'}</h1>

            <div className="mt-10 max-w-sm mx-auto">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-1 bg-gray-900 rounded-full transition-all duration-300" style={{ width: `${simProgress}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">{simProgress}%</p>
            </div>

            <div className="mt-8 text-left max-w-sm mx-auto space-y-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3 text-[13px]">
                  {i < simStep ? (
                    <span className="text-gray-300">&#10003;</span>
                  ) : i === simStep ? (
                    <span className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                  )}
                  <span className={i < simStep ? 'text-gray-300' : i === simStep ? 'text-gray-900' : 'text-gray-200'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* === Teaser Report === */
          <div className="pt-10">
            {/* URL + Score header */}
            <div className="text-center pb-8 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">Audit Report</p>
              <h1 className="text-base font-semibold mt-1 text-gray-900">{audit?.url}</h1>
              <div className="mt-6 inline-flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">{score}</span>
                <span className="text-lg text-gray-400">/100</span>
              </div>
            </div>

            {/* Score bars */}
            <div className="py-6 border-b border-gray-100 space-y-3">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-4">
                  <span className="text-[13px] text-gray-500 w-24 shrink-0">{cat.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full ${scoreBarColor(cat.score)}`} style={{ width: `${cat.score}%` }} />
                  </div>
                  <span className="text-[13px] font-medium text-gray-900 w-8 text-right">{cat.score}</span>
                </div>
              ))}
            </div>

            {/* Issues */}
            {topIssues.length > 0 && (
              <div className="py-6 border-b border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-4">Issues Found</p>
                <div className="space-y-3">
                  {topIssues.slice(0, 5).map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${severityColor(issue.severity)}`}>
                        {issue.severity === 'critical' ? 'CRIT' : issue.severity === 'high' ? 'HIGH' : 'MED'}
                      </span>
                      <div>
                        <p className="text-[13px] text-gray-900 font-medium leading-snug">{issue.title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{issue.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teaser PDF Preview */}
            <div className="py-6 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-4">Preview Report</p>
              <div className="w-full rounded-md overflow-hidden border border-gray-200" style={{ height: '600px' }}>
                <iframe
                  src={`/api/audit/${id}/pdf?type=teaser`}
                  className="w-full h-full"
                  title="Teaser Report Preview"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2 text-center">Scroll to preview. Unlock the full 20-page report below.</p>
            </div>

            {/* What's in the full report */}
            <div className="py-6 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-4">Full Report Includes</p>
              <div className="space-y-1.5">
                {[
                  `${teaser?.stats?.quickWins || 5} quick wins you can fix this week`,
                  'AI search deep dive - why ChatGPT skips your site',
                  `${teaser?.stats?.totalIssues || 15}+ technical issues with code fixes`,
                  'Page-by-page content audit with rewritten copy',
                  'Competitor comparison - head-to-head with top 5',
                  '90-day action plan with priority matrix',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <span className="w-1 h-1 bg-gray-300 rounded-full shrink-0" />
                    <span className="text-[13px] text-gray-500">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Email + CTA */}
            <div className="pt-8 text-center">
              {!audit?.email && !emailSaved ? (
                <div className="mb-6 max-w-sm mx-auto">
                  <p className="text-[12px] text-gray-400 mb-2">Get the free preview emailed to you</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="flex-1 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:text-gray-300"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="text-gray-500 text-sm font-medium px-4 py-2.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-emerald-600 mb-6">Preview report sent to your email</p>
              )}

              <button
                onClick={handleUnlock}
                className="w-full max-w-sm bg-gray-900 text-white text-sm font-semibold py-3.5 rounded-md hover:bg-gray-800 transition-colors"
              >
                Unlock Full Report - $29
              </button>
              <p className="text-[11px] text-gray-400 mt-3">One-time payment. Instant PDF delivery. No subscription.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
