import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { sendFullReportEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

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
        // Mark as paid
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

        // Fetch audit data for PDF + email
        const { data: audit } = await supabase
          .from('audits')
          .select('*')
          .eq('id', auditId)
          .single();

        if (audit?.email) {
          try {
            // Generate full PDF via EC2 worker
            const pdfRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/audit/${auditId}/pdf?type=full`);
            if (pdfRes.ok) {
              const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
              await sendFullReportEmail(audit.email, auditId, audit.url, pdfBuffer);
              
              await supabase
                .from('audits')
                .update({ full_email_sent: true })
                .eq('id', auditId);
            }
          } catch (emailErr) {
            console.error('Full report email failed:', emailErr);
            // Don't fail the webhook — payment is still recorded
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
