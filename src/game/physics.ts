import type { Entity } from '../types';
import {
  TRACK_COUNT,
  TRACK_LEFT,
  TRACK_CENTER,
  TRACK_RIGHT,
  GRAVITY,
  JUMP_FORCE,
  LANE_SWITCH_DURATION,
} from './types';
import type {
  MinecartState,
  TrackPositions,
  GameEntity,
} from './types';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const checkAABBCollision = (a: AABB, b: AABB): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

export const entityToAABB = (entity: Entity): AABB => {
  return {
    x: entity.x,
    y: entity.y,
    width: entity.width,
    height: entity.height,
  };
};

export const minecartToAABB = (minecart: MinecartState): AABB => {
  return {
    x: minecart.x,
    y: minecart.y,
    width: minecart.width,
    height: minecart.height,
  };
};

export const calculateTrackPositions = (
  canvasWidth: number,
  trackWidth: number,
  minecartWidth: number
): TrackPositions => {
  const totalTracksWidth = trackWidth * TRACK_COUNT;
  const startX = (canvasWidth - totalTracksWidth) / 2;
  const offset = (trackWidth - minecartWidth) / 2;

  return {
    left: startX + offset,
    center: startX + trackWidth + offset,
    right: startX + trackWidth * 2 + offset,
  };
};

export const getTrackX = (
  track: number,
  positions: TrackPositions
): number => {
  switch (track) {
    case TRACK_LEFT:
      return positions.left;
    case TRACK_CENTER:
      return positions.center;
    case TRACK_RIGHT:
      return positions.right;
    default:
      return positions.center;
  }
};

export const switchTrack = (
  currentTrack: number,
  direction: 'left' | 'right'
): number => {
  let newTrack = currentTrack;
  if (direction === 'left' && currentTrack > TRACK_LEFT) {
    newTrack = currentTrack - 1;
  } else if (direction === 'right' && currentTrack < TRACK_RIGHT) {
    newTrack = currentTrack + 1;
  }
  return newTrack;
};

export const updateTrackPosition = (
  minecart: MinecartState,
  targetX: number,
  deltaTime: number
): number => {
  const diff = targetX - minecart.x;
  const speed = Math.abs(diff) / LANE_SWITCH_DURATION;
  const moveAmount = speed * deltaTime;

  if (Math.abs(diff) <= moveAmount) {
    return targetX;
  }

  return minecart.x + Math.sign(diff) * moveAmount;
};

export const applyGravity = (
  velocityY: number,
  deltaTime: number
): number => {
  return velocityY + GRAVITY * deltaTime;
};

export const jump = (): number => {
  return JUMP_FORCE;
};

export const updateJumpPhysics = (
  minecart: MinecartState,
  deltaTime: number,
  groundY: number
): MinecartState => {
  let newVelocityY = minecart.velocityY + GRAVITY * deltaTime;
  let newY = minecart.y + newVelocityY * deltaTime;
  let isJumping = minecart.isJumping;

  if (newY >= groundY) {
    newY = groundY;
    newVelocityY = 0;
    isJumping = false;
  }

  return {
    ...minecart,
    y: newY,
    velocityY: newVelocityY,
    isJumping,
  };
};

export const calculateJumpHeight = (
  initialVelocity: number,
  time: number
): number => {
  return initialVelocity * time + 0.5 * GRAVITY * time * time;
};

export const isJumping = (minecart: MinecartState): boolean => {
  return minecart.isJumping;
};

export const canJump = (minecart: MinecartState): boolean => {
  return !minecart.isJumping;
};

export const checkEntityCollision = (
  minecart: MinecartState,
  entities: GameEntity[]
): GameEntity | null => {
  const minecartAABB = minecartToAABB(minecart);

  for (const entity of entities) {
    const entityAABB = entityToAABB(entity);
    if (checkAABBCollision(minecartAABB, entityAABB)) {
      return entity;
    }
  }

  return null;
};

export const checkAllCollisions = (
  minecart: MinecartState,
  entities: GameEntity[]
): GameEntity[] => {
  const minecartAABB = minecartToAABB(minecart);
  const collided: GameEntity[] = [];

  for (const entity of entities) {
    const entityAABB = entityToAABB(entity);
    if (checkAABBCollision(minecartAABB, entityAABB)) {
      collided.push(entity);
    }
  }

  return collided;
};

export const getCollisionResponse = (
  minecart: MinecartState,
  entity: GameEntity,
  ignoreTypes: string[] = []
): boolean => {
  if (ignoreTypes.includes(entity.type)) {
    return false;
  }
  const minecartAABB = minecartToAABB(minecart);
  const entityAABB = entityToAABB(entity);
  return checkAABBCollision(minecartAABB, entityAABB);
};

export const calculateSpeed = (
  baseSpeed: number,
  speedMultiplier: number,
  boostMultiplier: number = 1
): number => {
  return baseSpeed * speedMultiplier * boostMultiplier;
};

export const updateDistance = (
  currentDistance: number,
  speed: number,
  deltaTime: number
): number => {
  return currentDistance + speed * deltaTime;
};

export const calculateScore = (
  distance: number,
  ores: number,
  multiplier: number = 1
): number => {
  return Math.floor((distance / 10 + ores * 10) * multiplier);
};

export const isEntityOffScreen = (
  entity: Entity,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  return (
    entity.x + entity.width < 0 ||
    entity.x > canvasWidth ||
    entity.y + entity.height < 0 ||
    entity.y > canvasHeight
  );
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};
