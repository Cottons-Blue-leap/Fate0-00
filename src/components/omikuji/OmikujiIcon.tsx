import toriiSvg from '../../assets/omikuji/torii.svg';
import tanabataSvg from '../../assets/omikuji/tanabata.svg';
import palmsUpSvg from '../../assets/omikuji/palms_up.svg';
import dropletSvg from '../../assets/omikuji/droplet.svg';
import clapSvg from '../../assets/omikuji/clap.svg';
import praySvg from '../../assets/omikuji/pray.svg';
import purseSvg from '../../assets/omikuji/purse.svg';
import treeSvg from '../../assets/omikuji/tree.svg';
import bulbSvg from '../../assets/omikuji/bulb.svg';

const iconMap: Record<string, string> = {
  torii: toriiSvg,
  tanabata: tanabataSvg,
  palms_up: palmsUpSvg,
  droplet: dropletSvg,
  clap: clapSvg,
  pray: praySvg,
  purse: purseSvg,
  tree: treeSvg,
  bulb: bulbSvg,
};

export type OmikujiIconName = keyof typeof iconMap;

interface Props {
  name: string;
  size: number;
  style?: React.CSSProperties;
}

export default function OmikujiIcon({ name, size, style }: Props) {
  const src = iconMap[name];
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
