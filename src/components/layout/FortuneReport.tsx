import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import { getHistory } from '../../logic/historyEngine';
import type { HistoryEntry } from '../../logic/historyEngine';
import { tarotSymbols } from '@fate0/shared';
import ShareButton from './ShareButton';

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

// --- Helpers ---

function Divider({ color = 'rgba(212,175,55,0.2)' }: { color?: string }) {
  return <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: '14px 0' }} />;
}

function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color, letterSpacing: '1px' }}>{label}</span>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// --- Zodiac data ---

const zodiacSymbols: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};
const zodiacElements: Record<string, string> = {
  aries: '🔥', taurus: '🌍', gemini: '💨', cancer: '💧',
  leo: '🔥', virgo: '🌍', libra: '💨', scorpio: '💧',
  sagittarius: '🔥', capricorn: '🌍', aquarius: '💨', pisces: '💧',
};
const omikujiColors: Record<string, string> = {
  daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
  suekichi: '#999', kyo: '#666', daikyo: '#444',
};

// --- Section renderers ---

function TarotSection({ entry, t }: { entry: HistoryEntry; t: (k: string, o?: Record<string, unknown>) => string }) {
  const data = entry.data || {};
  const cardIds = (data['cardIds'] as number[]) || [];
  const reversed = (data['reversed'] as boolean[]) || [];
  const spread = (data['spread'] as string) || '1-card';
  const adviceId = data['adviceId'] as number | undefined;
  const adviceReversed = data['adviceReversed'] as boolean | undefined;

  return (
    <div>
      <SectionHeader icon="🃏" label={t('home.tarot')} color="#c39bd3" />
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', marginBottom: '8px' }}>
        {spread === '1-card' ? 'ONE CARD' : spread === '3-card' ? 'THREE CARDS' : 'CELTIC CROSS'}
      </div>
      {cardIds.map((id, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', padding: '6px 8px', background: 'rgba(155,89,182,0.06)', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', flexShrink: 0, width: '26px', textAlign: 'center', transform: reversed[i] ? 'rotate(180deg)' : 'none' }}>
            {tarotSymbols[id] || '🃏'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>
              {t(`tarot.cards.${id}.name`)}
              {reversed[i] && <span style={{ color: '#e74c3c', fontSize: '9px', marginLeft: '4px' }}>{t('tarot.reversed')}</span>}
            </div>
            <div style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
              {truncate(reversed[i] ? t(`tarot.cards.${id}.reversed`) : t(`tarot.cards.${id}.upright`), 80)}
            </div>
          </div>
        </div>
      ))}
      {adviceId !== undefined && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '6px', padding: '6px 8px', background: 'rgba(212,175,55,0.06)', borderRadius: '8px' }}>
          <div style={{ fontSize: '18px', flexShrink: 0, width: '26px', textAlign: 'center', transform: adviceReversed ? 'rotate(180deg)' : 'none' }}>
            {tarotSymbols[adviceId] || '🃏'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '2px' }}>✦ {t('tarot.adviceCard')}</div>
            <div style={{ fontSize: '11px', fontWeight: 700 }}>
              {t(`tarot.cards.${adviceId}.name`)}
              {adviceReversed && <span style={{ color: '#e74c3c', fontSize: '9px', marginLeft: '4px' }}>{t('tarot.reversed')}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HoroscopeSection({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const data = entry.data || {};
  const sign = data['sign'] as string || '';
  const moonEmoji = data['moonEmoji'] as string || '🌙';
  const moonPhase = data['moonPhase'] as string || '';
  const oracle = data['oracle'] as string || '';

  return (
    <div>
      <SectionHeader icon="⭐" label={t('home.horoscope')} color="#c39bd3" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '32px' }}>{zodiacSymbols[sign] || '⭐'}</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#c39bd3' }}>{sign ? t(`horoscope.${sign}`) : ''}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{zodiacElements[sign] || ''} · {moonEmoji} {moonPhase}</div>
        </div>
      </div>
      {oracle && (
        <div style={{ padding: '8px 10px', background: 'rgba(155,89,182,0.06)', borderRadius: '8px', fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
          "{truncate(oracle, 120)}"
        </div>
      )}
    </div>
  );
}

function SajuSection({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const data = entry.data || {};
  const pillars = (data['pillars'] as string[]) || [];
  const dayMaster = data['dayMaster'] as string || '';
  const dayMasterEmoji = data['dayMasterEmoji'] as string || '';
  const elements = data['elements'] as { dominant: string; deficient: string } | null;
  const dailyPillar = data['dailyPillar'] as string || '';
  const dailyAdvice = data['dailyAdvice'] as string || '';
  const labels = ['年', '月', '日', '時'];

  return (
    <div>
      <SectionHeader icon="🏮" label={t('home.saju')} color="#f1948a" />
      {pillars.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ padding: '6px 10px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.12)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', marginBottom: '2px' }}>{labels[i]}</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{p}</div>
            </div>
          ))}
        </div>
      )}
      {dayMaster && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {dayMasterEmoji && <span style={{ fontSize: '20px' }}>{dayMasterEmoji}</span>}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1948a' }}>{dayMaster}</span>
        </div>
      )}
      {elements && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
          주요: <span style={{ color: '#f1948a' }}>{elements.dominant}</span> · 부족: <span style={{ color: '#999' }}>{elements.deficient}</span>
        </div>
      )}
      {dailyPillar && (
        <div style={{ padding: '6px 10px', background: 'rgba(212,175,55,0.06)', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)' }}>오늘의 일진: {dailyPillar}</div>
          {dailyAdvice && <div style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{truncate(dailyAdvice, 80)}</div>}
        </div>
      )}
    </div>
  );
}

function OmikujiSection({ entry, t }: { entry: HistoryEntry; t: (k: string) => string }) {
  const data = entry.data || {};
  const rankKanji = data['rankKanji'] as string || '';
  const rank = data['rank'] as string || '';
  const wakaKo = data['wakaKo'] as string || '';
  const question = data['question'] as string || '';
  const wish = data['wish'] as string || '';
  const love = data['love'] as string || '';
  const health = data['health'] as string || '';
  const meaning = rank ? t(`waka.${rank}.meaning`) : '';

  return (
    <div>
      <SectionHeader icon="🎋" label={t('home.omikuji')} color="#f1948a" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: omikujiColors[rank] || '#c39bd3' }}>{rankKanji}</span>
        <div>
          {question && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>소원: "{truncate(question, 30)}"</div>}
          {wakaKo && <div style={{ fontSize: '11px', lineHeight: '1.5', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginTop: '2px' }}>{truncate(wakaKo, 60)}</div>}
        </div>
      </div>
      {meaning && (
        <div style={{ padding: '6px 10px', background: 'rgba(231,76,60,0.06)', borderRadius: '8px', fontSize: '10px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
          {truncate(meaning, 100)}
        </div>
      )}
      {(wish || love || health) && (
        <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
          {wish && <span>🙏 {truncate(wish, 18)}</span>}
          {love && <span>💕 {truncate(love, 18)}</span>}
          {health && <span>💪 {truncate(health, 18)}</span>}
        </div>
      )}
    </div>
  );
}

// --- Synthesis line ---

function getSynthesis(entries: Record<string, HistoryEntry | undefined>, t: (k: string) => string): string {
  const parts: string[] = [];
  const tarot = entries['tarot'];
  if (tarot) {
    const ids = (tarot.data?.['cardIds'] as number[]) || [];
    if (ids.length > 0) parts.push(t(`tarot.cards.${ids[0]}.name`));
  }
  const horo = entries['horoscope'];
  if (horo) {
    const sign = horo.data?.['sign'] as string;
    if (sign) parts.push(t(`horoscope.${sign}`));
  }
  const saju = entries['saju'];
  if (saju) {
    const dm = saju.data?.['dayMaster'] as string;
    if (dm) parts.push(dm);
  }
  const omi = entries['omikuji'];
  if (omi) {
    const rk = omi.data?.['rankKanji'] as string;
    if (rk) parts.push(rk);
  }
  return parts.join(' · ');
}

// --- Main component ---

export default function FortuneReport({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const reportRef = useRef<HTMLDivElement>(null);

  const entries = getTodayEntries();
  const allComplete = !!entries['tarot'] && !!entries['horoscope'] && !!entries['saju'] && !!entries['omikuji'];
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
  const synthesis = getSynthesis(entries, t);

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
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px', overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Capturable report area */}
          <div ref={reportRef} style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 40%, #3d1f6d 60%, #501414 80%, #2e0a0a 100%)',
            borderRadius: '20px', padding: '22px 18px',
            fontFamily: "'Noto Serif KR', serif",
            color: '#e0d0f0',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '4px' }}>
                ✦ FORTUNE REPORT ✦
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
                {t('app.title')}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                {profile?.name || t('profile.defaultName')} · {dateStr}
              </div>
              {profile && (
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                  {profile.birthYear}.{profile.birthMonth}.{profile.birthDay}
                </div>
              )}
            </div>

            {/* Synthesis line */}
            {synthesis && (
              <>
                <Divider />
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(212,175,55,0.7)', fontStyle: 'italic', padding: '0 8px' }}>
                  ◈ {synthesis}
                </div>
              </>
            )}

            {/* Tarot */}
            {entries['tarot'] && (
              <>
                <Divider color="rgba(155,89,182,0.25)" />
                <TarotSection entry={entries['tarot']} t={t} />
              </>
            )}

            {/* Horoscope */}
            {entries['horoscope'] && (
              <>
                <Divider color="rgba(155,89,182,0.25)" />
                <HoroscopeSection entry={entries['horoscope']} t={t} />
              </>
            )}

            {/* Saju */}
            {entries['saju'] && (
              <>
                <Divider color="rgba(231,76,60,0.25)" />
                <SajuSection entry={entries['saju']} t={t} />
              </>
            )}

            {/* Omikuji */}
            {entries['omikuji'] && (
              <>
                <Divider color="rgba(231,76,60,0.25)" />
                <OmikujiSection entry={entries['omikuji']} t={t} />
              </>
            )}

            {/* Watermark */}
            <Divider />
            <div style={{ textAlign: 'center', fontSize: '8px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px' }}>
              {profile?.name && <div style={{ marginBottom: '2px' }}>{profile.name}님의 운세</div>}
              운명 0시 · fate0-00.vercel.app
            </div>
          </div>

          {/* Controls (outside capturable area) */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {allComplete && <ShareButton targetRef={reportRef} theme="west" />}
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              ✕
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
