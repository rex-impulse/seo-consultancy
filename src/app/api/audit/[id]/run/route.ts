import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

const WORKER_URL = process.env.WORKER_URL || 'https://api.impulsestudios.cc/audit';
const WORKER_SECRET = process.env.WORKER_SECRET || 'impulse-audit-worker-2026';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  
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

  // Dispatch to EC2 worker — fire and forget (worker responds 202 immediately)
  try {
    const res = await fetch(`${WORKER_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORKER_SECRET}`,
      },
      body: JSON.stringify({ auditId: audit.id, url: audit.url }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Worker error:', err);
      return NextResponse.json({ error: 'Worker failed to accept job' }, { status: 502 });
    }

    return NextResponse.json({ status: 'accepted' });
  } catch (err: any) {
    console.error('Worker unreachable:', err.message);
    return NextResponse.json({ error: 'Audit worker unavailable' }, { status: 503 });
  }
}
