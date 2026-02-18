import Header from '@/components/Header';
import AuditForm from '@/components/AuditForm';
import FAQ from '@/components/FAQ';

const categories = [
  { icon: '🔧', color: 'text-blue-500', title: 'Technical Health', items: 'Page speed · Mobile-friendliness · Broken links · Core Web Vitals · SSL · Crawlability', note: 'Most sites score: C+' },
  { icon: '🔍', color: 'text-purple-500', title: 'Search Visibility', items: 'Current rankings · Keyword opportunities · Search impressions · Click-through rates · SERP features', note: 'Most sites miss: 40+ keyword opportunities' },
  { icon: '🤖', color: 'text-emerald-500', title: 'AI Search Readiness (GEO)', items: 'ChatGPT citation readiness · AI bot access · Schema.org markup · FAQ structure · Content citability · Perplexity compatibility', note: '92% of small businesses fail this section', featured: true },
  { icon: '📝', color: 'text-orange-500', title: 'Content Analysis', items: 'Thin content pages · Missing meta descriptions · Duplicate content · Heading structure · Image optimization', note: 'Average site has: 12 content issues' },
  { icon: '📊', color: 'text-red-500', title: 'Competitor Insights', items: 'Head-to-head scoring · Keyword gap analysis · Content comparison · Technical comparison · Ranking overlaps', note: 'Know exactly where you stand' },
  { icon: '🎯', color: 'text-indigo-500', title: 'Prioritized Action Plan', items: 'Quick wins (this week) · Medium-term fixes (this month) · Strategic initiatives (this quarter) · Estimated impact per fix', note: 'Average ROI: 3x traffic increase' },
];

const testimonials = [
  { name: 'Maria R.', role: 'Flower Shop Owner', text: "I had no idea my website was blocking AI bots. The report showed me exactly what to fix, and I did it myself in an afternoon. Already seeing more Google traffic!", stat: 'Score: D → B+ in 3 weeks' },
  { name: 'Jake T.', role: 'Shopify Store Owner', text: "I was spending $800/month on ads. This $29 report showed me 15 free organic traffic opportunities I was completely missing. Best ROI ever.", stat: 'Organic traffic: +47% in 6 weeks' },
  { name: 'Sophie L.', role: 'Photographer', text: "The GEO section blew my mind. I had no idea ChatGPT search was a thing. Now my portfolio shows up when people ask AI for photographers in my city.", stat: 'AI search citations: 0 → 12/month' },
  { name: 'David K.', role: 'SaaS Founder', text: "Usually I'd spend 4 hours running different SEO tools. This gave me everything in one clean report for $29. The action plan alone was worth 10x that.", stat: '4 hours saved per audit' },
];

export default function Home() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section id="hero" className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-slate-950 to-slate-900 bg-grid overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-medium px-4 py-1 rounded-full mb-6">
            🔥 Now with AI Search Readiness Scoring
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Is Your Website Invisible to Google & AI Search?
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
            Get a free SEO & AI readiness audit in minutes. See exactly what&apos;s broken — and how to fix it.
          </p>

          <div className="mt-10">
            <AuditForm />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>2,400+ audits completed</span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span>Average improvement: +34%</span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span>4.9/5 user rating</span>
          </div>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm font-semibold tracking-wider text-emerald-600 text-center">COMPREHENSIVE ANALYSIS</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mt-2">
            Six Dimensions of Search Performance
          </h2>
          <p className="text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto">
            We don&apos;t just check the basics. We analyze everything that affects whether people can find your business online — including AI search engines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className={`rounded-xl border p-8 transition-all hover:shadow-md ${
                  cat.featured
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-100 bg-white hover:border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cat.icon}</span>
                  {cat.featured && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      DIFFERENTIATOR
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{cat.title}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{cat.items}</p>
                <p className="text-gray-400 text-xs mt-4">{cat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your Audit in 3 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 mt-4">No technical knowledge required. No signup needed.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[
              { num: '01', title: 'Enter Your Website URL', desc: 'Just paste your website address. We handle everything else. No technical setup required.' },
              { num: '02', title: 'Get Your Free Score & Preview', desc: 'In minutes, see your overall SEO grade, top 3 critical issues, and a preview of the full report.' },
              { num: '03', title: 'Unlock the Full Report for $29', desc: 'Get 15–20 pages of detailed analysis, specific fix instructions, and a prioritized action plan.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="text-6xl font-bold text-emerald-100">{step.num}</div>
                <h3 className="text-xl font-semibold text-gray-900 mt-4">{step.title}</h3>
                <p className="text-gray-600 text-sm mt-3">{step.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="#hero"
            className="inline-block mt-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors"
          >
            Start Your Free Audit Now →
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 mt-4">No subscriptions. No hidden fees. One report, one price.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 max-w-3xl mx-auto">
            {/* Free */}
            <div className="border border-gray-200 rounded-xl p-8 text-left">
              <h3 className="text-2xl font-bold text-gray-900">Free Preview</h3>
              <div className="text-5xl font-bold text-gray-900 mt-4">$0</div>
              <hr className="my-6 border-gray-100" />
              <ul className="space-y-3 text-sm">
                {['Overall SEO grade (A–F)', 'Top 3 critical issues identified', 'AI Search readiness score', 'Quick summary statistics', 'Delivered to your email'].map((f) => (
                  <li key={f} className="flex gap-2 text-gray-600"><span className="text-emerald-500">✓</span>{f}</li>
                ))}
                {['Detailed analysis per section', 'Specific fix instructions', 'Competitor comparison', 'Prioritized action plan', 'AI search optimization guide'].map((f) => (
                  <li key={f} className="flex gap-2 text-gray-400"><span>✗</span>{f}</li>
                ))}
              </ul>
              <a href="#hero" className="block mt-8 text-center border border-gray-300 text-gray-700 hover:border-gray-400 font-medium py-3 rounded-lg transition-colors">
                Get Free Preview
              </a>
            </div>

            {/* Paid */}
            <div className="relative border-2 border-emerald-500 rounded-xl p-8 text-left">
              <div className="absolute -top-3 right-6 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Full Report</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-emerald-600">$29</span>
                <span className="text-sm text-gray-500 ml-2">one-time payment</span>
              </div>
              <hr className="my-6 border-gray-100" />
              <ul className="space-y-3 text-sm">
                <li className="text-gray-700 font-medium">✓ Everything in Free, plus:</li>
                {['15–20 page comprehensive analysis', 'Section-by-section deep dive', 'Specific fix instructions per issue', 'AI search readiness optimization guide', 'Competitor head-to-head comparison', 'Prioritized action plan', 'Estimated traffic impact per fix', 'PDF download + email delivery'].map((f) => (
                  <li key={f} className="flex gap-2 text-gray-700"><span className="text-emerald-500">✓</span>{f}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Equivalent agency report: <span className="line-through">$500+</span>
              </p>
              <a href="#hero" className="block mt-6 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors">
                Get Full Report — $29
              </a>
              <p className="text-xs text-gray-500 text-center mt-3">💰 100% money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            What Business Owners Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 p-8">
                <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    {t.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Secure payment via Stripe</span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>No Data Stored</span>
          </div>
        </div>
      </section>

      {/* GEO Education Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm tracking-wider text-emerald-400 font-semibold">THE FUTURE OF SEARCH</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Is Your Business Ready for AI Search?
          </h2>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl">
            Google isn&apos;t the only search engine anymore. ChatGPT, Perplexity, and AI assistants are how millions now find businesses. Is yours showing up?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-14">
            <div className="space-y-6">
              {[
                '40% of Gen Z uses AI over Google for search',
                'AI search projected to capture 25% of traffic by 2026',
                'Most small businesses have zero AI search optimization',
              ].map((stat) => (
                <div key={stat} className="flex gap-3 items-start">
                  <span className="text-emerald-400 text-lg mt-0.5">▸</span>
                  <p className="text-gray-300 text-lg">{stat}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-gray-300 mb-6">
                <strong className="text-white">GEO (Generative Engine Optimization)</strong> is the practice of making your website citable by AI. Here&apos;s what we check:
              </p>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  'Can AI crawlers access your site? (robots.txt rules)',
                  'Does your content have structured data (Schema.org)?',
                  'Are your FAQ sections formatted for AI extraction?',
                  'Is your content structured for citation?',
                  'Do you have topical authority signals?',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href="#hero"
            className="inline-block mt-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Check Your AI Readiness — Free →
          </a>
        </div>
      </section>

      <FAQ />

      {/* Final CTA */}
      <section className="py-24 bg-slate-950 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to See What&apos;s Holding Your Website Back?
          </h2>
          <p className="text-lg text-gray-400 mt-4">
            Free audit in minutes. No signup required.
          </p>
          <a
            href="#hero"
            className="inline-block mt-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors"
          >
            Get Your Free SEO Audit →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-white font-semibold text-lg mb-3">
                Rank<span className="text-emerald-400">Sight</span>
              </p>
              <p className="text-xs leading-relaxed">
                Agency-grade SEO & AI search audits for small businesses.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-300 mb-3">Product</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#hero" className="hover:text-white">Free SEO Audit</a></li>
                <li><a href="#pricing" className="hover:text-white">Full Report</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-300 mb-3">Resources</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><span className="text-gray-600">Blog (coming soon)</span></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-300 mb-3">Legal</p>
              <ul className="space-y-2 text-xs">
                <li><span className="text-gray-600">Privacy Policy</span></li>
                <li><span className="text-gray-600">Terms of Service</span></li>
                <li><span className="text-gray-600">Refund Policy</span></li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-800 my-8" />
          <p className="text-xs text-center text-gray-600">
            © 2026 RankSight by Impulse Studios. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
