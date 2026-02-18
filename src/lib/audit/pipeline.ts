import { getServiceClient } from '@/lib/supabase';
import { crawlSite } from './crawler';
import { runPageSpeed } from './pagespeed';
import { calculateScores } from './scoring';

async function updateAudit(id: string, data: Record<string, any>) {
  const supabase = getServiceClient();
  await supabase.from('audits').update(data).eq('id', id);
}

export async function runAuditPipeline(auditId: string, url: string) {
  // Allow self-signed certs for crawling external sites
  if (typeof process !== 'undefined') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  try {
    await updateAudit(auditId, { status: 'running', progress: 5, current_step: 'Starting analysis...' });

    // Step 1: Crawl
    await updateAudit(auditId, { progress: 10, current_step: 'Crawling your website...' });
    const crawlResult = await crawlSite(url, async (msg) => {
      await updateAudit(auditId, { current_step: msg });
    });

    if (crawlResult.pages.length === 0) {
      await updateAudit(auditId, { 
        status: 'error', 
        progress: 100, 
        current_step: 'Could not access your website. Please check the URL and try again.',
        error_message: 'Failed to fetch the website'
      });
      return;
    }

    await updateAudit(auditId, { progress: 40, current_step: 'Running PageSpeed analysis...' });

    // Step 2: PageSpeed
    const pageSpeed = await runPageSpeed(url);

    await updateAudit(auditId, { progress: 65, current_step: 'Analyzing AI search readiness...' });

    // Step 3: Score everything
    const scores = calculateScores(crawlResult, pageSpeed);

    await updateAudit(auditId, { progress: 80, current_step: 'Generating your report...' });

    // Step 4: Build teaser data
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

    // Step 5: Store everything
    await updateAudit(auditId, {
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
      },
      updated_at: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('Audit pipeline error:', err);
    await updateAudit(auditId, {
      status: 'error',
      progress: 100,
      current_step: 'An error occurred during analysis',
      error_message: err.message || 'Unknown error',
    });
  }
}
