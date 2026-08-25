import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database, ShieldOff, Flag, Target,
  CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight
} from 'lucide-react';
import { getStats, getEntries, getFlagged } from '../api';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

function ActivityItem({ type, name, time }) {
  const cfg = {
    unique:    { Icon: CheckCircle2,  color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    redundant: { Icon: XCircle,       color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' },
    pending:   { Icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    approved:  { Icon: CheckCircle2,  color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    rejected:  { Icon: XCircle,       color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' },
  }[type] || { Icon: Database, color: 'var(--text-secondary)', bg: 'var(--bg-surface-hover)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <cfg.Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name || 'Unknown record'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'capitalize' }}>
          {type}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={12} />
        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [entries, setEntries] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    ...entries.map(e => ({ type: 'unique',  name: e.name, time: e.created_at })),
    ...flagged.map(f => ({ type: f.status,  name: f.entry_data?.name, time: f.created_at })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time metrics and recent validation activity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Records"      value={stats?.total_entries}      icon={Database}  color="#3b82f6" delay={0}    description="Validated unique records" />
            <StatCard label="Duplicates Blocked" value={stats?.duplicates_blocked} icon={ShieldOff} color="#ef4444" delay={0.05} description="Prevented insertions" />
            <StatCard label="Review Queue"       value={stats?.flagged_count}      icon={Flag}      color="#f59e0b" delay={0.1}  description="Awaiting manual review" />
            <StatCard label="Data Accuracy"      value={`${stats?.accuracy_percent}%`} icon={Target} color="#10b981" delay={0.15} description="Overall integrity score" />
          </>
        )}
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16 }}>Recent Activity</h3>
          <button onClick={() => navigate('/records')} className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }}>
            View all <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </button>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} w="100%" h={50} />)}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState icon={Clock} title="No activity yet" description="Submit your first entry to begin" />
        ) : (
          <div>
            {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
