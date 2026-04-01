/**
 * Inline Tabler Icons (MIT License)
 * Source: https://tabler.io/icons
 */

interface Props {
  name: string;
  size: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

const icons: Record<string, JSX.Element> = {
  // --- Home card icons ---
  cards: <>
    <path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" />
    <path d="M15 4h1a1 1 0 0 1 1 1v3.5" />
    <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" />
  </>,
  'moon-stars': <>
    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
    <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
    <path d="M19 11h2m-1 -1v2" />
  </>,
  'yin-yang': <>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 3a4.5 4.5 0 0 0 0 9a4.5 4.5 0 0 1 0 9" />
    <circle cx="12" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
  </>,
  torii: <>
    <path d="M4 4c5.333 1.333 10.667 1.333 16 0" />
    <path d="M4 8h16" />
    <path d="M12 5v3" />
    <path d="M18 4.5v15.5" />
    <path d="M6 4.5v15.5" />
  </>,

  // --- Omikuji step icons ---
  'droplet-half': <>
    <path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546" />
    <path d="M12 3v18" />
  </>,
  wallet: <>
    <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
    <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
  </>,
  tree: <>
    <path d="M12 13l-2 -2" />
    <path d="M12 12l2 -2" />
    <path d="M12 21v-13" />
    <path d="M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4l-.176 -.005" />
  </>,
  bulb: <>
    <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
    <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
    <path d="M9.7 17l4.6 0" />
  </>,

  // --- Decorative / step icons ---
  'crystal-ball': <>
    <path d="M6.73 17.018a8 8 0 1 1 10.54 0" />
    <path d="M5 19a2 2 0 0 0 2 2h10a2 2 0 1 0 0 -4h-10a2 2 0 0 0 -2 2" />
    <path d="M11 7a3 3 0 0 0 -3 3" />
  </>,
  sparkles: <>
    <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
  </>,
  lock: <>
    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6" />
    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
  </>,
  'file-text': <>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
    <path d="M9 9l1 0" />
    <path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </>,
  'message-circle': <>
    <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
  </>,
  compass: <>
    <path d="M8 16l2 -6l6 -2l-2 6l-6 2" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 3l0 2" />
    <path d="M12 19l0 2" />
    <path d="M3 12l2 0" />
    <path d="M19 12l2 0" />
  </>,
  heart: <>
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </>,
  history: <>
    <path d="M12 8l0 4l2 2" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
  </>,
};

export default function TablerIcon({ name, size, color = 'currentColor', strokeWidth, style }: Props) {
  const paths = icons[name];
  if (!paths) return <span style={{ fontSize: `${size}px`, ...style }}>{name}</span>;

  const sw = strokeWidth ?? (size > 40 ? 1.5 : 2);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {paths}
    </svg>
  );
}
