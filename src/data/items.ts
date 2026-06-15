export type ItemType = 'shield' | 'magnet' | 'doubleScore' | 'speedBoost' | 'revive' | 'extraLife';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  effectDuration: number;
  icon: string;
}

export const items: Item[] = [
  {
    id: 'item-shield',
    name: '护盾',
    type: 'shield',
    description: '激活后在持续时间内免疫一次障碍物碰撞伤害。',
    price: 200,
    effectDuration: 10,
    icon: 'Shield',
  },
  {
    id: 'item-magnet',
    name: '磁铁',
    type: 'magnet',
    description: '激活后在持续时间内自动吸附附近的矿石。',
    price: 300,
    effectDuration: 15,
    icon: 'Magnet',
  },
  {
    id: 'item-double-score',
    name: '双倍分数',
    type: 'doubleScore',
    description: '激活后在持续时间内获得的所有分数翻倍。',
    price: 400,
    effectDuration: 20,
    icon: 'Zap',
  },
  {
    id: 'item-speed-boost',
    name: '加速',
    type: 'speedBoost',
    description: '激活后在持续时间内矿车速度大幅提升。',
    price: 250,
    effectDuration: 8,
    icon: 'Gauge',
  },
  {
    id: 'item-revive',
    name: '复活',
    type: 'revive',
    description: '游戏结束后可使用，立即复活并恢复50%生命值，无时间限制。',
    price: 500,
    effectDuration: 0,
    icon: 'RefreshCw',
  },
  {
    id: 'item-extra-life',
    name: '额外生命',
    type: 'extraLife',
    description: '立即增加一条额外生命，无时间限制。',
    price: 600,
    effectDuration: 0,
    icon: 'Heart',
  },
];

export const getItemById = (id: string): Item | undefined =>
  items.find((item) => item.id === id);

export const getItemByType = (type: ItemType): Item | undefined =>
  items.find((item) => item.type === type);

export const getTimedItems = (): Item[] =>
  items.filter((item) => item.effectDuration > 0);

export const getInstantItems = (): Item[] =>
  items.filter((item) => item.effectDuration === 0);
