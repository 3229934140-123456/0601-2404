import { create } from 'zustand';

export type TrackPosition = 'left' | 'center' | 'right';

export type ActiveEffect = {
  type: 'shield' | 'magnet' | 'double_coins';
  duration: number;
  startTime: number;
};

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  distance: number;
  oreCount: number;
  lives: number;
  maxLives: number;
  currentTrack: TrackPosition;
  baseSpeed: number;
  speedMultiplier: number;
  activeEffects: ActiveEffect[];
}

interface GameActions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (amount: number) => void;
  addDistance: (amount: number) => void;
  addOre: (count?: number) => void;
  loseLife: () => void;
  addLife: () => void;
  changeTrack: (direction: 'left' | 'right') => void;
  setSpeedMultiplier: (multiplier: number) => void;
  addEffect: (effect: Omit<ActiveEffect, 'startTime'>) => void;
  removeEffect: (type: ActiveEffect['type']) => void;
  updateEffects: (currentTime: number) => void;
  hasEffect: (type: ActiveEffect['type']) => boolean;
}

const getInitialState = (): GameState => ({
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  distance: 0,
  oreCount: 0,
  lives: 3,
  maxLives: 3,
  currentTrack: 'center',
  baseSpeed: 5,
  speedMultiplier: 1,
  activeEffects: [],
});

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  startGame: () => {
    set({
      ...getInitialState(),
      isPlaying: true,
    });
  },

  pauseGame: () => {
    if (get().isPlaying && !get().isGameOver) {
      set({ isPaused: true });
    }
  },

  resumeGame: () => {
    if (get().isPaused) {
      set({ isPaused: false });
    }
  },

  endGame: () => {
    set({
      isPlaying: false,
      isPaused: false,
      isGameOver: true,
    });
  },

  resetGame: () => {
    set(getInitialState());
  },

  addScore: (amount: number) => {
    const hasDoubleCoins = get().hasEffect('double_coins');
    const multiplier = hasDoubleCoins ? 2 : 1;
    set({ score: get().score + amount * multiplier });
  },

  addDistance: (amount: number) => {
    set({ distance: get().distance + amount });
  },

  addOre: (count: number = 1) => {
    set({ oreCount: get().oreCount + count });
  },

  loseLife: () => {
    const hasShield = get().hasEffect('shield');
    if (hasShield) {
      get().removeEffect('shield');
      return;
    }

    const newLives = get().lives - 1;
    if (newLives <= 0) {
      set({ lives: 0 });
      get().endGame();
    } else {
      set({ lives: newLives });
    }
  },

  addLife: () => {
    const { lives, maxLives } = get();
    if (lives < maxLives) {
      set({ lives: lives + 1 });
    }
  },

  changeTrack: (direction: 'left' | 'right') => {
    const tracks: TrackPosition[] = ['left', 'center', 'right'];
    const currentIndex = tracks.indexOf(get().currentTrack);
    
    let newIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'right' && currentIndex < tracks.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      set({ currentTrack: tracks[newIndex] });
    }
  },

  setSpeedMultiplier: (multiplier: number) => {
    set({ speedMultiplier: Math.max(0.5, Math.min(3, multiplier)) });
  },

  addEffect: (effect: Omit<ActiveEffect, 'startTime'>) => {
    const newEffect: ActiveEffect = {
      ...effect,
      startTime: Date.now(),
    };

    set({
      activeEffects: [
        ...get().activeEffects.filter(e => e.type !== effect.type),
        newEffect,
      ],
    });
  },

  removeEffect: (type: ActiveEffect['type']) => {
    set({
      activeEffects: get().activeEffects.filter(e => e.type !== type),
    });
  },

  updateEffects: (currentTime: number) => {
    const { activeEffects } = get();
    const updatedEffects = activeEffects.filter(
      effect => currentTime - effect.startTime < effect.duration
    );
    
    if (updatedEffects.length !== activeEffects.length) {
      set({ activeEffects: updatedEffects });
    }
  },

  hasEffect: (type: ActiveEffect['type']) => {
    return get().activeEffects.some(e => e.type === type);
  },
}));
