import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { minecarts as minecartData, type Minecart } from '../data/minecarts';
import { items as itemData, type Item } from '../data/items';
import { achievements as achievementData, type Achievement } from '../data/achievements';

export interface GameRecord {
  id: string;
  date: number;
  score: number;
  distance: number;
  coins: number;
  oreCount: number;
  goldOreCount: number;
  mineCartId: string;
  levelId: string;
  levelType: 'normal' | 'timed';
  itemsUsed: number;
  damageTaken: number;
  timeElapsed?: number;
  timeLimit?: number;
}

interface PlayerStats {
  totalOreCollected: number;
  totalGoldOreCollected: number;
  totalDistance: number;
  totalScore: number;
  itemsPurchased: number;
  minecartsPurchased: number;
  levelsCompleted: string[];
}

interface PlayerState {
  coins: number;
  mineCarts: Minecart[];
  currentMineCartId: string;
  achievements: Achievement[];
  inventory: Array<{
    id: string;
    itemId: string;
    count: number;
  }>;
  gameRecords: GameRecord[];
  stats: PlayerStats;
  unlockedLevels: string[];
}

interface PlayerActions {
  buyItem: (itemId: string, price: number) => boolean;
  unlockMineCart: (mineCartId: string) => boolean;
  selectMineCart: (mineCartId: string) => void;
  completeAchievement: (achievementId: string) => Achievement | null;
  checkAndUnlockAchievements: (sessionStats: {
    score: number;
    distance: number;
    oreCount: number;
    goldOreCount: number;
    itemsUsed: number;
    damageTaken: number;
    levelId: string;
    levelType: 'normal' | 'timed';
  }) => Achievement[];
  unlockLevel: (levelId: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addScore: (amount: number) => void;
  updateInventory: (itemId: string, delta: number) => boolean;
  getInventoryCount: (itemId: string) => number;
  addGameRecord: (record: Omit<GameRecord, 'id' | 'date'>) => void;
  resetPlayer: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

const getInitialMineCarts = (): Minecart[] =>
  minecartData.map((m) => ({
    ...m,
    unlocked: m.id === 'minecart-1',
  }));

const getInitialAchievements = (): Achievement[] =>
  achievementData.map((a) => ({
    ...a,
    unlocked: false,
    condition: { ...a.condition, current: 0 },
  }));

const getInitialInventory = () =>
  itemData.map((item) => ({
    id: `inv-${item.id}`,
    itemId: item.id,
    count: 0,
  }));

const getInitialStats = (): PlayerStats => ({
  totalOreCollected: 0,
  totalGoldOreCollected: 0,
  totalDistance: 0,
  totalScore: 0,
  itemsPurchased: 0,
  minecartsPurchased: 0,
  levelsCompleted: [],
});

const getInitialState = (): PlayerState => ({
  coins: 500,
  mineCarts: getInitialMineCarts(),
  currentMineCartId: 'minecart-1',
  achievements: getInitialAchievements(),
  inventory: getInitialInventory(),
  gameRecords: [],
  stats: getInitialStats(),
  unlockedLevels: ['level-1'],
});

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      buyItem: (itemId: string, price: number) => {
        const { coins, inventory } = get();
        if (coins < price) return false;

        const itemExists = inventory.find((i) => i.itemId === itemId);
        if (!itemExists) return false;

        set({
          coins: coins - price,
          inventory: inventory.map((i) =>
            i.itemId === itemId ? { ...i, count: i.count + 1 } : i
          ),
          stats: {
            ...get().stats,
            itemsPurchased: get().stats.itemsPurchased + 1,
          },
        });

        const { checkAndUnlockAchievements } = get();
        checkAndUnlockAchievements({
          score: 0,
          distance: 0,
          oreCount: 0,
          goldOreCount: 0,
          itemsUsed: 0,
          damageTaken: 0,
          levelId: '',
          levelType: 'normal',
        });

        return true;
      },

      unlockMineCart: (mineCartId: string) => {
        const { coins, mineCarts, stats } = get();
        const mineCart = mineCarts.find((m) => m.id === mineCartId);

        if (!mineCart || mineCart.unlocked || coins < mineCart.price) {
          return false;
        }

        set({
          coins: coins - mineCart.price,
          mineCarts: mineCarts.map((m) =>
            m.id === mineCartId ? { ...m, unlocked: true } : m
          ),
          stats: {
            ...stats,
            minecartsPurchased: stats.minecartsPurchased + 1,
          },
        });

        get().checkAndUnlockAchievements({
          score: 0,
          distance: 0,
          oreCount: 0,
          goldOreCount: 0,
          itemsUsed: 0,
          damageTaken: 0,
          levelId: '',
          levelType: 'normal',
        });

        return true;
      },

      selectMineCart: (mineCartId: string) => {
        const { mineCarts } = get();
        const mineCart = mineCarts.find((m) => m.id === mineCartId);
        if (mineCart && mineCart.unlocked) {
          set({ currentMineCartId: mineCartId });
        }
      },

      completeAchievement: (achievementId: string) => {
        const { achievements, coins } = get();
        const achievement = achievements.find((a) => a.id === achievementId);

        if (!achievement || achievement.unlocked) return null;

        const updatedAchievement: Achievement = {
          ...achievement,
          unlocked: true,
          condition: {
            ...achievement.condition,
            current: achievement.condition.target,
          },
        };

        set({
          coins: coins + achievement.reward,
          achievements: achievements.map((a) =>
            a.id === achievementId ? updatedAchievement : a
          ),
        });

        return updatedAchievement;
      },

      checkAndUnlockAchievements: (sessionStats) => {
        const { achievements, stats } = get();
        const newlyUnlocked: Achievement[] = [];

        const updatedStats: PlayerStats = {
          totalOreCollected: stats.totalOreCollected + sessionStats.oreCount,
          totalGoldOreCollected:
            stats.totalGoldOreCollected + sessionStats.goldOreCount,
          totalDistance: stats.totalDistance + sessionStats.distance,
          totalScore: stats.totalScore + sessionStats.score,
          itemsPurchased: stats.itemsPurchased,
          minecartsPurchased: stats.minecartsPurchased,
          levelsCompleted: sessionStats.levelId
            ? Array.from(new Set([...stats.levelsCompleted, sessionStats.levelId]))
            : stats.levelsCompleted,
        };

        const updatedAchievements = achievements.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let currentProgress = achievement.condition.current;

          switch (achievement.condition.type) {
            case 'collectOre':
              currentProgress = updatedStats.totalOreCollected;
              break;
            case 'collectGoldOre':
              currentProgress = updatedStats.totalGoldOreCollected;
              break;
            case 'singleScore':
              currentProgress = Math.max(currentProgress, sessionStats.score);
              break;
            case 'totalScore':
              currentProgress = updatedStats.totalScore;
              break;
            case 'singleDistance':
              currentProgress = Math.max(currentProgress, sessionStats.distance);
              break;
            case 'totalDistance':
              currentProgress = Math.floor(updatedStats.totalDistance);
              break;
            case 'clearLevels':
              currentProgress = updatedStats.levelsCompleted.filter(
                (id) => id.startsWith('level-')
              ).length;
              break;
            case 'useItems':
              currentProgress = Math.max(currentProgress, sessionStats.itemsUsed);
              break;
            case 'noDamage':
              if (
                sessionStats.damageTaken === 0 &&
                sessionStats.score > 0
              ) {
                currentProgress = 1;
              }
              break;
            case 'purchaseMinecart':
              currentProgress = updatedStats.minecartsPurchased;
              break;
          }

          const shouldUnlock =
            currentProgress >= achievement.condition.target;

          if (shouldUnlock && !achievement.unlocked) {
            const unlockedAch = {
              ...achievement,
              unlocked: true,
              condition: {
                ...achievement.condition,
                current: achievement.condition.target,
              },
            };
            newlyUnlocked.push(unlockedAch);
            return unlockedAch;
          }

          return {
            ...achievement,
            condition: {
              ...achievement.condition,
              current: Math.min(currentProgress, achievement.condition.target),
            },
          };
        });

        const rewardCoins = newlyUnlocked.reduce(
          (sum, a) => sum + a.reward,
          0
        );

        set({
          achievements: updatedAchievements,
          stats: updatedStats,
          coins: get().coins + rewardCoins,
        });

        return newlyUnlocked;
      },

      unlockLevel: (levelId: string) => {
        const { unlockedLevels } = get();
        if (!unlockedLevels.includes(levelId)) {
          set({ unlockedLevels: [...unlockedLevels, levelId] });
        }
      },

      addCoins: (amount: number) => {
        set({ coins: get().coins + amount });
      },

      spendCoins: (amount: number) => {
        const { coins } = get();
        if (coins < amount) return false;
        set({ coins: coins - amount });
        return true;
      },

      addScore: (amount: number) => {
        set({
          stats: {
            ...get().stats,
            totalScore: get().stats.totalScore + amount,
          },
        });
      },

      updateInventory: (itemId: string, delta: number) => {
        const { inventory } = get();
        const item = inventory.find((i) => i.itemId === itemId);
        if (!item) return false;
        if (delta < 0 && item.count < Math.abs(delta)) return false;

        set({
          inventory: inventory.map((i) =>
            i.itemId === itemId
              ? { ...i, count: Math.max(0, i.count + delta) }
              : i
          ),
        });
        return true;
      },

      getInventoryCount: (itemId: string) => {
        const { inventory } = get();
        const item = inventory.find((i) => i.itemId === itemId);
        return item?.count || 0;
      },

      addGameRecord: (record) => {
        const { gameRecords } = get();
        const newRecord: GameRecord = {
          ...record,
          id: `record_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: Date.now(),
        };
        set({ gameRecords: [newRecord, ...gameRecords].slice(0, 100) });
      },

      resetPlayer: () => {
        set(getInitialState());
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          coins: state.coins,
          mineCarts: state.mineCarts,
          currentMineCartId: state.currentMineCartId,
          achievements: state.achievements,
          inventory: state.inventory,
          gameRecords: state.gameRecords,
          stats: state.stats,
          unlockedLevels: state.unlockedLevels,
          exportDate: Date.now(),
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (dataString: string) => {
        try {
          const parsed = JSON.parse(dataString);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'coins' in parsed
          ) {
            const state = get();
            set({
              coins: parsed.coins ?? state.coins,
              mineCarts: parsed.mineCarts ?? state.mineCarts,
              currentMineCartId:
                parsed.currentMineCartId ?? state.currentMineCartId,
              achievements: parsed.achievements ?? state.achievements,
              inventory: parsed.inventory ?? state.inventory,
              gameRecords: parsed.gameRecords ?? state.gameRecords,
              stats: parsed.stats ?? state.stats,
              unlockedLevels: parsed.unlockedLevels ?? state.unlockedLevels,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'player-storage-v2',
      storage: storage,
      partialize: (state) => ({
        coins: state.coins,
        mineCarts: state.mineCarts,
        currentMineCartId: state.currentMineCartId,
        achievements: state.achievements,
        inventory: state.inventory,
        gameRecords: state.gameRecords,
        stats: state.stats,
        unlockedLevels: state.unlockedLevels,
      }),
    }
  )
);
