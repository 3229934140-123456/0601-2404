import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { achievements as achievementTemplates, type Achievement as AchievementTemplate, type AchievementCondition } from '../data/achievements';

export interface GameStats {
  score: number;
  distance: number;
  oreCount: number;
  goldOreCount?: number;
  itemsUsed: number;
  levelsCompleted: number;
  noDamage: boolean;
  minecartId: string;
}

export interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  reward: number;
}

export interface UseAchievementCheckResult {
  checkAchievements: (stats: Partial<GameStats>) => UnlockedAchievement[];
  checkAllAchievements: () => UnlockedAchievement[];
}

type AchievementConditionType = AchievementCondition['type'];

function getCurrentProgress(
  conditionType: AchievementConditionType,
  gameRecords: Array<{ score: number; distance: number; oreCount: number; coins: number }>,
  stats?: Partial<GameStats>
): number {
  const totalScore = gameRecords.reduce((sum, r) => sum + r.score, 0) + (stats?.score || 0);
  const totalDistance = gameRecords.reduce((sum, r) => sum + r.distance, 0) + (stats?.distance || 0);
  const totalOres = gameRecords.reduce((sum, r) => sum + r.oreCount, 0) + (stats?.oreCount || 0);

  switch (conditionType) {
    case 'collectOre':
      return totalOres;
    case 'collectGoldOre':
      return stats?.goldOreCount || 0;
    case 'singleScore':
      return Math.max(...gameRecords.map(r => r.score), stats?.score || 0, 0);
    case 'totalScore':
      return totalScore;
    case 'singleDistance':
      return Math.max(...gameRecords.map(r => r.distance), stats?.distance || 0, 0);
    case 'totalDistance':
      return totalDistance;
    case 'clearLevels':
      return gameRecords.length + (stats?.levelsCompleted || 0);
    case 'useItems':
      return stats?.itemsUsed || 0;
    case 'noDamage':
      return stats?.noDamage ? 1 : 0;
    case 'purchaseMinecart':
      return 0;
    default:
      return 0;
  }
}

export function useAchievementCheck(): UseAchievementCheckResult {
  const gameRecords = usePlayerStore((state) => state.gameRecords);
  const unlockedAchievements = usePlayerStore((state) => state.achievements);
  const completeAchievement = usePlayerStore((state) => state.completeAchievement);
  const addCoins = usePlayerStore((state) => state.addCoins);

  const checkedRef = useRef<Set<string>>(new Set());

  const checkAchievements = useCallback(
    (stats: Partial<GameStats>): UnlockedAchievement[] => {
      const newlyUnlocked: UnlockedAchievement[] = [];

      achievementTemplates.forEach((template) => {
        const existing = unlockedAchievements.find((a) => a.id === template.id);
        if (existing?.unlocked || checkedRef.current.has(template.id)) {
          return;
        }

        const currentProgress = getCurrentProgress(
          template.condition.type,
          gameRecords,
          stats
        );

        if (currentProgress >= template.condition.target) {
          const success = completeAchievement(template.id);
          if (success) {
            addCoins(template.reward);
            checkedRef.current.add(template.id);
            newlyUnlocked.push({
              id: template.id,
              name: template.name,
              description: template.description,
              reward: template.reward,
            });
          }
        }
      });

      return newlyUnlocked;
    },
    [gameRecords, unlockedAchievements, completeAchievement, addCoins]
  );

  const checkAllAchievements = useCallback((): UnlockedAchievement[] => {
    const newlyUnlocked: UnlockedAchievement[] = [];

    achievementTemplates.forEach((template) => {
      const existing = unlockedAchievements.find((a) => a.id === template.id);
      if (existing?.unlocked || checkedRef.current.has(template.id)) {
        return;
      }

      const currentProgress = getCurrentProgress(
        template.condition.type,
        gameRecords
      );

      if (currentProgress >= template.condition.target) {
        const success = completeAchievement(template.id);
        if (success) {
          addCoins(template.reward);
          checkedRef.current.add(template.id);
          newlyUnlocked.push({
            id: template.id,
            name: template.name,
            description: template.description,
            reward: template.reward,
          });
        }
      }
    });

    return newlyUnlocked;
  }, [gameRecords, unlockedAchievements, completeAchievement, addCoins]);

  useEffect(() => {
    return () => {
      checkedRef.current.clear();
    };
  }, []);

  return {
    checkAchievements,
    checkAllAchievements,
  };
}
