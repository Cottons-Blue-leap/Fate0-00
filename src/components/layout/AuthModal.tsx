import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const { login, register, loading, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    setLocalError('');
    if (!email || !password) {
      setLocalError(t('auth.fillAll', 'Please fill in all fields'));
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setLocalError(t('auth.passwordMin', 'Password must be at least 6 characters'));
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
      setEmail('');
      setPassword('');
    } catch {
      // error is set in AuthContext
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '360px',
              border: '1px solid rgba(155, 89, 182, 0.3)',
            }}
          >
            <h2 style={{ color: '#c39bd3', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              {mode === 'login' ? t('auth.login', 'Login') : t('auth.register', 'Register')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="email"
                placeholder={t('auth.email', 'Email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder={t('auth.password', 'Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
              />

              {(localError || error) && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: 0 }}>{localError || error}</p>
              )}

              <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
                {loading ? '...' : mode === 'login' ? t('auth.login', 'Login') : t('auth.register', 'Register')}
              </button>

              <p
                style={{ color: '#8e8e8e', fontSize: '0.85rem', textAlign: 'center', cursor: 'pointer', margin: 0 }}
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setLocalError('');
                }}
              >
                {mode === 'login'
                  ? t('auth.noAccount', "Don't have an account? Register")
                  : t('auth.hasAccount', 'Already have an account? Login')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(155, 89, 182, 0.3)',
  borderRadius: '8px',
  padding: '0.7rem 1rem',
  color: '#e0e0e0',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem',
  color: '#fff',
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 'bold',
  marginTop: '0.5rem',
};
