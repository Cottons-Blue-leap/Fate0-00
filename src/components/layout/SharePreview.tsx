import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

async function captureCard(el: HTMLDivElement): Promise<Blob> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to create blob'));
    }, 'image/png');
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SharePreview({ entry, isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSave = useCallback(async () => {
    if (!cardRef.current) {
      setStatus('Error: card not ready');
      return;
    }
    setCapturing(true);
    setStatus('');
    try {
      const blob = await captureCard(cardRef.current);

      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]!);
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64, directory: Directory.Cache });
        setStatus('✓');
      } else {
        downloadBlob(blob, `fate0-${Date.now()}.png`);
        setStatus('✓');
      }
    } catch (e) {
      setStatus('Error');
      console.error('Save failed:', e);
    }
    setCapturing(false);
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    setStatus('');
    try {
      const blob = await captureCard(cardRef.current);

      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]!);
          reader.readAsDataURL(blob);
        });
        const saved = await Filesystem.writeFile({ path: `fate0-${Date.now()}.png`, data: base64, directory: Directory.Cache });
        await Share.share({ title: t('app.title'), url: saved.uri });
      } else {
        const file = new File([blob], 'fate0.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: t('app.title'), files: [file] });
        } else {
          // Fallback: just download
          downloadBlob(blob, `fate0-${Date.now()}.png`);
          setStatus('✓');
        }
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
    setCapturing(false);
  }, [t]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('https://fate0-00.vercel.app');
      setStatus('URL ✓');
    } catch {
      // Fallback: select-and-copy
      const input = document.createElement('input');
      input.value = 'https://fate0-00.vercel.app';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setStatus('URL ✓');
    }
    setTimeout(() => setStatus(''), 2000);
  }, []);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return createPortal(
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
              <ShareCard ref={cardRef} entry={entry} />
            </div>

            {/* Status */}
            {status && (
              <div style={{ fontSize: '12px', color: status.startsWith('Error') ? '#e74c3c' : '#2ecc71', marginBottom: '8px' }}>
                {status}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
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
    </AnimatePresence>,
    document.body,
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
