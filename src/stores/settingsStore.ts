import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sfxService } from '@/services/sfx/sfxService';

interface SettingsState {
  darkMode: boolean;
  volume: number;   // 0–1
  muted: boolean;
  timerSeconds: number;

  setDarkMode: (v: boolean) => void;
  setVolume: (v: number) => void;
  setMuted: (v: boolean) => void;
  toggleMuted: () => void;
  setTimerSeconds: (n: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: true,
      volume: 0.8,
      muted: false,
      timerSeconds: 60,

      setDarkMode(v) {
        set({ darkMode: v });
        document.documentElement.dataset.theme = v ? 'dark' : 'light';
      },

      setVolume(v) {
        const clamped = Math.max(0, Math.min(1, v));
        set({ volume: clamped });
        sfxService.setVolume(clamped);
      },

      setMuted(v) {
        set({ muted: v });
        sfxService.setMuted(v);
      },

      toggleMuted() {
        const next = !get().muted;
        get().setMuted(next);
      },

      setTimerSeconds(n) {
        set({ timerSeconds: Math.max(15, Math.min(180, n)) });
      },
    }),
    {
      name: 'actos-settings',
      // Sync sfxService on rehydration
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        sfxService.setVolume(state.volume);
        sfxService.setMuted(state.muted);
        document.documentElement.dataset.theme = state.darkMode ? 'dark' : 'light';
      },
    },
  ),
);
