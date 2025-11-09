import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI Forex Bot Dashboard',
  description: 'Control panel for AI-powered MT5 trading bot',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', background: '#0b1220', color: '#e6eef8' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 16px' }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>AI Forex Bot</h1>
            <nav style={{ opacity: 0.8 }}>MT5 + Gemini</nav>
          </header>
          {children}
          <footer style={{ marginTop: 48, opacity: 0.6, fontSize: 12 }}>Trading involves risk. Use at your own discretion.</footer>
        </div>
      </body>
    </html>
  );
}
