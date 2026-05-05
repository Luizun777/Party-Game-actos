import { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { Confetti } from '@/components/common/Confetti';
import { Avatar } from '@/components/common/Avatar';

export function FinalScreen() {
  const go = useGameStore(s => s.go);
  const replaySameAction = useGameStore(s => s.replaySameAction);
  const resetAction = useGameStore(s => s.resetAction);
  const resetAdder = useGameStore(s => s.resetAdder);
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

  const top = ranked[0]?.score ?? 0;
  const winners = ranked.filter(r => r.score === top);
  const isTie = winners.length > 1;

  return (
    <>
      <StatusBar />
      <Confetti count={180} />
      <div className="screen" style={{ paddingTop: 24, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginTop: 'min(6vh, 32px)' }}>
          <div style={{ fontSize: 88, animation: 'pop-in 500ms var(--ease-spring)' }}>
            {isTie ? '🤝' : '🏆'}
          </div>
          <p className="eyebrow" style={{ marginTop: 12 }}>{isTie ? 'Empate' : 'Ganador'}</p>
          <h2
            className="display"
            style={{
              fontSize: 'clamp(36px, 9vw, 56px)',
              marginTop: 4,
              background: `linear-gradient(135deg, ${winners[0]?.color ?? 'var(--brand)'}, oklch(0.78 0.18 calc(var(--brand-h) + 60)))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isTie ? '¡EMPATE!' : winners[0]?.name.toUpperCase()}
          </h2>
          {isTie && (
            <div style={{ marginTop: 8, fontSize: 14, color: 'var(--fg-2)' }}>
              {winners.map(w => w.name).join(' & ')}
            </div>
          )}
        </div>

        <p className="eyebrow" style={{ textAlign: 'center', marginTop: 32 }}>Ranking final</p>
        <div className="col" style={{ gap: 8 }}>
          {ranked.map((r, i) => (
            <div
              key={i}
              className="card row"
              style={{
                gap: 12,
                borderLeft: `6px solid ${r.color}`,
                background: i === 0 ? `${r.color}15` : 'var(--surface)',
                animation: `slide-up 320ms ${i * 100}ms both`,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 26,
                color: i === 0 ? r.color : 'var(--fg-3)',
                width: 28, textAlign: 'center',
              }}>
                {i === 0 ? (isTie ? '🤝' : '🏆') : i + 1}
              </div>
              {'avatarId' in r && typeof r.avatarId === 'string' && r.avatarId && (
                <Avatar id={r.avatarId} size="small" />
              )}
              <div className="grow" style={{ fontWeight: 700, fontSize: i === 0 ? 17 : 15 }}>
                {r.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: i === 0 ? 32 : 24,
                color: r.color,
                letterSpacing: '-0.02em',
              }}>
                {r.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          onClick={() => { replaySameAction(); go('round'); }}
        >
          🔁 Volver a jugar
        </button>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => go('players')}
          >
            Editar jugadores
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            onClick={() => { resetAdder(); go('reviewPool'); }}
          >
            Editar contenido
          </button>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%' }}
          onClick={() => { resetAction(); go('home'); }}
        >
          🆕 Nuevo juego
        </button>
      </div>
    </>
  );
}
