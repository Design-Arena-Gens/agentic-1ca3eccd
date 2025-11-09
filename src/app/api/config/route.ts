import { NextRequest, NextResponse } from 'next/server';

type Config = {
  symbols: string[];
  riskPercent: number;
  maxPositions: number;
  timeframes: string[];
  useAI: boolean;
};

let memoryConfig: Config = {
  symbols: ["EURUSD","GBPUSD","USDJPY"],
  riskPercent: 1.0,
  maxPositions: 3,
  timeframes: ["M15","H1"],
  useAI: true,
};

export async function GET() {
  return NextResponse.json(memoryConfig);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Config>;
  memoryConfig = {
    ...memoryConfig,
    ...body,
    symbols: body.symbols?.filter(Boolean) || memoryConfig.symbols,
    timeframes: body.timeframes?.filter(Boolean) || memoryConfig.timeframes,
  };
  return NextResponse.json({ ok: true });
}
