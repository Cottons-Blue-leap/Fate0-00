import TablerIcon from '../common/TablerIcon';

const typeToIcon: Record<string, string> = {
  tarot: 'cards',
  horoscope: 'moon-stars',
  saju: 'yin-yang',
  omikuji: 'torii',
};

interface Props {
  type: string;
  size: number;
  color?: string;
  style?: React.CSSProperties;
}

export default function HomeCardIcon({ type, size, color, style }: Props) {
  const iconName = typeToIcon[type];
  if (!iconName) return null;
  return <TablerIcon name={iconName} size={size} color={color} style={{ display: 'block', ...style }} />;
}
