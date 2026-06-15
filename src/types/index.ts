export type EntityType = 'ore' | 'obstacle' | 'bat' | 'cavein' | 'boost' | 'shield' | 'magnet';

export type PixelQuality = 'low' | 'medium' | 'high';

export type LevelType = 'normal' | 'timed';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface PlayerData {
  id: string;
  name: string;
  coins: number;
  totalScore: number;
  highScore: number;
  unlockedMinecarts: number[];
  currentMinecart: number;
  achievements: number[];
  inventory: Record<number, number>;
  settings: GameSettings;
  createdAt: string;
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  screenShake: boolean;
  particles: boolean;
  pixelQuality: PixelQuality;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  distance: number;
  ores: number;
  health: number;
  currentTrack: number;
  speed: number;
  activeEffects: ActiveEffect[];
  currentLevelId: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  track: number;
  value?: number;
  velocityY?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  type: LevelType;
  difficulty: Difficulty;
  timeLimit?: number;
  background: string;
  obstacleFrequency: number;
  oreFrequency: number;
  speedMultiplier: number;
  unlocked: boolean;
  highScore: number;
}

export interface Minecart {
  id: number;
  name: string;
  color: string;
  speed: number;
  health: number;
  price: number;
  unlocked: boolean;
  description?: string;
}

export interface Item {
  id: number;
  name: string;
  type: 'consumable' | 'permanent';
  description: string;
  price: number;
  effectDuration?: number;
  effectType?: 'boost' | 'shield' | 'magnet' | 'heal';
  effectValue?: number;
  icon: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
  condition: {
    type: 'score' | 'distance' | 'ores' | 'level' | 'achievement';
    target: number;
  };
}

export interface DailyQuest {
  id: number;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  date: string;
  type: 'collect_ores' | 'run_distance' | 'play_game' | 'get_score';
}

export interface ActiveEffect {
  type: 'boost' | 'shield' | 'magnet' | 'doubleScore';
  duration: number;
  remainingTime: number;
  startTime: number;
}

export interface GameRecord {
  id: string;
  playerId: string;
  levelId: number;
  score: number;
  distance: number;
  oresCollected: number;
  date: string;
  minecartId: number;
}

export interface ShopItem {
  id: number;
  itemId: number;
  itemType: 'minecart' | 'item';
  price: number;
  discount?: number;
  featured?: boolean;
}

export interface InventoryItem {
  itemId: number;
  quantity: number;
}

export interface CollisionResult {
  collided: boolean;
  entity?: Entity;
  damage?: number;
  score?: number;
  ores?: number;
  effect?: ActiveEffect;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  type: 'music' | 'sfx';
  frequency?: number;
  duration?: number;
  volume: number;
}
