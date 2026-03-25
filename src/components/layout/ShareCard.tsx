import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import type { HistoryEntry } from '../../logic/historyEngine';
import { tarotSymbols } from '@fate0/shared';

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

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
  const accent = isWest ? '#c39bd3' : '#f1948a';
  const gold = '#d4af37';

  return (
    <div ref={ref} style={{
      width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px`,
      background: bg,
      fontFamily: "'Noto Serif KR', serif",
      color: '#e0d0f0',
      display: 'flex', flexDirection: 'column',
      padding: '32px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', color: gold, fontSize: '14px', opacity: 0.3 }}>✦</div>
      <div style={{ position: 'absolute', top: '16px', right: '16px', color: gold, fontSize: '14px', opacity: 0.3 }}>✦</div>
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: gold, fontSize: '14px', opacity: 0.3 }}>✦</div>
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', color: gold, fontSize: '14px', opacity: 0.3 }}>✦</div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '4px' }}>
          ✦ FATE 0:00 ✦
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
          {dateStr}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}40, transparent)`, marginBottom: '20px' }} />

      {/* Content — type-specific */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {entry.type === 'tarot' && <TarotContent data={data} t={t} />}
        {entry.type === 'horoscope' && <HoroscopeContent data={data} t={t} accent={accent} />}
        {entry.type === 'saju' && <SajuContent data={data} t={t} hideBirth={hideBirth} />}
        {entry.type === 'omikuji' && <OmikujiContent data={data} t={t} />}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${gold}40, transparent)`, marginTop: '20px' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {profile?.name && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
            {profile.name}님의 운세
          </div>
        )}
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', marginTop: '4px' }}>
          운명 0시 · fate0-00.vercel.app
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;

// === Type-specific content ===

function TarotContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  const cardIds = (data['cardIds'] as number[]) || [];
  const reversed = (data['reversed'] as boolean[]) || [];
  const spread = (data['spread'] as string) || '1-card';
  const displayCards = spread === 'celtic' ? cardIds.slice(0, 3) : cardIds;

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', marginBottom: '20px' }}>
        {spread === '1-card' ? 'ONE CARD' : spread === '3-card' ? 'THREE CARDS' : 'CELTIC CROSS'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {displayCards.map((id, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px', marginBottom: '6px',
              transform: reversed[i] ? 'rotate(180deg)' : 'none',
              display: 'inline-block',
            }}>
              {tarotSymbols[id] || '🃏'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{t(`tarot.cards.${id}.name`)}</div>
            {reversed[i] && <div style={{ fontSize: '10px', color: '#e74c3c' }}>{t('tarot.reversed')}</div>}
          </div>
        ))}
      </div>
      {spread === 'celtic' && cardIds.length > 3 && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>+{cardIds.length - 3} more cards</div>
      )}
    </div>
  );
}

function HoroscopeContent({ data, t, accent }: { data: Record<string, unknown>; t: (k: string) => string; accent: string }) {
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
      <div style={{ fontSize: '56px', marginBottom: '8px' }}>{symbols[sign] || '⭐'}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: accent, marginBottom: '4px' }}>
        {sign ? t(`horoscope.${sign}`) : ''}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
        {moonEmoji} {moonPhase}
      </div>
      {oracle && (
        <div style={{ fontSize: '13px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', padding: '0 12px' }}>
          "{oracle}"
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
  const labels = ['年', '月', '日', '時'];

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', marginBottom: '20px' }}>
        四柱八字
      </div>
      {!hideBirth && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              background: 'rgba(231,76,60,0.1)',
              border: '1px solid rgba(231,76,60,0.2)',
              borderRadius: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{labels[i]}</div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{p}</div>
            </div>
          ))}
        </div>
      )}
      {dayMaster && (
        <div>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>{dayMasterEmoji}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1948a' }}>{dayMaster}</div>
        </div>
      )}
    </div>
  );
}

function OmikujiContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  void t;
  const rankKanji = data['rankKanji'] as string || '';
  const rank = data['rank'] as string || '';
  const wakaJa = data['wakaJa'] as string || '';
  const wakaKo = data['wakaKo'] as string || '';

  const rankColors: Record<string, string> = {
    daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
    suekichi: '#999', kyo: '#666', daikyo: '#444',
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', marginBottom: '16px' }}>
        おみくじ
      </div>
      <div style={{ fontSize: '56px', fontWeight: 700, color: rankColors[rank] || '#c39bd3', marginBottom: '12px' }}>
        {rankKanji}
      </div>
      {wakaJa && (
        <div style={{ fontSize: '12px', lineHeight: '1.8', color: 'rgba(255,255,255,0.4)', whiteSpace: 'pre-line', marginBottom: '12px' }}>
          {wakaJa}
        </div>
      )}
      {wakaKo && (
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
          {wakaKo}
        </div>
      )}
    </div>
  );
}
