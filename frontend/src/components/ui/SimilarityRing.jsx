import { motion } from 'framer-motion';

export default function SimilarityRing({ score = 0, size = 140, strokeWidth = 7, label = 'Similarity' }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(score, 100) / 100);

  const color =
    score >= 85 ? '#ef4444' :
    score >= 70 ? '#f59e0b' :
                  '#10b981';

  const textColor =
    score >= 85 ? '#ef4444' :
    score >= 70 ? '#f59e0b' :
                  '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
        {/* Score text */}
        <text
          x="50%" y="46%" dominantBaseline="middle" textAnchor="middle"
          fill={textColor}
          style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: size * 0.2 }}
        >
          {score.toFixed(1)}%
        </text>
        <text
          x="50%" y="64%" dominantBaseline="middle" textAnchor="middle"
          fill="#64748b"
          style={{ fontFamily: 'Inter', fontSize: size * 0.1, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
