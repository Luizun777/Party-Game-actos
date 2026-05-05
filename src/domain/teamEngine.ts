import type { Player, Team } from './models';
import { TEAM_COLORS } from './models';
import { TEAM_NAME_POOL as CONSTANT_NAMES } from './constants';
import { shuffle } from '@/utils/shuffle';
import { generateTeamId } from '@/utils/ids';

// Merge name pools (constants take precedence, models provides type)
const NAME_POOL = [...CONSTANT_NAMES] as string[];

export function generateBalancedTeams(players: Player[], teamCount: number): Team[] {
  const shuffledPlayers = shuffle(players);
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: generateTeamId(),
    name: NAME_POOL[i] ?? `Equipo ${i + 1}`,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    playerIds: [],
  }));

  shuffledPlayers.forEach((p, i) => {
    teams[i % teamCount].playerIds.push(p.id);
  });

  return teams;
}

export function getNextTeamIdx(current: number, total: number): number {
  return (current + 1) % total;
}

export function getNextPlayerIdxForTeam(
  _teamId: string,
  team: Team,
  lastPlayerIdx: number
): number {
  if (!team.playerIds.length) return 0;
  return (lastPlayerIdx + 1) % team.playerIds.length;
}

export function validateTeams(teams: Team[]): string | null {
  if (teams.length < 2) return 'Se necesitan al menos 2 equipos';
  for (const t of teams) {
    if (!t.playerIds.length) return `El equipo "${t.name}" no tiene jugadores`;
  }
  return null;
}
