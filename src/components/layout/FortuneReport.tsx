import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import { getHistory } from '../../logic/historyEngine';
import type { HistoryEntry } from '../../logic/historyEngine';
import ShareButton from './ShareButton';

const typeIcons: Record<string, string> = { tarot: '🃏', horoscope: '⭐', saju: '🏮', omikuji: '🎋' };

function getTodayEntries(): Record<string, HistoryEntry | undefined> {
  const today = new Date().toISOString().slice(0, 10);
  const history = getHistory();
  const result: Record<string, HistoryEntry | undefined> = {};
  for (const entry of history) {
    if (entry.date.startsWith(today) && !result[entry.type]) {
      result[entry.type] = entry;
    }
  }
  return result;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FortuneReport({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const [hideBirth, setHideBirth] = useState(false);

  const entries = getTodayEntries();
  const allComplete = !!entries['tarot'] && !!entries['horoscope'] && !!entries['saju'] && !!entries['omikuji'];
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Capturable report area */}
          <div ref={reportRef} style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #2e0a0a 100%)',
            borderRadius: '20px', padding: '24px 20px',
            fontFamily: "'Noto Serif KR', serif",
            color: '#e0d0f0',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '4px' }}>
                ✦ FORTUNE REPORT ✦
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {t('app.title')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                {profile?.name || t('profile.defaultName')} · {dateStr}
              </div>
              {profile && !hideBirth && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                  {profile.birthYear}.{profile.birthMonth}.{profile.birthDay}
                </div>
              )}
            </div>

            {/* 4 fortune summaries */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {(['tarot', 'horoscope', 'saju', 'omikuji'] as const).map((type) => {
                const entry = entries[type];
                return (
                  <div key={type} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '14px 12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{typeIcons[type]}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: type === 'tarot' || type === 'horoscope' ? '#c39bd3' : '#f1948a' }}>
                      {t(`home.${type}`)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                      {entry ? getShortSummary(entry, t) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Watermark */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '9px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px' }}>
              {profile?.name && <div>{profile.name}님의 운세</div>}
              ✦ 운명 0시 · Fate 0:00 ✦
            </div>
          </div>

          {/* Controls (outside capturable area) */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}>
              <input type="checkbox" checked={hideBirth} onChange={(e) => setHideBirth(e.target.checked)}
                style={{ accentColor: '#9b59b6' }} />
              {t('report.hideBirth', 'Hide birth date')}
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            {allComplete && <ShareButton targetRef={reportRef} theme="west" />}
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              ✕
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getShortSummary(entry: HistoryEntry, t: (key: string) => string): string {
  const data = entry.data || {};
  switch (entry.type) {
    case 'tarot': {
      const ids = (data['cardIds'] as number[]) || [];
      return ids.slice(0, 3).map(id => t(`tarot.cards.${id}.name`)).join(', ') + (ids.length > 3 ? '...' : '');
    }
    case 'horoscope':
      return data['sign'] ? t(`horoscope.${data['sign']}`) : '';
    case 'saju':
      return ((data['pillars'] as string[]) || []).join(' ');
    case 'omikuji':
      return (data['rankKanji'] as string) || '';
    default:
      return entry.summary || '';
  }
}
