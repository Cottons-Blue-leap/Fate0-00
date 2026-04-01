import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getShare } from '../services/api';
import TablerIcon from '../components/common/TablerIcon';

export default function SharedReadingPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [data, setData] = useState<{ type: string; data: Record<string, unknown>; createdAt: string } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getShare(id)
      .then((result) => setData(result as { type: string; data: Record<string, unknown>; createdAt: string }))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const typeLabels: Record<string, { icon: React.ReactNode; color: string }> = {
    tarot: { icon: <TablerIcon name="cards" size={48} color="#c39bd3" />, color: '#9b59b6' },
    horoscope: { icon: <TablerIcon name="moon-stars" size={48} color="#c39bd3" />, color: '#9b59b6' },
    saju: { icon: <TablerIcon name="yin-yang" size={48} color="#f1948a" />, color: '#e74c3c' },
    omikuji: { icon: <TablerIcon name="torii" size={48} color="#f1948a" />, color: '#e74c3c' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a2e, #2e0a0a)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Noto Serif KR', serif",
        color: '#e0e0e0',
      }}
    >
      {loading && <div style={{ fontSize: '24px', animation: 'spin 2s linear infinite' }}>✦</div>}

      {error && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}><TablerIcon name="crystal-ball" size={48} color="#c39bd3" /></div>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>
            {t('share.notFound', 'This reading has expired or does not exist.')}
          </p>
          <Link to="/" style={{ color: '#9b59b6', marginTop: '1rem', display: 'inline-block' }}>
            {t('share.goHome', 'Try your own fortune')} →
          </Link>
        </div>
      )}

      {data && (
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>
            {typeLabels[data.type]?.icon || '✦'}
          </div>
          <h1 style={{
            fontSize: '1.3rem',
            color: typeLabels[data.type]?.color || '#c39bd3',
            marginBottom: '0.5rem',
          }}>
            {t(`fortune.${data.type}`, data.type)}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
            {data.createdAt}
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'left',
            lineHeight: '1.8',
            fontSize: '0.95rem',
          }}>
            {renderReadingData(data.type, data.data)}
          </div>

          <Link
            to="/"
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9b59b6, #e74c3c)',
              borderRadius: '12px',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            {t('share.tryOwn', 'Try your own fortune')} ✦
          </Link>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function renderReadingData(type: string, data: Record<string, unknown>): React.ReactNode {
  if (type === 'tarot') {
    const cards = data['cards'] as Array<{ name: string; isReversed?: boolean }> | undefined;
    if (cards) {
      return (
        <div>
          {cards.map((card, i) => (
            <div key={i} style={{ marginBottom: '0.5rem' }}>
              🃏 {card.name} {card.isReversed ? '(Reversed)' : ''}
            </div>
          ))}
          {data['summary'] ? <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)' }}>{String(data['summary'])}</p> : null}
        </div>
      );
    }
  }

  if (type === 'saju') {
    const pillars = data['pillars'] as string[] | undefined;
    if (pillars) {
      return <div>{pillars.map((p, i) => <div key={i} style={{ marginBottom: '0.3rem' }}>{p}</div>)}</div>;
    }
  }

  // Generic fallback
  const summary = data['summary'] || data['result'] || data['rank'];
  return <p>{summary ? String(summary) : JSON.stringify(data, null, 2)}</p>;
}
