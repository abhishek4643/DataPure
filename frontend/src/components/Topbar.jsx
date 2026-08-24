import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Wifi, Database, Settings } from 'lucide-react';
import { getStats } from '../api';

const TITLES = {
  '/':        { title: 'Overview',         sub: 'Data integrity command center' },
  '/add':     { title: 'Add Entry',         sub: 'Validate new data before insertion' },
  '/flagged': { title: 'Review Queue',      sub: 'Human verification required' },
  '/records': { title: 'Cloud Records',     sub: 'Validated Supabase database entries' },
  '/scan':    { title: 'Duplicate Scanner', sub: 'Analyze existing cloud data' },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const [stats, setStats] = useState(null);
  const meta = TITLES[pathname] || TITLES['/'];

  useEffect(() => {
    const load = () => getStats().then(r => setStats(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      style={{
        height: 'var(--header-h)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(180deg, rgba(7, 11, 18, 0.8) 0%, rgba(7, 11, 18, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        position: 'relative', zIndex: 9,
        flexShrink: 0, gap: 16,
      }}
    >
      {/* Animated Top Border Line */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.8) 50%, transparent 100%)', opacity: 0.5 }} />

      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 3, height: 24, background: '#06b6d4', borderRadius: 4, boxShadow: '0 0 10px rgba(6,182,212,0.5)' }} />
        <div>
          <h1 style={{
            fontFamily: 'Space Grotesk', fontWeight: 700,
            fontSize: 16, color: '#f1f5f9', letterSpacing: '0.02em',
            lineHeight: 1, margin: 0,
          }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontFamily: 'Inter', letterSpacing: '0.04em' }}>
            {meta.sub}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Live stats chip */}
        {stats && (
          <div
            className="hidden md:flex items-center gap-3"
            style={{
              padding: '6px 14px', borderRadius: 20,
              background: 'linear-gradient(90deg, rgba(6,182,212,0.05) 0%, rgba(6,182,212,0.02) 100%)',
              border: '1px solid rgba(6,182,212,0.1)',
              boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.02)'
            }}
          >
            <Database size={13} style={{ color: '#06b6d4' }} />
            <span style={{ fontSize: 12, fontFamily: 'Space Grotesk', color: '#94a3b8' }}>
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>{stats.total_entries.toLocaleString()}</span>
              {' records · '}
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{stats.duplicates_blocked}</span>
              {' blocked'}
            </span>
          </div>
        )}

        {/* API status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 20,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#10b981',
            boxShadow: '0 0 8px #10b981', animation: 'pulse-out 2s infinite'
          }} />
          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700, fontFamily: 'Space Grotesk', letterSpacing: '0.1em' }}>
            SYSTEM ONLINE
          </span>
        </div>

      </div>
    </header>
  );
}
