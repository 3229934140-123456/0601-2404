import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../utils/storage';

export interface MineCart {
  id: string;
  name: string;
  description: string;
  price: number;
  speed: number;
  capacity: number;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  reward: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  price: number;
}

export interface GameRecord {
  id: string;
  date: number;
  score: number;
  distance: number;
  coins: number;
  oreCount: number;
  mineCartId: string;
}

interface PlayerState {
  coins: number;
  totalScore: number;
  mineCarts: MineCart[];
  currentMineCartId: string;
  achievements: Achievement[];
  inventory: Item[];
  gameRecords: GameRecord[];
}

interface PlayerActions {
  buyItem: (itemId: string, price: number) => boolean;
  unlockMineCart: (mineCartId: string) => boolean;
  selectMineCart: (mineCartId: string) => void;
  completeAchievement: (achievementId: string) => boolean;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addScore: (amount: number) => void;
  updateInventory: (itemId: string, delta: number) => void;
  addGameRecord: (record: Omit<GameRecord, 'id' | 'date'>) => void;
  resetPlayer: () => void;
}

const INITIAL_MINECARTS: MineCart[] = [
  {
    id: 'basic',
    name: '基础矿车',
    description: '普通的矿车，性能一般',
    price: 0,
    speed: 1,
    capacity: 10,
    unlocked: true,
  },
  {
    id: 'fast',
    name: '疾速矿车',
    description: '速度更快的矿车',
    price: 500,
    speed: 1.5,
    capacity: 8,
    unlocked: false,
  },
  {
    id: 'heavy',
    name: '重型矿车',
    description: '容量更大的矿车',
    price: 800,
    speed: 0.8,
    capacity: 20,
    unlocked: false,
  },
  {
    id: 'golden',
    name: '黄金矿车',
    description: '传说中的黄金矿车，全能型',
    price: 2000,
    speed: 1.3,
    capacity: 15,
    unlocked: false,
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_play',
    name: '初次冒险',
    description: '完成第一局游戏',
    icon: '🎮',
    unlocked: false,
    reward: 50,
  },
  {
    id: 'coin_collector',
    name: '金币收藏家',
    description: '累计收集1000金币',
    icon: '💰',
    unlocked: false,
    reward: 100,
  },
  {
    id: 'distance_master',
    name: '距离大师',
    description: '单局行驶1000米',
    icon: '🏃',
    unlocked: false,
    reward: 150,
  },
  {
    id: 'ore_hunter',
    name: '矿石猎人',
    description: '单局收集50个矿石',
    icon: '💎',
    unlocked: false,
    reward: 200,
  },
  {
    id: 'shopping_spree',
    name: '购物狂',
    description: '购买第一个道具',
    icon: '🛒',
    unlocked: false,
    reward: 30,
  },
];

const INITIAL_ITEMS: Item[] = [
  {
    id: 'shield',
    name: '护盾',
    description: '抵挡一次伤害',
    icon: '🛡️',
    count: 0,
    price: 100,
  },
  {
    id: 'magnet',
    name: '磁铁',
    description: '自动吸引附近的金币和矿石',
    icon: '🧲',
    count: 0,
    price: 150,
  },
  {
    id: 'double_coins',
    name: '双倍金币',
    description: '一段时间内金币收益翻倍',
    icon: '✨',
    count: 0,
    price: 200,
  },
];

const getInitialState = (): PlayerState => ({
  coins: 100,
  totalScore: 0,
  mineCarts: INITIAL_MINECARTS,
  currentMineCartId: 'basic',
  achievements: INITIAL_ACHIEVEMENTS,
  inventory: INITIAL_ITEMS,
  gameRecords: [],
});

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      buyItem: (itemId: string, price: number) => {
        const { coins, inventory } = get();
        if (coins < price) return false;

        const item = inventory.find(i => i.id === itemId);
        if (!item) return false;

        set({
          coins: coins - price,
          inventory: inventory.map(i =>
            i.id === itemId ? { ...i, count: i.count + 1 } : i
          ),
        });

        const shoppingAchievement = get().achievements.find(a => a.id === 'shopping_spree');
        if (shoppingAchievement && !shoppingAchievement.unlocked) {
          get().completeAchievement('shopping_spree');
        }

        return true;
      },

      unlockMineCart: (mineCartId: string) => {
        const { coins, mineCarts } = get();
        const mineCart = mineCarts.find(m => m.id === mineCartId);
        
        if (!mineCart || mineCart.unlocked || coins < mineCart.price) {
          return false;
        }

        set({
          coins: coins - mineCart.price,
          mineCarts: mineCarts.map(m =>
            m.id === mineCartId ? { ...m, unlocked: true } : m
          ),
        });
        return true;
      },

      selectMineCart: (mineCartId: string) => {
        const { mineCarts } = get();
        const mineCart = mineCarts.find(m => m.id === mineCartId);
        if (mineCart && mineCart.unlocked) {
          set({ currentMineCartId: mineCartId });
        }
      },

      completeAchievement: (achievementId: string) => {
        const { achievements, coins } = get();
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (!achievement || achievement.unlocked) return false;

        set({
          coins: coins + achievement.reward,
          achievements: achievements.map(a =>
            a.id === achievementId
              ? { ...a, unlocked: true, unlockedAt: Date.now() }
              : a
          ),
        });
        return true;
      },

      addCoins: (amount: number) => {
        const { coins, totalScore, achievements } = get();
        const newCoins = coins + amount;
        set({ coins: newCoins, totalScore: totalScore + amount });

        const coinAchievement = achievements.find(a => a.id === 'coin_collector');
        if (coinAchievement && !coinAchievement.unlocked && newCoins >= 1000) {
          get().completeAchievement('coin_collector');
        }
      },

      spendCoins: (amount: number) => {
        const { coins } = get();
        if (coins < amount) return false;
        set({ coins: coins - amount });
        return true;
      },

      addScore: (amount: number) => {
        set({ totalScore: get().totalScore + amount });
      },

      updateInventory: (itemId: string, delta: number) => {
        const { inventory } = get();
        set({
          inventory: inventory.map(i =>
            i.id === itemId ? { ...i, count: Math.max(0, i.count + delta) } : i
          ),
        });
      },

      addGameRecord: (record: Omit<GameRecord, 'id' | 'date'>) => {
        const { gameRecords } = get();
        const newRecord: GameRecord = {
          ...record,
          id: `record_${Date.now()}`,
          date: Date.now(),
        };
        set({ gameRecords: [newRecord, ...gameRecords].slice(0, 50) });

        const firstPlayAchievement = get().achievements.find(a => a.id === 'first_play');
        if (firstPlayAchievement && !firstPlayAchievement.unlocked) {
          get().completeAchievement('first_play');
        }

        if (record.distance >= 1000) {
          const distanceAchievement = get().achievements.find(a => a.id === 'distance_master');
          if (distanceAchievement && !distanceAchievement.unlocked) {
            get().completeAchievement('distance_master');
          }
        }

        if (record.oreCount >= 50) {
          const oreAchievement = get().achievements.find(a => a.id === 'ore_hunter');
          if (oreAchievement && !oreAchievement.unlocked) {
            get().completeAchievement('ore_hunter');
          }
        }
      },

      resetPlayer: () => {
        set(getInitialState());
      },
    }),
    {
      name: 'player-storage',
      storage: storage,
    }
  )
);
