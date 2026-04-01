import TablerIcon from '../common/TablerIcon';

// Noto Emoji assets (kept for icons Tabler doesn't have)
import tanabataSvg from '../../assets/omikuji/tanabata.svg';
import palmsUpSvg from '../../assets/omikuji/palms_up.svg';
import clapSvg from '../../assets/omikuji/clap.svg';
import praySvg from '../../assets/omikuji/pray.svg';

const notoMap: Record<string, string> = {
  tanabata: tanabataSvg,
  palms_up: palmsUpSvg,
  clap: clapSvg,
  pray: praySvg,
};

// Icons replaced by Tabler (MIT)
const tablerMap: Record<string, string> = {
  torii: 'torii',
  droplet: 'droplet-half',
  purse: 'wallet',
  tree: 'tree',
  bulb: 'bulb',
};

interface Props {
  name: string;
  size: number;
  style?: React.CSSProperties;
}

export default function OmikujiIcon({ name, size, style }: Props) {
  // Tabler icons
  const tablerName = tablerMap[name];
  if (tablerName) {
    return <TablerIcon name={tablerName} size={size} color="#f1948a" style={style} />;
  }

  // Noto Emoji fallback
  const src = notoMap[name];
  if (!src) return <span style={{ fontSize: `${size}px`, ...style }}>{name}</span>;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}
