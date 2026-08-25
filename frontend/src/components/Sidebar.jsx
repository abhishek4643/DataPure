import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Database, Flag, Target, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFlagged } from '../api';

const NAV_ITEMS = [
  { path: '/',        icon: LayoutDashboard, label: 'Overview' },
  { path: '/add',     icon: FileText,        label: 'Add Entry' },
  { path: '/flagged', icon: Flag,            label: 'Review Queue', badge: true },
  { path: '/records', icon: Database,        label: 'Cloud Records' },
  { path: '/scan',    icon: Target,          label: 'Scanner' },
];

export default function Sidebar() {
  const loc = useLocation();
  const [qCount, setQCount] = useState(0);

  useEffect(() => {
    const fetchQ = () => getFlagged().then(r => setQCount(r.data?.length || 0)).catch(() => {});
    fetchQ();
    const t = setInterval(fetchQ, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      width: 260, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Brand - Symbol removed for cleaner look */}
      <div style={{ padding: '0 8px 32px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          DataPure
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label, badge }) => {
          const active = loc.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8,
                background: active ? 'var(--bg-surface-hover)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 500,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} style={{ color: active ? 'var(--color-primary)' : 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 14 }}>{label}</span>
              </div>
              
              {badge && qCount > 0 && (
                <div style={{
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: 11, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 12,
                }}>
                  {qCount}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
