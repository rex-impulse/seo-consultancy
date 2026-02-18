import { CrawlResult } from './crawler';
import { PageSpeedResult } from './pagespeed';

export interface AuditScores {
  geo: number;
  technical: number;
  content: number;
  visibility: number;
  onpage: number;
  overall: number;
  grade: string;
  categoryGrades: {
    geo: string;
    technical: string;
    content: string;
    visibility: string;
    onpage: string;
  };
  issues: AuditIssue[];
  stats: {
    totalIssues: number;
    pagesAnalyzed: number;
    quickWins: number;
    estTrafficLoss: string;
  };
}

export interface AuditIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  fixDifficulty: 'easy' | 'medium' | 'hard';
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function calculateScores(crawl: CrawlResult, pageSpeed: PageSpeedResult): AuditScores {
  const issues: AuditIssue[] = [];
  const pages = crawl.pages;
  const homepage = pages[0];

  // === GEO / AI READINESS (30%) ===
  let geoScore = 100;

  // AI bot blocking
  if (crawl.robotsTxt.blocksGPTBot) {
    geoScore -= 30;
    issues.push({ category: 'geo', severity: 'critical', title: 'Your robots.txt blocks GPTBot', description: 'ChatGPT cannot crawl your website. You are completely invisible to ChatGPT Search.', impact: 'Invisible to 100M+ ChatGPT users', fixDifficulty: 'easy' });
  }
  if (crawl.robotsTxt.blocksClaudeBot) {
    geoScore -= 15;
    issues.push({ category: 'geo', severity: 'high', title: 'Your robots.txt blocks ClaudeBot', description: 'Claude AI cannot access your site content.', impact: 'Missing AI search traffic from Claude', fixDifficulty: 'easy' });
  }

  // Schema.org markup
  const hasSchema = pages.some(p => p.schemaMarkup.length > 0);
  if (!hasSchema) {
    geoScore -= 25;
    issues.push({ category: 'geo', severity: 'critical', title: 'No structured data (Schema.org) found', description: 'AI search engines cannot understand what your business does, offers, or where it\'s located.', impact: 'AI cannot categorize your business', fixDifficulty: 'medium' });
  }

  // FAQ content
  const hasFaq = pages.some(p => p.hasFaqContent);
  if (!hasFaq) {
    geoScore -= 15;
    issues.push({ category: 'geo', severity: 'medium', title: 'No FAQ or Q&A content detected', description: 'FAQ content is the #1 format AI search engines cite. Without it, your content is less likely to be quoted.', impact: 'Lower AI citation probability', fixDifficulty: 'easy' });
  }

  // Citability signals — check for statistics, clear definitions
  const allText = pages.map(p => p.headings.h1.join(' ') + ' ' + p.headings.h2.join(' ')).join(' ');
  const hasStatistics = pages.some(p => {
    const text = p.title + ' ' + p.metaDescription;
    return /\d+%|\$\d+|\d+ (out of|percent|million|billion)/i.test(text);
  });
  if (!hasStatistics) {
    geoScore -= 10;
    issues.push({ category: 'geo', severity: 'low', title: 'No quotable statistics found', description: 'Content with specific numbers and statistics is 3x more likely to be cited by AI.', impact: 'Lower content citability', fixDifficulty: 'easy' });
  }

  geoScore = Math.max(0, Math.min(100, geoScore));

  // === TECHNICAL HEALTH (25%) ===
  let techScore = 100;

  // SSL
  if (!crawl.ssl) {
    techScore -= 20;
    issues.push({ category: 'technical', severity: 'critical', title: 'No SSL certificate (HTTP only)', description: 'Your site is not secure. Google penalizes HTTP sites and browsers show security warnings.', impact: 'Ranking penalty + user trust loss', fixDifficulty: 'medium' });
  }

  // Page speed
  if (pageSpeed.score < 50) {
    techScore -= 25;
    issues.push({ category: 'technical', severity: 'critical', title: `Very slow page load (Performance: ${pageSpeed.score}/100)`, description: `Your site scored ${pageSpeed.score}/100 on Google PageSpeed. LCP: ${(pageSpeed.lcp / 1000).toFixed(1)}s (target: <2.5s).`, impact: `~${Math.round((1 - pageSpeed.score / 100) * 50)}% of visitors leave before page loads`, fixDifficulty: 'hard' });
  } else if (pageSpeed.score < 75) {
    techScore -= 15;
    issues.push({ category: 'technical', severity: 'high', title: `Slow page load (Performance: ${pageSpeed.score}/100)`, description: `LCP: ${(pageSpeed.lcp / 1000).toFixed(1)}s, FCP: ${(pageSpeed.fcp / 1000).toFixed(1)}s. Google recommends LCP under 2.5s.`, impact: 'Slower pages rank lower and lose visitors', fixDifficulty: 'medium' });
  }

  // CLS
  if (pageSpeed.cls > 0.25) {
    techScore -= 10;
    issues.push({ category: 'technical', severity: 'high', title: `High layout shift (CLS: ${pageSpeed.cls.toFixed(2)})`, description: 'Elements jump around as your page loads, causing poor user experience.', impact: 'Core Web Vitals failure', fixDifficulty: 'medium' });
  }

  // Robots.txt existence
  if (!crawl.robotsTxt.exists) {
    techScore -= 5;
    issues.push({ category: 'technical', severity: 'low', title: 'No robots.txt file found', description: 'A robots.txt file helps search engines crawl your site efficiently.', impact: 'Minor crawl efficiency issue', fixDifficulty: 'easy' });
  }

  // Sitemap
  if (!crawl.sitemap.exists) {
    techScore -= 10;
    issues.push({ category: 'technical', severity: 'medium', title: 'No sitemap.xml found', description: 'A sitemap helps search engines discover all your pages. Without one, some pages may never be indexed.', impact: 'Pages may not be indexed', fixDifficulty: 'easy' });
  }

  techScore = Math.max(0, Math.min(100, techScore));

  // === CONTENT QUALITY (20%) ===
  let contentScore = 100;

  // Thin content
  const thinPages = pages.filter(p => p.isThinContent);
  if (thinPages.length > 0) {
    const penalty = Math.min(30, thinPages.length * 10);
    contentScore -= penalty;
    issues.push({ category: 'content', severity: thinPages.length > 3 ? 'critical' : 'high', title: `${thinPages.length} thin content page(s) (<300 words)`, description: `Pages with minimal content signal low quality to search engines. Affected: ${thinPages.map(p => new URL(p.url).pathname).join(', ')}`, impact: 'Pages may be considered low quality', fixDifficulty: 'medium' });
  }

  // Missing meta descriptions
  const noDesc = pages.filter(p => !p.metaDescription);
  if (noDesc.length > 0) {
    contentScore -= Math.min(20, noDesc.length * 5);
    issues.push({ category: 'content', severity: 'medium', title: `${noDesc.length} page(s) missing meta descriptions`, description: 'Search engines write your page descriptions for you — often poorly.', impact: 'Lower click-through rates from search results', fixDifficulty: 'easy' });
  }

  // Missing H1
  const noH1 = pages.filter(p => p.headings.h1.length === 0);
  if (noH1.length > 0) {
    contentScore -= Math.min(15, noH1.length * 5);
    issues.push({ category: 'content', severity: 'medium', title: `${noH1.length} page(s) missing H1 headings`, description: 'H1 tags tell search engines what your page is about.', impact: 'Weaker page topic signals', fixDifficulty: 'easy' });
  }

  // Image alt text
  const totalImages = pages.reduce((sum, p) => sum + p.images.total, 0);
  const missingAlt = pages.reduce((sum, p) => sum + p.images.withoutAlt, 0);
  if (missingAlt > 0 && totalImages > 0) {
    const altRatio = missingAlt / totalImages;
    if (altRatio > 0.5) {
      contentScore -= 15;
      issues.push({ category: 'content', severity: 'high', title: `${missingAlt} of ${totalImages} images missing alt text`, description: 'Alt text helps search engines understand images and improves accessibility.', impact: 'Missing image search traffic + accessibility issues', fixDifficulty: 'easy' });
    } else if (altRatio > 0.2) {
      contentScore -= 8;
      issues.push({ category: 'content', severity: 'medium', title: `${missingAlt} images missing alt text`, description: 'Some images lack descriptive alt text.', impact: 'Reduced image search visibility', fixDifficulty: 'easy' });
    }
  }

  contentScore = Math.max(0, Math.min(100, contentScore));

  // === SEARCH VISIBILITY (15%) ===
  let visibilityScore = 100;

  // Noindex pages
  const noindexPages = pages.filter(p => p.robotsMeta.noindex);
  if (noindexPages.length > 0 && pages.length > 0) {
    const ratio = noindexPages.length / pages.length;
    if (ratio > 0.5) {
      visibilityScore -= 30;
      issues.push({ category: 'visibility', severity: 'critical', title: `${noindexPages.length} page(s) blocked from indexing (noindex)`, description: 'These pages will never appear in search results.', impact: 'Pages invisible to search engines', fixDifficulty: 'easy' });
    }
  }

  // Missing canonical
  const noCanonical = pages.filter(p => !p.canonical);
  if (noCanonical.length > pages.length / 2 && pages.length > 1) {
    visibilityScore -= 10;
    issues.push({ category: 'visibility', severity: 'low', title: 'Most pages missing canonical tags', description: 'Canonical tags prevent duplicate content issues.', impact: 'Potential duplicate content problems', fixDifficulty: 'easy' });
  }

  // Missing OG tags
  const noOg = pages.filter(p => Object.keys(p.ogTags).length === 0);
  if (noOg.length > 0) {
    visibilityScore -= Math.min(15, noOg.length * 5);
    issues.push({ category: 'visibility', severity: 'low', title: `${noOg.length} page(s) missing Open Graph tags`, description: 'OG tags control how your pages appear when shared on social media.', impact: 'Poor social media previews', fixDifficulty: 'easy' });
  }

  // Sitemap coverage
  if (crawl.sitemap.exists && crawl.sitemap.urlCount < pages.length) {
    visibilityScore -= 10;
    issues.push({ category: 'visibility', severity: 'medium', title: 'Sitemap doesn\'t include all pages', description: `Your sitemap has ${crawl.sitemap.urlCount} URLs but we found ${pages.length} pages.`, impact: 'Some pages may not be discovered', fixDifficulty: 'easy' });
  }

  // Googlebot blocking
  if (crawl.robotsTxt.blocksGooglebot) {
    visibilityScore -= 40;
    issues.push({ category: 'visibility', severity: 'critical', title: 'robots.txt blocks Googlebot', description: 'Google cannot crawl your website at all. You are invisible to Google Search.', impact: 'Zero Google organic traffic', fixDifficulty: 'easy' });
  }

  visibilityScore = Math.max(0, Math.min(100, visibilityScore));

  // === ON-PAGE SEO (10%) ===
  let onpageScore = 100;

  if (homepage) {
    if (!homepage.title) {
      onpageScore -= 20;
      issues.push({ category: 'onpage', severity: 'high', title: 'Homepage missing title tag', description: 'Title tags are the single most important on-page SEO element.', impact: 'Major ranking factor missing', fixDifficulty: 'easy' });
    } else if (homepage.title.length > 60) {
      onpageScore -= 5;
      issues.push({ category: 'onpage', severity: 'low', title: 'Homepage title too long', description: `Your title is ${homepage.title.length} characters. Google truncates titles over 60 characters.`, impact: 'Truncated search results', fixDifficulty: 'easy' });
    }

    if (homepage.headings.h1.length > 1) {
      onpageScore -= 10;
      issues.push({ category: 'onpage', severity: 'medium', title: `Multiple H1 tags on homepage (${homepage.headings.h1.length})`, description: 'Best practice is one H1 per page.', impact: 'Diluted page topic signal', fixDifficulty: 'easy' });
    }

    // Internal linking
    if (homepage.links.internal < 5) {
      onpageScore -= 10;
      issues.push({ category: 'onpage', severity: 'medium', title: 'Weak internal linking', description: `Homepage has only ${homepage.links.internal} internal links. More internal links help search engines discover content.`, impact: 'Poor crawl depth', fixDifficulty: 'easy' });
    }
  }

  onpageScore = Math.max(0, Math.min(100, onpageScore));

  // === OVERALL ===
  const overall = Math.round(
    geoScore * 0.30 +
    techScore * 0.25 +
    contentScore * 0.20 +
    visibilityScore * 0.15 +
    onpageScore * 0.10
  );

  // Sort issues by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const quickWins = issues.filter(i => i.fixDifficulty === 'easy').length;

  // Estimate traffic loss
  const lossPercent = Math.max(10, 100 - overall);
  const estMonthlyTraffic = Math.round(lossPercent * 15); // rough heuristic
  const estTrafficLoss = `+${estMonthlyTraffic}%`;

  return {
    geo: geoScore,
    technical: techScore,
    content: contentScore,
    visibility: visibilityScore,
    onpage: onpageScore,
    overall,
    grade: scoreToGrade(overall),
    categoryGrades: {
      geo: scoreToGrade(geoScore),
      technical: scoreToGrade(techScore),
      content: scoreToGrade(contentScore),
      visibility: scoreToGrade(visibilityScore),
      onpage: scoreToGrade(onpageScore),
    },
    issues,
    stats: {
      totalIssues: issues.length,
      pagesAnalyzed: pages.length,
      quickWins,
      estTrafficLoss,
    },
  };
}
