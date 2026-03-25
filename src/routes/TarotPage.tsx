import { useState, useEffect, useRef } from 'react';
import PageShell from '../components/layout/PageShell';
import { playBgm } from '../logic/bgmEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { sfxBreath, sfxShuffle, sfxCut, sfxCardFlip, sfxReadingReveal, sfxAdviceCard, sfxButtonClick, sfxTextInput } from '../logic/soundEngine';
import { tarotSymbols } from '@fate0/shared';
import ShareButton from '../components/layout/ShareButton';
import Watermark from '../components/layout/Watermark';
import { addHistory } from '../logic/historyEngine';
import { hasUsedToday, markUsedToday } from '../logic/dailyLimitEngine';
import { Link } from 'react-router-dom';
import ReverseFateScreen from '../components/layout/ReverseFateScreen';
import { canReverse, getReverseRemaining } from '../logic/reverseEngine';
import { useSessionState } from '../hooks/useSessionState';

type Spread = '1-card' | '3-card' | 'celtic';
type Step = 'prepare' | 'question' | 'shuffle' | 'cut' | 'spread' | 'flip' | 'reading' | 'advice';

interface DrawnCard {
  id: number;
  isReversed: boolean;
  position: string;
  positionKey: string;
  flipped: boolean;
}

const CARD_COUNT = 22;
const positionLabels: Record<Spread, string[]> = {
  '1-card': ['present'],
  '3-card': ['past', 'present', 'future'],
  'celtic': ['present', 'challenge', 'foundation', 'recentPast', 'bestOutcome', 'nearFuture', 'selfImage', 'environment', 'hopesAndFears', 'finalOutcome'],
};

function shuffleDeck(): number[] {
  const ids = Array.from({ length: CARD_COUNT }, (_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

const btn = (theme: 'purple' | 'gold' | 'dim') => {
  const colors = {
    purple: { bg: 'rgba(155,89,182,0.3)', border: 'rgba(155,89,182,0.5)' },
    gold: { bg: 'rgba(212,175,55,0.3)', border: 'rgba(212,175,55,0.5)' },
    dim: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' },
  }[theme];
  return { padding: '14px 36px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '16px', color: '#e8d5f5' } as const;
};

export default function TarotPage() {
  const { t } = useTranslation();
  useEffect(() => { playBgm('tarot'); }, []);
  const [limitReached, setLimitReached] = useState(hasUsedToday('tarot'));
  const [showReverse, setShowReverse] = useState(false);
  const [step, setStep, resetStep] = useSessionState<Step>('tarot_step', 'prepare');
  const [question, setQuestion, resetQuestion] = useSessionState('tarot_question', '');
  const [spread, setSpread, resetSpread] = useSessionState<Spread>('tarot_spread', '3-card');
  const [cards, setCards, resetCards] = useSessionState<DrawnCard[]>('tarot_cards', []);
  const [adviceCard, setAdviceCard] = useState<DrawnCard | null>(null);
  const [shuffleCount, setShuffleCount, resetShuffleCount] = useSessionState('tarot_shuffle', 0);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const resultRef = useRef<HTMLDivElement>(null);

  // Breathing guide
  useEffect(() => {
    if (step !== 'prepare') return;
    const cycle = ['in', 'hold', 'out'] as const;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % 3;
      const phase = cycle[idx];
      setBreathPhase(phase);
      if (phase === 'in' || phase === 'out') sfxBreath(phase);
    }, 2000);
    return () => clearInterval(timer);
  }, [step]);

  const handleShuffle = () => {
    sfxShuffle();
    setShuffleCount(prev => prev + 1);
    if (shuffleCount >= 2) {
      setStep('cut');
    }
  };

  const handleCut = () => {
    sfxCut();
    const deck = shuffleDeck();
    const positions = positionLabels[spread];
    const drawn: DrawnCard[] = deck.slice(0, positions.length).map((id, i) => ({
      id,
      isReversed: Math.random() < 0.3,
      position: t(`tarot.positions.${positions[i]}`, { defaultValue: positions[i] }),
      positionKey: positions[i],
      flipped: false,
    }));
    setCards(drawn);
    setStep('flip');
  };

  const handleFlip = (index: number) => {
    sfxCardFlip();
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    const allFlipped = cards.every((c, i) => i === index || c.flipped);
    if (allFlipped) {
      setTimeout(() => { sfxReadingReveal(); addHistory({ type: 'tarot', summary: '', data: { cardIds: cards.map(c => c.id) } }); markUsedToday('tarot'); setLimitReached(true); setStep('reading'); }, 800);
    }
  };

  const handleDrawAdvice = () => {
    sfxAdviceCard();
    const usedIds = new Set(cards.map(c => c.id));
    const remaining = Array.from({ length: CARD_COUNT }, (_, i) => i).filter(id => !usedIds.has(id));
    const id = remaining[Math.floor(Math.random() * remaining.length)];
    setAdviceCard({ id, isReversed: Math.random() < 0.3, position: t('tarot.adviceCard'), positionKey: 'advice', flipped: true });
    setStep('advice');
  };

  const reset = () => {
    resetStep();
    resetQuestion();
    resetSpread();
    resetCards();
    resetShuffleCount();
    setAdviceCard(null);
  };

  const cardStyle = (flipped: boolean) => ({
    background: flipped ? 'rgba(155,89,182,0.2)' : 'rgba(75,30,120,0.6)',
    border: `1px solid ${flipped ? 'rgba(155,89,182,0.4)' : 'rgba(155,89,182,0.2)'}`,
    borderRadius: '12px',
    padding: flipped ? '16px' : '20px',
    textAlign: 'center' as const,
    width: spread === 'celtic' ? '120px' : '160px',
    minHeight: flipped ? 'auto' : '180px',
    cursor: flipped ? 'default' : 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <PageShell theme="west" title={t('tarot.title')} pattern="tarot">
      <AnimatePresence mode="wait">
        {/* DAILY LIMIT REACHED */}
        {step === 'prepare' && limitReached && (
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

        {/* STEP 1: PREPARE - Breathing & mindset */}
        {step === 'prepare' && !limitReached && (
          <motion.div key="prepare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('tarot.step1Title')}
            </div>
            <motion.div
              animate={{ scale: breathPhase === 'in' ? 1.2 : breathPhase === 'hold' ? 1.2 : 1 }}
              transition={{ duration: 2 }}
              style={{ fontSize: '60px', marginBottom: '16px' }}
            >
              🔮
            </motion.div>
            <div style={{ fontSize: '18px', color: 'var(--accent-light)', marginBottom: '8px' }}>
              {breathPhase === 'in' ? t('tarot.breathIn') : breathPhase === 'hold' ? t('tarot.breathHold') : t('tarot.breathOut')}
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '24px', fontSize: '14px' }}>
              {t('tarot.prepareDesc')}
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); setStep('question'); }} style={btn('purple')}>
              {t('tarot.ready')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: QUESTION */}
        {step === 'question' && (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('tarot.step2Title')}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>{t('tarot.questionGuide')}</p>
            <textarea
              value={question}
              onChange={e => { setQuestion(e.target.value.slice(0, 200)); sfxTextInput(); }} maxLength={200}
              placeholder={t('tarot.questionPlaceholder')}
              style={{
                width: '100%', minHeight: '100px', padding: '16px', background: 'rgba(155,89,182,0.1)',
                border: '1px solid rgba(155,89,182,0.3)', borderRadius: '12px', color: '#e8d5f5',
                fontSize: '16px', fontFamily: "'Noto Serif KR', serif", resize: 'vertical',
              }}
            />
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t('tarot.selectSpread')}</div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(['1-card', '3-card', 'celtic'] as Spread[]).map(s => (
                  <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); setSpread(s); }}
                    style={{ ...btn(spread === s ? 'purple' : 'dim'), padding: '10px 20px', fontSize: '14px' }}>
                    {s === '1-card' ? t('tarot.spread1') : s === '3-card' ? t('tarot.spread3') : t('tarot.spreadCeltic')}
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfxButtonClick(); setShuffleCount(0); setStep('shuffle'); }}
              disabled={!question.trim()}
              style={{ ...btn('purple'), opacity: question.trim() ? 1 : 0.4 }}>
              {t('tarot.toShuffle')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: SHUFFLE — swipe/drag to shuffle cards */}
        {step === 'shuffle' && (
          <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('tarot.step3Title')}
            </div>

            {/* Card pile — drag/swipe to shuffle */}
            <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`pile-${i}-${shuffleCount}`}
                  initial={{ rotate: 0, x: 0 }}
                  animate={{
                    rotate: (i - 2) * 4 + (shuffleCount > 0 ? (Math.random() - 0.5) * 20 : 0),
                    x: shuffleCount > 0 ? (Math.random() - 0.5) * 30 : (i - 2) * 3,
                    y: shuffleCount > 0 ? (Math.random() - 0.5) * 10 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{
                    position: 'absolute',
                    width: '80px', height: '120px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2d1450, #1a0a2e)',
                    border: '2px solid rgba(155,89,182,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', color: 'rgba(155,89,182,0.5)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: i,
                  }}
                >
                  ✦
                </motion.div>
              ))}

              {/* Drag overlay */}
              <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.3}
                onDragEnd={(_e, info) => {
                  if (Math.abs(info.offset.x) > 50) {
                    handleShuffle();
                  }
                }}
                whileDrag={{ scale: 1.05 }}
                style={{
                  position: 'absolute', inset: 0,
                  cursor: 'grab', zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '13px', color: 'rgba(155,89,182,0.6)', pointerEvents: 'none' }}
                >
                  ← {t('tarot.swipeToShuffle', 'swipe to shuffle')} →
                </motion.div>
              </motion.div>
            </div>

            <p style={{ color: 'var(--accent-light)', marginBottom: '16px', fontSize: '14px' }}>
              {t('tarot.shuffleCount', { count: shuffleCount + 1, total: 3 })}
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={handleShuffle} style={btn('dim')}>
              {shuffleCount >= 2 ? t('tarot.shuffleDone') : t('tarot.shuffleAction')}
            </motion.button>
          </motion.div>
        )}

        {/* STEP 4: CUT — tap deck to split */}
        {step === 'cut' && (
          <motion.div key="cut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('tarot.step3bTitle')}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>{t('tarot.cutDesc')}</p>

            {/* Tap-to-split deck visual */}
            <motion.div
              onClick={handleCut}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: 'relative', height: '180px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              {/* Left half */}
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: -15 }}
                style={{
                  width: '75px', height: '110px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2d1450, #1a0a2e)',
                  border: '2px solid rgba(155,89,182,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: 'rgba(155,89,182,0.5)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  position: 'absolute', left: 'calc(50% - 85px)',
                }}
              >✦</motion.div>

              {/* Right half */}
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 15 }}
                style={{
                  width: '75px', height: '110px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2d1450, #1a0a2e)',
                  border: '2px solid rgba(155,89,182,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: 'rgba(155,89,182,0.5)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  position: 'absolute', right: 'calc(50% - 85px)',
                }}
              >✦</motion.div>

              {/* Center glow line */}
              <motion.div
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '2px', height: '130px',
                  background: 'linear-gradient(180deg, transparent, rgba(155,89,182,0.6), transparent)',
                  position: 'absolute',
                }}
              />
            </motion.div>

            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '13px', color: 'rgba(155,89,182,0.5)', marginBottom: '16px' }}
            >
              {t('tarot.tapToCut', 'tap the deck to cut')}
            </motion.div>
          </motion.div>
        )}

        {/* STEP 5: FLIP CARDS */}
        {step === 'flip' && (
          <motion.div key="flip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: spread === 'celtic' ? '700px' : '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>
              {t('tarot.step4Title')}
            </div>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>{t('tarot.flipGuide')}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {cards.map((c, i) => (
                <motion.div key={i}
                  whileHover={!c.flipped ? { scale: 1.05, boxShadow: '0 0 20px rgba(155,89,182,0.5)' } : {}}
                  whileTap={!c.flipped ? { scale: 0.95 } : {}}
                  onClick={() => !c.flipped && handleFlip(i)}
                  animate={c.flipped ? { rotateY: [180, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  style={cardStyle(c.flipped)}
                >
                  {c.flipped ? (
                    <>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{c.position}</div>
                      <div style={{ fontSize: '28px', marginBottom: '4px', transform: c.isReversed ? 'rotate(180deg)' : 'none' }}>{tarotSymbols[c.id] || '🃏'}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{t(`tarot.cards.${c.id}.name`)}</div>
                      {c.isReversed && <div style={{ fontSize: '11px', color: '#e74c3c' }}>{t('tarot.reversed')}</div>}
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '12px', color: '#c39bd3', marginBottom: '8px', fontStyle: 'italic', lineHeight: '1.4' }}>
                        {c.positionKey ? t(`tarot.positionHint.${c.positionKey}`, c.position) : c.position}
                      </div>
                      <div style={{
  width: '50px', height: '70px', borderRadius: '8px',
  background: 'linear-gradient(135deg, #2d1450, #1a0a2e)',
  border: '2px solid rgba(155,89,182,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', color: 'rgba(155,89,182,0.5)',
  boxShadow: '0 0 15px rgba(155,89,182,0.2)',
}}>✦</div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 6: READING */}
        {step === 'reading' && (
          <motion.div key="reading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>
              {t('tarot.step5Title')}
            </div>

            {/* Question reminder */}
            <div ref={resultRef}>
            <div style={{ background: 'rgba(155,89,182,0.1)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('tarot.yourQuestion')}</div>
              <div style={{ fontSize: '15px', fontStyle: 'italic' }}>"{question}"</div>
            </div>
            {/* Card interpretations */}
            {cards.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)', borderRadius: '12px', padding: cards.length > 5 ? '14px' : '20px', marginBottom: cards.length > 5 ? '8px' : '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '28px', display: 'inline-block', transform: c.isReversed ? 'rotate(180deg)' : 'none' }}>{tarotSymbols[c.id] || '🃏'}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{t(`tarot.cards.${c.id}.name`)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {c.position} {c.isReversed ? t('tarot.reversed') : ''}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  {c.isReversed ? t(`tarot.cards.${c.id}.reversed`) : t(`tarot.cards.${c.id}.upright`)}
                </div>
              </motion.div>
            ))}

            {/* Summary / storytelling */}
            <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(212,175,55,0.8)', marginBottom: '8px', fontWeight: 700 }}>{t('tarot.storyTitle')}</div>
              <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                {cards.length === 1
                  ? t('tarot.summary1', { name: t(`tarot.cards.${cards[0].id}.name`) })
                  : t('tarot.summary3')}
              </div>
            </div>
            <Watermark />
            </div>

            {/* Advice card option */}
            <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDrawAdvice} style={btn('gold')}>
                {t('tarot.drawAdvice')}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); if (hasUsedToday('tarot')) { setShowReverse(true); } else { reset(); } }} style={btn('dim')}>
                {t('tarot.newReading')}
              </motion.button>
              <ShareButton targetRef={resultRef} theme="west" />
            </div>
          </motion.div>
        )}

        {/* STEP 7: ADVICE CARD */}
        {step === 'advice' && adviceCard && (
          <motion.div key="advice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>
              {t('tarot.step6Title')}
            </div>
            <motion.div initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.8 }}
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)', borderRadius: '16px', padding: '28px', marginBottom: '20px', display: 'inline-block' }}>
              <div style={{ fontSize: '12px', color: 'rgba(212,175,55,0.8)', marginBottom: '8px' }}>{t('tarot.adviceCard')}</div>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>{tarotSymbols[adviceCard.id] || '🃏'}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{t(`tarot.cards.${adviceCard.id}.name`)}</div>
              {adviceCard.isReversed && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('tarot.reversed')}</div>}
              <div style={{ fontSize: '15px', lineHeight: '1.8', textAlign: 'left', marginTop: '12px' }}>
                {adviceCard.isReversed ? t(`tarot.cards.${adviceCard.id}.reversed`) : t(`tarot.cards.${adviceCard.id}.upright`)}
              </div>
            </motion.div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
              {t('tarot.adviceMessage')}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { sfxButtonClick(); if (hasUsedToday('tarot')) { setShowReverse(true); } else { reset(); } }} style={btn('purple')}>
              {t('tarot.newReading')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {showReverse && (
        <ReverseFateScreen
          fortuneType="tarot"
          onComplete={() => {
            setShowReverse(false);
            setLimitReached(false);
            resetStep();
            resetQuestion();
            resetSpread();
            resetCards();
            resetShuffleCount();
            setAdviceCard(null);
            // Force step to prepare after a tick to ensure state is settled
            setTimeout(() => setStep('prepare'), 50);
          }}
          onCancel={() => setShowReverse(false)}
        />
      )}
    </PageShell>
  );
}
