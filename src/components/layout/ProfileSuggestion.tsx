import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';

export default function ProfileSuggestion() {
  const { t } = useTranslation();
  const { hasProfile } = useProfile();

  if (hasProfile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      style={{ textAlign: 'center', marginTop: '20px' }}
    >
      <Link
        to="/profile"
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '12px',
          fontSize: '13px',
          color: 'rgba(212,175,55,0.7)',
          textDecoration: 'none',
        }}
      >
        ✦ {t('share.profileSuggestion', 'Save your profile for a faster experience next time')}
      </Link>
    </motion.div>
  );
}
