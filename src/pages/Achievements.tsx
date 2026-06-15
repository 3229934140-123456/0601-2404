import { useState, useMemo } from 'react';
import { Trophy, Book, Star, Award, Coins, Gem, Lock, Pickaxe, MapPin, Map, Compass, Crown, Gauge, Sparkles, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import PixelProgress from '@/components/ui/PixelProgress';
import PixelModal from '@/components/ui/PixelModal';
import AchievementNotification from '@/components/game/AchievementNotification';
import { usePlayerStore } from '@/store/usePlayerStore';
import { achievements as achievementsData, type AchievementCategory } from '@/data/achievements';
import { cn } from '@/lib/utils';

type ViewMode = 'badges' | 'story';

interface UnlockChapterModal {
  id: number;
  title: string;
  content: string;
  color: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Pickaxe: <Pickaxe className="w-6 h-6" />,
  Gem: <Gem className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  MapPin: <MapPin className="w-6 h-6" />,
  Map: <Map className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Gauge: <Gauge className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
};

export default function Achievements() {
  const [viewMode, setViewMode] = useState<ViewMode>('badges');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [chapterModal, setChapterModal] = useState<UnlockChapterModal | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<{
    name: string;
    description: string;
    icon: string;
    reward: number;
  } | null>(null);

  const {
    achievements,
    stats,
  } = usePlayerStore();

  const achievementStats = useMemo(() => {
    const totalCount = achievementsData.length;
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const progressPercentage = Math.round((unlockedCount / totalCount) * 100);
    const countByCategory = (cat: AchievementCategory) => {
      const total = achievementsData.filter((a) => a.category === cat).length;
      const unlocked = achievements.filter((a) => {
        const data = achievementsData.find((d) => d.id === a.id);
        return a.unlocked && data?.category === cat;
      }).length;
      return { total, unlocked };
    };
    const collection = countByCategory('collection');
    const score = countByCategory('score');
    const distance = countByCategory('distance');
    const special = countByCategory('special');
    return {
      totalCount,
      unlockedCount,
      progressPercentage,
      collectibleCount: collection.total,
      unlockedCollectible: collection.unlocked,
      scoreCount: score.total,
      unlockedScore: score.unlocked,
      distanceCount: distance.total,
      unlockedDistance: distance.unlocked,
      specialCount: special.total,
      unlockedSpecial: special.unlocked,
    };
  }, [achievements]);

  const categoryStats: Record<
    AchievementCategory,
    { label: string; unlocked: number; total: number; icon: any; color: string }
  > = {
    collection: {
      label: '收集',
      unlocked: achievementStats.unlockedCollectible,
      total: achievementStats.collectibleCount,
      icon: Gem,
      color: 'from-cyan-500 to-blue-500',
    },
    score: {
      label: '分数',
      unlocked: achievementStats.unlockedScore,
      total: achievementStats.scoreCount,
      icon: Star,
      color: 'from-amber-500 to-orange-500',
    },
    distance: {
      label: '距离',
      unlocked: achievementStats.unlockedDistance,
      total: achievementStats.distanceCount,
      icon: Award,
      color: 'from-green-500 to-emerald-500',
    },
    special: {
      label: '特殊',
      unlocked: achievementStats.unlockedSpecial,
      total: achievementStats.specialCount,
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
    },
  };

  const chapterData = [
    {
      id: 1,
      title: '第一章：矿洞初探',
      content: '传说在群山深处有一座古老的金矿，里面埋藏着无数的财富。勇敢的矿工，你驾驶着你的矿车，开始了冒险之旅。山洞的入口处漆黑一片，只有矿灯照亮前方的轨道...',
      color: 'from-cyan-600 to-blue-700',
      required: 3,
    },
    {
      id: 2,
      title: '第二章：幽暗隧道',
      content: '深入矿洞后，你发现了更多的秘密。墙上的古老壁画描绘着一个失落的文明，他们曾在这里开采出了惊人的宝藏。蝙蝠在头顶飞过，塌方的警告声不时响起，但你没有退缩...',
      color: 'from-indigo-600 to-purple-700',
      required: 6,
    },
    {
      id: 3,
      title: '第三章：熔岩深渊',
      content: '温度开始升高，墙壁变得灼热发红。你来到了传说中的熔岩深渊，这里的金矿品质最高，但危险也成倍增加。滚烫的岩浆从裂缝中涌出，红色的光芒照亮了整个通道...',
      color: 'from-red-600 to-orange-700',
      required: 9,
    },
    {
      id: 4,
      title: '第四章：水晶秘境',
      content: '穿过熔岩区，你进入了一个如梦如幻的水晶秘境。巨大的水晶散发着七彩的光芒，空气中弥漫着神奇的能量。传说这里的水晶能够赋予矿车非凡的能力...',
      color: 'from-pink-600 to-rose-700',
      required: 12,
    },
    {
      id: 5,
      title: '终章：黄金之心',
      content: '在最深处，你终于找到了传说中的黄金之心——一颗巨大的纯金矿石，蕴含着整个矿洞的能量。它见证了无数矿工的努力与汗水，现在，这份荣耀属于你！恭喜你成为传奇矿工！',
      color: 'from-amber-500 to-yellow-600',
      required: achievementStats.totalCount,
    },
  ];

  const storyChapters = useMemo(() => {
    return chapterData.map((chapter) => ({
      ...chapter,
      unlocked: achievementStats.unlockedCount >= chapter.required,
      reward: { coins: chapter.id * 100 },
    }));
  }, [achievementStats.unlockedCount, achievementStats.totalCount]);

  function getAchievementProgress(id: string): { current: number; target: number; percentage: number } {
    const storeAch = achievements.find((a) => a.id === id);
    const dataAch = achievementsData.find((a) => a.id === id);
    if (!dataAch) return { current: 0, target: 1, percentage: 0 };
    const target = dataAch.condition.target;
    let current = storeAch?.condition.current ?? 0;

    switch (dataAch.condition.type) {
      case 'collectOre':
        current = Math.min(stats.totalOreCollected, target);
        break;
      case 'collectGoldOre':
        current = Math.min(stats.totalGoldOreCollected, target);
        break;
      case 'totalScore':
        current = Math.min(stats.totalScore, target);
        break;
      case 'totalDistance':
        current = Math.min(Math.floor(stats.totalDistance), target);
        break;
      case 'clearLevels':
        current = Math.min(stats.levelsCompleted.filter(id => id.startsWith('level-')).length, target);
        break;
      case 'purchaseMinecart':
        current = Math.min(stats.minecartsPurchased, target);
        break;
      default:
        current = storeAch?.condition.current ?? 0;
    }
    const percentage = Math.min(100, Math.round((current / target) * 100));
    return { current, target, percentage };
  }

  const filteredAchievements = useMemo(() => {
    const list = achievementsData.map((dataItem) => {
      const storeItem = achievements.find((a) => a.id === dataItem.id);
      const progress = getAchievementProgress(dataItem.id);
      return {
        ...dataItem,
        unlocked: storeItem?.unlocked || false,
        progress,
      };
    });
    if (selectedCategory === 'all') return list;
    return list.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory, stats]);

  const handleClaimReward = (achievementId: string) => {
    const ach = achievementsData.find((a) => a.id === achievementId);
    const storeAch = achievements.find((a) => a.id === achievementId);
    if (ach && storeAch?.unlocked) {
      setAchievementNotification({
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        reward: ach.reward,
      });
      setTimeout(() => setAchievementNotification(null), 4000);
    }
  };

  const handleChapterClaim = (chapter: typeof storyChapters[0]) => {
    if (!chapter.unlocked) return;
    setChapterModal({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      color: chapter.color,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900">
      <PageHeader title="成就图鉴" showBack showCoins />

      <div className="container mx-auto px-4 py-4 md:py-6">
        <PixelCard className="mb-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">成就进度</h2>
                <p className="text-xs text-white/60">继续游戏解锁更多成就</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-400">
                {achievementStats.unlockedCount}
                <span className="text-sm text-white/60">/{achievementStats.totalCount}</span>
              </div>
              <div className="text-xs text-white/60">已解锁</div>
            </div>
          </div>
          <PixelProgress
            value={achievementStats.progressPercentage}
            showLabel
            color="tan"
          />
        </PixelCard>

        <div className="flex gap-2 mb-5">
          <PixelButton
            variant={viewMode === 'badges' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('badges')}
            className="flex-1"
            size="sm"
          >
            <Trophy className="w-4 h-4" />
            成就徽章
          </PixelButton>
          <PixelButton
            variant={viewMode === 'story' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('story')}
            className="flex-1"
            size="sm"
          >
            <Book className="w-4 h-4" />
            像素剧情
          </PixelButton>
        </div>

        {viewMode === 'badges' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              {(Object.keys(categoryStats) as AchievementCategory[]).map((cat) => {
                const stat = categoryStats[cat];
                const CatIcon = stat.icon;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                    className={cn(
                      'p-3 rounded-xl transition-all text-left',
                      isActive
                        ? `bg-gradient-to-br ${stat.color} shadow-lg`
                        : 'bg-pixel-card-bg hover:bg-pixel-card-hover border border-pixel-border'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CatIcon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-amber-400')} />
                      <span className={cn('text-xs font-bold', isActive ? 'text-white' : 'text-white/80')}>
                        {stat.label}
                      </span>
                    </div>
                    <div className={cn('text-lg font-bold', isActive ? 'text-white' : 'text-white')}>
                      {stat.unlocked}/{stat.total}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCategory !== 'all' && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/60">
                  筛选: {categoryStats[selectedCategory].label}类成就
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  查看全部
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAchievements.map((achievement) => (
                <PixelCard
                  key={achievement.id}
                  className={cn(
                    'transition-all',
                    achievement.unlocked && 'shadow-lg shadow-amber-500/20 border-amber-500/30'
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold',
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                          : 'bg-gray-700 text-gray-400 grayscale'
                      )}
                    >
                      {iconMap[achievement.icon] || <Trophy className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3
                          className={cn(
                            'text-sm font-bold truncate',
                            achievement.unlocked ? 'text-white' : 'text-white/50'
                          )}
                        >
                          {achievement.name}
                        </h3>
                        {achievement.unlocked && <PixelBadge variant="warning" size="sm">已完成</PixelBadge>}
                      </div>
                      <p className="text-xs text-white/60 mb-2 line-clamp-1">
                        {achievement.description}
                      </p>
                      <PixelProgress
                        value={achievement.progress.percentage}
                        showLabel
                        color={achievement.unlocked ? 'green' : 'blue'}
                        className="mb-2"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          {achievement.reward > 0 && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Coins className="w-3 h-3" />
                              {achievement.reward}
                            </span>
                          )}
                        </div>
                        {achievement.unlocked ? (
                          <PixelButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleClaimReward(achievement.id)}
                          >
                            查看奖励
                          </PixelButton>
                        ) : (
                          <PixelBadge variant="info" size="sm">未完成</PixelBadge>
                        )}
                      </div>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          </>
        )}

        {viewMode === 'story' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {storyChapters.map((chapter, index) => (
                <PixelCard
                  key={chapter.id}
                  className={cn(
                    'overflow-hidden transition-all',
                    chapter.unlocked && 'shadow-lg border-amber-500/30'
                  )}
                >
                  <div className="flex flex-col md:flex-row">
                    <div
                      className={cn(
                        'w-full md:w-48 h-32 md:h-auto flex items-center justify-center relative overflow-hidden -mx-5 -mt-5 md:mx-0 md:mt-0 md:mr-5 mb-4 md:mb-0',
                        chapter.unlocked
                          ? `bg-gradient-to-br ${chapter.color}`
                          : 'bg-gray-800'
                      )}
                      style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', borderBottomLeftRadius: 0 }}
                    >
                      {chapter.unlocked ? (
                        <div className="text-center">
                          <div className="text-5xl font-black text-white/90 mb-1">
                            {index + 1}
                          </div>
                          <div className="text-xs text-white/70 font-bold">
                            CHAPTER
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Lock className="w-10 h-10 text-gray-600 mx-auto mb-1" />
                          <div className="text-xs text-gray-500 font-bold">
                            🔒 未解锁
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h3
                        className={cn(
                          'text-sm font-bold mb-1',
                          chapter.unlocked ? 'text-white' : 'text-white/40'
                        )}
                      >
                        {chapter.title}
                      </h3>
                      <p
                        className={cn(
                          'text-xs mb-3 flex-grow leading-relaxed',
                          chapter.unlocked ? 'text-white/70' : 'text-white/30'
                        )}
                      >
                        {chapter.unlocked
                          ? chapter.content.slice(0, 50) + '...'
                          : `解锁 ${chapter.required} 个成就后可阅读此章节`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Coins className="w-3 h-3" />
                            {chapter.reward.coins}
                          </span>
                        </div>
                        {chapter.unlocked ? (
                          <PixelButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleChapterClaim(chapter)}
                          >
                            阅读章节
                          </PixelButton>
                        ) : (
                          <PixelButton variant="secondary" size="sm" disabled>
                            <Lock className="w-3 h-3" />
                            {chapter.required}成就解锁
                          </PixelButton>
                        )}
                      </div>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          </div>
        )}
      </div>

      <PixelModal
        isOpen={!!chapterModal}
        onClose={() => setChapterModal(null)}
        title={chapterModal?.title || ''}
      >
        {chapterModal && (
          <div className="space-y-5">
            <div
              className={`w-full h-44 rounded-xl bg-gradient-to-br ${chapterModal.color} flex items-center justify-center`}
            >
              <div className="text-center">
                <Book className="w-14 h-14 text-white/90 mx-auto mb-2" />
                <div className="text-white/80 text-sm">像素剧情</div>
              </div>
            </div>
            <div className="px-2">
              <p className="text-sm text-pixel-brown-dark leading-relaxed whitespace-pre-line">
                {chapterModal.content}
              </p>
            </div>
            <div className="pt-2">
              <PixelButton
                variant="primary"
                onClick={() => setChapterModal(null)}
                className="w-full"
              >
                继续冒险
              </PixelButton>
            </div>
          </div>
        )}
      </PixelModal>

      {achievementNotification && (
        <AchievementNotification
          name={achievementNotification.name}
          description={achievementNotification.description}
          icon={achievementNotification.icon}
          reward={achievementNotification.reward}
          onClose={() => setAchievementNotification(null)}
        />
      )}
    </div>
  );
}
