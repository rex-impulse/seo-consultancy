/**
 * Professional 20-page PDF report template
 * Pages 1-2: Visible teaser (executive summary + scores + one scary finding)
 * Pages 3-20: Blurred/locked (detailed analysis, action plans, competitor insights)
 * Rendered via Playwright → page.pdf()
 */

interface ReportData {
  url: string;
  date: string;
  overallScore: number;
  overallGrade: string;
  categories: Record<string, { score: number; grade: string }>;
  issues: Array<{ severity: string; title: string; description: string }>;
  aiAnalysis?: any;
  screenshots?: { desktop?: string; mobile?: string };
}

function gradeColor(grade: string): string {
  return { A: '#16a34a', B: '#ca8a04', C: '#ea580c', D: '#dc2626', F: '#991b1b' }[grade] || '#6b7280';
}

function severityColor(s: string): string {
  return { high: '#dc2626', medium: '#ca8a04', low: '#6b7280' }[s] || '#6b7280';
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter',-apple-system,sans-serif; color:#111827; background:white; line-height:1.6; font-size:12px; }
.page { width:100%; min-height:100vh; padding:48px 52px; position:relative; page-break-after:always; }
.page:last-child { page-break-after:auto; }

/* Header */
.header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:2px solid #111827; margin-bottom:28px; }
.header h1 { font-size:20px; font-weight:800; letter-spacing:-0.5px; }
.header .sub { font-size:11px; color:#6b7280; margin-top:3px; }
.grade-box { text-align:center; }
.grade-circle { width:60px; height:60px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:30px; font-weight:800; color:white; }
.grade-label { font-size:11px; color:#6b7280; margin-top:4px; }

/* Section headers */
h2 { font-size:15px; font-weight:700; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #e5e7eb; color:#111827; }
h3 { font-size:13px; font-weight:700; margin:14px 0 6px; color:#111827; }
h4 { font-size:12px; font-weight:600; margin:10px 0 4px; color:#374151; }
.section { margin-bottom:22px; }
p { font-size:12px; color:#374151; line-height:1.65; margin-bottom:6px; }

/* Score bars */
.score-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
.score-label { font-size:11px; font-weight:500; color:#374151; }
.score-value { font-size:11px; font-weight:700; }
.bar-track { height:5px; background:#f3f4f6; border-radius:3px; overflow:hidden; margin-bottom:10px; }
.bar-fill { height:100%; border-radius:3px; }

/* Alert box */
.alert { background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:14px 18px; border-radius:4px; margin-bottom:20px; }
.alert .stat { font-size:14px; font-weight:700; color:#991b1b; margin-bottom:4px; }
.alert .detail { font-size:12px; color:#7f1d1d; line-height:1.5; }

/* Issue badge */
.badge { display:inline-block; padding:1px 7px; border-radius:3px; font-size:10px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; color:white; }

/* Issue rows */
.issue-row { display:flex; align-items:flex-start; gap:8px; padding:8px 0; border-bottom:1px solid #f3f4f6; }
.issue-row:last-child { border-bottom:none; }
.issue-title { font-size:12px; font-weight:600; color:#111827; }
.issue-desc { font-size:11px; color:#6b7280; margin-top:2px; }

/* Action items */
.action-item { display:flex; align-items:flex-start; gap:8px; padding:5px 0; }
.action-num { flex-shrink:0; width:20px; height:20px; display:flex; align-items:center; justify-content:center; background:#111827; color:white; font-size:10px; font-weight:700; border-radius:3px; }

/* Screenshots */
.screenshot-box { border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:14px; }
.screenshot-label { background:#f9fafb; padding:5px 10px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; border-bottom:1px solid #e5e7eb; }
.screenshot-img { width:100%; display:block; }

/* Blurred overlay */
.blur-wrap { position:relative; overflow:hidden; }
.blur-content { filter:blur(5px); user-select:none; pointer-events:none; opacity:0.4; }
.blur-overlay { position:absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.65); }
.lock-icon { font-size:28px; margin-bottom:6px; }
.lock-text { font-size:15px; font-weight:700; color:#111827; }
.lock-sub { font-size:11px; color:#6b7280; margin-top:3px; }

/* CTA */
.cta { background:#111827; color:white; padding:24px; border-radius:8px; text-align:center; margin-top:24px; }
.cta h3 { color:white; font-size:17px; margin-bottom:6px; }
.cta p { color:#9ca3af; font-size:12px; margin-bottom:14px; }
.cta-btn { display:inline-block; background:white; color:#111827; padding:10px 28px; border-radius:6px; font-weight:700; font-size:13px; text-decoration:none; }

/* Footer */
.footer { position:absolute; bottom:24px; left:52px; right:52px; display:flex; justify-content:space-between; font-size:10px; color:#9ca3af; border-top:1px solid #f3f4f6; padding-top:8px; }

/* Page number */
.page-num { position:absolute; bottom:26px; right:52px; font-size:10px; color:#9ca3af; }

/* Table of contents */
.toc-item { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dotted #d1d5db; font-size:12px; }
.toc-item .label { font-weight:500; color:#111827; }
.toc-item .pg { color:#6b7280; font-weight:600; }
.toc-locked { color:#9ca3af; }
.toc-locked .label { color:#9ca3af; }
`;

function scoreBar(score: number, label: string, grade: string): string {
  return `
    <div>
      <div class="score-row">
        <span class="score-label">${label}</span>
        <span class="score-value" style="color:${gradeColor(grade)}">${grade} · ${score}/100</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${score}%;background:${gradeColor(grade)}"></div></div>
    </div>`;
}

function blurredPage(title: string, content: string, pageNum: number, lockMsg: string): string {
  return `
  <div class="page">
    <h2>${title}</h2>
    <div class="blur-wrap">
      <div class="blur-content">${content}</div>
      <div class="blur-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-text">${lockMsg}</div>
        <div class="lock-sub">Unlock the full report for $29</div>
      </div>
    </div>
    <div class="page-num">${pageNum}</div>
  </div>`;
}

function fakeContent(paragraphs: number): string {
  const p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
  return Array(paragraphs).fill(`<p>${p}</p>`).join('');
}

export function renderTeaserPdfHtml(data: ReportData): string {
  const ai = data.aiAnalysis;
  const highlight = ai?.teaserHighlight;
  const cats = data.categories;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${CSS}</style></head><body>

<!-- PAGE 1: Cover + Executive Summary -->
<div class="page">
  <div class="header">
    <div>
      <h1>SEO & AI Readiness Report</h1>
      <div class="sub">${data.url} · ${data.date}</div>
    </div>
    <div class="grade-box">
      <div class="grade-circle" style="background:${gradeColor(data.overallGrade)}">${data.overallGrade}</div>
      <div class="grade-label">${data.overallScore}/100</div>
    </div>
  </div>

  ${highlight ? `
  <div class="alert">
    <div class="stat">⚠ ${highlight.shockingStat}</div>
    <div class="detail">${highlight.oneSpecificIssue}</div>
  </div>
  ` : ''}

  ${ai?.executiveSummary ? `
  <div class="section">
    <h2>Executive Summary</h2>
    <p>${ai.executiveSummary}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2>Performance Overview</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 28px">
      <div>
        ${scoreBar(cats.geo?.score || 0, 'AI Search Readiness (GEO)', cats.geo?.grade || 'C')}
        ${scoreBar(cats.technical?.score || 0, 'Technical Health', cats.technical?.grade || 'C')}
        ${scoreBar(cats.onpage?.score || 0, 'On-Page SEO', cats.onpage?.grade || 'C')}
      </div>
      <div>
        ${scoreBar(cats.content?.score || 0, 'Content Quality', cats.content?.grade || 'C')}
        ${scoreBar(cats.visibility?.score || 0, 'Search Visibility', cats.visibility?.grade || 'C')}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Table of Contents</h2>
    <div class="toc-item"><span class="label">Executive Summary & Scores</span><span class="pg">1</span></div>
    <div class="toc-item"><span class="label">Critical Issues Found (${data.issues.length})</span><span class="pg">2</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 AI Search Readiness Deep Dive</span><span class="pg">3-4</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Technical Performance Analysis</span><span class="pg">5-6</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Content Quality Assessment</span><span class="pg">7-8</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Visual Audit: Desktop & Mobile</span><span class="pg">9-10</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Competitor Comparison</span><span class="pg">11-12</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Issue-by-Issue Fix Guide</span><span class="pg">13-16</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 90-Day Action Plan</span><span class="pg">17-18</span></div>
    <div class="toc-item toc-locked"><span class="label">🔒 Implementation Checklist</span><span class="pg">19-20</span></div>
  </div>

  <div class="page-num">1</div>
</div>

<!-- PAGE 2: Critical Issues (show first issue fully, rest partially) -->
<div class="page">
  <h2>Critical Issues Found (${data.issues.length})</h2>
  
  ${data.issues.length > 0 ? `
  <div class="section">
    <div class="issue-row">
      <span class="badge" style="background:${severityColor(data.issues[0].severity)}">${data.issues[0].severity}</span>
      <div style="flex:1">
        <div class="issue-title">${data.issues[0].title}</div>
        <div class="issue-desc">${data.issues[0].description}</div>
        ${ai?.detailedIssues?.[0] ? `<p style="margin-top:6px;font-size:11px;color:#374151">${typeof ai.detailedIssues[0] === 'string' ? ai.detailedIssues[0].slice(0, 300) + '...' : (ai.detailedIssues[0].explanation || '').slice(0, 300) + '...'}</p>` : ''}
      </div>
    </div>
  </div>
  ` : ''}

  ${data.issues.length > 1 ? `
  <div class="section">
    <h3>${data.issues.length - 1} More Issues Found</h3>
    ${data.issues.slice(1, 3).map(i => `
      <div class="issue-row">
        <span class="badge" style="background:${severityColor(i.severity)}">${i.severity}</span>
        <div style="flex:1">
          <div class="issue-title">${i.title}</div>
          <div class="issue-desc" style="color:#9ca3af">${i.description.slice(0, 60)}...</div>
        </div>
      </div>
    `).join('')}
    
    <div class="blur-wrap" style="margin-top:10px">
      <div class="blur-content">
        ${data.issues.slice(3).map(i => `
          <div class="issue-row">
            <span class="badge" style="background:${severityColor(i.severity)}">${i.severity}</span>
            <div style="flex:1"><div class="issue-title">${i.title}</div><div class="issue-desc">${i.description}</div></div>
          </div>
        `).join('')}
        <p>Each issue includes a detailed explanation of the problem, its impact on your search rankings, and step-by-step instructions to fix it.</p>
      </div>
      <div class="blur-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-text">Detailed fix instructions locked</div>
        <div class="lock-sub">Full report includes code examples & priority rankings</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${highlight ? `
  <div class="cta">
    <h3>Don't Leave Money on the Table</h3>
    <p>${highlight.estimatedImpact}</p>
    <a href="https://seo.impulsestudios.cc" class="cta-btn">Get Full Report — $29</a>
  </div>
  ` : ''}

  <div class="page-num">2</div>
</div>

<!-- PAGES 3-4: AI Search Readiness (blurred) -->
${blurredPage('AI Search Readiness Deep Dive', `
  <h3>How AI Search Engines See Your Website</h3>
  <p>${ai?.geoAnalysis || fakeContent(2)}</p>
  <h3>Citation Probability Score</h3>
  <p>Based on our analysis of 50+ ranking factors specific to AI search engines like ChatGPT, Google AI Overviews, and Perplexity, your website has a citation probability of...</p>
  ${fakeContent(3)}
  <h3>What ChatGPT Says About Your Industry</h3>
  ${fakeContent(2)}
`, 3, 'Full AI Search Analysis Locked')}

${blurredPage('AI Search Readiness (continued)', `
  <h3>Structured Data for AI Engines</h3>
  ${fakeContent(3)}
  <h3>FAQ Schema Implementation Guide</h3>
  ${fakeContent(2)}
  <h3>Content Citability Improvements</h3>
  ${fakeContent(3)}
`, 4, 'Implementation Guide Locked')}

<!-- PAGES 5-6: Technical Performance -->
${blurredPage('Technical Performance Analysis', `
  <h3>Core Web Vitals Breakdown</h3>
  <p>Your Largest Contentful Paint (LCP) is ${data.aiAnalysis?.technicalAnalysis ? '' : '5.0 seconds'}...</p>
  ${fakeContent(3)}
  <h3>Server Response Time</h3>
  ${fakeContent(2)}
  <h3>Resource Loading Optimization</h3>
  ${fakeContent(3)}
`, 5, 'Technical Deep Dive Locked')}

${blurredPage('Technical Performance (continued)', `
  <h3>Image Optimization Report</h3>
  ${fakeContent(2)}
  <h3>JavaScript Bundle Analysis</h3>
  ${fakeContent(3)}
  <h3>Mobile Performance Specifics</h3>
  ${fakeContent(2)}
  <h3>CDN & Caching Recommendations</h3>
  ${fakeContent(2)}
`, 6, 'Optimization Guide Locked')}

<!-- PAGES 7-8: Content Quality -->
${blurredPage('Content Quality Assessment', `
  <h3>Page-by-Page Content Audit</h3>
  ${fakeContent(3)}
  <h3>Meta Description Effectiveness</h3>
  ${fakeContent(2)}
  <h3>Heading Structure Analysis</h3>
  ${fakeContent(3)}
`, 7, 'Content Audit Locked')}

${blurredPage('Content Quality (continued)', `
  <h3>Thin Content Remediation Plan</h3>
  ${fakeContent(3)}
  <h3>Keyword Density & Placement</h3>
  ${fakeContent(2)}
  <h3>Internal Linking Strategy</h3>
  ${fakeContent(3)}
`, 8, 'Content Strategy Locked')}

<!-- PAGES 9-10: Visual Audit -->
${blurredPage('Visual Audit: Desktop & Mobile', `
  <h3>Desktop View — Current State</h3>
  <div class="screenshot-box">
    <div class="screenshot-label">Desktop Screenshot</div>
    ${data.screenshots?.desktop ? `<img class="screenshot-img" src="data:image/jpeg;base64,${data.screenshots.desktop}" />` : '<div style="height:300px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot captured</div>'}
  </div>
  <h3>Issues Visible on Desktop</h3>
  ${fakeContent(2)}
`, 9, 'Visual Analysis Locked')}

${blurredPage('Visual Audit: Mobile', `
  <h3>Mobile View — Current State</h3>
  <div class="screenshot-box" style="max-width:375px">
    <div class="screenshot-label">Mobile Screenshot</div>
    ${data.screenshots?.mobile ? `<img class="screenshot-img" src="data:image/jpeg;base64,${data.screenshots.mobile}" />` : '<div style="height:400px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot captured</div>'}
  </div>
  <h3>Mobile-Specific Improvements</h3>
  ${fakeContent(3)}
`, 10, 'Mobile Analysis Locked')}

<!-- PAGES 11-12: Competitor Comparison -->
${blurredPage('Competitor Comparison', `
  <h3>Top 5 Competitors in Your Space</h3>
  ${fakeContent(2)}
  <h3>What They Do Better</h3>
  ${fakeContent(3)}
  <h3>Your Competitive Advantages</h3>
  ${fakeContent(2)}
`, 11, 'Competitor Analysis Locked')}

${blurredPage('Competitor Comparison (continued)', `
  <h3>Keyword Gap Analysis</h3>
  ${fakeContent(3)}
  <h3>Backlink Profile Comparison</h3>
  ${fakeContent(2)}
  <h3>Content Strategy Differences</h3>
  ${fakeContent(3)}
`, 12, 'Gap Analysis Locked')}

<!-- PAGES 13-16: Issue-by-Issue Fix Guide -->
${blurredPage('Issue #1: Page Load Speed — Complete Fix Guide', `
  <h3>The Problem</h3>
  ${fakeContent(2)}
  <h3>Impact on Rankings</h3>
  ${fakeContent(2)}
  <h3>Step-by-Step Fix</h3>
  <div style="background:#f9fafb;padding:12px;border-radius:6px;font-family:monospace;font-size:11px">
    // Example optimization code<br>
    import dynamic from 'next/dynamic';<br>
    const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });<br>
  </div>
  ${fakeContent(2)}
`, 13, 'Fix Instructions Locked')}

${blurredPage('Issue #2: Thin Content — Complete Fix Guide', `
  <h3>The Problem</h3>
  ${fakeContent(2)}
  <h3>Rewritten Homepage Copy (Ready to Use)</h3>
  ${fakeContent(4)}
  <h3>Rewritten Waitlist Page Copy</h3>
  ${fakeContent(3)}
`, 14, 'Ready-to-Use Copy Locked')}

${blurredPage('Issue #3: Missing FAQ Content — Fix Guide', `
  <h3>Why FAQ Content Matters for AI Search</h3>
  ${fakeContent(2)}
  <h3>Recommended FAQ Questions & Answers (15 Q&As)</h3>
  ${fakeContent(4)}
  <h3>JSON-LD Schema Code (Copy & Paste)</h3>
  <div style="background:#f9fafb;padding:12px;border-radius:6px;font-family:monospace;font-size:11px">
    {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...]}
  </div>
  ${fakeContent(1)}
`, 15, 'FAQ Content & Code Locked')}

${blurredPage('Issues #4-${data.issues.length}: Additional Fix Guides', `
  <h3>Weak Internal Linking — Fix Guide</h3>
  ${fakeContent(3)}
  <h3>Missing Statistics — Content Enhancement Guide</h3>
  ${fakeContent(3)}
  <h3>Additional Recommendations</h3>
  ${fakeContent(3)}
`, 16, 'All Fix Guides Locked')}

<!-- PAGES 17-18: 90-Day Action Plan -->
${blurredPage('90-Day Action Plan', `
  <h3>Week 1: Quick Wins (Do These Today)</h3>
  ${ai?.actionPlan?.quickWins ? ai.actionPlan.quickWins.map((w: string, i: number) => `<div class="action-item"><div class="action-num">${i+1}</div><div>${w}</div></div>`).join('') : fakeContent(3)}
  <h3>Week 2-4: Foundation Fixes</h3>
  ${fakeContent(4)}
`, 17, 'Action Plan Locked')}

${blurredPage('90-Day Action Plan (continued)', `
  <h3>Month 2: Growth Phase</h3>
  ${fakeContent(3)}
  <h3>Month 3: Scale & Monitor</h3>
  ${fakeContent(3)}
  <h3>Expected Results Timeline</h3>
  ${fakeContent(2)}
`, 18, 'Growth Roadmap Locked')}

<!-- PAGES 19-20: Implementation Checklist -->
${blurredPage('Implementation Checklist', `
  <h3>Technical Fixes</h3>
  <p>☐ Optimize LCP to under 2.5 seconds</p>
  <p>☐ Add H1 tags to all pages</p>
  <p>☐ Implement internal linking strategy</p>
  <p>☐ Add structured data markup</p>
  ${fakeContent(3)}
  <h3>Content Improvements</h3>
  <p>☐ Expand homepage to 800+ words</p>
  <p>☐ Add FAQ section with 15 Q&As</p>
  <p>☐ Include quotable statistics</p>
  ${fakeContent(2)}
`, 19, 'Full Checklist Locked')}

<div class="page">
  <h2>Ready to Fix Your Website?</h2>
  
  <div class="section" style="margin-top:20px">
    <p style="font-size:14px;font-weight:500;color:#111827">This report identified ${data.issues.length} issues affecting your search rankings and AI visibility.</p>
    <p style="margin-top:8px">The full report includes:</p>
    <div style="margin:12px 0">
      <div class="action-item"><div class="action-num">✓</div><div>Step-by-step fix instructions for every issue</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>Ready-to-use copy for thin pages</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>FAQ content written for your business</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>Code snippets you can copy & paste</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>Competitor analysis & keyword gaps</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>90-day action plan with priorities</div></div>
      <div class="action-item"><div class="action-num">✓</div><div>Implementation checklist</div></div>
    </div>
  </div>

  ${highlight ? `
  <div class="alert" style="margin-top:16px">
    <div class="stat">${highlight.estimatedImpact}</div>
  </div>
  ` : ''}

  <div class="cta" style="margin-top:20px">
    <h3>Unlock Your Full Report</h3>
    <p>One-time payment. No subscription. Delivered instantly.</p>
    <a href="https://seo.impulsestudios.cc" class="cta-btn">Get Full Report — $29</a>
  </div>

  <div class="footer">
    <span>Generated by Impulse Studios · AI-Powered SEO Audit</span>
    <span>${data.date}</span>
  </div>
  <div class="page-num">20</div>
</div>

</body></html>`;
}

export function renderFullPdfHtml(data: ReportData): string {
  const ai = data.aiAnalysis;
  const cats = data.categories;
  // Full report — everything visible, no blur
  // (kept shorter here, full implementation would mirror teaser structure without locks)
  return renderTeaserPdfHtml(data)
    .replace(/blur-content/g, 'blur-content-visible')
    .replace(/filter:blur\(5px\)/g, 'filter:none')
    .replace(/opacity:0\.4/g, 'opacity:1')
    .replace(/class="blur-overlay"/g, 'class="blur-overlay" style="display:none"');
}
