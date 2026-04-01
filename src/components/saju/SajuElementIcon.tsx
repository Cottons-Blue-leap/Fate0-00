import type { FiveElement } from '@fate0/shared';

import woodSvg from '../../assets/saju/wood.svg';
import fireSvg from '../../assets/saju/fire.svg';
import earthSvg from '../../assets/saju/earth.svg';
import metalSvg from '../../assets/saju/metal.svg';
import waterSvg from '../../assets/saju/water.svg';

const elementPaths: Record<string, string> = {
  '木': woodSvg,
  '火': fireSvg,
  '土': earthSvg,
  '金': metalSvg,
  '水': waterSvg,
};

interface Props {
  element: FiveElement | string;
  size: number;
  style?: React.CSSProperties;
}

export default function SajuElementIcon({ element, size, style }: Props) {
  const src = elementPaths[element];
  if (!src) return <span style={{ fontSize: `${size}px`, ...style }}>{element}</span>;
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
