import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import type { HistoryEntry } from '../../logic/historyEngine';
import { tarotSymbols } from '@fate0/shared';

const CARD_WIDTH = 540;
const CARD_HEIGHT = 900;

interface Props {
  entry: HistoryEntry;
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ entry }, ref) => {
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
      padding: '24px 22px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative corners */}
      <Corner pos="top:12px;left:12px" /><Corner pos="top:12px;right:12px" />
      <Corner pos="bottom:12px;left:12px" /><Corner pos="bottom:12px;right:12px" />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '4px' }}>✦ FATE 0:00 ✦</div>
        <div style={{ fontSize: '10px', color: `${gold}80`, marginTop: '3px', fontStyle: 'italic' }}>{t('share.catchphrase')}</div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>{dateStr} · {profile?.name || ''}</div>
      </div>

      <Divider color={gold} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {entry.type === 'tarot' && <TarotContent data={data} t={t} />}
        {entry.type === 'horoscope' && <HoroscopeContent data={data} t={t} />}
        {entry.type === 'saju' && <SajuContent data={data} t={t} />}
        {entry.type === 'omikuji' && <OmikujiContent data={data} t={t} />}
      </div>

      <Divider color={gold} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {profile?.name && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>{t('share.userFortune', { name: profile.name })}</div>}
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.1)', letterSpacing: '2px', marginTop: '2px' }}>운명 0시 · fate0-00.vercel.app</div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
export default ShareCard;

function Corner({ pos }: { pos: string }) {
  const style = Object.fromEntries(pos.split(';').map(p => p.split(':'))) as React.CSSProperties;
  return <div style={{ position: 'absolute', ...style, color: '#d4af37', fontSize: '11px', opacity: 0.2 }}>✦</div>;
}

function Divider({ color }: { color: string }) {
  return <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${color}25, transparent)`, margin: '6px 0' }} />;
}

function SectionBox({ children, color = 'rgba(212,175,55,0.08)' }: { children: React.ReactNode; color?: string }) {
  return <div style={{ padding: '10px 14px', background: color, borderRadius: '8px', width: '100%' }}>{children}</div>;
}

// ========================
// TAROT
// ========================
function TarotContent({ data, t }: { data: Record<string, unknown>; t: (k: string, o?: Record<string, unknown>) => string }) {
  const cardIds = (data['cardIds'] as number[]) || [];
  const reversed = (data['reversed'] as boolean[]) || [];
  const spread = (data['spread'] as string) || '1-card';
  const question = (data['question'] as string) || '';
  const adviceId = data['adviceId'] as number | undefined;
  const adviceReversed = data['adviceReversed'] as boolean | undefined;
  const displayCards = spread === 'celtic' ? cardIds.slice(0, 3) : cardIds;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', textAlign: 'center', marginBottom: '10px' }}>
        {spread === '1-card' ? 'ONE CARD' : spread === '3-card' ? 'THREE CARDS' : 'CELTIC CROSS'}
      </div>

      {question && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: '12px' }}>
          "{truncate(question, 50)}"
        </div>
      )}

      {displayCards.map((id, i) => (
        <div key={i} style={{ marginBottom: '10px', padding: '10px 12px', background: 'rgba(155,89,182,0.06)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ fontSize: '24px', flexShrink: 0, width: '30px', textAlign: 'center', transform: reversed[i] ? 'rotate(180deg)' : 'none' }}>
              {tarotSymbols[id] || '🃏'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>
                {t(`tarot.cards.${id}.name`)}
                {reversed[i] && <span style={{ color: '#e74c3c', fontSize: '9px', marginLeft: '4px' }}>{t('tarot.reversed')}</span>}
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.6)', marginTop: '1px' }}>
                ✦ {t(`tarot.deep.${id}.archetype`)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.5', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
            {truncate(reversed[i] ? t(`tarot.cards.${id}.reversed`) : t(`tarot.cards.${id}.upright`), 100)}
          </div>
          <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(212,175,55,0.45)', marginTop: '6px', fontStyle: 'italic', borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '6px' }}>
            {truncate(t(`tarot.deep.${id}.context`), 80)}
          </div>
        </div>
      ))}

      {spread === 'celtic' && cardIds.length > 3 && (
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: '8px' }}>+{cardIds.length - 3} more cards</div>
      )}

      {/* Flow narrative */}
      <SectionBox>
        <div style={{ fontSize: '9px', color: 'rgba(212,175,55,0.5)', marginBottom: '4px', textAlign: 'center', letterSpacing: '1px' }}>
          ✦ {t('tarot.flowLabel')}
        </div>
        <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(212,175,55,0.65)', fontStyle: 'italic', textAlign: 'center' }}>
          {cardIds.length === 1
            ? t('tarot.flowSingle', { card: t(`tarot.cards.${cardIds[0]}.name`) })
            : cardIds.length >= 3
              ? t('tarot.flowPastToFuture', {
                  past: t(`tarot.cards.${cardIds[0]}.name`),
                  present: t(`tarot.cards.${cardIds[1]}.name`),
                  future: t(`tarot.cards.${cardIds[2]}.name`),
                })
              : t('tarot.summary3')
          }
        </div>
      </SectionBox>

      {/* Advice card */}
      {adviceId !== undefined && (
        <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ fontSize: '20px', flexShrink: 0, width: '26px', textAlign: 'center', transform: adviceReversed ? 'rotate(180deg)' : 'none' }}>
            {tarotSymbols[adviceId] || '🃏'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.6)', marginBottom: '2px' }}>✦ {t('tarot.adviceCard')}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '2px' }}>
              {t(`tarot.cards.${adviceId}.name`)}
              {adviceReversed && <span style={{ color: '#e74c3c', fontSize: '9px', marginLeft: '4px' }}>{t('tarot.reversed')}</span>}
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)' }}>
              {truncate(adviceReversed ? t(`tarot.cards.${adviceId}.reversed`) : t(`tarot.cards.${adviceId}.upright`), 80)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================
// HOROSCOPE
// ========================
function HoroscopeContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  const sign = data['sign'] as string || '';
  const moonEmoji = data['moonEmoji'] as string || '🌙';
  const moonPhase = data['moonPhase'] as string || '';
  const oracle = data['oracle'] as string || '';
  const resonance = data['resonance'] as string || 'neutral';

  const symbols: Record<string, string> = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
    libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '44px', marginBottom: '4px' }}>{symbols[sign] || '⭐'}</div>
      <div style={{ fontSize: '17px', fontWeight: 700, color: '#c39bd3', marginBottom: '2px' }}>
        {sign ? t(`horoscope.${sign}`) : ''} · {sign ? t(`signContext.${sign}.element`) : ''}
      </div>

      {/* Sign personality trait */}
      {sign && (
        <div style={{ margin: '10px 0', padding: '10px 14px', background: 'rgba(155,89,182,0.08)', borderRadius: '8px', textAlign: 'left' }}>
          <div style={{ fontSize: '9px', color: '#c39bd3', marginBottom: '4px', fontWeight: 700, letterSpacing: '1px' }}>
            {symbols[sign]} {t('signContext.title')}
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(255,255,255,0.55)' }}>
            {truncate(t(`signContext.${sign}.trait`), 120)}
          </div>
        </div>
      )}

      {/* Moon phase + resonance */}
      <div style={{ margin: '8px 0', padding: '8px 14px', background: resonance === 'aligned' ? 'rgba(255,215,0,0.06)' : 'rgba(155,89,182,0.06)', borderRadius: '8px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
          {moonEmoji} {moonPhase}
        </div>
        <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
          {t(`signContext.resonanceDeep.${resonance}`)}
        </div>
      </div>

      {/* Oracle message */}
      {oracle && (
        <SectionBox color="rgba(155,89,182,0.08)">
          <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', textAlign: 'center' }}>
            "{truncate(oracle, 100)}"
          </div>
        </SectionBox>
      )}
    </div>
  );
}

// ========================
// SAJU
// ========================
function SajuContent({ data, t }: { data: Record<string, unknown>; t: (k: string, o?: Record<string, unknown>) => string }) {
  const pillars = (data['pillars'] as string[]) || [];
  const dayMaster = data['dayMaster'] as string || '';
  const dayMasterEmoji = data['dayMasterEmoji'] as string || '';
  const birthInfo = data['birthInfo'] as string || '';
  const elements = data['elements'] as { dominant: string; deficient: string } | null;
  const dailyPillar = data['dailyPillar'] as string || '';
  const dailyAdvice = data['dailyAdvice'] as string || '';
  const labels = ['年', '月', '日', '時'];
  // Extract day stem from pillar (e.g., "壬午" → "壬")
  const dayStem = pillars[2]?.[0] || '';

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '6px' }}>四柱八字</div>

      {birthInfo && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>{birthInfo}</div>}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
        {pillars.map((p, i) => (
          <div key={i} style={{
            padding: '8px 12px', background: 'rgba(231,76,60,0.06)',
            border: '1px solid rgba(231,76,60,0.12)', borderRadius: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', marginBottom: '2px' }}>{labels[i]}</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{p}</div>
          </div>
        ))}
      </div>

      {dayMaster && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '22px', marginBottom: '2px' }}>{dayMasterEmoji}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1948a' }}>{dayMaster}</div>
        </div>
      )}

      {/* Day Master deep profile */}
      {dayStem && (
        <div style={{ margin: '8px 0', padding: '10px 14px', background: 'rgba(231,76,60,0.06)', borderRadius: '8px', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            {truncate(t(`dayMaster.${dayStem}.desc`), 100)}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
            ✦ {t(`dayMaster.${dayStem}.direction`)}
          </div>
        </div>
      )}

      {/* Element balance deep interpretation */}
      {elements && (
        <div style={{ margin: '8px 0', padding: '8px 14px', background: 'rgba(231,76,60,0.04)', borderRadius: '8px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '1px' }}>
            ✦ {t('elementDeep.balanceTitle')}
          </div>
          <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
            {truncate(t(`elementDeep.excess.${elements.dominant}`), 80)}
          </div>
          <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)' }}>
            {truncate(t(`elementDeep.deficient.${elements.deficient}`), 80)}
          </div>
        </div>
      )}

      {/* Daily fortune */}
      {dailyPillar && (
        <div style={{ marginTop: '6px', padding: '8px 12px', background: 'rgba(212,175,55,0.06)', borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.5)', marginBottom: '4px' }}>{t('sajuDaily.title')}: {dailyPillar}</div>
          {dailyAdvice && <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(255,255,255,0.4)' }}>{truncate(dailyAdvice, 80)}</div>}
        </div>
      )}
    </div>
  );
}

// ========================
// OMIKUJI
// ========================
function OmikujiContent({ data, t }: { data: Record<string, unknown>; t: (k: string) => string }) {
  const rankKanji = data['rankKanji'] as string || '';
  const rank = data['rank'] as string || '';
  const wakaKo = data['wakaKo'] as string || '';
  const question = data['question'] as string || '';
  const wish = data['wish'] as string || '';
  const love = data['love'] as string || '';
  const travel = data['travel'] as string || '';
  const health = data['health'] as string || '';

  const rankColors: Record<string, string> = {
    daikichi: '#ffd700', kichi: '#ffd700', chukichi: '#c39bd3', shokichi: '#c39bd3',
    suekichi: '#999', kyo: '#666', daikyo: '#444',
  };

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '3px', marginBottom: '10px' }}>おみくじ</div>

      <div style={{ fontSize: '44px', fontWeight: 700, color: rankColors[rank] || '#c39bd3', marginBottom: '6px' }}>{rankKanji}</div>

      {question && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', fontStyle: 'italic' }}>
          {t('omikuji.questionLabel')}: "{truncate(question, 35)}"
        </div>
      )}

      {wakaKo && (
        <div style={{ fontSize: '11px', lineHeight: '1.6', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', fontStyle: 'italic', padding: '0 8px' }}>
          {wakaKo}
        </div>
      )}

      {/* Rank guide — meaning + advice */}
      {rank && (
        <div style={{ margin: '8px 0', padding: '10px 14px', background: 'rgba(231,76,60,0.06)', borderRadius: '8px' }}>
          <div style={{ fontSize: '9px', color: rankColors[rank] || '#c39bd3', marginBottom: '4px', fontWeight: 700, letterSpacing: '1px' }}>
            ✦ {t('rankGuide.title')}
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            {t(`rankGuide.${rank}.meaning`)}
          </div>
          <div style={{ fontSize: '9px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', borderTop: '1px solid rgba(231,76,60,0.1)', paddingTop: '6px' }}>
            {truncate(t(`rankGuide.${rank}.advice`), 100)}
          </div>
        </div>
      )}

      {/* Detail items */}
      {(wish || love || travel || health) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.35)', textAlign: 'left', padding: '0 8px' }}>
          {wish && <div>🙏 {truncate(wish, 25)}</div>}
          {love && <div>💕 {truncate(love, 25)}</div>}
          {travel && <div>✈️ {truncate(travel, 25)}</div>}
          {health && <div>💪 {truncate(health, 25)}</div>}
        </div>
      )}
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}
