import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();
  const { data: audit, error } = await supabase
    .from('audits')
    .select('id, url, email, paid')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Already paid — redirect to audit page
  if (audit.paid) {
    return NextResponse.redirect(new URL(`/audit/${params.id}`, req.url));
  }

  // Create Stripe checkout session
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Full SEO & GEO Audit Report',
            description: `Comprehensive audit for ${audit.url}`,
          },
          unit_amount: 50,
        },
        quantity: 1,
      }],
      customer_email: audit.email,
      metadata: { audit_id: params.id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${params.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${params.id}?cancelled=true`,
    });

    return NextResponse.redirect(session.url);
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.redirect(new URL(`/audit/${params.id}`, req.url));
  }
}
