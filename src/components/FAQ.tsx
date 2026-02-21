'use client';

import { useState } from 'react';

const faqs = [
  { q: 'What is AI search readiness?', a: 'AI search engines like ChatGPT, Perplexity, and Google AI Overviews are becoming how people find businesses. AI readiness measures whether these tools can find, understand, and cite your business.' },
  { q: 'What do I get for free?', a: 'Your overall AI readiness grade (A-F), scores across 6 categories, and your top 3 critical issues. Enough to know if you have a problem.' },
  { q: 'What\'s in the full $0.50 report?', a: '15-20 pages: detailed analysis of every issue found, specific fix instructions, a competitor comparison, and a prioritized action plan sorted by impact and difficulty.' },
  { q: 'How long does the audit take?', a: 'About 60-90 seconds. We crawl your site, run PageSpeed tests, check AI bot access, analyze your content, and score everything.' },
  { q: 'Do I need technical knowledge?', a: 'No. The report explains issues in plain language with step-by-step fix instructions. Many quick wins take 15 minutes or less.' },
  { q: 'Is there a money-back guarantee?', a: 'Yes. If the report doesn\'t provide actionable insights, we refund you. No questions asked.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 border-t border-neutral-900">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">FAQ</p>
        <h2 className="text-2xl font-bold mt-3 tracking-tight">Common questions</h2>

        <div className="mt-10 divide-y divide-neutral-900">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left py-4 flex justify-between items-start gap-4"
              >
                <span className="text-sm text-neutral-300">{faq.q}</span>
                <span className="text-neutral-600 text-xs mt-0.5 flex-shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <p className="text-xs text-neutral-500 pb-4 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
