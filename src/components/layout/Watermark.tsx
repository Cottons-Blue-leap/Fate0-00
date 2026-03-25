import { useProfile } from '../../context/ProfileContext';

export default function Watermark() {
  const { profile } = useProfile();
  const nameLabel = profile?.name ? `${profile.name}님의 운세` : '';

  return (
    <div style={{
      textAlign: 'center',
      padding: '16px 0 4px',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.2)',
      letterSpacing: '2px',
      fontFamily: 'monospace',
    }}>
      {nameLabel && <div style={{ marginBottom: '4px' }}>{nameLabel}</div>}
      ✦ 운명 0시 · Fate 0:00 ✦
    </div>
  );
}
