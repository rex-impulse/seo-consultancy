import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'DevHyde SEO Reports <reports@devhyde.cc>';

export async function sendTeaserEmail(to: string, auditId: string, url: string, grade: string, score: number, pdfBuffer?: Buffer) {
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${auditId}`;
  
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your SEO Audit is Ready: ${url} scored ${grade} (${score}/100)`,
    ...(pdfBuffer ? {
      attachments: [{
        filename: `seo-audit-preview-${url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.pdf`,
        content: pdfBuffer,
      }],
    } : {}),
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#111827">
        <div style="padding:32px 0;border-bottom:1px solid #e5e7eb">
          <h1 style="font-size:20px;font-weight:700;margin:0">Your SEO Audit Report is Ready</h1>
          <p style="color:#6b7280;margin:4px 0 0;font-size:14px">Impulse Studios - AI-Powered SEO Audit</p>
        </div>
        
        <div style="padding:24px 0">
          <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
            We've completed the audit for <strong>${url}</strong>.
          </p>
          
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;text-align:center;margin:16px 0">
            <div style="font-size:48px;font-weight:800;color:${score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626'}">${grade}</div>
            <div style="font-size:14px;color:#6b7280;margin-top:4px">${score}/100 Overall Score</div>
          </div>
          
          <p style="font-size:15px;line-height:1.6;margin:16px 0">
            Your free preview report identifies what's holding your site back. The full report includes step-by-step fix instructions, ready-to-use copy, code examples, and a 90-day action plan.
          </p>
          
          <div style="text-align:center;margin:24px 0">
            <a href="${reportUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 32px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">
              View Your Report
            </a>
          </div>
          
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0">
            <p style="font-size:14px;font-weight:600;color:#991b1b;margin:0 0 4px">Ready to fix everything?</p>
            <p style="font-size:13px;color:#7f1d1d;margin:0">
              Unlock the full 20-page report with code examples, rewritten copy, and a prioritized action plan for just $0.50.
            </p>
          </div>
        </div>
        
        <div style="padding:16px 0;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
          <p style="margin:0">Impulse Studios | AI-Powered SEO Audits</p>
          <p style="margin:4px 0 0">You received this because you requested an audit at seo.impulsestudios.cc</p>
        </div>
      </div>
    `,
  });
}

export async function sendFullReportEmail(to: string, auditId: string, url: string, pdfBuffer: Buffer) {
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/audit/${auditId}`;
  
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Full SEO Report for ${url} - Download Attached`,
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#111827">
        <div style="padding:32px 0;border-bottom:1px solid #e5e7eb">
          <h1 style="font-size:20px;font-weight:700;margin:0">Your Full Report is Attached</h1>
          <p style="color:#6b7280;margin:4px 0 0;font-size:14px">Impulse Studios - AI-Powered SEO Audit</p>
        </div>
        
        <div style="padding:24px 0">
          <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
            Thank you for your purchase. Your complete 20-page SEO audit report for <strong>${url}</strong> is attached to this email as a PDF.
          </p>
          
          <p style="font-size:15px;line-height:1.6;margin:16px 0">
            The report includes:
          </p>
          <ul style="font-size:14px;line-height:1.8;color:#374151;padding-left:20px">
            <li>Step-by-step fix instructions with code examples</li>
            <li>Rewritten page copy (ready to paste)</li>
            <li>15 FAQ Q&As with JSON-LD schema code</li>
            <li>Competitor analysis with keyword gaps</li>
            <li>90-day action plan with priority matrix</li>
            <li>30-item implementation checklist</li>
          </ul>
          
          <div style="text-align:center;margin:24px 0">
            <a href="${reportUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 32px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none">
              View Online
            </a>
          </div>
          
          <p style="font-size:13px;color:#6b7280;margin:16px 0">
            Questions? Reply to this email and we'll help you implement the recommendations.
          </p>
        </div>
        
        <div style="padding:16px 0;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
          <p style="margin:0">Impulse Studios | AI-Powered SEO Audits</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `seo-audit-${url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
