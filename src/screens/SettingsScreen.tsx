import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { sfxService } from '@/services/sfx/sfxService';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';

export function SettingsScreen() {
  const go = useGameStore(s => s.go);
  const darkMode = useSettingsStore(s => s.darkMode);
  const volume = useSettingsStore(s => s.volume);
  const muted = useSettingsStore(s => s.muted);
  const setDarkMode = useSettingsStore(s => s.setDarkMode);
  const setVolume = useSettingsStore(s => s.setVolume);
  const setMuted = useSettingsStore(s => s.setMuted);

  const volumePct = Math.round(volume * 100);

  return (
    <>
      <StatusBar />
      <TopBar title="Configuración" onBack={() => go('home')} />

      <div className="screen">

        {/* ── SONIDO ───────────────────────────────────────────── */}
        <p className="eyebrow" style={{ marginTop: 4 }}>Sonido</p>

        {/* Mute toggle */}
        <div className="card">
          <div className="row between">
            <div className="row" style={{ gap: 12 }}>
              <div style={{ fontSize: 22 }}>{muted ? '🔇' : '🔊'}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Efectos de sonido</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                  {muted ? 'Silenciado' : 'Activo'}
                </div>
              </div>
            </div>
            <Toggle value={!muted} onChange={v => setMuted(!v)} />
          </div>
        </div>

        {/* Volume slider */}
        <div className="card" style={{ opacity: muted ? 0.4 : 1, transition: 'opacity 200ms' }}>
          <div style={{ marginBottom: 10 }}>
            <div className="row between">
              <div style={{ fontWeight: 700, fontSize: 15 }}>Volumen</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--brand)',
                letterSpacing: '-0.02em',
              }}>
                {volumePct}
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volumePct}
            disabled={muted}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            onMouseUp={() => sfxService.play('ui_click')}
            onTouchEnd={() => sfxService.play('ui_click')}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              height: 6,
              borderRadius: 999,
              background: muted
                ? 'var(--surface-2)'
                : `linear-gradient(to right, var(--brand) ${volumePct}%, var(--surface-2) ${volumePct}%)`,
              outline: 'none',
              cursor: muted ? 'not-allowed' : 'pointer',
            }}
          />
          <div className="row between" style={{ marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>0</span>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>100</span>
          </div>
        </div>

        {/* Preview button */}
        <button
          className="btn btn-secondary"
          disabled={muted}
          style={muted ? { opacity: 0.4 } : {}}
          onClick={() => sfxService.play('correct')}
        >
          🎵 Probar sonido
        </button>

        {/* ── APARIENCIA ───────────────────────────────────────── */}
        <p className="eyebrow" style={{ marginTop: 8 }}>Apariencia</p>

        <div className="card">
          <div className="row between">
            <div className="row" style={{ gap: 12 }}>
              <div style={{ fontSize: 22 }}>{darkMode ? '🌙' : '☀️'}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Modo oscuro</div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                  {darkMode ? 'Oscuro' : 'Claro'}
                </div>
              </div>
            </div>
            <Toggle value={darkMode} onChange={setDarkMode} />
          </div>
        </div>

      </div>
    </>
  );
}

// ── inline toggle component (matches design system) ───────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        position: 'relative',
        width: 48,
        height: 28,
        borderRadius: 999,
        border: 0,
        background: value ? 'var(--brand)' : 'var(--surface-2)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 200ms var(--ease)',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: value ? 'calc(100% - 25px)' : 3,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: value ? 'var(--fg-on-brand)' : 'var(--fg-2)',
        transition: 'left 200ms var(--ease-spring)',
        display: 'block',
      }} />
    </button>
  );
}
