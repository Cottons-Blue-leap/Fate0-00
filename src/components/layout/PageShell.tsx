import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import MysticBackground, { type PatternType } from './MysticBackground';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  theme: 'west' | 'east';
  title: string;
  children: ReactNode;
  pattern?: PatternType;
}

export default function PageShell({ theme, title, children, pattern }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      data-theme={theme}
      className="page-container"
      initial={{ opacity: 0, x: theme === 'west' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {pattern && <MysticBackground pattern={pattern} />}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header: back button + language switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              ←
            </motion.button>
            <Link to="/" className="back-button" style={{ margin: 0 }}>
              {t('app.back')}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{title}</h1>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
