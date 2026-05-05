import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { Avatar } from '@/components/common/Avatar';
import { ACTS } from '@/domain/models';
import type { ActNumber } from '@/domain/models';

export function ActEndScreen() {
  const go = useGameStore(s => s.go);
  const act = useGameStore(s => s.act);
  const nextActAction = useGameStore(s => s.nextActAction);
  const mode = useGameStore(s => s.mode);
  const teams = useGameStore(s => s.teams);
  const players = useGameStore(s => s.players);
  const scores = useGameStore(s => s.scores);

  const ranked = useMemo(() => {
    if (mode === 'teams') {
      return [...teams]
        .map((t, i) => ({ name: t.name, color: t.color, score: scores[i] ?? 0 }))
        .sort((a, b) => b.score - a.score);
    }
    return [...players]
      .map((p, i) => ({ name: p.name, color: 'var(--brand)' as string, score: scores[i] ?? 0, avatarId: p.avatarId }))
      .sort((a, b) => b.score - a.score);
  }, [mode, teams, players, scores]);

  const isLastAct = act >= 3;
  const actInfo = ACTS[act as ActNumber];

  const handleNext = () => {
    if (isLastAct) {
      go('final');
    } else {
      nextActAction();
      go('round');
    }
  };

  return (
    <>
      <StatusBar />
      <div className="screen" style={{ paddingTop: 24 }}>
        <div style={{ textAlign: 'center', marginTop: 'min(8vh, 40px)' }}>
          <div style={{ fontSize: 64, animation: 'pop-in 400ms var(--ease-spring)' }}>
            {actInfo.emoji}
          </div>
          <p className="eyebrow" style={{ marginTop: 8 }}>Acto {act} terminado</p>
          <h2 className="display-sm" style={{ marginTop: 4 }}>
            {actInfo.label} ✓
          </h2>
        </div>

        <p className="eyebrow" style={{ textAlign: 'center', marginTop: 24 }}>Puntajes parciales</p>
        <div className="col" style={{ gap: 8 }}>
          {ranked.map((r, i) => (
            <div
              key={i}
              className="card row"
              style={{
                gap: 12,
                borderLeft: `6px solid ${r.color}`,
                animation: `slide-up 300ms ${i * 80}ms both`,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22,
                color: 'var(--fg-3)', width: 24, textAlign: 'center',
              }}>
                {i + 1}
              </div>
              {'avatarId' in r && typeof r.avatarId === 'string' && r.avatarId && (
                <Avatar id={r.avatarId} size="small" />
              )}
              <div className="grow" style={{ fontWeight: 700 }}>{r.name}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 28,
                color: r.color, letterSpacing: '-0.02em',
              }}>
                {r.score}
              </div>
            </div>
          ))}
        </div>

        <div
          className="card"
          style={{
            marginTop: 8,
            background: 'oklch(0.72 0.22 var(--brand-h) / 0.08)',
            borderColor: 'oklch(0.72 0.22 var(--brand-h) / 0.2)',
          }}
        >
          <div className="row" style={{ gap: 10 }}>
            <div style={{ fontSize: 22 }}>🔄</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.4 }}>
              {isLastAct
                ? '¡Último acto completado! Vamos a los resultados finales.'
                : 'Todos los títulos vuelven al pool. Los puntajes se mantienen.'}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={handleNext}>
          {isLastAct ? '🏆 Ver resultados' : `▶ Iniciar Acto ${act + 1}`}
        </button>
      </div>
    </>
  );
}
