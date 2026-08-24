import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, Flag, Database,
  ScanLine, Activity, Wifi, Server
} from 'lucide-react';

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Overview'         },
  { to: '/add',     icon: PlusCircle,      label: 'Add Entry'        },
  { to: '/flagged', icon: Flag,            label: 'Review Queue'     },
  { to: '/records', icon: Database,        label: 'Cloud Records'    },
  { to: '/scan',    icon: ScanLine,        label: 'Dup. Scanner'     },
];

/* DataPure custom logo mark */
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="rgba(6,182,212,0.12)" />
        <path d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14C8 17.314 10.686 20 14 20C17.314 20 20 17.314 20 14" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="2.5" fill="#06b6d4" />
        <path d="M12 13.5L14 12L16 13.5L14 16L12 13.5Z" fill="white" opacity="0.9" />
      </svg>
      <span style={{
        fontFamily: 'Space Grotesk', fontWeight: 700,
        fontSize: 16, letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg,#06b6d4,#7c3aed)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        DataPure
      </span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          width: 'var(--sidebar-w)', flexShrink: 0,
          background: 'rgba(255,255,255,0.018)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          height: '100vh', position: 'relative', zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Logo />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-item"
              style={({ isActive }) => isActive ? {} : {}}>
              {({ isActive }) => (
                <motion.div
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{ width: '100%' }}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div style={{
          padding: '14px 10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <div style={{ padding: '0 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Space Grotesk' }}>
            System Status
          </div>
          <StatusItem icon={Wifi} label="API Gateway" color="#06b6d4" ping />
          <StatusItem icon={Server} label="Supabase Cloud" color="#10b981" suffix="99.9%" />
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2"
        style={{
          background: 'rgba(7,11,18,0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 12px' }}>
                <Icon size={19} style={{ color: isActive ? '#06b6d4' : '#475569' }} />
                <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? '#06b6d4' : '#475569', fontFamily: 'Space Grotesk' }}>
                  {label.split(' ')[0]}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function StatusItem({ icon: Icon, label, color, ping, suffix }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 8px', borderRadius: 8,
      cursor: 'pointer', transition: 'background 0.2s'
    }} className="hover:bg-white/5">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} style={{ color: '#64748b' }} />
        <span style={{ fontSize: 12.5, color: '#94a3b8', fontFamily: 'Inter', fontWeight: 500 }}>{label}</span>
      </div>
      {suffix ? (
        <span style={{ fontSize: 11, fontFamily: 'Space Grotesk', color, fontWeight: 600 }}>{suffix}</span>
      ) : (
        <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
          {ping && (
            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: color, opacity: 0.75, animation: 'pulse-out 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          )}
          <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 8, width: 8, backgroundColor: color }} />
        </span>
      )}
    </div>
  );
}
