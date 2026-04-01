import tarotImg from '../../assets/home/tarot.png';
import horoscopeImg from '../../assets/home/horoscope.png';
import sajuImg from '../../assets/home/saju.png';
import omikujiImg from '../../assets/home/omikuji.png';

const iconMap: Record<string, string> = {
  tarot: tarotImg,
  horoscope: horoscopeImg,
  saju: sajuImg,
  omikuji: omikujiImg,
};

interface Props {
  type: string;
  size: number;
  style?: React.CSSProperties;
}

export default function HomeCardIcon({ type, size, style }: Props) {
  const src = iconMap[type];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{
        display: 'block',
        borderRadius: `${Math.round(size * 0.12)}px`,
        ...style,
      }}
    />
  );
}
