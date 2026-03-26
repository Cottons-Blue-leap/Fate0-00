import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MysticClock from './MysticClock';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'clock' | 'title' | 'fade'>('clock');

  useEffect(() => {
    let done = false;
    const finish = () => { if (done) return; done = true; onComplete(); };
    const t1 = setTimeout(() => setPhase('title'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2200);
    const t3 = setTimeout(finish, 2800);
    // Safety: force complete if something goes wrong
    const safety = setTimeout(finish, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(safety); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'fade' ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #2e0a0a 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px',
          padding: 'var(--sat, 0px) var(--sar, 0px) var(--sab, 0px) var(--sal, 0px)',
        }}
      >
        {/* Immediate loading indicator — visible before Framer Motion kicks in */}
        <div style={{
          position: 'absolute', bottom: '20%',
          color: 'rgba(255,255,255,0.2)', fontSize: '14px', letterSpacing: '4px',
        }}>
          ✦ ✦ ✦
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <MysticClock size={140} />
        </motion.div>

        {(phase === 'title' || phase === 'fade') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              fontSize: '28px',
              color: '#fff',
              fontFamily: "'Noto Serif KR', serif",
              letterSpacing: '6px',
              textShadow: '0 0 30px rgba(155,89,182,0.5), 0 0 30px rgba(231,76,60,0.5)',
            }}>
              {t('app.title')}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '3px',
              marginTop: '8px',
              fontFamily: 'monospace',
            }}>
              Fate 0:00
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
