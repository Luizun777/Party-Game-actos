import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Avatar } from '@/components/common/Avatar';

export function ModeScreen() {
  const go = useGameStore(s => s.go);
  const mode = useGameStore(s => s.mode);
  const players = useGameStore(s => s.players);
  const teams = useGameStore(s => s.teams);
  const teamCount = useGameStore(s => s.teamCount);
  const setMode = useGameStore(s => s.setMode);
  const setTeamCount = useGameStore(s => s.setTeamCount);
  const regenTeams = useGameStore(s => s.regenTeams);

  return (
    <>
      <StatusBar />
      <TopBar title="Modo de juego" onBack={() => go('players')} />
      <div className="screen">
        <div className="seg">
          <button aria-pressed={mode === 'individual'} onClick={() => setMode('individual')}>
            Individual
          </button>
          <button aria-pressed={mode === 'teams'} onClick={() => setMode('teams')}>
            Equipos
          </button>
        </div>

        {mode === 'individual' ? (
          <>
            <p className="eyebrow" style={{ marginTop: 8 }}>Participantes</p>
            {players.map(p => (
              <div key={p.id} className="card row" style={{ gap: 12 }}>
                <Avatar id={p.avatarId} size="small" />
                <div style={{ fontWeight: 600 }}>{p.name}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="row between" style={{ marginTop: 8 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Equipos</p>
              <button className="btn btn-secondary btn-sm" onClick={regenTeams}>
                🎲 Regenerar
              </button>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <span className="muted" style={{ fontSize: 13 }}>Cantidad:</span>
              <div className="stepper" style={{ flex: 1 }}>
                <button onClick={() => setTeamCount(Math.max(2, teamCount - 1))}>−</button>
                <div className="stepper-val">{teamCount}</div>
                <button onClick={() => setTeamCount(Math.min(6, teamCount + 1))}>+</button>
              </div>
            </div>

            {teams.map((t, i) => (
              <div key={t.id} className="card" style={{ borderLeft: `6px solid ${t.color}` }}>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <div>
                    <div className="eyebrow" style={{ color: t.color }}>Equipo {i + 1}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{t.name}</div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: `${t.color}22`,
                      color: t.color,
                      borderColor: `${t.color}44`,
                    }}
                  >
                    {t.playerIds.length} jugadores
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {t.playerIds.map(pid => {
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
              </div>
            ))}

            <p className="dim" style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              💡 Pulsa "Regenerar" para mezclar equipos.
            </p>
          </>
        )}
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={() => go('category')}>
          Continuar →
        </button>
      </div>
    </>
  );
}
