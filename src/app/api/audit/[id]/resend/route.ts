import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { sendFullReportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  const { data: audit, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  if (!audit.paid) {
    return NextResponse.json({ error: 'Not paid' }, { status: 400 });
  }

  if (!audit.email) {
    return NextResponse.json({ error: 'No email on file' }, { status: 400 });
  }

  try {
    // Generate full PDF
    const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/audit/${params.id}/pdf?type=full`);
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    }
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // Send email
    await sendFullReportEmail(audit.email, params.id, audit.url, pdfBuffer);

    await supabase
      .from('audits')
      .update({ full_email_sent: true })
      .eq('id', params.id);

    return NextResponse.json({ ok: true, email: audit.email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
