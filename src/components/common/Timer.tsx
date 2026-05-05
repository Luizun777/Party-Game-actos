interface TimerProps {
  seconds: number;
  total?: number;
  paused?: boolean;
}

export function Timer({ seconds, total = 60, paused = false }: TimerProps) {
  const danger = seconds <= 10;
  const r = 84;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - seconds / total);

  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke={danger ? 'var(--bad)' : 'var(--brand)'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 200ms' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: 64,
        letterSpacing: '-0.04em',
        animation: danger && !paused ? 'pulse 1s infinite' : 'none',
        color: danger ? 'var(--bad)' : 'var(--fg)',
      }}>
        <span className="tabular">{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
