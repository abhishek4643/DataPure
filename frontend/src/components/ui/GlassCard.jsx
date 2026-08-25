import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', elevated = false, hover = false, style, onClick, accentColor, ...props }) {
  return (
    <motion.div
      className={`${elevated ? 'glass-hi' : 'glass'} ${hover ? 'glass-hover' : ''} ${className}`}
      whileHover={hover ? { y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } } : undefined}
      style={{
        ...style,
        ...(accentColor ? { boxShadow: `0 0 40px ${accentColor}08` } : {}),
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
