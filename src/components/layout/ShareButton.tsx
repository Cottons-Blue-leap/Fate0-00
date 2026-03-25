import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import type { HistoryEntry } from '../../logic/historyEngine';
import SharePreview from './SharePreview';

interface Props {
  targetRef?: React.RefObject<HTMLDivElement | null>;
  theme?: 'west' | 'east';
  entry?: HistoryEntry;
}

async function captureImage(el: HTMLDivElement, bg: string): Promise<{ blob: Blob; dataUrl: string }> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, { backgroundColor: bg, scale: 2, useCORS: true });
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });
  return { blob, dataUrl };
}

export default function ShareButton({ targetRef, theme = 'west', entry }: Props) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const bg = theme === 'west' ? '#1a0a2e' : '#2e0a0a';
  const color = theme === 'west' ? 'rgba(155,89,182,' : 'rgba(231,76,60,';

  // Don't render if neither entry nor targetRef provided
  if (!entry && !targetRef?.current) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled
        style={{
          padding: '10px 24px',
          background: `${color}0.1)`,
          border: `1px solid ${color}0.2)`,
          borderRadius: '12px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.5,
        }}
      >
        📤 {t('share.button')}
      </motion.button>
    );
  }

  // New card-based sharing (when entry is provided)
  if (entry) {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPreview(true)}
          style={{
            padding: '10px 24px',
            background: `${color}0.2)`,
            border: `1px solid ${color}0.4)`,
            borderRadius: '12px',
            fontSize: '14px',
            color: '#e8d5f5',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📤 {t('share.button')}
        </motion.button>
        <SharePreview entry={entry} isOpen={showPreview} onClose={() => setShowPreview(false)} />
      </>
    );
  }

  // Legacy ref-based sharing (for FortuneReport etc.)
  const handleSaveImage = useCallback(async () => {
    if (!targetRef?.current) return;
    setCapturing(true);
    try {
      const { blob, dataUrl } = await captureImage(targetRef.current, bg);
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64Data, directory: Directory.Cache });
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
    setShowPanel(false);
  }, [targetRef, bg]);

  const handleNativeShare = useCallback(async () => {
    if (!targetRef?.current) return;
    setCapturing(true);
    try {
      const { blob, dataUrl } = await captureImage(targetRef.current, bg);
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const saved = await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64Data, directory: Directory.Cache });
        await Share.share({ title: t('app.title'), url: saved.uri });
      } else {
        const file = new File([blob], 'fate0.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: t('app.title'), files: [file] });
        }
      }
    } catch { /* silent */ }
    setCapturing(false);
    setShowPanel(false);
  }, [targetRef, bg, t]);

  const handleCopyUrl = useCallback(async () => {
    try { await navigator.clipboard.writeText('https://fate0-00.vercel.app'); } catch { /* */ }
    setShowPanel(false);
  }, []);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
        style={{
          padding: '10px 24px',
          background: `${color}0.2)`,
          border: `1px solid ${color}0.4)`,
          borderRadius: '12px',
          fontSize: '14px',
          color: '#e8d5f5',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        📤 {t('share.button')}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              marginBottom: '8px', background: 'rgba(10,5,20,0.95)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px',
              padding: '12px', width: '200px', zIndex: 50,
              display: 'flex', flexDirection: 'column', gap: '6px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ShareOption icon="💾" label={t('share.saveImage', 'Save Image')} onClick={handleSaveImage} disabled={capturing} />
            {(canNativeShare || Capacitor.isNativePlatform()) && (
              <ShareOption icon="📤" label={t('share.nativeShare', 'Share...')} onClick={handleNativeShare} disabled={capturing} />
            )}
            <ShareOption icon="🔗" label={t('share.copyUrl', 'Copy URL')} onClick={handleCopyUrl} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPanel(false)}
              style={{ background: 'none', fontSize: '11px', color: 'rgba(255,255,255,0.25)', padding: '4px', marginTop: '2px' }}>
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareOption({ icon, label, onClick, disabled }: { icon: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.06)',
        border: 'none', color: 'rgba(255,255,255,0.7)',
        fontSize: '13px', cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{icon}</span>
      {label}
    </motion.button>
  );
}
