import { useGameStore } from '@/stores/gameStore';
import { sfxService } from '@/services/sfx/sfxService';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import type { MediaCategory } from '@/domain/models';

export function CategoryScreen() {
  const go = useGameStore(s => s.go);
  const category = useGameStore(s => s.category);
  const itemLimit = useGameStore(s => s.itemLimit);
  const setCategory = useGameStore(s => s.setCategory);
  const setItemLimit = useGameStore(s => s.setItemLimit);

  const isUnlimited = itemLimit === -1;

  const categories: Array<{ id: MediaCategory; label: string; emoji: string }> = [
    { id: 'pelicula', label: 'Películas', emoji: '🎬' },
    { id: 'serie', label: 'Series', emoji: '📺' },
    { id: 'ambos', label: 'Ambos', emoji: '🎭' },
  ];

  return (
    <>
      <StatusBar />
      <TopBar title="Categoría y cantidad" onBack={() => go('mode')} />
      <div className="screen">
        <p className="eyebrow">Categoría</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {categories.map(c => (
            <button
              key={c.id}
              className="card-action"
              data-selected={category === c.id}
              onClick={() => { sfxService.play('ui_click'); setCategory(c.id); }}
              style={{ textAlign: 'center', padding: '20px 10px' }}
            >
              <div style={{ fontSize: 32 }}>{c.emoji}</div>
              <div style={{ fontWeight: 700, marginTop: 6, fontSize: 13 }}>{c.label}</div>
            </button>
          ))}
        </div>

        <p className="eyebrow" style={{ marginTop: 16 }}>Cantidad por jugador</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              className="card-action"
              data-selected={itemLimit === n}
              onClick={() => { sfxService.play('ui_click'); setItemLimit(n); }}
              style={{
                textAlign: 'center', padding: '16px 0',
                fontFamily: 'var(--font-display)', fontSize: 22,
              }}
            >
              {n}
            </button>
          ))}
          <button
            className="card-action"
            data-selected={isUnlimited}
            onClick={() => { sfxService.play('ui_click'); setItemLimit(-1); }}
            style={{
              textAlign: 'center', padding: '16px 0',
              fontFamily: 'var(--font-display)', fontSize: 18,
            }}
          >
            ∞
          </button>
        </div>

        <p className="dim" style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          {isUnlimited
            ? 'Cada jugador puede agregar todos los títulos que quiera.'
            : `Cada jugador agregará hasta ${itemLimit} título${itemLimit > 1 ? 's' : ''}.`}
        </p>

        <div
          className="card"
          style={{
            marginTop: 8,
            background: 'oklch(0.72 0.22 var(--brand-h) / 0.08)',
            borderColor: 'oklch(0.72 0.22 var(--brand-h) / 0.2)',
          }}
        >
          <div className="row" style={{ gap: 12 }}>
            <div style={{ fontSize: 28 }}>💡</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
              ¿Nadie quiere agregar contenido? Más adelante podrás llenar el pool con títulos al azar.
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={() => go('addContent')}>
          Continuar a agregar contenido →
        </button>
      </div>
    </>
  );
}
