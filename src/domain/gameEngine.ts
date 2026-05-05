import type { GameState, MediaItem, ActNumber } from './models';
import { shuffle } from '@/utils/shuffle';

export function startGame(state: GameState): Partial<GameState> {
  const shuffled = shuffle([...state.pool]);
  return {
    gameStarted: true,
    act: 1 as ActNumber,
    actPool: shuffled,
    actPoolIdx: 0,
    currentTurnIdx: 0,
    scores: {},
  };
}

export function initializeAct(pool: MediaItem[], act: ActNumber): Partial<GameState> {
  const shuffled = shuffle([...pool]);
  return {
    act,
    actPool: shuffled,
    actPoolIdx: 0,
  };
}

export function handleCorrect(actPool: MediaItem[], actPoolIdx: number): Partial<GameState> {
  const newPool = actPool.filter((_, i) => i !== actPoolIdx);
  const newIdx = newPool.length ? actPoolIdx % newPool.length : 0;
  return { actPool: newPool, actPoolIdx: newIdx };
}

export function handleSkip(actPool: MediaItem[], actPoolIdx: number): Partial<GameState> {
  if (actPool.length <= 1) return {};
  const item = actPool[actPoolIdx];
  const rest = actPool.filter((_, i) => i !== actPoolIdx);
  return { actPool: [...rest, item], actPoolIdx: actPoolIdx % rest.length };
}

export function finishAct(pool: MediaItem[], act: ActNumber): Partial<GameState> {
  const next = (act < 3 ? act + 1 : act) as ActNumber;
  const shuffled = shuffle([...pool]);
  return {
    act: next,
    actPool: shuffled,
    actPoolIdx: 0,
    currentTurnIdx: 0,
  };
}

export function replaySame(pool: MediaItem[]): Partial<GameState> {
  const shuffled = shuffle([...pool]);
  return {
    act: 1 as ActNumber,
    actPool: shuffled,
    actPoolIdx: 0,
    currentTurnIdx: 0,
    scores: {},
  };
}

export function nextTurn(currentTurnIdx: number, total: number): Partial<GameState> {
  return { currentTurnIdx: (currentTurnIdx + 1) % total };
}
