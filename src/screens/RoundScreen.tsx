import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { StatusBar } from '@/components/common/StatusBar';
import { Timer } from '@/components/common/Timer';
import { ACTS } from '@/domain/models';
import { useSfx } from '@/services/sfx/useSfx';
import type { ActNumber } from '@/domain/models';

export function RoundScreen() {
  const go = useGameStore(s => s.go);
  const mode = useGameStore(s => s.mode);
  const teams = useGameStore(s => s.teams);
  const players = useGameStore(s => s.players);
  const act = useGameStore(s => s.act);
  const actPool = useGameStore(s => s.actPool);
  const actPoolIdx = useGameStore(s => s.actPoolIdx);
  const currentTurnIdx = useGameStore(s => s.currentTurnIdx);
  const scores = useGameStore(s => s.scores);
  const gameStarted = useGameStore(s => s.gameStarted);
  const scorePoint = useGameStore(s => s.scorePoint);
  const consumeTitle = useGameStore(s => s.consumeTitle);
  const passTitle = useGameStore(s => s.passTitle);
  const nextTurnAction = useGameStore(s => s.nextTurnAction);

  const timerSeconds = useSettingsStore(s => s.timerSeconds);
  const [seconds, setSeconds] = useState(timerSeconds);
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'pass' | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const { play } = useSfx();

  const actInfo = ACTS[act as ActNumber];
  const remaining = actPool.length;
  const currentTitle = actPool[actPoolIdx];

  const team = mode === 'teams' ? teams[currentTurnIdx] : null;
  const player = mode === 'individual' ? players[currentTurnIdx] : null;
  const turnColor = team ? team.color : 'var(--brand)';
  const turnName = team ? team.name : player?.name ?? '';

  // Timer tick
  useEffect(() => {
    if (paused || feedback) return;
    if (seconds <= 0) {
      play('timer_end');
      nextTurnAction();
      go('turnTransition');
      return;
    }
    // Tick every second during last 10 seconds
    if (seconds <= 10) {
      play(seconds === 10 ? 'timer_warn' : 'timer_tick');
    }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, paused, feedback, nextTurnAction, go, play]);

  // Watch for end-of-act
  useEffect(() => {
    if (actPool.length === 0 && gameStarted) {
      setTransitioning(true);
    }
  }, [actPool.length, gameStarted]);

  const onCorrect = () => {
    if (feedback) return;
    play('correct');
    setFeedback('correct');
    scorePoint();
    setTimeout(() => {
      consumeTitle();
      setFeedback(null);
    }, 700);
  };

  const onPass = () => {
    if (feedback) return;
    play('pass');
    setFeedback('pass');
    setTimeout(() => {
      passTitle();
      setFeedback(null);
    }, 500);
  };

  if (!currentTitle) {
    if (!transitioning) return null;

    const isLastAct = act >= 3;
    return (
      <>
        <StatusBar />
        <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', animation: 'pop-in 320ms var(--ease-spring)', padding: '0 24px' }}>
            <div style={{ fontSize: 72 }}>{actInfo?.emoji}</div>
            <p className="eyebrow" style={{ marginTop: 12 }}>Acto {act} terminado</p>
            <div className="display-sm" style={{ marginTop: 6 }}>
              {actInfo?.label} ✓
            </div>
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.5 }}>
              {isLastAct
                ? '¡Último acto completado!'
                : 'Todos los títulos vuelven al pool.'}
            </p>
          </div>
        </div>
        <div className="bottom-bar">
          <button
            className="btn btn-primary"
            style={{ animation: 'slide-up 300ms 200ms var(--ease) both' }}
            onClick={() => go('actEnd')}
          >
            {isLastAct ? '🏆 Ver resultados' : `Ver puntajes del acto ${act} →`}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 0', flexShrink: 0 }}>
        <div className="row between">
          <div>
            <div className="eyebrow">Acto {act} · {actInfo.label}</div>
          </div>
          <button className="icon-btn" onClick={() => go('reviewPool')} aria-label="Salir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Turn indicator */}
        <div style={{
          marginTop: 10,
          padding: '10px 14px',
          background: `${turnColor}22`,
          border: `1.5px solid ${turnColor}66`,
          borderRadius: 'var(--radius-pill)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: turnColor }} />
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg)' }}>
            Turno: {turnName}
          </div>
          <div className="grow" />
          <div style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600 }}>
            {scores[currentTurnIdx] ?? 0} pts
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="screen" style={{ paddingTop: 16 }}>
        <div style={{ marginTop: 8 }}>
          <Timer seconds={seconds} total={timerSeconds} paused={paused} />
        </div>

        <div className="row center" style={{ gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { play('ui_click'); setPaused(!paused); }}>
            {paused ? '▶ Reanudar' : '⏸ Pausar'}
          </button>
        </div>

        {/* Title card */}
        <div style={{
          marginTop: 8,
          padding: 24,
          textAlign: 'center',
          background: feedback === 'correct'
            ? 'linear-gradient(135deg, rgba(102,224,161,0.2), rgba(102,224,161,0.05))'
            : feedback === 'pass'
            ? 'linear-gradient(135deg, rgba(255,138,138,0.15), rgba(255,138,138,0.03))'
            : 'var(--surface)',
          border: `2px solid ${
            feedback === 'correct' ? 'var(--good)'
            : feedback === 'pass' ? 'var(--bad)'
            : 'var(--line)'
          }`,
          borderRadius: 'var(--radius-lg)',
          transition: 'all 200ms',
          animation: feedback ? 'pop-in 320ms var(--ease-spring)' : 'none',
        }}>
          <div style={{ fontSize: 44 }}>{actInfo.emoji}</div>
          <div className="eyebrow" style={{ marginTop: 4 }}>
            {currentTitle.type === 'pelicula' ? 'Película' : 'Serie'} · {currentTitle.year}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginTop: 8,
          }}>
            {currentTitle.title.toUpperCase()}
          </div>
        </div>

        <div className="row between" style={{ marginTop: 4 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            🎬 {remaining} restante{remaining !== 1 ? 's' : ''} en este acto
          </span>
          <span className="muted" style={{ fontSize: 12 }}>Acto {act}/3</span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="bottom-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          className="btn btn-secondary"
          onClick={onPass}
          style={{
            background: 'rgba(255,138,138,0.1)',
            color: 'var(--bad)',
            borderColor: 'rgba(255,138,138,0.3)',
            height: 64,
          }}
        >
          ⏭ Paso
        </button>
        <button
          className="btn btn-primary"
          onClick={onCorrect}
          style={{
            background: 'var(--good)',
            color: '#0a2419',
            boxShadow: '0 8px 24px -8px var(--good)',
            height: 64,
          }}
        >
          ✅ Acertado
        </button>
      </div>
    </>
  );
}
