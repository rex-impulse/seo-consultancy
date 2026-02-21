export interface TeaserData {
  url: string;
  date: string;
  overallScore: number;
  overallGrade: string;
  categories: {
    geo: { score: number; grade: string };
    technical: { score: number; grade: string };
    content: { score: number; grade: string };
    visibility: { score: number; grade: string };
    onpage?: { score: number; grade: string };
  };
  topIssues: {
    severity: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    impact: string;
  }[];
  stats: {
    totalIssues: number;
    pagesAnalyzed: number;
    quickWins: number;
    estTrafficLoss: string;
  };
  auditId: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#34d399';
  if (grade.startsWith('B')) return '#60a5fa';
  if (grade.startsWith('C')) return '#facc15';
  if (grade.startsWith('D')) return '#fb923c';
  return '#f87171';
}

function severityIcon(s: string): string {
  if (s === 'critical') return '🔴';
  if (s === 'high') return '🟠';
  return '🟡';
}

export function renderTeaserHtml(data: TeaserData): string {
  const gc = gradeColor(data.overallGrade);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Search Readiness Report — ${data.url}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #e5e5e5; background: #0a0a0a; line-height: 1.5; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #262626; padding-bottom: 16px; margin-bottom: 40px; }
  .brand { font-size: 13px; font-weight: 600; color: #fff; }
  .meta { font-size: 10px; color: #525252; text-align: right; letter-spacing: 0.1em; text-transform: uppercase; }

  /* Grade */
  .grade-wrap { text-align: center; margin: 40px 0; }
  .grade-circle { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 112px; height: 112px; border-radius: 50%; border: 2px solid ${gc}; }
  .grade-letter { font-size: 36px; font-weight: 700; color: ${gc}; }
  .grade-score { font-size: 10px; color: #525252; font-family: 'JetBrains Mono', monospace; }
  .url { font-size: 11px; color: #525252; margin-top: 8px; }

  /* Critical issue */
  .critical-box { border: 1px solid #451a1a; background: #1a0a0a; border-radius: 6px; padding: 16px; margin: 24px 0; }
  .critical-label { font-size: 10px; color: #f87171; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; }
  .critical-title { font-size: 14px; font-weight: 600; color: #fff; margin-top: 8px; }
  .critical-desc { font-size: 11px; color: #737373; margin-top: 4px; }

  /* Categories */
  .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 24px 0; }
  .cat-card { border: 1px solid #262626; border-radius: 6px; padding: 12px; text-align: center; }
  .cat-label { font-size: 9px; color: #525252; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
  .cat-grade { font-size: 20px; font-weight: 700; margin-top: 4px; }
  .cat-score { font-size: 9px; color: #404040; font-family: 'JetBrains Mono', monospace; }

  /* Issues */
  .issue { border: 1px solid #262626; border-radius: 6px; padding: 12px; margin: 8px 0; display: flex; gap: 10px; align-items: flex-start; }
  .issue-text { flex: 1; }
  .issue-title { font-size: 12px; font-weight: 500; color: #fff; }
  .issue-impact { font-size: 10px; color: #525252; margin-top: 2px; }

  /* Locked sections */
  .section-label { font-size: 10px; color: #525252; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; margin: 24px 0 12px; }
  .locked-row { display: flex; justify-content: space-between; align-items: center; border: 1px solid #262626; border-radius: 6px; padding: 12px; margin: 6px 0; }
  .locked-name { font-size: 12px; color: #a3a3a3; }
  .locked-badge { font-size: 9px; color: #404040; font-family: 'JetBrains Mono', monospace; }

  /* CTA */
  .cta { background: #171717; border: 1px solid #262626; border-radius: 8px; padding: 32px; text-align: center; margin: 32px 0; }
  .cta-title { font-size: 14px; font-weight: 600; color: #fff; }
  .cta-desc { font-size: 11px; color: #525252; margin-top: 8px; }
  .cta-btn { display: inline-block; background: #fff; color: #000; font-weight: 500; font-size: 13px; padding: 10px 32px; border-radius: 6px; margin-top: 16px; text-decoration: none; }
  .cta-sub { font-size: 9px; color: #404040; margin-top: 8px; }

  .footer { border-top: 1px solid #262626; padding-top: 12px; margin-top: 24px; font-size: 9px; color: #404040; text-align: center; }
</style>
</head>
<body>

<div class="page">
  <div class="header">
    <div class="brand">Impulse Studios</div>
    <div class="meta mono">AI Search Readiness Report<br>${data.date}</div>
  </div>

  <div class="grade-wrap">
    <div class="url">${data.url}</div>
    <div style="margin-top: 16px;">
      <div class="grade-circle">
        <div class="grade-letter">${data.overallGrade}</div>
        <div class="grade-score">${data.overallScore}/100</div>
      </div>
    </div>
  </div>

  ${data.topIssues[0] ? `
  <div class="critical-box">
    <div class="critical-label">${severityIcon(data.topIssues[0].severity)} Critical Issue</div>
    <div class="critical-title">${data.topIssues[0].title}</div>
    <div class="critical-desc">${data.topIssues[0].description}</div>
  </div>
  ` : ''}

  <div style="text-align: center; font-size: 11px; color: #525252; margin: 16px 0;">
    Estimated potential improvement: <span style="color: #fff;">${data.stats.estTrafficLoss} organic traffic</span>
  </div>

  <div class="cat-grid">
    ${Object.entries(data.categories).filter(([k]) => k !== 'onpage').map(([key, val]) => {
      const labels: Record<string, string> = { geo: 'AI Ready', technical: 'Technical', content: 'Content', visibility: 'Visibility' };
      return `<div class="cat-card">
        <div class="cat-label">${labels[key] || key}</div>
        <div class="cat-grade" style="color: ${gradeColor(val.grade)}">${val.grade}</div>
        <div class="cat-score">${val.score}/100</div>
      </div>`;
    }).join('')}
  </div>

  ${data.topIssues.length > 1 ? `
  <div class="section-label">Top Issues</div>
  ${data.topIssues.slice(0, 3).map(issue => `
    <div class="issue">
      <span>${severityIcon(issue.severity)}</span>
      <div class="issue-text">
        <div class="issue-title">${issue.title}</div>
        <div class="issue-impact">${issue.impact}</div>
      </div>
    </div>
  `).join('')}
  ` : ''}

  <div class="section-label">Full Report Contents</div>
  ${[
    { name: '✅ Quick Wins — fix this week', badge: `${data.stats.quickWins} items` },
    { name: '🔒 AI Search: Why ChatGPT ignores you', badge: 'Locked' },
    { name: '🔒 Technical: Speed & crawl issues', badge: 'Locked' },
    { name: '🔒 Content: Thin & missing pages', badge: 'Locked' },
    { name: '🔒 Competitor comparison', badge: 'Locked' },
    { name: '🔒 Prioritized action plan', badge: 'Locked' },
  ].map(r => `
    <div class="locked-row">
      <span class="locked-name">${r.name}</span>
      <span class="locked-badge">${r.badge}</span>
    </div>
  `).join('')}

  <div class="cta">
    <div class="cta-title">This is just the preview.</div>
    <div class="cta-desc">${data.stats.totalIssues} issues found. Get specific fix instructions for each one.</div>
    <a class="cta-btn" href="https://seo.impulsestudios.cc/audit/${data.auditId}">Unlock Full Report — $0.50</a>
    <div class="cta-sub">100% money-back guarantee · Agency equivalent: $500+</div>
  </div>

  <div class="footer">
    Impulse Studios · seo.impulsestudios.cc
  </div>
</div>

</body>
</html>`;
}
