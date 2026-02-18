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
  if (grade.startsWith('A')) return 'text-emerald-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-amber-600';
  if (grade.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}

function gradeColorBg(grade: string): string {
  if (grade.startsWith('A')) return 'bg-emerald-50 border-emerald-200';
  if (grade.startsWith('B')) return 'bg-blue-50 border-blue-200';
  if (grade.startsWith('C')) return 'bg-amber-50 border-amber-200';
  if (grade.startsWith('D')) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

function severityColor(sev: string): string {
  if (sev === 'critical') return 'bg-red-100 text-red-700 border-red-200';
  if (sev === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-14 flex items-center justify-between px-6">
          <a href="/" className="text-sm font-semibold tracking-tight text-gray-900">Impulse Studios</a>
          <span className="text-xs text-gray-400">SEO Audit Report</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {!showTeaser ? (
          /* === Progress === */
          <div className="pt-20 text-center">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Analyzing</p>
            <h1 className="text-lg font-semibold mt-2 text-gray-900 truncate">{audit?.url || '...'}</h1>

            <div className="mt-10 max-w-md mx-auto">
              <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                <span>Progress</span>
                <span>{simProgress}%</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-1 bg-gray-900 rounded-full transition-all duration-300" style={{ width: `${simProgress}%` }} />
              </div>
            </div>

            <div className="mt-8 text-left max-w-md mx-auto space-y-2.5">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3 text-sm">
                  {i < simStep ? (
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">&#10003;</span>
                  ) : i === simStep ? (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-gray-200" />
                  )}
                  <span className={i < simStep ? 'text-gray-400' : i === simStep ? 'text-gray-900 font-medium' : 'text-gray-300'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* === Teaser Report === */
          <div className="pt-8">
            {/* Grade Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Search Readiness Report</p>
              <p className="text-sm text-gray-500 mt-1">{audit?.url}</p>

              <div className="mt-6 mb-6">
                <div className={`inline-flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 ${gradeColorBg(grade)}`}>
                  <span className={`text-3xl font-bold ${gradeColor(grade)}`}>{grade}</span>
                  <span className="text-xs text-gray-500">{score}/100</span>
                </div>
              </div>

              {/* Category scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'AI Readiness', score: teaser?.categories?.geo?.score ?? audit?.geo_score ?? 0, grade: teaser?.categories?.geo?.grade || '?' },
                  { label: 'Technical', score: teaser?.categories?.technical?.score ?? audit?.technical_score ?? 0, grade: teaser?.categories?.technical?.grade || '?' },
                  { label: 'Content', score: teaser?.categories?.content?.score ?? audit?.content_score ?? 0, grade: teaser?.categories?.content?.grade || '?' },
                  { label: 'Visibility', score: teaser?.categories?.visibility?.score ?? audit?.visibility_score ?? 0, grade: teaser?.categories?.visibility?.grade || '?' },
                ].map((cat) => (
                  <div key={cat.label} className="bg-gray-50 rounded-md p-3 text-center">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{cat.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${gradeColor(cat.grade)}`}>{cat.grade}</p>
                    <p className="text-[10px] text-gray-400">{cat.score}/100</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Issue */}
            {topIssues[0] && (
              <div className="mt-4 bg-white rounded-lg border border-red-200 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">!</span>
                  <div>
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Critical Issue</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{topIssues[0].title}</p>
                    <p className="text-xs text-gray-500 mt-1">{topIssues[0].description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Issues */}
            {topIssues.length > 1 && (
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Issues Found</p>
                <div className="space-y-3">
                  {topIssues.slice(1, 4).map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityColor(issue.severity)}`}>
                        {issue.severity === 'critical' ? 'CRIT' : issue.severity === 'high' ? 'HIGH' : 'MED'}
                      </span>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{issue.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{issue.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Report Contents */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Full Report Includes</p>
              <div className="space-y-2">
                {[
                  { section: 'Quick Wins - fix this week', desc: `${teaser?.stats?.quickWins || 5} high-impact, low-effort changes`, locked: false },
                  { section: 'AI Search Deep Dive', desc: 'Why AI engines skip your site and how to fix it', locked: true },
                  { section: 'Technical Audit', desc: `${teaser?.stats?.totalIssues || 15}+ issues with code-level fixes`, locked: true },
                  { section: 'Content Analysis', desc: 'Page-by-page audit with rewritten copy', locked: true },
                  { section: 'Competitor Comparison', desc: 'Head-to-head breakdown with top 5 competitors', locked: true },
                  { section: '90-Day Action Plan', desc: 'Prioritized roadmap with expected impact', locked: true },
                ].map((item) => (
                  <div key={item.section} className={`flex items-center justify-between rounded-md p-3 ${item.locked ? 'bg-gray-50' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <div>
                      <p className={`text-sm font-medium ${item.locked ? 'text-gray-500' : 'text-gray-900'}`}>{item.section}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    {item.locked ? (
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">Locked</span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded">Free</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email + CTA */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-base font-semibold text-gray-900">Get the full picture.</h2>
              <p className="text-sm text-gray-500 mt-2">
                {teaser?.stats?.totalIssues || 15} issues found. The full report includes step-by-step fix instructions, ready-to-use code, and a prioritized action plan.
              </p>

              {!audit?.email && !emailSaved ? (
                <div className="mt-5 max-w-sm mx-auto">
                  <p className="text-xs text-gray-400 mb-2">Get the free preview emailed to you</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 mt-4 font-medium">Preview report sent to your email</p>
              )}

              <button
                onClick={handleUnlock}
                className="mt-6 w-full max-w-xs bg-gray-900 text-white text-sm font-semibold py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Unlock Full Report - $29
              </button>
              <p className="text-xs text-gray-400 mt-2">One-time payment. No subscription. Instant delivery.</p>
            </div>

            {/* Trust bar */}
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-gray-400">
              <span>20-page PDF report</span>
              <span>|</span>
              <span>Code examples included</span>
              <span>|</span>
              <span>Money-back guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
