import * as cheerio from 'cheerio';

export interface CrawlResult {
  pages: PageData[];
  robotsTxt: RobotsTxtData;
  sitemap: SitemapData;
  ssl: boolean;
}

export interface PageData {
  url: string;
  status: number;
  title: string;
  metaDescription: string;
  ogTags: Record<string, string>;
  canonical: string | null;
  headings: { h1: string[]; h2: string[]; h3: string[]; h4: string[]; h5: string[]; h6: string[] };
  images: { total: number; withAlt: number; withoutAlt: number };
  links: { internal: number; external: number };
  wordCount: number;
  isThinContent: boolean;
  hasFaqContent: boolean;
  schemaMarkup: any[];
  robotsMeta: { noindex: boolean; nofollow: boolean };
}

export interface RobotsTxtData {
  exists: boolean;
  raw: string;
  blocksGPTBot: boolean;
  blocksClaudeBot: boolean;
  blocksBingbot: boolean;
  blocksGooglebot: boolean;
  blockedBots: string[];
}

export interface SitemapData {
  exists: boolean;
  urlCount: number;
  urls: string[];
}

const TIMEOUT = 10000;
const MAX_PAGES = 10;

async function safeFetch(url: string, opts: RequestInit = {}): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; ImpulseAuditBot/1.0; +https://seo.impulsestudios.cc)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...(opts.headers || {}),
    };
    const fetchOpts: any = { ...opts, headers, signal: controller.signal, redirect: 'follow' };
    const res = await fetch(url, fetchOpts);
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    // If SSL error, try with http
    if (url.startsWith('https://') && err?.cause?.code?.includes('CERT')) {
      try {
        const httpUrl = url.replace('https://', 'http://');
        const controller2 = new AbortController();
        const timer2 = setTimeout(() => controller2.abort(), TIMEOUT);
        const res = await fetch(httpUrl, { ...opts, signal: controller2.signal, redirect: 'follow' });
        clearTimeout(timer2);
        return res;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function isInternalLink(href: string, origin: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
  try {
    const resolved = new URL(href, origin);
    return resolved.origin === origin;
  } catch {
    return false;
  }
}

function parsePage(url: string, html: string, origin: string): PageData {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

  const ogTags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property');
    const content = $(el).attr('content');
    if (prop && content) ogTags[prop] = content;
  });

  const canonical = $('link[rel="canonical"]').attr('href') || null;

  const headings: PageData['headings'] = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  for (const level of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
    $(level).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings[level].push(text);
    });
  }

  let withAlt = 0, withoutAlt = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt && alt.trim()) withAlt++;
    else withoutAlt++;
  });

  let internalLinks = 0, externalLinks = 0;
  const discoveredInternalUrls: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (isInternalLink(href, origin)) {
      internalLinks++;
      try {
        const resolved = new URL(href, origin).href.split('#')[0].split('?')[0];
        if (resolved !== url && !discoveredInternalUrls.includes(resolved)) {
          discoveredInternalUrls.push(resolved);
        }
      } catch { /* ignore */ }
    } else if (href.startsWith('http')) {
      externalLinks++;
    }
  });

  // Word count from body text
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // FAQ detection
  const htmlLower = html.toLowerCase();
  const hasFaqContent = 
    $('[itemtype*="FAQPage"]').length > 0 ||
    $('[itemtype*="Question"]').length > 0 ||
    htmlLower.includes('faq') ||
    htmlLower.includes('frequently asked') ||
    $('details').length > 0 ||
    headings.h2.some(h => /faq|question|q\s*&\s*a/i.test(h)) ||
    headings.h3.some(h => /faq|question|q\s*&\s*a/i.test(h));

  // Schema.org / JSON-LD
  const schemaMarkup: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      schemaMarkup.push(JSON.parse($(el).html() || ''));
    } catch { /* ignore */ }
  });

  // Robots meta
  const robotsContent = $('meta[name="robots"]').attr('content') || '';
  const noindex = robotsContent.toLowerCase().includes('noindex');
  const nofollow = robotsContent.toLowerCase().includes('nofollow');

  return {
    url,
    status: 200,
    title,
    metaDescription,
    ogTags,
    canonical,
    headings,
    images: { total: withAlt + withoutAlt, withAlt, withoutAlt },
    links: { internal: internalLinks, external: externalLinks },
    wordCount,
    isThinContent: wordCount < 300,
    hasFaqContent,
    schemaMarkup,
    robotsMeta: { noindex, nofollow },
  };
}

async function checkRobotsTxt(origin: string): Promise<RobotsTxtData> {
  const res = await safeFetch(`${origin}/robots.txt`);
  if (!res || !res.ok) {
    return { exists: false, raw: '', blocksGPTBot: false, blocksClaudeBot: false, blocksBingbot: false, blocksGooglebot: false, blockedBots: [] };
  }
  const raw = await res.text();
  const lines = raw.toLowerCase().split('\n');
  
  const botBlocks: Record<string, boolean> = {};
  let currentAgent = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('user-agent:')) {
      currentAgent = trimmed.replace('user-agent:', '').trim();
    }
    if (trimmed.startsWith('disallow: /') && trimmed.replace('disallow:', '').trim() === '/') {
      botBlocks[currentAgent] = true;
    }
  }

  const blocksGPTBot = botBlocks['gptbot'] || botBlocks['*'] || false;
  const blocksClaudeBot = botBlocks['claudebot'] || botBlocks['claude-web'] || botBlocks['*'] || false;
  const blocksBingbot = botBlocks['bingbot'] || botBlocks['*'] || false;
  const blocksGooglebot = botBlocks['googlebot'] || botBlocks['*'] || false;

  // If wildcard blocks but specific bot is allowed, override
  // (simplified — just check for explicit allows)
  const blockedBots: string[] = [];
  if (blocksGPTBot) blockedBots.push('GPTBot');
  if (blocksClaudeBot) blockedBots.push('ClaudeBot');
  if (blocksBingbot) blockedBots.push('Bingbot');
  if (blocksGooglebot) blockedBots.push('Googlebot');

  return { exists: true, raw, blocksGPTBot, blocksClaudeBot, blocksBingbot, blocksGooglebot, blockedBots };
}

async function checkSitemap(origin: string): Promise<SitemapData> {
  const res = await safeFetch(`${origin}/sitemap.xml`);
  if (!res || !res.ok) {
    return { exists: false, urlCount: 0, urls: [] };
  }
  const text = await res.text();
  const $ = cheerio.load(text, { xmlMode: true });
  const urls: string[] = [];
  $('url > loc').each((_, el) => {
    urls.push($(el).text().trim());
  });
  // Also check sitemap index
  $('sitemap > loc').each((_, el) => {
    urls.push($(el).text().trim());
  });
  return { exists: true, urlCount: urls.length, urls: urls.slice(0, 50) };
}

export async function crawlSite(inputUrl: string, onProgress?: (msg: string) => void): Promise<CrawlResult> {
  const origin = extractDomain(inputUrl);
  
  onProgress?.('Checking robots.txt and sitemap...');
  const [robotsTxt, sitemap] = await Promise.all([
    checkRobotsTxt(origin),
    checkSitemap(origin),
  ]);

  // Check SSL
  const ssl = inputUrl.startsWith('https://') || origin.startsWith('https://');

  // Crawl homepage
  onProgress?.('Crawling homepage...');
  const homeRes = await safeFetch(inputUrl, {
    headers: { 'User-Agent': 'RankSight-Audit/1.0 (+https://seo.impulsestudios.cc)' },
  });

  if (!homeRes || !homeRes.ok) {
    return { pages: [], robotsTxt, sitemap, ssl };
  }

  const homeHtml = await homeRes.text();
  const homePage = parsePage(inputUrl, homeHtml, origin);
  const pages: PageData[] = [homePage];

  // Discover and crawl internal pages
  const $ = cheerio.load(homeHtml);
  const internalUrls: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (isInternalLink(href, origin)) {
      try {
        const resolved = new URL(href, origin).href.split('#')[0].split('?')[0];
        if (resolved !== inputUrl && !internalUrls.includes(resolved) && !resolved.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|css|js)$/i)) {
          internalUrls.push(resolved);
        }
      } catch { /* ignore */ }
    }
  });

  // Crawl up to MAX_PAGES-1 internal pages
  const toCrawl = internalUrls.slice(0, MAX_PAGES - 1);
  for (let i = 0; i < toCrawl.length; i++) {
    onProgress?.(`Crawling page ${i + 2}/${toCrawl.length + 1}...`);
    const res = await safeFetch(toCrawl[i], {
      headers: { 'User-Agent': 'RankSight-Audit/1.0 (+https://seo.impulsestudios.cc)' },
    });
    if (res && res.ok) {
      try {
        const html = await res.text();
        const page = parsePage(toCrawl[i], html, origin);
        page.status = res.status;
        pages.push(page);
      } catch { /* skip */ }
    }
  }

  return { pages, robotsTxt, sitemap, ssl };
}
