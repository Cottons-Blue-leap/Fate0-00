interface Props {
  id: number;
  size: number;
  reversed?: boolean;
  style?: React.CSSProperties;
}

export default function TarotCardIcon({ id, size, reversed, style }: Props) {
  const src = `/tarot/${String(id).padStart(2, '0')}.webp`;
  return (
    <img
      src={src}
      alt=""
      width={size}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: size > 30 ? '3px' : '2px',
        transform: reversed ? 'rotate(180deg)' : 'none',
        ...style,
      }}
    />
  );
}
