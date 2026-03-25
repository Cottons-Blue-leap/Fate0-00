import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import ShareCard from './ShareCard';
import type { HistoryEntry } from '../../logic/historyEngine';

interface Props {
  entry: HistoryEntry;
  isOpen: boolean;
  onClose: () => void;
}

async function captureCard(el: HTMLDivElement): Promise<{ blob: Blob; dataUrl: string }> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });
  return { blob, dataUrl };
}

export default function SharePreview({ entry, isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [hideBirth, setHideBirth] = useState(false);

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const { blob, dataUrl } = await captureCard(cardRef.current);
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64, directory: Directory.Cache });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fate0-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* silent */ }
    setCapturing(false);
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const { blob, dataUrl } = await captureCard(cardRef.current);
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const saved = await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64, directory: Directory.Cache });
        await Share.share({ title: t('app.title'), url: saved.uri });
      } else {
        const file = new File([blob], 'fate0.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: t('app.title'), files: [file] });
        }
      }
    } catch { /* silent */ }
    setCapturing(false);
  }, [t]);

  const handleCopyUrl = useCallback(async () => {
    try { await navigator.clipboard.writeText('https://fate0-00.vercel.app'); } catch { /* */ }
  }, []);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9500,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px', overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '90vh' }}
          >
            {/* Card preview (scaled to fit screen) */}
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-160px' }}>
              <ShareCard ref={cardRef} entry={entry} hideBirth={hideBirth} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
              {entry.type === 'saju' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hideBirth} onChange={(e) => setHideBirth(e.target.checked)} style={{ accentColor: '#9b59b6' }} />
                  {t('report.hideBirth', 'Hide birth info')}
                </label>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <ShareBtn icon="💾" label={t('share.saveImage', 'Save')} onClick={handleSave} disabled={capturing} />
                {(canNativeShare || Capacitor.isNativePlatform()) && (
                  <ShareBtn icon="📤" label={t('share.nativeShare', 'Share')} onClick={handleShare} disabled={capturing} />
                )}
                <ShareBtn icon="🔗" label={t('share.copyUrl', 'URL')} onClick={handleCopyUrl} />
                <ShareBtn icon="✕" label={t('app.back')} onClick={onClose} dim />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareBtn({ icon, label, onClick, disabled, dim }: { icon: string; label: string; onClick: () => void; disabled?: boolean; dim?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px', borderRadius: '10px',
        background: dim ? 'rgba(255,255,255,0.05)' : 'rgba(155,89,182,0.2)',
        border: `1px solid ${dim ? 'rgba(255,255,255,0.1)' : 'rgba(155,89,182,0.4)'}`,
        color: dim ? 'rgba(255,255,255,0.4)' : '#e8d5f5',
        fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'wait' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {icon} {label}
    </motion.button>
  );
}
