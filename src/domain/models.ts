// Domain models for Actos party game

export type GameMode = 'individual' | 'teams';
export type ActNumber = 1 | 2 | 3;
export type MediaCategory = 'pelicula' | 'serie' | 'ambos';
export type MediaType = 'pelicula' | 'serie';
export type MediaSource = 'manual' | 'player-random' | 'random-global';
export type GameStatus =
  | 'setup'
  | 'adding-content'
  | 'review'
  | 'playing'
  | 'act-summary'
  | 'finished';

export type AppScreen =
  | 'home'
  | 'players'
  | 'mode'
  | 'category'
  | 'addContent'
  | 'randomGlobal'
  | 'reviewPool'
  | 'round'
  | 'turnTransition'
  | 'actEnd'
  | 'final'
  | 'settings';

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  order: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
}

export interface MediaItem {
  /** Unique within the pool — titleId from TMDB or manual_ prefix */
  titleId: string;
  /** Original external id (TMDB id or same as titleId for manual) */
  externalId: string;
  title: string;
  year: string | number;
  type: MediaType;
  /** CSS color for poster placeholder */
  color: string;
  /** URL from TMDB; undefined when offline/manual */
  posterUrl?: string;
  /** Player id, 'random', or undefined */
  addedBy: string;
  source: MediaSource;
  /** True when added offline without a search result */
  manual?: boolean;
}

export interface GameConfig {
  mode: GameMode;
  category: MediaCategory;
  itemsPerPlayer: number | 'unlimited';
  teamCount: number;
}

export interface TurnState {
  currentTurnIdx: number;
  timerSeconds: number;
  isTimerRunning: boolean;
}

export interface ActState {
  currentAct: ActNumber;
  /** Shuffled pool for this act (full pool at start, consumed as titles are guessed) */
  actPool: MediaItem[];
  actPoolIdx: number;
}

export interface Scores {
  [turnIdx: number]: number;
}

export interface PreviousGameInfo {
  title: string;
  date: string;
  players: number;
  mode: string;
  status: string;
}

export interface GameState {
  screen: AppScreen;
  players: Player[];
  mode: GameMode;
  teamCount: number;
  teams: Team[];
  category: MediaCategory;
  itemLimit: number; // -1 = unlimited
  pool: MediaItem[];
  currentAdderIdx: number;
  gameStarted: boolean;
  act: ActNumber;
  actPool: MediaItem[];
  actPoolIdx: number;
  currentTurnIdx: number;
  scores: Scores;
  previousGame: PreviousGameInfo | null;
}

export const ACTS: Record<ActNumber, { label: string; instruction: string; emoji: string }> = {
  1: { label: '3 palabras', instruction: 'Describe usando máximo 3 palabras', emoji: '💬' },
  2: { label: '1 palabra', instruction: 'Describe usando solo 1 palabra', emoji: '🔑' },
  3: { label: 'Mímica', instruction: 'No hables, solo actúa', emoji: '🎭' },
};

export const TEAM_COLORS = [
  '#FFB3B3', // coral
  '#B5D9FF', // sky
  '#BFEFC5', // mint
  '#FFE3A3', // butter
  '#D9C2FF', // lavender
  '#FFC9E5', // bubblegum
] as const;

export const POSTER_COLORS = [
  '#FFB3B3', '#B5D9FF', '#BFEFC5', '#FFE3A3', '#D9C2FF', '#FFC9E5',
] as const;
