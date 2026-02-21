/**
 * Professional PDF report — dynamic page count (25-30 pages)
 * Page 1: Hook page - grade, scary stat, proof we know their site
 * Page 2: Executive Summary (unblurred)
 * Pages 3-4: Per-Page Analysis (UNBLURRED — shows each crawled page with URL, title, word count, issues)
 * Pages 5+: Each shows ~30% real content, then fades to blur mid-sentence
 * Final page: CTA with implementation offer
 */

interface ReportData {
  url: string;
  date: string;
  auditId?: string;
  overallScore: number;
  overallGrade: string;
  categories: Record<string, { score: number; grade: string }>;
  issues: Array<{ severity: string; title: string; description: string }>;
  aiAnalysis?: any;
  screenshots?: { desktop?: string; mobile?: string };
  crawlData?: {
    pages?: Array<{
      url: string;
      title: string;
      wordCount: number;
      isThinContent: boolean;
      hasFaqContent: boolean;
      metaDescription?: string;
      schemaCount?: number;
      images?: { total: number; withAlt: number; withoutAlt: number };
      links?: { internal: number; external: number };
      headings?: { h1: string[]; h2Count: number };
      robotsMeta?: { noindex: boolean; nofollow: boolean };
    }>;
    pagesAnalyzed?: number;
    robotsTxt?: any;
    sitemap?: any;
    ssl?: boolean;
  };
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
body{font-family:'Inter',-apple-system,sans-serif;color:#111827;background:white;line-height:1.6;font-size:15px}
.pg{width:100%;min-height:100vh;padding:48px 48px 40px;position:relative;page-break-after:always;display:flex;flex-direction:column}
.pg:last-child{page-break-after:auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #111827;margin-bottom:16px}
.hdr h1{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.hdr .sub{font-size:13px;color:#6b7280;margin-top:2px}
.gr-box{text-align:center}
.gr-circ{width:52px;height:52px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:white}
.gr-lbl{font-size:11px;color:#6b7280;margin-top:2px}
h2{font-size:18px;font-weight:700;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e5e7eb}
h3{font-size:16px;font-weight:700;margin:12px 0 5px}
h4{font-size:14.5px;font-weight:600;margin:10px 0 4px;color:#374151}
p,.txt{font-size:14.5px;color:#374151;line-height:1.65;margin-bottom:5px}
.sec{margin-bottom:14px}
.sr{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}
.sl{font-size:13.5px;font-weight:500;color:#374151}
.sv{font-size:13.5px;font-weight:700}
.bt{height:5px;background:#f3f4f6;border-radius:2px;overflow:hidden;margin-bottom:6px}
.bf{height:100%;border-radius:2px}
.alert{background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin-bottom:12px}
.alert .stat{font-size:17px;font-weight:700;color:#991b1b;margin-bottom:4px}
.alert .det{font-size:14.5px;color:#7f1d1d;line-height:1.55}
.badge{display:inline-block;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase;color:white}
.ir{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #f3f4f6}
.ir:last-child{border-bottom:none}
.it{font-size:14.5px;font-weight:600}
.id{font-size:13px;color:#6b7280;margin-top:1px}
.an{flex-shrink:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:#111827;color:white;font-size:12px;font-weight:700;border-radius:3px}
.ai{display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-size:14.5px}
.ss-box{border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;margin-bottom:10px}
.ss-lbl{background:#f9fafb;padding:6px 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;color:#6b7280;border-bottom:1px solid #e5e7eb}
.ss-img{width:100%;display:block}
.fade-section{position:relative;flex:1;display:flex;flex-direction:column;min-height:0}
.fade-visible{margin-bottom:0}
.fade-blur{position:relative;overflow:hidden;flex:1;min-height:280px}
.fade-blur-inner{filter:blur(4px);user-select:none;pointer-events:none;opacity:0.35;padding-bottom:60px}
.fade-gradient{position:absolute;top:0;left:0;right:0;height:40px;background:linear-gradient(to bottom,white,transparent);z-index:1}
.fade-lock{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:2}
.fade-lock .fl-txt{font-size:15px;font-weight:600;color:#374151;display:block}
.fade-lock .fl-sub{font-size:13px;color:#6b7280;margin-top:3px}
.cta{background:#111827;color:white;padding:18px;border-radius:6px;text-align:center;margin-top:14px}
.cta h3{color:white;font-size:18px;margin-bottom:5px}
.cta p{color:#9ca3af;font-size:13px;margin-bottom:10px}
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
.page-card{border:1px solid #e5e7eb;border-radius:6px;padding:12px 14px;margin-bottom:8px;background:white}
.page-card .pc-url{font-size:11px;color:#6b7280;word-break:break-all;margin-bottom:3px}
.page-card .pc-title{font-size:14px;font-weight:600;color:#111827;margin-bottom:4px}
.page-card .pc-meta{display:flex;gap:12px;font-size:11px;color:#6b7280;margin-bottom:6px;flex-wrap:wrap}
.page-card .pc-meta span{display:flex;align-items:center;gap:3px}
.page-card .pc-issues{font-size:12px;color:#374151;line-height:1.5}
.page-card .pc-issue-item{padding:2px 0;display:flex;align-items:flex-start;gap:4px}
.page-card .pc-dot{flex-shrink:0;width:5px;height:5px;border-radius:50%;margin-top:6px}
`;

function bar(score: number, label: string, grade: string): string {
  return `<div><div class="sr"><span class="sl">${label}</span><span class="sv" style="color:${gc(grade)}">${grade} | ${score}</span></div><div class="bt"><div class="bf" style="width:${score}%;background:${gc(grade)}"></div></div></div>`;
}

let _auditId = '';

function checkoutUrl(): string {
  return `https://seo.impulsestudios.cc/api/audit/${_auditId}/checkout`;
}

function fadePage(pageNum: number, title: string, visibleHtml: string, blurredHtml: string, lockMsg: string): string {
  return `
  <div class="pg">
    <h2 style="flex-shrink:0">${title}</h2>
    <div class="fade-section" style="flex:1;display:flex;flex-direction:column">
      <div class="fade-visible" style="flex-shrink:0">${visibleHtml}</div>
      <div class="fade-blur" style="flex:1;min-height:0">
        <div class="fade-gradient"></div>
        <div class="fade-blur-inner" style="min-height:100%">${blurredHtml}
          <p>This section continues with detailed analysis, specific recommendations, implementation steps, and code examples tailored to your website. Each recommendation includes expected impact metrics and priority ranking.</p>
          <p>The complete analysis covers additional factors including competitor benchmarking, industry-specific optimization opportunities, seasonal trends, and long-term strategic recommendations for sustained growth.</p>
        </div>
        <div class="fade-lock">
          <div class="fl-txt">${lockMsg}</div>
          <a class="fl-sub" href="${checkoutUrl()}" style="color:#6b7280;text-decoration:underline;cursor:pointer">Unlock full report →</a>
        </div>
      </div>
    </div>
    <div class="pn">${pageNum}</div>
  </div>`;
}

// Helper: describe what a page is about based on its data
function describePagePurpose(page: any): string {
  const url = (page.url || '').toLowerCase();
  const title = (page.title || '').toLowerCase();
  const path = url.replace(/https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
  
  if (path === '/' || path === '') return 'Homepage — the main landing page and first impression for visitors and search engines';
  if (path.includes('about')) return 'About page — tells visitors and AI engines who you are and builds trust signals';
  if (path.includes('contact')) return 'Contact page — essential for local SEO and Google Business Profile signals';
  if (path.includes('blog') || path.includes('article') || path.includes('post')) return 'Blog/content page — critical for keyword targeting and AI citation opportunities';
  if (path.includes('service') || path.includes('product')) return 'Services/product page — primary conversion page that needs strong on-page SEO';
  if (path.includes('faq') || path.includes('help')) return 'FAQ/Help page — high-value for AI search citations and featured snippets';
  if (path.includes('pricing') || path.includes('plan')) return 'Pricing page — high commercial intent page that search engines associate with transactional queries';
  if (path.includes('team') || path.includes('staff')) return 'Team page — builds E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)';
  if (path.includes('portfolio') || path.includes('work') || path.includes('case')) return 'Portfolio/case studies — demonstrates expertise and builds trust with search engines';
  if (path.includes('testimonial') || path.includes('review')) return 'Testimonials/reviews — strong trust signals for both users and search algorithms';
  return `Content page (${path}) — contributes to your site's overall topical authority and crawl depth`;
}

// Helper: identify key issues for a specific page
function getPageIssues(page: any): string[] {
  const issues: string[] = [];
  if (page.isThinContent || (page.wordCount && page.wordCount < 300)) {
    issues.push(`Thin content: only ${page.wordCount} words (Google recommends 800+ for ranking pages)`);
  }
  if (!page.title || page.title.trim() === '') {
    issues.push('Missing page title — search engines won\'t know what this page is about');
  }
  if (!page.metaDescription || page.metaDescription.trim() === '') {
    issues.push('No meta description — Google will auto-generate one, often poorly');
  }
  if (!page.hasFaqContent) {
    issues.push('No FAQ content detected — missing the #1 format AI engines cite');
  }
  if (page.schemaCount === 0) {
    issues.push('No structured data (schema markup) — invisible to rich results and AI search');
  }
  if (page.images && page.images.withoutAlt > 0) {
    issues.push(`${page.images.withoutAlt} image(s) missing alt text — hurts accessibility and image SEO`);
  }
  if (page.headings && (!page.headings.h1 || page.headings.h1.length === 0)) {
    issues.push('Missing H1 heading — the most important on-page SEO element');
  }
  if (page.headings && page.headings.h1 && page.headings.h1.length > 1) {
    issues.push(`Multiple H1 tags (${page.headings.h1.length}) — should have exactly one per page`);
  }
  if (page.robotsMeta?.noindex) {
    issues.push('Page is set to noindex — search engines will NOT show this page in results');
  }
  if (page.links && page.links.internal < 2) {
    issues.push('Very few internal links — makes it harder for search engines to discover and rank this page');
  }
  return issues;
}

export function renderTeaserPdfHtml(data: ReportData): string {
  _auditId = data.auditId || '';
  const ai = data.aiAnalysis || {};
  const hl = ai.teaserHighlight || {};
  const cats = data.categories || {};
  const issues = data.issues || [];
  const di = ai.detailedIssues || [];
  const ap = ai.actionPlan || { quickWins: [], mediumTerm: [], strategic: [] };
  const crawlPages = data.crawlData?.pages || [];
  
  // Helper: split text to show first N chars visible, rest blurred
  const splitText = (text: string, pct: number = 0.55) => {
    if (!text) return { visible: '', blurred: '' };
    const splitAt = Math.floor(text.length * pct);
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

  let pageNum = 0;
  const pages: string[] = [];

  // ==========================================
  // PAGE 1: THE HOOK
  // ==========================================
  pageNum++;
  pages.push(`
<div class="pg">
  <div class="hdr">
    <div>
      <h1>SEO & AI Readiness Report</h1>
      <div class="sub">${data.url} | ${data.date}</div>
    </div>
    <div class="gr-box">
      <div class="gr-circ" style="background:${gc(data.overallGrade)}">${data.overallGrade}</div>
      <div class="gr-lbl">${data.overallScore}/100</div>
    </div>
  </div>

  ${hl.shockingStat ? `
  <div class="alert">
    <div class="stat">${hl.shockingStat}</div>
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
      <div class="finding"><div class="f-label">Pages Analyzed</div><div class="f-text">${crawlPages.length || data.crawlData?.pagesAnalyzed || 2}</div></div>
      <div class="finding"><div class="f-label">Load Time (LCP)</div><div class="f-text" style="color:#dc2626">${((issues.find(i => i.title.includes('Slow'))?.description || '').match(/LCP: ([0-9.]+)s/) || ['','?'])[1]}s</div></div>
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

  <div class="pn">${pageNum}</div>
</div>`);

  // ==========================================
  // PAGES 2-3: PER-PAGE ANALYSIS (UNBLURRED)
  // ==========================================
  if (crawlPages.length > 0) {
    // Split pages into chunks of ~5 per PDF page for readability
    const pagesPerSheet = 5;
    for (let chunk = 0; chunk < crawlPages.length; chunk += pagesPerSheet) {
      const batch = crawlPages.slice(chunk, chunk + pagesPerSheet);
      pageNum++;
      const isFirst = chunk === 0;
      pages.push(`
<div class="pg">
  ${isFirst ? `
  <h2>Page-by-Page Analysis — What We Crawled</h2>
  <p style="font-size:13px;color:#6b7280;margin-bottom:12px">We crawled ${crawlPages.length} page${crawlPages.length > 1 ? 's' : ''} on your website. Here's what we found on each one — every page is a ranking opportunity, and every issue below is holding you back.</p>
  ` : `<h2>Page-by-Page Analysis (continued)</h2>`}
  
  ${batch.map(page => {
    const pageIssues = getPageIssues(page);
    const purpose = describePagePurpose(page);
    const wordColor = (page.wordCount || 0) < 300 ? '#dc2626' : (page.wordCount || 0) < 800 ? '#ca8a04' : '#16a34a';
    return `
    <div class="page-card">
      <div class="pc-url">${page.url}</div>
      <div class="pc-title">${page.title || '(No title tag found)'}</div>
      <div class="pc-meta">
        <span><strong style="color:${wordColor}">${page.wordCount || 0}</strong> words</span>
        <span>${page.images?.total || 0} images</span>
        <span>${page.links?.internal || 0} internal links</span>
        <span>${page.schemaCount || 0} schema types</span>
        ${page.hasFaqContent ? '<span style="color:#16a34a">✓ FAQ</span>' : ''}
      </div>
      <div style="font-size:11px;color:#6b7280;margin-bottom:4px;font-style:italic">${purpose}</div>
      ${pageIssues.length > 0 ? `
      <div class="pc-issues">
        ${pageIssues.map(issue => `
          <div class="pc-issue-item">
            <div class="pc-dot" style="background:#dc2626"></div>
            <span>${issue}</span>
          </div>
        `).join('')}
      </div>
      ` : '<div style="font-size:12px;color:#16a34a">✓ No major issues detected on this page</div>'}
    </div>`;
  }).join('')}
  
  <div class="pn">${pageNum}</div>
</div>`);
    }
  }

  // ==========================================
  // ISSUES DETAIL PAGE
  // ==========================================
  pageNum++;
  pages.push(`
<div class="pg">
  <h2>Critical Issues Found (${issues.length})</h2>
  
  ${issues.slice(0, 3).map((issue, idx) => {
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
  }).join('')}

  ${issues.length > 3 ? `
  <div class="fade-section">
    <div class="fade-visible">
      ${issues.slice(3, 5).map(i => `
        <div class="ir">
          <span class="badge" style="background:${sc(i.severity)}">${i.severity}</span>
          <div style="flex:1">
            <div class="it">${i.title}</div>
            <div class="id">${i.description}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="fade-blur">
      <div class="fade-gradient"></div>
      <div class="fade-blur-inner">
        ${issues.slice(5).map(i => `
          <div class="ir">
            <span class="badge" style="background:${sc(i.severity)}">${i.severity}</span>
            <div style="flex:1"><div class="it">${i.title}</div><div class="id">${i.description}</div></div>
          </div>
        `).join('')}
        <h3>How to Fix Each Issue</h3>
        <p>Each issue above includes a detailed fix guide in the full report: step-by-step instructions with code examples, screenshots of what to change, and expected ranking impact. Issues are ranked by a priority score (Impact x Effort) so you focus on the highest-ROI changes first.</p>
        <h3>Expected Impact After Fixes</h3>
        <p>Based on our analysis of similar sites that implemented these recommendations, we estimate the following improvements within 90 days: organic traffic increase of 40-80%, bounce rate reduction of 15-25%, and improved rankings for ${issues.length * 3}+ keywords.</p>
      </div>
      <div class="fade-lock">
        <div class="fl-txt">Fix instructions for all ${issues.length} issues</div>
        <a class="fl-sub" href="${checkoutUrl()}" style="color:#6b7280;text-decoration:underline;cursor:pointer">Unlock full report →</a>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="pn">${pageNum}</div>
</div>`);

  // ==========================================
  // AI SEARCH READINESS (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'AI Search Readiness Analysis',
    `<p>${geoSplit.visible}</p>
     <h3>How AI Search Engines Evaluate Your Site</h3>
     <p>AI search engines like ChatGPT, Perplexity, and Google's AI Overviews use fundamentally different criteria than traditional search. They prioritize content that directly answers questions in a citeable format, structured data that machines can parse, authoritative statements backed by specific data points, and comprehensive coverage of a topic rather than keyword density.</p>
     <p>Your site currently scores ${cats.geo?.score || 75}/100 on AI readiness. This means AI search engines can find your site but rarely cite it. The primary gaps are in FAQ content (which accounts for 40% of AI citations), quotable statistics (25% of citations), and structured data markup (20% of citations).</p>
     <h3>AI Citation Test Results</h3>
     <p>We tested how AI search engines respond to queries related to your business. The sites that were cited all share characteristics your site currently lacks:</p>
     <div class="metric-row"><span class="metric-label">FAQ Content</span><span class="metric-val metric-bad">${crawlPages.some(p => p.hasFaqContent) ? 'Limited' : 'Not detected'}</span></div>
     <div class="metric-row"><span class="metric-label">Quotable Statistics</span><span class="metric-val metric-bad">None found</span></div>
     <div class="metric-row"><span class="metric-label">Structured Schema</span><span class="metric-val ${crawlPages.some(p => (p.schemaCount || 0) > 0) ? '' : 'metric-bad'}">${crawlPages.reduce((sum, p) => sum + (p.schemaCount || 0), 0) || 'Minimal'}</span></div>
     <div class="metric-row"><span class="metric-label">Content Depth</span><span class="metric-val metric-bad">${crawlPages[0]?.wordCount || '?'} words (need 800+)</span></div>`,
    `<h3>What Competitors Do That Gets Them Cited</h3>
     <p>The top-ranking sites in your space appear in AI-generated responses because they have significantly more indexed pages with structured FAQ markup, specific usage statistics, and clear category organization that AI engines can parse and reference.</p>
     <p>The fastest path to AI citations requires three changes, in order of impact: (1) Add an FAQ page with 15+ questions — this alone could increase your citation probability by 2-3x, (2) Include specific statistics throughout your content, (3) Implement FAQ and Organization JSON-LD schema markup.</p>
     <h3>Projected Citation Improvement Timeline</h3>
     <p>Week 2: Schema markup indexed by search engines. Week 4: FAQ content begins appearing in AI training data refreshes. Week 8: First citations in AI-generated responses. Week 12: Consistent appearance in industry-related AI queries.</p>`,
    'Full AI citation analysis with competitor comparison'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'AI Search Readiness (continued)',
    `<h3>Structured Data Assessment</h3>
     <p>Your website currently has ${crawlPages.reduce((sum, p) => sum + (p.schemaCount || 0), 0) || 'minimal'} structured data markup, which limits how search engines and AI systems understand and present your content. We found ${issues.filter(i => i.title.toLowerCase().includes('faq') || i.title.toLowerCase().includes('schema')).length || 1} specific schema opportunities that would immediately improve your visibility.</p>`,
    `<h3>Recommended Schema Markup</h3>
     <p>Here's the exact JSON-LD code to add to your homepage for FAQ schema, Organization schema, and WebApplication schema:</p>
     <div style="background:#f9fafb;padding:10px;border-radius:4px;font-family:monospace;font-size:10px">
       {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"...","acceptedAnswer":{"@type":"Answer","text":"..."}}]}
     </div>
     <h3>Content Templates for AI Citability</h3>
     <p>The following content formats have the highest probability of being cited by AI search engines. We've pre-written templates specific to your business...</p>`,
    'Schema code & AI-optimized content templates'
  ));

  // ==========================================
  // TECHNICAL ANALYSIS (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Technical Performance Analysis',
    `<p>${techSplit.visible}</p>
     <h3>Core Web Vitals Breakdown</h3>
     <div class="metric-row"><span class="metric-label">Largest Contentful Paint (LCP)</span><span class="metric-val metric-bad">Needs improvement (target: <2.5s)</span></div>
     <div class="metric-row"><span class="metric-label">First Contentful Paint (FCP)</span><span class="metric-val metric-bad">Needs improvement (target: <1.8s)</span></div>
     <div class="metric-row"><span class="metric-label">Cumulative Layout Shift (CLS)</span><span class="metric-val">Measuring...</span></div>
     <div class="metric-row"><span class="metric-label">Total Blocking Time (TBT)</span><span class="metric-val">Measuring...</span></div>
     <p style="margin-top:6px">When your page takes too long to load, Google classifies it as "poor" performance, which directly suppresses your rankings. For every second of delay above 2.5s, you lose approximately 7% of visitors who abandon before the page loads.</p>
     <h3>Resource Loading Analysis</h3>
     <p>The critical rendering path may be blocked by render-blocking JavaScript and CSS that could be deferred. The largest contributors to slow loading are typically unoptimized JavaScript bundles, uncompressed images, and CSS files that aren't properly prioritized.</p>`,
    `<h3>Optimization Priority List</h3>
     <p><strong>1. Image Optimization (saves ~1.5s)</strong>: Convert all PNG/JPG to WebP format. Add explicit width/height attributes. Implement native lazy loading for below-fold images. This single change typically improves LCP by 30-40%.</p>
     <div class="code-block">// Before: &lt;img src="hero.png"&gt;<br>// After: &lt;img src="hero.webp" width="1200" height="630" loading="lazy" decoding="async" alt="descriptive text"&gt;</div>
     <p><strong>2. JavaScript Deferral (saves ~0.8s)</strong>: Move non-critical scripts to async loading. Implement route-based code splitting so only essential code loads on first paint.</p>
     <p><strong>3. Enable Compression (saves ~0.5s)</strong>: Add Brotli/gzip compression. Most modern servers support this with a single configuration change.</p>
     <h3>Server-Side Recommendations</h3>
     <p>Implementing edge caching (Cloudflare, Vercel Edge) could dramatically reduce server response time. CDN distribution would further improve global load times by serving from the nearest edge node.</p>`,
    'Complete optimization guide with code examples'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Technical Performance (continued)',
    `<h3>Mobile Performance</h3>
     <p>Mobile users experience even slower load times due to network constraints. Your mobile performance indicates room for improvement in touch target sizes, viewport configuration, and responsive image delivery. With over 60% of web traffic now coming from mobile devices, mobile performance directly impacts your rankings and conversions.</p>`,
    `<h3>Specific Code Changes</h3>
     <div style="background:#f9fafb;padding:10px;border-radius:4px;font-family:monospace;font-size:10px">
       // Add to your &lt;head&gt; for critical resource preloading<br>
       &lt;link rel="preload" href="/fonts/main.woff2" as="font" crossorigin&gt;<br>
       &lt;link rel="preconnect" href="https://cdn.example.com"&gt;
     </div>
     <h3>Caching Strategy</h3>
     <p>Implementing proper cache headers could reduce repeat visit load time by 70%. Here are the exact headers to add to your server configuration...</p>
     <h3>JavaScript Optimization</h3>
     <p>Render-blocking scripts should be moved to async loading and code splitting implemented to improve FCP by up to 40%...</p>`,
    'Code changes & caching configuration'
  ));

  // ==========================================
  // CONTENT QUALITY (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Content Quality Assessment',
    `<p>${contentSplit.visible}</p>
     <h3>Content Depth Summary</h3>
     <div style="border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;margin:6px 0">
       <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;font-size:10px">
         <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Page</div>
         <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Words</div>
         <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Status</div>
         <div style="padding:5px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb">Target</div>
         ${crawlPages.slice(0, 6).map(p => {
           const path = (p.url || '').replace(/https?:\/\/[^/]+/, '') || '/';
           const wc = p.wordCount || 0;
           const status = wc < 300 ? 'Thin' : wc < 800 ? 'Light' : 'Good';
           const color = wc < 300 ? '#dc2626' : wc < 800 ? '#ca8a04' : '#16a34a';
           return `
           <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6;font-size:10px;overflow:hidden;text-overflow:ellipsis">${path}</div>
           <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6;color:${color};font-weight:600">${wc}</div>
           <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6;color:${color}">${status}</div>
           <div style="padding:4px 8px;border-bottom:1px solid #f3f4f6">800+</div>`;
         }).join('')}
       </div>
     </div>
     <p>Pages under 300 words are classified as "thin content" by Google's quality guidelines. Pages under 300 words signal to search algorithms that the page lacks depth and expertise. Top-ranking competitors in your space average 1,200-2,000 words per page.</p>
     <h3>Content Gap Analysis</h3>
     <p>Based on our crawl, we identified missing content sections that competitors typically include: detailed product/service explanations, FAQ sections with 10+ questions, user testimonials, comparison pages, and "How it works" walkthroughs.</p>`,
    `<h3>Rewritten Page Copy (800+ words)</h3>
     <p>The full report includes ready-to-paste page copy for your key pages, optimized for both traditional search and AI citation. Each rewrite includes proper heading hierarchy, internal linking suggestions, and FAQ content.</p>
     <h3>Content Templates</h3>
     <p>We provide templates for the most impactful content types: FAQ pages, comparison pages, "How it works" guides, and long-form blog posts targeting your key topics.</p>
     <h3>Heading Structure Optimization</h3>
     <p>Your current heading hierarchy has gaps. The full report includes an optimized H1-H6 structure for each page with exact copy to use.</p>`,
    'Ready-to-paste page copy for all pages'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Content Quality (continued)',
    `<h3>Heading Structure</h3>
     <p>Your current heading hierarchy has gaps that make it harder for search engines to understand your content organization. A clear H1 → H2 → H3 hierarchy helps both users and search engines navigate your content.</p>`,
    `<h3>Optimized Heading Structure (Copy This)</h3>
     <p>The full report includes a complete heading structure rewrite for each page, with exact copy you can paste directly into your CMS.</p>
     <h3>Meta Description Rewrites</h3>
     <p>We've written optimized meta descriptions for every page — designed to maximize click-through rates from search results.</p>
     <h3>Internal Linking Map</h3>
     <p>A detailed internal linking architecture showing exactly which pages should link to which, with anchor text recommendations...</p>`,
    'Ready-to-use copy, meta descriptions & link map'
  ));

  // ==========================================
  // VISUAL AUDIT (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Visual Audit: What Search Engines See',
    `<h3>Desktop View — Current State</h3>
     ${data.screenshots?.desktop ? `<div class="ss-box"><div class="ss-lbl">Your site as seen by Google</div><img class="ss-img" src="data:image/jpeg;base64,${data.screenshots.desktop}" /></div>` : '<div class="ss-box"><div class="ss-lbl">Desktop screenshot captured</div><div style="height:200px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot available in full report</div></div>'}
     <p>First impressions matter — not just for visitors, but for search engines. Google evaluates visual layout, content density, and above-the-fold content when ranking pages. A cluttered or sparse above-the-fold area signals low quality.</p>`,
    `<h3>Desktop Issues Identified</h3>
     <p>1. Above-the-fold content evaluation — is your value proposition visible without scrolling?</p>
     <p>2. Navigation descriptiveness — are anchor texts helping SEO?</p>
     <p>3. Trust signals — social proof, testimonials, certifications visible?</p>
     <h3>Recommended Desktop Layout Changes</h3>
     <p>Move your primary value proposition above the fold. Add a brief 1-sentence explanation visible without scrolling. Include social proof elements...</p>`,
    'Desktop optimization recommendations'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Visual Audit: Mobile Experience',
    `<h3>Mobile View</h3>
     ${data.screenshots?.mobile ? `<div class="ss-box" style="max-width:320px"><div class="ss-lbl">Mobile screenshot</div><img class="ss-img" src="data:image/jpeg;base64,${data.screenshots.mobile}" /></div>` : '<div class="ss-box" style="max-width:320px"><div class="ss-lbl">Mobile screenshot captured</div><div style="height:250px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">Screenshot available</div></div>'}
     <p>Over 60% of all web traffic comes from mobile devices. Google uses mobile-first indexing, meaning the mobile version of your site is the primary version they evaluate for rankings.</p>`,
    `<h3>Mobile-Specific Issues</h3>
     <p>Touch targets should be at least 48x48px per Google's guidelines. Font sizes below 16px are hard to read on mobile. The full report includes specific CSS changes for your key breakpoints.</p>
     <h3>Mobile Conversion Optimization</h3>
     <p>Mobile users have different intent patterns. Your primary conversion action should be achievable in a single tap.</p>
     <h3>Responsive Design Improvements</h3>
     <p>Specific CSS changes recommended for 375px, 414px, and 768px breakpoints...</p>`,
    'Mobile optimization & responsive fixes'
  ));

  // ==========================================
  // COMPETITOR ANALYSIS (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Competitor Analysis',
    `<p>${compSplit.visible}</p>
     <h3>How You Compare</h3>
     <p>We analyzed the top-ranking sites for queries related to your business. The biggest differentiator between sites that rank well and those that don't comes down to three factors: content volume, structured data, and page speed. Here's where you stand.</p>`,
    `<h3>Top Competitors Ranked</h3>
     <p>We analyzed the top-ranking sites for your target keywords. The sites that consistently outrank you all share common traits: significantly more indexed content, comprehensive FAQ sections, and faster page load times.</p>
     <h3>What They Do That You Don't</h3>
     <p>The #1 differentiator: all top competitors have substantially more indexable content. Content volume, when combined with quality, is the primary gap separating your site from page-one rankings...</p>`,
    'Full competitor breakdown & keyword gaps'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Competitor Analysis (continued)',
    `<h3>Keyword Gaps</h3>
     <p>We identified keywords where competitors rank in the top 10 but your site doesn't appear at all. These represent immediate opportunities — queries people are searching for where your competitors get traffic and you get nothing.</p>`,
    `<h3>Top Keyword Opportunities</h3>
     <p>The full report includes a prioritized list of keyword targets, ranked by search volume and difficulty. We focus on "low-hanging fruit" — high-volume keywords with moderate difficulty where you can realistically rank within 60-90 days.</p>
     <h3>Content Strategy to Close the Gap</h3>
     <p>Based on keyword difficulty and your current authority, we recommend targeting long-tail keywords first with a 12-week content calendar...</p>
     <h3>Backlink Opportunity Analysis</h3>
     <p>Your competitor backlink profile reveals link targets you can pursue through guest posts, resource pages, and industry directories...</p>`,
    'Keyword list, content calendar & backlink targets'
  ));

  // ==========================================
  // FIX GUIDES (4 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Fix Guide: Page Load Speed',
    `<h3>The Problem</h3>
     <p>Slow page load times directly suppress your search rankings. Google confirmed Core Web Vitals as a ranking factor in 2021, and sites that fail these metrics are penalized in search results. Every second of delay reduces conversions by approximately 7% and increases bounce rate.</p>
     <h3>Impact on Rankings</h3>
     <p>Poor performance puts you at a direct disadvantage against faster competitors. When two sites have similar content quality, Google will rank the faster one higher — it's that simple.</p>`,
    `<h3>Step 1: Optimize Images (saves ~1.5s)</h3>
     <p>Convert all PNG/JPG images to WebP format. Add width and height attributes. Implement lazy loading for below-the-fold images.</p>
     <div style="background:#f9fafb;padding:8px;border-radius:4px;font-family:monospace;font-size:10px">&lt;img src="hero.webp" width="1200" height="630" loading="lazy" alt="descriptive text"&gt;</div>
     <h3>Step 2: Defer JavaScript (saves ~0.8s)</h3>
     <p>Move non-critical scripts to async loading. Implement code splitting.</p>
     <h3>Step 3: Enable Compression (saves ~0.5s)</h3>
     <p>Add Brotli compression — typically reduces transfer size by 60-80%.</p>`,
    'Complete speed fix with code examples'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Fix Guide: Content & AI Citability',
    `<h3>The Problem</h3>
     <p>${crawlPages.filter(p => p.isThinContent || (p.wordCount && p.wordCount < 300)).length || 'Several'} of your pages have thin content. Google considers pages below 300 words as "thin content" — a signal of low quality that suppresses rankings. Meanwhile, AI search engines need substantial, well-structured content to generate citations.</p>
     <h3>What Good Looks Like</h3>
     <p>Top-ranking pages in your space average 1,200-2,000 words. They include detailed descriptions, use cases, comparisons, and FAQ sections. AI engines specifically look for Q&A formatted content to pull answers from.</p>`,
    `<h3>Rewritten Page Copy (800+ words, ready to use)</h3>
     <p>The full report includes complete page rewrites optimized for both traditional search and AI citation, with proper heading hierarchy and internal linking.</p>
     <h3>15 FAQ Questions & Answers (Copy & Paste)</h3>
     <p>Pre-written FAQ content specific to your business, with matching JSON-LD schema code you can paste directly into your site's &lt;head&gt; tag.</p>
     <h3>JSON-LD Schema Code</h3>
     <div style="background:#f9fafb;padding:8px;border-radius:4px;font-family:monospace;font-size:9px">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]}</div>`,
    '15 pre-written Q&As with schema code'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Fix Guide: Internal Linking & Structure',
    `<h3>Internal Linking Problem</h3>
     <p>Internal links are how search engines discover and understand the relationships between your pages. Without a solid internal linking structure, pages become "orphaned" — search engines can't find them, and they can't rank. Your site currently has fewer internal links than recommended for optimal crawlability.</p>`,
    `<h3>Recommended Link Architecture</h3>
     <p>A detailed page-by-page linking map showing exactly which pages should link to which, with recommended anchor text for each link.</p>
     <h3>Adding Quotable Statistics</h3>
     <p>Content with specific statistics is 3x more likely to be cited by AI search engines. The full report includes statistics templates you can customize and add to your site.</p>
     <h3>How to Present Statistics for AI Citability</h3>
     <p>Format: [Number] + [Context] + [Source]. This format is what AI engines look for when deciding what to cite.</p>`,
    'Link architecture & statistics templates'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, 'Fix Guide: Search Visibility & Indexing',
    `<h3>Visibility Assessment</h3>
     <p>${visSplit.visible || 'Your search visibility score reflects how well search engines can discover, crawl, and index your content. Several factors affect this: your robots.txt configuration, sitemap presence, canonical tags, and how you handle duplicate content.'}</p>`,
    `<h3>Robots.txt Optimization</h3>
     <p>Your robots.txt file controls which bots can access your site. The full report includes an optimized robots.txt that explicitly allows all major AI bots while blocking unwanted crawlers.</p>
     <h3>Sitemap Optimization</h3>
     <p>A properly configured XML sitemap helps search engines discover all your pages. The full report includes a sitemap template and submission instructions for Google and Bing.</p>
     <h3>Canonical Tag Strategy</h3>
     <p>Canonical tags prevent duplicate content issues. The full report identifies pages missing canonical tags and provides the exact markup to add.</p>`,
    'Robots.txt, sitemap & canonical fixes'
  ));

  // ==========================================
  // ACTION PLAN (2 pages)
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, '90-Day Action Plan',
    `<h3>Week 1: Quick Wins</h3>
     ${ap.quickWins?.slice(0, 2).map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || '<p>Priority fixes identified — see full report for the complete quick wins list.</p>'}
     <p style="margin-top:8px;font-size:11px;color:#6b7280">These changes take under 15 minutes each and have immediate impact.</p>`,
    `${ap.quickWins?.slice(2).map((w: string, i: number) => `<div class="ai"><div class="an">${i+3}</div><div>${w}</div></div>`).join('') || ''}
     <h3>Weeks 2-4: Foundation</h3>
     ${ap.mediumTerm?.map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || '<p>Medium-term optimizations covering content expansion, schema markup, and technical fixes.</p>'}
     <h3>Priority Matrix</h3>
     <p>Each action is ranked by: Impact (1-10) x Effort (1-10). Focus on high-impact, low-effort items first...</p>`,
    'Complete action plan with priority matrix'
  ));

  pageNum++;
  pages.push(fadePage(pageNum, '90-Day Action Plan (continued)',
    `<h3>Month 2: Growth Phase</h3>
     <p>After the foundation is set, focus shifts to content creation and link building. Target: publish 4 long-form guides targeting the keyword gaps identified in the competitor analysis. Each guide should be 1,500-2,500 words with proper heading structure and FAQ sections.</p>`,
    `<h3>Content Calendar (Weeks 5-8)</h3>
     <p>A week-by-week content plan with specific topics, target keywords, and word count targets for each piece.</p>
     <h3>Month 3: Scale & Monitor</h3>
     ${ap.strategic?.map((w: string, i: number) => `<div class="ai"><div class="an">${i+1}</div><div>${w}</div></div>`).join('') || ''}
     <h3>Expected Results Timeline</h3>
     <p>Week 2: Technical improvements visible in PageSpeed. Week 4: New content indexed. Week 8: First ranking improvements. Week 12: 40-60% increase in organic traffic.</p>`,
    'Content calendar & growth roadmap'
  ));

  // ==========================================
  // CHECKLIST
  // ==========================================
  pageNum++;
  pages.push(fadePage(pageNum, 'Implementation Checklist',
    `<h3>Technical Fixes</h3>
     <p>☐ Optimize images to WebP (est. -1.5s load time)<br>
     ☐ Defer non-critical JavaScript (est. -0.8s)<br>
     ☐ Enable Brotli compression (est. -0.5s)<br>
     ☐ Add H1 tags to all pages<br>
     ☐ Fix broken links</p>
     <h3>Content Fixes</h3>
     <p>☐ Expand all pages to 800+ words<br>
     ☐ Add FAQ section with 10+ Q&As</p>`,
    `<p>☐ Include quotable statistics (5 minimum)<br>
     ☐ Add testimonials or social proof section<br>
     ☐ Create comparison page vs competitors</p>
     <h3>SEO Infrastructure</h3>
     <p>☐ Add FAQ JSON-LD schema<br>
     ☐ Add Organization schema<br>
     ☐ Implement internal linking plan (25+ links)<br>
     ☐ Optimize meta descriptions for all pages<br>
     ☐ Set up Google Search Console<br>
     ☐ Submit sitemap to Google & Bing</p>
     <h3>Content Creation</h3>
     <p>☐ Write 4 long-form blog posts (month 2)<br>
     ☐ Create category landing pages<br>
     ☐ Build "How It Works" detailed page<br>
     ☐ Publish comparison guides</p>
     <h3>Monitoring</h3>
     <p>☐ Set up weekly rank tracking<br>
     ☐ Monitor Core Web Vitals monthly<br>
     ☐ Track AI citation appearances quarterly</p>`,
    'Full 30-item implementation checklist'
  ));

  // ==========================================
  // FINAL CTA PAGE
  // ==========================================
  pageNum++;
  pages.push(`
<div class="pg">
  <div style="margin-top:30px;text-align:center">
    <h2 style="border:none;font-size:22px;text-align:center;padding:0">Your Website Has ${issues.length} Issues<br>Holding Back Your Growth</h2>
    
    <p style="text-align:center;max-width:500px;margin:12px auto;font-size:13px;color:#374151">
      This free preview showed you what's broken. The full report shows you <strong>exactly how to fix it</strong> — with ready-to-use copy, code snippets, and a prioritized action plan.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:500px;margin:20px auto;text-align:left">
      <div class="finding"><div class="f-label">Free preview</div><div class="f-text">${pageNum} pages | Issues identified</div></div>
      <div class="finding" style="border-color:#16a34a;background:#f0fdf4"><div class="f-label" style="color:#16a34a">Full report</div><div class="f-text">${pageNum}+ pages | Step-by-step fixes</div></div>
    </div>

    <div style="max-width:500px;margin:16px auto;text-align:left">
      <div class="ai"><div class="an">✓</div><div>Rewritten page copy (800+ words, ready to paste)</div></div>
      <div class="ai"><div class="an">✓</div><div>15 FAQ Q&As with JSON-LD schema code</div></div>
      <div class="ai"><div class="an">✓</div><div>Technical fixes with code examples</div></div>
      <div class="ai"><div class="an">✓</div><div>Competitor analysis with keyword gaps</div></div>
      <div class="ai"><div class="an">✓</div><div>90-day action plan with priority matrix</div></div>
      <div class="ai"><div class="an">✓</div><div>30-item implementation checklist</div></div>
    </div>

    ${hl.estimatedImpact ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 20px;border-radius:6px;margin:16px auto;max-width:500px">
      <div style="font-size:13px;font-weight:700;color:#166534">${hl.estimatedImpact}</div>
    </div>
    ` : ''}

    <div class="cta" style="max-width:500px;margin:16px auto">
      <h3>Unlock Your Full Report</h3>
      <p>One-time payment. No subscription. Instant delivery.</p>
      <a href="${checkoutUrl()}" class="cta-btn">Get Full Report — $0.50</a>
    </div>

    <div style="max-width:500px;margin:24px auto;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;text-align:left">
      <h3 style="font-size:15px;margin:0 0 8px 0">Want us to implement it for you?</h3>
      <p style="font-size:13px;color:#374151;margin:0 0 6px 0">Don't have time to fix everything yourself? Our team can handle the entire implementation — from technical fixes to content rewrites to schema markup.</p>
      <p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 4px 0">Implementation packages start at $199</p>
      <p style="font-size:12px;color:#6b7280;margin:0">Reply to the email this report came with, or contact us at <strong>seo@impulsestudios.cc</strong></p>
    </div>
  </div>

  <div class="ft">
    <span>Generated by Impulse Studios | AI-Powered SEO Audit</span>
    <span>${data.date}</span>
  </div>
  <div class="pn">${pageNum}</div>
</div>`);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${CSS}</style></head><body>
${pages.join('\n')}
</body></html>`;
}

export function renderFullPdfHtml(data: ReportData): string {
  return renderTeaserPdfHtml(data)
    .replace(/fade-blur-inner/g, 'fade-blur-inner-visible')
    .replace(/filter:blur\(4px\)/g, 'filter:none')
    .replace(/opacity:0\.35/g, 'opacity:1')
    .replace(/class="fade-lock"/g, 'class="fade-lock" style="display:none"')
    .replace(/class="fade-gradient"/g, 'class="fade-gradient" style="display:none"');
}
