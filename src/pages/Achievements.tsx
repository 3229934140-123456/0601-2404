import { useState, useMemo } from 'react';
import { Trophy, BookOpen, Lock, Coins, Pickaxe, Gem, MapPin, Map, Compass, Award, Gauge, Sparkles, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import PixelModal from '@/components/ui/PixelModal';
import { usePlayerStore } from '@/store/usePlayerStore';
import { achievements as allAchievements } from '@/data/achievements';
import { cn } from '@/lib/utils';

type TabType = 'badges' | 'story';

interface AchievementDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  category: string;
  condition: {
    type: string;
    target: number;
    current: number;
  };
}

interface StoryChapter {
  id: number;
  title: string;
  description: string;
  requiredAchievements: number;
  panels: string[];
}

const storyChapters: StoryChapter[] = [
  {
    id: 1,
    title: '第一章：初入矿洞',
    description: '你是一名年轻的矿工，怀揣着成为传奇矿工的梦想，踏入了神秘的地下矿洞...',
    requiredAchievements: 1,
    panels: [
      '在一个阳光明媚的早晨，你背起工具，踏入了传说中的矿洞入口。',
      '洞壁上闪烁着微弱的矿石光芒，空气中弥漫着潮湿的气息。',
      '你深吸一口气，握紧了手中的镐子，开始了你的冒险之旅。',
    ],
  },
  {
    id: 2,
    title: '第二章：矿石收藏家',
    description: '你开始收集各种珍贵的矿石，你的技艺日益精进...',
    requiredAchievements: 3,
    panels: [
      '日子一天天过去，你收集的矿石越来越多。',
      '你发现了黄金矿石的秘密，它们比普通矿石更加珍贵。',
      '矿洞深处似乎有什么在召唤着你，那里有更多的宝藏等待发现。',
    ],
  },
  {
    id: 3,
    title: '第三章：速度与激情',
    description: '你的矿车速度越来越快，你开始挑战更远的距离...',
    requiredAchievements: 6,
    panels: [
      '你升级了矿车，速度越来越快。',
      '矿洞的轨道延伸向更深的地方，你看到了从未见过的景象。',
      '远处传来神秘的轰鸣声，似乎有什么古老的存在在等待着你。',
    ],
  },
  {
    id: 4,
    title: '第四章：道具大师',
    description: '你学会了使用各种道具，你的冒险变得更加顺利...',
    requiredAchievements: 9,
    panels: [
      '你发现了古老的道具商店，那里有各种神奇的道具。',
      '护盾保护你免受伤害，磁铁帮你收集矿石。',
      '你开始巧妙地运用这些道具，挑战更加危险的区域。',
    ],
  },
  {
    id: 5,
    title: '第五章：传奇之路',
    description: '你的名字开始在矿工之间传颂...',
    requiredAchievements: 12,
    panels: [
      '你的分数越来越高，其他矿工开始谈论你的传奇。',
      '你获得了"传奇矿工"的称号，矿洞中的每个角落都留下了你的足迹。',
      '但你知道，真正的挑战才刚刚开始...',
    ],
  },
  {
    id: 6,
    title: '终章：矿洞之主',
    description: '你成为了矿洞的主人，揭开了矿洞最深的秘密...',
    requiredAchievements: 15,
    panels: [
      '你终于到达了矿洞的最深处，那里有一个巨大的矿车等待着你。',
      '原来矿洞的守护者出现了，它是矿洞的灵魂。',
      '你成为了新的守护者，传承着矿工的传说，永远守护着这片矿洞。',
    ],
  },
];

const getAchievementIcon = (iconName: string, unlocked: boolean) => {
  const iconClass = unlocked ? 'text-yellow-400' : 'text-gray-500';
  const iconMap: Record<string, React.ReactNode> = {
    Pickaxe: <Pickaxe className={cn('w-8 h-8', iconClass)} />,
    Gem: <Gem className={cn('w-8 h-8', iconClass)} />,
    Trophy: <Trophy className={cn('w-8 h-8', iconClass)} />,
    Crown: <Crown className={cn('w-8 h-8', iconClass)} />,
    MapPin: <MapPin className={cn('w-8 h-8', iconClass)} />,
    Map: <Map className={cn('w-8 h-8', iconClass)} />,
    Compass: <Compass className={cn('w-8 h-8', iconClass)} />,
    Award: <Award className={cn('w-8 h-8', iconClass)} />,
    Gauge: <Gauge className={cn('w-8 h-8', iconClass)} />,
    Sparkles: <Sparkles className={cn('w-8 h-8', iconClass)} />,
    ShieldCheck: <ShieldCheck className={cn('w-8 h-8', iconClass)} />,
  };
  return iconMap[iconName] || <Trophy className={cn('w-8 h-8', iconClass)} />;
};

const getCategoryBadge = (category: string) => {
  const categoryMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    collection: { label: '收集', variant: 'success' },
    score: { label: '分数', variant: 'warning' },
    distance: { label: '距离', variant: 'info' },
    special: { label: '特殊', variant: 'error' },
  };
  return categoryMap[category] || { label: category, variant: 'info' };
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState<TabType>('badges');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDetail | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);

  const { achievements: storeAchievements } = usePlayerStore();

  const getAchievementUnlocked = (achievementId: string): boolean => {
    const storeId = achievementId.replace('achievement-', '');
    const storeAchievement = storeAchievements.find(a => a.id === storeId);
    if (storeAchievement) {
      return storeAchievement.unlocked;
    }
    const dataAchievement = allAchievements.find(a => a.id === achievementId);
    return dataAchievement?.unlocked || false;
  };

  const getAchievementProgress = (achievementId: string): { current: number; target: number } => {
    const dataAchievement = allAchievements.find(a => a.id === achievementId);
    if (!dataAchievement) return { current: 0, target: 1 };
    const storeId = achievementId.replace('achievement-', '');
    const storeAchievement = storeAchievements.find(a => a.id === storeId);
    if (storeAchievement && storeAchievement.unlocked) {
      return { current: dataAchievement.condition.target, target: dataAchievement.condition.target };
    }
    return { current: dataAchievement.condition.current, target: dataAchievement.condition.target };
  };

  const achievementStats = useMemo(() => {
    const total = allAchievements.length;
    const unlocked = allAchievements.filter(a => getAchievementUnlocked(a.id)).length;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  }, [storeAchievements]);

  const getChapterUnlocked = (chapter: StoryChapter): boolean => {
    return achievementStats.unlocked >= chapter.requiredAchievements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900">
      <PageHeader title="成就图鉴" showBack showCoins />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <PixelCard className="mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">成就进度</h3>
                <p className="text-sm text-white/60">
                  已解锁 <span className="text-amber-400 font-bold">{achievementStats.unlocked}</span> / {achievementStats.total} 个成就
                </p>
              </div>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>进度</span>
                  <span>{achievementStats.percentage}%</span>
                </div>
                <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${achievementStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        <div className="flex gap-2 mb-6">
          <PixelButton
            variant={activeTab === 'badges' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('badges')}
            className="flex-1"
          >
            <Trophy className="w-4 h-4" />
            成就徽章
          </PixelButton>
          <PixelButton
            variant={activeTab === 'story' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('story')}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4" />
            像素剧情
          </PixelButton>
        </div>

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allAchievements.map((achievement) => {
              const unlocked = getAchievementUnlocked(achievement.id);
              const progress = getAchievementProgress(achievement.id);
              const categoryInfo = getCategoryBadge(achievement.category);

              return (
                <PixelCard
                  key={achievement.id}
                  className={cn(
                  'cursor-pointer transition-all duration-300',
                  unlocked
                    ? 'hover:shadow-lg hover:scale-105'
                    : 'opacity-70 hover:opacity-90'
                )}
                  onClick={() => setSelectedAchievement({
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    reward: achievement.reward,
                    unlocked,
                    category: achievement.category,
                    condition: {
                      type: achievement.condition.type,
                      target: achievement.condition.target,
                      current: progress.current,
                    },
                  })}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      'p-4 rounded-xl mb-3',
                      unlocked
                        ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20'
                        : 'bg-stone-700/50'
                    )}>
                      {getAchievementIcon(achievement.icon, unlocked)}
                    </div>

                    <h4 className={cn(
                      'text-sm font-bold mb-1',
                      unlocked ? 'text-white' : 'text-gray-400'
                    )}>
                      {achievement.name}
                    </h4>

                    <PixelBadge variant={categoryInfo.variant} size="sm" className="mb-2">
                      {categoryInfo.label}
                    </PixelBadge>

                    {!unlocked && (
                      <div className="w-full mt-2">
                        <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all duration-300"
                            style={{ width: `${(progress.current / progress.target) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {progress.current} / {progress.target}
                        </div>
                      </div>
                    )}

                    {unlocked && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-2">
                        <Coins className="w-3 h-3" />
                        <span>+{achievement.reward}</span>
                      </div>
                    )}
                  </div>
                </PixelCard>
              );
            })}
          </div>
        )}

        {activeTab === 'story' && (
          <div className="space-y-4">
            {storyChapters.map((chapter) => {
              const unlocked = getChapterUnlocked(chapter);
              const progress = Math.min(100, (achievementStats.unlocked / chapter.requiredAchievements) * 100);

              return (
                <PixelCard
                  key={chapter.id}
                  className={cn(
                    'cursor-pointer transition-all duration-300',
                    unlocked
                      ? 'hover:shadow-lg'
                      : 'opacity-60'
                  )}
                  onClick={() => unlocked && setSelectedChapter(chapter)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center',
                      unlocked
                        ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20'
                        : 'bg-stone-700/50'
                    )}>
                      {unlocked ? (
                        <span className="text-3xl">📖</span>
                      ) : (
                        <Lock className="w-8 h-8 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          'text-lg font-bold',
                          unlocked ? 'text-white' : 'text-gray-400'
                        )}>
                          {chapter.title}
                        </h3>
                        {unlocked ? (
                          <PixelBadge variant="success" size="sm">
                            已解锁
                          </PixelBadge>
                        ) : (
                          <PixelBadge variant="warning" size="sm">
                            需要 {chapter.requiredAchievements} 个成就
                          </PixelBadge>
                        )}
                      </div>

                      <p className={cn(
                        'text-sm mb-2',
                        unlocked ? 'text-white/70' : 'text-gray-500'
                      )}>
                        {unlocked ? chapter.description : '解锁更多成就以查看此章节...'}
                      </p>

                      {!unlocked && (
                        <div className="w-full max-w-xs">
                          <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {unlocked && (
                      <ChevronRight className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                </PixelCard>
              );
            })}
          </div>
        )}
      </div>

      <PixelModal
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        title="成就详情"
      >
        {selectedAchievement && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-4 rounded-xl',
                selectedAchievement.unlocked
                  ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20'
                  : 'bg-stone-700/50'
              )}>
                {getAchievementIcon(selectedAchievement.icon, selectedAchievement.unlocked)}
              </div>
              <div>
                <h3 className={cn(
                  'text-xl font-bold',
                  selectedAchievement.unlocked ? 'text-pixel-brown-dark' : 'text-gray-500'
                )}>
                  {selectedAchievement.name}
                </h3>
                <PixelBadge
                  variant={getCategoryBadge(selectedAchievement.category).variant}
                  size="sm"
                >
                  {getCategoryBadge(selectedAchievement.category).label}
                </PixelBadge>
              </div>
            </div>

            <p className="text-pixel-brown-dark/80">
              {selectedAchievement.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
              <span className="text-pixel-brown-dark/60">完成进度</span>
              <span className="text-pixel-brown-dark font-bold">
                {selectedAchievement.condition.current} / {selectedAchievement.condition.target}
              </span>
              </div>
              <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    selectedAchievement.unlocked
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  )}
                  style={{ width: `${(selectedAchievement.condition.current / selectedAchievement.condition.target) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
              <span className="text-pixel-brown-dark/70">奖励</span>
              <div className="flex items-center gap-2 text-amber-600">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-lg">+{selectedAchievement.reward}</span>
              </div>
            </div>

            {selectedAchievement.unlocked && (
              <div className="text-center py-2">
                <PixelBadge variant="success" glow>
                  ✓ 已解锁
                </PixelBadge>
              </div>
            )}
          </div>
        )}
      </PixelModal>

      <PixelModal
        isOpen={!!selectedChapter}
        onClose={() => setSelectedChapter(null)}
        title={selectedChapter?.title}
        className="max-w-2xl"
      >
        {selectedChapter && (
          <div className="space-y-6">
          <p className="text-pixel-brown-dark/80 text-center italic">
            {selectedChapter.description}
          </p>

          <div className="space-y-4">
            {selectedChapter.panels.map((panel, index) => (
              <div
                key={index}
                className="relative pl-6 border-l-4 border-amber-500/30"
              >
                <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-500 rounded-full" />
                <div className="bg-stone-100 p-4 rounded-lg border-2 border-stone-300">
                  <p className="text-pixel-brown-dark text-sm leading-relaxed">
                    {panel}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t-2 border-pixel-brown-dark/20">
            <p className="text-pixel-brown-dark/60 text-xs">
            🏆 解锁更多成就以继续阅读剧情
          </p>
          </div>
        </div>
        )}
      </PixelModal>
    </div>
  );
}
