import { motion } from 'framer-motion';

interface Props {
  open: boolean;
  theme?: 'west' | 'east';
  size?: number;
}

export default function MysticEye({ open, theme = 'west', size = 32 }: Props) {
  const color = theme === 'west' ? '#9b59b6' : '#e74c3c';
  const glowColor = theme === 'west' ? 'rgba(155,89,182,' : 'rgba(231,76,60,';

  if (open) {
    // Open eye — pulsing, glowing, watching
    return (
      <motion.svg
        width={size} height={size * 0.6} viewBox="0 0 40 24"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${glowColor}0.6))` }}
      >
        {/* Eye outline */}
        <path
          d="M2 12 Q10 2 20 2 Q30 2 38 12 Q30 22 20 22 Q10 22 2 12 Z"
          fill="none" stroke={color} strokeWidth="1.5" opacity="0.8"
        />
        {/* Iris */}
        <circle cx="20" cy="12" r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
        {/* Pupil */}
        <motion.circle
          cx="20" cy="12" r="3"
          fill={color}
          animate={{ r: [3, 3.5, 3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        {/* Light reflection */}
        <circle cx="22" cy="10" r="1" fill="#fff" opacity="0.7" />
      </motion.svg>
    );
  }

  // Closed eye — still, dim, afterglow
  return (
    <svg
      width={size} height={size * 0.6} viewBox="0 0 40 24"
      style={{ filter: `drop-shadow(0 0 3px ${glowColor}0.2))`, opacity: 0.5 }}
    >
      {/* Closed eye line */}
      <path
        d="M4 14 Q12 8 20 8 Q28 8 36 14"
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Eyelashes */}
      <line x1="12" y1="10" x2="10" y2="6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="20" y1="8" x2="20" y2="4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="28" y1="10" x2="30" y2="6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
