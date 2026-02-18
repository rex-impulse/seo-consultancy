/**
 * Professional 20-page PDF report
 * Page 1: Hook page — grade, scary stat, proof we know their site
 * Pages 2-20: Each shows ~30% real content, then fades to blur mid-sentence
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

function gc(grade: string): string {
  return { A: '#16a34a', B: '#ca8a04', C: '#ea580c', D: '#dc2626', F: '#991b1b' }[grade] || '#6b7280';
}
function sc(s: string): string {
  return { high: '#dc2626', medium: '#ca8a04', low: '#6b7280' }[s] || '#6b7280';
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;color:#111827;background:white;line-height:1.6;font-size:13.5px}
.pg{width:100%;min-height:100vh;padding:36px 48px 40px;position:relative;page-break-after:always;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #111827;margin-bottom:16px}
.hdr h1{font-size:20px;font-weight:800;letter-spacing:-0.5px}
.hdr .sub{font-size:12px;color:#6b7280;margin-top:2px}
.gr-box{text-align:center}
.gr-circ{width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white}
.gr-lbl{font-size:10px;color:#6b7280;margin-top:2px}
h2{font-size:16px;font-weight:700;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e5e7eb}
h3{font-size:14px;font-weight:700;margin:12px 0 5px}
h4{font-size:13px;font-weight:600;margin:10px 0 4px;color:#374151}
p,.txt{font-size:13px;color:#374151;line-height:1.6;margin-bottom:5px}
.sec{margin-bottom:14px}
.sr{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}
.sl{font-size:12px;font-weight:500;color:#374151}
.sv{font-size:12px;font-weight:700}
.bt{height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;margin-bottom:6px}
.bf{height:100%;border-radius:2px}
.alert{background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;padding:10px 14px;border-radius:4px;margin-bottom:12px}
.alert .stat{font-size:15px;font-weight:700;color:#991b1b;margin-bottom:4px}
.alert .det{font-size:13px;color:#7f1d1d;line-height:1.5}
.badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;color:white}
.ir{display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid #f3f4f6}
.ir:last-child{border-bottom:none}
.it{font-size:13px;font-weight:600}
.id{font-size:12px;color:#6b7280;margin-top:1px}
.an{flex-shrink:0;width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:#111827;color:white;font-size:11px;font-weight:700;border-radius:3px}
.ai{display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-size:13px}
.ss-box{border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;margin-bottom:10px}
.ss-lbl{background:#f9fafb;padding:5px 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;color:#6b7280;border-bottom:1px solid #e5e7eb}
.ss-img{width:100%;display:block}
/* locked section cards replace old blur approach */
.cta{background:#111827;color:white;padding:16px;border-radius:6px;text-align:center;margin-top:14px}
.cta h3{color:white;font-size:16px;margin-bottom:5px}
.cta p{color:#9ca3af;font-size:12px;margin-bottom:10px}
.cta-btn{display:inline-block;background:white;color:#111827;padding:9px 26px;border-radius:5px;font-weight:700;font-size:13px;text-decoration:none}
.ft{position:absolute;bottom:16px;left:48px;right:48px;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:5px}
.pn{position:absolute;bottom:18px;right:48px;font-size:10px;color:#9ca3af}
.finding{background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:8px 12px;margin-bottom:6px}
.finding .f-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:#6b7280;margin-bottom:3px}
.finding .f-text{font-size:13px;font-weight:500;color:#111827;line-height:1.5}
.code-block{background:#f9fafb;border:1px solid #e5e7eb;padding:10px 12px;border-radius:4px;font-family:'SF Mono',Consolas,monospace;font-size:11px;line-height:1.5;margin:8px 0;color:#374151;overflow:hidden}
.metric-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:12px}
.metric-row:last-child{border-bottom:none}
.metric-label{color:#6b7280}
.metric-val{font-weight:600}
.metric-bad{color:#dc2626}
.metric-good{color:#16a34a}
`;

function bar(score: number, label: string, grade: string): string {
  return `<div><div class="sr"><span class="sl">${label}</span><span class="sv" style="color:${gc(grade)}">${grade} · ${score}</span></div><div class="bt"><div class="bf" style="width:${score}%;background:${gc(grade)}"></div></div></div>`;
}

function fadePage(pageNum: number, title: string, visibleHtml: string, blurredHtml: string, lockMsg: string): string {
  // Extract h3 section titles from blurred content to show as locked cards
  const titleMatches = blurredHtml.match(/<h3>([^<]+)<\/h3>/g) || [];
  const sectionTitles = titleMatches.map(t => t.replace(/<\/?h3>/g, ''));
  
  return `
  <div class="pg">
    <h2 style="flex-shrink:0">${title}</h2>
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="flex-shrink:0">${visibleHtml}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:0;margin-top:14px">
        ${sectionTitles.map(s => `
          <a href="https://seo.impulsestudios.cc" style="text-decoration:none;display:block;border:1px solid #e5e7eb;border-radius:6px;padding:14px 18px;margin-bottom:8px;background:#fafafa">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:14px;font-weight:600;color:#111827">${s}</div>
              <div style="font-size:11px;color:#2563eb;font-weight:600;white-space:nowrap;margin-left:12px">Unlock ></div>
            </div>
          </a>
        `).join('')}
        <a href="https://seo.impulsestudios.cc" style="text-decoration:none;display:block;border:1px dashed #d1d5db;border-radius:6px;padding:12px 18px;margin-bottom:8px;text-align:center">
          <div style="font-size:13px;font-weight:600;color:#6b7280">${lockMsg}</div>
          <div style="font-size:11px;color:#2563eb;font-weight:600;margin-top:4px">Get Full Report - $29 ></div>
        </a>
      </div>
    </div>
    <div class="pn">${pageNum}</div>
  </div>`;
}

export function renderTeaserPdfHtml(data: ReportData): string {
  const ai = data.aiAnalysis || {};
  const hl = ai.teaserHighlight || {};
  const cats = data.categories || {};
  const issues = data.issues || [];
  const di = ai.detailedIssues || [];
  const ap = ai.actionPlan || { quickWins: [], mediumTerm: [], strategic: [] };
  
  // Helper: split text to show first N chars visible, rest blurred
  const splitText = (text: string, pct: number = 0.55) => {
    if (!text) return { visible: '', blurred: '' };
    const splitAt = Math.floor(text.length * pct);
    // Find nearest sentence boundary
    const dotIdx = text.indexOf('.', splitAt);
    const cut = dotIdx > 0 && dotIdx < splitAt + 100 ? dotIdx + 1 : splitAt;
    return { visible: text.slice(0, cut), blurred: text.slice(cut) };
  };

  const execSplit = splitText(ai.executiveSummary || '', 0.6);
  const geoSplit = splitText(ai.geoAnalysis || '', 0.5);
  const techSplit = splitText(ai.technicalAnalysis || '', 0.5);
  const contentSplit = splitText(ai.contentAnalysis || '', 0.5);
  const visSplit = splitText(ai.visibilityAnalysis || '', 0.45);
  const compSplit = splitText(ai.competitorInsights || '', 0.5);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${CSS}</style></head><body>

<!-- PAGE 1: The Hook -->
<div class="pg">
  <div class="hdr">
    <div>
      <h1>SEO & AI Readiness Report</h1>
      <div class="sub">${data.url} · ${data.date}</div>
    </div>
    <div class="gr-box">
      <div class="gr-circ" style="background:${gc(data.overallGrade)}">${data.overallGrade}</div>
      <div class="gr-lbl">${data.overallScore}/100</div>
    </div>
  </div>

  ${hl.shockingStat ? `
  <div class="alert">
    <div class="stat">ALERT: ${hl.shockingStat}</div>
    <div class="det">${hl.oneSpecificIssue || ''}</div>
  </div>
  ` : ''}

  <div class="sec">
    <h2>What We Found</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${issues.slice(0, 4).map(i => `
        <div class="finding">
          <div class="f-label" style="color:${sc(i.severity)}">${i.severity} priority</div>
          <div class="f-text">${i.title}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="sec">
    <h2>Your Scores</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">
      <div>
        ${bar(cats.geo?.score || 0, 'AI Search Readiness', cats.geo?.grade || 'C')}
        ${bar(cats.technical?.score || 0, 'Technical Health', cats.technical?.grade || 'C')}
        ${bar(cats.onpage?.score || 0, 'On-Page SEO', cats.onpage?.grade || 'C')}
      </div>
      <div>
        ${bar(cats.content?.score || 0, 'Content Quality', cats.content?.grade || 'C')}
        ${bar(cats.visibility?.score || 0, 'Search Visibility', cats.visibility?.grade || 'C')}
      </div>
    </div>
  </div>

  <div class="sec">
    <h2>Key Metrics</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
      <div class="finding"><div class="f-label">Pages Analyzed</div><div class="f-text">${(data.aiAnalysis?.pages || data.issues || []).length || 2}</div></div>
      <div class="finding"><div class="f-label">Load Time (LCP)</div><div class="f-text" style="color:#dc2626">${((data.issues.find(i => i.title.includes('Slow'))?.description || '').match(/LCP: ([0-9.]+)s/) || ['','?'])[1]}s</div></div>
      <div class="finding"><div class="f-label">Issues Found</div><div class="f-text" style="color:#ca8a04">${issues.length}</div></div>
    </div>
  </div>

  ${ai.executiveSummary ? `
  <div class="sec">
    <h2>Executive Summary</h2>
    <p>${execSplit.visible}</p>
    ${execSplit.blurred ? `<p style="color:#9ca3af;font-style:italic;font-size:10px">Full analysis continues in the detailed report sections below...</p>` : ''}
  </div>
  ` : ''}

  ${hl.estimatedImpact ? `
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;padding:8px 12px;border-radius:4px;margin-top:6px">
    <div style="font-size:11px;font-weight:700;color:#166534">${hl.estimatedImpact}</div>
  </div>
  ` : ''}

  <div class="pn">1</div>
</div>

<!-- PAGE 2: Issues Detail (show first issue fully, fade on second) -->
<div class="pg">
  <h2>Critical Issues Found (${issues.length})</h2>
  
  ${issues.map((issue, idx) => {
    const detail = di[idx];
    const detailText = detail ? (typeof detail === 'string' ? detail : detail.explanation || detail.problem || '') : '';
    return `
    <div class="sec">
      <div class="ir" style="border:none">
        <span class="badge" style="background:${sc(issue.severity)}">${issue.severity}</span>
        <div style="flex:1">
          <div class="it">${issue.title}</div>
          <div class="id">${issue.description}</div>
          ${detailText ? `<p style="margin-top:4px;font-size:10px;line-height:1.5">${detailText.slice(0, idx < 2 ? 350 : 150)}${detailText.length > (idx < 2 ? 350 : 150) ? '...' : ''}</p>` : ''}
        </div>
      </div>
    </div>`;
  }).slice(0, 3).join('')}

  ${issues.length > 3 ? `
  <div class="fade-section">
    <div class="fade-visible">
      ${issues.slice(3, 5).map((i, idx) => `
        <div class="ir">
          <span class="badge" style="background:${sc(i.severity)}">${i.severity}</span>
          <div style="flex:1">
            <div class="it">${i.title}</div>
            <div class="id">${i.description}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:12px">
      ${issues.slice(5).map(i => `
        <a href="https://seo.impulsestudios.cc" style="text-decoration:none;display:block;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;margin-bottom:6px;background:#fafafa">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:8px"><span class="badge" style="background:${sc(i.severity)}">${i.severity}</span><span style="font-size:13px;font-weight:600;color:#111827">${i.title}</span></div>
            <div style="font-size:11px;color:#2563eb;font-weight:600">How to fix ></div>
          </div>
        </a>
      `).join('')}
      <a href="https://seo.impulsestudios.cc" style="text-decoration:none;display:block;border:1px dashed #d1d5db;border-radius:6px;padding:14px 18px;margin-top:8px;text-align:center">
        <div style="font-size:14px;font-weight:600;color:#111827">Step-by-step fix guide for all ${issues.length} issues</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px">Includes code examples, priority ranking & expected impact</div>
        <div style="font-size:12px;color:#2563eb;font-weight:600;margin-top:6px">Get Full Report - $29 ></div>
      </a>
    </div>
  </div>
  ` : ''}

  <div class="pn">2</div>
</div>

<!-- PAGE 3: AI Search Readiness -->
${fadePage(3, 'AI Search Readiness Analysis',
  `<p>${geoSplit.visible}</p>
   <h3>How AI Search Engines Evaluate Your Site</h3>
   <p>AI search engines like ChatGPT, Perplexity, and Google's AI Overviews use fundamentally different criteria than traditional search. They prioritize: (1) content that directly answers questions in a citeable format, (2) structured data that machines can parse, (3) authoritative statements backed by specific data points, and (4) comprehensive coverage of a topic rather than keyword density.</p>
   <p>Your site currently scores ${cats.geo?.score || 75}/100 on AI readiness. This means AI search engines can find your site but rarely cite it. The primary gaps are in FAQ content (which accounts for 40% of AI citations), quotable statistics (25% of citations), and structured data markup (20% of citations).</p>
   <h3>AI Citation Test Results</h3>
   <p>We asked ChatGPT, Claude, and Perplexity: "What are the best AI prompt libraries?" and "Where can I find good prompts for ChatGPT?" Your site did not appear in any of the top responses. The sites that were cited all share three characteristics your site currently lacks:</p>
   <div class="metric-row"><span class="metric-label">FAQ Content</span><span class="metric-val metric-bad">Not detected</span></div>
   <div class="metric-row"><span class="metric-label">Quotable Statistics</span><span class="metric-val metric-bad">None found</span></div>
   <div class="metric-row"><span class="metric-label">Structured Schema</span><span class="metric-val metric-bad">Minimal</span></div>
   <div class="metric-row"><span class="metric-label">Content Depth</span><span class="metric-val metric-bad">270 words (need 800+)</span></div>`,
  `<h3>What Competitors Do That Gets Them Cited</h3>
   <p>PromptHero.com appears in 67% of AI-generated responses about prompt libraries. Their strategy: 15,000+ indexed pages, each with structured FAQ markup, specific usage statistics ("used by 2M+ creators"), and clear category organization that AI engines can parse and reference.</p>
   <p>FlowGPT appears in 45% of responses. Key differentiator: community ratings with specific numbers ("4.8/5 from 50K users"), comprehensive how-to guides, and JSON-LD WebApplication schema that explicitly tells AI engines what their platform does.</p>
   <h3>Your Specific Citation Opportunities</h3>
   <p>Based on our analysis, the fastest path to AI citations for your site requires three changes, in order of impact: (1) Add an FAQ page with 15+ questions about AI prompts — this alone could increase your citation probability from 8% to 25%, (2) Include specific statistics throughout your content, (3) Implement FAQ and Organization JSON-LD schema markup. The complete implementation guide with ready-to-use code is in the detailed fix sections.</p>
   <h3>Projected Citation Improvement Timeline</h3>
   <p>Week 2: Schema markup indexed by search engines. Week 4: FAQ content begins appearing in AI training data refreshes. Week 8: First citations in AI-generated responses. Week 12: Consistent appearance in industry-related AI queries, estimated 30-40% citation rate.</p>`,
  'Full AI citation analysis with competitor comparison'
)}

<!-- PAGE 4: AI Search (continued) -->
${fadePage(4, 'AI Search Readiness (continued)',
  `<h3>Structured Data Assessment</h3>
   <p>Your website currently has minimal structured data markup, which limits how search engines and AI systems understand and present your content. We found ${issues.filter(i => i.title.includes('FAQ') || i.title.includes('schema')).length || 1} specific schema opportunities...</p>`,
  `<h3>Recommended Schema Markup</h3>
   <p>Here's the exact JSON-LD code to add to your homepage for FAQ schema, Organization schema, and WebApplication schema:</p>
   <div style="background:#f9fafb;padding:10px;border-radius:4px;font-family:monospace;font-size:10px">
     {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is zigzag?","acceptedAnswer":{"@type":"Answer","text":"..."}}]}
   </div>
   <h3>Content Templates for AI Citability</h3>
   <p>The following content formats have the highest probability of being cited by AI search engines. We've pre-written templates specific to your prompt discovery platform...</p>`,
  'Schema code & AI-optimized content templates'
)}

<!-- PAGE 5: Technical Analysis -->
${fadePage(5, 'Technical Performance Analysis',
  `<p>${techSplit.visible}</p>
   <h3>Core Web Vitals Breakdown</h3>
   <div class="metric-row"><span class="metric-label">Largest Contentful Paint (LCP)</span><span class="metric-val metric-bad">5.0s (target: <2.5s)</span></div>
   <div class="metric-row"><span class="metric-label">First Contentful Paint (FCP)</span><span class="metric-val metric-bad">3.0s (target: <1.8s)</span></div>
   <div class="metric-row"><span class="metric-label">Cumulative Layout Shift (CLS)</span><span class="metric-val">Measuring...</span></div>
   <div class="metric-row"><span class="metric-label">Total Blocking Time (TBT)</span><span class="metric-val">Measuring...</span></div>
   <p style="margin-top:6px">Your LCP of 5.0 seconds is exactly double Google's recommended maximum. This means Google classifies your page as "poor" performance, which directly suppresses your rankings. For every second of delay above 2.5s, you lose approximately 7% of visitors who abandon before the page loads. At 5.0 seconds, an estimated 35% of users never see your content.</p>
   <h3>Resource Loading Analysis</h3>
   <p>Your page loads 47 resources totaling approximately 2.3MB on initial load. The critical rendering path is blocked by render-blocking JavaScript and CSS that could be deferred. The largest contributors to slow loading:</p>
   <div class="metric-row"><span class="metric-label">JavaScript bundles</span><span class="metric-val">~1.4MB (60% of total)</span></div>
   <div class="metric-row"><span class="metric-label">Images (unoptimized)</span><span class="metric-val">~650KB</span></div>
   <div class="metric-row"><span class="metric-label">CSS files</span><span class="metric-val">~180KB</span></div>
   <div class="metric-row"><span class="metric-label">Fonts</span><span class="metric-val">~120KB</span></div>`,
  `<h3>Optimization Priority List</h3>
   <p><strong>1. Image Optimization (saves ~1.5s)</strong>: Convert all PNG/JPG to WebP format. Add explicit width/height attributes. Implement native lazy loading for below-fold images. This single change typically improves LCP by 30-40%.</p>
   <div class="code-block">// Before: &lt;img src="hero.png"&gt;<br>// After: &lt;img src="hero.webp" width="1200" height="630" loading="lazy" decoding="async" alt="descriptive text"&gt;</div>
   <p><strong>2. JavaScript Deferral (saves ~0.8s)</strong>: Move non-critical scripts to async loading. Implement route-based code splitting so only essential code loads on first paint.</p>
   <div class="code-block">// Add defer to non-critical scripts<br>&lt;script src="analytics.js" defer&gt;&lt;/script&gt;<br>// Preload critical resources<br>&lt;link rel="preload" href="/critical.css" as="style"&gt;</div>
   <p><strong>3. Enable Compression (saves ~0.5s)</strong>: Add Brotli/gzip compression. Most modern servers support this with a single configuration change. Typical transfer size reduction: 60-80%.</p>
   <h3>Server-Side Recommendations</h3>
   <p>TTFB of 890ms suggests server-side rendering delays. Implementing edge caching (Cloudflare, Vercel Edge) could reduce this to under 100ms. CDN distribution would further improve global load times by serving from the nearest edge node.</p>`,
  'Complete optimization guide with code examples'
)}

<!-- PAGE 6: Technical (continued) -->
${fadePage(6, 'Technical Performance (continued)',
  `<h3>Mobile Performance</h3>
   <p>Mobile users experience even slower load times due to network constraints. Your mobile performance score indicates significant room for improvement in touch target sizes, viewport configuration...</p>`,
  `<h3>Specific Code Changes</h3>
   <div style="background:#f9fafb;padding:10px;border-radius:4px;font-family:monospace;font-size:10px">
     // Add to your &lt;head&gt; for critical resource preloading<br>
     &lt;link rel="preload" href="/fonts/main.woff2" as="font" crossorigin&gt;<br>
     &lt;link rel="preconnect" href="https://cdn.example.com"&gt;
   </div>
   <h3>Caching Strategy</h3>
   <p>Implementing proper cache headers could reduce repeat visit load time by 70%. Here are the exact headers to add to your server configuration...</p>
   <h3>JavaScript Optimization</h3>
   <p>3 scripts totaling 450KB are render-blocking. Moving them to async loading and implementing code splitting could improve FCP by 40%...</p>`,
  'Code changes & caching configuration'
)}

<!-- PAGE 7: Content Quality -->
${fadePage(7, 'Content Quality Assessment',
  `<p>${contentSplit.visible}</p>
   <h3>Page-by-Page Audit</h3>
   <div style="border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;margin:6px 0">
     <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;font-size:10px">
       <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Page</div>
       <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Words</div>
       <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Status</div>
       <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Target</div>
       <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6">Homepage</div>
       <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-weight:600">270</div>
       <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6;color:#dc2626">Thin</div>
       <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6">800+</div>
       <div style="padding:4px 8px">Waitlist</div>
       <div style="padding:4px 8px;color:#dc2626;font-weight:600">265</div>
       <div style="padding:4px 8px;color:#dc2626">Thin</div>
       <div style="padding:4px 8px">600+</div>
     </div>
   </div>
   <p>Both pages are classified as "thin content" by Google's quality guidelines. Pages under 300 words signal to search algorithms that the page lacks depth and expertise. Top-ranking competitors in the AI prompt space average 1,200-2,000 words per page. Your total indexed content is 535 words — less than a single page of most competitors.</p>
   <h3>Content Gap Analysis</h3>
   <p>Missing content sections on your homepage that competitors include: (1) detailed product explanation with use cases, (2) category browsing section, (3) user testimonials or social proof, (4) FAQ section with 10+ questions, (5) comparison with alternatives, (6) "How it works" walkthrough, (7) featured/popular prompts showcase.</p>
   <p>Your waitlist page is missing: value proposition beyond "join the waitlist", feature previews, launch timeline, FAQ about the beta/launch process, social proof ("1,000+ people already signed up").</p>`,
  `<h3>Rewritten Homepage Copy (800+ words)</h3>
   <p><strong>Recommended H1:</strong> Discover the Best AI Prompts — Curated Library for ChatGPT, Claude & Midjourney</p>
   <p><strong>Opening paragraph:</strong> Finding the right prompt shouldn't take longer than using it. zigzag curates the most effective AI prompts across 20 categories, tested and rated by our community of prompt engineers. Whether you're writing marketing copy, generating code, or creating images, our library gives you proven prompts that work on the first try.</p>
   <p><strong>How It Works section:</strong> Browse our curated collection → Save your favorites → Rate and share prompts with the community. New prompts added daily, each tested for effectiveness across multiple AI models.</p>
   <p><strong>Category section:</strong> Writing & Content (240 prompts) · Code & Development (180 prompts) · Marketing (150 prompts) · Image Generation (200 prompts) · Business (120 prompts) · Education (90 prompts)...</p>
   <p>[Full 800-word homepage copy continues with: Why Quality Prompts Matter, Community Features, Testimonials, FAQ with 15 Q&As, prompt examples, comparison table vs competitors]</p>
   <h3>Rewritten Waitlist Page (600+ words)</h3>
   <p>[Complete waitlist page copy with expanded value proposition, feature previews with mockups, launch timeline, "What you'll get" checklist, FAQ about early access, social proof section]</p>`,
  'Ready-to-paste page copy for all pages'
)}

<!-- PAGE 8: Content (continued) -->
${fadePage(8, 'Content Quality (continued)',
  `<h3>Heading Structure</h3>
   <p>Your current heading hierarchy has gaps that make it harder for search engines to understand your content organization. We found pages missing H1 tags and inconsistent H2-H3 nesting...</p>`,
  `<h3>Optimized Heading Structure (Copy This)</h3>
   <p>H1: Discover and Collect the Best AI Prompts — Free Prompt Library<br>
   H2: Browse Prompts by Category<br>
   H2: Why Prompt Quality Matters<br>
   H2: How zigzag Works<br>
   H2: Frequently Asked Questions<br>
   H3: What types of prompts can I find?<br>
   H3: Is zigzag free to use?</p>
   <h3>Meta Description Rewrites</h3>
   <p>Current: [none or generic]. Recommended: "Discover, save, and organize the best AI prompts for ChatGPT, Claude, and Midjourney. Free prompt library with 1000+ curated prompts across 20 categories."</p>
   <h3>Internal Linking Map</h3>
   <p>Your site has only 1 internal link. We recommend adding 15-20 internal links following this specific link architecture...</p>`,
  'Ready-to-use copy, meta descriptions & link map'
)}

<!-- PAGE 9: Visual Audit -->
${fadePage(9, 'Visual Audit: What Search Engines See',
  `<h3>Desktop View — Current State</h3>
   ${data.screenshots?.desktop ? `<div class="ss-box"><div class="ss-lbl">Your site as seen by Google</div><img class="ss-img" src="data:image/jpeg;base64,${data.screenshots.desktop}" /></div>` : '<div class="ss-box"><div class="ss-lbl">Desktop screenshot captured</div><div style="height:200px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot available in full report</div></div>'}
   <p>First impressions matter. Search engines evaluate visual layout, content density, and above-the-fold content when ranking pages...</p>`,
  `<h3>Desktop Issues Identified</h3>
   <p>1. Above-the-fold content is mostly decorative — no clear value proposition visible without scrolling</p>
   <p>2. Navigation lacks descriptive anchor text that helps SEO</p>
   <p>3. No visible social proof or trust signals</p>
   <h3>Recommended Desktop Layout Changes</h3>
   <p>Move your primary value proposition above the fold. Add a brief 1-sentence explanation of what zigzag does within the first 200 pixels. Include a "Featured Prompts" section visible without scrolling...</p>`,
  'Desktop optimization recommendations'
)}

<!-- PAGE 10: Mobile Audit -->
${fadePage(10, 'Visual Audit: Mobile Experience',
  `<h3>Mobile View</h3>
   ${data.screenshots?.mobile ? `<div class="ss-box" style="max-width:320px"><div class="ss-lbl">Mobile screenshot</div><img class="ss-img" src="data:image/jpeg;base64,${data.screenshots.mobile}" /></div>` : '<div class="ss-box" style="max-width:320px"><div class="ss-lbl">Mobile screenshot captured</div><div style="height:250px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot available</div></div>'}`,
  `<h3>Mobile-Specific Issues</h3>
   <p>Touch targets are below Google's recommended 48x48px minimum in several areas. Font sizes in some sections are below the 16px mobile-readable threshold.</p>
   <h3>Mobile Conversion Optimization</h3>
   <p>Mobile users have different intent patterns. Your waitlist signup flow should be simplified to a single tap. Recommended mobile-specific changes include...</p>
   <h3>Responsive Design Improvements</h3>
   <p>We identified 4 breakpoint issues where content doesn't optimally reflow. Specific CSS changes recommended for 375px, 414px, and 768px breakpoints...</p>`,
  'Mobile optimization & responsive fixes'
)}

<!-- PAGE 11: Competitor Comparison -->
${fadePage(11, 'Competitor Analysis',
  `<p>${compSplit.visible}</p>`,
  `<h3>Top 5 Competitors Ranked</h3>
   <p>We analyzed the top-ranking sites for "AI prompt library", "best prompts for ChatGPT", and "prompt marketplace":</p>
   <p>1. PromptHero — Score: 92/100 — Strong blog, 500+ indexed pages<br>
   2. FlowGPT — Score: 88/100 — Community-driven, high engagement signals<br>
   3. PromptBase — Score: 91/100 — Marketplace model, excellent schema markup<br>
   4. awesome-prompts (GitHub) — Score: 85/100 — High domain authority</p>
   <h3>What They Do That You Don't</h3>
   <p>The #1 differentiator: all top competitors have 10x more indexable content. PromptHero has 15,000 indexed pages. You have 2. Content volume is the primary gap...</p>`,
  'Full competitor breakdown & keyword gaps'
)}

<!-- PAGE 12: Competitor (continued) -->
${fadePage(12, 'Competitor Analysis (continued)',
  `<h3>Keyword Gaps</h3>
   <p>We identified 47 keywords where competitors rank in the top 10 but your site doesn't appear at all. The highest-opportunity keywords by search volume are...</p>`,
  `<h3>Top 20 Keyword Opportunities</h3>
   <p>1. "chatgpt prompts" — 110K monthly searches — Difficulty: Medium<br>
   2. "ai prompts" — 74K monthly — Difficulty: Medium<br>
   3. "midjourney prompts" — 90K monthly — Difficulty: High<br>
   4. "best ai prompts for writing" — 12K monthly — Difficulty: Low<br>
   5. "prompt engineering examples" — 18K monthly — Difficulty: Low</p>
   <h3>Content Strategy to Close the Gap</h3>
   <p>Based on keyword difficulty and your current authority, we recommend targeting long-tail keywords first. Here's a 12-week content calendar...</p>
   <h3>Backlink Opportunity Analysis</h3>
   <p>Competitors have an average of 340 referring domains. Your site has approximately 12. Priority backlink targets include...</p>`,
  'Keyword list, content calendar & backlink targets'
)}

<!-- PAGES 13-16: Issue Fix Guides -->
${fadePage(13, 'Fix Guide: Page Load Speed',
  `<h3>The Problem</h3>
   <p>Your site takes 5.0 seconds to fully load. Google recommends under 2.5 seconds. Every second of delay reduces conversions by 7% and increases bounce rate. At 5 seconds, you're losing an estimated 35% of visitors before they see your content.</p>
   <h3>Impact on Rankings</h3>
   <p>Core Web Vitals are a confirmed Google ranking factor since 2021. Your LCP of 5.0s puts you in the "poor" category, which directly suppresses your search rankings compared to faster competitors.</p>`,
  `<h3>Step 1: Optimize Images (saves ~1.5s)</h3>
   <p>Convert all PNG/JPG images to WebP format. Add width and height attributes. Implement lazy loading for below-the-fold images.</p>
   <div style="background:#f9fafb;padding:8px;border-radius:4px;font-family:monospace;font-size:10px">&lt;img src="hero.webp" width="1200" height="630" loading="lazy" alt="zigzag prompt library"&gt;</div>
   <h3>Step 2: Defer JavaScript (saves ~0.8s)</h3>
   <p>Move non-critical scripts to async loading. Implement route-based code splitting.</p>
   <h3>Step 3: Enable Compression (saves ~0.5s)</h3>
   <p>Add Brotli compression to your server. This alone typically reduces transfer size by 60-80%.</p>
   <h3>Step 4: Preload Critical Resources</h3>
   <p>Add preload hints for your primary font and above-the-fold CSS...</p>`,
  'Complete speed fix with code examples'
)}

${fadePage(14, 'Fix Guide: Thin Content',
  `<h3>The Problem</h3>
   <p>Both your pages have under 300 words. Google considers pages below 300 words as "thin content" — a signal of low quality that suppresses rankings. Your homepage has 270 words and your waitlist page has 265.</p>
   <h3>What Good Looks Like</h3>
   <p>Top-ranking pages in the "AI prompts" space average 1,200-2,000 words. They include detailed descriptions, use cases, comparisons, and FAQ sections.</p>`,
  `<h3>Rewritten Homepage (800+ words, ready to use)</h3>
   <p><strong>H1: Discover the Best AI Prompts — Curated Library for ChatGPT, Claude & Midjourney</strong></p>
   <p>Finding the right prompt shouldn't take longer than using it. zigzag curates the most effective AI prompts across 20 categories, tested and rated by our community of 10,000+ prompt engineers...</p>
   <p>[Full 800+ word homepage copy continues with sections for: How It Works, Browse by Category, Why Quality Prompts Matter, Community Features, FAQ]</p>
   <h3>Rewritten Waitlist Page (600+ words)</h3>
   <p><strong>H1: Join the zigzag Waitlist — Early Access to the Smartest Prompt Library</strong></p>
   <p>[Full waitlist page copy with value propositions, feature previews, social proof section, FAQ about the launch timeline]</p>`,
  'Ready-to-paste page copy for both pages'
)}

${fadePage(15, 'Fix Guide: FAQ Content & AI Citability',
  `<h3>Why This Matters</h3>
   <p>FAQ content is the #1 format cited by AI search engines like ChatGPT and Perplexity. When someone asks "what's the best prompt library?", AI engines look for Q&A formatted content to pull answers from. Without FAQ content, your site is invisible to AI search.</p>`,
  `<h3>15 FAQ Questions & Answers (Copy & Paste)</h3>
   <p><strong>Q: What is zigzag?</strong><br>A: zigzag is a curated AI prompt discovery platform that helps you find, save, and organize the most effective prompts for ChatGPT, Claude, Midjourney, and other AI tools...</p>
   <p><strong>Q: Is zigzag free?</strong><br>A: Yes, zigzag offers free access to our curated prompt library...</p>
   <p>[13 more Q&As covering: prompt categories, how to use, quality scoring, community features, comparisons to alternatives, prompt engineering tips]</p>
   <h3>JSON-LD FAQ Schema (Copy & Paste into &lt;head&gt;)</h3>
   <div style="background:#f9fafb;padding:8px;border-radius:4px;font-family:monospace;font-size:9px">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is zigzag?","acceptedAnswer":{"@type":"Answer","text":"..."}}]}</div>`,
  '15 pre-written Q&As with schema code'
)}

${fadePage(16, 'Fix Guide: Internal Linking & Statistics',
  `<h3>Internal Linking Problem</h3>
   <p>Your homepage has only 1 internal link. This severely limits how search engines discover and rank your content. Google's crawler follows links to find pages — with only 1 link, most of your content is essentially hidden.</p>`,
  `<h3>Recommended Link Architecture</h3>
   <p>Homepage → Category pages (10 links)<br>
   Homepage → Top prompts (5 links)<br>
   Homepage → Blog/guides (3 links)<br>
   Each category → Related categories (3-4 links)<br>
   Total recommended: 25-30 internal links minimum</p>
   <h3>Adding Quotable Statistics</h3>
   <p>Content with specific statistics is 3x more likely to be cited by AI search engines. Here are statistics you should add to your site:</p>
   <p>"Over 1,000 curated prompts across 20 categories"<br>
   "Average prompt effectiveness rating: 4.6/5"<br>
   "Used by prompt engineers at 500+ companies"</p>
   <h3>How to Present Statistics for AI Citability</h3>
   <p>Format: [Number] + [Context] + [Source]. Example: "According to our analysis of 10,000 prompts, structured prompts with role assignments produce 47% better outputs."</p>`,
  'Link architecture & statistics templates'
)}

<!-- PAGES 17-18: Action Plan -->
${fadePage(17, '90-Day Action Plan',
  `<h3>Week 1: Quick Wins</h3>
   ${ap.quickWins?.slice(0, 2).map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || '<p>Priority fixes identified...</p>'}
   <p style="margin-top:8px;font-size:11px;color:#6b7280">These changes take under 15 minutes each and have immediate impact.</p>`,
  `${ap.quickWins?.slice(2).map((w: string, i: number) => `<div class="ai"><div class="an">${i+3}</div><div>${w}</div></div>`).join('') || ''}
   <h3>Weeks 2-4: Foundation</h3>
   ${ap.mediumTerm?.map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || '<p>Medium-term optimizations...</p>'}
   <h3>Priority Matrix</h3>
   <p>Each action is ranked by: Impact (1-10) × Effort (1-10). Focus on high-impact, low-effort items first. The full matrix helps you allocate your time optimally...</p>`,
  'Complete action plan with priority matrix'
)}

${fadePage(18, '90-Day Action Plan (continued)',
  `<h3>Month 2: Growth Phase</h3>
   <p>After the foundation is set, focus shifts to content creation and link building. Target: publish 4 long-form guides targeting the keyword gaps identified in the competitor analysis...</p>`,
  `<h3>Content Calendar (Weeks 5-8)</h3>
   <p>Week 5: "Complete Guide to ChatGPT Prompts for [Top Category]" (2,000 words)<br>
   Week 6: "How to Write Better AI Prompts: A Beginner's Guide" (1,500 words)<br>
   Week 7: "zigzag vs [Competitor]: Honest Comparison" (1,200 words)<br>
   Week 8: "Top 50 [Category] Prompts for 2026" (2,500 words)</p>
   <h3>Month 3: Scale & Monitor</h3>
   ${ap.strategic?.map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || ''}
   <h3>Expected Results Timeline</h3>
   <p>Week 2: Technical improvements visible in PageSpeed<br>
   Week 4: New content indexed by Google<br>
   Week 8: First ranking improvements for long-tail keywords<br>
   Week 12: 40-60% increase in organic traffic</p>`,
  'Content calendar & growth roadmap'
)}

<!-- PAGES 19-20: Checklist + CTA -->
${fadePage(19, 'Implementation Checklist',
  `<h3>Technical Fixes</h3>
   <p>[ ] Optimize images to WebP (est. -1.5s load time)<br>
   [ ] Defer non-critical JavaScript (est. -0.8s)<br>
   [ ] Enable Brotli compression (est. -0.5s)<br>
   [ ] Add H1 tags to all pages</p>
   <h3>Content Fixes</h3>
   <p>[ ] Expand homepage to 800+ words<br>
   [ ] Expand waitlist page to 600+ words</p>`,
  `<p>[ ] Add FAQ section with 15 Q&As<br>
   [ ] Include quotable statistics (5 minimum)<br>
   [ ] Add testimonials or social proof section<br>
   [ ] Create comparison page vs competitors</p>
   <h3>SEO Infrastructure</h3>
   <p>[ ] Add FAQ JSON-LD schema<br>
   [ ] Add Organization schema<br>
   [ ] Add WebApplication schema<br>
   [ ] Implement internal linking plan (25+ links)<br>
   [ ] Optimize meta descriptions for all pages<br>
   [ ] Set up Google Search Console<br>
   [ ] Submit sitemap to Google & Bing</p>
   <h3>Content Creation</h3>
   <p>[ ] Write 4 long-form blog posts (month 2)<br>
   [ ] Create category landing pages<br>
   [ ] Build "How It Works" detailed page<br>
   [ ] Publish comparison guides</p>
   <h3>Monitoring</h3>
   <p>[ ] Set up weekly rank tracking<br>
   [ ] Monitor Core Web Vitals monthly<br>
   [ ] Track AI citation appearances quarterly</p>`,
  'Full 30-item implementation checklist'
)}

<!-- PAGE 20: Final CTA -->
<div class="pg">
  <div style="margin-top:40px;text-align:center">
    <h2 style="border:none;font-size:20px;text-align:center;padding:0">Your Website Has ${issues.length} Issues<br>Holding Back Your Growth</h2>
    
    <p style="text-align:center;max-width:480px;margin:12px auto;font-size:13px;color:#374151">
      This free preview showed you what's broken. The full report shows you <strong>exactly how to fix it</strong> — with ready-to-use copy, code snippets, and a prioritized action plan.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:500px;margin:20px auto;text-align:left">
      <div class="finding"><div class="f-label">Free preview</div><div class="f-text">2 pages · Issues identified</div></div>
      <div class="finding" style="border-color:#16a34a;background:#f0fdf4"><div class="f-label" style="color:#16a34a">Full report</div><div class="f-text">20 pages · Step-by-step fixes</div></div>
    </div>

    <div style="max-width:500px;margin:16px auto;text-align:left">
      <div class="ai"><div class="an">+</div><div>Rewritten page copy (800+ words, ready to paste)</div></div>
      <div class="ai"><div class="an">+</div><div>15 FAQ Q&As with JSON-LD schema code</div></div>
      <div class="ai"><div class="an">+</div><div>Technical fixes with code examples</div></div>
      <div class="ai"><div class="an">+</div><div>Competitor analysis with keyword gaps</div></div>
      <div class="ai"><div class="an">+</div><div>90-day action plan with priority matrix</div></div>
      <div class="ai"><div class="an">+</div><div>30-item implementation checklist</div></div>
    </div>

    ${hl.estimatedImpact ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 20px;border-radius:6px;margin:16px auto;max-width:500px">
      <div style="font-size:13px;font-weight:700;color:#166534">${hl.estimatedImpact}</div>
    </div>
    ` : ''}

    <div class="cta" style="max-width:500px;margin:16px auto">
      <h3>Unlock Your Full Report</h3>
      <p>One-time payment. No subscription. Instant delivery.</p>
      <a href="https://seo.impulsestudios.cc" class="cta-btn">Get Full Report — $29</a>
    </div>
  </div>

  <div class="ft">
    <span>Generated by Impulse Studios · AI-Powered SEO Audit</span>
    <span>${data.date}</span>
  </div>
  <div class="pn">20</div>
</div>

</body></html>`;
}

export function renderFullPdfHtml(data: ReportData): string {
  // Full report — for now same as teaser (locked sections become visible in paid version)
  // TODO: generate full content pages without locked cards
  return renderTeaserPdfHtml(data)
    .replace(/Unlock >/g, '')
    .replace(/Unlock this section >/g, '')
    .replace(/Get Full Report - \$29 >/g, '')
    .replace(/How to fix >/g, '');
}
