import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { runAuditPipeline } from '@/lib/audit/pipeline';

export const maxDuration = 120; // Vercel function timeout

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  
  // Get audit record
  const { data: audit, error } = await supabase
    .from('audits')
    .select('id, url, status')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  if (audit.status !== 'queued' && audit.status !== 'error') {
    return NextResponse.json({ error: 'Audit already running or complete', status: audit.status }, { status: 400 });
  }

  // Run pipeline (don't await — fire and forget for long-running)
  // But on Vercel serverless we need to await since the function dies otherwise
  await runAuditPipeline(audit.id, audit.url);

  return NextResponse.json({ status: 'complete' });
}
