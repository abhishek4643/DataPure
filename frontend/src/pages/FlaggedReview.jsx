import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { getFlagged, approveFlagged, rejectFlagged } from '../api';
import { useToast } from '../useToast';
import GlassCard from '../components/ui/GlassCard';
import SimilarityRing from '../components/ui/SimilarityRing';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

function CRow({ label, a, b }) {
  const diff = (a||'').toLowerCase().trim() !== (b||'').toLowerCase().trim();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr', gap:8, padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Space Grotesk', paddingTop:3 }}>{label}</span>
      <div className={diff ? 'diff-new' : ''} style={{ fontSize:12, color:'#e2e8f0', wordBreak:'break-all', padding:'3px 5px', borderRadius:4 }}>{a||'—'}</div>
      <div className={diff ? 'diff-changed' : ''} style={{ fontSize:12, color:'#94a3b8', wordBreak:'break-all', padding:'3px 5px', borderRadius:4 }}>{b||'—'}</div>
    </div>
  );
}

function ReviewCard({ item, index, onDone }) {
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);
  const { entry_data: nd, matched_entry: me, similarity_score: score } = item;

  const act = async (fn, msg, type) => {
    setBusy(true);
    try { await fn(item.id); addToast(msg, type); onDone(item.id); }
    catch { addToast('Action failed.', 'error'); }
    finally { setBusy(false); }
  };

  return (
    <motion.div layout initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:-60, scale:0.94 }} transition={{ duration:0.28 }}>
      <GlassCard className="verdict-flagged" style={{ position:'relative', overflow:'hidden' }}>
        {/* Holographic background grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)', backgroundSize:'20px 20px', zIndex:-1 }} />
        
        <div style={{ padding: 24 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700, color:'#f59e0b', letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'Space Grotesk', marginBottom:8 }}>
                <span className="animate-pulse" style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b' }} />
                Review #{String(index+1).padStart(3,'0')}
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:'#f1f5f9', fontFamily:'Space Grotesk', letterSpacing:'-0.01em' }}>{nd?.name}</div>
              <div style={{ fontSize:13, color:'#94a3b8', marginTop:2, fontFamily:'monospace' }}>{nd?.email}</div>
            </div>
            <div style={{ background:'rgba(0,0,0,0.3)', padding:6, borderRadius:'50%', border:'1px solid rgba(245,158,11,0.2)' }}>
              <SimilarityRing score={score} size={84} strokeWidth={6} label="sim" />
            </div>
          </div>
          
          <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:12, padding:'16px 20px', border:'1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr', gap:10, marginBottom:8 }}>
              <span/>
              <span style={{ fontSize:10, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:'0.1em' }}>Submitted Data</span>
              <span style={{ fontSize:10, fontWeight:700, color:'#f59e0b', textTransform:'uppercase', letterSpacing:'0.1em' }}>Existing Match</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <CRow label="Name"    a={nd?.name}    b={me?.name} />
              <CRow label="Email"   a={nd?.email}   b={me?.email} />
              <CRow label="Phone"   a={nd?.phone}   b={me?.phone} />
              <CRow label="Content" a={nd?.content} b={me?.content} />
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            <motion.button className="btn btn-success" style={{ flex:1, justifyContent:'center', height:44, fontSize:13, letterSpacing:'0.02em' }}
              whileTap={{ scale:0.96 }} disabled={busy}
              onClick={() => act(approveFlagged, 'Record approved and added!', 'success')}>
              <CheckCircle2 size={16}/> Approve & Insert
            </motion.button>
            <motion.button className="btn btn-danger" style={{ flex:1, justifyContent:'center', height:44, fontSize:13, letterSpacing:'0.02em' }}
              whileTap={{ scale:0.96 }} disabled={busy}
              onClick={() => act(rejectFlagged, 'Entry rejected.', 'info')}>
              <XCircle size={16}/> Reject Data
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function FlaggedReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getFlagged().then(r => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-content">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#f59e0b', textTransform:'uppercase', marginBottom:6, fontFamily:'Space Grotesk' }}>
            Human Verification Queue
          </div>
          <h1 style={{ fontSize:24, fontWeight:700, fontFamily:'Space Grotesk', letterSpacing:'-0.02em', color:'#f1f5f9', marginBottom:4 }}>
            Review Queue
          </h1>
          <p style={{ color:'#64748b', fontSize:13 }}>
            {loading ? 'Loading…' : `${items.length} entr${items.length===1?'y':'ies'} awaiting review`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={13}/> Refresh</button>
      </motion.div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))', gap:14 }}>
          {[1,2].map(i => (
            <GlassCard key={i} className="p-5">
              <Skeleton w="60%" h={18} mb={8} /><Skeleton w="40%" h={13} mb={20} />
              {[1,2,3,4].map(j => <Skeleton key={j} w="100%" h={32} mb={6} />)}
            </GlassCard>
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassCard style={{ borderRadius:14 }}>
          <EmptyState icon={Flag} title="All clear." description="No records require manual verification. Great data quality!" />
        </GlassCard>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))', gap:14 }}>
          <AnimatePresence>
            {items.map((item, i) => (
              <ReviewCard key={item.id} item={item} index={i} onDone={id => setItems(p => p.filter(x => x.id !== id))} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
