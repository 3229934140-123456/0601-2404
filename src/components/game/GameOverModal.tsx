import { useEffect, useState } from 'react';
import { Trophy, Gem, MapPin, Coins, RotateCcw, Home, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

interface GameOverModalProps {
  className?: string;
  onRestart?: () => void;
  onBackToMenu?: () => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, highlight }) => (
  <div
    className={cn(
      'flex items-center gap-3 p-3 rounded-xl',
      highlight ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10'
    )}
  >
    <div
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        highlight ? 'bg-yellow-500/30' : 'bg-white/10'
      )}
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-white/60">{label}</span>
      <span
        className={cn(
          'text-xl font-bold font-mono',
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
}: GameOverModalProps) {
  const { isGameOver, score, distance, oreCount, resetGame } = useGameStore();
  const { addCoins, addGameRecord, currentMineCartId } = usePlayerStore();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      const coins = Math.floor(score / 10) + oreCount * 5;
      setEarnedCoins(coins);

      const { gameRecords } = usePlayerStore.getState();
      const highScore = Math.max(0, ...gameRecords.map((r) => r.score));
      const newRecord = score > highScore;
      setIsNewRecord(newRecord);

      addCoins(coins);
      addGameRecord({
        score,
        distance,
        coins,
        oreCount,
        mineCartId: currentMineCartId,
      });

      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isGameOver, score, distance, oreCount, addCoins, addGameRecord, currentMineCartId]);

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

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/80 backdrop-blur-sm',
        'animate-fadeIn',
        className
      )}
    >
      <div
        className={cn(
          'w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden',
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
            <p className="text-white/60 text-sm">你的矿车旅程结束了</p>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-3">
          <StatCard
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
            label="最终得分"
            value={score.toLocaleString()}
            highlight={isNewRecord}
          />

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<MapPin className="w-5 h-5 text-blue-400" />}
              label="行驶距离"
              value={distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${Math.floor(distance)}m`}
            />
            <StatCard
              icon={<Gem className="w-5 h-5 text-cyan-400" />}
              label="收集矿石"
              value={oreCount}
            />
          </div>

          <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-white/70">获得金币</span>
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
