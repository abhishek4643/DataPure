import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MessageSquare,
  CheckCircle2, XCircle, AlertTriangle, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import { submitEntry, approveFlagged, rejectFlagged } from '../api';
import { useToast } from '../useToast';
import GlassCard from '../components/ui/GlassCard';
import SimilarityRing from '../components/ui/SimilarityRing';

/* ── Scan Steps ────────────────────────────── */
const STEPS = [
  'Normalizing input data',
  'Computing SHA-256 fingerprint',
  'Checking exact hash matches',
  'Running RapidFuzz analysis',
  'Comparing cloud records',
  'Generating classification',
];

function ScanAnimation({ currentStep, completedSteps }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ padding: '32px 0' }}
    >
      {/* Scanner viz */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <div style={{ position:'absolute', inset:-16, background:'linear-gradient(45deg, rgba(6,182,212,0.05), transparent)', borderRadius:'50%', border:'1px dashed rgba(6,182,212,0.3)', animation:'spin-slow 10s linear infinite' }} />
          {[1, 0.7, 0.4].map((scale, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1px solid rgba(6,182,212,0.35)',
                boxShadow: i === 0 ? '0 0 20px rgba(6,182,212,0.1) inset' : 'none'
              }}
              animate={{ scale: [scale, scale * 1.15, scale], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
            />
          ))}
          {/* Rotating sweep */}
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(6,182,212,0.4) 25%, transparent 30%)',
              borderTop: '2px solid #06b6d4',
              boxShadow: '0 -4px 12px rgba(6,182,212,0.4)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center dot */}
          <div style={{
            position: 'absolute', inset: '40%', borderRadius: '50%',
            background: 'rgba(6,182,212,0.1)', border: '1px solid #06b6d4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px #06b6d4',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} className="animate-ping" />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize: 13, fontWeight: 700, color: '#06b6d4', fontFamily: 'Space Grotesk', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#06b6d4', animation:'pulse-out 1s infinite' }} />
          Validation Node Active
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontFamily:'monospace', letterSpacing:'0.05em' }}>
          EXECUTING TWO-LAYER REDUNDANCY SCAN
        </div>
      </div>

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background:'rgba(0,0,0,0.15)', padding:16, borderRadius:12, border:'1px solid rgba(255,255,255,0.03)' }}>
        {STEPS.map((step, i) => {
          const done = completedSteps.includes(i);
          const active = currentStep === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.25, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 12px', borderRadius: 8,
                background: active ? 'rgba(6,182,212,0.08)' : 'transparent',
                border: active ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 700, color: done ? '#10b981' : active ? '#06b6d4' : '#334155',
                fontFamily: 'Space Grotesk', width: 20, flexShrink: 0, textShadow: active ? '0 0 8px rgba(6,182,212,0.5)' : 'none'
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: done ? '#94a3b8' : active ? '#f1f5f9' : '#475569', fontWeight: active ? 500 : 400 }}>
                {step}
              </span>
              {done && <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
              {active && (
                <motion.div
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', flexShrink: 0, boxShadow:'0 0 8px #06b6d4' }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Diff Row ──────────────────────────────── */
function DiffRow({ label, newVal, matchVal }) {
  const changed = (newVal || '').toLowerCase().trim() !== (matchVal || '').toLowerCase().trim();
  const isContent = label === 'Content';
  return (
    <div>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'Space Grotesk' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: isContent ? '1fr' : '1fr 1fr', gap: 12 }}>
        {/* Submitted */}
        <div style={{ 
          background: changed ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', 
          border: changed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
          borderRadius: 8, padding: '10px 14px', position: 'relative', overflow: 'hidden'
        }}>
          {changed && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#10b981' }} />}
          <div style={{ fontSize: 9, color: changed ? '#10b981' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 700 }}>Submitted</div>
          <div style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{newVal || '—'}</div>
        </div>
        
        {/* Matched */}
        <div style={{ 
          background: changed ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)', 
          border: changed ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)',
          borderRadius: 8, padding: '10px 14px', position: 'relative', overflow: 'hidden'
        }}>
          {changed && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#ef4444' }} />}
          <div style={{ fontSize: 9, color: changed ? '#ef4444' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 700 }}>Matched Database</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{matchVal || '—'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Verdict: UNIQUE ───────────────────────── */
function UniqueVerdict({ result, onReset }) {
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
      className="glass verdict-unique p-0 overflow-hidden" style={{ borderRadius: 14 }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)', padding: '24px', borderBottom: '1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.15, type:'spring', stiffness:400 }}>
            <div style={{ width:48, height:48, flexShrink:0, borderRadius:12, background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            </div>
          </motion.div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#10b981', fontFamily:'Space Grotesk', letterSpacing:'-0.02em' }}>Unique Record</div>
            <div style={{ fontSize:13, color:'#34d399', marginTop:2 }}>Successfully inserted into cloud database</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:32, fontWeight:700, color:'#10b981', fontFamily:'Space Grotesk', lineHeight:1, textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>{result.similarity_score.toFixed(1)}%</div>
          <div style={{ fontSize:11, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.06em', marginTop: 4 }}>Max Similarity</div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { label:'Status', value:'Passed', color:'#10b981', icon: <CheckCircle2 size={14} style={{ marginRight:6, opacity: 0.7 }} /> },
            { label:'Storage', value:'Supabase', color:'#06b6d4' },
            { label:'Encryption', value:'SHA-256', color:'#8b5cf6' },
          ].map((d, i) => (
            <motion.div key={d.label} initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} style={{ flex:1, minWidth:110, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:'14px' }}>
              <div style={{ fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Space Grotesk', fontWeight: 700 }}>{d.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:d.color, fontFamily:'Space Grotesk', marginTop:6, display: 'flex', alignItems: 'center' }}>
                {d.icon}
                {d.value}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn btn-ghost" onClick={onReset} style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
             <RefreshCw size={14} style={{ marginRight: 6 }}/> Process Another Record
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Verdict: REDUNDANT ────────────────────── */
function RedundantVerdict({ result, form, onReset }) {
  const m = result.matched_record;
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
      className="glass verdict-redundant p-0 overflow-hidden" style={{ borderRadius: 14 }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)', padding: '24px', borderBottom: '1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:48, height:48, flexShrink:0, borderRadius:12, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}>
            <XCircle size={24} style={{ color:'#ef4444' }} />
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#ef4444', fontFamily:'Space Grotesk', letterSpacing:'-0.02em' }}>Duplicate Detected</div>
            <div style={{ fontSize:13, color:'#f87171', marginTop:2 }}>Blocked to protect database integrity</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:32, fontWeight:700, color:'#ef4444', fontFamily:'Space Grotesk', lineHeight:1, textShadow: '0 0 20px rgba(239,68,68,0.4)' }}>{result.similarity_score.toFixed(1)}%</div>
          <div style={{ fontSize:11, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.06em', marginTop: 4 }}>Similarity</div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {m && (
          <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
            <DiffRow label="Name"    newVal={form.name}    matchVal={m.name} />
            <DiffRow label="Email"   newVal={form.email}   matchVal={m.email} />
            <DiffRow label="Phone"   newVal={form.phone}   matchVal={m.phone} />
            <DiffRow label="Content" newVal={form.content} matchVal={m.content} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn btn-ghost" onClick={onReset} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
             <RefreshCw size={14} style={{ marginRight: 6 }}/> Reset & Try Another
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Verdict: FLAGGED ──────────────────────── */
function FlaggedVerdict({ result, form, onApprove, onReject, busy, onReset }) {
  const m = result.matched_record;
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
      className="glass verdict-flagged p-0 overflow-hidden" style={{ borderRadius: 14 }}>
      
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)', padding: '24px', borderBottom: '1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:48, height:48, flexShrink:0, borderRadius:12, background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={24} style={{ color:'#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#f59e0b', fontFamily:'Space Grotesk', letterSpacing:'-0.02em' }}>Human Review Required</div>
            <div style={{ fontSize:13, color:'#fbbf24', marginTop:2 }}>Moderate similarity. Action needed.</div>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', alignItems: 'center' }}>
           <SimilarityRing score={result.similarity_score} size={60} />
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {m && (
          <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
            <DiffRow label="Name"    newVal={form.name}    matchVal={m.name} />
            <DiffRow label="Email"   newVal={form.email}   matchVal={m.email} />
            <DiffRow label="Phone"   newVal={form.phone}   matchVal={m.phone} />
            <DiffRow label="Content" newVal={form.content} matchVal={m.content} />
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn btn-success btn-lg" style={{ flex:1 }} onClick={onApprove} disabled={busy}>
            <CheckCircle2 size={16}/> Approve as Unique
          </button>
          <button className="btn btn-danger btn-lg" style={{ flex:1 }} onClick={onReject} disabled={busy}>
            <XCircle size={16}/> Reject as Duplicate
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────── */
export default function AddEntry() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name:'', email:'', phone:'', content:'' });
  const [errors, setErrors] = useState({});
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.content.trim()) e.content = 'Required';
    return e;
  };

  const autoFill = () => {
    setForm({
      name: 'Eleanor Vance',
      email: 'eleanor.vance@hillhouse.org',
      phone: '+1 (555) 019-2837',
      content: 'Requesting access to the newly migrated cloud storage nodes. Please verify clearance.'
    });
    setErrors({});
  };

  const autoFillFlagged = () => {
    setForm({
      name: 'Eleanor Vance-Smith',
      email: 'eleanor.vance@hillhouse.org',
      phone: '+1 (555) 999-0000',
      content: 'Requesting access to the newly migrated cloud storage nodes. Please verify clearance.'
    });
    setErrors({});
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setScanning(true);
    setResult(null);
    setCurrentStep(0);
    setCompletedSteps([]);

    let step = 0;
    const ticker = setInterval(() => {
      setCompletedSteps(p => [...p, step]);
      step++;
      setCurrentStep(step);
      if (step >= STEPS.length) clearInterval(ticker);
    }, 380);

    try {
      const [res] = await Promise.all([
        submitEntry(form),
        new Promise(r => setTimeout(r, STEPS.length * 380 + 300)),
      ]);
      setResult(res.data);
      const cls = res.data.classification;
      if (cls === 'UNIQUE')    addToast('Record validated and added to database', 'success');
      if (cls === 'REDUNDANT') addToast('Duplicate detected — entry blocked', 'error');
      if (cls === 'FLAGGED')   addToast('Entry flagged for manual review', 'warning');
    } catch (err) {
      const msg = err?.response?.data?.detail;
      addToast(typeof msg === 'string' ? msg : 'Submission failed. Check your input.', 'error');
    } finally {
      setScanning(false);
      setCurrentStep(-1);
    }
  };

  const handleApprove = async () => {
    if (!result?.flagged_id) return;
    setBusy(true);
    try {
      await approveFlagged(result.flagged_id);
      addToast('Record approved and added to database', 'success');
      reset();
    } catch { addToast('Failed to approve', 'error'); }
    finally { setBusy(false); }
  };

  const handleReject = async () => {
    if (!result?.flagged_id) return;
    setBusy(true);
    try {
      await rejectFlagged(result.flagged_id);
      addToast('Entry rejected', 'info');
      reset();
    } catch { addToast('Failed to reject', 'error'); }
    finally { setBusy(false); }
  };

  const reset = () => { setResult(null); setForm({ name:'', email:'', phone:'', content:'' }); };

  const field = (key, label, Icon, type='text') => (
    <div className="field" style={{ marginBottom: 14 }}>
      {type === 'textarea' ? (
        <>
          <textarea id={key} className={`field-input-area ${errors[key] ? 'field-error' : ''}`}
            placeholder={label} value={form[key]} rows={3}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            disabled={scanning} />
          <label htmlFor={key} className="field-label">{label}</label>
        </>
      ) : (
        <>
          <input id={key} type={type}
            className={`field-input ${errors[key] ? 'field-error' : ''}`}
            placeholder={label} value={form[key]}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            disabled={scanning} />
          <label htmlFor={key} className="field-label">{label}</label>
          <div className="field-icon"><Icon size={15} /></div>
        </>
      )}
      {errors[key] && <div className="field-error-msg">{errors[key]}</div>}
    </div>
  );

  return (
    <div className="page-content">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#06b6d4', textTransform:'uppercase', marginBottom:6, fontFamily:'Space Grotesk' }}>
          Validation Engine
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, fontFamily:'Space Grotesk', letterSpacing:'-0.02em', color:'#f1f5f9', marginBottom:6 }}>
          Validate New Data
        </h1>
        <p style={{ color:'#64748b', fontSize:13.5 }}>
          DataPure scans every submission with SHA-256 hashing and RapidFuzz analysis before it reaches your cloud database.
        </p>
      </motion.div>

      <div style={{ maxWidth:560, margin:'0 auto' }}>
        <GlassCard className="p-7">
          <AnimatePresence mode="wait">
            {scanning ? (
              <ScanAnimation key="scan" currentStep={currentStep} completedSteps={completedSteps} />
            ) : result?.classification === 'UNIQUE' ? (
              <UniqueVerdict key="unique" result={result} onReset={reset} />
            ) : result?.classification === 'REDUNDANT' ? (
              <RedundantVerdict key="redundant" result={result} form={form} onReset={reset} />
            ) : result?.classification === 'FLAGGED' ? (
              <FlaggedVerdict key="flagged" result={result} form={form} onApprove={handleApprove} onReject={handleReject} busy={busy} onReset={reset} />
            ) : (
              <motion.form key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onSubmit={handleSubmit}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', fontFamily:'Space Grotesk' }}>
                    Entry Details
                  </div>
                </div>
                {field('name',    'Full Name',         User)}
                {field('email',   'Email Address',     Mail,   'email')}
                {field('phone',   'Phone Number',      Phone,  'tel')}
                {field('content', 'Content / Message', MessageSquare, 'textarea')}
                <motion.button
                  type="submit" className="btn btn-primary btn-lg"
                  style={{ width:'100%', marginTop:6, justifyContent:'center' }}
                  whileTap={{ scale:0.97 }}
                >
                  Validate & Submit
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
