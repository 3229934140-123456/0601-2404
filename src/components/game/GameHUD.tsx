import { Heart, Gem, Zap, Shield, Magnet, Pause, Play, Clock, AlertTriangle, Info, ChevronDown, ChevronUp, Gauge } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';
import type { EngineState } from '@/game/types';

interface GameHUDProps {
  className?: string;
  engineState?: EngineState;
  remainingTime?: number;
  timeLimit?: number;
  levelType?: 'normal' | 'timed';
  maxHealth?: number;
  onPause?: () => void;
  onResume?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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

const effectDetailConfig: Record<string, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  boost: {
    label: '速度提升',
    description: '矿车移动速度提升 50%',
    icon: <Gauge className="w-4 h-4" />,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  shield: {
    label: '护盾保护',
    description: '抵挡一次碰撞伤害',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  magnet: {
    label: '磁铁吸引',
    description: '自动吸附附近矿石',
    icon: <Magnet className="w-4 h-4" />,
    color: 'bg-pink-500',
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  doubleScore: {
    label: '双倍分数',
    description: '得分增长速度翻倍',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
};

const EffectIcon: React.FC<{ type: string; remainingTime: number }> = ({
  type,
  remainingTime,
}) => {
  const effectLabels: Record<string, string> = {
    boost: '速度↑',
    shield: '护盾',
    magnet: '磁铁',
    doubleScore: '分数×2',
  };

  const effectColors: Record<string, { bg: string; icon: React.ReactNode }> = {
    boost: {
      bg: 'bg-yellow-500/20 border-yellow-500/50',
      icon: <Gauge className="w-5 h-5 text-yellow-400" />,
    },
    shield: {
      bg: 'bg-blue-500/20 border-blue-500/50',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
    },
    magnet: {
      bg: 'bg-pink-500/20 border-pink-500/50',
      icon: <Magnet className="w-5 h-5 text-pink-400" />,
    },
    doubleScore: {
      bg: 'bg-purple-500/20 border-purple-500/50',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
    },
  };

  const cfg = effectColors[type];
  if (!cfg) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm',
        cfg.bg
      )}
    >
      {cfg.icon}
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium text-white">{effectLabels[type] || type}</span>
        <span className="text-[10px] text-white/70">{remainingTime.toFixed(1)}s</span>
      </div>
    </div>
  );
};

export default function GameHUD({ className, engineState, remainingTime: rt, timeLimit: tl, levelType: lt, maxHealth: mh, onPause, onResume }: GameHUDProps) {
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

  const [showEffectDetail, setShowEffectDetail] = useState(false);

  const displayScore = engineState?.score ?? score;
  const displayDistance = engineState?.distance ?? distance;
  const displayOres = engineState?.ores ?? oreCount;
  const displayHealth = engineState?.health ?? lives;
  const displayMaxHealth = mh ?? engineState?.health ?? (maxLives * 33.33);
  const effects = engineState?.activeEffects ?? storeEffects;
  const paused = engineState?.isPaused ?? isPaused;
  const playing = engineState?.isPlaying ?? isPlaying;
  const remainingTime = rt ?? engineState?.remainingTime;
  const timeLimit = tl ?? engineState?.timeLimit;
  const levelType = lt ?? engineState?.levelType;

  const isUrgent = remainingTime !== undefined && remainingTime < 10;

  const healthPercent = displayMaxHealth > 0
    ? Math.min(100, Math.max(0, (displayHealth / displayMaxHealth) * 100))
    : 0;

  const healthColor = healthPercent > 60 ? 'bg-green-500' : healthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const hasShield = effects.some((e) => e.type === 'shield');

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
      {levelType === 'timed' && remainingTime !== undefined && timeLimit !== undefined && (
        <div className="flex justify-center pointer-events-auto">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border',
              isUrgent
                ? 'bg-red-900/70 border-red-500/70 animate-pulse'
                : 'bg-black/50 border-white/10'
            )}
          >
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <Clock className="w-5 h-5 text-amber-400" />
            )}
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-white/60 leading-none mb-0.5">限时挑战</span>
              <span className={cn(
                'text-xl font-mono font-bold leading-none',
                isUrgent ? 'text-red-400' : 'text-amber-400'
              )}>
                {formatTime(remainingTime)}
              </span>
            </div>
            <div className="ml-2 w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isUrgent ? 'bg-red-500' : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(100, (remainingTime / timeLimit) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg min-w-[120px]">
            <Heart className={cn(
              'w-4 h-4 flex-shrink-0',
              hasShield ? 'text-blue-400' : healthPercent > 30 ? 'text-red-500 fill-red-500' : 'text-red-400 animate-pulse'
            )} />
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-xs font-mono font-bold',
                  hasShield ? 'text-blue-400' : healthPercent > 30 ? 'text-white' : 'text-red-400'
                )}>
                  {Math.ceil(displayHealth)}
                  <span className="text-white/40 text-[10px]">/{Math.ceil(displayMaxHealth)}</span>
                </span>
                {hasShield && (
                  <Shield className="w-3 h-3 text-blue-400" />
                )}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    hasShield ? 'bg-blue-400' : healthColor
                  )}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {effects.length > 0 && (
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {effects.map((effect, index) => (
            <EffectIcon
              key={`${effect.type}-${index}`}
              type={effect.type}
              remainingTime={'remainingTime' in effect ? (effect as any).remainingTime : effect.duration}
            />
          ))}
          <button
            onClick={() => setShowEffectDetail(!showEffectDetail)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-lg border backdrop-blur-sm',
              'bg-white/10 border-white/20 hover:bg-white/20 transition-colors'
            )}
            title="效果详情"
          >
            <Info className="w-4 h-4 text-white/70" />
            {showEffectDetail ? (
              <ChevronUp className="w-3 h-3 text-white/50" />
            ) : (
              <ChevronDown className="w-3 h-3 text-white/50" />
            )}
          </button>
        </div>
      )}

      {showEffectDetail && effects.length > 0 && (
        <div className="pointer-events-auto max-w-xs">
          <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">道具效果详情</span>
            </div>
            {effects.map((effect, index) => {
              const cfg = effectDetailConfig[effect.type];
              if (!cfg) return null;

              const remaining = 'remainingTime' in effect ? (effect as any).remainingTime : effect.duration;
              const duration = effect.duration;
              const progress = duration > 0 ? Math.min(100, (remaining / duration) * 100) : 0;

              return (
                <div
                  key={`detail-${effect.type}-${index}`}
                  className={cn('flex items-center gap-2.5 p-2 rounded-lg border', cfg.bgColor, cfg.borderColor)}
                >
                  <div className={cn('w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0', cfg.color + '/20')}>
                    <span className={cfg.textColor}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('text-xs font-bold', cfg.textColor)}>{cfg.label}</span>
                      <span className="text-[10px] text-white/60 font-mono">{remaining.toFixed(1)}s</span>
                    </div>
                    <div className="text-[10px] text-white/40 mb-1">{cfg.description}</div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', cfg.color)}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
