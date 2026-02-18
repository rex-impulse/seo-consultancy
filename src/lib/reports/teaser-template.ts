export interface TeaserData {
  url: string;
  date: string;
  overallScore: number;
  overallGrade: string;
  categories: {
    technical: { score: number; grade: string };
    visibility: { score: number; grade: string };
    geo: { score: number; grade: string };
    content: { score: number; grade: string };
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
    estTrafficImpact: string;
  };
  auditId: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#10b981';
  if (grade.startsWith('B')) return '#3b82f6';
  if (grade.startsWith('C')) return '#eab308';
  if (grade.startsWith('D')) return '#f97316';
  return '#ef4444';
}

function severityIcon(s: string): string {
  if (s === 'critical') return '🔴';
  if (s === 'high') return '🟠';
  return '🟡';
}

function barWidth(score: number): string {
  return `${Math.max(score, 5)}%`;
}

export function renderTeaserHtml(data: TeaserData): string {
  const gc = gradeColor(data.overallGrade);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEO & GEO Audit Preview — ${data.url}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #374151; line-height: 1.6; background: white; }
  @page { size: A4; margin: 20mm 15mm; }
  .page { page-break-after: always; min-height: 100vh; padding: 40px; }
  .page:last-child { page-break-after: auto; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 32px; }
  .logo { font-size: 20px; font-weight: 700; color: #111827; }
  .logo span { color: #10b981; }
  .meta { font-size: 12px; color: #9ca3af; text-align: right; }
  .grade-container { text-align: center; margin: 32px 0; }
  .grade-circle { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: 50%; border: 4px solid ${gc}; }
  .grade-letter { font-size: 36px; font-weight: 700; color: ${gc}; }
  .grade-score { font-size: 14px; color: #6b7280; }
  .website { font-size: 14px; color: #6b7280; margin-top: 8px; }
  .categories { margin: 24px 0; }
  .cat-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
  .cat-label { width: 120px; font-size: 13px; font-weight: 500; color: #374151; }
  .cat-grade { width: 30px; font-weight: 700; font-size: 14px; text-align: center; }
  .cat-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
  .cat-bar-fill { height: 100%; border-radius: 4px; }
  .cat-pct { width: 40px; font-size: 12px; color: #6b7280; text-align: right; }
  .section-title { font-size: 18px; font-weight: 700; color: #111827; margin: 24px 0 16px; display: flex; align-items: center; gap: 8px; }
  .issue { border-left: 4px solid; padding: 12px 16px; margin: 12px 0; background: #f9fafb; border-radius: 0 8px 8px 0; }
  .issue.critical { border-color: #ef4444; }
  .issue.high { border-color: #f97316; }
  .issue.medium { border-color: #eab308; }
  .issue-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .issue-num { font-size: 12px; font-weight: 700; color: #6b7280; }
  .issue-title { font-size: 14px; font-weight: 600; color: #111827; }
  .issue-desc { font-size: 12px; color: #4b5563; }
  .issue-impact { font-size: 11px; color: #6b7280; margin-top: 4px; font-style: italic; }
  .stats-row { display: flex; justify-content: space-around; background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 24px; }
  .stat { text-align: center; }
  .stat-value { font-size: 20px; font-weight: 700; color: #111827; }
  .stat-label { font-size: 11px; color: #6b7280; }
  .toc { margin: 16px 0; }
  .toc-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .toc-section { color: #374151; }
  .toc-status { color: #9ca3af; font-size: 12px; }
  .cta-box { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }
  .cta-title { font-size: 18px; font-weight: 700; }
  .cta-desc { font-size: 13px; color: #9ca3af; margin-top: 8px; }
  .cta-btn { display: inline-block; background: #10b981; color: white; font-weight: 600; padding: 12px 32px; border-radius: 8px; margin-top: 16px; text-decoration: none; font-size: 15px; }
  .cta-sub { font-size: 11px; color: #6b7280; margin-top: 12px; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 24px; font-size: 10px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">
  <div class="header">
    <div class="logo">Rank<span>Sight</span></div>
    <div class="meta">SEO & GEO AUDIT PREVIEW<br>${data.date}</div>
  </div>

  <div class="grade-container">
    <div class="website">Website: ${data.url}</div>
    <div style="margin-top: 16px;">
      <div class="grade-circle">
        <div class="grade-letter">${data.overallGrade}</div>
        <div class="grade-score">${data.overallScore}/100</div>
      </div>
    </div>
  </div>

  <div class="categories">
    ${Object.entries(data.categories).map(([key, val]) => {
      const labels: Record<string, string> = { technical: 'Technical', visibility: 'Visibility', geo: 'AI Readiness', content: 'Content' };
      return `<div class="cat-row">
        <div class="cat-label">${labels[key] || key}</div>
        <div class="cat-grade" style="color: ${gradeColor(val.grade)}">${val.grade}</div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width: ${barWidth(val.score)}; background: ${gradeColor(val.grade)}"></div></div>
        <div class="cat-pct">${val.score}%</div>
      </div>`;
    }).join('')}
  </div>

  <div class="section-title">🏆 YOUR 3 BIGGEST OPPORTUNITIES</div>

  ${data.topIssues.map((issue, i) => `
    <div class="issue ${issue.severity}">
      <div class="issue-header">
        <span>${severityIcon(issue.severity)}</span>
        <span class="issue-num">#${i + 1}</span>
        <span class="issue-title">${issue.title}</span>
      </div>
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-impact">Impact: ${issue.impact}</div>
    </div>
  `).join('')}

  <div class="stats-row">
    <div class="stat"><div class="stat-value">${data.stats.totalIssues}</div><div class="stat-label">Issues found</div></div>
    <div class="stat"><div class="stat-value">${data.stats.pagesAnalyzed}</div><div class="stat-label">Pages analyzed</div></div>
    <div class="stat"><div class="stat-value">${data.stats.quickWins}</div><div class="stat-label">Quick wins</div></div>
    <div class="stat"><div class="stat-value">${data.stats.estTrafficImpact}</div><div class="stat-label">Est. traffic impact</div></div>
  </div>
</div>

<!-- PAGE 2 -->
<div class="page">
  <div class="header">
    <div class="logo">Rank<span>Sight</span></div>
    <div class="meta">FULL REPORT CONTENTS</div>
  </div>

  <div class="section-title">YOUR FULL REPORT INCLUDES:</div>

  <div class="toc">
    ${[
      { section: '1. Executive Summary', issues: '—', status: '✅ Preview above' },
      { section: '2. Technical Health', issues: '14 issues', status: '🔒 Full Report' },
      { section: '3. Search Visibility Analysis', issues: '9 issues', status: '🔒 Full Report' },
      { section: '4. AI Search Readiness (GEO)', issues: '11 issues', status: '🔒 Full Report' },
      { section: '5. Content Quality Analysis', issues: '8 issues', status: '🔒 Full Report' },
      { section: '6. Competitor Comparison', issues: '5 issues', status: '🔒 Full Report' },
      { section: '7. Prioritized Action Plan', issues: '47 total', status: '🔒 Full Report' },
    ].map(r => `
      <div class="toc-row">
        <span class="toc-section">${r.section}</span>
        <span class="toc-status">${r.issues} · ${r.status}</span>
      </div>
    `).join('')}
  </div>

  <div class="cta-box">
    <div class="cta-title">UNLOCK YOUR FULL REPORT</div>
    <div class="cta-desc">Get 15–20 pages of detailed analysis with specific fix instructions for every issue.</div>
    <a class="cta-btn" href="https://seo.impulsestudios.cc/audit/${data.auditId}">Unlock Full Report — $29</a>
    <div class="cta-sub">💰 100% money-back guarantee · Equivalent agency report: $500+</div>
  </div>

  <div class="footer">
    Generated by RankSight | seo.impulsestudios.cc | This report is for informational purposes only.
  </div>
</div>

</body>
</html>`;
}
