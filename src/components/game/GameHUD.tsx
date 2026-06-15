import { Heart, Gem, Zap, Shield, Magnet, Pause, Play } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';
import type { EngineState } from '@/game/types';

interface GameHUDProps {
  className?: string;
  engineState?: EngineState;
  onPause?: () => void;
  onResume?: () => void;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.floor(meters)}m`;
}

function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`;
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toString();
}

const EffectIcon: React.FC<{ type: 'boost' | 'shield' | 'magnet'; remainingTime: number }> = ({
  type,
  remainingTime,
}) => {
  const icons = {
    boost: <Zap className="w-5 h-5 text-yellow-400" />,
    shield: <Shield className="w-5 h-5 text-blue-400" />,
    magnet: <Magnet className="w-5 h-5 text-pink-400" />,
  };

  const labels = {
    boost: '加速',
    shield: '护盾',
    magnet: '磁铁',
  };

  const colors = {
    boost: 'bg-yellow-500/20 border-yellow-500/50',
    shield: 'bg-blue-500/20 border-blue-500/50',
    magnet: 'bg-pink-500/20 border-pink-500/50',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm',
        colors[type]
      )}
    >
      {icons[type]}
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium text-white">{labels[type]}</span>
        <span className="text-[10px] text-white/70">{remainingTime.toFixed(1)}s</span>
      </div>
    </div>
  );
};

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <Heart
    className={cn(
      'w-5 h-5 transition-all duration-200',
      filled ? 'text-red-500 fill-red-500' : 'text-gray-600'
    )}
  />
);

export default function GameHUD({ className, engineState, onPause, onResume }: GameHUDProps) {
  const {
    score,
    distance,
    oreCount,
    lives,
    maxLives,
    isPaused,
    isPlaying,
    activeEffects: storeEffects,
    pauseGame,
    resumeGame,
  } = useGameStore();

  const displayScore = engineState?.score ?? score;
  const displayDistance = engineState?.distance ?? distance;
  const displayOres = engineState?.ores ?? oreCount;
  const displayHealth = engineState?.health ?? lives;
  const displayMaxHealth = engineState ? (useGameStore.getState().maxLives * 33.33) : maxLives;
  const effects = engineState?.activeEffects ?? storeEffects;
  const paused = engineState?.isPaused ?? isPaused;
  const playing = engineState?.isPlaying ?? isPlaying;

  const handlePauseToggle = () => {
    if (paused) {
      onResume?.();
      resumeGame();
    } else {
      onPause?.();
      pauseGame();
    }
  };

  if (!playing && !paused) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-0 p-4 flex flex-col gap-3 pointer-events-none',
        className
      )}
    >
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-yellow-400 font-mono font-bold text-lg">
              {formatScore(displayScore)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-white/60 text-xs">距离</span>
            <span className="text-white font-mono font-bold">
              {formatDistance(displayDistance)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-mono font-bold">{displayOres}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handlePauseToggle}
            className="p-2.5 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
          >
            {paused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </button>

          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg">
            {Array.from({ length: displayMaxHealth }).map((_, i) => (
              <HeartIcon key={i} filled={i < displayHealth} />
            ))}
          </div>
        </div>
      </div>

      {effects.length > 0 && (
        <div className="flex items-center gap-2 pointer-events-auto">
          {effects.map((effect, index) => (
            <EffectIcon
              key={`${effect.type}-${index}`}
              type={effect.type as 'boost' | 'shield' | 'magnet'}
              remainingTime={effect.remainingTime ?? effect.duration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
