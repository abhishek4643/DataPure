import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, CheckCircle2, Trash2, AlertTriangle, Zap, BrainCircuit, Activity } from 'lucide-react';
import { scanDuplicates } from '../api';
import { useToast } from '../useToast';
import GlassCard from '../components/ui/GlassCard';

const STEPS = [
  'Initializing scanner',
  'Loading cloud records',
  'Normalizing data fields',
  'Computing SHA-256 fingerprints',
  'Running fuzzy comparisons',
  'Building duplicate groups',
  'Finalizing integrity report',
];

function ScannerAnim({ currentStep, completedSteps }) {
  return (
    <div style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
        <div style={{ position:'relative', width:180, height:180 }}>
          {/* Radar Background Grid */}
          <div style={{ position:'absolute', inset:-30, background:'radial-gradient(rgba(6,182,212,0.15) 1px, transparent 1px)', backgroundSize:'16px 16px', borderRadius:'50%', opacity:0.8, maskImage:'radial-gradient(circle, black 40%, transparent 70%)', WebkitMaskImage:'radial-gradient(circle, black 40%, transparent 70%)' }} />
          
          {[1, 0.75, 0.5, 0.25].map((s, i) => (
            <div key={i} style={{ position:'absolute', inset: `${(1-s)*50}%`, borderRadius:'50%', border:'1px solid rgba(6,182,212,0.2)' }} />
          ))}

          {/* Rotating Laser Sweeper */}
          <motion.div
            style={{
              position:'absolute', inset:0, borderRadius:'50%',
              background:'conic-gradient(from 0deg, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.05) 40%, transparent 60%)',
              borderTop: '2px solid #06b6d4',
              boxShadow: '0 0 20px rgba(6,182,212,0.3)',
            }}
            animate={{ rotate:360 }}
            transition={{ duration:2, repeat:Infinity, ease:'linear' }}
          />
          {/* Pulsing center node */}
          <div style={{ position:'absolute', inset:'40%', borderRadius:'50%', background:'rgba(6,182,212,0.1)', border:'1px solid #06b6d4', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px #06b6d4, inset 0 0 15px rgba(6,182,212,0.5)' }}>
            <ScanLine size={24} style={{ color:'#06b6d4' }} className="animate-pulse" />
          </div>
          {/* Faux target locks */}
          <motion.div style={{ position:'absolute', top:30, right:40, width:8, height:8, background:'#ef4444', borderRadius:'50%', boxShadow:'0 0 15px #ef4444' }} animate={{ scale: [1, 1.5, 1], opacity:[0,1,0] }} transition={{ duration:1.5, repeat:Infinity, delay:0.2 }} />
          <motion.div style={{ position:'absolute', bottom:50, left:30, width:8, height:8, background:'#10b981', borderRadius:'50%', boxShadow:'0 0 15px #10b981' }} animate={{ scale: [1, 1.5, 1], opacity:[0,1,0] }} transition={{ duration:2.2, repeat:Infinity, delay:0.9 }} />
          <motion.div style={{ position:'absolute', top:80, left:20, width:6, height:6, background:'#f59e0b', borderRadius:'50%', boxShadow:'0 0 10px #f59e0b' }} animate={{ opacity:[0,1,0] }} transition={{ duration:1.8, repeat:Infinity, delay:1.5 }} />
        </div>
      </div>

      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14, fontWeight:700, color:'#06b6d4', fontFamily:'Space Grotesk', letterSpacing:'0.15em', textTransform:'uppercase' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#06b6d4', animation:'pulse-out 1s infinite' }} />
          Deep Scan Active
        </div>
        <div style={{ fontSize:11, color:'#64748b', marginTop:6, fontFamily:'monospace' }}>TARGET: CLOUD_DB // ALGORITHM: RAPID_FUZZ_V2</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, background:'rgba(0,0,0,0.3)', padding:20, borderRadius:16, border:'1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
        {STEPS.map((step, i) => {
          const done = completedSteps.includes(i);
          const active = currentStep === i;
          return (
            <motion.div key={i}
              initial={{ opacity:0, x:-20 }} animate={{ opacity: i <= currentStep ? 1 : 0.15, x:0 }}
              transition={{ delay: i*0.05, type: 'spring' }}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10,
                background: active ? 'linear-gradient(90deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)' : 'transparent',
                border: active ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {active && <motion.div layoutId="active-bg" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />}
              <span style={{ fontSize:11, fontWeight:800, color: done ? '#10b981' : active ? '#06b6d4' : '#475569', fontFamily:'Space Grotesk', width:22, flexShrink:0, textAlign: 'center' }}>
                {String(i+1).padStart(2,'0')}
              </span>
              <span style={{ flex:1, fontSize:13, fontWeight: active ? 600 : 400, color: done ? '#64748b' : active ? '#e2e8f0' : '#475569', letterSpacing: '0.02em' }}>{step}</span>
              {done && <CheckCircle2 size={16} style={{ color:'#10b981', flexShrink:0 }} />}
              {active && (
                <Activity size={16} color="#06b6d4" className="animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ScanResults({ result, onReset }) {
  const clean = result.removed === 0;
  const color = clean ? '#10b981' : '#ef4444';
  const Icon  = clean ? CheckCircle2 : Trash2;

  return (
    <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
      transition={{ type:'spring', stiffness:280, damping:22 }}
      className={clean ? 'glass verdict-unique p-8' : 'glass verdict-redundant p-8'}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:`${color}15`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 20px ${color}20` }}>
          <Icon size={28} style={{ color }} />
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:700, color, fontFamily:'Space Grotesk', letterSpacing:'-0.01em' }}>
            {clean ? 'Database is Clean!' : 'Duplicates Purged!'}
          </div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{result.message}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:28 }}>
        {[
          { label:'Analyzed',  value:result.scanned,           color:'#06b6d4' },
          { label:'Detected',  value:result.duplicates_found,  color:'#f59e0b' },
          { label:'Removed',   value:result.removed,           color:'#ef4444' },
        ].map(({ label, value, color:c }) => (
          <div key={label} style={{ textAlign:'center', padding:'18px 8px', borderRadius:12, background:'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)', border:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize:32, fontWeight:700, fontFamily:'Space Grotesk', color:c, lineHeight:1, textShadow:`0 0 16px ${c}40` }}>{value}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:8, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}>{label}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', height:48, fontSize:13 }} onClick={onReset}>
        <AlertTriangle size={15}/> Run Another Analysis
      </button>
    </motion.div>
  );
}

export default function ScanDuplicates() {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setScanning(true); setResult(null);
    setCurrentStep(0); setCompletedSteps([]);

    let step = 0;
    const ticker = setInterval(() => {
      setCompletedSteps(p => [...p, step]);
      step++;
      setCurrentStep(step);
      if (step >= STEPS.length) clearInterval(ticker);
    }, 420);

    try {
      const [res] = await Promise.all([
        scanDuplicates(),
        new Promise(r => setTimeout(r, STEPS.length * 420 + 300)),
      ]);
      setResult(res.data);
      if (res.data.removed > 0) addToast(`Removed ${res.data.removed} duplicate(s)!`, 'success');
      else addToast('No duplicates found. Clean database!', 'success');
    } catch { addToast('Scan failed. Is the backend running?', 'error'); }
    finally { setScanning(false); setCurrentStep(-1); }
  };

  return (
    <div className="page-content">
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', color:'#06b6d4', textTransform:'uppercase', marginBottom:6, fontFamily:'Space Grotesk' }}>
          Integrity Analysis
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, fontFamily:'Space Grotesk', letterSpacing:'-0.02em', color:'#f1f5f9', marginBottom:4 }}>
          Duplicate Scanner
        </h1>
        <p style={{ color:'#64748b', fontSize:13 }}>
          Analyze existing cloud records for previously stored redundancy.
        </p>
      </motion.div>

      <div style={{ maxWidth:520, margin:'0 auto' }}>
        <GlassCard className="p-7">
          <AnimatePresence mode="wait">
            {scanning ? (
              <ScannerAnim key="scan" currentStep={currentStep} completedSteps={completedSteps} />
            ) : result ? (
              <ScanResults key="result" result={result} onReset={() => setResult(null)} />
            ) : (
              <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:22, padding:'24px 0' }}>
                {/* Scanner graphic */}
                <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed rgba(6,182,212,0.4)' }} />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 15, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.1)', borderTopColor: 'rgba(6,182,212,0.6)' }} />
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(6,182,212,0.2)' }}>
                    <ScanLine size={32} style={{ color: '#06b6d4' }} />
                  </div>
                </div>

                <div style={{ textAlign:'center' }}>
                  <h2 style={{ fontFamily:'Space Grotesk', fontSize:18, fontWeight:700, color:'#f1f5f9', marginBottom:8 }}>
                    Ready for Analysis
                  </h2>
                  <p style={{ color:'#64748b', fontSize:13, lineHeight:1.6, maxWidth:340 }}>
                    Scans all existing records using SHA-256 exact matching and RapidFuzz similarity.
                    Records with ≥95% similarity will be detected and removed.
                  </p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'100%' }}>
                  {[
                    { icon:<Zap size={18} color="#06b6d4" />, title:'Layer 1 — SHA-256', desc:'Exact hash matching', glow: '#06b6d4' },
                    { icon:<BrainCircuit size={18} color="#f43f5e" />, title:'Layer 2 — RapidFuzz', desc:'Fuzzy similarity scoring', glow: '#f43f5e' },
                  ].map(({ icon, title, desc, glow }) => (
                    <motion.div key={title} whileHover={{ y: -2, borderColor: glow }}
                      style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'16px', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'border-color 0.3s' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 2, bottom: 0, background: glow }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                         <div style={{ width: 28, height: 28, borderRadius: 8, background: `color-mix(in srgb, ${glow} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                         <div style={{ fontSize:12, fontWeight:700, fontFamily:'Space Grotesk', color:'#f8fafc' }}>{title}</div>
                      </div>
                      <div style={{ fontSize:11.5, color:'#64748b', lineHeight: 1.5 }}>{desc}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}
                  whileTap={{ scale:0.97 }} onClick={handleScan}>
                  <ScanLine size={16}/> Run Integrity Scan
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
