import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { getFlagged, approveFlagged, rejectFlagged } from '../api';
import { useToast } from '../useToast';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

function DiffRow({ label, a, b }) {
  const diff = (a || '').toLowerCase().trim() !== (b || '').toLowerCase().trim();
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ 
        fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-word',
        background: diff ? 'var(--color-success-bg)' : 'transparent',
        padding: diff ? '4px 8px' : '4px 0', borderRadius: 6
      }}>{a || '—'}</div>
      <div style={{ 
        fontSize: 13, color: 'var(--text-tertiary)', wordBreak: 'break-word',
        background: diff ? 'var(--color-danger-bg)' : 'transparent',
        padding: diff ? '4px 8px' : '4px 0', borderRadius: 6
      }}>{b || '—'}</div>
    </div>
  );
}

function ReviewCard({ item, onDone }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const { entry_data: nd, matched_entry: me, similarity_score: score } = item;

  const act = async (fn, msg, type) => {
    setBusy(true);
    try {
      await fn(item.id);
      addToast(msg, type);
      onDone(item.id);
    } catch {
      addToast('Action failed. Retry.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ 
        padding: '16px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Review Required</span>
        </div>
        <div style={{ 
          fontSize: 12, fontWeight: 600, color: 'var(--color-warning)', background: 'var(--color-warning-bg)',
          padding: '4px 8px', borderRadius: 12
        }}>
          {score.toFixed(1)}% Match
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 16, marginBottom: 8, paddingBottom: 8, borderBottom: '2px solid var(--border-color)' }}>
          <div></div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>Submitted Entry</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-danger)' }}>Existing Match</div>
        </div>

        <DiffRow label="Name" a={nd?.name} b={me?.name} />
        <DiffRow label="Email" a={nd?.email} b={me?.email} />
        <DiffRow label="Phone" a={nd?.phone} b={me?.phone} />
        <DiffRow label="Content" a={nd?.content} b={me?.content} />
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 12 }}>
        <button 
          className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} 
          disabled={busy} onClick={() => act(approveFlagged, 'Approved & Inserted!', 'success')}
        >
          <CheckCircle2 size={16} /> Approve
        </button>
        <button 
          className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} 
          disabled={busy} onClick={() => act(rejectFlagged, 'Entry Rejected', 'info')}
        >
          <XCircle size={16} /> Reject
        </button>
      </div>
    </motion.div>
  );
}

export default function FlaggedReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getFlagged()
      .then(r => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${items.length} records requiring human verification`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
          {[1, 2].map(i => (
            <div key={i} className="glass" style={{ padding: 24 }}>
              <Skeleton w="40%" h={24} mb={20} />
              <Skeleton w="100%" h={40} mb={10} />
              <Skeleton w="100%" h={40} mb={10} />
              <Skeleton w="100%" h={40} mb={20} />
              <Skeleton w="100%" h={40} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: '60px 20px' }}>
          <EmptyState 
            icon={CheckCircle2} 
            title="Queue is Empty" 
            description="No records require manual verification at this time." 
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
          <AnimatePresence>
            {items.map(item => (
              <ReviewCard key={item.id} item={item} onDone={id => setItems(p => p.filter(x => x.id !== id))} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
