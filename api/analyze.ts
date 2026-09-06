import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM = `You are ORACLE, a precise staff engineer. Return ONLY valid JSON matching the requested schema. Separate evidence-backed observations from interpretations. Never claim certainty without evidence.`;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'AI review is not configured on this deployment.' });
  const context = req.body?.context;
  if (!context || typeof context !== 'object') return res.status(400).json({ error: 'Missing analysis context.' });
  // The browser sends only a bounded static-analysis digest, never repository contents by default.
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.2, response_format: { type:'json_object' }, messages: [
        { role:'system', content:SYSTEM },
        { role:'user', content:`Analyze this static repository digest. Return {executiveSummary:string, architecture:{summary:string, confidence:"high"|"medium"|"low", layers:string[]}, strengths:string[], risks:{title:string, detail:string, severity:"low"|"medium"|"high"}[], recommendations:string[], onboarding:string[], health:{maintainability:number, modularity:number, coupling:number, complexity:number, testability:number, security:number}}. Scores are 0–100 estimates and must explain uncertainty in prose. Digest:\n${JSON.stringify(context).slice(0, 50000)}` }
      ] })
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);
    if (!parsed.executiveSummary || !parsed.architecture || !Array.isArray(parsed.risks)) throw new Error('Malformed provider response');
    return res.status(200).json(parsed);
  } catch { return res.status(502).json({ error: 'AI review could not be generated. Your deterministic analysis remains available.' }); }
}
