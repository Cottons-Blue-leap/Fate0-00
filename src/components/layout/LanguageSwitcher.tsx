import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../../i18n';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          fontSize: '14px',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        }}
      >
        {current.flag} {current.name}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              background: 'rgba(20,10,30,0.95)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '160px',
              maxWidth: 'calc(100vw - 32px)',
              backdropFilter: 'blur(10px)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: lang.code === i18n.language ? '#9b59b6' : '#ccc',
                  background: lang.code === i18n.language ? 'rgba(155,89,182,0.15)' : 'transparent',
                }}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
