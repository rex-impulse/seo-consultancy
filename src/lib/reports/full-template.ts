export interface FullReportData {
  url: string;
  date: string;
  reportId: string;
  auditId: string;
  overallScore: number;
  overallGrade: string;
  categories: {
    technical: { score: number; grade: string };
    visibility: { score: number; grade: string };
    geo: { score: number; grade: string };
    content: { score: number; grade: string };
  };
  executive: {
    summary: string;
    topWins: { title: string; impact: string; difficulty: string; time: string }[];
    stats: { pagesAnalyzed: number; totalIssues: number; quickWins: number; estTrafficIncrease: string };
  };
  technical: {
    pageSpeed: { mobile: number; desktop: number; lcp: string; cls: string; fcp: string };
    ssl: { valid: boolean; expiry: string };
    brokenLinks: { url: string; status: number; foundOn: string }[];
    issues: { title: string; severity: string; description: string; fix: string }[];
  };
  visibility: {
    issues: { title: string; severity: string; description: string; fix: string }[];
  };
  geo: {
    bots: { name: string; service: string; allowed: boolean; severity: string; fix: string }[];
    schemaTypes: string[];
    missingSchema: { type: string; reason: string; example: string }[];
    issues: { title: string; severity: string; description: string; fix: string }[];
  };
  content: {
    issues: { title: string; severity: string; description: string; fix: string }[];
  };
  competitor: {
    name: string;
    comparison: { metric: string; yours: string; theirs: string; winner: string }[];
  };
  actionPlan: {
    quickWins: { title: string; time: string; impact: string; steps: string[] }[];
    mediumTerm: { title: string; time: string; impact: string; steps: string[] }[];
    strategic: { title: string; time: string; impact: string; steps: string[] }[];
  };
}

function gc(grade: string): string {
  if (grade.startsWith('A')) return '#10b981';
  if (grade.startsWith('B')) return '#3b82f6';
  if (grade.startsWith('C')) return '#eab308';
  if (grade.startsWith('D')) return '#f97316';
  return '#ef4444';
}

function sevColor(s: string): string {
  if (s === 'critical') return '#ef4444';
  if (s === 'high') return '#f97316';
  if (s === 'medium') return '#eab308';
  return '#3b82f6';
}

function issueCards(issues: { title: string; severity: string; description: string; fix: string }[]): string {
  return issues.map(i => `
    <div style="border-left: 4px solid ${sevColor(i.severity)}; padding: 12px 16px; margin: 10px 0; background: #f9fafb; border-radius: 0 8px 8px 0;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; color: white; background: ${sevColor(i.severity)};">${i.severity.toUpperCase()}</span>
        <span style="font-size: 13px; font-weight: 600; color: #111827;">${i.title}</span>
      </div>
      <p style="font-size: 12px; color: #4b5563; margin: 4px 0;">${i.description}</p>
      <div style="font-size: 12px; color: #047857; margin-top: 8px; padding: 8px; background: #ecfdf5; border-radius: 6px;">
        <strong>How to fix:</strong> ${i.fix}
      </div>
    </div>
  `).join('');
}

export function renderFullReportHtml(d: FullReportData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Full SEO & GEO Audit Report — ${d.url}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #374151; line-height: 1.6; background: white; font-size: 13px; }
  @page { size: A4; margin: 20mm 15mm; }
  .page { page-break-after: always; padding: 32px; min-height: 100vh; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 8px; }
  h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 24px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
  h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 16px 0 8px; }
  p { margin: 6px 0; }
  .cover { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .cover h1 { color: white; font-size: 32px; }
  .cover .grade-circle { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 140px; height: 140px; border-radius: 50%; border: 5px solid ${gc(d.overallGrade)}; margin: 32px 0; }
  .cover .grade-letter { font-size: 48px; font-weight: 700; color: ${gc(d.overallGrade)}; }
  .cover .grade-score { font-size: 16px; color: #9ca3af; }
  .cover .meta { font-size: 13px; color: #9ca3af; margin-top: 24px; }
  .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 20px; font-size: 11px; color: #9ca3af; }
  .logo { font-size: 16px; font-weight: 700; color: #111827; }
  .logo span { color: #10b981; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
  th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
  tr:nth-child(even) { background: #f9fafb; }
  .action-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin: 8px 0; }
  .action-card .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; }
  .qw .badge { background: #d1fae5; color: #065f46; }
  .mt .badge { background: #dbeafe; color: #1e40af; }
  .st .badge { background: #fef3c7; color: #92400e; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: auto; font-size: 10px; color: #9ca3af; text-align: center; }
  .cat-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 4px 0; }
  .cat-bar-fill { height: 100%; border-radius: 4px; }
</style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <div class="logo" style="font-size: 24px; color: white;">Rank<span>Sight</span></div>
  <h1 style="margin-top: 32px;">SEO & GEO AUDIT REPORT</h1>
  <p style="font-size: 18px; color: #9ca3af;">${d.url}</p>
  <div class="grade-circle">
    <div class="grade-letter">${d.overallGrade}</div>
    <div class="grade-score">${d.overallScore}/100</div>
  </div>
  <div class="meta">
    Date: ${d.date}<br>
    Report ID: ${d.reportId}<br><br>
    CONFIDENTIAL — Prepared exclusively for the website owner.
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Table of Contents</div></div>
  <h1>Contents</h1>
  <table>
    <tr><td>1. Executive Summary</td><td style="text-align:right">Page 3</td></tr>
    <tr><td>2. Technical Health</td><td style="text-align:right">Page 5</td></tr>
    <tr><td>3. Search Visibility</td><td style="text-align:right">Page 8</td></tr>
    <tr><td>4. AI Search Readiness (GEO)</td><td style="text-align:right">Page 10</td></tr>
    <tr><td>5. Content Quality</td><td style="text-align:right">Page 13</td></tr>
    <tr><td>6. Competitor Comparison</td><td style="text-align:right">Page 15</td></tr>
    <tr><td>7. Prioritized Action Plan</td><td style="text-align:right">Page 17</td></tr>
  </table>
</div>

<!-- EXECUTIVE SUMMARY -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Executive Summary</div></div>
  <h1>Executive Summary</h1>
  <p style="font-size: 14px; color: #4b5563; margin: 16px 0;">${d.executive.summary}</p>

  <div style="display: flex; gap: 16px; margin: 20px 0;">
    ${Object.entries(d.categories).map(([key, val]) => {
      const labels: Record<string, string> = { technical: 'Technical', visibility: 'Visibility', geo: 'AI Readiness', content: 'Content' };
      return `<div style="flex:1; text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px;">
        <div style="font-size: 10px; color: #6b7280;">${labels[key]}</div>
        <div style="font-size: 24px; font-weight: 700; color: ${gc(val.grade)}; margin: 4px 0;">${val.grade}</div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width: ${val.score}%; background: ${gc(val.grade)};"></div></div>
        <div style="font-size: 11px; color: #6b7280;">${val.score}/100</div>
      </div>`;
    }).join('')}
  </div>

  <h3>🏆 Top 3 Wins</h3>
  ${d.executive.topWins.map(w => `
    <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
      <strong>${w.title}</strong> — ${w.impact}<br>
      <span style="font-size: 11px; color: #6b7280;">Difficulty: ${w.difficulty} · Time: ${w.time}</span>
    </div>
  `).join('')}

  <div style="display: flex; justify-content: space-around; background: #f9fafb; border-radius: 8px; padding: 16px; margin-top: 20px;">
    <div style="text-align: center;"><div style="font-size: 24px; font-weight: 700;">${d.executive.stats.pagesAnalyzed}</div><div style="font-size: 10px; color: #6b7280;">Pages analyzed</div></div>
    <div style="text-align: center;"><div style="font-size: 24px; font-weight: 700;">${d.executive.stats.totalIssues}</div><div style="font-size: 10px; color: #6b7280;">Issues found</div></div>
    <div style="text-align: center;"><div style="font-size: 24px; font-weight: 700;">${d.executive.stats.quickWins}</div><div style="font-size: 10px; color: #6b7280;">Quick wins</div></div>
    <div style="text-align: center;"><div style="font-size: 24px; font-weight: 700;">${d.executive.stats.estTrafficIncrease}</div><div style="font-size: 10px; color: #6b7280;">Est. traffic increase</div></div>
  </div>
</div>

<!-- TECHNICAL HEALTH -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Technical Health</div></div>
  <h1>Technical Health</h1>
  <div style="display: inline-block; padding: 4px 16px; border-radius: 20px; background: ${gc(d.categories.technical.grade)}20; color: ${gc(d.categories.technical.grade)}; font-weight: 700; font-size: 14px;">${d.categories.technical.grade} — ${d.categories.technical.score}/100</div>

  <h3>Page Speed</h3>
  <table>
    <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
    <tr><td>Mobile Score</td><td>${d.technical.pageSpeed.mobile}/100</td><td>≥ 90</td><td>${d.technical.pageSpeed.mobile >= 90 ? '✅ Good' : d.technical.pageSpeed.mobile >= 50 ? '⚠️ Needs work' : '❌ Poor'}</td></tr>
    <tr><td>Desktop Score</td><td>${d.technical.pageSpeed.desktop}/100</td><td>≥ 90</td><td>${d.technical.pageSpeed.desktop >= 90 ? '✅ Good' : '⚠️ Needs work'}</td></tr>
    <tr><td>LCP</td><td>${d.technical.pageSpeed.lcp}</td><td>≤ 2.5s</td><td>⚠️</td></tr>
    <tr><td>CLS</td><td>${d.technical.pageSpeed.cls}</td><td>≤ 0.1</td><td>⚠️</td></tr>
    <tr><td>FCP</td><td>${d.technical.pageSpeed.fcp}</td><td>≤ 1.8s</td><td>⚠️</td></tr>
  </table>

  <h3>SSL & Security</h3>
  <p>SSL Certificate: ${d.technical.ssl.valid ? '✅ Valid' : '❌ Invalid'} (expires: ${d.technical.ssl.expiry})</p>

  ${d.technical.brokenLinks.length > 0 ? `
    <h3>Broken Links</h3>
    <table>
      <tr><th>URL</th><th>Status</th><th>Found On</th></tr>
      ${d.technical.brokenLinks.map(l => `<tr><td style="word-break: break-all;">${l.url}</td><td>${l.status}</td><td style="word-break: break-all;">${l.foundOn}</td></tr>`).join('')}
    </table>
  ` : ''}

  <h3>Issues & Recommendations</h3>
  ${issueCards(d.technical.issues)}
</div>

<!-- SEARCH VISIBILITY -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Search Visibility</div></div>
  <h1>Search Visibility</h1>
  <div style="display: inline-block; padding: 4px 16px; border-radius: 20px; background: ${gc(d.categories.visibility.grade)}20; color: ${gc(d.categories.visibility.grade)}; font-weight: 700; font-size: 14px;">${d.categories.visibility.grade} — ${d.categories.visibility.score}/100</div>

  <h3>Issues & Recommendations</h3>
  ${issueCards(d.visibility.issues)}
</div>

<!-- AI SEARCH READINESS / GEO -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>AI Search Readiness (GEO)</div></div>
  <h1>AI Search Readiness (GEO)</h1>
  <div style="display: inline-block; padding: 4px 16px; border-radius: 20px; background: ${gc(d.categories.geo.grade)}20; color: ${gc(d.categories.geo.grade)}; font-weight: 700; font-size: 14px;">${d.categories.geo.grade} — ${d.categories.geo.score}/100</div>

  <p style="margin: 12px 0; font-size: 13px; color: #4b5563;">AI search engines like ChatGPT, Perplexity, and Google AI Overviews are changing how people find businesses. This section evaluates whether your website is structured to be cited by these AI systems.</p>

  <h3>AI Bot Access</h3>
  <table>
    <tr><th>Bot</th><th>Service</th><th>Access</th><th>Status</th></tr>
    ${d.geo.bots.map(b => `<tr><td>${b.name}</td><td>${b.service}</td><td>${b.allowed ? '✅ Allowed' : '❌ Blocked'}</td><td style="color: ${sevColor(b.severity)}">${b.severity.toUpperCase()}</td></tr>`).join('')}
  </table>

  <h3>Schema.org Markup</h3>
  <p><strong>Found:</strong> ${d.geo.schemaTypes.length > 0 ? d.geo.schemaTypes.join(', ') : 'None found'}</p>
  ${d.geo.missingSchema.length > 0 ? `
    <h3>Missing Schema Types</h3>
    ${d.geo.missingSchema.map(s => `
      <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
        <strong>${s.type}</strong> — ${s.reason}<br>
        <code style="display: block; background: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 11px; margin-top: 4px; white-space: pre-wrap;">${s.example}</code>
      </div>
    `).join('')}
  ` : ''}

  <h3>Issues & Recommendations</h3>
  ${issueCards(d.geo.issues)}
</div>

<!-- CONTENT QUALITY -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Content Quality</div></div>
  <h1>Content Quality</h1>
  <div style="display: inline-block; padding: 4px 16px; border-radius: 20px; background: ${gc(d.categories.content.grade)}20; color: ${gc(d.categories.content.grade)}; font-weight: 700; font-size: 14px;">${d.categories.content.grade} — ${d.categories.content.score}/100</div>
  <h3>Issues & Recommendations</h3>
  ${issueCards(d.content.issues)}
</div>

<!-- COMPETITOR COMPARISON -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Competitor Comparison</div></div>
  <h1>Competitor Comparison</h1>
  <p>Comparing against: <strong>${d.competitor.name}</strong></p>
  <table>
    <tr><th>Metric</th><th>Your Site</th><th>Competitor</th><th>Winner</th></tr>
    ${d.competitor.comparison.map(c => `<tr><td>${c.metric}</td><td>${c.yours}</td><td>${c.theirs}</td><td>${c.winner}</td></tr>`).join('')}
  </table>
</div>

<!-- ACTION PLAN -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>Prioritized Action Plan</div></div>
  <h1>Prioritized Action Plan</h1>

  <h2>⚡ Quick Wins (< 30 minutes each)</h2>
  ${d.actionPlan.quickWins.map(a => `
    <div class="action-card qw">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>${a.title}</strong>
        <div><span class="badge">QUICK WIN</span> <span style="font-size: 11px; color: #6b7280; margin-left: 8px;">${a.time} · ${a.impact} impact</span></div>
      </div>
      <ol style="margin: 8px 0 0 20px; font-size: 12px; color: #4b5563;">
        ${a.steps.map(s => `<li style="margin: 2px 0;">${s}</li>`).join('')}
      </ol>
    </div>
  `).join('')}

  <h2>📋 Medium-Term (1–4 weeks)</h2>
  ${d.actionPlan.mediumTerm.map(a => `
    <div class="action-card mt">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>${a.title}</strong>
        <div><span class="badge">MEDIUM-TERM</span> <span style="font-size: 11px; color: #6b7280; margin-left: 8px;">${a.time} · ${a.impact} impact</span></div>
      </div>
      <ol style="margin: 8px 0 0 20px; font-size: 12px; color: #4b5563;">
        ${a.steps.map(s => `<li style="margin: 2px 0;">${s}</li>`).join('')}
      </ol>
    </div>
  `).join('')}

  <h2>🎯 Strategic (1–3 months)</h2>
  ${d.actionPlan.strategic.map(a => `
    <div class="action-card st">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>${a.title}</strong>
        <div><span class="badge">STRATEGIC</span> <span style="font-size: 11px; color: #6b7280; margin-left: 8px;">${a.time} · ${a.impact} impact</span></div>
      </div>
      <ol style="margin: 8px 0 0 20px; font-size: 12px; color: #4b5563;">
        ${a.steps.map(s => `<li style="margin: 2px 0;">${s}</li>`).join('')}
      </ol>
    </div>
  `).join('')}
</div>

<!-- DISCLAIMER -->
<div class="page">
  <div class="header-bar"><div class="logo">Rank<span>Sight</span></div><div>About & Disclaimer</div></div>
  <h1>About This Report</h1>
  <p style="margin: 16px 0; font-size: 13px;">This report was generated by RankSight, an automated SEO & GEO audit tool by Impulse Studios. Our analysis covers technical health, search visibility, AI search readiness, content quality, competitor comparison, and a prioritized action plan.</p>

  <h3>Disclaimer</h3>
  <p style="font-size: 12px; color: #6b7280; margin: 12px 0;">This report is generated automatically using publicly available data and automated analysis tools. It is provided for informational purposes only and does not constitute professional SEO advice, legal advice, or a guarantee of results. While we strive for accuracy, we cannot guarantee the completeness or accuracy of all findings. We recommend consulting with a qualified SEO professional before making significant changes to your website. RankSight and Impulse Studios are not liable for any actions taken based on this report.</p>

  <h3>Need Help Implementing?</h3>
  <p style="font-size: 13px; margin: 12px 0;">Reply to the email this report came with for a free implementation quote.</p>
  <ul style="font-size: 12px; margin: 8px 0 0 20px; color: #4b5563;">
    <li>Quick Fix Package: from $299</li>
    <li>Full Implementation: from $999</li>
    <li>Monthly Retainer: from $499/month</li>
  </ul>

  <div class="footer" style="margin-top: 40px;">
    Generated by RankSight | seo.impulsestudios.cc<br>
    © 2026 Impulse Studios. All rights reserved.
  </div>
</div>

</body>
</html>`;
}
