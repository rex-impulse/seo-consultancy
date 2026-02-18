'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'What exactly do I get for free?',
    a: 'A 2-page preview showing your overall SEO score (A–F), your 3 biggest issues, and key statistics. It shows WHAT\'s broken — the full report shows HOW to fix it.',
  },
  {
    q: 'What\'s in the full $29 report?',
    a: 'A 15–20 page PDF covering technical health, search visibility, AI search readiness, content quality, competitor comparison, and a prioritized action plan with specific fix instructions for every issue found.',
  },
  {
    q: 'How long does the audit take?',
    a: 'Your free preview is ready in about 5–10 minutes. The full report is delivered within 15 minutes of purchase — usually much faster.',
  },
  {
    q: 'Do I need any technical knowledge?',
    a: 'Not at all. The report is written in plain English for business owners, not developers. Every issue includes a simple explanation of why it matters and step-by-step fix instructions.',
  },
  {
    q: 'What is AI Search / GEO?',
    a: 'GEO stands for Generative Engine Optimization. It\'s about making sure your website can be found and cited by AI search tools like ChatGPT, Perplexity, and Google AI Overviews. It\'s a new and rapidly growing way people find businesses.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. We only store your email and website URL. We analyze only publicly accessible pages. All payments are processed securely by Stripe. We\'re GDPR compliant.',
  },
  {
    q: 'What if I\'m not satisfied with the report?',
    a: 'We offer a 100% money-back guarantee within 7 days. If the report doesn\'t provide value, email us and we\'ll refund you — no questions asked.',
  },
  {
    q: 'Can you implement the fixes for me?',
    a: 'Yes! Reply to your report email and we\'ll provide a free quote for implementation. We offer packages starting at $299 for quick wins up to full SEO overhauls.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-md">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
