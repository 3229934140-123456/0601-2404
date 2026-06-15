export type LevelType = 'normal' | 'timed';

export interface Level {
  id: string;
  name: string;
  type: LevelType;
  difficulty: number;
  timeLimit?: number;
  background: string;
  obstacleFrequency: number;
  oreFrequency: number;
  speedMultiplier: number;
  unlocked: boolean;
  highScore: number;
}

export const levels: Level[] = [
  {
    id: 'level-1',
    name: '新手矿洞',
    type: 'normal',
    difficulty: 1,
    background: '#8B4513',
    obstacleFrequency: 0.3,
    oreFrequency: 0.6,
    speedMultiplier: 1.0,
    unlocked: true,
    highScore: 0,
  },
  {
    id: 'level-2',
    name: '幽暗隧道',
    type: 'normal',
    difficulty: 2,
    background: '#4A4A4A',
    obstacleFrequency: 0.4,
    oreFrequency: 0.55,
    speedMultiplier: 1.1,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'level-3',
    name: '水晶矿脉',
    type: 'normal',
    difficulty: 3,
    background: '#2C3E50',
    obstacleFrequency: 0.5,
    oreFrequency: 0.5,
    speedMultiplier: 1.2,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'level-4',
    name: '熔岩深渊',
    type: 'normal',
    difficulty: 4,
    background: '#8B0000',
    obstacleFrequency: 0.6,
    oreFrequency: 0.45,
    speedMultiplier: 1.35,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'level-5',
    name: '远古遗迹',
    type: 'normal',
    difficulty: 5,
    background: '#1A1A2E',
    obstacleFrequency: 0.7,
    oreFrequency: 0.4,
    speedMultiplier: 1.5,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'timed-1',
    name: '极速冲刺',
    type: 'timed',
    difficulty: 2,
    timeLimit: 60,
    background: '#FFD700',
    obstacleFrequency: 0.35,
    oreFrequency: 0.7,
    speedMultiplier: 1.4,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'timed-2',
    name: '黄金60秒',
    type: 'timed',
    difficulty: 3,
    timeLimit: 60,
    background: '#FF8C00',
    obstacleFrequency: 0.45,
    oreFrequency: 0.65,
    speedMultiplier: 1.5,
    unlocked: false,
    highScore: 0,
  },
  {
    id: 'timed-3',
    name: '极限挑战',
    type: 'timed',
    difficulty: 5,
    timeLimit: 90,
    background: '#DC143C',
    obstacleFrequency: 0.6,
    oreFrequency: 0.5,
    speedMultiplier: 1.7,
    unlocked: false,
    highScore: 0,
  },
];

export const getNormalLevels = (): Level[] =>
  levels.filter((level) => level.type === 'normal');

export const getTimedLevels = (): Level[] =>
  levels.filter((level) => level.type === 'timed');

export const getLevelById = (id: string): Level | undefined =>
  levels.find((level) => level.id === id);
