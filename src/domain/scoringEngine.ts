import type { Scores } from './models';

export function addPoint(scores: Scores, turnIdx: number): Scores {
  return { ...scores, [turnIdx]: (scores[turnIdx] ?? 0) + 1 };
}

export interface RankedEntry {
  name: string;
  color: string;
  score: number;
  avatarId?: string;
  turnIdx: number;
}

export function calculateRanking(entries: RankedEntry[], scores: Scores): RankedEntry[] {
  return entries
    .map(e => ({ ...e, score: scores[e.turnIdx] ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

export function calculateWinner(ranked: RankedEntry[]): RankedEntry[] {
  if (!ranked.length) return [];
  const top = ranked[0].score;
  return ranked.filter(r => r.score === top);
}

export function isTie(ranked: RankedEntry[]): boolean {
  return calculateWinner(ranked).length > 1;
}
