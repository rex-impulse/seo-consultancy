import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { sendTeaserEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('audits')
    .select('id, url, email, status, progress, current_step, overall_score, overall_grade, technical_score, visibility_score, geo_score, content_score, teaser_data, paid, full_data, error_message, teaser_email_sent')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Send teaser email once when audit completes
  if (data.status === 'complete' && data.email && !data.teaser_email_sent) {
    try {
      await sendTeaserEmail(
        data.email,
        data.id,
        data.url,
        data.overall_grade,
        data.overall_score
      );
      await supabase
        .from('audits')
        .update({ teaser_email_sent: true })
        .eq('id', data.id);
    } catch (emailErr) {
      console.error('Teaser email failed:', emailErr);
      // Don't block the response — email is best-effort
    }
  }

  return NextResponse.json({
    ...data,
    onpage_score: data.full_data?.onpage_score ?? null,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
