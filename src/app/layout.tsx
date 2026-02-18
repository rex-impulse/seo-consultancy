import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://seo.impulsestudios.cc'),
  title: 'Is Your Business Invisible to ChatGPT? | AI Search Readiness Audit',
  description: 'Find out if AI search engines like ChatGPT can find your business. Free AI readiness audit — see your score, top issues, and how to get cited by AI. Results in minutes.',
  openGraph: {
    title: 'Is Your Business Invisible to ChatGPT?',
    description: 'Free AI search readiness audit. See if ChatGPT, Perplexity, and AI assistants can find your business.',
    url: 'https://seo.impulsestudios.cc',
    siteName: 'Impulse Studios',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is Your Business Invisible to ChatGPT?',
    description: 'Free AI search readiness audit. Results in minutes.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-neutral-950">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-neutral-950 text-white">{children}</body>
    </html>
  );
}
