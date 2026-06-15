import type {
  GameState,
  LevelConfig,
  Minecart,
  ActiveEffect,
  CollisionResult,
} from '../types';
import {
  TRACK_CENTER,
  BASE_SPEED,
  GRAVITY,
  JUMP_FORCE,
} from './types';
import type {
  GameEngineConfig,
  EngineState,
  MinecartState,
  TrackPositions,
  GameEntity,
  OreEntity,
} from './types';
import {
  calculateTrackPositions,
  getTrackX,
  switchTrack,
  updateTrackPosition,
  checkAllCollisions,
  canJump,
  calculateScore,
  calculateSpeed,
  updateDistance,
} from './physics';
import { EntityManager, createRandomEntity, getRandomTrack } from './entities';
import { GameRenderer } from './renderer';

const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_TIME = 0.25;

export interface EngineCallbacks {
  onStateChange?: (state: EngineState) => void;
  onCollision?: (result: CollisionResult) => void;
  onGameOver?: (score: number, distance: number, ores: number) => void;
  onScoreChange?: (score: number) => void;
  onOreCollected?: (value: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameEngineConfig;
  private renderer: GameRenderer;
  private entityManager: EntityManager;

  private state: EngineState;
  private minecart: MinecartState;
  private trackPositions: TrackPositions;
  private currentLevel: LevelConfig | null = null;
  private currentMinecart: Minecart | null = null;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private isRunning: boolean = false;

  private spawnTimer: number = 0;
  private spawnInterval: number = 1.5;
  private callbacks: EngineCallbacks = {};

  private groundY: number = 0;
  private trackWidth: number = 120;

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<GameEngineConfig> = {},
    callbacks: EngineCallbacks = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }
    this.ctx = ctx;

    this.config = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      minecartWidth: 70,
      minecartHeight: 60,
      trackWidth: 120,
      baseSpeed: BASE_SPEED,
      ...config,
    };

    this.trackWidth = this.config.trackWidth;
    this.groundY = this.config.canvasHeight * 0.75 - this.config.minecartHeight;

    this.trackPositions = calculateTrackPositions(
      this.config.canvasWidth,
      this.config.trackWidth,
      this.config.minecartWidth
    );

    this.renderer = new GameRenderer(ctx, this.config.canvasWidth, this.config.canvasHeight);
    this.entityManager = new EntityManager(50);

    this.state = this.createInitialState();
    this.minecart = this.createInitialMinecart();
    this.callbacks = callbacks;

    this.setupInputHandlers();
  }

  private createInitialState(): EngineState {
    return {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      score: 0,
      distance: 0,
      ores: 0,
      health: 100,
      currentTrack: TRACK_CENTER,
      speed: this.config.baseSpeed,
      activeEffects: [],
      currentLevelId: 1,
    };
  }

  private createInitialMinecart(): MinecartState {
    return {
      x: getTrackX(TRACK_CENTER, this.trackPositions),
      y: this.groundY,
      targetX: getTrackX(TRACK_CENTER, this.trackPositions),
      velocityY: 0,
      isJumping: false,
      width: this.config.minecartWidth,
      height: this.config.minecartHeight,
      track: TRACK_CENTER,
      wheelRotation: 0,
    };
  }

  private setupInputHandlers(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private removeInputHandlers(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.state.isPlaying) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        this.moveRight();
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        e.preventDefault();
        if (!e.repeat) {
          this.jump();
        }
        break;
      case 'KeyP':
      case 'Escape':
        e.preventDefault();
        if (!e.repeat) {
          this.togglePause();
        }
        break;
    }
  }

  setLevel(level: LevelConfig): void {
    this.currentLevel = level;
    this.state.currentLevelId = level.id;
    this.spawnInterval = 2 / level.speedMultiplier;
  }

  setMinecart(minecart: Minecart): void {
    this.currentMinecart = minecart;
    this.state.health = minecart.health;
    this.state.speed = calculateSpeed(
      this.config.baseSpeed,
      minecart.speed,
      this.currentLevel?.speedMultiplier || 1
    );
  }

  start(level: LevelConfig, minecart: Minecart): void {
    this.setLevel(level);
    this.setMinecart(minecart);

    this.state = this.createInitialState();
    this.state.isPlaying = true;
    this.state.health = minecart.health;
    this.state.speed = calculateSpeed(
      this.config.baseSpeed,
      minecart.speed,
      level.speedMultiplier
    );

    this.minecart = this.createInitialMinecart();
    this.entityManager.clear();
    this.spawnTimer = 0;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.isRunning = true;

    this.notifyStateChange();
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (deltaTime > MAX_FRAME_TIME) {
      deltaTime = MAX_FRAME_TIME;
    }

    if (!this.state.isPaused && !this.state.isGameOver) {
      this.accumulator += deltaTime;

      while (this.accumulator >= FIXED_TIMESTEP) {
        this.update(FIXED_TIMESTEP);
        this.accumulator -= FIXED_TIMESTEP;
      }
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    this.updateMinecart(deltaTime);
    this.updateEntities(deltaTime);
    this.updateSpawner(deltaTime);
    this.updateEffects(deltaTime);
    this.updateScoreAndDistance(deltaTime);
    this.checkCollisions();
    this.renderer.updateParallax(this.state.speed, deltaTime);
    this.renderer.updateParticles(deltaTime);
  }

  private updateMinecart(deltaTime: number): void {
    const newX = updateTrackPosition(this.minecart, this.minecart.targetX, deltaTime);
    this.minecart.x = newX;

    this.minecart.velocityY += GRAVITY * deltaTime;
    this.minecart.y += this.minecart.velocityY * deltaTime;

    if (this.minecart.y >= this.groundY) {
      this.minecart.y = this.groundY;
      this.minecart.velocityY = 0;
      this.minecart.isJumping = false;
    }

    this.minecart.wheelRotation += (this.state.speed * deltaTime) / 12;

    const magnetEffect = this.state.activeEffects.find((e) => e.type === 'magnet');
    if (magnetEffect) {
      this.applyMagnetEffect();
    }
  }

  private applyMagnetEffect(): void {
    const magnetRange = 150;
    const ores = this.entityManager.getEntitiesByType('ore') as OreEntity[];
    const minecartCenterX = this.minecart.x + this.minecart.width / 2;
    const minecartCenterY = this.minecart.y + this.minecart.height / 2;

    for (const ore of ores) {
      const dx = minecartCenterX - (ore.x + ore.width / 2);
      const dy = minecartCenterY - (ore.y + ore.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < magnetRange) {
        const attractSpeed = 300 * (1 - distance / magnetRange);
        ore.x += (dx / distance) * attractSpeed * FIXED_TIMESTEP;
        ore.y += (dy / distance) * attractSpeed * FIXED_TIMESTEP;
      }
    }
  }

  private updateEntities(deltaTime: number): void {
    this.entityManager.update(deltaTime, this.state.speed);
  }

  private updateSpawner(deltaTime: number): void {
    if (!this.currentLevel) return;

    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEntities();
    }
  }

  private spawnEntities(): void {
    if (!this.currentLevel) return;

    const spawnCount = Math.min(3, Math.floor(Math.random() * 2) + 1);
    const usedTracks: number[] = [];

    for (let i = 0; i < spawnCount; i++) {
      let track = getRandomTrack();
      let attempts = 0;

      while (usedTracks.includes(track) && attempts < 3) {
        track = getRandomTrack();
        attempts++;
      }

      if (usedTracks.includes(track)) continue;
      usedTracks.push(track);

      const entity = createRandomEntity(
        this.config.canvasWidth + 50,
        track,
        this.groundY,
        this.currentLevel
      );

      if (entity) {
        entity.track = track;
        entity.x = getTrackX(track, this.trackPositions) + (this.config.minecartWidth - entity.width) / 2;
        this.entityManager.addEntity(entity);
      }
    }
  }

  private updateEffects(deltaTime: number): void {
    for (let i = this.state.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.state.activeEffects[i];
      effect.remainingTime -= deltaTime;

      if (effect.remainingTime <= 0) {
        this.state.activeEffects.splice(i, 1);
        this.onEffectEnd(effect);
      }
    }
  }

  private onEffectEnd(effect: ActiveEffect): void {
    if (effect.type === 'boost') {
      this.recalculateSpeed();
    }
  }

  private updateScoreAndDistance(deltaTime: number): void {
    this.state.distance = updateDistance(this.state.distance, this.state.speed, deltaTime);

    const scoreMultiplier = this.state.activeEffects.some((e) => e.type === 'boost') ? 2 : 1;
    const newScore = calculateScore(this.state.distance, this.state.ores, scoreMultiplier);

    if (newScore !== this.state.score) {
      this.state.score = newScore;
      this.callbacks.onScoreChange?.(this.state.score);
    }
  }

  private checkCollisions(): void {
    const entities = this.entityManager.getEntities();
    const collisions = checkAllCollisions(this.minecart, entities);

    for (const entity of collisions) {
      this.handleCollision(entity);
    }
  }

  private handleCollision(entity: GameEntity): void {
    const result = this.getCollisionResult(entity);

    if (result.collided) {
      this.applyCollisionResult(result);
      this.entityManager.removeEntity(entity);
      this.callbacks.onCollision?.(result);
      this.notifyStateChange();

      if (this.state.health <= 0 && !this.state.isGameOver) {
        this.gameOver();
      }
    }
  }

  private getCollisionResult(entity: GameEntity): CollisionResult {
    const hasShield = this.state.activeEffects.some((e) => e.type === 'shield');

    switch (entity.type) {
      case 'ore': {
        const ore = entity as OreEntity;
        this.renderer.emitParticles(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          '#ffd700',
          10,
          150,
          5,
          0.6
        );
        return {
          collided: true,
          entity,
          score: ore.value,
          ores: 1,
        };
      }

      case 'obstacle':
      case 'bat':
      case 'cavein': {
        const damageEntity = entity as { damage: number };
        if (hasShield) {
          const shieldIndex = this.state.activeEffects.findIndex((e) => e.type === 'shield');
          if (shieldIndex !== -1) {
            this.state.activeEffects.splice(shieldIndex, 1);
          }
          this.renderer.emitParticles(
            entity.x + entity.width / 2,
            entity.y + entity.height / 2,
            '#4488ff',
            15,
            200,
            6,
            0.5
          );
          return {
            collided: true,
            entity,
            damage: 0,
          };
        }
        this.renderer.emitParticles(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          '#ff4444',
          15,
          200,
          6,
          0.5
        );
        return {
          collided: true,
          entity,
          damage: damageEntity.damage,
        };
      }

      case 'boost': {
        const boost = entity as { speedMultiplier: number; duration: number };
        this.addEffect('boost', boost.duration);
        this.renderer.emitParticles(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          '#00ff88',
          12,
          180,
          5,
          0.6
        );
        return {
          collided: true,
          entity,
          effect: {
            type: 'boost',
            duration: boost.duration,
            remainingTime: boost.duration,
            startTime: Date.now(),
          },
        };
      }

      case 'shield': {
        const shield = entity as { duration: number };
        this.addEffect('shield', shield.duration);
        this.renderer.emitParticles(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          '#4488ff',
          12,
          180,
          5,
          0.6
        );
        return {
          collided: true,
          entity,
          effect: {
            type: 'shield',
            duration: shield.duration,
            remainingTime: shield.duration,
            startTime: Date.now(),
          },
        };
      }

      case 'magnet': {
        const magnet = entity as { duration: number };
        this.addEffect('magnet', magnet.duration);
        this.renderer.emitParticles(
          entity.x + entity.width / 2,
          entity.y + entity.height / 2,
          '#ff4488',
          12,
          180,
          5,
          0.6
        );
        return {
          collided: true,
          entity,
          effect: {
            type: 'magnet',
            duration: magnet.duration,
            remainingTime: magnet.duration,
            startTime: Date.now(),
          },
        };
      }

      default:
        return { collided: false };
    }
  }

  private applyCollisionResult(result: CollisionResult): void {
    if (result.damage) {
      this.state.health = Math.max(0, this.state.health - result.damage);
    }
    if (result.score) {
      this.state.score += result.score;
    }
    if (result.ores) {
      this.state.ores += result.ores;
      this.callbacks.onOreCollected?.(result.ores);
    }
  }

  private addEffect(type: 'boost' | 'shield' | 'magnet', duration: number): void {
    const existingIndex = this.state.activeEffects.findIndex((e) => e.type === type);

    if (existingIndex !== -1) {
      this.state.activeEffects[existingIndex].duration = duration;
      this.state.activeEffects[existingIndex].remainingTime = duration;
      this.state.activeEffects[existingIndex].startTime = Date.now();
    } else {
      this.state.activeEffects.push({
        type,
        duration,
        remainingTime: duration,
        startTime: Date.now(),
      });
    }

    if (type === 'boost') {
      this.recalculateSpeed();
    }
  }

  private recalculateSpeed(): void {
    if (!this.currentLevel || !this.currentMinecart) return;

    let multiplier = this.currentLevel.speedMultiplier * this.currentMinecart.speed;

    const boostEffect = this.state.activeEffects.find((e) => e.type === 'boost');
    if (boostEffect) {
      multiplier *= 1.5;
    }

    this.state.speed = this.config.baseSpeed * multiplier;
  }

  private render(): void {
    if (!this.currentLevel || !this.currentMinecart) return;

    this.renderer.render(
      this.minecart,
      this.entityManager.getEntities(),
      this.state,
      this.trackPositions,
      this.trackWidth,
      this.currentMinecart.color,
      this.currentMinecart.health,
      this.currentLevel.background
    );
  }

  moveLeft(): void {
    if (this.state.isPaused || this.state.isGameOver) return;

    const newTrack = switchTrack(this.minecart.track, 'left');
    if (newTrack !== this.minecart.track) {
      this.minecart.track = newTrack;
      this.minecart.targetX = getTrackX(newTrack, this.trackPositions);
      this.state.currentTrack = newTrack;
      this.notifyStateChange();
    }
  }

  moveRight(): void {
    if (this.state.isPaused || this.state.isGameOver) return;

    const newTrack = switchTrack(this.minecart.track, 'right');
    if (newTrack !== this.minecart.track) {
      this.minecart.track = newTrack;
      this.minecart.targetX = getTrackX(newTrack, this.trackPositions);
      this.state.currentTrack = newTrack;
      this.notifyStateChange();
    }
  }

  jump(): void {
    if (this.state.isPaused || this.state.isGameOver) return;

    if (canJump(this.minecart)) {
      this.minecart.velocityY = JUMP_FORCE;
      this.minecart.isJumping = true;
      this.renderer.emitParticles(
        this.minecart.x + this.minecart.width / 2,
        this.minecart.y + this.minecart.height,
        '#888888',
        8,
        100,
        4,
        0.4
      );
    }
  }

  togglePause(): void {
    if (this.state.isGameOver) return;

    this.state.isPaused = !this.state.isPaused;
    this.notifyStateChange();
  }

  pause(): void {
    if (!this.state.isPaused && !this.state.isGameOver) {
      this.state.isPaused = true;
      this.notifyStateChange();
    }
  }

  resume(): void {
    if (this.state.isPaused && !this.state.isGameOver) {
      this.state.isPaused = false;
      this.lastTime = performance.now();
      this.notifyStateChange();
    }
  }

  private gameOver(): void {
    this.state.isGameOver = true;
    this.state.isPlaying = false;
    this.notifyStateChange();
    this.callbacks.onGameOver?.(this.state.score, this.state.distance, this.state.ores);
  }

  restart(): void {
    if (!this.currentLevel || !this.currentMinecart) return;
    this.stop();
    this.start(this.currentLevel, this.currentMinecart);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.state.isPlaying = false;
    this.notifyStateChange();
  }

  destroy(): void {
    this.stop();
    this.removeInputHandlers();
    this.entityManager.clear();
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.({ ...this.state });
  }

  getState(): EngineState {
    return { ...this.state };
  }

  getMinecartState(): MinecartState {
    return { ...this.minecart };
  }

  getEntities(): GameEntity[] {
    return [...this.entityManager.getEntities()];
  }

  getRenderer(): GameRenderer {
    return this.renderer;
  }

  getEntityManager(): EntityManager {
    return this.entityManager;
  }

  resize(width: number, height: number): void {
    this.config.canvasWidth = width;
    this.config.canvasHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.groundY = height * 0.75 - this.config.minecartHeight;

    this.trackPositions = calculateTrackPositions(
      width,
      this.config.trackWidth,
      this.config.minecartWidth
    );

    this.minecart.targetX = getTrackX(this.minecart.track, this.trackPositions);
    this.minecart.y = Math.min(this.minecart.y, this.groundY);

    this.renderer.resize(width, height);
  }

  useItem(type: 'shield' | 'magnet' | 'boost'): boolean {
    if (!this.state.isPlaying || this.state.isGameOver) return false;

    const durations: Record<string, number> = {
      shield: 10,
      magnet: 15,
      boost: 8,
    };

    this.addEffect(type, durations[type]);
    this.notifyStateChange();
    return true;
  }

  revive(healthPercentage: number = 0.5): boolean {
    if (!this.state.isGameOver) return false;

    this.state.health = (this.currentMinecart?.health || 100) * healthPercentage;
    this.state.isGameOver = false;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.lastTime = performance.now();

    this.entityManager.clear();
    this.minecart.y = this.groundY;
    this.minecart.velocityY = 0;
    this.minecart.isJumping = false;

    this.notifyStateChange();
    return true;
  }

  addExtraLife(): void {
    if (this.currentMinecart) {
      this.state.health = Math.min(
        this.state.health + this.currentMinecart.health * 0.5,
        this.currentMinecart.health
      );
      this.notifyStateChange();
    }
  }

  getGameState(): GameState {
    return {
      isPlaying: this.state.isPlaying,
      isPaused: this.state.isPaused,
      isGameOver: this.state.isGameOver,
      score: this.state.score,
      distance: this.state.distance,
      ores: this.state.ores,
      health: this.state.health,
      currentTrack: this.state.currentTrack,
      speed: this.state.speed,
      activeEffects: [...this.state.activeEffects],
      currentLevelId: this.state.currentLevelId,
    };
  }
}

export { FIXED_TIMESTEP };
