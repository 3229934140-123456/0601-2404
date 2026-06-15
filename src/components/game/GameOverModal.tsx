import { useEffect, useState, useMemo } from 'react';
import { Trophy, Gem, MapPin, Coins, RotateCcw, Home, Sparkles, Clock, Shield, Zap, Book, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import type { GameOverStats } from '@/game/engine';
import { getLevelById } from '@/data/levels';
import { achievements as achievementsData } from '@/data/achievements';
import type { LevelType } from '@/types';

interface GameOverModalProps {
  className?: string;
  onRestart?: () => void;
  onBackToMenu?: () => void;
  sessionStats?: GameOverStats & {
    levelId?: string;
    minecartId?: string;
  };
  isFinalGameOver?: boolean;
  onFinalize?: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  small?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, highlight, small }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl',
      small ? 'p-2.5' : 'p-3',
      highlight ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10'
    )}
  >
    <div
      className={cn(
        'rounded-lg flex items-center justify-center flex-shrink-0',
        small ? 'w-8 h-8' : 'w-10 h-10',
        highlight ? 'bg-yellow-500/30' : 'bg-white/10'
      )}
    >
      {icon}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] text-white/60 leading-none mb-0.5">{label}</span>
      <span
        className={cn(
          'font-bold font-mono leading-none',
          small ? 'text-sm' : 'text-xl',
          highlight ? 'text-yellow-400' : 'text-white'
        )}
      >
        {value}
      </span>
    </div>
  </div>
);

export default function GameOverModal({
  className,
  onRestart,
  onBackToMenu,
  sessionStats,
  isFinalGameOver = false,
  onFinalize,
}: GameOverModalProps) {
  const { isGameOver, score, distance, oreCount, resetGame } = useGameStore();
  const {
    addCoins,
    addGameRecord,
    currentMineCartId,
    checkAndUnlockAchievements,
    coins: currentCoins,
    achievements,
  } = usePlayerStore();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [unlockedAchIds, setUnlockedAchIds] = useState<string[]>([]);
  const [coinsBeforeSession, setCoinsBeforeSession] = useState(0);
  const [achCountBefore, setAchCountBefore] = useState(0);
  const [hasFinalized, setHasFinalized] = useState(false);

  const finalScore = sessionStats?.score ?? score;
  const finalDistance = sessionStats?.distance ?? distance;
  const finalOres = sessionStats?.ores ?? oreCount;
  const levelType: LevelType = sessionStats?.levelType ?? 'normal';
  const levelId = sessionStats?.levelId ?? 'level-1';
  const minecartId = sessionStats?.minecartId ?? currentMineCartId;

  useEffect(() => {
    if (isGameOver && sessionStats && !hasFinalized) {
      setCoinsBeforeSession(usePlayerStore.getState().coins);
      setAchCountBefore(usePlayerStore.getState().achievements.filter((a) => a.unlocked).length);
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isGameOver, sessionStats, hasFinalized]);

  useEffect(() => {
    if (isFinalGameOver && !hasFinalized && sessionStats) {
      setHasFinalized(true);

      const coins = Math.floor(finalScore / 10) + finalOres * 5 + (sessionStats.goldOreCount || 0) * 20;
      setEarnedCoins(coins);

      const levelInfo = getLevelById(levelId);
      const isTimed = levelInfo?.type === 'timed';
      const { gameRecords } = usePlayerStore.getState();
      const recordsForLevel = gameRecords.filter((r) => r.levelId === levelId);
      const highScore = recordsForLevel.length > 0
        ? Math.max(...recordsForLevel.map((r) => r.score))
        : 0;
      setIsNewRecord(finalScore > highScore);

      const itemsUsedCount = sessionStats.itemsUsed?.length || 0;
      const unlocked = checkAndUnlockAchievements({
        score: finalScore,
        distance: finalDistance,
        oreCount: finalOres,
        goldOreCount: sessionStats.goldOreCount || 0,
        itemsUsed: itemsUsedCount,
        damageTaken: sessionStats.damageTaken || 0,
        levelId: levelId,
        levelType: isTimed ? 'timed' : 'normal',
      });
      setUnlockedAchIds(unlocked.map((a) => a.id));

      addCoins(coins);
      addGameRecord({
        score: finalScore,
        distance: finalDistance,
        coins,
        oreCount: finalOres,
        mineCartId: minecartId,
        levelId: levelId,
        levelType: isTimed ? 'timed' : 'normal',
        itemsUsed: itemsUsedCount,
        damageTaken: sessionStats.damageTaken || 0,
        goldOreCount: sessionStats.goldOreCount || 0,
        timeLimit: sessionStats.timeLimit,
        timeElapsed: sessionStats.timeElapsed,
      });
    }
  }, [isFinalGameOver, hasFinalized, sessionStats, finalScore, finalDistance, finalOres, levelId, minecartId, addCoins, addGameRecord, checkAndUnlockAchievements]);

  const unlockedAchNames = useMemo(() => {
    return unlockedAchIds.map((id) => {
      const ach = achievementsData.find((a) => a.id === id);
      return ach ? { name: ach.name, reward: ach.reward } : { name: id, reward: 0 };
    });
  }, [unlockedAchIds]);

  const achCountAfter = achievements.filter((a) => a.unlocked).length;
  const totalAchCount = achievementsData.length;
  const storyProgressBefore = Math.floor(achCountBefore / 3);
  const storyProgressAfter = Math.floor(achCountAfter / 3);
  const storyChapterUnlocked = storyProgressAfter > storyProgressBefore;

  const handleRestart = () => {
    if (!hasFinalized) {
      onFinalize?.();
    }
    setTimeout(() => {
      resetGame();
      onRestart?.();
    }, 50);
  };

  const handleBackToMenu = () => {
    if (!hasFinalized) {
      onFinalize?.();
    }
    setTimeout(() => {
      resetGame();
      onBackToMenu?.();
    }, 50);
  };

  if (!isGameOver) {
    return null;
  }

  const levelName = getLevelById(levelId)?.name || '未知关卡';

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto',
        'bg-black/80 backdrop-blur-sm',
        'animate-fadeIn',
        className
      )}
    >
      <div
        className={cn(
          'w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto',
          'transform transition-all duration-500',
          showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        <div className="relative p-6 pb-4">
          {isNewRecord && (
            <div className="absolute inset-x-0 top-0 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-xl animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">新纪录!</span>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <h2 className="text-3xl font-bold text-white mb-1">游戏结束</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-white/60 text-sm">{levelName}</span>
              {levelType === 'timed' && (
                <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-full border border-red-500/30 font-bold">
                  ⏱ 限时挑战
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-3">
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            label="最终得分"
            value={finalScore.toLocaleString()}
            highlight={isNewRecord}
          />

          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              icon={<MapPin className="w-4 h-4 text-blue-400" />}
              label="行驶距离"
              value={finalDistance >= 1000 ? `${(finalDistance / 1000).toFixed(1)}km` : `${Math.floor(finalDistance)}m`}
              small
            />
            <StatCard
              icon={<Gem className="w-4 h-4 text-cyan-400" />}
              label="收集矿石"
              value={finalOres}
              small
            />
            {sessionStats?.goldOreCount !== undefined && sessionStats.goldOreCount > 0 && (
              <StatCard
                icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                label="金矿石"
                value={sessionStats.goldOreCount}
                small
              />
            )}
            {sessionStats?.timeElapsed !== undefined && (
              <StatCard
                icon={<Clock className="w-4 h-4 text-purple-400" />}
                label="用时"
                value={`${Math.floor(sessionStats.timeElapsed / 60)}:${Math.floor(sessionStats.timeElapsed % 60).toString().padStart(2, '0')}`}
                small
              />
            )}
            {sessionStats?.noDamage && (
              <StatCard
                icon={<Shield className="w-4 h-4 text-green-400" />}
                label="无伤通关"
                value="✓ 完美"
                small
              />
            )}
            {sessionStats && sessionStats.itemsUsed && sessionStats.itemsUsed.length > 0 && (
              <StatCard
                icon={<Zap className="w-4 h-4 text-yellow-400" />}
                label="使用道具"
                value={sessionStats.itemsUsed.length}
                small
              />
            )}
          </div>

          {unlockedAchNames.length > 0 && (
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">
                  解锁 {unlockedAchNames.length} 个新成就
                </span>
              </div>
              <div className="space-y-1">
                {unlockedAchNames.map((ach) => (
                  <div key={ach.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-200">{ach.name}</span>
                    {ach.reward > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-3 h-3" />+{ach.reward}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {storyChapterUnlocked && (
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">
                  像素剧情解锁新章节！
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/70 mt-1">
                当前进度：{achCountAfter}/{totalAchCount} 成就 → 第 {storyProgressAfter} 章已开放
              </div>
            </div>
          )}

          <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">本局成长</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-white/60">金币</span>
                <span className="text-amber-400 font-mono">
                  {coinsBeforeSession} → {coinsBeforeSession + earnedCoins}
                  <span className="text-green-400 ml-1">+{earnedCoins}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">成就</span>
                <span className="text-purple-400 font-mono">
                  {achCountBefore} → {achCountAfter}
                  {unlockedAchNames.length > 0 && <span className="text-green-400 ml-1">+{unlockedAchNames.length}</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-3">
          <button
            onClick={handleRestart}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'px-6 py-4 rounded-xl font-bold text-lg',
              'bg-gradient-to-r from-green-500 to-emerald-600',
              'hover:from-green-400 hover:to-emerald-500',
              'active:scale-[0.98] transition-all duration-150',
              'text-white shadow-lg shadow-green-500/30'
            )}
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>

          <button
            onClick={handleBackToMenu}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'px-6 py-4 rounded-xl font-bold',
              'bg-white/10 hover:bg-white/20',
              'active:scale-[0.98] transition-all duration-150',
              'text-white border border-white/10'
            )}
          >
            <Home className="w-5 h-5" />
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
