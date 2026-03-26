import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../context/ProfileContext';
import { sfxButtonClick, sfxTextInput } from '../logic/soundEngine';
import { getMaxDays } from '@fate0/shared';

const PRIVACY_SEEN_KEY = 'fate0_privacy_seen';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();

  const [showPrivacy, setShowPrivacy] = useState(() => !localStorage.getItem(PRIVACY_SEEN_KEY));
  const [name, setName] = useState(profile?.name || '');
  const [birthYear, setBirthYear] = useState(profile?.birthYear || 2000);
  const [birthMonth, setBirthMonth] = useState(profile?.birthMonth || 1);
  const [birthDay, setBirthDay] = useState(profile?.birthDay || 1);
  const [birthHour, setBirthHour] = useState(profile?.birthHour || 12);
  const [isLunar, setIsLunar] = useState(profile?.isLunar || false);
  const [gender, setGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [saved, setSaved] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const maxDays = getMaxDays(birthYear, birthMonth);

  // Scroll submit button into view when keyboard opens
  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement?.tagName === 'INPUT') {
        submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    visualViewport?.addEventListener('resize', handleResize);
    return () => visualViewport?.removeEventListener('resize', handleResize);
  }, []);
  if (birthDay > maxDays) setBirthDay(maxDays);

  const handleSubmit = () => {
    sfxButtonClick();
    setProfile({ name, birthYear, birthMonth, birthDay, birthHour, isLunar, gender });
    setSaved(true);
    setTimeout(() => navigate('/'), 600);
  };

  const handleSkip = () => {
    sfxButtonClick();
    setProfile({ name: t('profile.defaultName'), birthYear: 2000, birthMonth: 1, birthDay: 1, birthHour: 12, isLunar: false, gender: 'male' });
    navigate('/');
  };

  const selStyle = {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#e0d0f0',
    fontSize: '16px',
    fontFamily: "'Noto Serif KR', serif",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2e0a0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 20px',
        color: '#e0d0f0',
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px', textShadow: '0 0 20px rgba(155,89,182,0.4)' }}>
          {t('profile.title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
          {t('profile.subtitle')}
        </p>

        {/* Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>{t('profile.name')}</label>
          <input type="text" value={name} onChange={e => { setName(e.target.value.slice(0, 50)); sfxTextInput(); }} maxLength={50} autoComplete="off"
            placeholder={t('profile.namePlaceholder')}
            style={{ ...selStyle, width: '100%', textAlign: 'center', padding: '12px 16px' }} />
        </div>

        {/* Birth date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('profile.year')}</label>
            <select value={birthYear} onChange={e => setBirthYear(+e.target.value)} style={{ ...selStyle, width: '100%' }}>
              {Array.from({ length: 80 }, (_, i) => 1950 + i).map(y => <option key={y} value={y} style={{ background: '#1a0a2e' }}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('profile.month')}</label>
            <select value={birthMonth} onChange={e => setBirthMonth(+e.target.value)} style={{ ...selStyle, width: '100%' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} style={{ background: '#1a0a2e' }}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('profile.day')}</label>
            <select value={birthDay} onChange={e => setBirthDay(+e.target.value)} style={{ ...selStyle, width: '100%' }}>
              {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => <option key={d} value={d} style={{ background: '#1a0a2e' }}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Birth hour */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('profile.hour')}</label>
          <select value={birthHour} onChange={e => setBirthHour(+e.target.value)} style={{ ...selStyle, width: '100%' }}>
            {Array.from({ length: 24 }, (_, i) => i).map(h => <option key={h} value={h} style={{ background: '#1a0a2e' }}>{h}:00</option>)}
          </select>
        </div>

        {/* Lunar/Solar + Gender */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsLunar(!isLunar)}
            style={{ ...selStyle, cursor: 'pointer', background: isLunar ? 'rgba(155,89,182,0.3)' : 'rgba(255,255,255,0.05)' }}>
            {isLunar ? t('profile.lunar') : t('profile.solar')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setGender(g => g === 'male' ? 'female' : 'male')}
            style={{ ...selStyle, cursor: 'pointer' }}>
            {gender === 'male' ? t('profile.male') : t('profile.female')}
          </motion.button>
        </div>

        {/* Submit */}
        <motion.button ref={submitRef} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', fontSize: '18px', color: '#fff',
            background: 'linear-gradient(135deg, rgba(155,89,182,0.4), rgba(231,76,60,0.4))',
            border: '1px solid rgba(255,255,255,0.2)',
            opacity: name.trim() ? 1 : 0.4,
            marginBottom: '12px',
          }}>
          {t('profile.submit')}
        </motion.button>

        {saved && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ color: '#2ecc71', fontSize: '24px', marginBottom: '8px' }}>
            ✓
          </motion.div>
        )}

        {/* Skip */}
        <motion.button whileHover={{ scale: 1.02 }} onClick={handleSkip}
          style={{ background: 'none', fontSize: '14px', color: 'rgba(255,255,255,0.4)', padding: '8px' }}>
          {t('profile.skip')}
        </motion.button>
      </motion.div>

      {/* First-visit privacy notice */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10, 5, 20, 0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                maxWidth: '360px', width: '100%',
                textAlign: 'center', padding: '2rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(26,10,46,0.95), rgba(46,10,10,0.95))',
                borderRadius: '16px',
                border: '1px solid rgba(155, 89, 182, 0.2)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '16px', color: '#c39bd3', letterSpacing: '8px' }}>✦ ✦ ✦</div>
              <p style={{
                fontSize: '15px', lineHeight: '2',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '24px',
                whiteSpace: 'pre-line',
              }}>
                {t('privacy.notice')}
              </p>
              <p style={{
                fontSize: '12px', lineHeight: '1.8',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '28px',
                whiteSpace: 'pre-line',
              }}>
                {t('privacy.detail')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.setItem(PRIVACY_SEEN_KEY, '1');
                  setShowPrivacy(false);
                }}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, rgba(155,89,182,0.4), rgba(231,76,60,0.4))',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#e0d0f0', fontSize: '15px',
                  fontFamily: "'Noto Serif KR', serif",
                  cursor: 'pointer',
                }}
              >
                {t('privacy.confirm', '알겠습니다')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
