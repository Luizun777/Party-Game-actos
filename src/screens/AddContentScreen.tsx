import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { Poster } from '@/components/common/Poster';
import { ProgressDots } from '@/components/common/ProgressDots';
import { Toast } from '@/components/common/Toast';
import { getMediaProvider } from '@/services/media';
import type { MediaItem } from '@/domain/models';

export function AddContentScreen() {
  const go = useGameStore(s => s.go);
  const players = useGameStore(s => s.players);
  const pool = useGameStore(s => s.pool);
  const category = useGameStore(s => s.category);
  const itemLimit = useGameStore(s => s.itemLimit);
  const currentAdderIdx = useGameStore(s => s.currentAdderIdx);
  const addToPool = useGameStore(s => s.addToPool);
  const removeFromPool = useGameStore(s => s.removeFromPool);
  const addManualToPool = useGameStore(s => s.addManualToPool);
  const nextAdder = useGameStore(s => s.nextAdder);
  const prevAdder = useGameStore(s => s.prevAdder);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = players[currentAdderIdx];
  if (!player) return null;

  const playerItems = pool.filter(p => p.addedBy === player.id);
  const isUnlimited = itemLimit === -1;
  const reachedMax = !isUnlimited && playerItems.length >= itemLimit;
  const canProceed = playerItems.length >= 1 || isUnlimited;
  const isLast = currentAdderIdx + 1 === players.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const provider = getMediaProvider();
        const results = await provider.searchContent(q, category);
        const filtered = results.filter(r => !pool.some(p => p.titleId === r.titleId));
        setSearchResults(filtered.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const addTitle = (item: MediaItem) => {
    addToPool({ ...item, addedBy: player.id, source: 'manual' });
    setSearch('');
    setSearchResults([]);
    setToast(`✨ "${item.title}" agregada`);
  };

  const addManual = (type: 'pelicula' | 'serie') => {
    addManualToPool(search.trim(), type, player.id);
    setSearch('');
    setSearchResults([]);
    setToast(`✏️ "${search.trim()}" agregada manualmente`);
  };

  const handleRandom = useCallback(async () => {
    if (reachedMax || shuffling) return;
    setShuffling(true);
    try {
      const provider = getMediaProvider();
      const excludeIds = pool.map(p => p.titleId);
      const item = await provider.getRandomContent(category, excludeIds);
      if (item) {
        addToPool({ ...item, addedBy: player.id, source: 'player-random' });
        setToast('🎲 ¡Random agregado!');
      } else {
        setToast('😅 No hay más títulos disponibles');
      }
    } catch {
      setToast('😅 Error al obtener título');
    } finally {
      setShuffling(false);
    }
  }, [reachedMax, shuffling, pool, category, player.id, addToPool]);

  const handleNext = () => {
    if (isLast) {
      go('randomGlobal');
    } else {
      nextAdder();
    }
  };

  const showEmptyResults = search.trim() && !searching && searchResults.length === 0 && !reachedMax;

  return (
    <>
      <StatusBar />
      <TopBar
        title="Agregar contenido"
        onBack={() => currentAdderIdx === 0 ? go('category') : prevAdder()}
      />
      <div className="screen">
        {/* Player header */}
        <div
          className="card"
          style={{
            background: 'oklch(0.72 0.22 var(--brand-h) / 0.08)',
            borderColor: 'oklch(0.72 0.22 var(--brand-h) / 0.25)',
          }}
        >
          <div className="row" style={{ gap: 14 }}>
            <Avatar id={player.avatarId} />
            <div className="grow">
              <div style={{ fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Jugador {currentAdderIdx + 1} de {players.length}
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, marginTop: 2, letterSpacing: '-0.01em' }}>
                {player.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brand)', lineHeight: 1 }}>
                {playerItems.length}
                {!isUnlimited && (
                  <span style={{ color: 'var(--fg-3)', fontSize: 18 }}>/{itemLimit}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>agregadas</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressDots current={currentAdderIdx} total={players.length} />
          </div>
        </div>

        {/* Search row */}
        <div>
          <div className="search-row">
            <input
              className="input"
              placeholder="Busca una película o serie…"
              value={search}
              onChange={handleSearchChange}
              disabled={reachedMax}
            />
            <button
              className="btn btn-secondary btn-icon"
              onClick={handleRandom}
              disabled={reachedMax || shuffling}
              style={{
                height: 52, width: 52,
                animation: shuffling ? 'shuffle 0.7s var(--ease)' : 'none',
              }}
              aria-label="Random"
            >
              🎲
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>
            Categoría: <b style={{ color: 'var(--fg-2)' }}>
              {category === 'pelicula' ? '🎬 Películas' : category === 'serie' ? '📺 Series' : '🎭 Ambos'}
            </b>
          </div>
        </div>

        {/* Search results */}
        {searching && (
          <div className="card" style={{ textAlign: 'center', padding: 16, color: 'var(--fg-3)', fontSize: 13 }}>
            Buscando…
          </div>
        )}

        {searchResults.length > 0 && !searching && (
          <div className="card" style={{ padding: 6 }}>
            {searchResults.map(t => (
              <button
                key={t.titleId}
                onClick={() => addTitle(t)}
                style={{
                  width: '100%', background: 'transparent', border: 0, padding: 8,
                  borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 12,
                  color: 'var(--fg)', textAlign: 'left', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Poster title={t.title} color={t.color} posterUrl={t.posterUrl} size="small" />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                    {t.year} · {t.type === 'pelicula' ? 'Película' : 'Serie'}
                  </div>
                </div>
                <div style={{ fontSize: 22, color: 'var(--brand)' }}>+</div>
              </button>
            ))}
          </div>
        )}

        {/* Manual add (offline / not found) */}
        {showEmptyResults && (
          <div
            className="card"
            style={{
              background: 'oklch(0.72 0.22 var(--brand-h) / 0.06)',
              borderColor: 'oklch(0.72 0.22 var(--brand-h) / 0.25)',
              borderStyle: 'dashed',
            }}
          >
            <div className="row" style={{ gap: 12 }}>
              <div style={{
                width: 48, height: 72, borderRadius: 8,
                background: 'var(--bg-2)', display: 'grid', placeItems: 'center',
                flexShrink: 0, fontSize: 20,
              }}>
                📼
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Sin resultados
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{search.trim()}"
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4, lineHeight: 1.4 }}>
                  No encontramos coincidencias. Agrégalo manualmente:
                </div>
                <div className="row" style={{ gap: 6, marginTop: 10 }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--brand)', color: 'var(--fg-on-brand)', flex: 1, height: 36 }}
                    onClick={() => addManual('pelicula')}
                  >
                    🎬 Película
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--brand)', color: 'var(--fg-on-brand)', flex: 1, height: 36 }}
                    onClick={() => addManual('serie')}
                  >
                    📺 Serie
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player's added items */}
        {playerItems.length > 0 && (
          <>
            <p className="eyebrow" style={{ marginTop: 8 }}>Mis agregados</p>
            {playerItems.map(item => (
              <div key={item.titleId} className="card row" style={{ gap: 12, animation: 'slide-up 280ms var(--ease)' }}>
                <Poster title={item.title} color={item.color} posterUrl={item.posterUrl} size="small" />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>
                    <span className="badge" style={{ fontSize: 10, padding: '2px 8px' }}>
                      {item.type === 'pelicula' ? '🎬' : '📺'} {item.year}
                    </span>
                    {item.manual && (
                      <span className="badge badge-brand" style={{ fontSize: 10, padding: '2px 8px' }}>
                        ✏️ Manual
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => removeFromPool(item.titleId)}
                  style={{ color: 'var(--bad)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </>
        )}

        {playerItems.length === 0 && !shuffling && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--fg-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎬</div>
            <div style={{ fontSize: 14 }}>
              Aún no agregaste títulos.<br />Busca arriba o pulsa 🎲 para uno al azar.
            </div>
          </div>
        )}

        {reachedMax && (
          <div
            className="card"
            style={{
              background: 'rgba(102, 224, 161, 0.1)',
              borderColor: 'rgba(102, 224, 161, 0.3)',
              textAlign: 'center',
            }}
          >
            ✅ ¡Llegaste al máximo! Pulsa "{isLast ? 'Revisar pool' : 'Siguiente jugador'}".
          </div>
        )}

        {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLast ? 'Revisar pool →' : 'Siguiente jugador →'}
        </button>
      </div>
    </>
  );
}
