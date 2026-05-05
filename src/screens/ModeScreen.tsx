import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { sfxService } from '@/services/sfx/sfxService';
import { StatusBar } from '@/components/common/StatusBar';
import { TopBar } from '@/components/common/TopBar';
import { Avatar } from '@/components/common/Avatar';

export function ModeScreen() {
  const go        = useGameStore(s => s.go);
  const mode      = useGameStore(s => s.mode);
  const players   = useGameStore(s => s.players);
  const teams     = useGameStore(s => s.teams);
  const teamCount = useGameStore(s => s.teamCount);
  const setMode       = useGameStore(s => s.setMode);
  const setTeamCount  = useGameStore(s => s.setTeamCount);
  const regenTeams    = useGameStore(s => s.regenTeams);

  // ── drag state ────────────────────────────────────────────────
  const dragRef   = useRef<{ playerId: string; locked: boolean } | null>(null);
  const ghostRef  = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overTeamId, setOverTeamId] = useState<string | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${e.clientX - 22}px`;
        ghost.style.top  = `${e.clientY - 16}px`;
        ghost.style.visibility = 'hidden';
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (ghost) ghost.style.visibility = '';
      const overRaw = (el?.closest('[data-team-id]') as HTMLElement | null)?.dataset.teamId ?? null;
      // If locked (last player in team), don't highlight other teams as valid targets
      const over = dragRef.current.locked ? null : overRaw;
      setOverTeamId(prev => prev === over ? prev : over);
    };

    const finish = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { playerId, locked } = dragRef.current;
      const ghost = ghostRef.current;
      if (ghost) ghost.style.visibility = 'hidden';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = (el?.closest('[data-team-id]') as HTMLElement | null)?.dataset.teamId;
      if (ghost?.parentNode) ghost.parentNode.removeChild(ghost);
      ghostRef.current = null;
      if (target && !locked) {
        sfxService.play('ui_click');
        useGameStore.getState().movePlayerToTeam(playerId, target);
      } else if (target && locked) {
        sfxService.play('error');
      }
      dragRef.current = null;
      setDraggingId(null);
      setOverTeamId(null);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerup', finish);
    document.addEventListener('pointercancel', finish);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', finish);
      document.removeEventListener('pointercancel', finish);
      const ghost = ghostRef.current;
      if (ghost?.parentNode) ghost.parentNode.removeChild(ghost);
      ghostRef.current = null;
    };
  }, []);

  function startDrag(e: React.PointerEvent<HTMLElement>, playerId: string) {
    e.preventDefault();
    const sourceTeam = teams.find(t => t.playerIds.includes(playerId));
    const locked = !!sourceTeam && sourceTeam.playerIds.length <= 1;
    dragRef.current = { playerId, locked };
    setDraggingId(playerId);

    const player = players.find(p => p.id === playerId);
    const ghost = document.createElement('div');
    Object.assign(ghost.style, {
      position:      'fixed',
      pointerEvents: 'none',
      zIndex:        '9999',
      background:    locked ? '#2a1a1a' : '#1F1F38',
      border:        locked ? '1.5px solid rgba(255,138,138,0.5)' : '1.5px solid rgba(255,255,255,0.22)',
      borderRadius:  '999px',
      padding:       '5px 12px',
      fontSize:      '13px',
      fontWeight:    '600',
      color:         locked ? '#FF8A8A' : '#F4F2FA',
      fontFamily:    'Inter, system-ui, sans-serif',
      opacity:       '0.96',
      transform:     'scale(1.08) rotate(-2deg)',
      boxShadow:     '0 12px 32px rgba(0,0,0,0.55)',
      whiteSpace:    'nowrap',
      left:          `${e.clientX - 22}px`,
      top:           `${e.clientY - 16}px`,
      userSelect:    'none',
    });
    ghost.textContent = locked ? `🔒 ${player?.name ?? ''}` : `✦ ${player?.name ?? ''}`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  }

  return (
    <>
      <StatusBar />
      <TopBar title="Modo de juego" onBack={() => go('players')} />
      <div className="screen">
        <div className="seg">
          <button aria-pressed={mode === 'individual'} onClick={() => { sfxService.play('ui_click'); setMode('individual'); }}>
            Individual
          </button>
          <button aria-pressed={mode === 'teams'} onClick={() => { sfxService.play('ui_click'); setMode('teams'); }}>
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
              <button className="btn btn-secondary btn-sm" onClick={() => { sfxService.play('ui_click'); regenTeams(); }}>
                🎲 Regenerar
              </button>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <span className="muted" style={{ fontSize: 13 }}>Cantidad:</span>
              <div className="stepper" style={{ flex: 1 }}>
                <button onClick={() => { sfxService.play('ui_click'); setTeamCount(Math.max(2, teamCount - 1)); }}>−</button>
                <div className="stepper-val">{teamCount}</div>
                <button onClick={() => { sfxService.play('ui_click'); setTeamCount(Math.min(6, teamCount + 1)); }}>+</button>
              </div>
            </div>

            {teams.map((t, i) => {
              const isOver = overTeamId === t.id;
              return (
                <div
                  key={t.id}
                  data-team-id={t.id}
                  className="card"
                  style={{
                    borderLeft: `6px solid ${t.color}`,
                    transition: 'box-shadow 150ms, background 150ms',
                    boxShadow: isOver
                      ? `0 0 0 2px ${t.color}, 0 8px 24px -8px ${t.color}55`
                      : undefined,
                    background: isOver
                      ? `${t.color}14`
                      : undefined,
                  }}
                >
                  <div className="row between" style={{ marginBottom: 10 }}>
                    <div>
                      <div className="eyebrow" style={{ color: t.color }}>Equipo {i + 1}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{t.name}</div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background:   `${t.color}22`,
                        color:        t.color,
                        borderColor:  `${t.color}44`,
                      }}
                    >
                      {t.playerIds.length} jugadores
                    </span>
                  </div>

                  {/* Drop hint when hovering with no players yet */}
                  {isOver && t.playerIds.filter(pid => pid !== draggingId).length === 0 && (
                    <div style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      fontSize: 12,
                      color: t.color,
                      fontWeight: 600,
                      border: `1.5px dashed ${t.color}66`,
                      borderRadius: 10,
                    }}>
                      Soltar aquí
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: isOver ? 32 : undefined }}>
                    {t.playerIds.map(pid => {
                      const p = players.find(pp => pp.id === pid);
                      if (!p) return null;
                      const isDragging = draggingId === pid;
                      return (
                        <div
                          key={pid}
                          className="row"
                          onPointerDown={e => startDrag(e, pid)}
                          style={{
                            gap:         6,
                            padding:     '4px 10px 4px 4px',
                            background:  isDragging ? 'var(--surface)' : 'var(--surface-2)',
                            borderRadius: 999,
                            opacity:     isDragging ? 0.35 : 1,
                            border:      isDragging
                              ? '1.5px dashed var(--line-strong)'
                              : '1.5px solid transparent',
                            transition:  'opacity 150ms, border 150ms',
                            cursor:      'grab',
                            touchAction: 'none',
                            userSelect:  'none',
                          }}
                        >
                          <Avatar id={p.avatarId} size="small" />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontSize: 10, color: 'var(--fg-3)', marginLeft: -2 }}>⠿</span>
                        </div>
                      );
                    })}

                    {/* Drop indicator inside team when hovering and team has players */}
                    {isOver && t.playerIds.length > 0 && (
                      <div style={{
                        display:      'flex',
                        alignItems:   'center',
                        padding:      '4px 10px',
                        border:       `1.5px dashed ${t.color}88`,
                        borderRadius: 999,
                        fontSize:     12,
                        color:        t.color,
                        fontWeight:   600,
                      }}>
                        + aquí
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <p className="dim" style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              💡 Arrastra un jugador para cambiar de equipo
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
