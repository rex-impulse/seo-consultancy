import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://seo.impulsestudios.cc'),
  title: 'Free AI SEO Audit | Check Your Website\'s AI Search Readiness',
  description: 'Get a free SEO & AI search readiness audit for your website. See your score, top issues, and how to rank higher on Google and AI search engines like ChatGPT. Results in minutes.',
  openGraph: {
    title: 'Free AI SEO Audit | Check Your Website\'s AI Search Readiness',
    description: 'Get a free SEO & AI search readiness audit for your website. See your score, top issues, and how to rank higher on Google and AI search engines like ChatGPT.',
    url: 'https://seo.impulsestudios.cc',
    siteName: 'RankSight',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI SEO Audit | RankSight',
    description: 'Is your website ready for AI search? Find out in minutes — free.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'RankSight SEO & GEO Audit',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              description: 'Free AI-powered SEO and GEO audit tool that analyzes your website\'s search performance across Google and AI search engines like ChatGPT, Perplexity, and Google AI Overviews.',
              url: 'https://seo.impulsestudios.cc',
              offers: {
                '@type': 'AggregateOffer',
                lowPrice: '0',
                highPrice: '29',
                priceCurrency: 'USD',
                offerCount: '2',
              },
              creator: {
                '@type': 'Organization',
                name: 'Impulse Studios',
                url: 'https://impulsestudios.cc',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
