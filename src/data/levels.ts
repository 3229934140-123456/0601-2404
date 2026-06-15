export type LevelType = 'normal' | 'timed';

export interface LevelUnlockCondition {
  type: 'score' | 'distance' | 'completeLevel';
  target: string | number;
  value: number;
  description: string;
}

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
  unlockCondition?: LevelUnlockCondition;
}

export const levels: Level[] = [
  {
    id: 'level-1',
    name: '新手矿洞',
    type: 'normal',
    difficulty: 1,
    background: '#8B4513',
    obstacleFrequency: 0.3,
    oreFrequency: 0.7,
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
    oreFrequency: 0.6,
    speedMultiplier: 1.1,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'score',
      target: 'level-1',
      value: 2000,
      description: '在"新手矿洞"获得2000分',
    },
  },
  {
    id: 'level-3',
    name: '水晶矿脉',
    type: 'normal',
    difficulty: 3,
    background: '#2C3E50',
    obstacleFrequency: 0.5,
    oreFrequency: 0.55,
    speedMultiplier: 1.2,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'score',
      target: 'level-2',
      value: 5000,
      description: '在"幽暗隧道"获得5000分',
    },
  },
  {
    id: 'level-4',
    name: '熔岩深渊',
    type: 'normal',
    difficulty: 4,
    background: '#8B0000',
    obstacleFrequency: 0.6,
    oreFrequency: 0.5,
    speedMultiplier: 1.35,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'score',
      target: 'level-3',
      value: 10000,
      description: '在"水晶矿脉"获得10000分',
    },
  },
  {
    id: 'level-5',
    name: '远古遗迹',
    type: 'normal',
    difficulty: 5,
    background: '#1A1A2E',
    obstacleFrequency: 0.7,
    oreFrequency: 0.45,
    speedMultiplier: 1.5,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'score',
      target: 'level-4',
      value: 20000,
      description: '在"熔岩深渊"获得20000分',
    },
  },
  {
    id: 'timed-1',
    name: '极速冲刺',
    type: 'timed',
    difficulty: 2,
    timeLimit: 60,
    background: '#FFD700',
    obstacleFrequency: 0.35,
    oreFrequency: 0.75,
    speedMultiplier: 1.4,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'completeLevel',
      target: 'level-2',
      value: 1,
      description: '通关"幽暗隧道"',
    },
  },
  {
    id: 'timed-2',
    name: '黄金60秒',
    type: 'timed',
    difficulty: 3,
    timeLimit: 60,
    background: '#FF8C00',
    obstacleFrequency: 0.45,
    oreFrequency: 0.7,
    speedMultiplier: 1.5,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'completeLevel',
      target: 'level-3',
      value: 1,
      description: '通关"水晶矿脉"',
    },
  },
  {
    id: 'timed-3',
    name: '极限挑战',
    type: 'timed',
    difficulty: 5,
    timeLimit: 90,
    background: '#DC143C',
    obstacleFrequency: 0.6,
    oreFrequency: 0.6,
    speedMultiplier: 1.7,
    unlocked: false,
    highScore: 0,
    unlockCondition: {
      type: 'completeLevel',
      target: 'level-4',
      value: 1,
      description: '通关"熔岩深渊"',
    },
  },
];

export function getLevelsWithUnlockState(
  unlockedLevels: string[],
  highScores: Record<string, number> = {}
): Level[] {
  return levels.map((level) => ({
    ...level,
    unlocked: unlockedLevels.includes(level.id),
    highScore: highScores[level.id] || level.highScore,
  }));
}

export function checkLevelUnlock(
  levelId: string,
  currentHighScores: Record<string, number>,
  completedLevels: string[]
): { canUnlock: boolean; level: Level | undefined } {
  const level = levels.find((l) => l.id === levelId);
  if (!level || !level.unlockCondition) {
    return { canUnlock: false, level };
  }

  const condition = level.unlockCondition;
  let canUnlock = false;

  switch (condition.type) {
    case 'score':
      canUnlock =
        (currentHighScores[condition.target as string] || 0) >= condition.value;
      break;
    case 'distance':
      canUnlock = false;
      break;
    case 'completeLevel':
      canUnlock = completedLevels.includes(condition.target as string);
      break;
  }

  return { canUnlock, level };
}

export const getNormalLevels = (): Level[] =>
  levels.filter((level) => level.type === 'normal');

export const getTimedLevels = (): Level[] =>
  levels.filter((level) => level.type === 'timed');

export const getLevelById = (id: string): Level | undefined =>
  levels.find((level) => level.id === id);

export const getLevelUnlockDescription = (level: Level): string => {
  if (level.unlocked) return '已解锁';
  if (!level.unlockCondition) return '初始关卡';
  return level.unlockCondition.description;
};
