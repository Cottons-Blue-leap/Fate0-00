import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../context/ProfileContext';
import { getPersonalMessage } from '@fate0/shared';

function hashDate(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

interface Props {
  allUsedToday: boolean;
}

export default function PersonalMessage({ allUsedToday }: Props) {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const personal = useMemo(() => {
    if (!profile) return null;
    try {
      return getPersonalMessage({
        birthYear: profile.birthYear,
        birthMonth: profile.birthMonth,
        birthDay: profile.birthDay,
        birthHour: profile.birthHour,
        isLunar: profile.isLunar,
        name: profile.name,
      }, today);
    } catch {
      return null; // fallback to generic quote
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, dateStr]);

  // All fortunes used → resting message
  if (allUsedToday) {
    return (
      <div style={{
        fontSize: 'clamp(11px, 2.2vw, 13px)',
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
        maxWidth: '300px',
        lineHeight: '1.4',
        pointerEvents: 'none',
        padding: '0 8px',
        textAlign: 'center',
      }}>
        "{t('home.starsResting')}"
      </div>
    );
  }

  // No profile → fallback to generic daily quote
  if (!personal) {
    const quoteIndex = hashDate(dateStr) % 33;
    return (
      <div style={{
        fontSize: 'clamp(11px, 2.2vw, 13px)',
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
        maxWidth: '280px',
        lineHeight: '1.4',
        pointerEvents: 'none',
        padding: '0 8px',
        maxHeight: '2.8em',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        "{t(`dailyQuote.${quoteIndex}`)}"
      </div>
    );
  }

  // Personalized message
  const elementName = t(personal.elementNameKey);
  const rawMessage = t(personal.messageKey, {
    name: profile!.name,
    element: `${personal.elementEmoji} ${elementName}`,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '0 12px',
        maxWidth: '320px',
      }}
    >
      {/* Element energy badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '20px',
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.15)',
          fontSize: 'clamp(10px, 1.8vw, 11px)',
          color: 'rgba(212,175,55,0.6)',
          letterSpacing: '1px',
        }}
      >
        <span>{personal.elementEmoji}</span>
        <span>{t('personalDaily.elementLabel')}</span>
        <span style={{ margin: '0 2px', opacity: 0.4 }}>·</span>
        <span>{elementName}({personal.dayMasterElement})</span>
      </motion.div>

      {/* Main message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          fontSize: 'clamp(11px, 2.2vw, 13px)',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: '1.6',
          textAlign: 'center',
          fontStyle: 'italic',
          maxHeight: '3.6em',
          overflow: 'hidden',
          textShadow: '0 0 20px rgba(212,175,55,0.15)',
        }}
      >
        "{rawMessage}"
      </motion.div>
    </motion.div>
  );
}
