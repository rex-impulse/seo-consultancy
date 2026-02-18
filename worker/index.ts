import http from 'node:http';
import { crawlSite } from './src/lib/audit/crawler';
import { runPageSpeed } from './src/lib/audit/pagespeed';
import { calculateScores } from './src/lib/audit/scoring';
// AI analysis is handled by OpenClaw agent (cron job picks up completed audits)

// Screenshot capture via Playwright
async function captureScreenshots(url: string): Promise<{ desktop: string; mobile: string } | null> {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    
    // Desktop
    const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await desktopPage.waitForTimeout(2000);
    const desktopBuf = await desktopPage.screenshot({ fullPage: false, type: 'jpeg', quality: 70 });
    await desktopPage.close();
    
    // Mobile
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true });
    await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await mobilePage.waitForTimeout(2000);
    const mobileBuf = await mobilePage.screenshot({ fullPage: false, type: 'jpeg', quality: 70 });
    await mobilePage.close();
    
    await browser.close();
    return { desktop: desktopBuf.toString('base64'), mobile: mobileBuf.toString('base64') };
  } catch (err: any) {
    console.error('[SCREENSHOT] Failed:', err.message);
    return null;
  }
}

const SUPABASE_URL = 'https://aodrdzptwrbxrgzpjmhp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WORKER_SECRET = process.env.WORKER_SECRET || 'impulse-audit-worker-2026';
const PORT = process.env.PORT || 3002;

async function supabaseUpdate(id, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/audits?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  });
}

async function runAudit(auditId, url) {
  try {
    await supabaseUpdate(auditId, { status: 'running', progress: 5, current_step: 'Starting analysis...' });

    // Step 1: Crawl
    await supabaseUpdate(auditId, { progress: 10, current_step: 'Crawling your website...' });
    const crawlResult = await crawlSite(url, async (msg) => {
      await supabaseUpdate(auditId, { current_step: msg });
    });

    if (crawlResult.pages.length === 0) {
      await supabaseUpdate(auditId, {
        status: 'error',
        progress: 100,
        current_step: 'Could not access your website. Please check the URL and try again.',
        error_message: 'Failed to fetch the website',
      });
      return;
    }

    // Step 2: PageSpeed
    await supabaseUpdate(auditId, { progress: 40, current_step: 'Running PageSpeed analysis...' });
    const pageSpeed = await runPageSpeed(url);

    // Step 3: Screenshots
    await supabaseUpdate(auditId, { progress: 55, current_step: 'Capturing screenshots of your site...' });
    const screenshots = await captureScreenshots(url);
    if (screenshots) console.log(`[SCREENSHOT] Desktop: ${Math.round(screenshots.desktop.length/1024)}KB, Mobile: ${Math.round(screenshots.mobile.length/1024)}KB`);

    // Step 4: Score
    await supabaseUpdate(auditId, { progress: 70, current_step: 'Analyzing AI search readiness...' });
    const scores = calculateScores(crawlResult, pageSpeed);

    // Step 5: Build teaser (AI analysis happens async via OpenClaw agent)
    await supabaseUpdate(auditId, { progress: 85, current_step: 'Generating your report...' });

    const topIssues = scores.issues.slice(0, 3).map(i => ({
      severity: i.severity,
      title: i.title,
      description: i.description,
      impact: i.impact,
    }));

    const teaserData = {
      url,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      overallScore: scores.overall,
      overallGrade: scores.grade,
      categories: {
        geo: { score: scores.geo, grade: scores.categoryGrades.geo },
        technical: { score: scores.technical, grade: scores.categoryGrades.technical },
        content: { score: scores.content, grade: scores.categoryGrades.content },
        visibility: { score: scores.visibility, grade: scores.categoryGrades.visibility },
        onpage: { score: scores.onpage, grade: scores.categoryGrades.onpage },
      },
      topIssues,
      stats: scores.stats,
      auditId,
    };

    // Step 5: Store (mark ai_status pending for OpenClaw to pick up)
    await supabaseUpdate(auditId, {
      status: 'complete',
      progress: 100,
      current_step: 'Complete',
      overall_score: scores.overall,
      overall_grade: scores.grade,
      geo_score: scores.geo,
      technical_score: scores.technical,
      content_score: scores.content,
      visibility_score: scores.visibility,
      teaser_data: teaserData,
      full_data: {
        onpage_score: scores.onpage,
        crawl: {
          pagesAnalyzed: crawlResult.pages.length,
          robotsTxt: crawlResult.robotsTxt,
          sitemap: { exists: crawlResult.sitemap.exists, urlCount: crawlResult.sitemap.urlCount },
          ssl: crawlResult.ssl,
          pages: crawlResult.pages.map(p => ({
            url: p.url,
            title: p.title,
            metaDescription: p.metaDescription,
            wordCount: p.wordCount,
            isThinContent: p.isThinContent,
            hasFaqContent: p.hasFaqContent,
            schemaCount: p.schemaMarkup.length,
            images: p.images,
            links: p.links,
            headings: { h1: p.headings.h1, h2Count: p.headings.h2.length },
            robotsMeta: p.robotsMeta,
          })),
        },
        pageSpeed,
        scores,
        issues: scores.issues,
        screenshots: screenshots || null,
        aiAnalysis: null,  // filled by OpenClaw agent
      },
      ai_status: 'pending',
      updated_at: new Date().toISOString(),
    });

    console.log(`[OK] Audit ${auditId} complete (ai pending) — ${scores.grade} (${scores.overall})`);
  } catch (err) {
    console.error(`[ERR] Audit ${auditId}:`, err.message);
    await supabaseUpdate(auditId, {
      status: 'error',
      progress: 100,
      current_step: 'An error occurred during analysis',
      error_message: err.message || 'Unknown error',
    });
  }
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/audit/run') {
    // Auth check
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${WORKER_SECRET}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { auditId, url } = JSON.parse(body);
        if (!auditId || !url) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'auditId and url required' }));
          return;
        }

        // Fire and forget — respond immediately, run in background
        runAudit(auditId, url).catch(err => console.error('Background audit failed:', err));

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'accepted', auditId }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // PDF generation endpoint
  if (req.method === 'POST' && req.url === '/pdf') {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${WORKER_SECRET}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { html } = JSON.parse(body);
        if (!html) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'html required' }));
          return;
        }

        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', bottom: '0', left: '0', right: '0' },
        });
        await page.close();
        await browser.close();

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': pdf.length.toString(),
        });
        res.end(pdf);
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Audit worker running on port ${PORT}`);
});
