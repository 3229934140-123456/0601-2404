import type { Entity, ActiveEffect, CollisionResult, LevelConfig, EntityType } from '../types';

export const TRACK_COUNT = 3;
export const TRACK_LEFT = 0;
export const TRACK_CENTER = 1;
export const TRACK_RIGHT = 2;

export const GRAVITY = 1800;
export const JUMP_FORCE = -750;
export const BASE_SPEED = 300;
export const LANE_SWITCH_DURATION = 0.15;

export interface GameEngineConfig {
  canvasWidth: number;
  canvasHeight: number;
  minecartWidth: number;
  minecartHeight: number;
  trackWidth: number;
  baseSpeed: number;
}

export interface EngineState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  distance: number;
  ores: number;
  goldOreCount: number;
  damageTaken: number;
  health: number;
  currentTrack: number;
  speed: number;
  activeEffects: ActiveEffect[];
  currentLevelId: number;
  remainingTime?: number;
  timeLimit?: number;
  levelType?: 'normal' | 'timed';
}

export interface MinecartState {
  x: number;
  y: number;
  targetX: number;
  velocityY: number;
  isJumping: boolean;
  width: number;
  height: number;
  track: number;
  wheelRotation: number;
}

export interface TrackPositions {
  left: number;
  center: number;
  right: number;
}

export interface LayerConfig {
  speed: number;
  offset: number;
  color: string;
}

export interface ParallaxLayers {
  far: LayerConfig;
  middle: LayerConfig;
  near: LayerConfig;
}

export interface EntityPool<T extends Entity> {
  pool: T[];
  maxSize: number;
  acquire: () => T | undefined;
  release: (entity: T) => void;
  clear: () => void;
}

export interface SpawnConfig {
  obstacleChance: number;
  oreChance: number;
  batChance: number;
  caveInChance: number;
  boostChance: number;
  shieldChance: number;
  magnetChance: number;
  minSpawnDistance: number;
  maxSpawnDistance: number;
}

export type EntityClass = 'ore' | 'obstacle' | 'bat' | 'cavein' | 'boost' | 'shield' | 'magnet';

export interface OreEntity extends Entity {
  type: 'ore';
  value: number;
}

export interface ObstacleEntity extends Entity {
  type: 'obstacle';
  damage: number;
}

export interface BatEntity extends Entity {
  type: 'bat';
  damage: number;
  velocityY: number;
  amplitude: number;
  frequency: number;
  baseY: number;
}

export interface CaveInEntity extends Entity {
  type: 'cavein';
  damage: number;
}

export interface BoostEntity extends Entity {
  type: 'boost';
  speedMultiplier: number;
  duration: number;
}

export interface ShieldEntity extends Entity {
  type: 'shield';
  duration: number;
}

export interface MagnetEntity extends Entity {
  type: 'magnet';
  duration: number;
  range: number;
}

export type GameEntity =
  | OreEntity
  | ObstacleEntity
  | BatEntity
  | CaveInEntity
  | BoostEntity
  | ShieldEntity
  | MagnetEntity;

export interface ParticleSystemConfig {
  maxParticles: number;
  gravity: number;
  airResistance: number;
}

export interface HUDConfig {
  showScore: boolean;
  showDistance: boolean;
  showOres: boolean;
  showHealth: boolean;
  showEffects: boolean;
}

export interface RendererConfig {
  showScanlines: boolean;
  scanlineIntensity: number;
  pixelQuality: 'low' | 'medium' | 'high';
  showParticles: boolean;
}

export type EntityCollisionHandler = (
  minecart: MinecartState,
  entity: GameEntity,
  state: EngineState
) => CollisionResult;

export type EntitySpawner = (
  track: number,
  distance: number,
  level: LevelConfig
) => GameEntity | null;

export interface SpawnerEntry {
  type: EntityType;
  chance: number;
  spawner: EntitySpawner;
}
