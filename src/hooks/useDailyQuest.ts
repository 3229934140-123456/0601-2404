import { useCallback, useEffect, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import {
  generateDailyQuests,
  updateQuestProgress as updateQuestProgressUtil,
  type DailyQuest,
  type QuestType,
} from '../data/dailyQuests';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'daily-quests';
const QUEST_COUNT = 3;

export interface QuestUpdateData {
  type: QuestType;
  amount: number;
}

export interface UseDailyQuestResult {
  quests: DailyQuest[];
  refreshQuests: () => void;
  updateProgress: (data: QuestUpdateData) => void;
  claimReward: (questId: string) => number | null;
  canClaim: (questId: string) => boolean;
  allCompleted: boolean;
  allClaimed: boolean;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function useDailyQuest(): UseDailyQuestResult {
  const addCoins = usePlayerStore((state) => state.addCoins);

  const { value: storedData, setValue: setStoredData } = useLocalStorage<{
    date: string;
    quests: DailyQuest[];
  }>(STORAGE_KEY, () => ({
    date: getTodayString(),
    quests: generateDailyQuests(QUEST_COUNT),
  }));

  const [quests, setQuests] = useState<DailyQuest[]>(storedData.quests);

  useEffect(() => {
    if (!isToday(storedData.date)) {
      const newQuests = generateDailyQuests(QUEST_COUNT);
      setStoredData({
        date: getTodayString(),
        quests: newQuests,
      });
      setQuests(newQuests);
    } else {
      setQuests(storedData.quests);
    }
  }, [storedData, setStoredData]);

  const refreshQuests = useCallback(() => {
    const newQuests = generateDailyQuests(QUEST_COUNT);
    setStoredData({
      date: getTodayString(),
      quests: newQuests,
    });
    setQuests(newQuests);
  }, [setStoredData]);

  const updateProgress = useCallback(
    (data: QuestUpdateData) => {
      setQuests((prevQuests) => {
        const updatedQuests = prevQuests.map((quest) => {
          if (quest.type === data.type && !quest.completed && !quest.claimed) {
            return updateQuestProgressUtil(quest, data.amount);
          }
          return quest;
        });

        setStoredData({
          date: getTodayString(),
          quests: updatedQuests,
        });

        return updatedQuests;
      });
    },
    [setStoredData]
  );

  const claimReward = useCallback(
    (questId: string): number | null => {
      let claimedReward: number | null = null;

      setQuests((prevQuests) => {
        const updatedQuests = prevQuests.map((quest) => {
          if (quest.id === questId && quest.completed && !quest.claimed) {
            claimedReward = quest.reward;
            addCoins(quest.reward);
            return { ...quest, claimed: true };
          }
          return quest;
        });

        setStoredData({
          date: getTodayString(),
          quests: updatedQuests,
        });

        return updatedQuests;
      });

      return claimedReward;
    },
    [addCoins, setStoredData]
  );

  const canClaim = useCallback(
    (questId: string): boolean => {
      const quest = quests.find((q) => q.id === questId);
      return quest ? quest.completed && !quest.claimed : false;
    },
    [quests]
  );

  const allCompleted = quests.every((q) => q.completed);
  const allClaimed = quests.every((q) => q.claimed);

  return {
    quests,
    refreshQuests,
    updateProgress,
    claimReward,
    canClaim,
    allCompleted,
    allClaimed,
  };
}
