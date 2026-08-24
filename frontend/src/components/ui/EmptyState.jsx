import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 14, padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={22} style={{ color: '#475569' }} />}
      </div>
      <div>
        <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 15, color: '#94a3b8', marginBottom: 6 }}>
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 13, color: '#475569', maxWidth: 300, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
