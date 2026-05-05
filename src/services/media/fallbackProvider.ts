import type { MediaItem, MediaCategory } from '@/domain/models';
import type { MediaSearchProvider } from './mediaProvider';
import { FALLBACK_MEDIA } from '@/data/fallbackMedia';
import { shuffle } from '@/utils/shuffle';

export class FallbackProvider implements MediaSearchProvider {
  async searchContent(query: string, category: MediaCategory): Promise<MediaItem[]> {
    const q = query.toLowerCase();
    return FALLBACK_MEDIA
      .filter(t => category === 'ambos' || t.type === category)
      .filter(t => t.title.toLowerCase().includes(q))
      .slice(0, 5);
  }

  async getRandomContent(category: MediaCategory, excludeIds: string[]): Promise<MediaItem | null> {
    const available = FALLBACK_MEDIA
      .filter(t => category === 'ambos' || t.type === category)
      .filter(t => !excludeIds.includes(t.titleId));
    if (!available.length) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  async getRandomPool(category: MediaCategory, count: number, excludeIds: string[]): Promise<MediaItem[]> {
    const available = shuffle(
      FALLBACK_MEDIA
        .filter(t => category === 'ambos' || t.type === category)
        .filter(t => !excludeIds.includes(t.titleId))
    );
    return available.slice(0, count).map(t => ({ ...t, source: 'random-global' as const, addedBy: 'random' }));
  }
}
