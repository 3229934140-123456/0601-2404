import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../utils/storage';

interface SettingsState {
  soundVolume: number;
  musicVolume: number;
  screenShake: boolean;
  particleEffects: boolean;
  pixelQuality: 'low' | 'medium' | 'high';
}

interface SettingsActions {
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  toggleScreenShake: () => void;
  toggleParticleEffects: () => void;
  setPixelQuality: (quality: 'low' | 'medium' | 'high') => void;
  resetSettings: () => void;
}

const getInitialState = (): SettingsState => ({
  soundVolume: 0.7,
  musicVolume: 0.5,
  screenShake: true,
  particleEffects: true,
  pixelQuality: 'medium',
});

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setSoundVolume: (volume: number) => {
        set({ soundVolume: Math.max(0, Math.min(1, volume)) });
      },

      setMusicVolume: (volume: number) => {
        set({ musicVolume: Math.max(0, Math.min(1, volume)) });
      },

      toggleScreenShake: () => {
        set({ screenShake: !get().screenShake });
      },

      toggleParticleEffects: () => {
        set({ particleEffects: !get().particleEffects });
      },

      setPixelQuality: (quality: 'low' | 'medium' | 'high') => {
        set({ pixelQuality: quality });
      },

      resetSettings: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'settings-storage',
      storage: storage,
    }
  )
);
