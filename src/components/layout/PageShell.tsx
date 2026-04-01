import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type ReactNode, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import MysticBackground, { type PatternType } from './MysticBackground';
import LanguageSwitcher from './LanguageSwitcher';

// Android WebView doesn't reliably report safe-area-inset-bottom for nav bar
const NATIVE_BOTTOM_PAD = Capacitor.isNativePlatform() ? 48 : 16;

interface Props {
  theme: 'west' | 'east';
  title: string;
  children: ReactNode;
  pattern?: PatternType;
}

export default function PageShell({ theme, title, children, pattern }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showVeil, setShowVeil] = useState(true);
  useEffect(() => { const id = setTimeout(() => setShowVeil(false), 400); return () => clearTimeout(id); }, []);

  return (
    <motion.div
      data-theme={theme}
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ position: 'relative', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {pattern && <MysticBackground pattern={pattern} theme={theme} />}
      {showVeil && <div className="step-veil" />}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '720px', width: '100%', margin: '0 auto', minHeight: 0 }}>
        {/* Header: back button + language switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', color: 'var(--text-muted)',
            }}
          >
            ← {t('app.back')}
          </motion.button>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title" style={{ flexShrink: 0 }}>{title}</h1>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', paddingBottom: `max(${NATIVE_BOTTOM_PAD}px, env(safe-area-inset-bottom, ${NATIVE_BOTTOM_PAD}px))` }}>
          <div style={{ margin: 'auto 0' }}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
