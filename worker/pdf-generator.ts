/**
 * PDF Generation service for SEO audit reports
 * Runs on EC2 with Playwright for screenshots + PDF rendering
 * 
 * Endpoints:
 *   POST /screenshot  { url }  → captures desktop + mobile screenshots
 *   POST /pdf/teaser  { auditId } → generates teaser PDF from Supabase data
 *   POST /pdf/full    { auditId } → generates full PDF from Supabase data
 */

import http from 'node:http';
import { chromium, Browser, Page } from 'playwright';

const PORT = 3003;
const SUPA_URL = 'https://aodrdzptwrbxrgzpjmhp.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || '';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

async function captureScreenshots(url: string): Promise<{ desktop: string; mobile: string }> {
  const b = await getBrowser();
  
  // Desktop screenshot
  const desktopPage = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await desktopPage.waitForTimeout(2000); // let animations settle
  const desktopBuffer = await desktopPage.screenshot({ fullPage: false });
  await desktopPage.close();
  
  // Mobile screenshot
  const mobilePage = await b.newPage({ viewport: { width: 375, height: 812 }, isMobile: true });
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await mobilePage.waitForTimeout(2000);
  const mobileBuffer = await mobilePage.screenshot({ fullPage: false });
  await mobilePage.close();
  
  return {
    desktop: desktopBuffer.toString('base64'),
    mobile: mobileBuffer.toString('base64'),
  };
}

async function fetchAudit(auditId: string): Promise<any> {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/audits?id=eq.${auditId}&select=*`,
    {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function storeScreenshots(auditId: string, screenshots: { desktop: string; mobile: string }) {
  // Store screenshots in full_data
  const audit = await fetchAudit(auditId);
  if (!audit) return;
  
  const fullData = audit.full_data || {};
  fullData.screenshots = screenshots;
  
  await fetch(
    `${SUPA_URL}/rest/v1/audits?id=eq.${auditId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ full_data: fullData }),
    }
  );
}

async function generatePdf(html: string): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // let fonts load
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await page.close();
  return Buffer.from(pdf);
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: string) => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'pdf-generator' }));
    return;
  }

  // Auth check
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.WORKER_SECRET}`) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  try {
    const body = await parseBody(req);
    
    if (req.url === '/screenshot') {
      const { url, auditId } = body;
      console.log(`[SCREENSHOT] Capturing ${url}`);
      const screenshots = await captureScreenshots(url);
      
      if (auditId) {
        await storeScreenshots(auditId, screenshots);
        console.log(`[SCREENSHOT] Stored for audit ${auditId}`);
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok',
        desktopSize: screenshots.desktop.length,
        mobileSize: screenshots.mobile.length,
      }));
      return;
    }
    
    if (req.url === '/pdf/teaser' || req.url === '/pdf/full') {
      const { auditId, html } = body;
      
      let htmlContent = html;
      if (!htmlContent && auditId) {
        // Fetch audit and generate HTML on the fly
        const audit = await fetchAudit(auditId);
        if (!audit) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Audit not found' }));
          return;
        }
        
        // For now, expect HTML to be passed in. Template rendering happens on Vercel side.
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Pass html in body' }));
        return;
      }
      
      console.log(`[PDF] Generating ${req.url} (${htmlContent.length} chars)`);
      const pdf = await generatePdf(htmlContent);
      
      res.writeHead(200, { 
        'Content-Type': 'application/pdf',
        'Content-Length': pdf.length.toString(),
      });
      res.end(pdf);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err: any) {
    console.error(`[ERR]`, err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => console.log(`PDF generator running on port ${PORT}`));
