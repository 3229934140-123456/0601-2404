export interface Minecart {
  id: string;
  name: string;
  color: string;
  speed: number;
  health: number;
  price: number;
  unlocked: boolean;
  description: string;
}

export const minecarts: Minecart[] = [
  {
    id: 'minecart-1',
    name: '木质矿车',
    color: '#8B4513',
    speed: 1.0,
    health: 100,
    price: 0,
    unlocked: true,
    description: '入门级矿车，性能均衡，适合新手使用。',
  },
  {
    id: 'minecart-2',
    name: '铁皮矿车',
    color: '#708090',
    speed: 1.1,
    health: 130,
    price: 500,
    unlocked: false,
    description: '铁皮加固的矿车，提升了耐久度和速度。',
  },
  {
    id: 'minecart-3',
    name: '黄金矿车',
    color: '#FFD700',
    speed: 1.2,
    health: 120,
    price: 1500,
    unlocked: false,
    description: '纯金打造的矿车，收集矿石时获得额外分数加成。',
  },
  {
    id: 'minecart-4',
    name: '钻石矿车',
    color: '#00CED1',
    speed: 1.3,
    health: 150,
    price: 3000,
    unlocked: false,
    description: '钻石镶嵌的高级矿车，各项性能全面提升。',
  },
  {
    id: 'minecart-5',
    name: '熔岩矿车',
    color: '#FF4500',
    speed: 1.5,
    health: 140,
    price: 6000,
    unlocked: false,
    description: '采用熔岩核心驱动，速度极快，适合挑战高分。',
  },
  {
    id: 'minecart-6',
    name: '幽灵矿车',
    color: '#9370DB',
    speed: 1.4,
    health: 180,
    price: 10000,
    unlocked: false,
    description: '传说中的神秘矿车，拥有最高的生命值和优秀的速度。',
  },
];

export const getUnlockedMinecarts = (): Minecart[] =>
  minecarts.filter((cart) => cart.unlocked);

export const getLockedMinecarts = (): Minecart[] =>
  minecarts.filter((cart) => !cart.unlocked);

export const getMinecartById = (id: string): Minecart | undefined =>
  minecarts.find((cart) => cart.id === id);
