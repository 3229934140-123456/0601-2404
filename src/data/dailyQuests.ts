export type QuestType = 'collectOre' | 'earnScore' | 'travelDistance' | 'useItems' | 'completeLevels';

export interface DailyQuestTemplate {
  id: string;
  name: string;
  type: QuestType;
  description: string;
  targets: number[];
  rewards: number[];
  icon: string;
}

export interface DailyQuest {
  id: string;
  templateId: string;
  name: string;
  type: QuestType;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: string;
  completed: boolean;
  claimed: boolean;
}

export const dailyQuestTemplates: DailyQuestTemplate[] = [
  {
    id: 'quest-collect-ore',
    name: '矿石收集者',
    type: 'collectOre',
    description: '收集 {target} 个矿石',
    targets: [30, 50, 80, 100, 150],
    rewards: [100, 150, 250, 350, 500],
    icon: 'Pickaxe',
  },
  {
    id: 'quest-earn-score',
    name: '分数挑战',
    type: 'earnScore',
    description: '单局获得 {target} 分',
    targets: [1000, 2000, 3000, 5000, 8000],
    rewards: [150, 200, 300, 450, 600],
    icon: 'Star',
  },
  {
    id: 'quest-travel-distance',
    name: '长途跋涉',
    type: 'travelDistance',
    description: '累计行驶 {target} 米',
    targets: [500, 1000, 2000, 3000, 5000],
    rewards: [120, 180, 280, 400, 550],
    icon: 'MapPin',
  },
  {
    id: 'quest-use-items',
    name: '道具大师',
    type: 'useItems',
    description: '使用 {target} 个道具',
    targets: [2, 3, 5, 8, 10],
    rewards: [100, 150, 220, 320, 450],
    icon: 'Sparkles',
  },
  {
    id: 'quest-complete-levels',
    name: '关卡征服者',
    type: 'completeLevels',
    description: '完成 {target} 次关卡',
    targets: [1, 2, 3, 5, 7],
    rewards: [80, 150, 250, 400, 600],
    icon: 'Flag',
  },
];

export const getQuestTemplateById = (
  id: string
): DailyQuestTemplate | undefined =>
  dailyQuestTemplates.find((template) => template.id === id);

export const getQuestTemplateByType = (
  type: QuestType
): DailyQuestTemplate | undefined =>
  dailyQuestTemplates.find((template) => template.type === type);

export const generateDailyQuests = (count: number = 3): DailyQuest[] => {
  const shuffled = [...dailyQuestTemplates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map((template) => {
    const difficultyIndex = Math.floor(Math.random() * template.targets.length);
    return {
      id: `daily-quest-${Date.now()}-${template.id}`,
      templateId: template.id,
      name: template.name,
      type: template.type,
      description: template.description.replace(
        '{target}',
        template.targets[difficultyIndex].toString()
      ),
      target: template.targets[difficultyIndex],
      current: 0,
      reward: template.rewards[difficultyIndex],
      icon: template.icon,
      completed: false,
      claimed: false,
    };
  });
};

export const updateQuestProgress = (
  quest: DailyQuest,
  increment: number
): DailyQuest => {
  const newCurrent = Math.min(quest.current + increment, quest.target);
  return {
    ...quest,
    current: newCurrent,
    completed: newCurrent >= quest.target,
  };
};
