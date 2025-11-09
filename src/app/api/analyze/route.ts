import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an FX trade setup analyzer. Given recent OHLC data, propose at most one high-probability setup or return NONE. Be concise JSON with keys: decision(one of NONE|LONG|SHORT), entry(float), stop(float), takeProfit(float), rationale(string up to 240 chars). Favor R multiple >= 1.5 and avoid entries far from moving averages.`;

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-pro' });
}

export async function POST(req: NextRequest) {
  const { symbol = 'EURUSD', timeframe = 'H1', candles } = await req.json();
  // Fallback mock candles if none provided to allow demo
  const data = Array.isArray(candles) && candles.length > 0 ? candles : Array.from({ length: 60 }, (_, i) => {
    const base = 1.05 + Math.sin(i/8) * 0.003 + (i/2000);
    const o = base + (Math.random()-0.5)*0.0007;
    const h = o + Math.random()*0.0009;
    const l = o - Math.random()*0.0009;
    const c = (o+h+l)/3 + (Math.random()-0.5)*0.0003;
    return { t: i, o: +o.toFixed(5), h: +h.toFixed(5), l: +l.toFixed(5), c: +c.toFixed(5) };
  });

  const model = getGenAI();
  if (!model) {
    // If no key, return deterministic baseline output
    return NextResponse.json({
      decision: 'NONE',
      rationale: 'Gemini key missing. No trade suggested. Configure GEMINI_API_KEY.'
    });
  }

  const prompt = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'user', parts: [{ text: `Symbol: ${symbol} Timeframe: ${timeframe}` }] },
    { role: 'user', parts: [{ text: `Candles JSON: ${JSON.stringify(data.slice(-120))}` }] },
  ];

  try {
    const resp = await model.generateContent({ contents: prompt });
    const text = resp.response.text();
    // Attempt to parse JSON from the model output
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { decision: 'NONE', rationale: 'Unparsable model output' };
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ decision: 'NONE', rationale: `Error: ${(e as Error).message}` });
  }
}
