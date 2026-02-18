/**
 * Professional white-theme PDF report template
 * Rendered via Playwright → page.pdf()
 */

interface ReportData {
  url: string;
  date: string;
  overallScore: number;
  overallGrade: string;
  categories: {
    geo: { score: number; grade: string };
    technical: { score: number; grade: string };
    content: { score: number; grade: string };
    visibility: { score: number; grade: string };
    onpage: { score: number; grade: string };
  };
  issues: Array<{ severity: string; title: string; description: string }>;
  aiAnalysis?: {
    executiveSummary: string;
    geoAnalysis: string;
    technicalAnalysis: string;
    contentAnalysis: string;
    actionPlan: {
      quickWins: string[];
      mediumTerm: string[];
      strategic: string[];
    };
    teaserHighlight: {
      shockingStat: string;
      oneSpecificIssue: string;
      estimatedImpact: string;
    };
  };
  screenshots?: {
    desktop?: string; // base64
    mobile?: string;  // base64
  };
}

function gradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A': '#16a34a', 'B': '#ca8a04', 'C': '#ea580c', 'D': '#dc2626', 'F': '#991b1b',
  };
  return colors[grade] || '#6b7280';
}

function severityBadge(severity: string): string {
  const colors: Record<string, string> = {
    'high': '#dc2626', 'medium': '#ca8a04', 'low': '#6b7280',
  };
  const color = colors[severity] || '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:white;background:${color}">${severity}</span>`;
}

function scoreBar(score: number, label: string, grade: string): string {
  return `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:#374151">${label}</span>
        <span style="font-size:13px;font-weight:700;color:${gradeColor(grade)}">${grade} · ${score}/100</span>
      </div>
      <div style="height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${score}%;background:${gradeColor(grade)};border-radius:3px"></div>
      </div>
    </div>`;
}

export function renderTeaserPdfHtml(data: ReportData): string {
  const ai = data.aiAnalysis;
  const highlight = ai?.teaserHighlight;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #111827;
    background: white;
    line-height: 1.6;
    font-size: 13px;
  }
  
  .page { padding: 48px 56px; max-width: 800px; margin: 0 auto; }
  .page-break { page-break-before: always; }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #111827;
    padding-bottom: 16px;
    margin-bottom: 32px;
  }
  .header-left h1 {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #111827;
  }
  .header-left p {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
  .header-right {
    text-align: right;
  }
  .header-right .grade-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    font-size: 28px;
    font-weight: 700;
    color: white;
  }
  .header-right .score-text {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
  
  h2 {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .section { margin-bottom: 28px; }
  
  .alert-box {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #dc2626;
    padding: 16px 20px;
    margin-bottom: 24px;
    border-radius: 4px;
  }
  .alert-box .stat {
    font-size: 15px;
    font-weight: 700;
    color: #991b1b;
    margin-bottom: 6px;
  }
  .alert-box .detail {
    font-size: 13px;
    color: #7f1d1d;
    line-height: 1.5;
  }
  
  .scores-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 32px;
    margin-bottom: 24px;
  }
  
  .issue-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .issue-row:last-child { border-bottom: none; }
  .issue-content { flex: 1; }
  .issue-title { font-size: 13px; font-weight: 600; color: #111827; }
  .issue-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
  
  .blurred-section {
    position: relative;
    overflow: hidden;
    margin-top: 12px;
  }
  .blurred-content {
    filter: blur(6px);
    user-select: none;
    pointer-events: none;
    opacity: 0.5;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
  }
  .blurred-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.7);
    border-radius: 6px;
  }
  .blurred-overlay .lock-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  .blurred-overlay .lock-text {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
  .blurred-overlay .lock-sub {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
  
  .screenshot-container {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .screenshot-label {
    background: #f9fafb;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
  }
  .screenshot-img {
    width: 100%;
    display: block;
  }
  
  .action-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 0;
    font-size: 13px;
  }
  .action-number {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111827;
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
  }
  
  .cta-box {
    background: #111827;
    color: white;
    padding: 24px 28px;
    border-radius: 8px;
    text-align: center;
    margin-top: 32px;
  }
  .cta-box h3 {
    color: white;
    font-size: 18px;
    margin-bottom: 8px;
  }
  .cta-box p {
    color: #9ca3af;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .cta-button {
    display: inline-block;
    background: white;
    color: #111827;
    padding: 10px 32px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
  }
  
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #9ca3af;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>

<!-- PAGE 1: Overview + Alert -->
<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>SEO & AI Readiness Report</h1>
      <p>${data.url} · ${data.date}</p>
    </div>
    <div class="header-right">
      <div class="grade-badge" style="background:${gradeColor(data.overallGrade)}">${data.overallGrade}</div>
      <div class="score-text">${data.overallScore}/100</div>
    </div>
  </div>

  ${highlight ? `
  <div class="alert-box">
    <div class="stat">${highlight.shockingStat}</div>
    <div class="detail">${highlight.oneSpecificIssue}</div>
  </div>
  ` : ''}

  ${ai?.executiveSummary ? `
  <div class="section">
    <h2>Executive Summary</h2>
    <p style="font-size:13px;color:#374151;line-height:1.7">${ai.executiveSummary}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2>Performance Breakdown</h2>
    <div class="scores-grid">
      <div>
        ${scoreBar(data.categories.geo.score, 'AI Search Readiness', data.categories.geo.grade)}
        ${scoreBar(data.categories.technical.score, 'Technical Health', data.categories.technical.grade)}
        ${scoreBar(data.categories.onpage.score, 'On-Page SEO', data.categories.onpage.grade)}
      </div>
      <div>
        ${scoreBar(data.categories.content.score, 'Content Quality', data.categories.content.grade)}
        ${scoreBar(data.categories.visibility.score, 'Search Visibility', data.categories.visibility.grade)}
      </div>
    </div>
  </div>

  ${data.screenshots?.desktop ? `
  <div class="section">
    <h2>What Search Engines See</h2>
    <div class="screenshot-container">
      <div class="screenshot-label">Current State — Desktop</div>
      <img class="screenshot-img" src="data:image/png;base64,${data.screenshots.desktop}" />
    </div>
    ${data.screenshots?.mobile ? `
    <div class="screenshot-container" style="max-width:320px">
      <div class="screenshot-label">Current State — Mobile</div>
      <img class="screenshot-img" src="data:image/png;base64,${data.screenshots.mobile}" />
    </div>
    ` : ''}
  </div>
  ` : ''}
</div>

<!-- PAGE 2: Issues Found (teaser shows first issue, rest blurred) -->
<div class="page page-break">
  <h2>Issues Found (${data.issues.length})</h2>
  
  ${data.issues.length > 0 ? `
  <div class="issue-row">
    ${severityBadge(data.issues[0].severity)}
    <div class="issue-content">
      <div class="issue-title">${data.issues[0].title}</div>
      <div class="issue-desc">${data.issues[0].description}</div>
    </div>
  </div>
  ` : ''}

  ${data.issues.length > 1 ? `
  <div class="blurred-section">
    <div class="blurred-content">
      ${data.issues.slice(1).map(i => `
        <div style="padding:8px 0;border-bottom:1px solid #e5e7eb">
          <div style="font-weight:600">${i.title}</div>
          <div style="font-size:12px;color:#6b7280">${i.description}</div>
        </div>
      `).join('')}
    </div>
    <div class="blurred-overlay">
      <div class="lock-icon">🔒</div>
      <div class="lock-text">${data.issues.length - 1} more issues found</div>
      <div class="lock-sub">Unlock the full report to see all issues and how to fix them</div>
    </div>
  </div>
  ` : ''}

  ${ai ? `
  <div class="section" style="margin-top:28px">
    <h2>AI Search Readiness</h2>
    <p style="font-size:13px;color:#374151;line-height:1.7">${ai.geoAnalysis.split('.').slice(0, 3).join('.') + '.'}</p>
    
    <div class="blurred-section" style="margin-top:12px">
      <div class="blurred-content">
        <p>${ai.geoAnalysis.split('.').slice(3).join('.')}</p>
        <p style="margin-top:8px">${ai.technicalAnalysis}</p>
      </div>
      <div class="blurred-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-text">Full Analysis Locked</div>
        <div class="lock-sub">Get the complete report with step-by-step fixes</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${ai?.actionPlan ? `
  <div class="section" style="margin-top:28px">
    <h2>Action Plan</h2>
    <h3>Quick Wins (fix today)</h3>
    ${ai.actionPlan.quickWins.slice(0, 1).map((item, i) => `
      <div class="action-item">
        <div class="action-number">${i + 1}</div>
        <div>${item}</div>
      </div>
    `).join('')}
    
    <div class="blurred-section" style="margin-top:8px">
      <div class="blurred-content">
        ${ai.actionPlan.quickWins.slice(1).concat(ai.actionPlan.mediumTerm).map((item, i) => `
          <div class="action-item">
            <div class="action-number">${i + 2}</div>
            <div>${item}</div>
          </div>
        `).join('')}
      </div>
      <div class="blurred-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-text">${ai.actionPlan.quickWins.length + ai.actionPlan.mediumTerm.length + ai.actionPlan.strategic.length - 1} more action items</div>
        <div class="lock-sub">Get the full roadmap with priorities and timelines</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${highlight ? `
  <div class="cta-box">
    <h3>Get Your Full Report</h3>
    <p>${highlight.estimatedImpact}</p>
    <a href="https://seo.impulsestudios.cc" class="cta-button">Unlock Full Report — $29</a>
  </div>
  ` : ''}

  <div class="footer">
    <span>Generated by Impulse Studios SEO Audit</span>
    <span>${data.date}</span>
  </div>
</div>

</body>
</html>`;
}

export function renderFullPdfHtml(data: ReportData): string {
  const ai = data.aiAnalysis;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',-apple-system,sans-serif; color:#111827; background:white; line-height:1.6; font-size:13px; }
  .page { padding:48px 56px; max-width:800px; margin:0 auto; }
  .page-break { page-break-before:always; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111827; padding-bottom:16px; margin-bottom:32px; }
  .header-left h1 { font-size:22px; font-weight:700; letter-spacing:-0.5px; }
  .header-left p { font-size:12px; color:#6b7280; margin-top:2px; }
  .header-right { text-align:right; }
  .grade-badge { display:inline-flex; align-items:center; justify-content:center; width:56px; height:56px; border-radius:8px; font-size:28px; font-weight:700; color:white; }
  .score-text { font-size:12px; color:#6b7280; margin-top:4px; }
  h2 { font-size:16px; font-weight:700; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #e5e7eb; }
  h3 { font-size:14px; font-weight:600; margin-bottom:8px; margin-top:16px; }
  .section { margin-bottom:28px; }
  .section p { font-size:13px; color:#374151; line-height:1.7; margin-bottom:8px; }
  .scores-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 32px; margin-bottom:24px; }
  .issue-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid #f3f4f6; }
  .issue-row:last-child { border-bottom:none; }
  .issue-title { font-size:13px; font-weight:600; }
  .issue-desc { font-size:12px; color:#6b7280; margin-top:2px; }
  .action-item { display:flex; align-items:flex-start; gap:8px; padding:6px 0; font-size:13px; }
  .action-number { flex-shrink:0; width:22px; height:22px; display:flex; align-items:center; justify-content:center; background:#111827; color:white; font-size:11px; font-weight:700; border-radius:4px; }
  .screenshot-container { border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:16px; }
  .screenshot-label { background:#f9fafb; padding:6px 12px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; border-bottom:1px solid #e5e7eb; }
  .screenshot-img { width:100%; display:block; }
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af; display:flex; justify-content:space-between; }
</style>
</head>
<body>

<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>SEO & AI Readiness Report</h1>
      <p>${data.url} · ${data.date}</p>
    </div>
    <div class="header-right">
      <div class="grade-badge" style="background:${gradeColor(data.overallGrade)}">${data.overallGrade}</div>
      <div class="score-text">${data.overallScore}/100</div>
    </div>
  </div>

  ${ai?.executiveSummary ? `
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${ai.executiveSummary}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2>Performance Breakdown</h2>
    <div class="scores-grid">
      <div>
        ${scoreBar(data.categories.geo.score, 'AI Search Readiness', data.categories.geo.grade)}
        ${scoreBar(data.categories.technical.score, 'Technical Health', data.categories.technical.grade)}
        ${scoreBar(data.categories.onpage.score, 'On-Page SEO', data.categories.onpage.grade)}
      </div>
      <div>
        ${scoreBar(data.categories.content.score, 'Content Quality', data.categories.content.grade)}
        ${scoreBar(data.categories.visibility.score, 'Search Visibility', data.categories.visibility.grade)}
      </div>
    </div>
  </div>

  ${data.screenshots?.desktop ? `
  <div class="section">
    <h2>What Search Engines See</h2>
    <div class="screenshot-container">
      <div class="screenshot-label">Desktop View</div>
      <img class="screenshot-img" src="data:image/png;base64,${data.screenshots.desktop}" />
    </div>
  </div>
  ` : ''}
</div>

<div class="page page-break">
  ${ai?.geoAnalysis ? `
  <div class="section">
    <h2>AI Search Readiness</h2>
    <p>${ai.geoAnalysis}</p>
  </div>
  ` : ''}

  ${ai?.technicalAnalysis ? `
  <div class="section">
    <h2>Technical Analysis</h2>
    <p>${ai.technicalAnalysis}</p>
  </div>
  ` : ''}

  ${ai?.contentAnalysis ? `
  <div class="section">
    <h2>Content Analysis</h2>
    <p>${ai.contentAnalysis}</p>
  </div>
  ` : ''}
</div>

<div class="page page-break">
  <div class="section">
    <h2>All Issues (${data.issues.length})</h2>
    ${data.issues.map(i => `
      <div class="issue-row">
        ${severityBadge(i.severity)}
        <div>
          <div class="issue-title">${i.title}</div>
          <div class="issue-desc">${i.description}</div>
        </div>
      </div>
    `).join('')}
  </div>

  ${ai?.actionPlan ? `
  <div class="section">
    <h2>Action Plan</h2>
    <h3>Quick Wins (fix today)</h3>
    ${ai.actionPlan.quickWins.map((item, i) => `
      <div class="action-item"><div class="action-number">${i + 1}</div><div>${item}</div></div>
    `).join('')}
    
    <h3>This Month</h3>
    ${ai.actionPlan.mediumTerm.map((item, i) => `
      <div class="action-item"><div class="action-number">${i + 1}</div><div>${item}</div></div>
    `).join('')}
    
    <h3>Strategic (next 3 months)</h3>
    ${ai.actionPlan.strategic.map((item, i) => `
      <div class="action-item"><div class="action-number">${i + 1}</div><div>${item}</div></div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <span>Generated by Impulse Studios SEO Audit · Full Report</span>
    <span>${data.date}</span>
  </div>
</div>

</body>
</html>`;
}
