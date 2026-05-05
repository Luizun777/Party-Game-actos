import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { sfxService } from './sfxService';
import type { AppScreen } from '@/domain/models';

// Mounted once in App — subscribes to store slices and fires sounds
// without coupling any screen component to the audio service.
export function SfxStoreSync() {
  useEffect(() => {
    const unsubScreen = useGameStore.subscribe(
      s => s.screen,
      (screen: AppScreen, prev: AppScreen) => {
        if (screen === prev) return;
        switch (screen) {
          case 'round':
            // Only play game_start when coming from reviewPool (actual game start)
            // not when returning from turnTransition or actEnd
            if (prev === 'reviewPool') sfxService.play('game_start');
            else sfxService.play('ui_navigate');
            break;
          case 'turnTransition':
            sfxService.play('timer_end');
            break;
          case 'actEnd':
            sfxService.play('act_end');
            break;
          case 'final':
            sfxService.play('final_win');
            break;
          default:
            sfxService.play('ui_navigate');
        }
      },
    );

    return () => {
      unsubScreen();
    };
  }, []);

  return null;
}
