import { describe, it, expect } from 'vitest';
import { generateBalancedTeams } from '@/domain/teamEngine';
import { addItemToPool, createManualItem } from '@/domain/mediaPoolEngine';
import { addPoint, calculateRanking, isTie } from '@/domain/scoringEngine';
import { handleCorrect, handleSkip, replaySame, startGame } from '@/domain/gameEngine';
import { isDuplicate } from '@/utils/mediaKeys';
import type { Player, MediaItem, GameState, ActNumber } from '@/domain/models';

// ── Fixtures ────────────────────────────────────────────────

const players: Player[] = [
  { id: 'p1', name: 'Ana', avatarId: 'cat', order: 0 },
  { id: 'p2', name: 'Bob', avatarId: 'dog', order: 1 },
  { id: 'p3', name: 'Carlos', avatarId: 'fox', order: 2 },
  { id: 'p4', name: 'Diana', avatarId: 'panda', order: 3 },
];

const sampleItem = (id: string): MediaItem => ({
  titleId: id,
  externalId: id,
  title: `Title ${id}`,
  year: 2020,
  type: 'pelicula',
  color: '#FFB3B3',
  addedBy: 'p1',
  source: 'manual',
});

// ── Team engine ─────────────────────────────────────────────

describe('generateBalancedTeams', () => {
  it('creates the requested number of teams', () => {
    const teams = generateBalancedTeams(players, 2);
    expect(teams).toHaveLength(2);
  });

  it('distributes all players across teams', () => {
    const teams = generateBalancedTeams(players, 2);
    const allIds = teams.flatMap(t => t.playerIds);
    expect(allIds.sort()).toEqual(players.map(p => p.id).sort());
  });

  it('balances teams within ±1 player', () => {
    const teams = generateBalancedTeams(players, 3);
    const sizes = teams.map(t => t.playerIds.length);
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  it('assigns distinct colors to teams', () => {
    const teams = generateBalancedTeams(players, 4);
    const colors = teams.map(t => t.color);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });
});

// ── Media pool engine ────────────────────────────────────────

describe('addItemToPool', () => {
  it('adds a new item to pool', () => {
    const pool = addItemToPool([], sampleItem('t1'));
    expect(pool).toHaveLength(1);
  });

  it('rejects duplicate items', () => {
    const pool = [sampleItem('t1')];
    const result = addItemToPool(pool, sampleItem('t1'));
    expect(result).toHaveLength(1);
  });

  it('allows items with different ids', () => {
    const pool = [sampleItem('t1')];
    const result = addItemToPool(pool, sampleItem('t2'));
    expect(result).toHaveLength(2);
  });
});

describe('createManualItem', () => {
  it('creates item with manual flag', () => {
    const item = createManualItem('Breaking Bad', 'serie', 'p1');
    expect(item.manual).toBe(true);
    expect(item.type).toBe('serie');
    expect(item.title).toBe('Breaking Bad');
  });

  it('trims whitespace from title', () => {
    const item = createManualItem('  Inception  ', 'pelicula', 'p1');
    expect(item.title).toBe('Inception');
  });
});

describe('isDuplicate', () => {
  it('detects duplicate by externalId and type', () => {
    const pool = [sampleItem('t1')];
    expect(isDuplicate(pool, sampleItem('t1'))).toBe(true);
  });

  it('allows same title different type', () => {
    const pool = [sampleItem('t1')];
    const other = { ...sampleItem('t1'), type: 'serie' as const };
    expect(isDuplicate(pool, other)).toBe(false);
  });

  it('detects manual duplicates by normalized title', () => {
    const manual1 = createManualItem('Inception', 'pelicula', 'p1');
    const manual2 = createManualItem('inception', 'pelicula', 'p2');
    expect(isDuplicate([manual1], manual2)).toBe(true);
  });
});

// ── Scoring engine ───────────────────────────────────────────

describe('addPoint', () => {
  it('adds a point to a turn', () => {
    const scores = addPoint({}, 0);
    expect(scores[0]).toBe(1);
  });

  it('accumulates points', () => {
    let scores = addPoint({}, 0);
    scores = addPoint(scores, 0);
    scores = addPoint(scores, 1);
    expect(scores[0]).toBe(2);
    expect(scores[1]).toBe(1);
  });
});

describe('calculateRanking', () => {
  it('sorts entries by score descending', () => {
    const entries = [
      { name: 'A', color: 'red', score: 0, turnIdx: 0 },
      { name: 'B', color: 'blue', score: 0, turnIdx: 1 },
    ];
    const ranked = calculateRanking(entries, { 0: 3, 1: 7 });
    expect(ranked[0].name).toBe('B');
    expect(ranked[1].name).toBe('A');
  });
});

describe('isTie', () => {
  it('detects tie when top scores equal', () => {
    const ranked = [
      { name: 'A', color: 'red', score: 5, turnIdx: 0 },
      { name: 'B', color: 'blue', score: 5, turnIdx: 1 },
    ];
    expect(isTie(ranked)).toBe(true);
  });

  it('does not flag tie when scores differ', () => {
    const ranked = [
      { name: 'A', color: 'red', score: 7, turnIdx: 0 },
      { name: 'B', color: 'blue', score: 3, turnIdx: 1 },
    ];
    expect(isTie(ranked)).toBe(false);
  });
});

// ── Game engine ─────────────────────────────────────────────

const makePool = (n: number): MediaItem[] =>
  Array.from({ length: n }, (_, i) => sampleItem(`t${i + 1}`));

const baseState = (): GameState => ({
  screen: 'round',
  players,
  mode: 'teams',
  teamCount: 2,
  teams: generateBalancedTeams(players, 2),
  category: 'ambos',
  itemLimit: 3,
  pool: makePool(5),
  currentAdderIdx: 0,
  gameStarted: true,
  act: 1 as ActNumber,
  actPool: makePool(5),
  actPoolIdx: 0,
  currentTurnIdx: 0,
  scores: {},
  previousGame: null,
});

describe('startGame', () => {
  it('resets act to 1 and shuffles pool', () => {
    const state = baseState();
    const patch = startGame(state);
    expect(patch.act).toBe(1);
    expect(patch.actPool).toHaveLength(state.pool.length);
    expect(patch.scores).toEqual({});
  });
});

describe('handleCorrect', () => {
  it('removes current item from actPool', () => {
    const pool = makePool(4);
    const patch = handleCorrect(pool, 0);
    expect(patch.actPool).toHaveLength(3);
  });

  it('wraps actPoolIdx when at end', () => {
    const pool = makePool(3);
    const patch = handleCorrect(pool, 2);
    expect((patch.actPoolIdx ?? 0)).toBeLessThan(3);
  });
});

describe('handleSkip', () => {
  it('does not remove item from pool', () => {
    const pool = makePool(4);
    const patch = handleSkip(pool, 0);
    expect(patch.actPool).toHaveLength(4);
  });

  it('moves item to end of pool', () => {
    const pool = makePool(3);
    const first = pool[0];
    const patch = handleSkip(pool, 0);
    expect(patch.actPool?.at(-1)?.titleId).toBe(first.titleId);
  });

  it('does nothing when pool has 1 item', () => {
    const pool = makePool(1);
    const patch = handleSkip(pool, 0);
    expect(Object.keys(patch)).toHaveLength(0);
  });
});

describe('replaySame', () => {
  it('resets act and scores, keeps pool', () => {
    const pool = makePool(6);
    const patch = replaySame(pool);
    expect(patch.act).toBe(1);
    expect(patch.scores).toEqual({});
    expect(patch.actPool).toHaveLength(6);
  });
});
