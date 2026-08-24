import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const n = Number(target);
    let start = 0;
    const steps = 60;
    const inc = n / steps;
    const interval = setInterval(() => {
      start += inc;
      if (start >= n) { setVal(n); clearInterval(interval); }
      else setVal(Math.floor(start));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return val;
}

export default function StatCard({ label, value, icon: Icon, accentColor, suffix = '', description, delay = 0 }) {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ position: 'relative', height: '100%', overflow: 'hidden', borderRadius: 16 }}
    >
      <motion.div
        whileHover="hover"
        initial="rest"
        style={{ height: '100%' }}
      >
        <GlassCard className="p-5" style={{ height: '100%', position: 'relative', overflow: 'hidden', border: `1px solid rgba(255,255,255,0.03)` }}>
          {/* Animated Background Glow */}
          <motion.div 
            variants={{ hover: { opacity: 0.15, scale: 1.5 }, rest: { opacity: 0, scale: 1 } }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none' }}
          />
          
          {/* Neon side border */}
          <motion.div 
            variants={{ hover: { opacity: 1, x: 0 }, rest: { opacity: 0.3, x: -2 } }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 15px color-mix(in srgb, ${accentColor} 10%, transparent) inset`
              }}
            >
              <Icon size={18} style={{ color: accentColor }} />
            </div>
          </div>

          <div className="relative z-10" style={{ fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 700, color: '#f8fafc', lineHeight: 1, letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            {value === null || value === undefined ? '—' : animated.toLocaleString()}{suffix}
          </div>
          <div className="relative z-10" style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#94a3b8', fontFamily: 'Space Grotesk', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </div>
          {description && (
            <div className="relative z-10" style={{ marginTop: 6, fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>{description}</div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
