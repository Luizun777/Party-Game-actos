import type { GameState } from '@/domain/models';
import { STORAGE_KEY, STORAGE_VERSION } from '@/domain/constants';

interface PersistedGame {
  version: number;
  savedAt: string;
  state: GameState;
}

export function saveGame(state: GameState): void {
  try {
    const persisted: PersistedGame = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded)
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const persisted = JSON.parse(raw) as PersistedGame;
    if (persisted.version !== STORAGE_VERSION) {
      // Version mismatch — migrate or discard
      clearGame();
      return null;
    }
    return persisted.state;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
