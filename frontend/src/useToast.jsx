import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, WifiOff } from 'lucide-react';

const ToastCtx = createContext(null);
let id = 0;

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
  offline: WifiOff,
};

const STYLES = {
  success: { accent: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
  error:   { accent: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
  warning: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  info:    { accent: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.2)'  },
  offline: { accent: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const tid = ++id;
    setToasts(p => [...p, { id: tid, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== tid)), 4500);
  }, []);

  const remove = useCallback(tid => setToasts(p => p.filter(t => t.id !== tid)), []);

  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map(t => {
            const s = STYLES[t.type] || STYLES.info;
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12,
                  background: s.bg, border: `1px solid ${s.border}`,
                  backdropFilter: 'blur(12px)',
                  minWidth: 260, maxWidth: 360,
                  pointerEvents: 'all',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ color: s.accent, flexShrink: 0 }}>
                  <Icon size={15} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4, fontWeight: 500 }}>
                  {t.message}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', flexShrink: 0, padding: 2,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
