import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { Avatar } from '@/components/common/Avatar';

export function TurnTransitionScreen() {
  const go = useGameStore(s => s.go);
  const mode = useGameStore(s => s.mode);
  const teams = useGameStore(s => s.teams);
  const players = useGameStore(s => s.players);
  const currentTurnIdx = useGameStore(s => s.currentTurnIdx);
  const scores = useGameStore(s => s.scores);

  const team = mode === 'teams' ? teams[currentTurnIdx] : null;
  const player = mode === 'individual' ? players[currentTurnIdx] : null;
  const turnColor = team ? team.color : 'var(--brand)';
  const turnName = team ? team.name : player?.name ?? '';
  const score = scores[currentTurnIdx] ?? 0;

  return (
    <>
      <StatusBar />
      <div
        className="screen"
        style={{
          paddingTop: 24,
          background: `radial-gradient(circle at 50% 30%, ${turnColor}33, transparent 60%)`,
        }}
      >
        <div style={{ textAlign: 'center', marginTop: 'min(6vh, 32px)' }}>
          <div style={{ fontSize: 56, animation: 'pop-in 320ms var(--ease-spring)' }}>⏰</div>
          <div className="display-sm" style={{ marginTop: 8, fontSize: 28 }}>¡SE ACABÓ EL TIEMPO!</div>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Cambio de turno</p>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p className="eyebrow">Sigue</p>
          <div style={{
            marginTop: 12,
            padding: '24px 16px',
            background: `${turnColor}1f`,
            border: `2px solid ${turnColor}`,
            borderRadius: 'var(--radius-lg)',
            animation: 'pop-in 420ms 120ms var(--ease-spring) both',
          }}>
            {team ? (
              <>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: turnColor, margin: '0 auto 12px',
                }} />
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 38, lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {turnName.toUpperCase()}
                </div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {team.playerIds.map(pid => {
                    const p = players.find(pp => pp.id === pid);
                    if (!p) return null;
                    return (
                      <div
                        key={pid}
                        className="row"
                        style={{
                          gap: 6, padding: '4px 10px 4px 4px',
                          background: 'var(--surface-2)', borderRadius: 999,
                        }}
                      >
                        <Avatar id={p.avatarId} size="small" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <Avatar id={player?.avatarId ?? ''} size="large" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '-0.02em' }}>
                  {turnName.toUpperCase()}
                </div>
              </>
            )}
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--fg-2)' }}>
              Puntaje actual:{' '}
              <b style={{ color: turnColor, fontFamily: 'var(--font-display)', fontSize: 18, marginLeft: 4 }}>
                {score}
              </b>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          onClick={() => go('round')}
          style={{
            background: turnColor,
            color: '#1a0a14',
            boxShadow: `0 8px 24px -8px ${turnColor}`,
          }}
        >
          ▶ Empezar turno
        </button>
      </div>
    </>
  );
}
