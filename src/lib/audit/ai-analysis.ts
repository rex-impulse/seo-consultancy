const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const SEO_EXPERT_PROMPT = `You are an expert SEO and GEO (Generative Engine Optimization) consultant writing a professional audit report for a small business owner. You have 10+ years of experience at top agencies.

Your analysis style:
- Write like you're talking to a client over coffee, not writing a formal report. Natural, conversational, human.
- Use phrases like "Looking at your landing page, it seems like...", "I noticed that...", "Here's what stood out to me...", "If I'm understanding your business correctly..."
- Be verbose where it adds value — explain the "why" behind recommendations, not just the "what"
- If something is unclear or you're making an assumption, acknowledge it: "If we're not aligned on this, that's worth revisiting"
- Be specific and actionable (not "improve your SEO" but "add a meta description to your homepage that includes your city name and primary service")
- Quantify impact where possible ("this could increase your click-through rate by 20-40%")
- Prioritize ruthlessly — what matters most goes first
- Be honest but not scary — frame issues as opportunities
- Use concrete examples from THEIR actual website data
- Write paragraphs that flow naturally, not bulleted lists in paragraph form

You are especially expert in GEO — optimizing websites to be cited by AI search engines like ChatGPT, Perplexity, and Google AI Overviews. This is a new and underserved area that most businesses don't know about.`;

export interface AIAnalysisResult {
  executiveSummary: string;
  geoAnalysis: string;
  technicalAnalysis: string;
  contentAnalysis: string;
  visibilityAnalysis: string;
  competitorInsights: string;
  actionPlan: {
    quickWins: string[];
    mediumTerm: string[];
    strategic: string[];
  };
  teaserHighlight: {
    shockingStat: string;
    oneSpecificIssue: string;
    estimatedImpact: string;
  };
}

export async function runAIAnalysis(url: string, crawlData: any, pageSpeedData: any, scores: any): Promise<AIAnalysisResult> {
  const userPrompt = `Analyze this website audit data and write a comprehensive report.

WEBSITE: ${url}

CRAWL DATA:
- Pages analyzed: ${crawlData.pagesAnalyzed}
- SSL: ${crawlData.ssl ? 'Yes' : 'No'}
- Robots.txt: ${JSON.stringify(crawlData.robotsTxt)}
- Sitemap: ${crawlData.sitemap.exists ? `Yes (${crawlData.sitemap.urlCount} URLs)` : 'No sitemap found'}
- Pages: ${JSON.stringify(crawlData.pages, null, 2)}

PAGESPEED DATA:
${JSON.stringify(pageSpeedData, null, 2)}

SCORES:
- Overall: ${scores.overall} (${scores.grade})
- GEO/AI Readiness: ${scores.geo}
- Technical: ${scores.technical}
- Content: ${scores.content}
- Visibility: ${scores.visibility}
- On-Page: ${scores.onpage}

ISSUES FOUND:
${JSON.stringify(scores.issues, null, 2)}

Write the following sections as a JSON object:

{
  "executiveSummary": "2-3 paragraphs. Start with the overall picture, mention the grade, highlight the top 3 things they need to fix, and end with an encouraging note about their potential.",
  
  "geoAnalysis": "3-4 paragraphs about their AI search readiness. Can ChatGPT/Perplexity find them? Do they have structured data? Is their content citeable? What specific changes would make AI engines cite them? Be very specific with examples from their actual content.",
  
  "technicalAnalysis": "2-3 paragraphs about technical health. Page speed specifics, mobile issues, SSL, crawlability. Reference actual numbers from the PageSpeed data.",
  
  "contentAnalysis": "2-3 paragraphs about content quality. Thin pages, missing meta descriptions, heading structure, image alt text. Reference specific pages and issues.",
  
  "visibilityAnalysis": "2 paragraphs about search visibility. Sitemap, robots.txt, canonical tags, internal linking. Reference actual findings.",
  
  "competitorInsights": "1-2 paragraphs with general competitor observations based on the industry/niche you can infer from the site content. What do top-ranking sites in this space typically do that this site doesn't?",
  
  "actionPlan": {
    "quickWins": ["3-5 specific things they can fix in under 15 minutes each. Be VERY specific — 'Add this exact meta description to your homepage: [write it for them]'"],
    "mediumTerm": ["3-4 things to fix this month. E.g., 'Create an FAQ page answering these 5 questions: [list them]'"],
    "strategic": ["2-3 longer-term initiatives. E.g., 'Start a blog targeting these keywords: [list 3-5]'"]
  },
  
  "teaserHighlight": {
    "shockingStat": "One alarming statistic from their audit that would make them want to pay for the full report. E.g., 'Your homepage takes 5.2 seconds to load — 53% of visitors leave before it finishes.'",
    "oneSpecificIssue": "The single most impactful issue explained in 2-3 sentences, written to scare them into action.",
    "estimatedImpact": "A rough estimate of what fixing these issues could do. E.g., 'Fixing the top 5 issues could increase your organic traffic by 40-60% within 3 months.'"
  }
}

Return ONLY valid JSON, no markdown formatting.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SEO_EXPERT_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Anthropic API error:', response.status, err);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  
  try {
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    console.error('Failed to parse AI response:', parseErr);
    // Return a fallback structure
    return {
      executiveSummary: text.slice(0, 500),
      geoAnalysis: 'AI analysis could not be parsed. Please contact support.',
      technicalAnalysis: '',
      contentAnalysis: '',
      visibilityAnalysis: '',
      competitorInsights: '',
      actionPlan: { quickWins: [], mediumTerm: [], strategic: [] },
      teaserHighlight: {
        shockingStat: `Your website scored ${scores.grade} (${scores.overall}/100) in our comprehensive audit.`,
        oneSpecificIssue: scores.issues?.[0]?.description || 'Multiple issues were found.',
        estimatedImpact: 'Fixing the identified issues could significantly improve your search visibility.',
      },
    };
  }
}
