import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';

export function HomeScreen() {
  const go = useGameStore(s => s.go);
  const previousGame = useGameStore(s => s.previousGame);
  const resetAction = useGameStore(s => s.resetAction);

  const startNew = () => {
    resetAction();
    go('players');
  };

  return (
    <>
      <StatusBar />
      <div className="screen" style={{ paddingTop: 24 }}>
        <div style={{ marginTop: 'min(8vh, 60px)', textAlign: 'center' }}>
          <p className="eyebrow">Party game · 3+ jugadores</p>
          <h1
            className="display"
            style={{
              background: 'linear-gradient(135deg, var(--brand), oklch(0.78 0.18 calc(var(--brand-h) + 60)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ACTOS
          </h1>
          <p style={{ marginTop: 12, fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.4 }}>
            Adivina pelis y series<br />
            en <b style={{ color: 'var(--fg)' }}>3 actos</b>: 3 palabras, 1 palabra, mímica.
          </p>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[
            { n: '1', t: '3 palabras' },
            { n: '2', t: '1 palabra' },
            { n: '3', t: 'Mímica' },
          ].map((a, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '16px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brand)' }}>
                {a.n}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>{a.t}</div>
            </div>
          ))}
        </div>

        {previousGame && (
          <button className="card-action" onClick={() => go('players')} style={{ marginTop: 20 }}>
            <div className="row between">
              <div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Última partida
                </div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{previousGame.title}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 2 }}>
                  {previousGame.date} · {previousGame.players} jugadores · {previousGame.mode}
                </div>
              </div>
              <span className="badge badge-good">{previousGame.status}</span>
            </div>
          </button>
        )}
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={startNew}>
          🎬 Nuevo juego
        </button>
        {previousGame && (
          <button className="btn btn-secondary" onClick={() => go('players')}>
            Continuar juego
          </button>
        )}
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%' }}
          onClick={() => go('settings')}
        >
          ⚙️ Configuración
        </button>
      </div>
    </>
  );
}
