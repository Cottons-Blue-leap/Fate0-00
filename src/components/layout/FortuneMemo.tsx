import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { updateMemo } from '../../logic/historyEngine';
import { getLatestEntry } from '../../hooks/useLatestEntry';

interface Props {
  fortuneType: 'tarot' | 'horoscope' | 'saju' | 'omikuji';
}

export default function FortuneMemo({ fortuneType }: Props) {
  const { t } = useTranslation();
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry = getLatestEntry(fortuneType);
    if (entry && memo.trim()) {
      updateMemo(entry.id, memo.trim());
      setSaved(true);
    }
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '12px 16px', marginTop: '16px', marginBottom: '20px',
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '10px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.6)' }}>
          💬 {t('memo.saved', '메모가 저장되었어요')}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontStyle: 'italic' }}>
          "{memo}"
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{ marginTop: '16px', marginBottom: '20px' }}
    >
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', textAlign: 'center' }}>
        💬 {t('memo.prompt', '지금 떠오르는 생각을 적어보세요')}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value.slice(0, 100))}
          maxLength={100}
          placeholder={t('memo.placeholder', '오늘의 운세를 보며 느낀 것...')}
          style={{
            flex: 1, padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
            fontSize: '13px', fontFamily: "'Noto Serif KR', serif",
          }}
        />
        <AnimatePresence>
          {memo.trim() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#ffd700', fontSize: '13px', flexShrink: 0,
              }}
            >
              {t('memo.save', '저장')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
