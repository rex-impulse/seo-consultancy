import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { runAuditPipeline } from '@/lib/audit/pipeline';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { url, email } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      const parsed = new URL(normalizedUrl);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        throw new Error('Invalid hostname');
      }
    } catch {
      return NextResponse.json({ error: 'Please enter a valid website URL' }, { status: 400 });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('audits')
      .insert({
        url: normalizedUrl,
        email: email.trim().toLowerCase(),
        status: 'queued',
        progress: 0,
        current_step: 'Queued for analysis',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        user_agent: req.headers.get('user-agent') || null,
        referrer: req.headers.get('referer') || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
    }

    // Return immediately, then run the pipeline
    // Use waitUntil pattern — since Next.js doesn't support it natively in route handlers,
    // we trigger the run endpoint via fetch
    const origin = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${origin}`;
    
    // Fire and forget — don't await
    fetch(`${baseUrl}/api/audit/${data.id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.error('Failed to trigger audit:', err));

    return NextResponse.json({
      id: data.id,
      status: 'queued',
    }, { status: 201 });
  } catch (err) {
    console.error('Audit submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
