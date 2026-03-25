import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHistory, clearHistory } from '../logic/historyEngine';
import type { HistoryEntry } from '../logic/historyEngine';
import { sfxButtonClick } from '../logic/soundEngine';

const typeIcons: Record<string, string> = { tarot: '🃏', horoscope: '⭐', saju: '🏮', omikuji: '🎋' };
const typeColors: Record<string, string> = { tarot: '#9b59b6', horoscope: '#9b59b6', saju: '#e74c3c', omikuji: '#e74c3c' };

function renderSummary(entry: HistoryEntry, t: (key: string) => string): string {
  switch (entry.type) {
    case 'tarot': {
      const ids = (entry.data?.cardIds as number[]) || [];
      return ids.map(id => t(`tarot.cards.${id}.name`)).join(' · ') || entry.summary || 'Tarot';
    }
    case 'horoscope': {
      const sign = entry.data?.sign as string;
      const date = entry.data?.date as string || '';
      return sign ? `${t(`horoscope.${sign}`)} · ${date}` : entry.summary || 'Horoscope';
    }
    case 'saju': {
      const pillars = (entry.data?.pillars as string[]) || [];
      return pillars.join(' ') || entry.summary || 'Saju';
    }
    case 'omikuji': {
      const rankKanji = entry.data?.rankKanji as string || '';
      const rank = entry.data?.rank as string || '';
      return rankKanji ? `${rankKanji} (${t(`omikuji.${rank}`)})` : entry.summary || 'Omikuji';
    }
    default:
      return entry.summary || '';
  }
}

// Delete specific entries from history
function deleteEntries(ids: Set<string>): HistoryEntry[] {
  const history = getHistory().filter(e => !ids.has(e.id));
  localStorage.setItem('fate0_history', JSON.stringify(history));
  return history;
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<HistoryEntry[]>(getHistory());
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailEntry, setDetailEntry] = useState<HistoryEntry | null>(null);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleEnterSelectMode = () => {
    sfxButtonClick();
    setSelectMode(true);
    setSelected(new Set());
  };

  const handleCancel = () => {
    sfxButtonClick();
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleDeleteSelected = () => {
    sfxButtonClick();
    if (selected.size === 0) return;
    const remaining = deleteEntries(selected);
    setEntries(remaining);
    setSelected(new Set());
    if (remaining.length === 0) setSelectMode(false);
  };

  const handleDeleteAll = () => {
    sfxButtonClick();
    if (!window.confirm(t('history.confirmClear'))) return;
    clearHistory();
    setEntries([]);
    setSelectMode(false);
  };

  const handleSelectAll = () => {
    if (selected.size === entries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map(e => e.id)));
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const btnStyle = (active = false) => ({
    padding: '8px 16px',
    background: active ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: '10px',
    fontSize: '13px',
    color: active ? '#e74c3c' : 'rgba(255,255,255,0.4)',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #2e0a0a 100%)',
        padding: '20px',
        color: '#e0d0f0',
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>← {t('app.back')}</Link>
          <h1 style={{ fontSize: '20px', textShadow: '0 0 20px rgba(155,89,182,0.4)' }}>{t('history.title')}</h1>
          <div style={{ width: '60px' }} />
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
            <div>{t('history.empty')}</div>
          </div>
        ) : (
          <>
            {/* Select mode toolbar */}
            {selectMode && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSelectAll} style={btnStyle()}>
                  {selected.size === entries.length ? t('history.deselectAll') : t('history.selectAll')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleDeleteSelected}
                  style={btnStyle(selected.size > 0)}>
                  {t('history.deleteSelected')} {selected.size > 0 ? `(${selected.size})` : ''}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleDeleteAll} style={btnStyle(true)}>
                  {t('history.deleteAll')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel} style={btnStyle()}>
                  {t('history.cancel')}
                </motion.button>
              </div>
            )}

            {entries.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectMode ? toggleSelect(entry.id) : setDetailEntry(entry)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: selected.has(entry.id) ? 'rgba(231,76,60,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selected.has(entry.id) ? 'rgba(231,76,60,0.4)' : `${typeColors[entry.type]}30`}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                {selectMode && (
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '4px',
                      border: `2px solid ${selected.has(entry.id) ? '#e74c3c' : 'rgba(255,255,255,0.2)'}`,
                      background: selected.has(entry.id) ? '#e74c3c' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', color: '#fff', transition: '0.2s',
                    }}>
                      {selected.has(entry.id) && '✓'}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '24px' }}>{typeIcons[entry.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{renderSummary(entry, t)}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{formatDate(entry.date)}</div>
                </div>
                <div style={{
                  fontSize: '11px', padding: '2px 8px',
                  background: `${typeColors[entry.type]}20`,
                  color: typeColors[entry.type],
                  borderRadius: '8px',
                  border: `1px solid ${typeColors[entry.type]}40`,
                }}>
                  {t(`home.${entry.type}`)}
                </div>
              </motion.div>
            ))}

            {!selectMode && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={handleEnterSelectMode} style={btnStyle()}>
                  {t('history.clear')}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail popup */}
      <AnimatePresence>
        {detailEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailEntry(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(26,10,46,0.97), rgba(46,10,10,0.97))',
                borderRadius: '16px', padding: '24px',
                maxWidth: '400px', width: '100%',
                maxHeight: '80vh', overflowY: 'auto',
                border: `1px solid ${typeColors[detailEntry.type]}40`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>{typeIcons[detailEntry.type]}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: typeColors[detailEntry.type] }}>
                    {t(`home.${detailEntry.type}`)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {formatDate(detailEntry.date)}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)' }}>
                <DetailContent entry={detailEntry} t={t} />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDetailEntry(null)}
                style={{
                  marginTop: '20px', width: '100%', padding: '10px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                }}
              >
                ✕ {t('app.back')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailContent({ entry, t }: { entry: HistoryEntry; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const data = entry.data || {};

  switch (entry.type) {
    case 'tarot': {
      const cardIds = (data.cardIds as number[]) || [];
      return (
        <div>
          {cardIds.map((id, i) => (
            <div key={i} style={{ marginBottom: '12px', padding: '10px', background: 'rgba(155,89,182,0.1)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700 }}>{t(`tarot.cards.${id}.name`)}</div>
              <div style={{ fontSize: '13px', marginTop: '4px', color: 'rgba(255,255,255,0.55)' }}>
                {t(`tarot.cards.${id}.upright`)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'horoscope': {
      const sign = data.sign as string || '';
      return (
        <div>
          {sign && <div style={{ fontSize: '16px', marginBottom: '8px' }}>{t(`horoscope.${sign}`)}</div>}
          {data['oracle'] ? <div style={{ fontStyle: 'italic', marginTop: '8px' }}>"{String(data['oracle'])}"</div> : null}
        </div>
      );
    }
    case 'saju': {
      const pillars = (data.pillars as string[]) || [];
      const dayMaster = data.dayMaster as string || '';
      return (
        <div>
          {pillars.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
              {pillars.map((p, i) => (
                <div key={i} style={{ padding: '8px 12px', background: 'rgba(231,76,60,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  {p}
                </div>
              ))}
            </div>
          )}
          {dayMaster && <div>{t('saju.dayMasterLabel')}: {dayMaster}</div>}
        </div>
      );
    }
    case 'omikuji': {
      const rankKanji = data.rankKanji as string || '';
      const rank = data.rank as string || '';
      return (
        <div style={{ textAlign: 'center' }}>
          {rankKanji && <div style={{ fontSize: '36px', marginBottom: '8px' }}>{rankKanji}</div>}
          {rank && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{t(`omikuji.${rank}`)}</div>}
        </div>
      );
    }
    default:
      return <div>{entry.summary}</div>;
  }
}
