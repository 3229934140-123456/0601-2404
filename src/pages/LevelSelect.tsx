import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Star,
  Trophy,
  Lock,
  Unlock,
  Play,
  Gem,
  Zap,
  Heart,
  AlertCircle,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import MinecartPreview from '@/components/game/MinecartPreview';
import { usePlayerStore } from '@/store/usePlayerStore';
import {
  getLevelsWithUnlockState,
  getLevelUnlockDescription,
  checkLevelUnlock,
  type Level,
} from '@/data/levels';
import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: Level;
  isSelected: boolean;
  onClick: () => void;
  unlockHint?: string;
}

function LevelCard({ level, isSelected, onClick, unlockHint }: LevelCardProps) {
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < level.difficulty);

  return (
    <button
      onClick={onClick}
      disabled={!level.unlocked}
      className={cn(
        'relative w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
          : 'bg-white/5 border-white/10 hover:border-white/20',
        !level.unlocked && 'opacity-60 cursor-not-allowed hover:scale-100'
      )}
    >
      {!level.unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl z-10 p-4">
          <Lock className="w-8 h-8 text-white/80 mb-2" />
          {unlockHint && (
            <div className="flex items-center gap-1 text-xs text-white/70 text-center">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-2">{unlockHint}</span>
            </div>
          )}
        </div>
      )}

      {isSelected && level.unlocked && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
          <Unlock className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate">{level.name}</h3>
            {level.type === 'timed' && (
              <PixelBadge variant="error" size="sm">
                <Clock className="w-2.5 h-2.5 mr-1" />
                {level.timeLimit}s
              </PixelBadge>
            )}
          </div>

          <div className="flex items-center gap-0.5 mb-2">
            {difficultyStars.map((filled, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  filled ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60 flex-wrap">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>最高: {level.highScore.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span>x{level.speedMultiplier}</span>
            </div>
          </div>
        </div>

        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: level.background }}
        >
          {level.type === 'timed' ? (
            <Clock className="w-7 h-7 text-white" />
          ) : (
            <Gem className="w-7 h-7 text-white" />
          )}
        </div>
      </div>
    </button>
  );
}

export default function LevelSelect() {
  const navigate = useNavigate();
  const {
    mineCarts,
    currentMineCartId,
    selectMineCart,
    unlockedLevels,
    gameRecords,
    stats,
  } = usePlayerStore();

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedMinecartId, setSelectedMinecartId] =
    useState<string>(currentMineCartId);

  useEffect(() => {
    const current = mineCarts.find((m) => m.id === currentMineCartId);
    if (current?.unlocked) {
      setSelectedMinecartId(currentMineCartId);
    } else {
      const firstUnlocked = mineCarts.find((m) => m.unlocked);
      if (firstUnlocked) {
        setSelectedMinecartId(firstUnlocked.id);
      }
    }
  }, [currentMineCartId, mineCarts]);

  const highScores = useMemo(() => {
    const scores: Record<string, number> = {};
    gameRecords.forEach((record) => {
      if (!scores[record.levelId] || scores[record.levelId] < record.score) {
        scores[record.levelId] = record.score;
      }
    });
    return scores;
  }, [gameRecords]);

  const allLevels = useMemo(
    () => getLevelsWithUnlockState(unlockedLevels, highScores),
    [unlockedLevels, highScores]
  );

  useEffect(() => {
    import('@/data/levels').then(({ checkLevelUnlock, levels: rawLevels }) => {
      rawLevels.forEach((level) => {
        if (!unlockedLevels.includes(level.id)) {
          const { canUnlock } = checkLevelUnlock(
            level.id,
            highScores,
            stats.levelsCompleted
          );
          if (canUnlock) {
            usePlayerStore.getState().unlockLevel(level.id);
          }
        }
      });
    });
  }, [highScores, stats.levelsCompleted, unlockedLevels]);

  const normalLevels = allLevels.filter((l) => l.type === 'normal');
  const timedLevels = allLevels.filter((l) => l.type === 'timed');

  const selectedLevel = allLevels.find((l) => l.id === selectedLevelId);
  const selectedMinecart = mineCarts.find((m) => m.id === selectedMinecartId);
  const unlockedMinecarts = mineCarts.filter((m) => m.unlocked);

  const handleLevelClick = (level: Level) => {
    if (level.unlocked) {
      setSelectedLevelId(level.id);
    }
  };

  const handleMinecartClick = (minecartId: string) => {
    const minecart = mineCarts.find((m) => m.id === minecartId);
    if (minecart?.unlocked) {
      setSelectedMinecartId(minecartId);
    }
  };

  const handleStartGame = () => {
    if (selectedLevel && selectedMinecart && selectedLevel.unlocked) {
      selectMineCart(selectedMinecartId);
      navigate('/game', {
        state: {
          levelId: selectedLevel.id,
          minecartId: selectedMinecart.id,
        },
      });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const canStartGame = selectedLevel?.unlocked && selectedMinecart?.unlocked;

  return (
    <MainLayout className="bg-stone-900">
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <PageHeader title="关卡选择" showBack showCoins />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-2">
                <Gem className="w-5 h-5" />
                普通关卡
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {normalLevels.map((level) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    isSelected={selectedLevelId === level.id}
                    onClick={() => handleLevelClick(level)}
                    unlockHint={getLevelUnlockDescription(level)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-red-400 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                限时关卡
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {timedLevels.map((level) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    isSelected={selectedLevelId === level.id}
                    onClick={() => handleLevelClick(level)}
                    unlockHint={getLevelUnlockDescription(level)}
                  />
                ))}
              </div>
            </div>

            <PixelCard
              variant="glass"
              padding="lg"
              title={
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-amber-200 text-sm">选择矿车</span>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {unlockedMinecarts.map((minecart) => (
                  <div
                    key={minecart.id}
                    onClick={() => handleMinecartClick(minecart.id)}
                    className="cursor-pointer"
                  >
                    <MinecartPreview
                      color={minecart.color}
                      speed={minecart.speed}
                      health={minecart.health}
                      name={minecart.name}
                      description={minecart.description}
                      unlocked={minecart.unlocked}
                      price={minecart.price}
                      selected={selectedMinecartId === minecart.id}
                      showStats={false}
                      scale={1.1}
                      animate={selectedMinecartId === minecart.id}
                    />
                  </div>
                ))}
              </div>

              {selectedMinecart && (
                <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <MinecartPreview
                        color={selectedMinecart.color}
                        speed={selectedMinecart.speed}
                        health={selectedMinecart.health}
                        name={selectedMinecart.name}
                        description={selectedMinecart.description}
                        unlocked={true}
                        selected={true}
                        showStats={true}
                        scale={1.4}
                        animate={true}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-2">
                        {selectedMinecart.name}
                      </h3>
                      <p className="text-xs text-white/60 mb-4">
                        {selectedMinecart.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-white/70">
                            速度:{' '}
                            <span className="text-yellow-400 font-bold">
                              x{selectedMinecart.speed}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-white/70">
                            生命:{' '}
                            <span className="text-red-400 font-bold">
                              {selectedMinecart.health}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </PixelCard>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-stone-800/80 border-t-4 border-amber-600">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              {selectedLevel ? (
                <div>
                  <p className="text-xs text-white/60">已选择关卡</p>
                  <p className="text-base font-bold text-white">
                    {selectedLevel.name}
                    {selectedLevel.type === 'timed' && (
                      <span className="ml-2 text-xs text-red-400">
                        ({selectedLevel.timeLimit}秒限时)
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-white/60 text-sm">请选择一个已解锁的关卡</p>
              )}
            </div>

            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                size="md"
                onClick={handleBack}
              >
                返回
              </PixelButton>
              <PixelButton
                variant="primary"
                size="md"
                icon={<Play className="w-4 h-4" />}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                开始游戏
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
