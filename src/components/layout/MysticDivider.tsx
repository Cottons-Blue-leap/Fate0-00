import { motion } from 'framer-motion';

/**
 * Decorative divider between fortune result sections.
 * Adds a pause/ritual feel to the reading flow.
 */
export default function MysticDivider({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        margin: '20px 0', justifyContent: 'center',
      }}
    >
      <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(to right, transparent, var(--glow, rgba(155,89,182,0.3)))' }} />
      <div style={{ fontSize: '10px', color: 'var(--accent-light, #c39bd3)', opacity: 0.5, letterSpacing: '4px' }}>✦</div>
      <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(to left, transparent, var(--glow, rgba(155,89,182,0.3)))' }} />
    </motion.div>
  );
}
