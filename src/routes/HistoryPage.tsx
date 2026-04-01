import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHistory, clearHistory, updateMemo } from '../logic/historyEngine';
import type { HistoryEntry } from '../logic/historyEngine';
import { sfxButtonClick } from '../logic/soundEngine';
import TarotCardIcon from '../components/tarot/TarotCardIcon';
import SajuElementIcon from '../components/saju/SajuElementIcon';
import SajuStemIcon from '../components/saju/SajuStemIcon';
import ShareButton from '../components/layout/ShareButton';
import OmikujiIcon from '../components/omikuji/OmikujiIcon';
import TablerIcon from '../components/common/TablerIcon';

const typeIconNames: Record<string, string> = { tarot: 'cards', horoscope: 'moon-stars', saju: 'yin-yang', omikuji: 'torii' };
const typeIconColors: Record<string, string> = { tarot: '#c39bd3', horoscope: '#c39bd3', saju: '#f1948a', omikuji: '#f1948a' };
function typeIcon(type: string, size: number): React.ReactNode {
  const name = typeIconNames[type];
  if (!name) return '❓';
  return <TablerIcon name={name} size={size} color={typeIconColors[type]} />;
}
const typeColors: Record<string, string> = { tarot: '#9b59b6', horoscope: '#9b59b6', saju: '#e74c3c', omikuji: '#e74c3c' };

function getDateGroup(isoDate: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dateStr = date.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  if (dateStr === todayStr) return t('history.today', { defaultValue: '오늘' });
  if (dateStr === yesterdayStr) return t('history.yesterday', { defaultValue: '어제' });
  if (dateStr >= weekAgoStr) return t('history.thisWeek', { defaultValue: '이번 주' });
  return t('history.earlier', { defaultValue: '이전' });
}

function getWeeklySummary(entries: HistoryEntry[], t: (key: string, opts?: Record<string, unknown>) => string): { show: boolean; totalCount: number; typeCounts: Record<string, number>; elementFlow: string; dominantElementKey: string; mood: string } | null {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);

  const weekEntries = entries.filter(e => e.date.slice(0, 10) >= weekAgoStr);
  if (weekEntries.length < 3) return null;

  const typeCounts: Record<string, number> = { tarot: 0, horoscope: 0, saju: 0, omikuji: 0 };
  const elementCounts: Record<string, number> = {};

  for (const entry of weekEntries) {
    typeCounts[entry.type]++;
    if (entry.type === 'saju' && entry.data?.dailyElement) {
      const el = entry.data.dailyElement as string;
      elementCounts[el] = (elementCounts[el] || 0) + 1;
    }
  }

  const dominantElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];

  const dominantElementKey = dominantElement ? dominantElement[0] : '';
  const elementFlow = dominantElement
    ? t(`saju.element.${dominantElement[0]}`, { defaultValue: dominantElement[0] })
    : '';

  const daysWithEntries = new Set(weekEntries.map(e => e.date.slice(0, 10))).size;
  let mood: string;
  if (daysWithEntries >= 6) mood = t('weekly.moodDedicated', { defaultValue: '꾸준히 운명과 대화한 한 주' });
  else if (daysWithEntries >= 4) mood = t('weekly.moodActive', { defaultValue: '적극적으로 흐름을 읽은 한 주' });
  else mood = t('weekly.moodCurious', { defaultValue: '조용히 별을 바라본 한 주' });

  return {
    show: true,
    totalCount: weekEntries.length,
    typeCounts,
    elementFlow,
    dominantElementKey,
    mood,
  };
}

function groupEntries(entries: HistoryEntry[], t: (key: string, opts?: Record<string, unknown>) => string): { label: string; entries: HistoryEntry[] }[] {
  const groups: { label: string; entries: HistoryEntry[] }[] = [];
  let currentLabel = '';
  for (const entry of entries) {
    const label = getDateGroup(entry.date, t);
    if (label !== currentLabel) {
      groups.push({ label, entries: [entry] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].entries.push(entry);
    }
  }
  return groups;
}

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
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState('');

  const weeklySummary = useMemo(() => getWeeklySummary(entries, t), [entries]);
  const groupedEntries = useMemo(() => groupEntries(entries, t), [entries]);

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
        height: '100dvh',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #2e0a0a 100%)',
        padding: '16px',
        paddingBottom: `max(48px, env(safe-area-inset-bottom, 48px))`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
        color: '#e0d0f0',
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      <div style={{ maxWidth: '500px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>← {t('app.back')}</Link>
          <h1 style={{ fontSize: '20px', textShadow: '0 0 20px rgba(155,89,182,0.4)' }}>{t('history.title')}</h1>
          <div style={{ width: '60px' }} />
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ marginBottom: '16px' }}><TablerIcon name="file-text" size={48} color="rgba(255,255,255,0.3)" /></div>
            <div>{t('history.empty')}</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {/* Weekly summary card */}
            {weeklySummary && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(155,89,182,0.08))',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '14px', padding: '16px', marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.7)', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>
                    ✦ {t('weekly.title', { defaultValue: '이번 주 당신의 흐름' })} ✦
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(weeklySummary.typeCounts).filter(([, c]) => c > 0).map(([type, count]) => (
                      <div key={type} style={{
                        padding: '4px 10px', background: `${typeColors[type]}15`,
                        borderRadius: '12px', fontSize: '12px', color: typeColors[type],
                        border: `1px solid ${typeColors[type]}30`,
                      }}>
                        {typeIcon(type, 14)} {count}
                      </div>
                    ))}
                  </div>
                  {weeklySummary.elementFlow && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: '6px' }}>
                      {t('weekly.elementFlow')}: <SajuElementIcon element={weeklySummary.dominantElementKey} size={12} /> {weeklySummary.elementFlow}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontStyle: 'italic' }}>
                    "{weeklySummary.mood}"
                  </div>
                </motion.div>
            )}

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

            {groupedEntries.map(group => (
              <div key={group.label}>
                <div style={{
                  fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '2px',
                  padding: '8px 4px 6px', fontWeight: 700,
                }}>
                  ✦ {group.label}
                </div>
                {group.entries.map((entry) => (
                  <motion.div key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { if (selectMode) { toggleSelect(entry.id); } else { setDetailEntry(entry); setEditingMemo(false); } }}
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
                    <div style={{ fontSize: '24px' }}>{typeIcon(entry.type, 24)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{renderSummary(entry, t)}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{formatDate(entry.date)}</div>
                      {entry.memo && (
                        <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <TablerIcon name="message-circle" size={12} style={{ marginRight: '3px' }} />{entry.memo}
                        </div>
                      )}
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
              </div>
            ))}

            {/* Entry count & limit indicator */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
              {t('history.entryCount', { count: entries.length, max: 50, defaultValue: `${entries.length} / 50` })}
              {entries.length >= 50 && (
                <div style={{ color: 'rgba(231,76,60,0.5)', marginTop: '4px' }}>
                  {t('history.limitReached', { defaultValue: '* Oldest entries will be replaced by new ones' })}
                </div>
              )}
            </div>

            {!selectMode && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={handleEnterSelectMode} style={btnStyle()}>
                  {t('history.clear')}
                </motion.button>
              </div>
            )}
          </div>
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
                  <span style={{ fontSize: '28px' }}>{typeIcon(detailEntry.type, 28)}</span>
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

              {/* Memo section */}
              <div style={{ padding: '10px 0' }}>
                {editingMemo ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text" value={memoText}
                      onChange={e => setMemoText(e.target.value.slice(0, 100))}
                      maxLength={100} autoFocus
                      placeholder={t('memo.placeholder', { defaultValue: '오늘의 운세를 보며 느낀 것...' })}
                      style={{
                        flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                        color: 'rgba(255,255,255,0.7)', fontSize: '13px',
                        fontFamily: "'Noto Serif KR', serif",
                      }}
                    />
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        updateMemo(detailEntry.id, memoText.trim());
                        const updated = getHistory();
                        setEntries(updated);
                        const updatedEntry = updated.find(e => e.id === detailEntry.id);
                        if (updatedEntry) setDetailEntry(updatedEntry);
                        setEditingMemo(false);
                      }}
                      style={{
                        padding: '8px 14px', borderRadius: '8px',
                        background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                        color: '#ffd700', fontSize: '12px', flexShrink: 0,
                      }}
                    >
                      {t('memo.save', { defaultValue: '저장' })}
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setMemoText(detailEntry.memo || ''); setEditingMemo(true); }}
                    style={{
                      padding: '10px 14px', background: 'rgba(212,175,55,0.05)',
                      border: '1px dashed rgba(212,175,55,0.15)', borderRadius: '10px',
                      cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    {detailEntry.memo ? (
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
                        <TablerIcon name="message-circle" size={12} style={{ marginRight: '3px' }} />{detailEntry.memo}
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
                          {t('memo.tapToEdit', { defaultValue: '탭하여 수정' })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                        <TablerIcon name="message-circle" size={12} style={{ marginRight: '3px' }} />{t('memo.addNote', { defaultValue: '메모를 남겨보세요' })}
                      </div>
                    )}
                  </motion.div>
                )}
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
              <div style={{ flexShrink: 0, width: '34px', textAlign: 'center' }}>
                <TarotCardIcon id={id} size={28} reversed={reversed[i]} />
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
              <div style={{ flexShrink: 0, width: '30px', textAlign: 'center' }}>
                <TarotCardIcon id={adviceId} size={24} reversed={adviceReversed} />
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
      const dayMasterStem = data.dayMasterStem as string || '';
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
              {(dayMasterStem || dayMasterEmoji) && <div style={{ marginBottom: '4px' }}><SajuStemIcon stem={dayMasterStem} emoji={dayMasterEmoji} size={26} /></div>}
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
              <div>{t('saju.dominant')}: <span style={{ color: '#f1948a' }}>{elements.dominant}</span></div>
              <div>{t('saju.deficient')}: <span style={{ color: '#999' }}>{elements.deficient}</span></div>
            </div>
          )}

          {dailyPillar && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(212,175,55,0.08)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.6)', marginBottom: '5px' }}>{t('saju.dailyTitle')}: {dailyPillar}</div>
              {dailyAdvice && <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.45)' }}>{dailyAdvice}</div>}
            </div>
          )}
        </div>
      );
    }
    case 'omikuji': {
      const rankKanji = data.rankKanji as string || '';
      const rank = data.rank as string || '';
      const question = data.question as string || '';

      const rankColors: Record<string, string> = {
        daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
        suekichi: '#999', kyo: '#666', daikyo: '#444',
      };

      // Re-derive from i18n keys instead of using stored pre-translated text
      const wakaTranslation = rank ? t(`waka.${rank}.translation`) : '';
      const meaning = rank ? t(`waka.${rank}.meaning`) : '';
      const general = rank ? t(`omikujiData.${rank}.0.general`) : '';
      const wish = rank ? t(`omikujiData.${rank}.0.wish`) : '';
      const love = rank ? t(`omikujiData.${rank}.0.relationship`) : '';
      const travel = rank ? t(`omikujiData.${rank}.0.travel`) : '';
      const health = rank ? t(`omikujiData.${rank}.0.health`) : '';

      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '12px' }}>おみくじ</div>

          <div style={{ fontSize: '48px', fontWeight: 700, color: rankColors[rank] || '#c39bd3', marginBottom: '8px' }}>{rankKanji}</div>

          {question && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontStyle: 'italic' }}>
              {t('omikuji.questionLabel')}: "{question}"
            </div>
          )}

          {wakaTranslation && (
            <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontStyle: 'italic', padding: '0 8px' }}>
              {wakaTranslation}
            </div>
          )}

          {meaning && (
            <SectionBox color="rgba(231,76,60,0.08)">
              <div style={{ fontSize: '12px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                {meaning}
              </div>
            </SectionBox>
          )}

          {general && (
            <SectionBox color="rgba(231,76,60,0.06)">
              <div style={{ fontSize: '12px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                {general}
              </div>
            </SectionBox>
          )}

          {(wish || love || travel || health) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
              {wish && <div><OmikujiIcon name="pray" size={14} style={{ marginRight: '4px' }} />{wish}</div>}
              {love && <div>💕 {love}</div>}
              {travel && <div>✈️ {travel}</div>}
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
