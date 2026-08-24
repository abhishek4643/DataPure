import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', elevated = false, hover = false, style, onClick, ...props }) {
  return (
    <motion.div
      className={`${elevated ? 'glass-hi' : 'glass'} ${hover ? 'glass-hover' : ''} ${className}`}
      whileHover={hover ? { y: -2, transition: { duration: 0.18 } } : undefined}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
