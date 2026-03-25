import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  theme?: 'west' | 'east';
}

export default function ShareButton({ targetRef, theme = 'west' }: Props) {
  const { t } = useTranslation();

  const handleShare = useCallback(async () => {
    if (!targetRef.current) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: theme === 'west' ? '#1a0a2e' : '#2e0a0a',
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Native platform: save to file, then share via Capacitor
      if (Capacitor.isNativePlatform()) {
        try {
          const { Filesystem, Directory } = await import('@capacitor/filesystem');
          const { Share } = await import('@capacitor/share');

          // Strip data URL prefix to get pure base64
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const fileName = `fate-0-00-${Date.now()}.png`;

          // Write to cache directory
          const saved = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          await Share.share({
            title: t('app.title'),
            text: t('app.title') + ' - Fate 0:00',
            url: saved.uri,
            dialogTitle: t('share.button'),
          });
          return;
        } catch {
          // fall through to web share
        }
      }

      // Web: try Web Share API
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'fate-0-00.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ title: t('app.title'), files: [file] });
            return;
          } catch {
            // fall through to download
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fate-0-00.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [targetRef, theme, t]);

  const color = theme === 'west' ? 'rgba(155,89,182,' : 'rgba(231,76,60,';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
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
  );
}
