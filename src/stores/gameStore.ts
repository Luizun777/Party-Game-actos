import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameState, Player, Team, MediaItem, AppScreen, ActNumber, MediaCategory } from '@/domain/models';
import { generateBalancedTeams } from '@/domain/teamEngine';
import { addItemToPool, removeItemFromPool, createManualItem } from '@/domain/mediaPoolEngine';
import { startGame, handleCorrect, handleSkip, replaySame, nextTurn, initializeAct } from '@/domain/gameEngine';
import { addPoint } from '@/domain/scoringEngine';
import { saveGame, loadGame } from '@/persistence/storage';
import { generatePlayerId } from '@/utils/ids';
import { AVATAR_CATALOG } from '@/components/common/avatarCatalog';
import { shuffle } from '@/utils/shuffle';

// ────────────────────────────────────────────────────────────
//  INITIAL STATE
// ────────────────────────────────────────────────────────────
const DEFAULT_STATE: GameState = {
  screen: 'home',
  players: [],
  mode: 'teams',
  teamCount: 2,
  teams: [],
  category: 'ambos',
  itemLimit: 3,
  pool: [],
  currentAdderIdx: 0,
  gameStarted: false,
  act: 1 as ActNumber,
  actPool: [],
  actPoolIdx: 0,
  currentTurnIdx: 0,
  scores: {},
  previousGame: null,
};

// ────────────────────────────────────────────────────────────
//  STORE ACTIONS TYPE
// ────────────────────────────────────────────────────────────
interface StoreActions {
  // Navigation
  go: (screen: AppScreen) => void;

  // Players
  addPlayer: (name?: string, avatarId?: string) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  removePlayer: (id: string) => void;

  // Mode & Teams
  setMode: (mode: 'individual' | 'teams') => void;
  setTeamCount: (n: number) => void;
  regenTeams: () => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  movePlayerToTeam: (playerId: string, targetTeamId: string) => void;

  // Config
  setCategory: (category: MediaCategory) => void;
  setItemLimit: (limit: number) => void;

  // Content pool
  addToPool: (item: MediaItem) => void;
  removeFromPool: (titleId: string) => void;
  addManualToPool: (title: string, type: 'pelicula' | 'serie', playerId: string) => void;

  // Adder flow
  nextAdder: () => void;
  prevAdder: () => void;
  resetAdder: () => void;

  // Game actions
  startGameAction: () => void;
  scorePoint: () => void;
  consumeTitle: () => void;
  passTitle: () => void;
  nextTurnAction: () => void;
  nextActAction: () => void;
  replaySameAction: () => void;
  resetAction: () => void;

  // Persistence
  saveState: () => void;
  loadState: () => void;
}

type StoreState = GameState & StoreActions;

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function pickUnusedAvatar(usedIds: string[]): string {
  const available = AVATAR_CATALOG.filter(a => !usedIds.includes(a.id));
  const pool = available.length ? available : AVATAR_CATALOG;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

// ────────────────────────────────────────────────────────────
//  STORE
// ────────────────────────────────────────────────────────────
export const useGameStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULT_STATE,

    // ── Navigation ──────────────────────────────────────────
    go: (screen) => {
      set({ screen });
      get().saveState();
    },

    // ── Players ─────────────────────────────────────────────
    addPlayer: (name, avatarId) => {
      const players = get().players;
      const usedAvatars = players.map(p => p.avatarId);
      const id = generatePlayerId();
      const player: Player = {
        id,
        name: name ?? `Jugador ${players.length + 1}`,
        avatarId: avatarId ?? pickUnusedAvatar(usedAvatars),
        order: players.length,
      };
      const newPlayers = [...players, player];
      const newTeams = get().mode === 'teams'
        ? generateBalancedTeams(newPlayers, get().teamCount)
        : get().teams;
      set({ players: newPlayers, teams: newTeams });
      get().saveState();
    },

    updatePlayer: (id, patch) => {
      const players = get().players.map(p => p.id === id ? { ...p, ...patch } : p);
      set({ players });
      get().saveState();
    },

    removePlayer: (id) => {
      const players = get().players.filter(p => p.id !== id);
      const pool = get().pool.filter(item => item.addedBy !== id);
      const teams = get().mode === 'teams' && players.length
        ? generateBalancedTeams(players, get().teamCount)
        : get().teams.map(t => ({ ...t, playerIds: t.playerIds.filter(pid => pid !== id) }));
      set({ players, pool, teams });
      get().saveState();
    },

    // ── Mode & Teams ─────────────────────────────────────────
    setMode: (mode) => {
      let teams = get().teams;
      if (mode === 'teams' && get().players.length) {
        teams = generateBalancedTeams(get().players, get().teamCount);
      }
      set({ mode, teams });
      get().saveState();
    },

    setTeamCount: (n) => {
      const teams = generateBalancedTeams(get().players, n);
      set({ teamCount: n, teams });
      get().saveState();
    },

    regenTeams: () => {
      const teams = generateBalancedTeams(get().players, get().teamCount);
      set({ teams });
      get().saveState();
    },

    updateTeam: (id, patch) => {
      const teams = get().teams.map(t => t.id === id ? { ...t, ...patch } : t);
      set({ teams });
      get().saveState();
    },

    movePlayerToTeam: (playerId, targetTeamId) => {
      const current = get().teams;
      const sourceTeam = current.find(t => t.playerIds.includes(playerId));
      // Never leave a team with zero players
      if (sourceTeam && sourceTeam.id !== targetTeamId && sourceTeam.playerIds.length <= 1) {
        return;
      }
      const teams = current.map(t => {
        if (t.id === targetTeamId) {
          return t.playerIds.includes(playerId)
            ? t
            : { ...t, playerIds: [...t.playerIds, playerId] };
        }
        return { ...t, playerIds: t.playerIds.filter(id => id !== playerId) };
      });
      set({ teams });
      get().saveState();
    },

    // ── Config ───────────────────────────────────────────────
    setCategory: (category) => {
      set({ category });
      get().saveState();
    },

    setItemLimit: (limit) => {
      set({ itemLimit: limit });
      get().saveState();
    },

    // ── Content pool ─────────────────────────────────────────
    addToPool: (item) => {
      const pool = addItemToPool(get().pool, item);
      set({ pool });
      get().saveState();
    },

    removeFromPool: (titleId) => {
      const pool = removeItemFromPool(get().pool, titleId);
      set({ pool });
      get().saveState();
    },

    addManualToPool: (title, type, playerId) => {
      const item = createManualItem(title, type, playerId);
      const pool = addItemToPool(get().pool, item);
      set({ pool });
      get().saveState();
    },

    // ── Adder flow ───────────────────────────────────────────
    nextAdder: () => {
      set(s => ({ currentAdderIdx: s.currentAdderIdx + 1 }));
    },
    prevAdder: () => {
      set(s => ({ currentAdderIdx: Math.max(0, s.currentAdderIdx - 1) }));
    },
    resetAdder: () => {
      set({ currentAdderIdx: 0 });
    },

    // ── Game ─────────────────────────────────────────────────
    startGameAction: () => {
      const patch = startGame(get() as GameState);
      set(patch);
      get().saveState();
    },

    scorePoint: () => {
      const scores = addPoint(get().scores, get().currentTurnIdx);
      set({ scores });
      get().saveState();
    },

    consumeTitle: () => {
      const patch = handleCorrect(get().actPool, get().actPoolIdx);
      set(patch);
      get().saveState();
    },

    passTitle: () => {
      const patch = handleSkip(get().actPool, get().actPoolIdx);
      set(patch);
      get().saveState();
    },

    nextTurnAction: () => {
      const total = get().mode === 'teams' ? get().teams.length : get().players.length;
      const patch = nextTurn(get().currentTurnIdx, total);
      set(patch);
      get().saveState();
    },

    nextActAction: () => {
      const currentAct = get().act;
      const nextAct = (currentAct < 3 ? currentAct + 1 : currentAct) as ActNumber;
      const patch = initializeAct(get().pool, nextAct);
      set({ ...patch, currentTurnIdx: 0 });
      get().saveState();
    },

    replaySameAction: () => {
      const patch = replaySame(get().pool);
      set({ ...patch, gameStarted: true });
      get().saveState();
    },

    resetAction: () => {
      const previousGame = get().previousGame;
      set({ ...DEFAULT_STATE, previousGame });
      get().saveState();
    },

    // ── Persistence ──────────────────────────────────────────
    saveState: () => {
      saveGame(get() as GameState);
    },

    loadState: () => {
      const saved = loadGame();
      if (saved) {
        set(saved);
      }
    },
  }))
);

// ── Computed selectors ───────────────────────────────────────
export const selectCurrentPlayer = (s: StoreState) =>
  s.players[s.currentAdderIdx] ?? null;

export const selectCurrentTurnName = (s: StoreState): string => {
  if (s.mode === 'teams') {
    return s.teams[s.currentTurnIdx]?.name ?? '';
  }
  return s.players[s.currentTurnIdx]?.name ?? '';
};

export const selectCurrentTurnColor = (s: StoreState): string => {
  if (s.mode === 'teams') {
    return s.teams[s.currentTurnIdx]?.color ?? 'var(--brand)';
  }
  return 'var(--brand)';
};

export const selectRanking = (s: StoreState) => {
  if (s.mode === 'teams') {
    return s.teams
      .map((t, i) => ({ name: t.name, color: t.color, score: s.scores[i] ?? 0, turnIdx: i }))
      .sort((a, b) => b.score - a.score);
  }
  return s.players
    .map((p, i) => ({ name: p.name, color: 'var(--brand)' as string, score: s.scores[i] ?? 0, avatarId: p.avatarId, turnIdx: i }))
    .sort((a, b) => b.score - a.score);
};

// Auto-generate teams when players change and mode is teams
// This is handled inside addPlayer/removePlayer/setMode

// Expose shuffle for convenience
export { shuffle };
