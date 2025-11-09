"use client";
import { useEffect, useMemo, useState } from 'react';

type Config = {
  symbols: string[];
  riskPercent: number;
  maxPositions: number;
  timeframes: string[];
  useAI: boolean;
};

export default function Page() {
  const [config, setConfig] = useState<Config>({
    symbols: ["EURUSD","GBPUSD","USDJPY"],
    riskPercent: 1.0,
    maxPositions: 3,
    timeframes: ["M15","H1"],
    useAI: true,
  });
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<string>("");

  const symbolsStr = useMemo(() => config.symbols.join(","), [config.symbols]);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(j => setHealth(j.status || ""));
  }, []);

  return (
    <main className="container">
      <div className="alert" style={{ marginBottom: 12 }}>
        Deployment health: {health || 'checking?'}
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Bot configuration</h2>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Symbols (comma separated)</label>
            <input className="input" value={symbolsStr} onChange={(e) => setConfig((c) => ({...c, symbols: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} />
          </div>
          <div style={{ width: 140 }}>
            <label className="label">Risk % per trade</label>
            <input type="number" step="0.1" className="input" value={config.riskPercent} onChange={(e) => setConfig((c) => ({...c, riskPercent: Number(e.target.value)}))} />
          </div>
          <div style={{ width: 160 }}>
            <label className="label">Max positions</label>
            <input type="number" className="input" value={config.maxPositions} onChange={(e) => setConfig((c) => ({...c, maxPositions: Number(e.target.value)}))} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Timeframes (comma separated)</label>
            <input className="input" value={config.timeframes.join(',')} onChange={(e) => setConfig((c) => ({...c, timeframes: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} />
          </div>
          <div style={{ width: 160 }}>
            <label className="label">Use Gemini AI</label>
            <select className="input" value={String(config.useAI)} onChange={(e)=> setConfig((c)=> ({...c, useAI: e.target.value === 'true'}))}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="button" onClick={async ()=>{
            setSaving(true);
            await fetch('/api/config', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(config) });
            setSaving(false);
          }}>{saving ? 'Saving?' : 'Save configuration'}</button>
          <button className="button secondary" onClick={async ()=>{
            await fetch('/api/config', { cache: 'no-store' }).then(r=>r.json()).then((j)=> setConfig(j));
          }}>Load</button>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Quick AI check (no trading)</h2>
        <p style={{ opacity: 0.8, marginTop: -4 }}>Runs Gemini analysis for a symbol/timeframe with mocked prices.</p>
        <QuickCheck />
      </section>
    </main>
  );
}

function QuickCheck() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('H1');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="row">
        <div style={{ width: 180 }}>
          <label className="label">Symbol</label>
          <input className="input" value={symbol} onChange={(e)=> setSymbol(e.target.value)} />
        </div>
        <div style={{ width: 180 }}>
          <label className="label">Timeframe</label>
          <input className="input" value={timeframe} onChange={(e)=> setTimeframe(e.target.value)} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button className="button" onClick={async()=>{
            setLoading(true);
            setResult('');
            const r = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ symbol, timeframe }) });
            const j = await r.json();
            setResult(JSON.stringify(j, null, 2));
            setLoading(false);
          }}>{loading ? 'Running?' : 'Run analysis'}</button>
        </div>
      </div>
      {result && (
        <pre style={{ background: '#0e1627', border: '1px solid #1f2a44', borderRadius: 8, padding: 12, overflowX: 'auto', marginTop: 12 }}>
{result}
        </pre>
      )}
    </div>
  );
}
