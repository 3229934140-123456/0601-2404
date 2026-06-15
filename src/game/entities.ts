import type { Entity, EntityType, LevelConfig } from '../types';
import type {
  GameEntity,
  OreEntity,
  ObstacleEntity,
  BatEntity,
  CaveInEntity,
  BoostEntity,
  ShieldEntity,
  MagnetEntity,
  EntityPool,
} from './types';
import { TRACK_LEFT, TRACK_CENTER, TRACK_RIGHT } from './types';

let entityIdCounter = 0;

const generateEntityId = (): string => {
  entityIdCounter += 1;
  return `entity-${Date.now()}-${entityIdCounter}`;
};

export abstract class EntityBase implements Entity {
  id: string;
  abstract readonly type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  track: number;
  value?: number;
  velocityY?: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    track: number
  ) {
    this.id = generateEntityId();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.track = track;
  }

  update(deltaTime: number, speed: number): void {
    this.x -= speed * deltaTime;
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }

  toJSON(): Entity {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      track: this.track,
      value: this.value,
      velocityY: this.velocityY,
    };
  }
}

export class Ore extends EntityBase implements OreEntity {
  readonly type = 'ore' as const;
  declare value: number;

  constructor(x: number, y: number, track: number, value: number = 10) {
    super(x, y, 32, 32, track);
    this.value = value;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
  }
}

export class Obstacle extends EntityBase implements ObstacleEntity {
  readonly type = 'obstacle' as const;
  damage: number;

  constructor(x: number, y: number, track: number, damage: number = 20) {
    super(x, y, 50, 50, track);
    this.damage = damage;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
  }
}

export class Bat extends EntityBase implements BatEntity {
  readonly type = 'bat' as const;
  damage: number;
  declare velocityY: number;
  amplitude: number;
  frequency: number;
  baseY: number;
  private time: number;

  constructor(x: number, y: number, track: number, damage: number = 15) {
    super(x, y, 40, 30, track);
    this.damage = damage;
    this.velocityY = 0;
    this.amplitude = 30;
    this.frequency = 3;
    this.baseY = y;
    this.time = 0;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
    this.time += deltaTime;
    this.y = this.baseY + Math.sin(this.time * this.frequency) * this.amplitude;
    this.velocityY = Math.cos(this.time * this.frequency) * this.amplitude * this.frequency;
  }
}

export class CaveIn extends EntityBase implements CaveInEntity {
  readonly type = 'cavein' as const;
  damage: number;
  private fallSpeed: number;

  constructor(x: number, y: number, track: number, damage: number = 30) {
    super(x, y, 60, 60, track);
    this.damage = damage;
    this.fallSpeed = 200;
    this.velocityY = 0;
  }

  update(deltaTime: number, speed: number): void {
    this.x -= speed * deltaTime;
    this.velocityY = this.fallSpeed;
    this.y += this.velocityY * deltaTime;
  }
}

export class Boost extends EntityBase implements BoostEntity {
  readonly type = 'boost' as const;
  speedMultiplier: number;
  duration: number;

  constructor(x: number, y: number, track: number) {
    super(x, y, 80, 20, track);
    this.speedMultiplier = 1.5;
    this.duration = 5;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
  }
}

export class ShieldItem extends EntityBase implements ShieldEntity {
  readonly type = 'shield' as const;
  duration: number;

  constructor(x: number, y: number, track: number) {
    super(x, y, 35, 35, track);
    this.duration = 10;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
  }
}

export class MagnetItem extends EntityBase implements MagnetEntity {
  readonly type = 'magnet' as const;
  duration: number;
  range: number;

  constructor(x: number, y: number, track: number) {
    super(x, y, 35, 35, track);
    this.duration = 15;
    this.range = 150;
  }

  update(deltaTime: number, speed: number): void {
    super.update(deltaTime, speed);
  }
}

export type EntityClassType =
  | typeof Ore
  | typeof Obstacle
  | typeof Bat
  | typeof CaveIn
  | typeof Boost
  | typeof ShieldItem
  | typeof MagnetItem;

export const EntityFactory = {
  createOre: (x: number, y: number, track: number, value?: number): Ore => {
    return new Ore(x, y, track, value);
  },

  createObstacle: (x: number, y: number, track: number, damage?: number): Obstacle => {
    return new Obstacle(x, y, track, damage);
  },

  createBat: (x: number, y: number, track: number, damage?: number): Bat => {
    return new Bat(x, y, track, damage);
  },

  createCaveIn: (x: number, y: number, track: number, damage?: number): CaveIn => {
    return new CaveIn(x, y, track, damage);
  },

  createBoost: (x: number, y: number, track: number): Boost => {
    return new Boost(x, y, track);
  },

  createShield: (x: number, y: number, track: number): ShieldItem => {
    return new ShieldItem(x, y, track);
  },

  createMagnet: (x: number, y: number, track: number): MagnetItem => {
    return new MagnetItem(x, y, track);
  },

  createByType: (
    type: EntityType,
    x: number,
    y: number,
    track: number
  ): GameEntity | null => {
    switch (type) {
      case 'ore':
        return EntityFactory.createOre(x, y, track);
      case 'obstacle':
        return EntityFactory.createObstacle(x, y, track);
      case 'bat':
        return EntityFactory.createBat(x, y, track);
      case 'cavein':
        return EntityFactory.createCaveIn(x, y, track);
      case 'boost':
        return EntityFactory.createBoost(x, y, track);
      case 'shield':
        return EntityFactory.createShield(x, y, track);
      case 'magnet':
        return EntityFactory.createMagnet(x, y, track);
      default:
        return null;
    }
  },
};

export class EntityPoolImpl<T extends EntityBase> implements EntityPool<T> {
  pool: T[];
  maxSize: number;
  private factory: () => T;

  constructor(maxSize: number, factory: () => T) {
    this.pool = [];
    this.maxSize = maxSize;
    this.factory = factory;
  }

  acquire(): T | undefined {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  release(entity: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(entity);
    }
  }

  clear(): void {
    this.pool = [];
  }

  size(): number {
    return this.pool.length;
  }
}

export class EntityManager {
  private entities: GameEntity[];
  private orePool: EntityPoolImpl<Ore>;
  private obstaclePool: EntityPoolImpl<Obstacle>;
  private batPool: EntityPoolImpl<Bat>;
  private caveInPool: EntityPoolImpl<CaveIn>;
  private boostPool: EntityPoolImpl<Boost>;
  private shieldPool: EntityPoolImpl<ShieldItem>;
  private magnetPool: EntityPoolImpl<MagnetItem>;

  constructor(maxPoolSize: number = 50) {
    this.entities = [];
    this.orePool = new EntityPoolImpl(maxPoolSize, () => new Ore(0, 0, 0, 0));
    this.obstaclePool = new EntityPoolImpl(maxPoolSize, () => new Obstacle(0, 0, 0, 0));
    this.batPool = new EntityPoolImpl(maxPoolSize, () => new Bat(0, 0, 0, 0));
    this.caveInPool = new EntityPoolImpl(maxPoolSize, () => new CaveIn(0, 0, 0, 0));
    this.boostPool = new EntityPoolImpl(maxPoolSize, () => new Boost(0, 0, 0));
    this.shieldPool = new EntityPoolImpl(maxPoolSize, () => new ShieldItem(0, 0, 0));
    this.magnetPool = new EntityPoolImpl(maxPoolSize, () => new MagnetItem(0, 0, 0));
  }

  addEntity(entity: GameEntity): void {
    this.entities.push(entity);
  }

  removeEntity(entity: GameEntity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      this.returnToPool(entity);
    }
  }

  removeById(id: string): void {
    const index = this.entities.findIndex((e) => e.id === id);
    if (index !== -1) {
      const entity = this.entities[index];
      this.entities.splice(index, 1);
      this.returnToPool(entity);
    }
  }

  private returnToPool(entity: GameEntity): void {
    switch (entity.type) {
      case 'ore':
        this.orePool.release(entity as Ore);
        break;
      case 'obstacle':
        this.obstaclePool.release(entity as Obstacle);
        break;
      case 'bat':
        this.batPool.release(entity as Bat);
        break;
      case 'cavein':
        this.caveInPool.release(entity as CaveIn);
        break;
      case 'boost':
        this.boostPool.release(entity as Boost);
        break;
      case 'shield':
        this.shieldPool.release(entity as ShieldItem);
        break;
      case 'magnet':
        this.magnetPool.release(entity as MagnetItem);
        break;
    }
  }

  update(deltaTime: number, speed: number): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if ('update' in entity) {
        (entity as EntityBase).update(deltaTime, speed);
      } else {
        entity.x -= speed * deltaTime;
      }

      if (entity.x + entity.width < 0) {
        this.entities.splice(i, 1);
        this.returnToPool(entity);
      }
    }
  }

  getEntities(): GameEntity[] {
    return this.entities;
  }

  getEntitiesByType(type: EntityType): GameEntity[] {
    return this.entities.filter((e) => e.type === type);
  }

  getEntityById(id: string): GameEntity | undefined {
    return this.entities.find((e) => e.id === id);
  }

  clear(): void {
    this.entities = [];
    this.orePool.clear();
    this.obstaclePool.clear();
    this.batPool.clear();
    this.caveInPool.clear();
    this.boostPool.clear();
    this.shieldPool.clear();
    this.magnetPool.clear();
  }

  count(): number {
    return this.entities.length;
  }

  acquireFromPool(type: EntityType): GameEntity | undefined {
    switch (type) {
      case 'ore':
        return this.orePool.acquire();
      case 'obstacle':
        return this.obstaclePool.acquire();
      case 'bat':
        return this.batPool.acquire();
      case 'cavein':
        return this.caveInPool.acquire();
      case 'boost':
        return this.boostPool.acquire();
      case 'shield':
        return this.shieldPool.acquire();
      case 'magnet':
        return this.magnetPool.acquire();
      default:
        return undefined;
    }
  }
}

export const getRandomTrack = (): number => {
  const tracks = [TRACK_LEFT, TRACK_CENTER, TRACK_RIGHT];
  return tracks[Math.floor(Math.random() * tracks.length)];
};

export const getEntityYPosition = (
  type: EntityType,
  groundY: number
): number => {
  switch (type) {
    case 'ore':
      return groundY - 40;
    case 'obstacle':
      return groundY - 50;
    case 'bat':
      return groundY - 120 - Math.random() * 50;
    case 'cavein':
      return -60;
    case 'boost':
      return groundY - 20;
    case 'shield':
    case 'magnet':
      return groundY - 50 - Math.random() * 50;
    default:
      return groundY - 40;
  }
};

export const createRandomEntity = (
  x: number,
  track: number,
  groundY: number,
  level: LevelConfig
): GameEntity | null => {
  const rand = Math.random();
  const oreChance = level.oreFrequency;
  const obstacleChance = level.obstacleFrequency;
  const batChance = 0.1 * level.difficulty;
  const caveInChance = 0.05 * level.difficulty;
  const itemChance = 0.08;

  let cumulative = 0;

  cumulative += oreChance;
  if (rand < cumulative) {
    const value = 10 + Math.floor(Math.random() * 20) * level.difficulty;
    const y = getEntityYPosition('ore', groundY);
    return EntityFactory.createOre(x, y, track, value);
  }

  cumulative += obstacleChance;
  if (rand < cumulative) {
    const damage = 10 + Math.floor(Math.random() * 15) * level.difficulty;
    const y = getEntityYPosition('obstacle', groundY);
    return EntityFactory.createObstacle(x, y, track, damage);
  }

  cumulative += batChance;
  if (rand < cumulative) {
    const y = getEntityYPosition('bat', groundY);
    return EntityFactory.createBat(x, y, track);
  }

  cumulative += caveInChance;
  if (rand < cumulative) {
    const y = getEntityYPosition('cavein', groundY);
    return EntityFactory.createCaveIn(x, y, track);
  }

  cumulative += itemChance;
  if (rand < cumulative) {
    const itemType = Math.random();
    const y = groundY - 50 - Math.random() * 50;
    if (itemType < 0.35) {
      return EntityFactory.createBoost(x, y, track);
    } else if (itemType < 0.65) {
      return EntityFactory.createShield(x, y, track);
    } else {
      return EntityFactory.createMagnet(x, y, track);
    }
  }

  return null;
};
