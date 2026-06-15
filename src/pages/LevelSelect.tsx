import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import PixelCard from '@/components/ui/PixelCard';
import PixelButton from '@/components/ui/PixelButton';
import MinecartPreview from '@/components/game/MinecartPreview';
import { usePlayerStore, type MineCart } from '@/store/usePlayerStore';
import { getNormalLevels, getTimedLevels, type Level } from '@/data/levels';
import { minecarts as minecartData, type Minecart } from '@/data/minecarts';
import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: Level;
  isSelected: boolean;
  onClick: () => void;
}

function LevelCard({ level, isSelected, onClick }: LevelCardProps) {
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
          <Lock className="w-8 h-8 text-white/80" />
        </div>
      )}

      {isSelected && level.unlocked && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10">
          <Unlock className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white truncate">{level.name}</h3>
            {level.type === 'timed' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full flex-shrink-0">
                <Clock className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400 font-bold">{level.timeLimit}s</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mb-2">
            {difficultyStars.map((filled, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  filled ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>最高: {level.highScore.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span>速度 x{level.speedMultiplier}</span>
            </div>
          </div>
        </div>

        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: level.background }}
        >
          {level.type === 'timed' ? (
            <Clock className="w-8 h-8 text-white" />
          ) : (
            <Gem className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </button>
  );
}

export default function LevelSelect() {
  const navigate = useNavigate();
  const { currentMineCartId, selectMineCart, mineCarts } = usePlayerStore();

  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedMinecartId, setSelectedMinecartId] = useState<string>(currentMineCartId);

  const normalLevels = getNormalLevels();
  const timedLevels = getTimedLevels();

  const selectedLevel = [...normalLevels, ...timedLevels].find(
    (l) => l.id === selectedLevelId
  );

  const selectedMinecart = mineCarts.find((m) => m.id === selectedMinecartId);
  const unlockedMinecarts = mineCarts.filter((m) => m.unlocked);

  const getMinecartColor = (minecartId: string): string => {
    const data = minecartData.find((m) => m.id === minecartId);
    return data?.color || '#8B4513';
  };

  const getMinecartData = (minecartId: string): Minecart | undefined => {
    return minecartData.find((m) => m.id === minecartId);
  };

  const handleLevelClick = (level: Level) => {
    if (level.unlocked) {
      setSelectedLevelId(level.id);
    }
  };

  const handleMinecartClick = (minecart: MineCart) => {
    if (minecart.unlocked) {
      setSelectedMinecartId(minecart.id);
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Gem className="w-5 h-5" />
                普通关卡
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {normalLevels.map((level) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    isSelected={selectedLevelId === level.id}
                    onClick={() => handleLevelClick(level)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                限时关卡
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timedLevels.map((level) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    isSelected={selectedLevelId === level.id}
                    onClick={() => handleLevelClick(level)}
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
                  <span className="text-amber-200">选择矿车</span>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {unlockedMinecarts.map((minecart) => (
                  <div
                    key={minecart.id}
                    onClick={() => handleMinecartClick(minecart)}
                    className="cursor-pointer"
                  >
                    <MinecartPreview
                      color={getMinecartColor(minecart.id)}
                      speed={minecart.speed}
                      health={minecart.capacity}
                      name={minecart.name}
                      description={minecart.description}
                      unlocked={minecart.unlocked}
                      selected={selectedMinecartId === minecart.id}
                      showStats={false}
                      scale={1.2}
                      animate={selectedMinecartId === minecart.id}
                    />
                  </div>
                ))}
              </div>

              {selectedMinecart && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <MinecartPreview
                      color={getMinecartColor(selectedMinecart.id)}
                      speed={selectedMinecart.speed}
                      health={getMinecartData(selectedMinecart.id)?.health || 100}
                      name={selectedMinecart.name}
                      description={selectedMinecart.description}
                      unlocked={true}
                      selected={true}
                      showStats={true}
                      scale={1.5}
                      animate={true}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {selectedMinecart.name}
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        {selectedMinecart.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-white/70">
                            速度: <span className="text-yellow-400 font-bold">x{selectedMinecart.speed}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-white/70">
                            生命: <span className="text-red-400 font-bold">{getMinecartData(selectedMinecart.id)?.health || 100}</span>
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

        <div className="p-6 bg-stone-800/80 border-t-4 border-amber-600">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              {selectedLevel ? (
                <div>
                  <p className="text-sm text-white/60">已选择关卡</p>
                  <p className="text-lg font-bold text-white">{selectedLevel.name}</p>
                </div>
              ) : (
                <p className="text-white/60">请选择一个已解锁的关卡</p>
              )}
            </div>

            <div className="flex gap-3">
              <PixelButton
                variant="secondary"
                size="lg"
                onClick={handleBack}
              >
                返回
              </PixelButton>
              <PixelButton
                variant="primary"
                size="lg"
                icon={<Play className="w-5 h-5" />}
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
