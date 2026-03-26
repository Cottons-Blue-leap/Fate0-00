// SVG-based mystical background patterns for each fortune type

function StarPattern() {
  // Scattered small stars with subtle twinkle
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
      <defs>
        <pattern id="stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="15" r="0.8" fill="#fff" />
          <circle cx="45" cy="8" r="0.5" fill="#fff" />
          <circle cx="70" cy="35" r="1" fill="#fff" />
          <circle cx="25" cy="55" r="0.6" fill="#fff" />
          <circle cx="60" cy="65" r="0.7" fill="#fff" />
          <circle cx="5" cy="75" r="0.4" fill="#fff" />
          <circle cx="40" cy="42" r="0.9" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stars)" />
    </svg>
  );
}

function TarotPattern() {
  // Pentagram / sacred geometry lines
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
      <defs>
        <pattern id="tarot-geo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#9b59b6" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#9b59b6" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="20" fill="none" stroke="#9b59b6" strokeWidth="0.3" />
          {/* Pentagram */}
          {[0, 1, 2, 3, 4].map(i => {
            const a1 = ((i * 144 - 90) * Math.PI) / 180;
            const a2 = (((i + 1) * 144 - 90) * Math.PI) / 180;
            return (
              <line key={i}
                x1={100 + 60 * Math.cos(a1)} y1={100 + 60 * Math.sin(a1)}
                x2={100 + 60 * Math.cos(a2)} y2={100 + 60 * Math.sin(a2)}
                stroke="#9b59b6" strokeWidth="0.3"
              />
            );
          })}
          {/* Cross lines */}
          <line x1="100" y1="10" x2="100" y2="190" stroke="#9b59b6" strokeWidth="0.15" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="#9b59b6" strokeWidth="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tarot-geo)" />
    </svg>
  );
}

function HoroscopePattern() {
  // Constellation-like connected dots
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
      <defs>
        <pattern id="constellation" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
          {/* Constellation 1 */}
          <circle cx="20" cy="30" r="1.5" fill="#c39bd3" />
          <circle cx="50" cy="20" r="1" fill="#c39bd3" />
          <circle cx="45" cy="55" r="1.2" fill="#c39bd3" />
          <circle cx="80" cy="40" r="0.8" fill="#c39bd3" />
          <line x1="20" y1="30" x2="50" y2="20" stroke="#c39bd3" strokeWidth="0.3" />
          <line x1="50" y1="20" x2="45" y2="55" stroke="#c39bd3" strokeWidth="0.3" />
          <line x1="45" y1="55" x2="80" y2="40" stroke="#c39bd3" strokeWidth="0.3" />
          {/* Constellation 2 */}
          <circle cx="100" cy="90" r="1" fill="#c39bd3" />
          <circle cx="130" cy="75" r="1.3" fill="#c39bd3" />
          <circle cx="120" cy="110" r="0.8" fill="#c39bd3" />
          <line x1="100" y1="90" x2="130" y2="75" stroke="#c39bd3" strokeWidth="0.3" />
          <line x1="130" y1="75" x2="120" y2="110" stroke="#c39bd3" strokeWidth="0.3" />
          <line x1="120" y1="110" x2="100" y2="90" stroke="#c39bd3" strokeWidth="0.3" />
          {/* Scattered stars */}
          <circle cx="70" cy="120" r="0.5" fill="#c39bd3" />
          <circle cx="15" cy="100" r="0.4" fill="#c39bd3" />
          <circle cx="140" cy="30" r="0.6" fill="#c39bd3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#constellation)" />
    </svg>
  );
}

function SajuPattern() {
  // Bagua / I-Ching trigram-like patterns
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
      <defs>
        <pattern id="trigram" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Trigram-like horizontal lines */}
          <rect x="30" y="20" width="25" height="3" rx="1" fill="#e74c3c" />
          <rect x="60" y="20" width="25" height="3" rx="1" fill="#e74c3c" />
          <rect x="30" y="28" width="55" height="3" rx="1" fill="#e74c3c" />
          <rect x="30" y="36" width="25" height="3" rx="1" fill="#e74c3c" />
          <rect x="60" y="36" width="25" height="3" rx="1" fill="#e74c3c" />
          {/* Octagon */}
          <polygon points="60,55 75,62 80,78 75,93 60,100 45,93 40,78 45,62"
            fill="none" stroke="#e74c3c" strokeWidth="0.4" />
          {/* Yin-yang hint */}
          <circle cx="60" cy="78" r="12" fill="none" stroke="#e74c3c" strokeWidth="0.3" />
          <path d="M 60 66 A 6 6 0 0 1 60 78 A 6 6 0 0 0 60 90" fill="none" stroke="#e74c3c" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#trigram)" />
    </svg>
  );
}

function OmikujiPattern() {
  // Torii gate / shrine-like patterns + cherry blossom hints
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
      <defs>
        <pattern id="shrine" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
          {/* Mini torii gate */}
          <line x1="60" y1="30" x2="60" y2="70" stroke="#e74c3c" strokeWidth="1" />
          <line x1="100" y1="30" x2="100" y2="70" stroke="#e74c3c" strokeWidth="1" />
          <line x1="55" y1="30" x2="105" y2="30" stroke="#e74c3c" strokeWidth="1.5" />
          <line x1="58" y1="40" x2="102" y2="40" stroke="#e74c3c" strokeWidth="0.5" />
          {/* Cherry blossom petals */}
          <circle cx="30" cy="100" r="2" fill="#f1948a" opacity="0.5" />
          <circle cx="33" cy="97" r="2" fill="#f1948a" opacity="0.4" />
          <circle cx="27" cy="97" r="2" fill="#f1948a" opacity="0.4" />
          <circle cx="33" cy="103" r="2" fill="#f1948a" opacity="0.3" />
          <circle cx="27" cy="103" r="2" fill="#f1948a" opacity="0.3" />
          {/* Scattered petals */}
          <circle cx="120" cy="85" r="1.5" fill="#f1948a" opacity="0.3" />
          <circle cx="140" cy="120" r="1" fill="#f1948a" opacity="0.2" />
          <circle cx="20" cy="140" r="1.2" fill="#f1948a" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#shrine)" />
    </svg>
  );
}

function HomePattern() {
  // Combined: stars + subtle zodiac wheel + vignette
  return (
    <>
      <StarPattern />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="8 8" />
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#fff" strokeWidth="0.3" />
        <circle cx="50%" cy="50%" r="15%" fill="none" stroke="#fff" strokeWidth="0.2" strokeDasharray="4 6" />
      </svg>
      {/* Side decorations — zodiac symbols faintly along edges (desktop only) */}
      <div className="side-decor" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Left: western zodiac arc */}
        <div style={{
          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center',
          opacity: 0.08, fontSize: '18px', color: '#c39bd3',
        }}>
          {'♈♉♊♋♌♍♎♏♐♑♒♓'.split('').filter((_, i) => i % 2 === 0).map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        {/* Right: eastern symbols arc */}
        <div style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center',
          opacity: 0.08, fontSize: '16px', color: '#f1948a',
        }}>
          {'☰☱☲☳☴☵☶☷'.split('').filter((_, i) => i % 2 === 0).map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
      </div>
      {/* Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
      }} />
    </>
  );
}

export type PatternType = 'home' | 'tarot' | 'horoscope' | 'saju' | 'omikuji';

export default function MysticBackground({ pattern = 'home' }: { pattern?: PatternType }) {
  const patterns: Record<PatternType, React.ReactNode> = {
    home: <HomePattern />,
    tarot: <><StarPattern /><TarotPattern /></>,
    horoscope: <><StarPattern /><HoroscopePattern /></>,
    saju: <><StarPattern /><SajuPattern /></>,
    omikuji: <><StarPattern /><OmikujiPattern /></>,
  };
  return <>{patterns[pattern]}</>;
}
