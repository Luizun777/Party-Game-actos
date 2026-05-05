import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { sfxService, type SoundKey } from './sfxService';

export function useSfx() {
  const muted = useSettingsStore(s => s.muted);
  const volume = useSettingsStore(s => s.volume);
  const toggleMuted = useSettingsStore(s => s.toggleMuted);

  const play = useCallback((key: SoundKey) => {
    sfxService.play(key);
  }, []);

  return { play, muted, volume, toggleMuted };
}
