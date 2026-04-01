import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitScreen from '../components/layout/SplitScreen';
import FortuneCard from '../components/layout/FortuneCard';
import MysticClock from '../components/layout/MysticClock';
import MysticBackground from '../components/layout/MysticBackground';
import ReverseFateScreen from '../components/layout/ReverseFateScreen';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../context/ProfileContext';
import { hasUsedToday } from '../logic/dailyLimitEngine';
import { Capacitor } from '@capacitor/core';
import { playBgm } from '../logic/bgmEngine';
import HomeCardIcon from '../components/home/HomeCardIcon';
// import { useAuth } from '../context/AuthContext';
// import { hasServer } from '../services/api';
// import AuthModal from '../components/layout/AuthModal';
import FortuneReport from '../components/layout/FortuneReport';
import PersonalMessage from '../components/layout/PersonalMessage';

export default function HomePage() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [reverseTarget, setReverseTarget] = useState<'tarot' | 'horoscope' | 'saju' | 'omikuji' | null>(null);
  const [, forceUpdate] = useState(0);
  const [showExitPopup, setShowExitPopup] = useState(false);
  // const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  // const { isLoggedIn, logout } = useAuth();

  // Start home BGM on first interaction
  useEffect(() => {
    const startBgm = () => {
      playBgm('home');
      document.removeEventListener('pointerdown', startBgm);
    };
    document.addEventListener('pointerdown', startBgm);
    // Also try immediately (works if user already interacted)
    playBgm('home');
    return () => document.removeEventListener('pointerdown', startBgm);
  }, []);

  // Android back button → exit confirmation
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle: { remove: () => void } | null = null;
    let unmounted = false;
    import('@capacitor/app').then(({ App }) => {
      if (unmounted) return;
      App.addListener('backButton', () => {
        setShowExitPopup(true);
      }).then(h => { handle = h; });
    });
    return () => {
      unmounted = true;
      handle?.remove();
    };
  }, []);
  const allUsedToday = hasUsedToday('tarot') && hasUsedToday('horoscope') && hasUsedToday('saju') && hasUsedToday('omikuji');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative' }}>
      <MysticBackground pattern="home" />
      <SplitScreen
        nav={
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {allUsedToday && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowReport(true)} style={{
                  padding: '5px 10px', background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.3)', borderRadius: '14px',
                  fontSize: '11px', color: '#ffd700', cursor: 'pointer',
                }}>
                {t('home.report', '✦ Today\'s Fortune Report')}
              </motion.div>
            )}
            <Link to="/history">
              <motion.div whileHover={{ scale: 1.05 }} style={{
                padding: '5px 10px', background: 'rgba(255,255,255,0.05)',
                borderRadius: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              }}>
                📜 {t('history.title')}
              </motion.div>
            </Link>
            {profile && (
              <Link to="/profile">
                <motion.div whileHover={{ scale: 1.05 }} style={{
                  padding: '5px 10px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px',
                  fontSize: '11px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                }}>
                  ✦ {profile.name}
                </motion.div>
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        }
        header={
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}>
            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 36px)',
              color: '#fff',
              fontFamily: "'Noto Serif KR', serif",
              textShadow: '0 0 30px rgba(155, 89, 182, 0.5), 0 0 30px rgba(231, 76, 60, 0.5)',
              letterSpacing: '4px',
              pointerEvents: 'none',
            }}>
              {t('app.title')}
            </h1>
            <MysticClock size={typeof window !== 'undefined' && window.innerWidth < 640 ? 110 : 140} />
            <PersonalMessage allUsedToday={allUsedToday} />
          </div>
        }
        west={
          <>
            <div style={{
              gridColumn: '1 / -1', width: '100%', textAlign: 'center', marginBottom: '4px',
              display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center',
            }}>
              <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(155,89,182,0.5))' }} />
              <span style={{
                color: '#c39bd3', fontSize: '13px', letterSpacing: '3px',
                textShadow: '0 0 12px rgba(155,89,182,0.6)',
                fontFamily: "'Cinzel', serif",
              }}>
                ✦ {t('app.western')} ✦
              </span>
              <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(155,89,182,0.5))' }} />
            </div>
            <FortuneCard title={t('home.tarot')} subtitle="Tarot" icon={<HomeCardIcon type="tarot" size={64} />} to="/tarot" theme="west" used={hasUsedToday('tarot')} onReverse={() => setReverseTarget('tarot')} />
            <FortuneCard title={t('home.horoscope')} subtitle="Horoscope" icon={<HomeCardIcon type="horoscope" size={64} />} to="/horoscope" theme="west" used={hasUsedToday('horoscope')} onReverse={() => setReverseTarget('horoscope')} />
          </>
        }
        east={
          <>
            <div style={{
              gridColumn: '1 / -1', width: '100%', textAlign: 'center', marginBottom: '4px',
              display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center',
            }}>
              <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(231,76,60,0.5))' }} />
              <span style={{
                color: '#f1948a', fontSize: '13px', letterSpacing: '3px',
                textShadow: '0 0 12px rgba(231,76,60,0.6)',
                fontFamily: "'Noto Serif KR', serif",
              }}>
                ✦ {t('app.eastern')} ✦
              </span>
              <div style={{ flex: 1, maxWidth: '60px', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(231,76,60,0.5))' }} />
            </div>
            <FortuneCard title={t('home.saju')} subtitle={t('home.sajuSub')} icon={<HomeCardIcon type="saju" size={64} />} to="/saju" theme="east" used={hasUsedToday('saju')} onReverse={() => setReverseTarget('saju')} />
            <FortuneCard title={t('home.omikuji')} subtitle={t('home.omikujiSub')} icon={<HomeCardIcon type="omikuji" size={64} />} to="/omikuji" theme="east" used={hasUsedToday('omikuji')} onReverse={() => setReverseTarget('omikuji')} />
          </>
        }
      />
      {reverseTarget && (
        <ReverseFateScreen
          fortuneType={reverseTarget}
          onComplete={() => {
            const target = reverseTarget;
            setReverseTarget(null);
            forceUpdate(n => n + 1);
            navigate(`/${target}`);
          }}
          onCancel={() => setReverseTarget(null)}
        />
      )}

      {/* Exit confirmation popup */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9500,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowExitPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a0a2e, #2e0a0a)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '16px',
                padding: '28px 24px',
                textAlign: 'center',
                maxWidth: '300px',
                width: '100%',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
              <div style={{
                fontSize: '16px', color: '#fff', fontWeight: 700, marginBottom: '8px',
                fontFamily: "'Noto Serif KR', serif",
              }}>
                {t('app.exitTitle')}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                {t('app.exitMessage')}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExitPopup(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.7)', fontSize: '14px',
                  }}
                >
                  {t('app.exitCancel')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    import('@capacitor/app').then(({ App }) => App.exitApp());
                  }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)',
                    color: '#e74c3c', fontSize: '14px',
                  }}
                >
                  {t('app.exitConfirm')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* AuthModal disabled — server features not yet active */}
      <FortuneReport isOpen={showReport} onClose={() => setShowReport(false)} />
      <Link to="/privacy" style={{
        position: 'fixed', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
        fontSize: '10px', color: 'rgba(255,255,255,0.15)', textDecoration: 'none', zIndex: 5,
      }}>
        {t('privacy.policyLink', 'Privacy Policy')}
      </Link>
    </motion.div>
  );
}
