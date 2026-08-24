import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, Database, X, Hash, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEntries } from '../api';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';

/* ── Record Detail Drawer ──────────────────── */
function RecordDrawer({ record, onClose }) {
  const fields = [
    { label: 'Record ID',   value: `#${record.id}` },
    { label: 'Full Name',   value: record.name     },
    { label: 'Email',       value: record.email    },
    { label: 'Phone',       value: record.phone    },
    { label: 'Content',     value: record.content  },
    { label: 'SHA-256 Hash',value: record.content_hash, mono: true },
    { label: 'Created',     value: new Date(record.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) },
  ];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 440,
        background: 'linear-gradient(145deg, rgba(7, 11, 18, 0.9) 0%, rgba(11, 16, 24, 0.95) 100%)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(6,182,212,0.3)',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
        zIndex: 50, overflowY: 'auto', padding: 32,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(6,182,212,0.05) 1px, transparent 1px)', backgroundSize: '16px 16px', zIndex: -1 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(6,182,212,0.8), transparent)', animation: 'stream-height 3s infinite' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: '#06b6d4', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', animation: 'pulse-out 2s infinite' }}></span>
            Record Details
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Space Grotesk', marginTop: 8, letterSpacing: '-0.02em' }}>
            #{record.id}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status="unique" />
          <button className="btn-icon" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)' }}><X size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '0 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
        {fields.map(({ label, value, mono }, i) => (
          <div key={label} style={{ padding: '16px 0', borderBottom: i === fields.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Space Grotesk', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{
              fontSize: mono ? 11 : 14,
              color: mono ? '#06b6d4' : '#e2e8f0',
              fontFamily: mono ? 'monospace' : 'Inter',
              wordBreak: 'break-all', lineHeight: 1.6,
              background: mono ? 'rgba(6,182,212,0.05)' : 'transparent',
              padding: mono ? '8px 12px' : 0, borderRadius: 6, border: mono ? '1px solid rgba(6,182,212,0.1)' : 'none'
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────── */
export default function Records() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, total_pages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    getEntries({ search: search || undefined, page, page_size: 15 })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const truncate = (s, n=45) => s?.length > n ? s.slice(0, n) + '…' : s;

  return (
    <div className="page-content" style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:20, flexShrink:0 }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#06b6d4', textTransform:'uppercase', marginBottom:6, fontFamily:'Space Grotesk' }}>
          Cloud Storage
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, fontFamily:'Space Grotesk', letterSpacing:'-0.02em', color:'#f1f5f9', marginBottom:4 }}>
              Cloud Records
            </h1>
            <p style={{ color:'#64748b', fontSize:13 }}>
              {data.total.toLocaleString()} validated records in Supabase PostgreSQL
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ position:'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position:'absolute', left:12, color:'#06b6d4', fontSize:14, fontFamily:'monospace', fontWeight:700 }}>
                {'>_'}
              </div>
              <input
                type="text" placeholder="QUERY_DB..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{
                  background:'rgba(0,0,0,0.4)', border:'1px solid rgba(6,182,212,0.2)',
                  borderRadius:6, padding:'8px 12px 8px 36px', color:'#06b6d4',
                  fontSize:12, outline:'none', fontFamily:'monospace', width:260,
                  letterSpacing:'0.05em', transition:'all .2s',
                  boxShadow:'inset 0 0 10px rgba(0,0,0,0.5)'
                }}
                onFocus={e => { e.target.style.borderColor='rgba(6,182,212,0.5)'; e.target.style.boxShadow='0 0 12px rgba(6,182,212,0.2) inset, 0 0 10px rgba(6,182,212,0.1)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(6,182,212,0.2)'; e.target.style.boxShadow='inset 0 0 10px rgba(0,0,0,0.5)'; }}
              />
            </div>
            <button className="btn-icon" onClick={fetchData} title="Refresh Data" style={{ background:'rgba(0,0,0,0.4)', borderColor:'rgba(6,182,212,0.2)', color:'#06b6d4', borderRadius:6 }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table card */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        <GlassCard style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Table */}
          <div style={{ flex:1, overflowX:'auto', overflowY:'auto' }}>
            <table className="dp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Content</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(10).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  : data.items.length === 0
                  ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={Database}
                          title={search ? 'No matching records' : 'No records yet'}
                          description={search ? 'Try a different search term.' : 'Submit your first validated entry to see it here.'}
                        />
                      </td>
                    </tr>
                  )
                  : data.items.map((r, idx) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity:0, x: -10 }}
                      animate={{ opacity:1, x: 0 }}
                      transition={{ delay: idx * 0.03, type:'spring', stiffness: 300, damping: 25 }}
                      onClick={() => setSelected(r)}
                    >
                      <td style={{ color:'#06b6d4', fontSize:11, fontFamily:'monospace', letterSpacing:'0.1em' }}>
                        {String((page-1)*15+idx+1).padStart(2, '0')}
                      </td>
                      <td style={{ fontWeight:700, color:'#f1f5f9', fontFamily:'Space Grotesk', fontSize:14 }}>{r.name}</td>
                      <td style={{ color:'#94a3b8', fontFamily:'monospace', fontSize:12 }}>{r.email}</td>
                      <td style={{ color:'#94a3b8', fontFamily:'monospace', fontSize:12 }}>{r.phone}</td>
                      <td style={{ color:'#64748b', maxWidth:220, fontSize:13 }}>{truncate(r.content)}</td>
                      <td style={{ color:'#475569', fontSize:12, whiteSpace:'nowrap' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Inter' }}>
                          <Calendar size={12} style={{ color:'#06b6d4' }} /> {fmt(r.created_at)}
                        </span>
                      </td>
                      <td><StatusBadge status="unique" /></td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0,
            }}>
              <span style={{ fontSize:12, color:'#475569' }}>
                Page <strong style={{ color:'#94a3b8' }}>{page}</strong> of {data.total_pages}
                {' '}· {data.total.toLocaleString()} records
              </span>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn-icon" disabled={page<=1} onClick={() => setPage(p=>p-1)}>
                  <ChevronLeft size={14} />
                </button>
                <button className="btn-icon" disabled={page>=data.total_pages} onClick={() => setPage(p=>p+1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSelected(null)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:49, backdropFilter:'blur(2px)' }}
            />
            <RecordDrawer record={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
