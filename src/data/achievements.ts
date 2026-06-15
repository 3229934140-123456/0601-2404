export type AchievementCategory = 'collection' | 'score' | 'distance' | 'special';

export interface AchievementCondition {
  type: 'collectOre' | 'collectGoldOre' | 'singleScore' | 'totalScore' | 'singleDistance' | 'totalDistance' | 'clearLevels' | 'useItems' | 'noDamage' | 'purchaseMinecart' | 'firstPlay';
  target: number;
  current: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  category: AchievementCategory;
  condition: AchievementCondition;
}

export const achievements: Achievement[] = [
  {
    id: 'achievement-1',
    name: '初级矿工',
    description: '累计收集100个矿石',
    icon: 'Pickaxe',
    reward: 100,
    unlocked: false,
    category: 'collection',
    condition: {
      type: 'collectOre',
      target: 100,
      current: 0,
    },
  },
  {
    id: 'achievement-2',
    name: '中级矿工',
    description: '累计收集500个矿石',
    icon: 'Pickaxe',
    reward: 300,
    unlocked: false,
    category: 'collection',
    condition: {
      type: 'collectOre',
      target: 500,
      current: 0,
    },
  },
  {
    id: 'achievement-3',
    name: '高级矿工',
    description: '累计收集1000个矿石',
    icon: 'Pickaxe',
    reward: 500,
    unlocked: false,
    category: 'collection',
    condition: {
      type: 'collectOre',
      target: 1000,
      current: 0,
    },
  },
  {
    id: 'achievement-4',
    name: '黄金收藏家',
    description: '累计收集100个黄金矿石',
    icon: 'Gem',
    reward: 800,
    unlocked: false,
    category: 'collection',
    condition: {
      type: 'collectGoldOre',
      target: 100,
      current: 0,
    },
  },
  {
    id: 'achievement-5',
    name: '初露锋芒',
    description: '单局得分达到1000分',
    icon: 'Trophy',
    reward: 150,
    unlocked: false,
    category: 'score',
    condition: {
      type: 'singleScore',
      target: 1000,
      current: 0,
    },
  },
  {
    id: 'achievement-6',
    name: '小有名气',
    description: '单局得分达到5000分',
    icon: 'Trophy',
    reward: 400,
    unlocked: false,
    category: 'score',
    condition: {
      type: 'singleScore',
      target: 5000,
      current: 0,
    },
  },
  {
    id: 'achievement-7',
    name: '声名远扬',
    description: '单局得分达到10000分',
    icon: 'Trophy',
    reward: 700,
    unlocked: false,
    category: 'score',
    condition: {
      type: 'singleScore',
      target: 10000,
      current: 0,
    },
  },
  {
    id: 'achievement-8',
    name: '传奇矿工',
    description: '单局得分达到50000分',
    icon: 'Crown',
    reward: 2000,
    unlocked: false,
    category: 'score',
    condition: {
      type: 'singleScore',
      target: 50000,
      current: 0,
    },
  },
  {
    id: 'achievement-9',
    name: '初次探险',
    description: '累计行驶1000米',
    icon: 'MapPin',
    reward: 200,
    unlocked: false,
    category: 'distance',
    condition: {
      type: 'totalDistance',
      target: 1000,
      current: 0,
    },
  },
  {
    id: 'achievement-10',
    name: '资深探险',
    description: '累计行驶5000米',
    icon: 'Map',
    reward: 500,
    unlocked: false,
    category: 'distance',
    condition: {
      type: 'totalDistance',
      target: 5000,
      current: 0,
    },
  },
  {
    id: 'achievement-11',
    name: '传奇探险',
    description: '累计行驶10000米',
    icon: 'Compass',
    reward: 1000,
    unlocked: false,
    category: 'distance',
    condition: {
      type: 'totalDistance',
      target: 10000,
      current: 0,
    },
  },
  {
    id: 'achievement-12',
    name: '完美通关',
    description: '通关所有普通关卡',
    icon: 'Award',
    reward: 1500,
    unlocked: false,
    category: 'special',
    condition: {
      type: 'clearLevels',
      target: 5,
      current: 0,
    },
  },
  {
    id: 'achievement-16',
    name: '入门矿工',
    description: '完成第一局游戏',
    icon: 'Pickaxe',
    reward: 50,
    unlocked: false,
    category: 'special',
    condition: {
      type: 'firstPlay',
      target: 1,
      current: 0,
    },
  },
  {
    id: 'achievement-13',
    name: '速度之王',
    description: '单局行驶距离超过2000米',
    icon: 'Gauge',
    reward: 600,
    unlocked: false,
    category: 'special',
    condition: {
      type: 'singleDistance',
      target: 2000,
      current: 0,
    },
  },
  {
    id: 'achievement-14',
    name: '道具达人',
    description: '单局使用5个道具',
    icon: 'Sparkles',
    reward: 400,
    unlocked: false,
    category: 'special',
    condition: {
      type: 'useItems',
      target: 5,
      current: 0,
    },
  },
  {
    id: 'achievement-15',
    name: '不死之身',
    description: '单局不受到任何伤害完成游戏',
    icon: 'ShieldCheck',
    reward: 1200,
    unlocked: false,
    category: 'special',
    condition: {
      type: 'noDamage',
      target: 1,
      current: 0,
    },
  },
];

export const getAchievementsByCategory = (
  category: AchievementCategory
): Achievement[] =>
  achievements.filter((a) => a.category === category);

export const getUnlockedAchievements = (): Achievement[] =>
  achievements.filter((a) => a.unlocked);

export const getLockedAchievements = (): Achievement[] =>
  achievements.filter((a) => !a.unlocked);

export const getAchievementById = (id: string): Achievement | undefined =>
  achievements.find((a) => a.id === id);
