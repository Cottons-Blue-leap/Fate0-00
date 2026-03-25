import { useState, useEffect } from 'react';

export default function MysticClock({ size = 120 }: { size?: number }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const isZeroHour = now.getHours() === 0;
  const glowColor = isZeroHour ? '#ffd700' : '#9b59b6';
  const glowIntensity = isZeroHour ? '0.8' : '0.3';

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Zodiac symbols around the clock face
  const zodiacSymbols = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: `drop-shadow(0 0 15px ${glowColor}${glowIntensity === '0.8' ? 'cc' : '66'})` }}>
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={glowColor} strokeWidth="0.5" opacity="0.3" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={glowColor} strokeWidth="1" opacity="0.15" />

      {/* Inner mystical circles */}
      <circle cx={cx} cy={cy} r={r * 0.85} fill="none" stroke="rgba(155,89,182,0.1)" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke="rgba(155,89,182,0.08)" strokeWidth="0.5" />

      {/* Zodiac symbols at hour positions */}
      {zodiacSymbols.map((symbol, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = cx + (r * 0.72) * Math.cos(angle);
        const y = cy + (r * 0.72) * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.075} fill="rgba(255,255,255,0.25)" fontFamily="serif">
            {symbol}
          </text>
        );
      })}

      {/* Tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i * 6 - 90) * Math.PI / 180;
        const isHour = i % 5 === 0;
        const innerR = r * (isHour ? 0.88 : 0.93);
        const outerR = r * 0.97;
        return (
          <line key={i}
            x1={cx + innerR * Math.cos(angle)} y1={cy + innerR * Math.sin(angle)}
            x2={cx + outerR * Math.cos(angle)} y2={cy + outerR * Math.sin(angle)}
            stroke={isHour ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
            strokeWidth={isHour ? 1.5 : 0.5}
          />
        );
      })}

      {/* Moon phase indicator (decorative, top-left) */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={size * 0.04} fill="rgba(255,255,255,0.06)" />
      <circle cx={cx - r * 0.28} cy={cy - r * 0.3} r={size * 0.035} fill="rgba(0,0,0,0.3)" />

      {/* Hour hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + r * 0.45 * Math.cos((hourAngle - 90) * Math.PI / 180)}
        y2={cy + r * 0.45 * Math.sin((hourAngle - 90) * Math.PI / 180)}
        stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + r * 0.65 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
        y2={cy + r * 0.65 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
        stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* Second hand */}
      <line
        x1={cx - r * 0.1 * Math.cos((secondAngle - 90) * Math.PI / 180)}
        y1={cy - r * 0.1 * Math.sin((secondAngle - 90) * Math.PI / 180)}
        x2={cx + r * 0.7 * Math.cos((secondAngle - 90) * Math.PI / 180)}
        y2={cy + r * 0.7 * Math.sin((secondAngle - 90) * Math.PI / 180)}
        stroke={glowColor} strokeWidth="0.8" strokeLinecap="round" opacity="0.7"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill={glowColor} opacity="0.8" />
      <circle cx={cx} cy={cy} r="1.5" fill="#fff" />

      {/* Rune-like decorative marks at cardinal points */}
      {[0, 90, 180, 270].map((angle, i) => {
        const a = (angle - 90) * Math.PI / 180;
        const x = cx + (r + 5) * Math.cos(a);
        const y = cy + (r + 5) * Math.sin(a);
        const runes = ['✦', '◆', '✦', '◆'];
        return (
          <text key={`rune-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.06} fill={glowColor} opacity="0.4">
            {runes[i]}
          </text>
        );
      })}
    </svg>
  );
}
