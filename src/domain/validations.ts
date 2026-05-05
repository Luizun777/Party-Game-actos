import type { GameState } from './models';
import { MIN_PLAYERS, MIN_POOL_RECOMMENDED } from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCanStartGame(state: GameState): ValidationResult {
  if (state.players.length < MIN_PLAYERS) {
    return { valid: false, error: `Se necesitan al menos ${MIN_PLAYERS} jugadores` };
  }
  if (!state.pool.length) {
    return { valid: false, error: 'El pool está vacío. Agrega al menos un título.' };
  }
  if (state.mode === 'teams' && !state.teams.length) {
    return { valid: false, error: 'No hay equipos configurados' };
  }
  return { valid: true };
}

export function validateCanContinueFromPlayers(state: GameState): ValidationResult {
  if (state.players.length < MIN_PLAYERS) {
    return { valid: false, error: `Agrega al menos ${MIN_PLAYERS} jugadores para continuar` };
  }
  return { valid: true };
}

export function poolWarning(poolSize: number): string | null {
  if (poolSize > 0 && poolSize < MIN_POOL_RECOMMENDED) {
    return `Pocos títulos en el pool. Recomendamos al menos ${MIN_POOL_RECOMMENDED} para una buena partida.`;
  }
  return null;
}
