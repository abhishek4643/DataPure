import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Database, ShieldOff, Flag, Target,
  CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft, Clock
} from 'lucide-react';
import { getStats, getEntries, getFlagged } from '../api';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

/* ── Health Core Ring ──────────────────────── */
function PurityRing({ score }) {
  const label = score >= 90 ? 'Optimal' : score >= 70 ? 'Good' : 'Needs Attention';
  const c = 2 * Math.PI * 38;
  const offset = c * (1 - Math.min(score, 100) / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position:'relative', width:200, height:200, marginTop:8 }}>
      <svg style={{ width:'100%', height:'100%' }} viewBox="0 0 120 120">
        {/* Outer dashed ring */}
        <circle className="spin-slow" cx="60" cy="60" fill="none" r="54" stroke="rgba(76,215,246,0.3)" strokeDasharray="4 8" strokeWidth="1.5"></circle>
        {/* Middle segmented ring */}
        <circle className="spin-reverse" cx="60" cy="60" fill="none" r="46" stroke="rgba(210,187,255,0.4)" strokeDasharray="20 10 5 10" strokeWidth="3"></circle>
        {/* Inner solid track */}
        <circle cx="60" cy="60" fill="none" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
        {/* Active progress ring */}
        <motion.circle
          cx="60" cy="60" fill="none" r="38" stroke={score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'}
          strokeDasharray={c} strokeLinecap="round" strokeWidth="6" transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Scanning line */}
        <g className="scan-line">
          <line opacity="0.8" stroke="#4cd7f6" strokeWidth="1.5" x1="60" x2="60" y1="6" y2="60"></line>
          <polygon fill="#4cd7f6" opacity="0.5" points="58,6 62,6 60,10"></polygon>
        </g>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:40, color:score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444', fontFamily:'Space Grotesk', fontWeight:800, textShadow: `0 0 20px ${score >= 90 ? 'rgba(16,185,129,0.4)' : score >= 70 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
          {score.toFixed(1)}<span style={{ fontSize:18, opacity: 0.8 }}>%</span>
        </span>
        <span style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2, fontWeight:700 }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Donut Chart Tooltip ───────────────────── */
function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-hi" style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12 }}>
      <div style={{ color: d.payload.color, fontWeight: 700, fontFamily: 'Space Grotesk' }}>{d.name}</div>
      <div style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>{d.value.toLocaleString()}</div>
    </div>
  );
}

/* ── Activity Timeline Item ────────────────── */
function ActivityItem({ type, name, time }) {
  const cfg = {
    unique:    { Icon: CheckCircle2, color: '#10b981', label: 'Validated' },
    redundant: { Icon: XCircle,      color: '#ef4444', label: 'Blocked'   },
    pending:   { Icon: AlertTriangle,color: '#f59e0b', label: 'Flagged'   },
    approved:  { Icon: CheckCircle2, color: '#10b981', label: 'Approved'  },
    rejected:  { Icon: XCircle,      color: '#ef4444', label: 'Rejected'  },
  }[type] || { Icon: Database, color: '#64748b', label: 'Record' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${cfg.color}15`, border: `1px solid ${cfg.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <cfg.Icon size={13} style={{ color: cfg.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name || 'Unknown record'}
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{cfg.label}</div>
      </div>
      <div style={{ fontSize: 11, color: '#334155', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} />
        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

/* ── Active Neural Matrix (Ultra Innovative) ── */
function ActiveNeuralMatrix() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const initialNodes = Array(40).fill(0).map((_, i) => ({
      id: i,
      x: (i % 8) * 12 + 8 + Math.random() * 4 - 2,
      y: Math.floor(i / 8) * 20 + 10 + Math.random() * 6 - 3,
      state: 'idle',
    }));
    setNodes(initialNodes);

    const interval = setInterval(() => {
      setNodes(current => {
        const next = [...current];
        const idx = Math.floor(Math.random() * next.length);
        const rand = Math.random();
        next[idx] = { 
          ...next[idx], 
          state: rand > 0.75 ? 'duplicate' : rand > 0.4 ? 'unique' : 'scanning'
        };
        return next.map(n => Math.random() > 0.85 ? { ...n, state: 'idle' } : n);
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', borderRadius: 10, background: 'linear-gradient(180deg, rgba(7,11,18,0) 0%, rgba(6,182,212,0.03) 100%)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '12px 12px', opacity: 0.5 }} />
      
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        {nodes.map(n1 => 
          nodes.filter(n2 => n1.id < n2.id && Math.hypot(n1.x - n2.x, n1.y - n2.y) < 22).map(n2 => (
            <line key={`${n1.id}-${n2.id}`} x1={`${n1.x}%`} y1={`${n1.y}%`} x2={`${n2.x}%`} y2={`${n2.y}%`} 
              stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
          ))
        )}
        
        {nodes.map(node => {
          let color = 'rgba(255,255,255,0.15)';
          let glow = 'transparent';
          if (node.state === 'scanning') { color = '#06b6d4'; glow = 'rgba(6,182,212,0.4)'; }
          if (node.state === 'unique') { color = '#10b981'; glow = 'rgba(16,185,129,0.4)'; }
          if (node.state === 'duplicate') { color = '#ef4444'; glow = 'rgba(239,68,68,0.4)'; }
          
          return (
            <g key={node.id}>
              {node.state !== 'idle' && (
                <circle cx={`${node.x}%`} cy={`${node.y}%`} r="3.5" fill={glow} className="animate-ping" style={{ transformOrigin: 'center' }} />
              )}
              <motion.circle 
                cx={`${node.x}%`} cy={`${node.y}%`} r={node.state !== 'idle' ? 1.5 : 1} 
                fill={color}
                animate={{ r: node.state !== 'idle' ? [1, 2, 1] : 1 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', gap: 12, fontSize: 9, fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4' }}/> Scanning</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}/> Unique</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }}/> Blocked</div>
      </div>
    </div>
  );
}

/* ── Cryptographic Hash Stream (Ultra Unique) ── */
function CryptographicHashStream() {
  const [hashes, setHashes] = useState([]);

  useEffect(() => {
    const generateHash = () => {
      const chars = '0123456789abcdef';
      return Array(16).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const initial = Array(5).fill(0).map((_, i) => ({
      id: i,
      hash: generateHash(),
      status: 'scanning',
    }));
    setHashes(initial);

    const interval = setInterval(() => {
      setHashes(curr => {
        const next = [...curr];
        const idx = Math.floor(Math.random() * next.length);
        const rand = Math.random();
        next[idx] = {
          id: Date.now() + idx,
          hash: generateHash(),
          status: rand > 0.7 ? 'duplicate' : rand > 0.4 ? 'unique' : 'scanning',
        };
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', borderRadius: 10, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '100% 24px' }} />
      
      <motion.div style={{ position:'absolute', top:0, left:0, right:0, height:60, background:'linear-gradient(180deg, transparent, rgba(6,182,212,0.15))', borderBottom:'1px solid rgba(6,182,212,0.5)', zIndex:2 }}
        animate={{ y: [-60, 240] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px', position: 'relative', zIndex: 1 }}>
        {hashes.map((h, i) => {
          let color = '#475569';
          let glow = 'transparent';
          if (h.status === 'unique') { color = '#10b981'; glow = 'rgba(16,185,129,0.15)'; }
          if (h.status === 'duplicate') { color = '#ef4444'; glow = 'rgba(239,68,68,0.15)'; }
          if (h.status === 'scanning') { color = '#06b6d4'; glow = 'rgba(6,182,212,0.1)'; }

          return (
            <motion.div key={h.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: glow, padding: '6px 10px', borderRadius: 6, borderLeft: `2px solid ${color}` }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'Space Grotesk', color: color, textTransform: 'uppercase', letterSpacing: '0.15em', width: 45 }}>
                {h.status === 'scanning' ? 'SCAN' : h.status === 'unique' ? 'PASS' : 'DROP'}
              </span>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: h.status === 'scanning' ? '#94a3b8' : '#e2e8f0', letterSpacing: '0.1em' }}>
                {h.hash.slice(0, 8)}<span style={{ opacity: 0.3 }}>{h.hash.slice(8)}</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getEntries({ page: 1, page_size: 8 }), getFlagged()])
      .then(([s, e, f]) => {
        setStats(s.data);
        setEntries(e.data.items || []);
        setFlagged((f.data || []).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const activity = [
    ...entries.map(e => ({ type: 'unique', name: e.name, time: e.created_at })),
    ...flagged.map(f => ({ type: f.status, name: f.entry_data?.name, time: f.created_at })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <div className="page-content">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -40, right: 0, width: 400, height: 150, background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', animation: 'pulse-out 2s infinite' }}></span>
          Live Environment Active
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10, color: '#f8fafc', fontFamily: 'Space Grotesk' }}>
          Real-Time Data <span style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligence</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
          Autonomous deduplication engine scanning cloud pipelines. Ensuring zero redundancy across global clusters.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 20 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Records"       value={stats?.total_entries}      icon={Database}  accentColor="#06b6d4" delay={0}    description="Validated unique records" />
            <StatCard label="Duplicates Blocked"  value={stats?.duplicates_blocked} icon={ShieldOff} accentColor="#ef4444" delay={0.08} description="Prevented from insertion" />
            <StatCard label="Review Queue"        value={stats?.flagged_count}      icon={Flag}      accentColor="#f59e0b" delay={0.16} description="Awaiting manual review" />
            <StatCard label="Data Accuracy"       value={stats?.accuracy_percent}   icon={Target}    accentColor="#7c3aed" delay={0.24} suffix="%" description="Overall integrity score" />
          </>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

        {/* Purity Score */}
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Space Grotesk', alignSelf: 'flex-start' }}>
            Data Purity Score
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Skeleton w={180} h={180} r="50%" />
            </div>
          ) : (
            <PurityRing score={stats?.accuracy_percent || 0} />
          )}
        </GlassCard>

        {/* Cryptographic Hash Stream */}
        <GlassCard className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
              SHA-256 Pipeline
            </div>
            <div style={{ fontSize: 9, color: 'rgba(16,185,129,0.8)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>[SECURE]</div>
          </div>
          <CryptographicHashStream />
          <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            Monitoring cryptographic signatures for exact match duplication. Real-time packet interception.
          </div>
        </GlassCard>

        {/* Live Neural Matrix */}
        <GlassCard className="p-6">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Space Grotesk', display: 'flex', justifyContent: 'space-between' }}>
            <span>Network Topology</span>
            <span style={{ color: '#06b6d4' }}>[SCANNING]</span>
          </div>
          <ActiveNeuralMatrix />
          <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            Real-time visualization of incoming datastreams. Intercepting duplicate packets before database commit.
          </div>
        </GlassCard>

        {/* Activity */}
        <GlassCard className="p-6" style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
            Recent Activity
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} w="100%" h={44} r={10} />)}
            </div>
          ) : activity.length === 0 ? (
            <EmptyState icon={Clock} title="No activity yet" description="Submit your first entry to begin" />
          ) : (
            <div style={{ overflow: 'auto', maxHeight: 280 }}>
              {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
