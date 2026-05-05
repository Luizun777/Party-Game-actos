import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SfxStoreSync } from '@/services/sfx/SfxStoreSync';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlayersScreen } from '@/screens/PlayersScreen';
import { ModeScreen } from '@/screens/ModeScreen';
import { CategoryScreen } from '@/screens/CategoryScreen';
import { AddContentScreen } from '@/screens/AddContentScreen';
import { RandomGlobalScreen } from '@/screens/RandomGlobalScreen';
import { ReviewPoolScreen } from '@/screens/ReviewPoolScreen';
import { RoundScreen } from '@/screens/RoundScreen';
import { TurnTransitionScreen } from '@/screens/TurnTransitionScreen';
import { ActEndScreen } from '@/screens/ActEndScreen';
import { FinalScreen } from '@/screens/FinalScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

export function App() {
  const screen = useGameStore(s => s.screen);
  const loadState = useGameStore(s => s.loadState);
  const darkMode = useSettingsStore(s => s.darkMode);

  useEffect(() => { loadState(); }, [loadState]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <>
      <SfxStoreSync />
      <div className="app-shell">
        <div className="app-frame">
          {screen === 'home'           && <HomeScreen />}
          {screen === 'players'        && <PlayersScreen />}
          {screen === 'mode'           && <ModeScreen />}
          {screen === 'category'       && <CategoryScreen />}
          {screen === 'addContent'     && <AddContentScreen />}
          {screen === 'randomGlobal'   && <RandomGlobalScreen />}
          {screen === 'reviewPool'     && <ReviewPoolScreen />}
          {screen === 'round'          && <RoundScreen />}
          {screen === 'turnTransition' && <TurnTransitionScreen />}
          {screen === 'actEnd'         && <ActEndScreen />}
          {screen === 'final'          && <FinalScreen />}
          {screen === 'settings'       && <SettingsScreen />}
        </div>
      </div>
    </>
  );
}

export default App;
