import { useMemo } from 'react';

const CONFETTI_COLORS = [
  '#FFB3B3', '#B5D9FF', '#BFEFC5', '#FFE3A3',
  '#D9C2FF', '#FFC9E5', '#66E0A1', '#FF7AB6', '#7AC9FF',
];

interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 180 }: ConfettiProps) {
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.4,
      rotate: Math.random() * 360,
      duration: 7 + Math.random() * 4,
    })),
    [count]
  );

  return (
    <div className="confetti-layer">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
