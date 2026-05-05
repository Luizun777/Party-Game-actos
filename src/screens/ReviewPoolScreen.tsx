import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Avatar } from '@/components/common/Avatar';

export function ReviewPoolScreen() {
  const go = useGameStore(s => s.go);
  const pool = useGameStore(s => s.pool);
  const players = useGameStore(s => s.players);
  const resetAdder = useGameStore(s => s.resetAdder);
  const startGameAction = useGameStore(s => s.startGameAction);

  const movies = pool.filter(p => p.type === 'pelicula').length;
  const series = pool.filter(p => p.type === 'serie').length;
  const randomItems = pool.filter(p => p.addedBy === 'random').length;
  const tooFew = pool.length < 6 && pool.length > 0;

  const byPlayer = players.map(p => ({
    ...p,
    count: pool.filter(item => item.addedBy === p.id).length,
  }));

  const handleStart = () => {
    startGameAction();
    go('round');
  };

  return (
    <>
      <StatusBar />
      <TopBar title="Pool del juego" onBack={() => go('randomGlobal')} />
      <div className="screen">
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="eyebrow">Total</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 64, color: 'var(--brand)',
            lineHeight: 1, marginTop: 4,
          }}>
            {pool.length}
          </div>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>títulos en juego</div>

          <div className="row" style={{ justifyContent: 'center', gap: 16, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>🎬 {movies}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Películas</div>
            </div>
            <div style={{ width: 1, background: 'var(--line)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>📺 {series}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Series</div>
            </div>
          </div>
        </div>

        {tooFew && (
          <div className="card" style={{ background: 'rgba(255, 209, 102, 0.1)', borderColor: 'rgba(255, 209, 102, 0.3)' }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ fontSize: 22 }}>⚠️</div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                Pocos títulos en el pool. Recomendamos al menos 6 para una buena partida.
              </div>
            </div>
          </div>
        )}

        <p className="eyebrow">Por jugador</p>
        {byPlayer.map(p => (
          <div key={p.id} className="card row" style={{ gap: 12 }}>
            <Avatar id={p.avatarId} size="small" />
            <div className="grow" style={{ fontWeight: 600 }}>{p.name}</div>
            <span className="badge">{p.count} título{p.count !== 1 ? 's' : ''}</span>
          </div>
        ))}

        {randomItems > 0 && (
          <div className="card row" style={{ gap: 12 }}>
            <div style={{ fontSize: 22 }}>🎲</div>
            <div className="grow" style={{ fontWeight: 600 }}>Random global</div>
            <span className="badge badge-brand">{randomItems} títulos</span>
          </div>
        )}

        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={() => { resetAdder(); go('addContent'); }}
          >
            ✏️ Editar
          </button>
          <button className="btn btn-secondary" onClick={() => go('randomGlobal')}>
            🎲 + Random
          </button>
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          disabled={pool.length === 0}
          onClick={handleStart}
        >
          🎬 Empezar juego
        </button>
      </div>
    </>
  );
}
