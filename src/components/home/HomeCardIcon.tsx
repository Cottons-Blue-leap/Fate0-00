interface Props {
  type: string;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function HomeCardIcon({ type, size, color = 'currentColor', style }: Props) {
  const sw = size > 60 ? 1.5 : 2;
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { display: 'block', ...style },
  };

  switch (type) {
    case 'tarot':
      return (
        <svg {...common}>
          <path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" />
          <path d="M15 4h1a1 1 0 0 1 1 1v3.5" />
          <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" />
        </svg>
      );
    case 'horoscope':
      return (
        <svg {...common}>
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
          <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
          <path d="M19 11h2m-1 -1v2" />
        </svg>
      );
    case 'saju':
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 3a4.5 4.5 0 0 0 0 9a4.5 4.5 0 0 1 0 9" />
          <circle cx="12" cy="7.5" r="0.7" fill={color} stroke="none" />
          <circle cx="12" cy="16.5" r="0.7" fill={color} stroke="none" />
        </svg>
      );
    case 'omikuji':
      return (
        <svg {...common}>
          <path d="M4 4c5.333 1.333 10.667 1.333 16 0" />
          <path d="M4 8h16" />
          <path d="M12 5v3" />
          <path d="M18 4.5v15.5" />
          <path d="M6 4.5v15.5" />
        </svg>
      );
    default:
      return null;
  }
}
