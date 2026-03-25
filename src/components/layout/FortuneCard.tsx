import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getReverseRemaining, canReverse } from '../../logic/reverseEngine';
import MysticEye from './MysticEye';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  to: string;
  theme: 'west' | 'east';
  used?: boolean;
  onReverse?: () => void;
}

export default function FortuneCard({ title, subtitle, icon, to, theme, used = false, onReverse }: Props) {
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);

  const glowColor = theme === 'west'
    ? 'rgba(155, 89, 182, 0.5)'
    : 'rgba(231, 76, 60, 0.5)';
  const borderColor = theme === 'west'
    ? 'rgba(155, 89, 182, 0.3)'
    : 'rgba(231, 76, 60, 0.3)';

  const handleClick = (e: React.MouseEvent) => {
    if (used) {
      e.preventDefault();
      setShowPopup(true);
    }
  };

  const handleReverse = () => {
    setShowPopup(false);
    onReverse?.();
  };

  return (
    <div style={{ position: 'relative' }}>
      <Link to={to} onClick={handleClick}>
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${glowColor}` }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: 'clamp(16px, 3vw, 32px) clamp(12px, 2vw, 24px)',
            textAlign: 'center',
            cursor: 'pointer',
            width: 'clamp(130px, 36vw, 180px)',
            transition: '0.3s',
            backdropFilter: 'blur(10px)',
            opacity: used ? 0.6 : 1,
          }}
        >
          <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '8px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {icon}
            <div style={{ marginTop: '4px' }}>
              <MysticEye open={!used} theme={theme} size={28} />
            </div>
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3.5vw, 20px)', fontWeight: 700,
            color: theme === 'west' ? '#e8d5f5' : '#f5d5d5',
            fontFamily: theme === 'west' ? "'Cinzel', serif" : "'Noto Serif KR', serif",
            marginBottom: '4px',
          }}>
            {title}
          </div>
          <div style={{ fontSize: 'clamp(10px, 2.5vw, 13px)', color: theme === 'west' ? '#b89ed0' : '#d09a9a' }}>
            {subtitle}
          </div>
          {used && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '8px', letterSpacing: '1px', lineHeight: '1.5' }}>
              ✦ {t('home.starsSleeping')}
            </div>
          )}
        </motion.div>
      </Link>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute', bottom: '-100px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '14px', padding: '14px 18px', width: '220px',
              fontSize: '12px', color: 'rgba(255,255,255,0.7)', zIndex: 20,
              textAlign: 'center', backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ marginBottom: '10px' }}>✦ {t('home.starsRestingDetail')}</div>

            {canReverse() ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReverse}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                  background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)',
                  color: '#ffd700', marginBottom: '6px',
                }}>
                <div style={{ fontWeight: 700 }}>{t('reverseFate.button')}</div>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', marginTop: '2px' }}>
                  {t('reverseFate.remaining', { count: getReverseRemaining() })}
                </div>
              </motion.button>
            ) : (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
                {t('reverseFate.noRemaining')}
              </div>
            )}

            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPopup(false)}
              style={{ background: 'none', fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
