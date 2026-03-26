import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHistory, clearHistory } from '../logic/historyEngine';
import type { HistoryEntry } from '../logic/historyEngine';
import { sfxButtonClick } from '../logic/soundEngine';
import { tarotSymbols } from '@fate0/shared';
import ShareButton from '../components/layout/ShareButton';

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
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #2e0a0a 100%)',
        padding: '16px',
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
                background: isWestType(detailEntry.type)
                  ? 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #3d1f6d 100%)'
                  : 'linear-gradient(135deg, #2e0a0a 0%, #501414 50%, #6d1f1f 100%)',
                borderRadius: '16px', padding: '24px 22px',
                maxWidth: '420px', width: '100%',
                maxHeight: '85vh', overflowY: 'auto',
                border: `1px solid ${typeColors[detailEntry.type]}40`,
                position: 'relative',
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '4px' }}>✦ FATE 0:00 ✦</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
                  <span style={{ fontSize: '28px' }}>{typeIcons[detailEntry.type]}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: typeColors[detailEntry.type] }}>
                      {t(`home.${detailEntry.type}`)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                      {formatDate(detailEntry.date)}
                    </div>
                  </div>
                </div>
              </div>

              <Divider color={typeColors[detailEntry.type]} />

              <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)', padding: '8px 0' }}>
                <DetailContent entry={detailEntry} t={t} />
              </div>

              <Divider color={typeColors[detailEntry.type]} />

              {/* Footer: share + close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
                <ShareButton entry={detailEntry} theme={isWestType(detailEntry.type) ? 'west' : 'east'} />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDetailEntry(null)}
                  style={{
                    padding: '10px 24px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  ✕ {t('app.back')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function isWestType(type: string) {
  return type === 'tarot' || type === 'horoscope';
}

function Divider({ color }: { color: string }) {
  return <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${color}30, transparent)`, margin: '6px 0' }} />;
}

function SectionBox({ children, color = 'rgba(212,175,55,0.08)' }: { children: React.ReactNode; color?: string }) {
  return <div style={{ padding: '10px 14px', background: color, borderRadius: '8px', width: '100%' }}>{children}</div>;
}

function DetailContent({ entry, t }: { entry: HistoryEntry; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const data = entry.data || {};

  switch (entry.type) {
    case 'tarot': {
      const cardIds = (data.cardIds as number[]) || [];
      const reversed = (data.reversed as boolean[]) || [];
      const spread = (data.spread as string) || '1-card';
      const question = (data.question as string) || '';
      const adviceId = data.adviceId as number | undefined;
      const adviceReversed = data.adviceReversed as boolean | undefined;

      return (
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textAlign: 'center', marginBottom: '10px' }}>
            {spread === '1-card' ? 'ONE CARD' : spread === '3-card' ? 'THREE CARDS' : 'CELTIC CROSS'}
          </div>

          {question && (
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '14px' }}>
              "{question}"
            </div>
          )}

          {cardIds.map((id, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px', padding: '10px 12px', background: 'rgba(155,89,182,0.08)', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', flexShrink: 0, width: '34px', textAlign: 'center', transform: reversed[i] ? 'rotate(180deg)' : 'none' }}>
                {tarotSymbols[id] || '🃏'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>
                  {t(`tarot.cards.${id}.name`)}
                  {reversed[i] && <span style={{ color: '#e74c3c', fontSize: '10px', marginLeft: '6px' }}>{t('tarot.reversed')}</span>}
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)' }}>
                  {reversed[i] ? t(`tarot.cards.${id}.reversed`) : t(`tarot.cards.${id}.upright`)}
                </div>
              </div>
            </div>
          ))}

          <SectionBox>
            <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(212,175,55,0.7)', fontStyle: 'italic', textAlign: 'center' }}>
              {cardIds.length === 1 ? t('tarot.summary1', { name: t(`tarot.cards.${cardIds[0]}.name`) }) : t('tarot.summary3')}
            </div>
          </SectionBox>

          {adviceId !== undefined && (
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '24px', flexShrink: 0, width: '30px', textAlign: 'center', transform: adviceReversed ? 'rotate(180deg)' : 'none' }}>
                {tarotSymbols[adviceId] || '🃏'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginBottom: '3px' }}>✦ {t('tarot.adviceCard')}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>
                  {t(`tarot.cards.${adviceId}.name`)}
                  {adviceReversed && <span style={{ color: '#e74c3c', fontSize: '10px', marginLeft: '6px' }}>{t('tarot.reversed')}</span>}
                </div>
                <div style={{ fontSize: '11px', lineHeight: '1.6', color: 'rgba(255,255,255,0.45)' }}>
                  {adviceReversed ? t(`tarot.cards.${adviceId}.reversed`) : t(`tarot.cards.${adviceId}.upright`)}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'horoscope': {
      const sign = data.sign as string || '';
      const moonEmoji = data.moonEmoji as string || '🌙';
      const moonPhase = data.moonPhase as string || '';
      const oracle = data.oracle as string || '';

      const symbols: Record<string, string> = {
        aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
        libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
      };
      const elements: Record<string, string> = {
        aries: '🔥 Fire', taurus: '🌍 Earth', gemini: '💨 Air', cancer: '💧 Water',
        leo: '🔥 Fire', virgo: '🌍 Earth', libra: '💨 Air', scorpio: '💧 Water',
        sagittarius: '🔥 Fire', capricorn: '🌍 Earth', aquarius: '💨 Air', pisces: '💧 Water',
      };

      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '6px' }}>{symbols[sign] || '⭐'}</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#c39bd3', marginBottom: '4px' }}>
            {sign ? t(`horoscope.${sign}`) : ''}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
            {elements[sign] || ''}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '18px' }}>
            {moonEmoji} {moonPhase}
          </div>

          {oracle && (
            <SectionBox color="rgba(155,89,182,0.1)">
              <div style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', textAlign: 'center' }}>
                "{oracle}"
              </div>
            </SectionBox>
          )}
        </div>
      );
    }
    case 'saju': {
      const pillars = (data.pillars as string[]) || [];
      const dayMaster = data.dayMaster as string || '';
      const dayMasterEmoji = data.dayMasterEmoji as string || '';
      const dayMasterDesc = data.dayMasterDesc as string || '';
      const birthInfo = data.birthInfo as string || '';
      const elements = data.elements as { dominant: string; deficient: string } | null;
      const dailyPillar = data.dailyPillar as string || '';
      const dailyAdvice = data.dailyAdvice as string || '';
      const labels = ['年', '月', '日', '時'];

      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '8px' }}>四柱八字</div>

          {birthInfo && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>{birthInfo}</div>}

          {pillars.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              {pillars.map((p, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'rgba(231,76,60,0.08)',
                  border: '1px solid rgba(231,76,60,0.15)', borderRadius: '10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>{labels[i]}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{p}</div>
                </div>
              ))}
            </div>
          )}

          {dayMaster && (
            <div style={{ marginBottom: '14px' }}>
              {dayMasterEmoji && <div style={{ fontSize: '26px', marginBottom: '4px' }}>{dayMasterEmoji}</div>}
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1948a' }}>{dayMaster}</div>
            </div>
          )}

          {dayMasterDesc && (
            <SectionBox color="rgba(231,76,60,0.08)">
              <div style={{ fontSize: '12px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                {dayMasterDesc}
              </div>
            </SectionBox>
          )}

          {elements && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              <div>주요 오행: <span style={{ color: '#f1948a' }}>{elements.dominant}</span></div>
              <div>부족 오행: <span style={{ color: '#999' }}>{elements.deficient}</span></div>
            </div>
          )}

          {dailyPillar && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(212,175,55,0.08)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginBottom: '5px' }}>오늘의 일진: {dailyPillar}</div>
              {dailyAdvice && <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.45)' }}>{dailyAdvice}</div>}
            </div>
          )}
        </div>
      );
    }
    case 'omikuji': {
      const rankKanji = data.rankKanji as string || '';
      const rank = data.rank as string || '';
      const wakaKo = data.wakaKo as string || '';
      const question = data.question as string || '';
      const wish = data.wish as string || '';
      const love = data.love as string || '';
      const health = data.health as string || '';

      const rankColors: Record<string, string> = {
        daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
        suekichi: '#999', kyo: '#666', daikyo: '#444',
      };

      const meaning = rank ? t(`waka.${rank}.meaning`) : '';

      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '12px' }}>おみくじ</div>

          <div style={{ fontSize: '48px', fontWeight: 700, color: rankColors[rank] || '#c39bd3', marginBottom: '8px' }}>{rankKanji}</div>

          {question && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontStyle: 'italic' }}>
              소원: "{question}"
            </div>
          )}

          {wakaKo && (
            <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontStyle: 'italic', padding: '0 8px' }}>
              {wakaKo}
            </div>
          )}

          {meaning && (
            <SectionBox color="rgba(231,76,60,0.08)">
              <div style={{ fontSize: '12px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                {meaning}
              </div>
            </SectionBox>
          )}

          {(wish || love || health) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              {wish && <div>🙏 {wish}</div>}
              {love && <div>💕 {love}</div>}
              {health && <div>💪 {health}</div>}
            </div>
          )}
        </div>
      );
    }
    default:
      return <div>{entry.summary}</div>;
  }
}
