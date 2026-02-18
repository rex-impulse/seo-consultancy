import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // Stub: Stripe webhook verification would go here
  // For now, just log and return OK
  console.log('Stripe webhook received');

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const supabase = getServiceClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const auditId = session.metadata?.audit_id;
      if (auditId) {
        await supabase
          .from('audits')
          .update({
            paid: true,
            stripe_payment_intent_id: session.payment_intent,
            paid_at: new Date().toISOString(),
            amount_paid: session.amount_total,
            status: 'paid',
          })
          .eq('id', auditId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
