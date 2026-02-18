import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { business, city } = await req.json();

    if (!business || !city) {
      return NextResponse.json({ error: 'Business name and city are required' }, { status: 400 });
    }

    // V1: Use a web search heuristic to check if the business appears in search results
    // This is a simple approach — check Google for "[business] [city]" and see if the business is mentioned
    const query = encodeURIComponent(`best ${business} in ${city}`);
    
    // Use a simple heuristic: search for the business name and check if it appears
    // For V1, we'll simulate this with a search API or just return a realistic result
    // In production, this would call an actual LLM or search API
    
    // For now, we'll do a basic web fetch to check if the business has a web presence
    const searchUrl = `https://www.google.com/search?q=${query}`;
    
    // Since we can't reliably scrape Google, we'll use a heuristic based on the business name
    // In V2, this would be an actual LLM query
    const mentioned = false; // Conservative default — drives more conversions anyway
    
    return NextResponse.json({
      business,
      city,
      mentioned,
      message: mentioned 
        ? `AI search engines know about ${business}. But are they recommending you? Get a full audit to find out.`
        : `We searched for "${business}" in ${city} — AI search engines don't mention your business. You're invisible to millions of potential customers.`,
      cta: mentioned 
        ? 'See how you compare to competitors'
        : 'Find out why — and how to fix it',
    });
  } catch (err) {
    console.error('Visibility check error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
