import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { renderTeaserPdfHtml, renderFullPdfHtml } from '@/lib/reports/pdf-template';

export const dynamic = 'force-dynamic';

const WORKER_URL = 'https://api.impulsestudios.cc/audit';
const WORKER_SECRET = 'impulse-audit-worker-2026';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const type = req.nextUrl.searchParams.get('type') || 'teaser';
  const supabase = getServiceClient();

  const { data: audit, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Build report data
  const reportData = {
    url: audit.url,
    auditId: params.id,
    date: new Date(audit.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    overallScore: audit.overall_score,
    overallGrade: audit.overall_grade,
    categories: audit.teaser_data?.categories || {
      geo: { score: audit.geo_score, grade: gradeFor(audit.geo_score) },
      technical: { score: audit.technical_score, grade: gradeFor(audit.technical_score) },
      content: { score: audit.content_score, grade: gradeFor(audit.content_score) },
      visibility: { score: audit.visibility_score, grade: gradeFor(audit.visibility_score) },
      onpage: { score: audit.full_data?.onpage_score || 0, grade: gradeFor(audit.full_data?.onpage_score || 0) },
    },
    issues: audit.full_data?.issues || [],
    aiAnalysis: audit.full_data?.aiAnalysis || null,
    screenshots: audit.full_data?.screenshots || null,
    crawlData: audit.full_data?.crawl || null,
    pages: audit.full_data?.crawl?.pages || [],
  };

  // Generate HTML
  const html = type === 'full'
    ? renderFullPdfHtml(reportData)
    : renderTeaserPdfHtml(reportData);

  // Send to EC2 worker for PDF rendering
  try {
    const pdfRes = await fetch(`${WORKER_URL}/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({ html }),
    });

    if (!pdfRes.ok) {
      const err = await pdfRes.text();
      console.error('PDF generation failed:', err);
      return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="seo-report-${type}-${audit.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/g, '-')}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('PDF fetch error:', err.message);
    return NextResponse.json({ error: 'Could not connect to PDF service' }, { status: 502 });
  }
}

function gradeFor(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
