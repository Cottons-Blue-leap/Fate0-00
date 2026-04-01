import stemGap from '../../assets/saju/stem-gap.svg';
import stemEul from '../../assets/saju/stem-eul.svg';
import stemByeong from '../../assets/saju/stem-byeong.svg';
import stemJeong from '../../assets/saju/stem-jeong.svg';
import stemMu from '../../assets/saju/stem-mu.svg';
import stemGi from '../../assets/saju/stem-gi.svg';
import stemGyeong from '../../assets/saju/stem-gyeong.svg';
import stemSin from '../../assets/saju/stem-sin.svg';
import stemIm from '../../assets/saju/stem-im.svg';
import stemGye from '../../assets/saju/stem-gye.svg';

const stemPaths: Record<string, string> = {
  '甲': stemGap,
  '乙': stemEul,
  '丙': stemByeong,
  '丁': stemJeong,
  '戊': stemMu,
  '己': stemGi,
  '庚': stemGyeong,
  '辛': stemSin,
  '壬': stemIm,
  '癸': stemGye,
};

// Reverse lookup from emoji to stem for backward compat with stored history
const emojiToStem: Record<string, string> = {
  '🌳': '甲', '🌿': '乙', '☀️': '丙', '🕯️': '丁', '⛰️': '戊',
  '🌾': '己', '⚔️': '庚', '💎': '辛', '🌊': '壬', '💧': '癸',
};

interface Props {
  stem?: string;
  emoji?: string;
  size: number;
  style?: React.CSSProperties;
}

export default function SajuStemIcon({ stem, emoji, size, style }: Props) {
  const resolvedStem = stem || (emoji ? emojiToStem[emoji] : undefined);
  const src = resolvedStem ? stemPaths[resolvedStem] : undefined;
  if (!src) return <span style={{ fontSize: `${size}px`, ...style }}>{emoji || stem || ''}</span>;
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
