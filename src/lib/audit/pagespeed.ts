export interface PageSpeedResult {
  score: number; // 0-100
  fcp: number; // ms
  lcp: number; // ms
  cls: number;
  tbt: number; // ms
  speedIndex: number; // ms
  interactive: number; // ms
  error?: string;
}

export async function runPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`;
  
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timer);
    
    if (!res.ok) {
      return { score: 50, fcp: 3000, lcp: 5000, cls: 0.15, tbt: 500, speedIndex: 4000, interactive: 5000, error: `API returned ${res.status}` };
    }

    const data = await res.json();
    const lighthouse = data.lighthouseResult;
    if (!lighthouse) {
      return { score: 50, fcp: 3000, lcp: 5000, cls: 0.15, tbt: 500, speedIndex: 4000, interactive: 5000, error: 'No lighthouse data' };
    }

    const audits = lighthouse.audits || {};
    const score = Math.round((lighthouse.categories?.performance?.score || 0.5) * 100);
    
    return {
      score,
      fcp: audits['first-contentful-paint']?.numericValue || 3000,
      lcp: audits['largest-contentful-paint']?.numericValue || 5000,
      cls: audits['cumulative-layout-shift']?.numericValue || 0.15,
      tbt: audits['total-blocking-time']?.numericValue || 500,
      speedIndex: audits['speed-index']?.numericValue || 4000,
      interactive: audits['interactive']?.numericValue || 5000,
    };
  } catch (err: any) {
    return { score: 50, fcp: 3000, lcp: 5000, cls: 0.15, tbt: 500, speedIndex: 4000, interactive: 5000, error: err.message };
  }
}
