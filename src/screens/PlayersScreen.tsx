import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { sfxService } from '@/services/sfx/sfxService';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Avatar } from '@/components/common/Avatar';
import { AvatarPicker } from '@/components/common/AvatarPicker';

export function PlayersScreen() {
  const go = useGameStore(s => s.go);
  const players = useGameStore(s => s.players);
  const addPlayer = useGameStore(s => s.addPlayer);
  const updatePlayer = useGameStore(s => s.updatePlayer);
  const removePlayer = useGameStore(s => s.removePlayer);

  const [picking, setPicking] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  const canContinue = players.length >= 2;

  return (
    <>
      <StatusBar />
      <TopBar
        title="Jugadores"
        onBack={() => go('home')}
        right={<span className="badge">{players.length}</span>}
      />
      <div className="screen">
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Agrega los jugadores. Toca el nombre para editarlo.
        </p>

        {players.map((p, i) => (
          <div key={p.id} className="card" style={{ animation: 'slide-up 280ms var(--ease)' }}>
            <div className="row" style={{ gap: 14 }}>
              <button
                onClick={() => { sfxService.play('ui_click'); setPicking(p.id); }}
                style={{ background: 'transparent', border: 0, padding: 0 }}
              >
                <Avatar id={p.avatarId} />
              </button>
              <div className="grow" style={{ minWidth: 0 }}>
                {editingName === p.id ? (
                  <input
                    className="input"
                    autoFocus
                    style={{ height: 40, fontSize: 16, fontWeight: 700 }}
                    defaultValue={p.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim() || p.name;
                      updatePlayer(p.id, { name: v });
                      setEditingName(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                ) : (
                  <button
                    onClick={() => { sfxService.play('ui_click'); setEditingName(p.id); }}
                    style={{
                      background: 'transparent', border: 0, padding: 0,
                      color: 'var(--fg)', fontSize: 17, fontWeight: 700,
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    {p.name}
                    <span style={{ marginLeft: 6, fontSize: 12, opacity: 0.4 }}>✏️</span>
                  </button>
                )}
                <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>#{i + 1}</div>
              </div>
              <button
                className="icon-btn"
                onClick={() => { sfxService.play('error'); removePlayer(p.id); }}
                style={{ color: 'var(--bad)' }}
                aria-label="Eliminar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          className="card-action"
          onClick={() => { sfxService.play('ui_click'); addPlayer(); }}
          style={{ borderStyle: 'dashed', textAlign: 'center', padding: 20 }}
        >
          <div style={{ fontSize: 28 }}>+</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>Agregar jugador</div>
        </button>

        {picking && (
          <AvatarPicker
            currentId={players.find(p => p.id === picking)?.avatarId}
            onPick={(aid) => {
              sfxService.play('ui_click');
              updatePlayer(picking, { avatarId: aid });
              setPicking(null);
            }}
            onClose={() => setPicking(null)}
          />
        )}
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          disabled={!canContinue}
          onClick={() => go('mode')}
        >
          Continuar →
        </button>
      </div>
    </>
  );
}
