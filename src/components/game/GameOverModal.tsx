import { useEffect, useState } from 'react';
import { Trophy, Gem, MapPin, Coins, RotateCcw, Home, Sparkles, Clock, Shield, Zap } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import type { GameOverStats } from '@/game/engine';
import { getLevelById } from '@/data/levels';
import type { LevelType } from '@/types';

interface GameOverModalProps {
  className?: string;
  onRestart?: () => void;
  onBackToMenu?: () => void;
  sessionStats?: GameOverStats & {
    levelId?: string;
    minecartId?: string;
  };
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
}: GameOverModalProps) {
  const { isGameOver, score, distance, oreCount, resetGame } = useGameStore();
  const {
    addCoins,
    addGameRecord,
    currentMineCartId,
    checkAndUnlockAchievements,
  } = usePlayerStore();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const finalScore = sessionStats?.score ?? score;
  const finalDistance = sessionStats?.distance ?? distance;
  const finalOres = sessionStats?.ores ?? oreCount;
  const levelType: LevelType = sessionStats?.levelType ?? 'normal';
  const levelId = sessionStats?.levelId ?? 'level-1';
  const minecartId = sessionStats?.minecartId ?? currentMineCartId;

  useEffect(() => {
    if (isGameOver && sessionStats) {
      const coins = Math.floor(finalScore / 10) + finalOres * 5 + (sessionStats.goldOreCount || 0) * 20;
      setEarnedCoins(coins);

      const levelInfo = getLevelById(levelId);
      const isTimed = levelInfo?.type === 'timed';
      const { gameRecords } = usePlayerStore.getState();
      const recordsForLevel = gameRecords.filter((r) => r.levelId === levelId);
      const highScore = recordsForLevel.length > 0
        ? Math.max(...recordsForLevel.map((r) => r.score))
        : 0;
      const newRecord = finalScore > highScore;
      setIsNewRecord(newRecord);

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
      setNewAchievements(unlocked.map((a) => a.id));

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

      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setNewAchievements([]);
    }
  }, [isGameOver, sessionStats, finalScore, finalDistance, finalOres, levelId, minecartId, addCoins, addGameRecord, checkAndUnlockAchievements]);

  const handleRestart = () => {
    resetGame();
    onRestart?.();
  };

  const handleBackToMenu = () => {
    resetGame();
    onBackToMenu?.();
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

          {newAchievements.length > 0 && (
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">
                  解锁 {newAchievements.length} 个新成就！
                </span>
              </div>
              <div className="text-[10px] text-white/60">
                前往成就图鉴领取奖励
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-white/70 text-sm">获得金币</span>
            <span className="text-2xl font-bold text-yellow-400 font-mono">
              +{earnedCoins}
            </span>
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
