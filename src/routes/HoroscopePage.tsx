import { useState, useEffect, useRef } from 'react';
import PageShell from '../components/layout/PageShell';
import { playBgm } from '../logic/bgmEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getSunSign, getLunarZodiac, getMoonPhase, getMoonEmoji, getMoonPhaseName, getResonance } from '@fate0/shared';
// Oracle message now generated from i18n keys
import type { ZodiacSign } from '@fate0/shared';
import { sfxSync, sfxConstellationAppear, sfxResonance, sfxOracleComplete, sfxButtonClick, sfxTextInput } from '../logic/soundEngine';
import { useProfile } from '../context/ProfileContext';
import ShareButton from '../components/layout/ShareButton';
import Watermark from '../components/layout/Watermark';
import { addHistory } from '../logic/historyEngine';
import { hasUsedToday, markUsedToday } from '../logic/dailyLimitEngine';
import { Link } from 'react-router-dom';
import ReverseFateScreen from '../components/layout/ReverseFateScreen';
import { canReverse, getReverseRemaining } from '../logic/reverseEngine';
import { useSessionState } from '../hooks/useSessionState';

type Step = 'input' | 'sync' | 'transit' | 'oracle';

const symbols: Record<ZodiacSign, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export default function HoroscopePage() {
  const { t } = useTranslation();
  useEffect(() => { playBgm('horoscope'); }, []);
  const { profile } = useProfile();
  const [limitReached, setLimitReached] = useState(hasUsedToday('horoscope'));
  const [showReverse, setShowReverse] = useState(false);
  const [step, setStep] = useSessionState<Step>('horoscope_step', 'input');
  const [name, setName] = useState(profile?.name || '');
  const [birthMonth, setBirthMonth] = useState(profile?.birthMonth || 1);
  const [birthDay, setBirthDay] = useState(profile?.birthDay || 1);
  const [sunSign, setSunSign] = useState<ZodiacSign | null>(null);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const moonPhase = getMoonPhase(today);
  const moonSign = getLunarZodiac(today);
  const moonEmoji = getMoonEmoji(moonPhase);
  const resonance = sunSign ? getResonance(sunSign, moonSign) : 'neutral';

  // Moon orbit animation
  useEffect(() => {
    if (step !== 'transit') return;
    const timer = setInterval(() => setOrbitAngle(prev => (prev + 0.8) % 360), 30);
    return () => clearInterval(timer);
  }, [step]);

  // Sound: resonance on transit step
  useEffect(() => {
    if (step === 'transit' && sunSign) {
      sfxResonance(getResonance(sunSign, moonSign));
    }
  }, [step]);

  // Sound: oracle complete
  useEffect(() => {
    if (step === 'oracle') {
      sfxOracleComplete();
    }
  }, [step]);

  const handleSync = () => {
    sfxSync();
    const sign = getSunSign(birthMonth, birthDay);
    setSunSign(sign);
    setStep('sync');
    setTimeout(() => sfxConstellationAppear(), 500);
    setTimeout(() => setStep('transit'), 3000);
  };

  const seed = sunSign ? hashSeed(todayStr + sunSign) : 0;

  // Oracle from i18n
  const elementMap: Record<string, string> = { aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water', leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water', sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water' };
  const oracleAdj = sunSign ? t(`oracle.adjectives.${elementMap[sunSign]}.${seed % 3}`) : '';
  const oracleObj = sunSign ? t(`oracle.objects.${sunSign}`) : '';
  const oracleVerb = t(`oracle.verbs.${(seed + 2) % 7}`);
  const oracleResult = t(`oracle.results.${(seed + 3) % 5}`);
  const oracleMessage = sunSign ? t('oracle.template', { adj: oracleAdj, obj: oracleObj, verb: oracleVerb, result: oracleResult }) : '';

  const glowColor = resonance === 'aligned' ? '#ffd700' : resonance === 'approaching' ? '#9b59b6' : 'rgba(155,89,182,0.3)';

  return (
    <PageShell theme="west" title={t('horoscope.title')} pattern="horoscope">
      <AnimatePresence mode="wait">

        {/* DAILY LIMIT REACHED */}
        {step === 'input' && limitReached && (
          <motion.div key="limit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <div style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>{t('dailyLimit.used')}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('dailyLimit.resetAt')}</div>
              <Link to="/" style={{ color: 'var(--accent)', fontSize: '14px' }}>← {t('app.back')}</Link>
              {canReverse() && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReverse(true)}
                  style={{
                    display: 'block', margin: '16px auto 0', padding: '12px 28px', borderRadius: '12px',
                    background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)',
                    color: '#ffd700', fontSize: '14px',
                  }}>
                  <div style={{ fontWeight: 700 }}>{t('reverseFate.button')}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.7)', marginTop: '2px' }}>
                    {t('reverseFate.remaining', { count: getReverseRemaining() })}
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 1: INPUT — Birth data */}
        {step === 'input' && !limitReached && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('horoscope.step1')}
            </div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
            <div style={{ marginBottom: '16px' }}>
              <input type="text" value={name} onChange={e => { setName(e.target.value.slice(0, 50)); sfxTextInput(); }} maxLength={50} autoComplete="off"
                placeholder={t('horoscope.namePlaceholder')}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '10px', color: '#e8d5f5', fontSize: '16px', fontFamily: "'Noto Serif KR', serif", textAlign: 'center' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('horoscope.monthLabel')}</label>
                <select value={birthMonth} onChange={e => setBirthMonth(+e.target.value)}
                  style={{ display: 'block', padding: '10px 14px', background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '8px', color: '#e8d5f5', fontSize: '16px', fontFamily: "'Noto Serif KR', serif" }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} style={{ background: '#1a0a2e' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('horoscope.dayLabel')}</label>
                <select value={birthDay} onChange={e => setBirthDay(+e.target.value)}
                  style={{ display: 'block', padding: '10px 14px', background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '8px', color: '#e8d5f5', fontSize: '16px', fontFamily: "'Noto Serif KR', serif" }}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d} style={{ background: '#1a0a2e' }}>{d}</option>)}
                </select>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSync}
              disabled={!name.trim()}
              style={{ padding: '14px 40px', background: 'rgba(155,89,182,0.3)', border: '1px solid rgba(155,89,182,0.5)', borderRadius: '12px', fontSize: '16px', color: '#e8d5f5', opacity: name.trim() ? 1 : 0.4 }}>
              {t('horoscope.syncButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 1b: SYNC — constellation reveal */}
        {step === 'sync' && sunSign && (
          <motion.div key="sync" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ textShadow: ['0 0 20px rgba(155,89,182,0.3)', '0 0 60px rgba(155,89,182,0.8)', '0 0 20px rgba(155,89,182,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '100px', marginBottom: '20px' }}
            >
              {symbols[sunSign]}
            </motion.div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', fontFamily: "'Cinzel', serif" }}>
              {t(`horoscope.${sunSign}`)}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(155,89,182,0.7)', letterSpacing: '1px' }}
            >
              ID: {birthMonth}/{birthDay} — {name} — {t('horoscope.syncComplete')}
            </motion.div>
          </motion.div>
        )}

        {/* STEP 2: TRANSIT — Moon orbit visualization */}
        {step === 'transit' && sunSign && (
          <motion.div key="transit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('horoscope.step2')}
            </div>

            {/* Orbital visualization */}
            <div style={{ position: 'relative', width: '260px', height: '260px', margin: '0 auto 24px' }}>
              {/* Orbit path */}
              <div style={{
                position: 'absolute', inset: '10px', borderRadius: '50%',
                border: `1px dashed rgba(155,89,182,0.2)`,
              }} />
              {/* Sun sign (center) */}
              <motion.div
                animate={{ textShadow: [`0 0 20px ${glowColor}`, `0 0 50px ${glowColor}`, `0 0 20px ${glowColor}`] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '56px' }}
              >
                {symbols[sunSign]}
              </motion.div>
              {/* Moon (orbiting) */}
              <div style={{
                position: 'absolute',
                top: `${50 + 42 * Math.sin(orbitAngle * Math.PI / 180)}%`,
                left: `${50 + 42 * Math.cos(orbitAngle * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: '36px',
                filter: `drop-shadow(0 0 10px ${glowColor})`,
                transition: 'filter 0.5s',
              }}>
                {moonEmoji}
              </div>
              {/* Spark effect on alignment */}
              {resonance === 'aligned' && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position: 'absolute', inset: '-20px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
                  }}
                />
              )}
            </div>

            {/* Moon info */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {todayStr} · {t(`horoscope.moonPhase.${getMoonPhaseName(moonPhase)}`, { defaultValue: getMoonPhaseName(moonPhase) })}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('horoscope.moonPosition')} {symbols[moonSign]} {t(`horoscope.${moonSign}`)}
              </div>
            </div>

            {/* Resonance message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                background: resonance === 'aligned' ? 'rgba(255,215,0,0.1)' : 'rgba(155,89,182,0.1)',
                border: `1px solid ${resonance === 'aligned' ? 'rgba(255,215,0,0.3)' : 'rgba(155,89,182,0.3)'}`,
                borderRadius: '12px', padding: '16px', marginBottom: '24px',
                fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic',
              }}
            >
              {resonance === 'aligned' && t('horoscope.resonanceAligned')}
              {resonance === 'approaching' && t('horoscope.resonanceApproaching')}
              {resonance === 'neutral' && t('horoscope.resonanceNeutral')}
              {resonance === 'distant' && t('horoscope.resonanceDistant')}
            </motion.div>

            {/* Daily fortune from existing data */}
            <div style={{ marginBottom: '20px' }}>
              {['overall', 'love', 'career'].map((cat, ci) => {
                const count = cat === 'overall' ? 12 : 10;
                const idx = (seed + ci) % count;
                return (
                  <div key={cat} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px', marginBottom: '8px', textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', color: 'var(--accent-light)', marginBottom: '4px', fontWeight: 700 }}>
                      {t(`horoscope.${cat}`)}
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.7' }}>
                      {t(`horoscopeData.${cat}.${idx}`)}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>
                <span>{t('horoscope.luckyNumber')}: {(seed % 99) + 1}</span>
                <span>{t('horoscope.luckyColor')}: {t(`horoscopeData.colors.${seed % 10}`)}</span>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); addHistory({ type: 'horoscope', summary: '', data: { sign: sunSign, date: todayStr } }); markUsedToday('horoscope'); setLimitReached(true); setStep('oracle'); }}
              style={{ padding: '14px 40px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', fontSize: '16px', color: '#e8d5f5' }}>
              {t('horoscope.getOracle')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: ORACLE — Nebula message */}
        {step === 'oracle' && sunSign && oracleMessage && (
          <motion.div key="oracle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('horoscope.step3')}
            </div>

            <div ref={resultRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, rgba(20,10,40,0.9), rgba(40,15,60,0.9))',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px',
                padding: '40px 28px',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background glow */}
              <div style={{
                position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                background: 'radial-gradient(circle at 50% 50%, rgba(155,89,182,0.08) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />

              {/* Keyword fragments */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[oracleAdj, oracleObj, oracleVerb].map((word, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.3 }}
                    style={{
                      padding: '4px 12px', background: 'rgba(155,89,182,0.2)',
                      borderRadius: '20px', fontSize: '13px', color: 'var(--accent-light)',
                      border: '1px solid rgba(155,89,182,0.3)',
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* The oracle message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{
                  fontSize: '18px',
                  lineHeight: '2',
                  fontStyle: 'italic',
                  color: '#e8d5f5',
                  textShadow: '0 0 20px rgba(155,89,182,0.3)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                "{oracleMessage}"
              </motion.div>

              {/* Sign badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(212,175,55,0.6)', letterSpacing: '2px' }}
              >
                {symbols[sunSign]} {t(`horoscope.${sunSign}`)} · {name} · {todayStr}
              </motion.div>
            </motion.div>
            <Watermark />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { sfxButtonClick(); setStep('input'); setSunSign(null); setName(''); }}
                style={{ padding: '12px 32px', background: 'rgba(155,89,182,0.3)', border: '1px solid rgba(155,89,182,0.5)', borderRadius: '12px', fontSize: '16px', color: '#e8d5f5' }}>
                {t('horoscope.newReading')}
              </motion.button>
              <ShareButton targetRef={resultRef} theme="west" />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
      {showReverse && (
        <ReverseFateScreen
          fortuneType="horoscope"
          onComplete={() => { setShowReverse(false); setLimitReached(false); }}
          onCancel={() => setShowReverse(false)}
        />
      )}
    </PageShell>
  );
}
