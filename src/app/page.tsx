import Header from '@/components/Header';
import AuditForm from '@/components/AuditForm';
import VisibilityCheck from '@/components/VisibilityCheck';
import FAQ from '@/components/FAQ';

const dimensions = [
  { icon: '🤖', title: 'AI Search Readiness', desc: 'Can ChatGPT, Perplexity, and Claude find and cite your business? We check bot access, structured data, and content citability.', note: '92% of businesses fail this' },
  { icon: '🔧', title: 'Technical Health', desc: 'Core Web Vitals, page speed, SSL, crawlability, redirect chains. The foundation everything else depends on.', note: 'Most sites: C+' },
  { icon: '🔍', title: 'Search Visibility', desc: 'Indexation status, sitemap health, robots.txt rules, canonical tags, and internal linking structure.', note: 'Hidden issues found in 8/10 audits' },
  { icon: '📝', title: 'Content Quality', desc: 'Thin content detection, meta descriptions, heading structure, image alt text, and duplicate content signals.', note: 'Average: 12 issues per site' },
  { icon: '📊', title: 'Competitor Insights', desc: 'How you stack up against the top 3 sites in your space. Where they win, where you can catch up.', note: 'Know where you stand' },
  { icon: '🎯', title: 'Action Plan', desc: 'Every issue prioritized by impact and difficulty. Quick wins this week, strategic moves this quarter.', note: 'Average ROI: 3× traffic' },
];

export default function Home() {
  return (
    <main className="bg-neutral-950 text-white">
      <Header />

      {/* Hero */}
      <section id="hero" className="min-h-screen flex items-center relative">
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-8">
            AI Search Readiness Report
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Is Your Business<br />
            <span className="text-neutral-500">Invisible to ChatGPT?</span>
          </h1>
          <p className="text-base text-neutral-500 mt-6 max-w-xl mx-auto leading-relaxed">
            68% of people will use AI search by 2027. If ChatGPT doesn&apos;t know about your business, you&apos;re already losing customers.
          </p>

          {/* AI Visibility Check */}
          <div className="mt-12">
            <p className="text-xs font-mono text-neutral-600 uppercase tracking-wider mb-4">
              Free instant check — no email required
            </p>
            <VisibilityCheck />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-xs text-neutral-600 font-mono">or get the full audit</span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {/* Audit Form */}
          <div>
            <AuditForm />
          </div>

          <p className="text-xs text-neutral-600 mt-8">
            Built by SEO engineers. No spam. Results in minutes.
          </p>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="py-24 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">Analysis</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight">
            Six dimensions of search performance
          </h2>
          <p className="text-neutral-500 mt-3 max-w-lg text-sm leading-relaxed">
            We don&apos;t just check the basics. We analyze everything that determines whether people — and AI — can find your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900 mt-12 border border-neutral-900">
            {dimensions.map((d) => (
              <div key={d.title} className="bg-neutral-950 p-8">
                <span className="text-2xl">{d.icon}</span>
                <h3 className="text-sm font-semibold mt-4">{d.title}</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{d.desc}</p>
                <p className="text-[10px] font-mono text-neutral-700 mt-4">{d.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">Process</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight">
            Three steps. No signup.
          </h2>

          <div className="mt-12 space-y-8">
            {[
              { num: '01', title: 'Enter your URL', desc: 'Paste your website address. We handle everything else.' },
              { num: '02', title: 'Get your score', desc: 'In minutes, see your AI readiness grade, top issues, and a preview of the full report.' },
              { num: '03', title: 'Unlock the full report', desc: '15–20 pages of analysis with specific fix instructions. $29 one-time.' },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <span className="text-3xl font-bold text-neutral-800 font-mono">{step.num}</span>
                <div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GEO Section */}
      <section className="py-24 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">The shift</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight">
            Google isn&apos;t the only search engine anymore.
          </h2>
          <p className="text-neutral-500 mt-3 max-w-lg text-sm leading-relaxed">
            ChatGPT, Perplexity, and AI assistants are how millions find businesses. GEO — Generative Engine Optimization — is how you show up.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-4">
              {[
                '40% of Gen Z uses AI over Google for search',
                'AI search projected to capture 25% of traffic by 2026',
                'Most small businesses have zero AI search optimization',
              ].map((stat) => (
                <div key={stat} className="flex gap-3 items-start">
                  <span className="text-neutral-700 text-xs mt-0.5">▸</span>
                  <p className="text-sm text-neutral-400">{stat}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                'Can AI crawlers access your site?',
                'Does your content have structured data?',
                'Are your FAQs formatted for AI extraction?',
                'Is your content structured for citation?',
              ].map((item) => (
                <div key={item} className="flex gap-2 text-xs text-neutral-500">
                  <span className="text-neutral-700">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">Pricing</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight">
            One report. One price. No subscriptions.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 mt-12 border border-neutral-900">
            <div className="bg-neutral-950 p-8">
              <h3 className="text-sm font-semibold">Free Preview</h3>
              <p className="text-3xl font-bold mt-2">$0</p>
              <div className="mt-6 space-y-2 text-xs text-neutral-500">
                <p>✓ Overall AI readiness grade</p>
                <p>✓ Top 3 critical issues</p>
                <p>✓ Category scores</p>
                <p>✓ Quick stats</p>
                <p className="text-neutral-700">✗ Detailed analysis</p>
                <p className="text-neutral-700">✗ Fix instructions</p>
                <p className="text-neutral-700">✗ Action plan</p>
              </div>
              <a href="#hero" className="block mt-8 text-center border border-neutral-800 text-neutral-400 text-xs py-2.5 rounded-md hover:border-neutral-700 transition-colors">
                Get Free Preview
              </a>
            </div>
            <div className="bg-neutral-950 p-8 border-l border-neutral-900">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Full Report</h3>
                <span className="text-[10px] font-mono text-neutral-600 border border-neutral-800 px-1.5 py-0.5 rounded">RECOMMENDED</span>
              </div>
              <p className="text-3xl font-bold mt-2">$29</p>
              <div className="mt-6 space-y-2 text-xs text-neutral-400">
                <p>✓ Everything in Free, plus:</p>
                <p>✓ 15–20 page deep analysis</p>
                <p>✓ Specific fix instructions</p>
                <p>✓ AI search optimization guide</p>
                <p>✓ Competitor comparison</p>
                <p>✓ Prioritized action plan</p>
                <p>✓ PDF download</p>
              </div>
              <p className="text-[10px] text-neutral-600 mt-4">
                Equivalent agency report: <span className="line-through">$500+</span>
              </p>
              <a href="#hero" className="block mt-4 text-center bg-white text-black text-xs font-medium py-2.5 rounded-md hover:bg-neutral-200 transition-colors">
                Get Full Report — $29
              </a>
              <p className="text-[10px] text-neutral-700 text-center mt-2">100% money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      {/* Final CTA */}
      <section className="py-24 border-t border-neutral-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            See what&apos;s holding your website back.
          </h2>
          <p className="text-neutral-500 text-sm mt-3">Free audit. No signup. Results in minutes.</p>
          <a href="#hero" className="inline-block mt-8 bg-white text-black text-sm font-medium px-8 py-3 rounded-md hover:bg-neutral-200 transition-colors">
            Start Your Audit →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-sm font-semibold">Impulse Studios</p>
              <p className="text-[10px] text-neutral-600 mt-1">AI search readiness audits for businesses.</p>
            </div>
            <div className="flex gap-8 text-xs text-neutral-600">
              <a href="#hero" className="hover:text-neutral-400 transition-colors">Audit</a>
              <a href="#pricing" className="hover:text-neutral-400 transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-neutral-400 transition-colors">FAQ</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-900 text-[10px] text-neutral-700 text-center">
            © 2026 Impulse Studios. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
