import { useState, useEffect, useRef } from 'react';
import PageShell from '../components/layout/PageShell';
import { playBgm } from '../logic/bgmEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getWaka } from '@fate0/shared';
import { sfxWaterPour, sfxBow, sfxClap, sfxBell, sfxShakeSticks, sfxStickDrop, sfxPaperUnfold, sfxKoto, sfxRankReveal, sfxKeep, sfxTie, sfxButtonClick, sfxTextInput } from '../logic/soundEngine';
import ShareButton from '../components/layout/ShareButton';
import Watermark from '../components/layout/Watermark';
import { addHistory } from '../logic/historyEngine';
import { hasUsedToday, markUsedToday } from '../logic/dailyLimitEngine';
import { Link } from 'react-router-dom';
import ReverseFateScreen from '../components/layout/ReverseFateScreen';
import { canReverse, getReverseRemaining } from '../logic/reverseEngine';
import { useSessionState } from '../hooks/useSessionState';
import { getLatestEntry } from '../hooks/useLatestEntry';
import ProfileSuggestion from '../components/layout/ProfileSuggestion';
import FortuneMemo from '../components/layout/FortuneMemo';
import MysticDivider from '../components/layout/MysticDivider';

type Step = 'purify' | 'pray' | 'shake' | 'waka' | 'reading' | 'fate';

const ranks = ['daikichi', 'kichi', 'chukichi', 'shokichi', 'suekichi', 'kyo', 'daikyo'] as const;
const weights = [16, 35, 10, 10, 6, 18, 5];
const rankKanji = ['大吉', '吉', '中吉', '小吉', '末吉', '凶', '大凶'];

function drawRank(): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return 0;
}

const rankColor = (idx: number) => idx <= 1 ? '#ffd700' : idx >= 5 ? '#666' : '#c39bd3';

export default function OmikujiPage() {
  const { t } = useTranslation();
  useEffect(() => { playBgm('omikuji'); }, []);
  const [limitReached, setLimitReached] = useState(hasUsedToday('omikuji'));
  const [showReverse, setShowReverse] = useState(false);
  const [step, setStep] = useSessionState<Step>('omikuji_step', 'purify');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [question, setQuestion] = useState('');
  const [rankIdx, setRankIdx] = useState(0);
  const [stickNum, setStickNum] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [purifyStep, setPurifyStep] = useState(0); // 0=left, 1=right, 2=mouth
  const [clapCount, setClapCount] = useState(0);
  const [bowCount, setBowCount] = useState(0);
  const [prayPhase, setPrayPhase] = useState<'bow1' | 'clap' | 'question' | 'bow2' | 'done'>('bow1');
  const [keepChoice, setKeepChoice] = useState<'keep' | 'tie' | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Guard: reset to purify if restored step requires computation data
  useEffect(() => {
    const needsResult = step === 'waka' || step === 'reading' || step === 'fate';
    if (needsResult && stickNum === 0) { setStep('purify'); }
    // Prayer mid-step: just let it restart from pray (bow1 is default)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const seed = stickNum || 1;
  const _waka = getWaka(ranks[rankIdx], seed); void _waka;

  // Purification sequence
  const purifyLabels = [t('omikuji.purifyLeft'), t('omikuji.purifyRight'), t('omikuji.purifyMouth')];
  const purifyEmojis = ['🤲', '🤲', '💧'];

  const handlePurifyStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    sfxWaterPour();
    if (purifyStep < 2) {
      setPurifyStep(prev => prev + 1);
    } else {
      setStep('pray');
    }
    setTimeout(() => setIsTransitioning(false), 400);
  };

  // Prayer sequence: 2배 2박수 1배
  const handlePrayAction = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 500);
    switch (prayPhase) {
      case 'bow1':
        sfxBow();
        setBowCount(prev => {
          const next = prev + 1;
          if (next >= 2) setPrayPhase('clap');
          return next;
        });
        break;
      case 'clap':
        sfxClap();
        setClapCount(prev => {
          const next = prev + 1;
          if (next >= 2) {
            setTimeout(() => sfxBell(), 200);
            setPrayPhase('question');
          }
          return next;
        });
        break;
      case 'question':
        if (question.trim()) {
          setPrayPhase('bow2');
          setTimeout(() => {
            setPrayPhase('done');
            setTimeout(() => setStep('shake'), 1000);
          }, 1500);
        }
        break;
    }
  };

  // Shake sequence
  const handleShake = () => {
    sfxShakeSticks();
    setShaking(true);
    setTimeout(() => {
      sfxStickDrop();
      setRankIdx(drawRank());
      setStickNum(Math.floor(Math.random() * 100) + 1);
      setShaking(false);
      setStep('waka');
    }, 2500);
  };

  const reset = () => {
    setStep('purify');
    setQuestion('');
    setPurifyStep(0);
    setClapCount(0);
    setBowCount(0);
    setPrayPhase('bow1');
    setKeepChoice(null);
  };

  // Sound: waka step — paper unfold then koto
  useEffect(() => {
    if (step === 'waka') {
      sfxPaperUnfold();
      setTimeout(() => sfxKoto(), 500);
    }
  }, [step]);

  // Sound: reading step — rank reveal + history
  useEffect(() => {
    if (step === 'reading') {
      sfxRankReveal(rankIdx <= 1);
      addHistory({ type: 'omikuji', summary: '', data: {
        rank: ranks[rankIdx], rankKanji: rankKanji[rankIdx], number: stickNum, question,
        wakaJa: t(`waka.${ranks[rankIdx]}.japanese`), wakaKo: t(`waka.${ranks[rankIdx]}.translation`),
        general: t(`omikujiData.${ranks[rankIdx]}.0.general`),
        wish: t(`omikujiData.${ranks[rankIdx]}.0.wish`), love: t(`omikujiData.${ranks[rankIdx]}.0.relationship`),
        health: t(`omikujiData.${ranks[rankIdx]}.0.health`), travel: t(`omikujiData.${ranks[rankIdx]}.0.travel`),
      } });
    }
  }, [step]);

  const cardBg = 'rgba(231,76,60,0.15)';
  const cardBorder = 'rgba(231,76,60,0.3)';

  return (
    <PageShell theme="east" title={t('omikuji.title')} pattern="omikuji">
      <AnimatePresence mode="wait">

        {/* DAILY LIMIT REACHED */}
        {step === 'purify' && limitReached && (
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

        {/* STEP 1: PURIFICATION — Temizuya */}
        {step === 'purify' && !limitReached && (
          <motion.div key="purify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('omikuji.purifyStep')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {t('omikuji.temizuya')}
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '60px', marginBottom: '16px' }}
            >
              {purifyEmojis[purifyStep]}
            </motion.div>

            <div style={{ fontSize: '16px', color: '#f5d5d5', marginBottom: '8px' }}>
              {purifyLabels[purifyStep]}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {t('omikuji.purifyDesc')}
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePurifyStep}
              style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('omikuji.purifyAction')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: PRAYER — 2拝2拍手1拝 */}
        {step === 'pray' && (
          <motion.div key="pray" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('omikuji.prayStep')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {t('omikuji.prayRitual')}
            </div>

            {prayPhase === 'bow1' && (
              <>
                <motion.div animate={{ rotateX: [0, 30, 0] }} transition={{ duration: 1 }} style={{ fontSize: '60px', marginBottom: '16px' }}>⛩️</motion.div>
                <div style={{ fontSize: '16px', color: '#f5d5d5', marginBottom: '8px' }}>{t('omikuji.bowCount', { count: bowCount })}</div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrayAction}
                  style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
                  {t('omikuji.bowAction')}
                </motion.button>
              </>
            )}

            {prayPhase === 'clap' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  key={clapCount}
                  style={{ fontSize: '60px', marginBottom: '16px' }}>👏</motion.div>
                <div style={{ fontSize: '16px', color: '#f5d5d5', marginBottom: '8px' }}>{t('omikuji.clapCount', { count: clapCount })}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {t('omikuji.clapDesc')}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrayAction}
                  style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
                  {t('omikuji.clapAction')}
                </motion.button>
              </>
            )}

            {prayPhase === 'question' && (
              <>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>🙏</div>
                <div style={{ fontSize: '16px', color: '#f5d5d5', marginBottom: '8px' }}>{t('omikuji.questionPrompt')}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {t('omikuji.questionDesc')}
                </div>
                <textarea value={question} onChange={e => { setQuestion(e.target.value.slice(0, 200)); sfxTextInput(); }} maxLength={200}
                  placeholder={t('omikuji.questionPlaceholder')}
                  style={{ width: '100%', minHeight: '80px', padding: '14px', background: 'rgba(231,76,60,0.1)', border: `1px solid ${cardBorder}`, borderRadius: '10px', color: '#f5d5d5', fontSize: '15px', fontFamily: "'Noto Serif KR', serif", resize: 'vertical', marginBottom: '16px' }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrayAction}
                  disabled={!question.trim()}
                  style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5', opacity: question.trim() ? 1 : 0.4 }}>
                  {t('omikuji.finalBow')}
                </motion.button>
              </>
            )}

            {prayPhase === 'bow2' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div animate={{ rotateX: [0, 30, 0] }} transition={{ duration: 1 }} style={{ fontSize: '60px', marginBottom: '16px' }}>⛩️</motion.div>
                <div style={{ fontSize: '16px', color: '#f5d5d5' }}>{t('omikuji.prayComplete')}</div>
              </motion.div>
            )}

            {prayPhase === 'done' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '16px', color: 'var(--accent-light)' }}>
                {t('omikuji.connectionDone')}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 3: SHAKE — Mikuji-bako */}
        {step === 'shake' && (
          <motion.div key="shake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('omikuji.shakeStep')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {t('omikuji.mikujibako')}
            </div>

            <motion.div
              animate={shaking ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0], y: [0, -5, 5, -3, 3, 0] } : {}}
              transition={{ duration: 0.6, repeat: shaking ? 3 : 0 }}
              style={{ fontSize: '80px', marginBottom: '20px' }}
            >
              🎋
            </motion.div>

            {!shaking ? (
              <>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.7' }}>
                  {t('omikuji.shakeDesc')}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleShake()}
                  style={{
                    padding: '16px 48px',
                    background: 'rgba(231,76,60,0.2)',
                    border: '1px solid rgba(231,76,60,0.4)',
                    borderRadius: '12px', fontSize: '16px', color: '#f5d5d5',
                  }}>
                  {t('omikuji.shakeAction')}
                </motion.button>
              </>
            ) : (
              <div style={{ fontSize: '16px', color: 'var(--accent-light)' }}>
                {t('omikuji.extracting')}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4a: WAKA — The poem first */}
        {step === 'waka' && (
          <motion.div key="waka" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '450px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('omikuji.wakaStep')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              第{stickNum}番の籤
            </div>

            {/* Washi paper style container */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                background: 'linear-gradient(180deg, #f5f0e8, #ebe4d4)',
                borderRadius: '4px',
                padding: '36px 28px',
                marginBottom: '24px',
                color: '#1a1a1a',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Red seal */}
              <div style={{
                position: 'absolute', top: '12px', right: '16px',
                width: '40px', height: '40px', borderRadius: '4px',
                border: '2px solid #c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: '#c0392b', fontWeight: 700, transform: 'rotate(-5deg)',
              }}>
                御籤
              </div>

              {/* Waka poem */}
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px', letterSpacing: '1px' }}>{t('omikuji.wakaGuide')}</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontFamily: "'Noto Serif KR', serif",
                  fontSize: '16px',
                  lineHeight: '2.2',
                  whiteSpace: 'pre-line',
                  marginBottom: '16px',
                  color: '#2c2c2c',
                }}
              >
                {t(`waka.${ranks[rankIdx]}.japanese`)}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ fontSize: '14px', lineHeight: '2', whiteSpace: 'pre-line', color: '#555', marginBottom: '16px' }}
              >
                {t(`waka.${ranks[rankIdx]}.translation`)}
              </motion.div>

              {/* Divider */}
              <div style={{ width: '60px', height: '1px', background: '#ccc', margin: '16px auto' }} />

              {/* Waka interpretation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                style={{ fontSize: '14px', lineHeight: '1.8', color: '#444', fontStyle: 'italic' }}
              >
                {t(`waka.${ranks[rankIdx]}.meaning`)}
              </motion.div>
            </motion.div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.7' }}>
              {t('omikuji.wakaDesc')}
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); markUsedToday('omikuji'); setLimitReached(true); setStep('reading'); }}
              style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
              {t('omikuji.detailButton')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 4b: READING — Full fortune details */}
        {step === 'reading' && (
          <motion.div key="reading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}>

            <div ref={resultRef}>
            {/* Rank reveal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ marginBottom: 'clamp(8px, 1.5vh, 16px)' }}
            >
              <div className="mystic-glow" style={{ fontSize: 'clamp(40px, 7vh, 56px)', fontWeight: 700, color: rankColor(rankIdx), fontFamily: "'Noto Serif KR', serif", textShadow: `0 0 20px ${rankColor(rankIdx)}40` }}>
                {rankKanji[rankIdx]}
              </div>
              <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{t(`omikuji.${ranks[rankIdx]}`)}</div>
            </motion.div>

            <MysticDivider delay={0.2} />
            {/* Rank guidance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: rankIdx <= 4 ? 'rgba(212,175,55,0.08)' : 'rgba(231,76,60,0.08)',
                border: `1px solid ${rankIdx <= 4 ? 'rgba(212,175,55,0.2)' : 'rgba(231,76,60,0.2)'}`,
                borderRadius: '12px', padding: 'clamp(10px, 1.5vh, 14px)', marginBottom: 'clamp(8px, 1.5vh, 16px)', textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '11px', color: rankIdx <= 4 ? 'rgba(212,175,55,0.7)' : 'rgba(231,76,60,0.7)', marginBottom: '6px', fontWeight: 700, letterSpacing: '1px' }}>
                ✦ {t('rankGuide.title')}
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                {t(`rankGuide.${ranks[rankIdx]}.meaning`)}
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                💡 {t(`rankGuide.${ranks[rankIdx]}.advice`)}
              </div>
            </motion.div>

            {/* Question reminder */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('omikuji.questionLabel')} </span>
              <span style={{ fontStyle: 'italic' }}>"{question}"</span>
            </div>

            {/* Detailed fortune items */}
            {['general', 'wish', 'relationship', 'travel', 'health'].map((field, i) => (
              <motion.div key={field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'left', marginBottom: '10px', padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}
              >
                <div style={{ fontSize: '12px', color: 'var(--accent-light)', marginBottom: '4px', fontWeight: 700 }}>{t(`omikuji.${field}`)}</div>
                <div style={{ fontSize: '14px', lineHeight: '1.7' }}>{t(`omikujiData.${ranks[rankIdx]}.0.${field}`)}</div>
              </motion.div>
            ))}
            <Watermark />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { sfxButtonClick(); setStep('fate'); }}
                style={{ padding: '14px 40px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '16px', color: '#f5d5d5' }}>
                {t('omikuji.tieToButton')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: FATE — Keep or Tie */}
        {step === 'fate' && (
          <motion.div key="fate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '450px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>
              {t('omikuji.fateStep')}
            </div>

            {!keepChoice ? (
              <>
                <div style={{ fontSize: '16px', color: '#f5d5d5', marginBottom: '8px', lineHeight: '1.8' }}>
                  {t('omikuji.fatePrompt')}
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { sfxKeep(); setKeepChoice('keep'); }}
                    style={{ padding: '20px 28px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '16px', color: '#f5d5d5', width: '180px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👛</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{t('omikuji.keepTitle')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('omikuji.keepDesc')}</div>
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { sfxTie(); setKeepChoice('tie'); }}
                    style={{ padding: '20px 28px', background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(150,150,150,0.3)', borderRadius: '16px', color: '#f5d5d5', width: '180px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌲</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{t('omikuji.tieTitle')}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('omikuji.tieDesc')}</div>
                  </motion.button>
                </div>
              </>
            ) : keepChoice === 'keep' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '60px', marginBottom: '16px' }}>👛</motion.div>
                <div style={{ fontSize: '18px', color: '#ffd700', marginBottom: '8px', fontWeight: 700 }}>
                  {t('omikuji.keepDone')}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
                  {t('omikuji.keepMessage')}
                </div>
                <FortuneMemo fortuneType="omikuji" />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <ShareButton entry={getLatestEntry('omikuji')} theme="east" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); reset(); }}
                    style={{ padding: '14px 24px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '14px', color: '#f5d5d5' }}>
                    {t('omikuji.newVisit')}
                  </motion.button>
                </div>
                <ProfileSuggestion />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ fontSize: '60px', marginBottom: '16px' }}>🌲</motion.div>
                <div style={{ fontSize: '18px', color: '#aaa', marginBottom: '8px', fontWeight: 700 }}>
                  {t('omikuji.tieDone')}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
                  {t('omikuji.tieMessage')}
                </div>
                <FortuneMemo fortuneType="omikuji" />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <ShareButton entry={getLatestEntry('omikuji')} theme="east" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); reset(); }}
                    style={{ padding: '14px 24px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', fontSize: '14px', color: '#f5d5d5' }}>
                    {t('omikuji.newVisit')}
                  </motion.button>
                </div>
                <ProfileSuggestion />
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
      {showReverse && (
        <ReverseFateScreen
          fortuneType="omikuji"
          onComplete={() => { setShowReverse(false); setLimitReached(false); setStep('purify'); setPurifyStep(0); setClapCount(0); setBowCount(0); setPrayPhase('bow1'); setQuestion(''); setRankIdx(0); setStickNum(0); setKeepChoice(null); }}
          onCancel={() => setShowReverse(false)}
        />
      )}
    </PageShell>
  );
}
