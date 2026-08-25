import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Shield, Zap, RefreshCw } from 'lucide-react';
import { submitEntry, approveFlagged, rejectFlagged } from '../api';
import { useToast } from '../useToast';

function DiffRow({ label, newVal, matchVal }) {
  const diff = (newVal || '').toLowerCase().trim() !== (matchVal || '').toLowerCase().trim();
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: diff ? 'var(--color-success-bg)' : 'var(--bg-app)', border: diff ? '1px solid var(--color-success-border)' : '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: diff ? 'var(--color-success)' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Submitted</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{newVal || '—'}</div>
        </div>
        <div style={{ background: diff ? 'var(--color-danger-bg)' : 'var(--bg-app)', border: diff ? '1px solid var(--color-danger-border)' : '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ fontSize: 11, color: diff ? 'var(--color-danger)' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Matched Database</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{matchVal || '—'}</div>
        </div>
      </div>
    </div>
  );
}

export default function AddEntry() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', content: '' });
  const [errors, setErrors] = useState({});
  const [scanning, setScanning] = useState(false);
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

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setScanning(true); setResult(null);
    
    try {
      const res = await submitEntry(form);
      // UX delay
      await new Promise(r => setTimeout(r, 1200));
      setResult(res.data);
      const cls = res.data.classification;
      if (cls === 'UNIQUE')    addToast('Record validated and added', 'success');
      if (cls === 'REDUNDANT') addToast('Duplicate detected & blocked', 'error');
      if (cls === 'FLAGGED')   addToast('Flagged for review', 'warning');
    } catch (err) {
      addToast('Submission failed.', 'error');
    } finally { 
      setScanning(false); 
    }
  };

  const reset = () => { setResult(null); setForm({ name: '', email: '', phone: '', content: '' }); };

  const field = (key, label, Icon, type = 'text') => (
    <div className="field" style={{ marginBottom: 16 }}>
      <label htmlFor={key} className="field-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {type === 'textarea' ? (
          <textarea id={key} className={`field-input-area ${errors[key] ? 'field-error' : ''}`}
            placeholder={label} value={form[key]} rows={3}
            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} disabled={scanning} />
        ) : (
          <>
            <input id={key} type={type} className={`field-input ${errors[key] ? 'field-error' : ''}`}
              placeholder={label} value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} disabled={scanning} />
            <div className="field-icon" style={{ top: 12 }}><Icon size={16} /></div>
          </>
        )}
      </div>
      {errors[key] && <div className="field-error-msg">{errors[key]}</div>}
    </div>
  );

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Validate New Data</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Each submission is verified against the database to prevent duplicate records.
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="glass" style={{ padding: 32 }}>
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <div style={{ position: 'relative', width: 64, height: 64 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} color="var(--color-primary)" /></div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>Validating Entry...</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Running SHA-256 and fuzzy logic checks.</p>
              </motion.div>
            ) : result?.classification === 'UNIQUE' ? (
              <motion.div key="unique" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>Unique Record</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Successfully verified and inserted into the database.</p>
                <button className="btn btn-ghost" onClick={reset} style={{ width: '100%', justifyContent: 'center' }}>
                   <RefreshCw size={16} /> Process Another Record
                </button>
              </motion.div>
            ) : result?.classification === 'REDUNDANT' ? (
              <motion.div key="redundant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>Duplicate Detected</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Similarity Score: <strong style={{ color: 'var(--color-danger)' }}>{result.similarity_score.toFixed(1)}%</strong></p>
                  </div>
                </div>
                {result.matched_record && (
                  <div style={{ marginBottom: 24 }}>
                    <DiffRow label="Name" newVal={form.name} matchVal={result.matched_record.name} />
                    <DiffRow label="Email" newVal={form.email} matchVal={result.matched_record.email} />
                    <DiffRow label="Phone" newVal={form.phone} matchVal={result.matched_record.phone} />
                  </div>
                )}
                <button className="btn btn-ghost" onClick={reset} style={{ width: '100%', justifyContent: 'center' }}>
                   <RefreshCw size={16} /> Edit & Try Again
                </button>
              </motion.div>
            ) : result?.classification === 'FLAGGED' ? (
              <motion.div key="flagged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>Human Review Required</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Similarity Score: <strong style={{ color: 'var(--color-warning)' }}>{result.similarity_score.toFixed(1)}%</strong></p>
                  </div>
                </div>
                {result.matched_record && (
                  <div style={{ marginBottom: 32 }}>
                    <DiffRow label="Name" newVal={form.name} matchVal={result.matched_record.name} />
                    <DiffRow label="Email" newVal={form.email} matchVal={result.matched_record.email} />
                    <DiffRow label="Phone" newVal={form.phone} matchVal={result.matched_record.phone} />
                    <DiffRow label="Content" newVal={form.content} matchVal={result.matched_record.content} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={async () => {
                    setBusy(true);
                    await approveFlagged(result.flagged_id);
                    addToast('Approved', 'success');
                    reset();
                    setBusy(false);
                  }} disabled={busy}><CheckCircle2 size={16} /> Approve as Unique</button>
                  <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={async () => {
                    setBusy(true);
                    await rejectFlagged(result.flagged_id);
                    addToast('Rejected', 'info');
                    reset();
                    setBusy(false);
                  }} disabled={busy}><XCircle size={16} /> Reject Duplicate</button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
                {field('name',    'Full Name',         User)}
                {field('email',   'Email Address',     Mail,          'email')}
                {field('phone',   'Phone Number',      Phone,         'tel')}
                {field('content', 'Content / Message', MessageSquare, 'textarea')}
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
                  Validate & Submit
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
