import type { MediaItem } from '@/domain/models';
import { POSTER_COLORS } from '@/domain/models';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  media_type?: string;
}

function getColorForId(id: number): string {
  return POSTER_COLORS[id % POSTER_COLORS.length];
}

export function normalizeTmdbItem(raw: TmdbMovie, source: 'manual' | 'player-random' | 'random-global', addedBy: string): MediaItem {
  const isMovie = raw.media_type === 'movie' || Boolean(raw.title);
  const type = isMovie ? 'pelicula' : 'serie';
  const title = raw.title ?? raw.name ?? 'Sin título';
  const dateStr = raw.release_date ?? raw.first_air_date ?? '';
  const year = dateStr ? new Date(dateStr).getFullYear() : '—';
  const posterUrl = raw.poster_path ? `${TMDB_IMAGE_BASE}${raw.poster_path}` : undefined;

  return {
    titleId: `tmdb_${raw.id}_${type}`,
    externalId: String(raw.id),
    title,
    year,
    type,
    color: getColorForId(raw.id),
    posterUrl,
    addedBy,
    source,
    manual: false,
  };
}
