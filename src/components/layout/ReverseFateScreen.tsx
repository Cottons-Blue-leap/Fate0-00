import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useReverse } from '../../logic/reverseEngine';
import { unlockType } from '../../logic/dailyLimitEngine';
import { Capacitor } from '@capacitor/core';

interface Props {
  fortuneType: 'tarot' | 'horoscope' | 'saju' | 'omikuji';
  onComplete: () => void;
  onCancel: () => void;
}

// Google's official test reward ad unit ID (replace with real ID for production)
const TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';
const PROD_AD_UNIT_ID = 'ca-app-pub-7470197967254770/6808748904';
const IS_DEV = import.meta.env.DEV;
const AD_UNIT_ID = IS_DEV ? TEST_AD_UNIT_ID : PROD_AD_UNIT_ID;

async function showRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
    await AdMob.initialize({
      initializeForTesting: IS_DEV,
      testingDevices: IS_DEV ? ['EMULATOR'] : [],
    });

    return new Promise<boolean>((resolve) => {
      let rewarded = false;
      let settled = false;
      const settle = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        settle(rewarded);
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        settle(false);
      });

      AdMob.prepareRewardVideoAd({ adId: AD_UNIT_ID }).then(() => {
        AdMob.showRewardVideoAd();
      }).catch(() => settle(false));
    });
  } catch {
    return false;
  }
}

export default function ReverseFateScreen({ fortuneType, onComplete, onCancel }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'intro' | 'loading' | 'counting' | 'complete'>('intro');
  const [seconds, setSeconds] = useState(15);
  const isNative = Capacitor.isNativePlatform();

  // Android hardware back button closes the overlay
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cleanup: (() => void) | undefined;
    import('@capacitor/app').then(({ App }) => {
      const listener = App.addListener('backButton', () => { onCancel(); });
      cleanup = () => { listener.then(h => h.remove()); };
    });
    return () => { cleanup?.(); };
  }, [onCancel]);

  const startRitual = useCallback(async () => {
    const success = useReverse();
    if (!success) { onCancel(); return; }

    if (isNative) {
      // Try real ad
      setPhase('loading');
      const adSuccess = await showRewardedAd();
      if (adSuccess) {
        unlockType(fortuneType);
        setPhase('complete');
        setTimeout(onComplete, 1500);
      } else {
        // Ad failed — fall back to countdown
        setPhase('counting');
      }
    } else {
      // Web: countdown simulation
      setPhase('counting');
    }
  }, [onCancel, onComplete, fortuneType, isNative]);

  // Countdown fallback (web or ad failure)
  useEffect(() => {
    if (phase !== 'counting') return;
    if (seconds <= 0) {
      unlockType(fortuneType);
      setPhase('complete');
      setTimeout(onComplete, 1500);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, seconds, fortuneType, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'max(40px, var(--sat, 0px)) 20px max(20px, var(--sab, 0px))',
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', maxWidth: '360px' }}>
            <motion.div
              animate={{ textShadow: ['0 0 20px rgba(212,175,55,0.3)', '0 0 50px rgba(212,175,55,0.8)', '0 0 20px rgba(212,175,55,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '64px', fontWeight: 700, color: '#ffd700', marginBottom: '12px', fontFamily: "'Noto Serif KR', serif" }}
            >
              {t('reverseFate.title')}
            </motion.div>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', letterSpacing: '2px' }}>
              {t('reverseFate.subtitle')}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8', marginBottom: '32px', fontStyle: 'italic' }}>
              {t('reverseFate.ritual')}
            </div>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startRitual}
              style={{
                padding: '16px 40px', borderRadius: '12px', fontSize: '16px', color: '#ffd700',
                background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.5)',
                marginBottom: '16px', width: '100%',
              }}>
              {t('reverseFate.startRitual')}
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} onClick={onCancel}
              style={{ background: 'none', fontSize: '14px', color: 'rgba(255,255,255,0.3)', padding: '8px' }}>
              {t('reverseFate.cancel')}
            </motion.button>

            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '20px' }}>
              {t('reverseFate.adNotice')}
            </div>
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '48px', marginBottom: '16px' }}
            >
              ✦
            </motion.div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              {t('reverseFate.ritual')}
            </div>
          </motion.div>
        )}

        {phase === 'counting' && (
          <motion.div key="counting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', color: '#ffd700', marginBottom: '16px', fontWeight: 700 }}>{t('reverseFate.title')}</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
              {t('reverseFate.ritual')}
            </div>

            <div style={{
              width: 'min(300px, calc(100vw - 40px))', height: '200px', borderRadius: '12px',
              background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: '48px', color: '#ffd700', fontWeight: 700, fontFamily: 'monospace' }}
              >
                {seconds}
              </motion.div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                {t('reverseFate.adArea')}
              </div>
            </div>

            <div style={{ width: 'min(300px, calc(100vw - 40px))', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((15 - seconds) / 15) * 100}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #ffd700, #e74c3c)', borderRadius: '2px' }}
              />
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '16px' }}>
              {t('reverseFate.adNotice')}
            </div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ textShadow: ['0 0 30px rgba(212,175,55,0.5)', '0 0 80px rgba(212,175,55,1)', '0 0 30px rgba(212,175,55,0.5)'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '72px', color: '#ffd700', marginBottom: '16px' }}
            >
              ✦
            </motion.div>
            <div style={{ fontSize: '20px', color: '#ffd700', fontWeight: 700, letterSpacing: '3px' }}>
              {t('reverseFate.complete')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
