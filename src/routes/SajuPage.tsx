import { useState, useEffect, useRef } from 'react';
import PageShell from '../components/layout/PageShell';
import { playBgm } from '../logic/bgmEngine';
import { getSajuReading } from '../logic/sajuEngine';
import { getDayMasterProfile, analyzeElements, calculateDaeun, elementColors, elementEmojis, elementNames } from '../logic/sajuDeepEngine';
import type { SajuReading, FiveElement } from '../types/fortune';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sfxPillarDrop, sfxElementReveal, sfxBarRise, sfxDaeunTimeline, sfxButtonClick, sfxReadingReveal } from '../logic/soundEngine';
import { useProfile } from '../context/ProfileContext';
import { getDailyFortune } from '../logic/dailySajuEngine';
import ShareButton from '../components/layout/ShareButton';
import Watermark from '../components/layout/Watermark';
import { addHistory } from '../logic/historyEngine';
import { getMaxDays } from '../logic/dateUtils';
import { hasUsedToday, markUsedToday } from '../logic/dailyLimitEngine';
import { Link } from 'react-router-dom';
import ReverseFateScreen from '../components/layout/ReverseFateScreen';
import { canReverse, getReverseRemaining } from '../logic/reverseEngine';

type Step = 'input' | 'extract' | 'daymaster' | 'landscape' | 'daeun' | 'daily';

export default function SajuPage() {
  const { t } = useTranslation();
  useEffect(() => { playBgm('saju'); }, []);
  const { profile } = useProfile();
  const [limitReached, setLimitReached] = useState(hasUsedToday('saju'));
  const [showReverse, setShowReverse] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [year, setYear] = useState(profile?.birthYear || 2000);
  const [month, setMonth] = useState(profile?.birthMonth || 1);
  const [day, setDay] = useState(profile?.birthDay || 1);
  const [hour, setHour] = useState(profile?.birthHour || 12);
  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [isLunar, setIsLunar] = useState(profile?.isLunar || false);
  const [reading, setReading] = useState<SajuReading | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const maxDays = getMaxDays(year, month);
  if (day > maxDays) setDay(maxDays);

  const handleSubmit = () => {
    const r = getSajuReading(year, month, day, hour, isLunar);
    setReading(r);
    setStep('extract');
  };

  const dayMaster = reading ? getDayMasterProfile(reading.pillars[2].stem) : null;
  const landscape = reading ? analyzeElements(
    reading.pillars.map(p => p.stem),
    reading.pillars.map(p => p.branch)
  ) : null;

  const yearStemIdx = (year - 4) % 10;
  const monthBranchIdx = (month + 1) % 12;
  const daeunPeriods = reading ? calculateDaeun(yearStemIdx, monthBranchIdx, gender) : [];
  const currentAge = new Date().getFullYear() - year;

  // Sound effects on step changes
  useEffect(() => {
    if (step === 'extract' && reading) {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => sfxPillarDrop(i), i * 300);
      }
    }
  }, [step]);

  useEffect(() => {
    if (step === 'daymaster' && reading) {
      sfxElementReveal(reading.pillars[2].element);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'landscape') {
      sfxBarRise();
    }
  }, [step]);

  useEffect(() => {
    if (step === 'daeun') {
      sfxDaeunTimeline();
    }
  }, [step]);

  const selStyle = {
    padding: '10px 14px', background: 'rgba(231,76,60,0.15)',
    border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px',
    color: '#f5d5d5', fontSize: '16px', fontFamily: "'Noto Serif KR', serif",
  };

  return (
    <PageShell theme="east" title={t('saju.title')} pattern="saju">
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

        {/* INPUT */}
        {step === 'input' && !limitReached && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('saju.inputDesc')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: t('saju.year'), value: year, setter: setYear, options: Array.from({ length: 80 }, (_, i) => ({ v: 1950 + i, l: `${1950 + i}` })) },
                { label: t('saju.month'), value: month, setter: setMonth, options: Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: `${i + 1}` })) },
                { label: t('saju.day'), value: day, setter: setDay, options: Array.from({ length: maxDays }, (_, i) => ({ v: i + 1, l: `${i + 1}` })) },
                { label: t('saju.hour'), value: hour, setter: setHour, options: Array.from({ length: 24 }, (_, i) => ({ v: i, l: `${i}` })) },
              ].map(({ label, value, setter, options }) => (
                <div key={label}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</label>
                  <select value={value} onChange={e => setter(+e.target.value)} style={{ ...selStyle, width: '100%' }}>
                    {options.map(o => <option key={o.v} value={o.v} style={{ background: '#2e0a0a' }}>{o.l}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsLunar(!isLunar)}
                style={{ ...selStyle, cursor: 'pointer', background: isLunar ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.05)' }}>
                {isLunar ? t('saju.lunar') : t('saju.solar')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setGender(g => g === 'male' ? 'female' : 'male')}
                style={{ ...selStyle, cursor: 'pointer' }}>
                {gender === 'male' ? t('saju.male') : t('saju.female')}
              </motion.button>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); handleSubmit(); }}
              style={{ width: '100%', padding: '16px', background: 'rgba(231,76,60,0.3)', border: '1px solid rgba(231,76,60,0.5)', borderRadius: '12px', fontSize: '18px', color: '#f5d5d5' }}>
              {t('saju.extractButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 1: EXTRACT — The 8 characters */}
        {step === 'extract' && reading && (
          <motion.div key="extract" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('saju.step1')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {t('saju.step1Desc')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {reading.pillars.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3 }}
                  style={{
                    background: i === 2 ? 'rgba(212,175,55,0.15)' : 'rgba(231,76,60,0.15)',
                    border: `2px solid ${i === 2 ? 'rgba(212,175,55,0.5)' : 'rgba(231,76,60,0.3)'}`,
                    borderRadius: '12px', padding: '16px 12px', textAlign: 'center', width: '80px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{p.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: elementColors[p.element] }}>{p.stem}</div>
                  <div style={{ fontSize: '28px', marginTop: '4px' }}>{p.branch}</div>
                  <div style={{ fontSize: '11px', color: elementColors[p.element], marginTop: '8px' }}>
                    {elementEmojis[p.element]} {t(`saju.element.${p.element}`)}
                  </div>
                  {i === 2 && <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', marginTop: '4px' }}>{t('saju.dayMasterLabel')}</div>}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(231,76,60,0.5)', marginBottom: '24px' }}
            >
              {year}.{month}.{day} {hour}:00 | {isLunar ? '음력' : '양력'} | {gender === 'male' ? '남' : '여'}
            </motion.div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); setStep('daymaster'); }}
              style={{ padding: '14px 40px', background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('saju.toCoreButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: DAY MASTER */}
        {step === 'daymaster' && reading && dayMaster && (
          <motion.div key="dm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('saju.step2')}
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ marginBottom: '20px' }}
            >
              <div style={{ fontSize: '80px', marginBottom: '8px' }}>{dayMaster.emoji}</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: elementColors[dayMaster.element] }}>{dayMaster.stem}</div>
              <div style={{ fontSize: '18px', color: 'var(--accent-light)', marginTop: '4px' }}>{t(`dayMaster.${dayMaster.stem}.title`)}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {elementEmojis[dayMaster.element]} {t(`saju.element.${dayMaster.element}`)} · {dayMaster.nature === '양' ? t('saju.yang') : t('saju.yin')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px',
                fontSize: '15px', lineHeight: '2', textAlign: 'left', marginBottom: '24px',
              }}
            >
              {t(`dayMaster.${dayMaster.stem}.desc`)}
            </motion.div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); setStep('landscape'); }}
              style={{ padding: '14px 40px', background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('saju.toLandscapeButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: ELEMENT LANDSCAPE */}
        {step === 'landscape' && reading && landscape && (
          <motion.div key="land" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('saju.step3')}
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', height: '180px', marginBottom: '24px' }}>
              {(Object.entries(landscape.counts) as [FiveElement, number][]).map(([el, count]) => (
                <div key={el} style={{ textAlign: 'center', width: '50px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(count * 30, 20)}px` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                      background: `linear-gradient(to top, ${elementColors[el]}40, ${elementColors[el]})`,
                      borderRadius: '8px 8px 0 0',
                      width: '100%',
                      border: el === landscape.dominant ? `2px solid ${elementColors[el]}` : 'none',
                    }}
                  />
                  <div style={{ fontSize: '20px', marginTop: '8px' }}>{elementEmojis[el]}</div>
                  <div style={{ fontSize: '13px', color: elementColors[el] }}>{t(`saju.element.${el}`)}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{count}</div>
                </div>
              ))}
            </div>

            {/* Dominant / Deficient */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '8px 16px', background: `${elementColors[landscape.dominant]}20`, border: `1px solid ${elementColors[landscape.dominant]}50`, borderRadius: '20px', fontSize: '13px' }}>
                {t('saju.excess')} {elementEmojis[landscape.dominant]} {t(`saju.element.${landscape.dominant}`)}({landscape.dominant})
              </div>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '13px' }}>
                {t('saju.deficient')} {elementEmojis[landscape.deficient]} {t(`saju.element.${landscape.deficient}`)}({landscape.deficient})
              </div>
            </div>

            {/* Analysis */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', fontSize: '14px', lineHeight: '1.8', textAlign: 'left', marginBottom: '24px' }}>
              {t(landscape.analysis)}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.7', fontStyle: 'italic' }}>
              {t('saju.landscapeQuote')}
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); setStep('daeun'); }}
              style={{ padding: '14px 40px', background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('saju.toDaeunButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 4: DAEUN — Major Fortune Timeline */}
        {step === 'daeun' && reading && (
          <motion.div key="daeun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '550px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('saju.step4')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {t('saju.step4Desc')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {daeunPeriods.map((period, i) => {
                const isCurrent = currentAge >= period.startAge && currentAge <= period.endAge;
                const interColor = period.interaction === 'harmony' ? '#2ecc71' : period.interaction === 'clash' ? '#e74c3c' : '#888';

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: isCurrent ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isCurrent ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '10px', padding: '12px 16px', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', width: '70px', flexShrink: 0 }}>
                      {period.startAge}~{period.endAge}{t('saju.age')}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: elementColors[period.element], width: '50px', textAlign: 'center' }}>
                      {period.stem}{period.branch}
                    </div>
                    <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: `${interColor}20`, color: interColor, border: `1px solid ${interColor}40`, flexShrink: 0 }}>
                      {period.interaction === 'harmony' ? t('saju.harmony') : period.interaction === 'clash' ? t('saju.clash') : t('saju.neutral')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', flex: 1 }}>
                      {t(period.description, { stem: period.stem, branch: period.branch })}
                    </div>
                    {isCurrent && <div style={{ fontSize: '10px', color: '#ffd700', flexShrink: 0 }}>{t('saju.current')}</div>}
                  </motion.div>
                );
              })}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '24px' }}>
              {t('saju.daeunQuote')}
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); addHistory({ type: 'saju', summary: '', data: { pillars: reading.pillars.map(p => p.stem + p.branch) } }); markUsedToday('saju'); setLimitReached(true); setStep('daily'); }}
              style={{ padding: '14px 40px', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('saju.toDailyButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 5: DAILY FORTUNE — Today's Ilchin */}
        {step === 'daily' && reading && dayMaster && (() => {
          const daily = getDailyFortune(dayMaster.element);
          const interColor = daily.overallScore >= 4 ? '#2ecc71' : daily.overallScore >= 3 ? '#f39c12' : '#e74c3c';
          const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

          return (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
                {t('saju.step5')}
              </div>

              <div ref={resultRef}>
              {/* Today's pillar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('sajuDaily.todayPillar')} · {daily.dateStr}</div>
                <div style={{ display: 'inline-flex', gap: '4px', padding: '12px 24px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, color: elementColors[daily.todayPillar.element] }}>{daily.todayPillar.stem}</span>
                  <span style={{ fontSize: '32px' }}>{daily.todayPillar.branch}</span>
                </div>
                <div style={{ fontSize: '12px', color: elementColors[daily.todayPillar.element], marginTop: '4px' }}>
                  {elementEmojis[daily.todayPillar.element]} {t(`saju.element.${daily.todayPillar.element}`)}
                </div>
              </div>

              {/* Interaction */}
              <div style={{ background: `${interColor}15`, border: `1px solid ${interColor}40`, borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.8' }}>
                <div style={{ fontSize: '12px', color: interColor, marginBottom: '6px', fontWeight: 700 }}>
                  {dayMaster.stem}({t(`saju.element.${dayMaster.element}`)}) × {daily.todayPillar.stem}({t(`saju.element.${daily.todayPillar.element}`)})
                </div>
                {t(`sajuDaily.interaction.${daily.interaction}`)}
              </div>

              {/* Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                {[
                  { key: 'overall', score: daily.overallScore },
                  { key: 'career', score: daily.categories.career },
                  { key: 'love', score: daily.categories.love },
                  { key: 'health', score: daily.categories.health },
                  { key: 'wealth', score: daily.categories.wealth },
                ].map(({ key, score }) => (
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px',
                    gridColumn: key === 'overall' ? '1 / -1' : undefined,
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {t(`sajuDaily.${key}`)}
                    </div>
                    <div style={{ fontSize: key === 'overall' ? '18px' : '14px', color: score >= 4 ? '#ffd700' : score >= 3 ? '#f39c12' : '#e74c3c' }}>
                      {stars(score)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.8', textAlign: 'left' }}>
                {t(daily.adviceKey)}
              </div>
              <Watermark />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { sfxButtonClick(); setStep('input'); setReading(null); }}
                  style={{ padding: '14px 32px', background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '12px', fontSize: '14px', color: '#f5d5d5' }}>
                  {t('saju.newExtract')}
                </motion.button>
                <ShareButton targetRef={resultRef} theme="east" />
              </div>
            </motion.div>
          );
        })()}

      </AnimatePresence>
      {showReverse && (
        <ReverseFateScreen
          fortuneType="saju"
          onComplete={() => { setShowReverse(false); setLimitReached(false); }}
          onCancel={() => setShowReverse(false)}
        />
      )}
    </PageShell>
  );
}
