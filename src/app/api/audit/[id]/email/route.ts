import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { email } = await req.json();
  
  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('audits')
    .update({ email: email.trim().toLowerCase() })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
