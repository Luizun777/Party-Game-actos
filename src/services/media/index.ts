import type { MediaSearchProvider } from './mediaProvider';
import { TmdbProvider, isTmdbAvailable } from './tmdbProvider';
import { FallbackProvider } from './fallbackProvider';

/** Returns the best available provider — TMDB if credentials present, else fallback */
export function getMediaProvider(): MediaSearchProvider {
  if (isTmdbAvailable()) {
    return new TmdbProvider();
  }
  return new FallbackProvider();
}

export type { MediaSearchProvider };
export { isTmdbAvailable };
