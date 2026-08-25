import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, CheckCircle2, Trash2, Shield, Zap, Target } from 'lucide-react';
import { scanDuplicates } from '../api';
import { useToast } from '../useToast';

export default function ScanDuplicates() {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const res = await scanDuplicates();
      // Artificial delay for UX
      await new Promise(r => setTimeout(r, 1500));
      setResult(res.data);
      if (res.data.removed > 0) addToast(`Removed ${res.data.removed} duplicate(s)!`, 'success');
      else addToast('Database is clean.', 'success');
    } catch {
      addToast('Scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Duplicate Scanner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Run an on-demand integrity scan across the cloud database.
        </p>
      </div>

      <div className="glass" style={{ maxWidth: 600, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 0, border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    <ScanLine size={24} />
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Analyzing Records...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Comparing SHA-256 hashes and fuzzy logic scores.
              </p>
            </motion.div>
          ) : result ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: '50%', 
                  background: result.removed === 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  color: result.removed === 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {result.removed === 0 ? <CheckCircle2 size={32} /> : <Trash2 size={32} />}
                </div>
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>
                {result.removed === 0 ? 'Database is Clean' : 'Duplicates Removed'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                {result.message}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32, textAlign: 'left' }}>
                <div className="glass" style={{ padding: 16, border: 'none', background: 'var(--bg-app)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>Scanned</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{result.scanned}</div>
                </div>
                <div className="glass" style={{ padding: 16, border: 'none', background: 'var(--bg-app)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>Detected</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{result.duplicates_found}</div>
                </div>
                <div className="glass" style={{ padding: 16, border: 'none', background: 'var(--bg-app)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>Removed</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{result.removed}</div>
                </div>
              </div>

              <button className="btn btn-ghost" onClick={() => setResult(null)}>
                Run Another Scan
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Target size={32} />
                </div>
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 12 }}>Ready to Scan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                Scans all records using exact matching and RapidFuzz similarity logic. Records with ≥95% match are safely removed.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--bg-app)', borderRadius: 8 }}>
                  <Shield size={20} style={{ color: 'var(--color-info)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>SHA-256 Check</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cryptographic hash comparison for exact matches.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--bg-app)', borderRadius: 8 }}>
                  <Zap size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Fuzzy Logic</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI string similarity for detecting near-duplicates.</div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleScan}>
                Start Full Scan
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
