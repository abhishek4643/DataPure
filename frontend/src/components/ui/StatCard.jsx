import { motion } from 'framer-motion';
import { useRef } from 'react';

export default function StatCard({ label, value, icon: Icon, color, delay = 0, description }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="glass stat-card-spotlight"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </div>
        <div style={{ 
          width: 32, height: 32, borderRadius: 8, 
          background: color ? `${color}15` : 'var(--bg-surface-hover)',
          color: color || 'var(--text-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={16} />
        </div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value || 0}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );
}
