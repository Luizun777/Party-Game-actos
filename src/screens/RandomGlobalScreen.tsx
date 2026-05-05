import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { sfxService } from '@/services/sfx/sfxService';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Poster } from '@/components/common/Poster';
import { getMediaProvider } from '@/services/media';
import type { MediaCategory } from '@/domain/models';

export function RandomGlobalScreen() {
  const go = useGameStore(s => s.go);
  const pool = useGameStore(s => s.pool);
  const category = useGameStore(s => s.category);
  const addToPool = useGameStore(s => s.addToPool);
  const removeFromPool = useGameStore(s => s.removeFromPool);

  const [enabled, setEnabled] = useState(false);
  const [cat, setCat] = useState<MediaCategory>(category);
  const [count, setCount] = useState(20);
  const [generating, setGenerating] = useState(false);

  const globalItems = pool.filter(p => p.addedBy === 'random');

  const generate = async () => {
    sfxService.play('ui_click');
    setGenerating(true);
    try {
      const provider = getMediaProvider();
      const excludeIds = pool.map(p => p.titleId);
      const items = await provider.getRandomPool(cat, count, excludeIds);
      items.forEach(item => {
        addToPool({ ...item, addedBy: 'random', source: 'random-global' });
      });
    } catch {
      // silent fail — offline mode
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <StatusBar />
      <TopBar title="Random global" onBack={() => go('addContent')} />
      <div className="screen">
        <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎲</div>
          <h3 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}>¿Nadie quiere agregar más?</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
            Llena el pool automáticamente con títulos al azar. Se mezclan con los que ya agregaron.
          </p>
        </div>

        <div className="card">
          <div className="row between">
            <div style={{ fontWeight: 600 }}>Usar llenado automático</div>
            <button
              className="twk-toggle"
              data-on={enabled ? '1' : '0'}
              onClick={() => { sfxService.play('ui_click'); setEnabled(!enabled); }}
            >
              <i />
            </button>
          </div>
        </div>

        {enabled && (
          <>
            <p className="eyebrow">Categoría</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {([
                { id: 'pelicula', label: '🎬 Pelis' },
                { id: 'serie', label: '📺 Series' },
                { id: 'ambos', label: '🎭 Ambos' },
              ] as Array<{ id: MediaCategory; label: string }>).map(c => (
                <button
                  key={c.id}
                  className="card-action"
                  data-selected={cat === c.id}
                  onClick={() => { sfxService.play('ui_click'); setCat(c.id); }}
                  style={{ textAlign: 'center', padding: 14, fontWeight: 600, fontSize: 13 }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <p className="eyebrow" style={{ marginTop: 8 }}>Cantidad</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[10, 20, 30, 50].map(n => (
                <button
                  key={n}
                  className="card-action"
                  data-selected={count === n}
                  onClick={() => { sfxService.play('ui_click'); setCount(n); }}
                  style={{
                    textAlign: 'center', padding: 14,
                    fontFamily: 'var(--font-display)', fontSize: 18,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={generating}
              style={{ marginTop: 8, animation: generating ? 'pulse 0.8s infinite' : 'none' }}
            >
              {generating ? '🎰 Generando…' : '🎲 Generar automáticamente'}
            </button>
          </>
        )}

        {generating && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="poster"
                style={{
                  width: '100%',
                  animation: `pulse 1.4s ${i * 0.1}s infinite`,
                  background: 'var(--surface-2)',
                }}
              />
            ))}
          </div>
        )}

        {globalItems.length > 0 && !generating && (
          <>
            <div className="row between" style={{ marginTop: 8 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Random global ({globalItems.length})</p>
              <button className="btn btn-ghost btn-sm" onClick={generate}>+ más random</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {globalItems.map(item => (
                <div key={item.titleId} style={{ position: 'relative', animation: 'pop-in 300ms var(--ease-spring)' }}>
                  <Poster title={item.title} color={item.color} posterUrl={item.posterUrl} />
                  <button
                    onClick={() => { sfxService.play('error'); removeFromPool(item.titleId); }}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 24, height: 24, borderRadius: '50%',
                      border: 0, background: 'var(--bad)', color: '#fff',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="card row between" style={{ marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 13 }}>Total en pool</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--brand)' }}>
            {pool.length} <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>títulos</span>
          </span>
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          onClick={() => go('reviewPool')}
          disabled={pool.length === 0}
        >
          Revisar pool →
        </button>
      </div>
    </>
  );
}
