import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import type { HistoryEntry } from '../../logic/historyEngine';
import { tarotSymbols } from '@fate0/shared';

const CARD_WIDTH = 540;
const CARD_HEIGHT = 760;

interface Props {
  entry: HistoryEntry;
  hideBirth?: boolean;
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ entry, hideBirth }, ref) => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const data = entry.data || {};
  const date = new Date(entry.date);
  const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

  const isWest = entry.type === 'tarot' || entry.type === 'horoscope';
  const bg = isWest
    ? 'linear-gradient(135deg, #1a0a2e 0%, #2d1450 50%, #3d1f6d 100%)'
    : 'linear-gradient(135deg, #2e0a0a 0%, #501414 50%, #6d1f1f 100%)';
  const gold = '#d4af37';

  return (
    <div ref={ref} style={{
      width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px`,
      background: bg,
      fontFamily: "'Noto Serif KR', serif",
      color: '#e0d0f0',
      display: 'flex', flexDirection: 'column',
      padding: '28px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative corners */}
      {['top:14px;left:14px', 'top:14px;right:14px', 'bottom:14px;left:14px', 'bottom:14px;right:14px'].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...Object.fromEntries(pos.split(';').map(p => p.split(':'))), color: gold, fontSize: '12px', opacity: 0.25 }}>✦</div>
      ))}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '4px' }}>✦ FATE 0:00 ✦</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{dateStr}</div>
      </div>

      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}30, transparent)`, marginBottom: '16px' }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {entry.type === 'tarot' && <TarotContent data={data} t={t} />}
        {entry.type === 'horoscope' && <HoroscopeContent data={data} t={t} />}
        {entry.type === 'saju' && <SajuContent data={data} t={t} hideBirth={hideBirth} />}
        {entry.type === 'omikuji' && <OmikujiContent data={data} t={t} />}
      </div>

      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}30, transparent)`, marginTop: '16px' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        {profile?.name && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{profile.name}님의 운세</div>}
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px', marginTop: '3px' }}>운명 0시 · fate0-00.vercel.app</div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;

// === Type-specific content ===

function TarotContent({ data, t }: { data: Record<string, unknown>; t: (k: string, o?: Record<string, unknown>) => string }) {
  const cardIds = (data['cardIds'] as number[]) || [];
  const reversed = (data['reversed'] as boolean[]) || [];
  const spread = (data['spread'] as string) || '1-card';
  const displayCards = spread === 'celtic' ? cardIds.slice(0, 3) : cardIds;

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', marginBottom: '16px' }}>
        {spread === '1-card' ? 'ONE CARD' : spread === '3-card' ? 'THREE CARDS' : 'CELTIC CROSS'}
      </div>

      {displayCards.map((id, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', textAlign: 'left', padding: '0 8px' }}>
          <div style={{
            fontSize: '28px', flexShrink: 0, width: '36px', textAlign: 'center',
            transform: reversed[i] ? 'rotate(180deg)' : 'none',
          }}>
            {tarotSymbols[id] || '🃏'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
              {t(`tarot.cards.${id}.name`)}
              {reversed[i] && <span style={{ color: '#e74c3c', fontSize: '10px', marginLeft: '6px' }}>{t('tarot.reversed')}</span>}
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)' }}>
              {truncate(reversed[i] ? t(`tarot.cards.${id}.reversed`) : t(`tarot.cards.${id}.upright`), 60)}
            </div>
          </div>
        </div>
      ))}

      {spread === 'celtic' && cardIds.length > 3 && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>+{cardIds.length - 3} more cards</div>
      )}

      {/* Story summary */}
      <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: '8px' }}>
        <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(212,175,55,0.7)', fontStyle: 'italic' }}>
          {cardIds.length === 1
            ? t('tarot.summary1', { name: t(`tarot.cards.${cardIds[0]}.name`) })
            : t('tarot.summary3')}
        </div>
      </div>
    </div>
  );
}

function HoroscopeContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  const sign = data['sign'] as string || '';
  const moonEmoji = data['moonEmoji'] as string || '🌙';
  const moonPhase = data['moonPhase'] as string || '';
  const oracle = data['oracle'] as string || '';

  const symbols: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
    libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '48px', marginBottom: '6px' }}>{symbols[sign] || '⭐'}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#c39bd3', marginBottom: '2px' }}>
        {sign ? t(`horoscope.${sign}`) : ''}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
        {moonEmoji} {moonPhase}
      </div>

      {/* Oracle interpretation */}
      {oracle && (
        <div style={{ padding: '12px 16px', background: 'rgba(155,89,182,0.08)', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
            "{oracle}"
          </div>
        </div>
      )}
    </div>
  );
}

function SajuContent({ data, t, hideBirth }: { data: Record<string, unknown>; t: (k: string) => string; hideBirth?: boolean }) {
  void t;
  const pillars = (data['pillars'] as string[]) || [];
  const dayMaster = data['dayMaster'] as string || '';
  const dayMasterEmoji = data['dayMasterEmoji'] as string || '';
  const dayMasterElement = data['dayMasterElement'] as string || '';
  const labels = ['年', '月', '日', '時'];

  const elementDescriptions: Record<string, string> = {
    '木': '성장과 확장의 기운이 지배합니다',
    '火': '열정과 변화의 기운이 타오릅니다',
    '土': '안정과 포용의 기운이 감쌉니다',
    '金': '결단과 정의의 기운이 빛납니다',
    '水': '지혜와 흐름의 기운이 흐릅니다',
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', marginBottom: '16px' }}>四柱八字</div>

      {!hideBirth && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              padding: '10px 14px', background: 'rgba(231,76,60,0.08)',
              border: '1px solid rgba(231,76,60,0.15)', borderRadius: '8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>{labels[i]}</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{p}</div>
            </div>
          ))}
        </div>
      )}

      {dayMaster && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{dayMasterEmoji}</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1948a' }}>{dayMaster}</div>
        </div>
      )}

      {/* Interpretation */}
      {dayMasterElement && (
        <div style={{ padding: '10px 14px', background: 'rgba(231,76,60,0.08)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            {elementDescriptions[dayMasterElement] || ''}
          </div>
        </div>
      )}
    </div>
  );
}

function OmikujiContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  const rankKanji = data['rankKanji'] as string || '';
  const rank = data['rank'] as string || '';
  const wakaKo = data['wakaKo'] as string || '';
  const question = data['question'] as string || '';

  const rankColors: Record<string, string> = {
    daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
    suekichi: '#999', kyo: '#666', daikyo: '#444',
  };

  // Waka meaning from i18n
  const meaning = rank ? t(`waka.${rank}.meaning`) : '';

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', marginBottom: '14px' }}>おみくじ</div>

      <div style={{ fontSize: '48px', fontWeight: 700, color: rankColors[rank] || '#c39bd3', marginBottom: '8px' }}>
        {rankKanji}
      </div>

      {/* Wish */}
      {question && (
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontStyle: 'italic' }}>
          소원: "{truncate(question, 40)}"
        </div>
      )}

      {/* Waka translation */}
      {wakaKo && (
        <div style={{ fontSize: '12px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontStyle: 'italic', padding: '0 8px' }}>
          {wakaKo}
        </div>
      )}

      {/* Meaning / interpretation */}
      {meaning && (
        <div style={{ padding: '10px 14px', background: 'rgba(231,76,60,0.08)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)' }}>
            {meaning}
          </div>
        </div>
      )}
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}
