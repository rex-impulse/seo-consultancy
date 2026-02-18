import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  const { data: audit, error } = await supabase
    .from('audits')
    .select('id, url, email, status, paid')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  if (audit.paid) {
    return NextResponse.json({ error: 'Already paid' }, { status: 400 });
  }

  // Stripe integration stub — create checkout session
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Full SEO & GEO Audit Report`,
            description: `Comprehensive audit for ${audit.url}`,
          },
          unit_amount: 2900,
        },
        quantity: 1,
      }],
      customer_email: audit.email,
      metadata: { audit_id: params.id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${params.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${params.id}?cancelled=true`,
    });

    await supabase
      .from('audits')
      .update({ stripe_session_id: session.id })
      .eq('id', params.id);

    return NextResponse.json({ checkout_url: session.url, session_id: session.id });
  } catch (err: any) {
    console.error('Stripe error:', err);
    // If Stripe isn't configured yet, return a stub
    return NextResponse.json({
      error: 'Payment system not configured yet. Coming soon!',
      checkout_url: null,
    }, { status: 503 });
  }
}
